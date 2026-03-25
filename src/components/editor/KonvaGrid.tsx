'use client';

import React, { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { ChartCell, GridSize, ShapeGuide } from '@/types/knitting';
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation';
import { ShapeGuideLayer } from './ShapeGuideLayer';

interface KonvaGridProps {
	cells: ChartCell[][];
	gridSize: GridSize;
	cellSize: number;
	symbolsMap: Record<string, string>;
	selectedSymbolAbbr: string | null;
	onCellPaint: (row: number, col: number) => void;
	onPaintStart?: () => void;
	onPaintEnd?: () => void;
	stageWidth: number;
	stageHeight: number;
	shapeGuide?: ShapeGuide | null;
	isShapeGuideDrawMode?: boolean;
	onShapeGuideStrokeAdd?: (stroke: number[]) => void;
	onShapeGuideStrokeRemove?: (index: number) => void;
}

export const KonvaGrid = memo(function KonvaGrid({
	cells,
	gridSize,
	cellSize,
	symbolsMap,
	selectedSymbolAbbr,
	onCellPaint,
	onPaintStart,
	onPaintEnd,
	stageWidth,
	stageHeight,
	shapeGuide = null,
	isShapeGuideDrawMode = false,
	onShapeGuideStrokeAdd,
	onShapeGuideStrokeRemove,
}: KonvaGridProps) {
	const stageRef = useRef<Konva.Stage>(null);
	const layerRef = useRef<Konva.Layer>(null);
	const isPainting = useRef(false);
	const isDrawingGuide = useRef(false);
	const [currentStroke, setCurrentStroke] = useState<number[]>([]);

	const {
		transform,
		isSpacePanning,
		isInSpacePanMode,
		handleWheel,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		startMousePan,
		updateMousePan,
		endMousePan,
	} = useCanvasNavigation(stageRef);

	const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
	const [selectedStrokeIndex, setSelectedStrokeIndex] = useState<number | null>(null);

	const handleStrokeClick = useCallback(
		(index: number) => {
			setSelectedStrokeIndex((prev) => (prev === index ? null : index));
		},
		[],
	);

	useEffect(() => {
		if (!isShapeGuideDrawMode) {
			setSelectedStrokeIndex(null);
			return;
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				setSelectedStrokeIndex((prev) => {
					if (prev !== null) {
						onShapeGuideStrokeRemove?.(prev);
					}
					return null;
				});
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isShapeGuideDrawMode, onShapeGuideStrokeRemove]);

	const totalWidth = gridSize.cols * cellSize;
	const totalHeight = gridSize.rows * cellSize;

	const gridLines = useMemo(() => {
		const lines: { key: string; points: number[] }[] = [];
		for (let i = 0; i <= gridSize.cols; i++) {
			lines.push({ key: `v${i}`, points: [i * cellSize, 0, i * cellSize, totalHeight] });
		}
		for (let i = 0; i <= gridSize.rows; i++) {
			lines.push({ key: `h${i}`, points: [0, i * cellSize, totalWidth, i * cellSize] });
		}
		return lines;
	}, [gridSize, cellSize, totalWidth, totalHeight]);

	const nonEmptyCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) =>
				row
					.map((cell, colIdx) => ({ cell, rowIdx, colIdx }))
					.filter(
						(x): x is { cell: ChartCell & { symbolId: string }; rowIdx: number; colIdx: number } =>
							x.cell.symbolId !== null,
					),
			),
		[cells],
	);

	// 레이어 기준 포인터 위치를 grid 교차점 좌표계(col, row)로 반환 (정수 스냅 + 범위 클램핑)
	const getGridPointer = useCallback((): { col: number; row: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		return {
			col: Math.max(0, Math.min(gridSize.cols, Math.round(pos.x / cellSize))),
			row: Math.max(0, Math.min(gridSize.rows, Math.round(pos.y / cellSize))),
		};
	}, [cellSize, gridSize]);

	const getCellFromPointer = useCallback((): { row: number; col: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		const col = Math.floor(pos.x / cellSize);
		const row = Math.floor(pos.y / cellSize);
		if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
			return { row, col };
		}
		return null;
	}, [gridSize, cellSize]);

	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (e.evt.button === 1 || (e.evt.button === 0 && isInSpacePanMode())) {
				e.evt.preventDefault();
				startMousePan(e.evt.clientX, e.evt.clientY);
				return;
			}
			if (e.evt.button === 0) {
				if (isShapeGuideDrawMode) {
					if (e.target.name() === 'shapeGuideStroke') {
						return;
					}
					setSelectedStrokeIndex(null);
					const pt = getGridPointer();
					if (pt) {
						isDrawingGuide.current = true;
						setCurrentStroke([pt.col, pt.row]);
					}
				} else {
					isPainting.current = true;
					onPaintStart?.();
					const cell = getCellFromPointer();
					if (cell) onCellPaint(cell.row, cell.col);
				}
			}
		},
		[getCellFromPointer, getGridPointer, onCellPaint, onPaintStart, startMousePan, isInSpacePanMode, isShapeGuideDrawMode, setSelectedStrokeIndex],
	);

	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (updateMousePan(e.evt.clientX, e.evt.clientY)) return;
			if (isShapeGuideDrawMode) {
				if (isDrawingGuide.current) {
					const pt = getGridPointer();
					if (pt) {
						setCurrentStroke((prev) => {
							const lastCol = prev[prev.length - 2];
							const lastRow = prev[prev.length - 1];
							if (pt.col === lastCol && pt.row === lastRow) return prev;
							return [...prev, pt.col, pt.row];
						});
					}
				}
			} else {
				const cell = getCellFromPointer();
				setHoverCell(cell);
				if (isPainting.current && cell) {
					onCellPaint(cell.row, cell.col);
				}
			}
		},
		[getCellFromPointer, getGridPointer, onCellPaint, updateMousePan, isShapeGuideDrawMode],
	);

	const handleMouseUp = useCallback(() => {
		if (isShapeGuideDrawMode) {
			if (isDrawingGuide.current && currentStroke.length >= 4) {
				onShapeGuideStrokeAdd?.(currentStroke);
			}
			isDrawingGuide.current = false;
			setCurrentStroke([]);
		} else {
			if (isPainting.current) {
				onPaintEnd?.();
			}
			isPainting.current = false;
		}
		endMousePan();
	}, [endMousePan, onPaintEnd, onShapeGuideStrokeAdd, isShapeGuideDrawMode, currentStroke]);

	const handleMouseLeave = useCallback(() => {
		setHoverCell(null);
		if (isShapeGuideDrawMode) {
			if (isDrawingGuide.current && currentStroke.length >= 4) {
				onShapeGuideStrokeAdd?.(currentStroke);
			}
			isDrawingGuide.current = false;
			setCurrentStroke([]);
		} else {
			if (isPainting.current) {
				onPaintEnd?.();
			}
			isPainting.current = false;
		}
		endMousePan();
	}, [endMousePan, onPaintEnd, onShapeGuideStrokeAdd, isShapeGuideDrawMode, currentStroke]);

	const cursor = isSpacePanning ? 'grab' : isShapeGuideDrawMode ? 'crosshair' : 'crosshair';

	const hasShapeGuide = shapeGuide && shapeGuide.strokes.length > 0;

	return (
		<Stage
			ref={stageRef}
			width={stageWidth}
			height={stageHeight}
			onWheel={handleWheel}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			style={{ cursor }}
		>
			<Layer
				ref={layerRef}
				x={transform.x}
				y={transform.y}
				scaleX={transform.scale}
				scaleY={transform.scale}
			>
				<Rect x={0} y={0} width={totalWidth} height={totalHeight} fill="white" />

				{gridLines.map(({ key, points }) => (
					<Line key={key} points={points} stroke="#d4d4d8" strokeWidth={0.5} />
				))}

				{nonEmptyCells.map(({ cell, rowIdx, colIdx }) => (
					<Text
						key={`${rowIdx}-${colIdx}`}
						x={colIdx * cellSize}
						y={rowIdx * cellSize}
						width={cellSize}
						height={cellSize}
						text={symbolsMap[cell.symbolId] ?? cell.symbolId}
						align="center"
						verticalAlign="middle"
						fontSize={Math.max(8, Math.floor(cellSize * 0.4))}
						fill="#1a1a1a"
					/>
				))}

				{hoverCell && !isShapeGuideDrawMode && (
					<Rect
						x={hoverCell.col * cellSize}
						y={hoverCell.row * cellSize}
						width={cellSize}
						height={cellSize}
						fill={selectedSymbolAbbr ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.08)'}
						listening={false}
					/>
				)}
			</Layer>

			{(hasShapeGuide || currentStroke.length >= 4) && (
				<ShapeGuideLayer
					shapeGuide={shapeGuide ?? { strokes: [] }}
					currentStroke={currentStroke}
					cellSize={cellSize}
					transform={transform}
					selectedStrokeIndex={selectedStrokeIndex}
					onStrokeClick={handleStrokeClick}
					isDrawMode={isShapeGuideDrawMode}
				/>
			)}
		</Stage>
	);
});
