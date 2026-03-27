'use client';

import { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { CollapsedBlock, ShapeGuide } from '@/types/knitting';

interface Transform {
	x: number;
	y: number;
	scale: number;
}

interface ShapeGuideLayerProps {
	shapeGuide: ShapeGuide;
	currentStroke: number[];
	eraseStroke?: number[];
	cellSize: number;
	transform: Transform;
	selectedStrokeIndex?: number | null;
	onStrokeClick?: (index: number) => void;
	isDrawMode?: boolean;
	collapsedBlocks?: CollapsedBlock[];
}

// grid 좌표계의 row를 중략 반영한 시각적 Y 픽셀 좌표로 변환
// row가 중략 범위 내이면 null 반환
function getVisualRowY(
	row: number,
	sortedBlocks: CollapsedBlock[],
	cellSize: number,
): number | null {
	let skippedRows = 0;
	for (const block of sortedBlocks) {
		if (block.startRow > row) break;
		if (row >= block.startRow && row <= block.endRow) return null;
		skippedRows += block.endRow - block.startRow;
	}
	return (row - skippedRows) * cellSize;
}

// stroke [col0,row0,col1,row1,...] 를 중략 반영한 visible segment 배열로 변환
// 각 segment는 픽셀 좌표. 2점 미만(4coords 미만)인 segment는 제외됨.
function buildVisibleSegments(
	stroke: number[],
	sortedBlocks: CollapsedBlock[],
	cellSize: number,
): number[][] {
	const segments: number[][] = [];
	let current: number[] = [];

	for (let i = 0; i < stroke.length; i += 2) {
		const col = stroke[i];
		const row = stroke[i + 1];
		const visualY = getVisualRowY(row, sortedBlocks, cellSize);

		if (visualY === null) {
			if (current.length >= 4) segments.push(current);
			current = [];
		} else {
			current.push(col * cellSize, visualY);
		}
	}

	if (current.length >= 4) segments.push(current);
	return segments;
}

export function ShapeGuideLayer({
	shapeGuide,
	currentStroke,
	eraseStroke,
	cellSize,
	transform,
	selectedStrokeIndex = null,
	onStrokeClick,
	isDrawMode = false,
	collapsedBlocks = [],
}: ShapeGuideLayerProps) {
	const sortedBlocks = useMemo(
		() => [...collapsedBlocks].sort((a, b) => a.startRow - b.startRow),
		[collapsedBlocks],
	);

	// shapeGuide.strokes → visible segments with originalIndex
	const visibleStrokes = useMemo(() => {
		const result: { points: number[]; originalIndex: number }[] = [];
		for (let i = 0; i < shapeGuide.strokes.length; i++) {
			const segments =
				sortedBlocks.length === 0
					? [shapeGuide.strokes[i].map((v) => v * cellSize)]
					: buildVisibleSegments(shapeGuide.strokes[i], sortedBlocks, cellSize);
			for (const pts of segments) {
				result.push({ points: pts, originalIndex: i });
			}
		}
		return result;
	}, [shapeGuide.strokes, sortedBlocks, cellSize]);

	// currentStroke → visible segments (픽셀 좌표)
	const visibleCurrentSegments = useMemo(
		() =>
			sortedBlocks.length === 0
				? currentStroke.length >= 4
					? [currentStroke.map((v) => v * cellSize)]
					: []
				: buildVisibleSegments(currentStroke, sortedBlocks, cellSize),
		[currentStroke, sortedBlocks, cellSize],
	);

	// eraseStroke → visible segments (픽셀 좌표)
	const visibleEraseSegments = useMemo(
		() =>
			eraseStroke && eraseStroke.length >= 4
				? sortedBlocks.length === 0
					? [eraseStroke.map((v) => v * cellSize)]
					: buildVisibleSegments(eraseStroke, sortedBlocks, cellSize)
				: [],
		[eraseStroke, sortedBlocks, cellSize],
	);

	return (
		<Layer
			x={transform.x}
			y={transform.y}
			scaleX={transform.scale}
			scaleY={transform.scale}
			listening={isDrawMode}
		>
			{visibleStrokes.map((vs, idx) => (
				<Line
					key={idx}
					name="shapeGuideStroke"
					points={vs.points}
					stroke={vs.originalIndex === selectedStrokeIndex ? 'rgba(239,68,68,1)' : 'rgba(239,68,68,0.8)'}
					strokeWidth={vs.originalIndex === selectedStrokeIndex ? 3 : 2}
					dash={vs.originalIndex === selectedStrokeIndex ? [5, 4] : undefined}
					lineCap="round"
					lineJoin="round"
					hitStrokeWidth={10}
					listening={isDrawMode}
					onClick={() => onStrokeClick?.(vs.originalIndex)}
				/>
			))}
			{visibleCurrentSegments.map((pts, idx) => (
				<Line
					key={`cur-${idx}`}
					points={pts}
					stroke="rgba(239,68,68,0.6)"
					strokeWidth={2}
					lineCap="round"
					lineJoin="round"
					dash={[4, 3]}
					listening={false}
				/>
			))}
			{visibleEraseSegments.map((pts, idx) => (
				<Line
					key={`erase-${idx}`}
					points={pts}
					stroke="rgba(251,191,36,0.7)"
					strokeWidth={12}
					lineCap="round"
					lineJoin="round"
					listening={false}
				/>
			))}
		</Layer>
	);
}
