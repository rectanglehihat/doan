'use client';

import React, { memo, useState, useCallback, useRef, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { ChartCell, GridSize } from '@/types/knitting';

export const CELL_WIDTH = 28;
export const CELL_HEIGHT = 35;

interface KonvaGridProps {
	cells: ChartCell[][];
	gridSize: GridSize;
	symbolsMap: Record<string, string>;
	selectedSymbolAbbr: string | null;
	onCellPaint: (row: number, col: number) => void;
	stageWidth: number;
	stageHeight: number;
}

interface Transform {
	scale: number;
	x: number;
	y: number;
}

export const KonvaGrid = memo(function KonvaGrid({
	cells,
	gridSize,
	symbolsMap,
	selectedSymbolAbbr,
	onCellPaint,
	stageWidth,
	stageHeight,
}: KonvaGridProps) {
	const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
	const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
	const stageRef = useRef<Konva.Stage>(null);
	const layerRef = useRef<Konva.Layer>(null);
	const isPainting = useRef(false);
	const isPanning = useRef(false);
	const lastPanPos = useRef({ x: 0, y: 0 });

	const totalWidth = gridSize.cols * CELL_WIDTH;
	const totalHeight = gridSize.rows * CELL_HEIGHT;

	const gridLines = useMemo(() => {
		const lines: { key: string; points: number[] }[] = [];
		for (let i = 0; i <= gridSize.cols; i++) {
			lines.push({ key: `v${i}`, points: [i * CELL_WIDTH, 0, i * CELL_WIDTH, totalHeight] });
		}
		for (let i = 0; i <= gridSize.rows; i++) {
			lines.push({ key: `h${i}`, points: [0, i * CELL_HEIGHT, totalWidth, i * CELL_HEIGHT] });
		}
		return lines;
	}, [gridSize, totalWidth, totalHeight]);

	const nonEmptyCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) =>
				row
					.map((cell, colIdx) => ({ cell, rowIdx, colIdx }))
					.filter(({ cell }) => cell.symbolId !== null),
			),
		[cells],
	);

	const getCellFromPointer = useCallback((): { row: number; col: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		const col = Math.floor(pos.x / CELL_WIDTH);
		const row = Math.floor(pos.y / CELL_HEIGHT);
		if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
			return { row, col };
		}
		return null;
	}, [gridSize]);

	const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;
		const SCALE_BY = 1.1;
		setTransform((prev) => {
			const newScale =
				e.evt.deltaY < 0
					? Math.min(5, prev.scale * SCALE_BY)
					: Math.max(0.2, prev.scale / SCALE_BY);
			return {
				scale: newScale,
				x: pointer.x - (pointer.x - prev.x) * (newScale / prev.scale),
				y: pointer.y - (pointer.y - prev.y) * (newScale / prev.scale),
			};
		});
	}, []);

	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (e.evt.button === 1) {
				e.evt.preventDefault();
				isPanning.current = true;
				lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
				return;
			}
			if (e.evt.button === 0) {
				isPainting.current = true;
				const cell = getCellFromPointer();
				if (cell) onCellPaint(cell.row, cell.col);
			}
		},
		[getCellFromPointer, onCellPaint],
	);

	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			const cell = getCellFromPointer();
			setHoverCell(cell);
			if (isPanning.current) {
				const dx = e.evt.clientX - lastPanPos.current.x;
				const dy = e.evt.clientY - lastPanPos.current.y;
				lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
				setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
				return;
			}
			if (isPainting.current && cell) {
				onCellPaint(cell.row, cell.col);
			}
		},
		[getCellFromPointer, onCellPaint],
	);

	const handleMouseUp = useCallback(() => {
		isPainting.current = false;
		isPanning.current = false;
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoverCell(null);
		isPainting.current = false;
		isPanning.current = false;
	}, []);

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
			style={{ cursor: 'crosshair' }}
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
						x={colIdx * CELL_WIDTH}
						y={rowIdx * CELL_HEIGHT}
						width={CELL_WIDTH}
						height={CELL_HEIGHT}
						text={symbolsMap[cell.symbolId!] ?? cell.symbolId!}
						align="center"
						verticalAlign="middle"
						fontSize={11}
						fill="#1a1a1a"
					/>
				))}

				{hoverCell && (
					<Rect
						x={hoverCell.col * CELL_WIDTH}
						y={hoverCell.row * CELL_HEIGHT}
						width={CELL_WIDTH}
						height={CELL_HEIGHT}
						fill={selectedSymbolAbbr ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.08)'}
						listening={false}
					/>
				)}
			</Layer>
		</Stage>
	);
});
