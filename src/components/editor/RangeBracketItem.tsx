'use client';

import { memo, useCallback } from 'react';
import { Group, Line, Text, Circle } from 'react-konva';
import type Konva from 'konva';
import type { RangeAnnotation } from '@/types/annotation';

const BRACKET_COLOR = '#2563EB';
const STROKE_WIDTH = 1.5;
const FONT_SIZE = 11;
const CAP_LENGTH = 8;
const MARKER_RADIUS = 6;
const TEXT_OFFSET_X = 6;
const BRACKET_RIGHT_OFFSET = 4;

interface RangeBracketItemProps {
	annotation: RangeAnnotation;
	startY: number;
	endY: number;
	totalWidth: number;
	cellSize: number;
	annotationSideWidth: number;
	isAnnotationMode: boolean;
	totalRows: number;
	onMarkerClick: (id: string, anchorX: number, anchorY: number) => void;
}

export const RangeBracketItem = memo(function RangeBracketItemInner({
	annotation,
	startY,
	endY,
	totalWidth,
	isAnnotationMode,
	onMarkerClick,
}: RangeBracketItemProps) {
	const bracketX = totalWidth + BRACKET_RIGHT_OFFSET;
	const midY = (startY + endY) / 2;
	const anchorX = bracketX + 60;
	const anchorY = midY;

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.id, nativeEvt?.clientX ?? anchorX, nativeEvt?.clientY ?? anchorY);
		},
		[isAnnotationMode, annotation.id, onMarkerClick, anchorX, anchorY],
	);

	// 세로선 points
	const verticalPoints = [bracketX, startY, bracketX, endY];
	// 위 캡 points
	const topCapPoints = [bracketX, startY, bracketX - CAP_LENGTH, startY];
	// 아래 캡 points
	const bottomCapPoints = [bracketX, endY, bracketX - CAP_LENGTH, endY];

	return (
		<Group>
			{/* 세로선 */}
			<Line
				points={verticalPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 위 캡 */}
			<Line
				points={topCapPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 아래 캡 */}
			<Line
				points={bottomCapPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 텍스트 */}
			<Text
				x={bracketX + TEXT_OFFSET_X}
				y={midY - FONT_SIZE / 2}
				text={annotation.text}
				fontSize={FONT_SIZE}
				fill={BRACKET_COLOR}
				listening={false}
			/>
			{/* 마커 (클릭 히트 영역) */}
			<Circle
				x={bracketX}
				y={midY}
				radius={MARKER_RADIUS}
				fill={isAnnotationMode ? BRACKET_COLOR : '#93c5fd'}
				opacity={0.7}
				listening={isAnnotationMode}
				onClick={handleMarkerClick}
			/>
		</Group>
	);
});
