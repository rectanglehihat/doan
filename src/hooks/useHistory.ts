'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartCell, CollapsedBlock, ShapeGuide } from '@/types/knitting';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

const MAX_HISTORY = 50;

interface HistoryEntry {
	cells: ChartCell[][];
	shapeGuide: ShapeGuide | null;
	collapsedBlocks: CollapsedBlock[];
}

export function useHistory() {
	const pastRef = useRef<HistoryEntry[]>([]);
	const futureRef = useRef<HistoryEntry[]>([]);
	const isApplyingChartStoreRef = useRef(false);
	const isApplyingShapeGuideRef = useRef(false);
	const prevCellsRef = useRef<ChartCell[][]>(useChartStore.getState().cells);
	const prevCollapsedBlocksRef = useRef<CollapsedBlock[]>(useChartStore.getState().collapsedBlocks);
	const prevShapeGuideRef = useRef<ShapeGuide | null>(useUIStore.getState().shapeGuide);
	const isBatchingRef = useRef(false);
	const batchStartRef = useRef<HistoryEntry | null>(null);

	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const setCellsAndBlocks = useChartStore((state) => state.setCellsAndBlocks);
	const setShapeGuide = useUIStore((state) => state.setShapeGuide);

	// cells + collapsedBlocks 변경 감지 (단일 subscriber로 통합)
	useEffect(() => {
		const unsubscribe = useChartStore.subscribe((state) => {
			const { cells, collapsedBlocks } = state;

			if (isApplyingChartStoreRef.current) {
				isApplyingChartStoreRef.current = false;
				prevCellsRef.current = cells;
				prevCollapsedBlocksRef.current = collapsedBlocks;
				return;
			}

			const cellsChanged = cells !== prevCellsRef.current;
			const blocksChanged = collapsedBlocks !== prevCollapsedBlocksRef.current;
			if (!cellsChanged && !blocksChanged) return;

			if (isBatchingRef.current) {
				prevCellsRef.current = cells;
				prevCollapsedBlocksRef.current = collapsedBlocks;
				return;
			}

			const entry: HistoryEntry = {
				cells: prevCellsRef.current,
				shapeGuide: prevShapeGuideRef.current,
				collapsedBlocks: prevCollapsedBlocksRef.current,
			};
			pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), entry];
			futureRef.current = [];
			prevCellsRef.current = cells;
			prevCollapsedBlocksRef.current = collapsedBlocks;
			setCanUndo(true);
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
				cells: prevCellsRef.current,
				shapeGuide: prevShapeGuideRef.current,
				collapsedBlocks: prevCollapsedBlocksRef.current,
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
			cells: prevCellsRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
		};
		futureRef.current = [currentEntry, ...futureRef.current];
		pastRef.current = pastRef.current.slice(0, -1);
		isApplyingChartStoreRef.current = true;
		isApplyingShapeGuideRef.current = true;
		prevCellsRef.current = previous.cells;
		prevCollapsedBlocksRef.current = previous.collapsedBlocks;
		prevShapeGuideRef.current = previous.shapeGuide;
		setCellsAndBlocks(previous.cells, previous.collapsedBlocks);
		setShapeGuide(previous.shapeGuide);
		setCanUndo(pastRef.current.length > 0);
		setCanRedo(true);
	}, [setCellsAndBlocks, setShapeGuide]);

	const redo = useCallback(() => {
		if (futureRef.current.length === 0) return;
		const next = futureRef.current[0];
		const currentEntry: HistoryEntry = {
			cells: prevCellsRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
		};
		pastRef.current = [...pastRef.current, currentEntry];
		futureRef.current = futureRef.current.slice(1);
		isApplyingChartStoreRef.current = true;
		isApplyingShapeGuideRef.current = true;
		prevCellsRef.current = next.cells;
		prevCollapsedBlocksRef.current = next.collapsedBlocks;
		prevShapeGuideRef.current = next.shapeGuide;
		setCellsAndBlocks(next.cells, next.collapsedBlocks);
		setShapeGuide(next.shapeGuide);
		setCanUndo(true);
		setCanRedo(futureRef.current.length > 0);
	}, [setCellsAndBlocks, setShapeGuide]);

	const beginBatch = useCallback(() => {
		isBatchingRef.current = true;
		batchStartRef.current = {
			cells: prevCellsRef.current,
			shapeGuide: prevShapeGuideRef.current,
			collapsedBlocks: prevCollapsedBlocksRef.current,
		};
	}, []);

	const endBatch = useCallback(() => {
		if (!isBatchingRef.current) return;
		isBatchingRef.current = false;
		const batchStart = batchStartRef.current;
		batchStartRef.current = null;
		const currentCells = prevCellsRef.current;
		const currentShapeGuide = prevShapeGuideRef.current;
		const currentCollapsedBlocks = prevCollapsedBlocksRef.current;
		if (
			batchStart !== null &&
			(batchStart.cells !== currentCells ||
				batchStart.shapeGuide !== currentShapeGuide ||
				batchStart.collapsedBlocks !== currentCollapsedBlocks)
		) {
			pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), batchStart];
			futureRef.current = [];
			setCanUndo(true);
			setCanRedo(false);
		}
	}, []);

	return { undo, redo, canUndo, canRedo, beginBatch, endBatch };
}
