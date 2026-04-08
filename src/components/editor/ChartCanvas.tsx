'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useChartEditor } from '@/hooks/useChartEditor';
import { useUIStore } from '@/store/useUIStore';
import { useChartStore } from '@/store/useChartStore';
import { useRangeAnnotationDrag } from '@/hooks/useRangeAnnotationDrag';
import { AnnotationPopover } from '@/components/ui/molecules/AnnotationPopover';
import type Konva from 'konva';
import { RotationalMode } from '@/types/knitting';

function mirrorStrokeHorizontal(stroke: number[], cols: number): number[] {
	const result: number[] = [];
	for (let i = 0; i < stroke.length; i += 2) {
		result.push(cols - stroke[i], stroke[i + 1]);
	}
	return result;
}

function mirrorStrokeVertical(stroke: number[], rows: number): number[] {
	const result: number[] = [];
	for (let i = 0; i < stroke.length; i += 2) {
		result.push(stroke[i], rows - stroke[i + 1]);
	}
	return result;
}

function buildSymmetricStrokes(
	stroke: number[],
	rotationalMode: RotationalMode,
	cols: number,
	rows: number,
): number[][] {
	if (rotationalMode === 'none') return [stroke];
	const results: number[][] = [stroke];
	const hMirror = mirrorStrokeHorizontal(stroke, cols);
	const vMirror = mirrorStrokeVertical(stroke, rows);
	if (rotationalMode === 'horizontal' || rotationalMode === 'both') {
		results.push(hMirror);
	}
	if (rotationalMode === 'vertical' || rotationalMode === 'both') {
		results.push(vMirror);
	}
	if (rotationalMode === 'both') {
		results.push(mirrorStrokeHorizontal(vMirror, cols));
	}
	return results;
}

const KonvaGrid = dynamic(() => import('./KonvaGrid').then((m) => ({ default: m.KonvaGrid })), {
	ssr: false,
	loading: () => <CanvasPlaceholder />,
});

function CanvasPlaceholder() {
	return (
		<div className="flex items-center justify-center w-full h-full bg-zinc-50">
			<span className="text-sm text-zinc-400">캔버스 로딩 중...</span>
		</div>
	);
}

interface ChartCanvasProps {
	onPaintStart?: () => void;
	onPaintEnd?: () => void;
	onShapeGuideDrawStart?: () => void;
	onShapeGuideDrawEnd?: () => void;
	onShapeGuideEraseStart?: () => void;
	onShapeGuideEraseEnd?: () => void;
	stageRef?: React.RefObject<Konva.Stage | null>;
}

