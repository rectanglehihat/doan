'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartCell, CollapsedBlock, CollapsedColumnBlock, GridSize, ShapeGuide, RowAnnotation, RangeAnnotation, ColumnAnnotation } from '@/types/knitting';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { calcCellDiffs, applyDiffs, reverseDiffs } from '@/lib/utils/history-utils';

const MAX_HISTORY = 50;

type CellsEntry =
	| { kind: 'snapshot'; cells: ChartCell[][] }
	| { kind: 'diff'; diffs: ReturnType<typeof calcCellDiffs> };

interface HistoryEntry {
	cellsEntry: CellsEntry;
	gridSize: GridSize;
	shapeGuide: ShapeGuide | null;
	collapsedBlocks: CollapsedBlock[];
	collapsedColumnBlocks: CollapsedColumnBlock[];
	rowAnnotations: RowAnnotation[];
	rangeAnnotations: RangeAnnotation[];
	columnAnnotations: ColumnAnnotation[];
}

export function useHistory() {
	const pastRef = useRef<HistoryEntry[]>([]);
	const futureRef = useRef<HistoryEntry[]>([]);
	const isApplyingChartStoreRef = useRef(false);
	const isApplyingShapeGuideRef = useRef(false);
	const prevCellsRef = useRef<ChartCell[][]>(useChartStore.getState().cells);
	const prevCollapsedBlocksRef = useRef<CollapsedBlock[]>(useChartStore.getState().collapsedBlocks);
	const prevCollapsedColumnBlocksRef = useRef<CollapsedColumnBlock[]>(
		useChartStore.getState().collapsedColumnBlocks,
	);
	const prevRowAnnotationsRef = useRef<RowAnnotation[]>(useChartStore.getState().rowAnnotations);
	const prevRangeAnnotationsRef = useRef<RangeAnnotation[]>(useChartStore.getState().rangeAnnotations);
	const prevColumnAnnotationsRef = useRef<ColumnAnnotation[]>(useChartStore.getState().columnAnnotations);
	const prevShapeGuideRef = useRef<ShapeGuide | null>(useUIStore.getState().shapeGuide);
	const prevHistoryResetTokenRef = useRef<number>(useUIStore.getState().historyResetToken);
	const prevGridSizeRef = useRef<GridSize>(useChartStore.getState().gridSize);
	const isBatchingRef = useRef(false);
	const batchStartRef = useRef<HistoryEntry | null>(null);

	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const setShapeGuide = useUIStore((state) => state.setShapeGuide);

	// cells + collapsedBlocks + collapsedColumnBlocks + annotations 변경 감지 (단일 subscriber로 통합)
	useEffect(() => {
		const unsubscribe = useChartStore.subscribe((state) => {
			const { cells, collapsedBlocks, collapsedColumnBlocks, gridSize, rowAnnotations, rangeAnnotations, columnAnnotations } = state;

			if (isApplyingChartStoreRef.current) {
				isApplyingChartStoreRef.current = false;
				prevCellsRef.current = cells;
				prevCollapsedBlocksRef.current = collapsedBlocks;
				prevCollapsedColumnBlocksRef.current = collapsedColumnBlocks;
				prevGridSizeRef.current = gridSize;
				prevRowAnnotationsRef.current = rowAnnotations;
				prevRangeAnnotationsRef.current = rangeAnnotations;
				prevColumnAnnotationsRef.current = columnAnnotations;
				return;
			}

			const cellsChanged = cells !== prevCellsRef.current;
			const blocksChanged = collapsedBlocks !== prevCollapsedBlocksRef.current;
			const columnBlocksChanged = collapsedColumnBlocks !== prevCollapsedColumnBlocksRef.current;
			const rowAnnotationsChanged = rowAnnotations !== prevRowAnnotationsRef.current;
			const rangeAnnotationsChanged = rangeAnnotations !== prevRangeAnnotationsRef.current;
			const columnAnnotationsChanged = columnAnnotations !== prevColumnAnnotationsRef.current;
			if (!cellsChanged && !blocksChanged && !columnBlocksChanged && !rowAnnotationsChanged && !rangeAnnotationsChanged && !columnAnnotationsChanged) return;

			if (isBatchingRef.current) {
				prevCellsRef.current = cells;
				prevCollapsedBlocksRef.current = collapsedBlocks;
				prevCollapsedColumnBlocksRef.current = collapsedColumnBlocks;
				prevGridSizeRef.current = gridSize;
				prevRowAnnotationsRef.current = rowAnnotations;
				prevRangeAnnotationsRef.current = rangeAnnotations;
				prevColumnAnnotationsRef.current = columnAnnotations;
				return;
			}

			const gridSizeChanged =
				gridSize.rows !== prevGridSizeRef.current.rows ||
				gridSize.cols !== prevGridSizeRef.current.cols;

			const cellsEntry: CellsEntry = gridSizeChanged
				? { kind: 'snapshot', cells: prevCellsRef.current }
				: { kind: 'diff', diffs: calcCellDiffs(prevCellsRef.current, cells) };

			const entry: HistoryEntry = {
				cellsEntry,
				gridSize: prevGridSizeRef.current,
				shapeGuide: prevShapeGuideRef.current,
				collapsedBlocks: prevCollapsedBlocksRef.current,
				collapsedColumnBlocks: prevCollapsedColumnBlocksRef.current,
				rowAnnotations: prevRowAnnotationsRef.current,
				rangeAnnotations: prevRangeAnnotationsRef.current,
				columnAnnotations: prevColumnAnnotationsRef.current,
			};

			pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), entry];
			futureRef.current = [];
			prevCellsRef.current = cells;
			prevCollapsedBlocksRef.current = collapsedBlocks;
			prevCollapsedColumnBlocksRef.current = collapsedColumnBlocks;
			prevGridSizeRef.current = gridSize;
			prevRowAnnotationsRef.current = rowAnnotations;
			prevRangeAnnotationsRef.current = rangeAnnotations;
			prevColumnAnnotationsRef.current = columnAnnotations;
			setCanUndo(true);
			setCanRedo(false);
		});
		return unsubscribe;
	}, []);

	// historyResetToken 변경 감지 — newPattern() 호출 시 히스토리 전체 초기화
	useEffect(() => {
		const unsubscribe = useUIStore.subscribe((state) => {
			if (state.historyResetToken === prevHistoryResetTokenRef.current) return;
			prevHistoryResetTokenRef.current = state.historyResetToken;
			pastRef.current = [];
			futureRef.current = [];
			prevCellsRef.current = useChartStore.getState().cells;
			prevCollapsedBlocksRef.current = useChartStore.getState().collapsedBlocks;
			prevCollapsedColumnBlocksRef.current = useChartStore.getState().collapsedColumnBlocks;
			prevGridSizeRef.current = useChartStore.getState().gridSize;
			prevShapeGuideRef.current = state.shapeGuide;
			prevRowAnnotationsRef.current = useChartStore.getState().rowAnnotations;
			prevRangeAnnotationsRef.current = useChartStore.getState().rangeAnnotations;
			prevColumnAnnotationsRef.current = useChartStore.getState().columnAnnotations;
			setCanUndo(false);
			setCanRedo(false);
		});
		return unsubscribe;
	}, []);

	// shapeGuide 변경 감지
	useEffect(() => {
		const unsubscribe = useUIStore.subscribe((state) => {
			const shapeGuide = state.shapeGuide;

			if (isApplyingShapeGuideRef.current) {
				isApplyingShapeGuideRef.current = false;
				prevShapeGuideRef.current = shapeGuide;
				return;
			}

			if (shapeGuide === prevShapeGuideRef.current) return;

			if (isBatchingRef.current) {
				prevShapeGuideRef.current = shapeGuide;
				return;
			}

			const entry: HistoryEntry = {
				cellsEntry: { kind: 'diff', diffs: [] },
				gridSize: prevGridSizeRef.current,
				shapeGuide: prevShapeGuideRef.current,
				collapsedBlocks: prevCollapsedBlocksRef.current,
				collapsedColumnBlocks: prevCollapsedColumnBlocksRef.current,
				rowAnnotations: prevRowAnnotationsRef.current,
				rangeAnnotations: prevRangeAnnotationsRef.current,
				columnAnnotations: prevColumnAnnotationsRef.current,
			};
			pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), entry];
			futureRef.current = [];
			prevShapeGuideRef.current = shapeGuide;
			setCanUndo(true);
			setCanRedo(false);
		});
		return unsubscribe;
	}, []);

	const undo = useCallback(() => {
		if (pastRef.current.length === 0) return;
		const previous = pastRef.current[pastRef.current.length - 1];

		const currentEntry: HistoryEntry = {
			cellsEntry: { kind: 'snapshot', cells: prevCellsRef.current },
			gridSize: prevGridSizeRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
			collapsedColumnBlocks: prevCollapsedColumnBlocksRef.current,
			rowAnnotations: prevRowAnnotationsRef.current,
			rangeAnnotations: prevRangeAnnotationsRef.current,
			columnAnnotations: prevColumnAnnotationsRef.current,
		};
		futureRef.current = [currentEntry, ...futureRef.current];
		pastRef.current = pastRef.current.slice(0, -1);

		const cellsToRestore =
			previous.cellsEntry.kind === 'snapshot'
				? previous.cellsEntry.cells
				: applyDiffs(prevCellsRef.current, reverseDiffs(previous.cellsEntry.diffs));

		isApplyingShapeGuideRef.current = true;
		prevCellsRef.current = cellsToRestore;
		prevCollapsedBlocksRef.current = previous.collapsedBlocks;
		prevCollapsedColumnBlocksRef.current = previous.collapsedColumnBlocks;
		prevShapeGuideRef.current = previous.shapeGuide;
		prevGridSizeRef.current = previous.gridSize;
		prevRowAnnotationsRef.current = previous.rowAnnotations;
		prevRangeAnnotationsRef.current = previous.rangeAnnotations;
		prevColumnAnnotationsRef.current = previous.columnAnnotations;
		// subscriber가 한 번만 트리거되도록 모든 chartStore 변경을 단일 set으로 처리
		isApplyingChartStoreRef.current = true;
		useChartStore.setState({
			cells: cellsToRestore,
			collapsedBlocks: previous.collapsedBlocks,
			collapsedColumnBlocks: previous.collapsedColumnBlocks,
			gridSize: previous.gridSize,
			rowAnnotations: previous.rowAnnotations,
			rangeAnnotations: previous.rangeAnnotations,
			columnAnnotations: previous.columnAnnotations,
		});
		setShapeGuide(previous.shapeGuide);
		setCanUndo(pastRef.current.length > 0);
		setCanRedo(true);
	}, [setShapeGuide]);

	const redo = useCallback(() => {
		if (futureRef.current.length === 0) return;
		const next = futureRef.current[0];

		const currentEntry: HistoryEntry = {
			cellsEntry: { kind: 'snapshot', cells: prevCellsRef.current },
			gridSize: prevGridSizeRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
			collapsedColumnBlocks: prevCollapsedColumnBlocksRef.current,
			rowAnnotations: prevRowAnnotationsRef.current,
			rangeAnnotations: prevRangeAnnotationsRef.current,
			columnAnnotations: prevColumnAnnotationsRef.current,
		};
		pastRef.current = [...pastRef.current, currentEntry];
		futureRef.current = futureRef.current.slice(1);

		const cellsToRestore =
			next.cellsEntry.kind === 'snapshot'
				? next.cellsEntry.cells
				: applyDiffs(prevCellsRef.current, next.cellsEntry.diffs);

		isApplyingShapeGuideRef.current = true;
		prevCellsRef.current = cellsToRestore;
		prevCollapsedBlocksRef.current = next.collapsedBlocks;
		prevCollapsedColumnBlocksRef.current = next.collapsedColumnBlocks;
		prevShapeGuideRef.current = next.shapeGuide;
		prevGridSizeRef.current = next.gridSize;
		prevRowAnnotationsRef.current = next.rowAnnotations;
		prevRangeAnnotationsRef.current = next.rangeAnnotations;
		prevColumnAnnotationsRef.current = next.columnAnnotations;
		// subscriber가 한 번만 트리거되도록 모든 chartStore 변경을 단일 set으로 처리
		isApplyingChartStoreRef.current = true;
		useChartStore.setState({
			cells: cellsToRestore,
			collapsedBlocks: next.collapsedBlocks,
			collapsedColumnBlocks: next.collapsedColumnBlocks,
			gridSize: next.gridSize,
			rowAnnotations: next.rowAnnotations,
			rangeAnnotations: next.rangeAnnotations,
			columnAnnotations: next.columnAnnotations,
		});
		setShapeGuide(next.shapeGuide);
		setCanUndo(true);
		setCanRedo(futureRef.current.length > 0);
	}, [setShapeGuide]);

	const beginBatch = useCallback(() => {
		isBatchingRef.current = true;
		batchStartRef.current = {
			cellsEntry: { kind: 'snapshot', cells: prevCellsRef.current },
			gridSize: prevGridSizeRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
			collapsedColumnBlocks: prevCollapsedColumnBlocksRef.current,
			rowAnnotations: prevRowAnnotationsRef.current,
			rangeAnnotations: prevRangeAnnotationsRef.current,
			columnAnnotations: prevColumnAnnotationsRef.current,
		};
	}, []);

	const endBatch = useCallback(() => {
		if (!isBatchingRef.current) return;
		isBatchingRef.current = false;
		const batchStart = batchStartRef.current;
		batchStartRef.current = null;

		if (batchStart === null) return;

		const currentCells = useChartStore.getState().cells;
		const currentGridSize = useChartStore.getState().gridSize;
		const currentShapeGuide = prevShapeGuideRef.current;
		const currentCollapsedBlocks = prevCollapsedBlocksRef.current;
		const currentCollapsedColumnBlocks = prevCollapsedColumnBlocksRef.current;
		const currentRowAnnotations = prevRowAnnotationsRef.current;
		const currentRangeAnnotations = prevRangeAnnotationsRef.current;
		const currentColumnAnnotations = prevColumnAnnotationsRef.current;

		const batchStartCells =
			batchStart.cellsEntry.kind === 'snapshot'
				? batchStart.cellsEntry.cells
				: prevCellsRef.current;

		const unchanged =
			batchStartCells === currentCells &&
			batchStart.shapeGuide === currentShapeGuide &&
			batchStart.collapsedBlocks === currentCollapsedBlocks &&
			batchStart.collapsedColumnBlocks === currentCollapsedColumnBlocks &&
			batchStart.rowAnnotations === currentRowAnnotations &&
			batchStart.rangeAnnotations === currentRangeAnnotations &&
			batchStart.columnAnnotations === currentColumnAnnotations;

		if (unchanged) return;

		const gridSizeChanged =
			currentGridSize.rows !== batchStart.gridSize.rows ||
			currentGridSize.cols !== batchStart.gridSize.cols;

		const cellsEntry: CellsEntry = gridSizeChanged
			? { kind: 'snapshot', cells: batchStartCells }
			: { kind: 'diff', diffs: calcCellDiffs(batchStartCells, currentCells) };

		pastRef.current = [
			...pastRef.current.slice(-(MAX_HISTORY - 1)),
			{ ...batchStart, cellsEntry },
		];
		futureRef.current = [];
		setCanUndo(true);
		setCanRedo(false);
	}, []);

	return { undo, redo, canUndo, canRedo, beginBatch, endBatch };
}
