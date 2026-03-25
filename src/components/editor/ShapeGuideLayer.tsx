'use client';

import { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { ShapeGuide } from '@/types/knitting';

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
}: ShapeGuideLayerProps) {
	// grid 좌표계 → 픽셀 좌표계 변환
	const toPixels = useMemo(
		() => (pts: number[]) => pts.map((v) => v * cellSize),
		[cellSize],
	);

	return (
		<Layer
			x={transform.x}
			y={transform.y}
			scaleX={transform.scale}
			scaleY={transform.scale}
			listening={isDrawMode}
		>
			{shapeGuide.strokes.map((stroke, i) => (
				<Line
					key={i}
					name="shapeGuideStroke"
					points={toPixels(stroke)}
					stroke={i === selectedStrokeIndex ? 'rgba(239,68,68,1)' : 'rgba(239,68,68,0.8)'}
					strokeWidth={i === selectedStrokeIndex ? 3 : 2}
					dash={i === selectedStrokeIndex ? [5, 4] : undefined}
					lineCap="round"
					lineJoin="round"
					hitStrokeWidth={10}
					listening={isDrawMode}
					onClick={() => onStrokeClick?.(i)}
				/>
			))}
			{currentStroke.length >= 4 && (
				<Line
					points={toPixels(currentStroke)}
					stroke="rgba(239,68,68,0.6)"
					strokeWidth={2}
					lineCap="round"
					lineJoin="round"
					dash={[4, 3]}
					listening={false}
				/>
			)}
			{eraseStroke && eraseStroke.length >= 4 && (
				<Line
					points={toPixels(eraseStroke)}
					stroke="rgba(251,191,36,0.7)"
					strokeWidth={12}
					lineCap="round"
					lineJoin="round"
					listening={false}
				/>
			)}
		</Layer>
	);
}