export function ChartCanvas({
	onPaintStart,
	onPaintEnd,
	onShapeGuideDrawStart,
	onShapeGuideDrawEnd,
	onShapeGuideEraseStart,
	onShapeGuideEraseEnd,
	stageRef,
}: ChartCanvasProps) {
	const { cells, gridSize, cellSize, selectedSymbol, symbolsMap, handleCellPaint, handleCellColorPaint, copySelection, pasteClipboard } =
		useChartEditor();
	const shapeGuide = useUIStore((state) => state.shapeGuide);
	const isShapeGuideDrawMode = useUIStore((state) => state.isShapeGuideDrawMode);
	const isShapeGuideEraseMode = useUIStore((state) => state.isShapeGuideEraseMode);
	const addShapeGuideStroke = useUIStore((state) => state.addShapeGuideStroke);
	const removeShapeGuideStroke = useUIStore((state) => state.removeShapeGuideStroke);
	const replaceShapeGuideStroke = useUIStore((state) => state.replaceShapeGuideStroke);
	const isSelectionMode = useUIStore((state) => state.isSelectionMode);
	const rotationalMode = useUIStore((state) => state.rotationalMode);
	const cellSelection = useUIStore((state) => state.cellSelection);
	const clipboard = useUIStore((state) => state.clipboard);
	const setCellSelection = useUIStore((state) => state.setCellSelection);
	const selectedColor = useUIStore((state) => state.selectedColor);
	const isColorMode = useUIStore((state) => state.isColorMode);
	const isAnnotationMode = useUIStore((state) => state.isAnnotationMode);
	const annotationPopover = useUIStore((state) => state.annotationPopover);
	const openAnnotationPopover = useUIStore((state) => state.openAnnotationPopover);
	const closeAnnotationPopover = useUIStore((state) => state.closeAnnotationPopover);

	const rowAnnotations = useChartStore((state) => state.rowAnnotations);
	const addRowAnnotation = useChartStore((state) => state.addRowAnnotation);
	const updateRowAnnotation = useChartStore((state) => state.updateRowAnnotation);
	const removeRowAnnotation = useChartStore((state) => state.removeRowAnnotation);

	const rangeAnnotations = useChartStore((state) => state.rangeAnnotations);
	const addRangeAnnotation = useChartStore((state) => state.addRangeAnnotation);
	const updateRangeAnnotation = useChartStore((state) => state.updateRangeAnnotation);
	const removeRangeAnnotation = useChartStore((state) => state.removeRangeAnnotation);

	const rangeAnnotationPopover = useUIStore((state) => state.rangeAnnotationPopover);
	const rangeAnnotationDraft = useUIStore((state) => state.rangeAnnotationDraft);
	const closeRangeAnnotationPopover = useUIStore((state) => state.closeRangeAnnotationPopover);

	const collapsedBlocks = useChartStore((state) => state.collapsedBlocks);
	const addCollapsedBlock = useChartStore((state) => state.addCollapsedBlock);
	const collapsedColumnBlocks = useChartStore((state) => state.collapsedColumnBlocks);
	const addCollapsedColumnBlock = useChartStore((state) => state.addCollapsedColumnBlock);

	const [selectedCollapsedBlockId, setSelectedCollapsedBlockId] = useState<string | null>(null);
	const [selectedCollapsedColumnBlockId, setSelectedCollapsedColumnBlockId] = useState<string | null>(null);

	const handleShapeGuideStrokeAdd = useCallback(
		(stroke: number[]) => {
			onShapeGuideDrawStart?.();
			const strokes = buildSymmetricStrokes(stroke, rotationalMode, gridSize.cols, gridSize.rows);
			strokes.forEach((s) => addShapeGuideStroke(s));
			onShapeGuideDrawEnd?.();
		},
		[addShapeGuideStroke, rotationalMode, gridSize, onShapeGuideDrawStart, onShapeGuideDrawEnd],
	);

	const handleAnnotationAreaClick = useCallback(
		(
			rowIndex: number,
			side: 'right' | 'left',
			anchorX: number,
			anchorY: number,
			existingAnnotationId: string | null,
		) => {
			openAnnotationPopover({ rowIndex, anchorX, anchorY, side, existingId: existingAnnotationId });
		},
		[openAnnotationPopover],
	);

	const { handleRangeDragStart, handleRangeDragMove, handleRangeDragEnd } = useRangeAnnotationDrag({
		onSingleRow: (rowIndex) => {
			handleAnnotationAreaClick(rowIndex, 'right', 0, 0, null);
		},
	});

	const handleRangeBracketClick = useCallback(
		(id: string, anchorX: number, anchorY: number) => {
			const annotation = rangeAnnotations.find((a) => a.id === id);
			if (!annotation) return;
			useUIStore.getState().openRangeAnnotationPopover({
				startRowIndex: annotation.startRow,
				endRowIndex: annotation.endRow,
				anchorX,
				anchorY,
				existingId: id,
			});
		},
		[rangeAnnotations],
	);

	const handleRangeAnnotationConfirm = useCallback(
		(text: string) => {
			if (rangeAnnotationPopover === null) return;
			const { startRowIndex, endRowIndex, existingId } = rangeAnnotationPopover;
			if (existingId !== null) {
				updateRangeAnnotation(existingId, text);
			} else {
				addRangeAnnotation(startRowIndex, endRowIndex, text);
			}
			closeRangeAnnotationPopover();
		},
		[rangeAnnotationPopover, updateRangeAnnotation, addRangeAnnotation, closeRangeAnnotationPopover],
	);

	const handleRangeAnnotationDelete = useCallback(() => {
		if (rangeAnnotationPopover === null || rangeAnnotationPopover.existingId === null) return;
		removeRangeAnnotation(rangeAnnotationPopover.existingId);
		closeRangeAnnotationPopover();
	}, [rangeAnnotationPopover, removeRangeAnnotation, closeRangeAnnotationPopover]);

	const handleRangeAnnotationClose = useCallback(() => {
		closeRangeAnnotationPopover();
	}, [closeRangeAnnotationPopover]);

	const handleAnnotationConfirm = useCallback(
		(label: string) => {
			if (annotationPopover === null) return;
			const { rowIndex, existingId, side } = annotationPopover;
			if (existingId !== null) {
				updateRowAnnotation(existingId, label);
			} else {
				addRowAnnotation(rowIndex, label, side);
			}
			closeAnnotationPopover();
		},
		[annotationPopover, updateRowAnnotation, addRowAnnotation, closeAnnotationPopover],
	);

	const handleAnnotationDelete = useCallback(() => {
		if (annotationPopover === null || annotationPopover.existingId === null) return;
		removeRowAnnotation(annotationPopover.existingId);
		closeAnnotationPopover();
	}, [annotationPopover, removeRowAnnotation, closeAnnotationPopover]);

	const handleAnnotationClose = useCallback(() => {
		closeAnnotationPopover();
	}, [closeAnnotationPopover]);

	const handleCollapsedBlockClick = useCallback((blockId: string) => {
		setSelectedCollapsedBlockId(blockId);
	}, []);

	const handleCollapsedColumnBlockClick = useCallback((blockId: string) => {
		setSelectedCollapsedColumnBlockId(blockId);
	}, []);

	const handleColumnPopoverClose = useCallback(() => {
		setSelectedCollapsedColumnBlockId(null);
	}, []);

	const handleColumnPopoverRemove = useCallback(() => {
		if (selectedCollapsedColumnBlockId === null) return;
		useChartStore.getState().removeCollapsedColumnBlock(selectedCollapsedColumnBlockId);
		setSelectedCollapsedColumnBlockId(null);
	}, [selectedCollapsedColumnBlockId]);

	const handleCollapseColumnSelection = useCallback(() => {
		if (!cellSelection || rotationalMode !== 'vertical') return;
		const startCol = Math.min(cellSelection.startCol, cellSelection.endCol);
		const endCol = Math.max(cellSelection.startCol, cellSelection.endCol);
		if (startCol >= endCol) return;
		try {
			addCollapsedColumnBlock(startCol, endCol);
			setCellSelection(null);
		} catch (e) {
			if (e instanceof Error) {
				console.warn('열 중략 추가 실패:', e.message);
			}
		}
	}, [cellSelection, rotationalMode, addCollapsedColumnBlock, setCellSelection]);

	const handleCollapseSelection = useCallback(() => {
		if (!cellSelection) return;
		if (rotationalMode === 'vertical' || rotationalMode === 'both') return;
		const startRow = Math.min(cellSelection.startRow, cellSelection.endRow);
		const endRow = Math.max(cellSelection.startRow, cellSelection.endRow);
		if (startRow >= endRow) return;
		try {
			addCollapsedBlock(startRow, endRow);
			setCellSelection(null);
		} catch (e) {
			if (e instanceof Error) {
				console.warn('중략 추가 실패:', e.message);
			}
		}
	}, [cellSelection, rotationalMode, addCollapsedBlock, setCellSelection]);

	const containerRef = useRef<HTMLDivElement>(null);
	const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

	const updateSize = useCallback(() => {
		const el = containerRef.current;
		if (el) {
			setStageSize({ width: el.clientWidth, height: el.clientHeight });
		}
	}, []);

	useEffect(() => {
		updateSize();
		const observer = new ResizeObserver(updateSize);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [updateSize]);

	// 선택 영역에서 중략 버튼 표시 조건
	// 상하 대칭 모드에서는 행 압축(가로 중략) 비활성화
	const canCollapseSelection =
		isSelectionMode &&
		cellSelection !== null &&
		rotationalMode !== 'vertical' &&
		rotationalMode !== 'both' &&
		Math.min(cellSelection.startRow, cellSelection.endRow) < Math.max(cellSelection.startRow, cellSelection.endRow);

	// 선택 영역에서 열 중략 버튼 표시 조건
	// 상하 대칭 모드(vertical)에서만 열 중략 활성화
	const canCollapseColumnSelection =
		isSelectionMode &&
		cellSelection !== null &&
		rotationalMode === 'vertical' &&
		Math.min(cellSelection.startCol, cellSelection.endCol) < Math.max(cellSelection.startCol, cellSelection.endCol);

	const selectedCollapsedBlock =
		selectedCollapsedBlockId !== null ? (collapsedBlocks.find((b) => b.id === selectedCollapsedBlockId) ?? null) : null;

	const selectedCollapsedColumnBlock =
		selectedCollapsedColumnBlockId !== null
			? (collapsedColumnBlocks.find((b) => b.id === selectedCollapsedColumnBlockId) ?? null)
			: null;

	const handlePopoverRemove = useCallback(() => {
		if (selectedCollapsedBlockId === null) return;
		useChartStore.getState().removeCollapsedBlock(selectedCollapsedBlockId);
		setSelectedCollapsedBlockId(null);
	}, [selectedCollapsedBlockId]);

	const handlePopoverClose = useCallback(() => {
		setSelectedCollapsedBlockId(null);
	}, []);

	return (
		<div className="flex flex-col w-full h-full">
			<div className="flex flex-1 overflow-hidden">
				<div
					ref={containerRef}
					className="relative flex-1 bg-zinc-100 overflow-hidden"
				>
					<KonvaGrid
						cells={cells}
						gridSize={gridSize}
						cellSize={cellSize}
						symbolsMap={symbolsMap}
						selectedSymbolAbbr={selectedSymbol?.abbr ?? null}
						onCellPaint={handleCellPaint}
						onPaintStart={onPaintStart}
						onPaintEnd={onPaintEnd}
						stageWidth={stageSize.width}
						stageHeight={stageSize.height}
						shapeGuide={shapeGuide}
						isShapeGuideDrawMode={isShapeGuideDrawMode}
						isShapeGuideEraseMode={isShapeGuideEraseMode}
						onShapeGuideStrokeAdd={handleShapeGuideStrokeAdd}
						onShapeGuideStrokeRemove={removeShapeGuideStroke}
						onShapeGuideStrokeReplace={replaceShapeGuideStroke}
						onShapeGuideEraseStart={onShapeGuideEraseStart}
						onShapeGuideEraseEnd={onShapeGuideEraseEnd}
						isSelectionMode={isSelectionMode}
						cellSelection={cellSelection}
						clipboard={clipboard}
						onSelectionChange={setCellSelection}
						onCopySelection={copySelection}
						onPasteClipboard={pasteClipboard}
						rotationalMode={rotationalMode}
						collapsedBlocks={collapsedBlocks}
						onCollapsedBlockClick={handleCollapsedBlockClick}
						collapsedColumnBlocks={collapsedColumnBlocks}
						onCollapsedColumnBlockClick={handleCollapsedColumnBlockClick}
						externalStageRef={stageRef}
						isColorMode={isColorMode}
						selectedColor={selectedColor}
						onCellColorPaint={handleCellColorPaint}
						rowAnnotations={rowAnnotations}
						isAnnotationMode={isAnnotationMode}
						onAnnotationAreaClick={handleAnnotationAreaClick}
						rangeAnnotations={rangeAnnotations}
						rangeAnnotationDraft={rangeAnnotationDraft}
						onRangeBracketClick={handleRangeBracketClick}
						onRangeDragStart={handleRangeDragStart}
						onRangeDragMove={handleRangeDragMove}
						onRangeDragEnd={handleRangeDragEnd}
					/>

					{/* 플로팅 액션바: 선택 모드에서 행 중략 버튼 */}
					{canCollapseSelection && (
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-zinc-200 px-3 py-2">
							<button
								type="button"
								className="text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-3 py-1.5 rounded"
								onClick={handleCollapseSelection}
							>
								행 중략
							</button>
						</div>
					)}

					{/* 플로팅 액션바: 열 중략 버튼 */}
					{canCollapseColumnSelection && (
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-zinc-200 px-3 py-2">
							<button
								type="button"
								className="text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-3 py-1.5 rounded"
								onClick={handleCollapseColumnSelection}
							>
								열 중략
							</button>
						</div>
					)}

					{/* CollapsedBlock 팝오버 */}
					{selectedCollapsedBlock !== null && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="pointer-events-auto bg-white rounded-lg shadow-xl border border-zinc-200 p-4 min-w-[200px]">
								<p className="text-sm text-zinc-700 mb-3">
									{gridSize.rows - selectedCollapsedBlock.endRow}~{gridSize.rows - selectedCollapsedBlock.startRow}단
									중략 중
								</p>
								<div className="flex gap-2 justify-end">
									<button
										type="button"
										className="text-sm px-3 py-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
										onClick={handlePopoverClose}
									>
										닫기
									</button>
									<button
										type="button"
										className="text-sm px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
										onClick={handlePopoverRemove}
									>
										중략 해제
									</button>
								</div>
							</div>
						</div>
					)}

					{/* 주석 팝오버 */}
					{annotationPopover !== null && (
						<AnnotationPopover
							anchorX={annotationPopover.anchorX}
							anchorY={annotationPopover.anchorY}
							side={annotationPopover.side}
							rowNumber={gridSize.rows - annotationPopover.rowIndex}
							initialLabel={
								annotationPopover.existingId !== null
									? (rowAnnotations.find((a) => a.id === annotationPopover.existingId)?.label ?? '')
									: ''
							}
							onConfirm={handleAnnotationConfirm}
							onDelete={annotationPopover.existingId !== null ? handleAnnotationDelete : null}
							onClose={handleAnnotationClose}
						/>
					)}

					{/* 범위 주석 팝오버 */}
					{rangeAnnotationPopover !== null && (
						<AnnotationPopover
							anchorX={rangeAnnotationPopover.anchorX}
							anchorY={rangeAnnotationPopover.anchorY}
							side="right"
							mode="range"
							startRowNumber={gridSize.rows - rangeAnnotationPopover.startRowIndex}
							endRowNumber={gridSize.rows - rangeAnnotationPopover.endRowIndex}
							initialText={
								rangeAnnotationPopover.existingId !== null
									? (rangeAnnotations.find((a) => a.id === rangeAnnotationPopover.existingId)?.text ?? '')
									: ''
							}
							onConfirm={handleRangeAnnotationConfirm}
							onDelete={rangeAnnotationPopover.existingId !== null ? handleRangeAnnotationDelete : null}
							onClose={handleRangeAnnotationClose}
						/>
					)}

					{/* CollapsedColumnBlock 팝오버 */}
					{selectedCollapsedColumnBlock !== null && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="pointer-events-auto bg-white rounded-lg shadow-xl border border-zinc-200 p-4 min-w-[200px]">
								<p className="text-sm text-zinc-700 mb-3">
									{gridSize.cols - selectedCollapsedColumnBlock.endCol}~
									{gridSize.cols - selectedCollapsedColumnBlock.startCol}열 중략 중
								</p>
								<div className="flex gap-2 justify-end">
									<button
										type="button"
										className="text-sm px-3 py-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
										onClick={handleColumnPopoverClose}
									>
										닫기
									</button>
									<button
										type="button"
										className="text-sm px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
										onClick={handleColumnPopoverRemove}
									>
										중략 해제
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
