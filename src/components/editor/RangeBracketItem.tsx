'use client';

import { memo, useCallback } from 'react';
import { Group, Line, Text, Circle } from 'react-konva';
import type Konva from 'konva';
import type { ColRangeAnnotation, RangeAnnotation, RowRangeAnnotation } from '@/types/annotation';

const BRACKET_COLOR = '#2563EB';
const STROKE_WIDTH = 1.5;
const FONT_SIZE = 11;
const CAP_LENGTH = 8;
const MARKER_RADIUS = 6;
const TEXT_OFFSET = 6;
const BRACKET_OFFSET = 4;

interface RangeBracketItemProps {
	annotation: RangeAnnotation;
	// Row range (left/right) 용
	startY?: number;
	endY?: number;
	totalWidth?: number;
	totalRows?: number;
	annotationSideWidth?: number;
	// Col range (top/bottom) 용
	startX?: number;
	endX?: number;
	totalHeight?: number;
	totalCols?: number;
	annotationSideHeight?: number;
	// 공통
	cellSize: number;
	isAnnotationMode: boolean;
	onMarkerClick: (id: string, anchorX: number, anchorY: number) => void;
}

function RowRangeBracket({
	annotation,
	startY,
	endY,
	totalWidth,
	totalRows,
	isAnnotationMode,
	onMarkerClick,
}: {
	annotation: RowRangeAnnotation;
	startY: number;
	endY: number;
	totalWidth: number;
	totalRows: number;
	isAnnotationMode: boolean;
	onMarkerClick: (id: string, anchorX: number, anchorY: number) => void;
}) {
	const isLeft = annotation.side === 'left';
	const bracketX = isLeft ? -BRACKET_OFFSET : totalWidth + BRACKET_OFFSET;
	const midY = (startY + endY) / 2;
	const endRowNum = totalRows - annotation.endRow;
	const startRowNum = totalRows - annotation.startRow;
	const rangeLabel = `${endRowNum}~${startRowNum}단`;
	const displayText = annotation.text ? `${rangeLabel} ${annotation.text}` : rangeLabel;
	const anchorX = isLeft ? bracketX - 60 : bracketX + 60;
	const anchorY = midY;

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.id, nativeEvt?.clientX ?? anchorX, nativeEvt?.clientY ?? anchorY);
		},
		[isAnnotationMode, annotation.id, onMarkerClick, anchorX, anchorY],
	);

	// 세로선
	const verticalPoints = [bracketX, startY, bracketX, endY];
	// 위 캡 (left면 오른쪽으로, right면 왼쪽으로)
	const topCapPoints = isLeft
		? [bracketX, startY, bracketX + CAP_LENGTH, startY]
		: [bracketX, startY, bracketX - CAP_LENGTH, startY];
	// 아래 캡
	const bottomCapPoints = isLeft
		? [bracketX, endY, bracketX + CAP_LENGTH, endY]
		: [bracketX, endY, bracketX - CAP_LENGTH, endY];

	const textX = isLeft ? bracketX - TEXT_OFFSET : bracketX + TEXT_OFFSET;
	const textAlign = isLeft ? 'right' : 'left';

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
			{isLeft ? (
				<Text
					x={textX - 120}
					y={midY - FONT_SIZE / 2}
					width={120}
					text={displayText}
					fontSize={FONT_SIZE}
					fill={BRACKET_COLOR}
					align={textAlign}
					listening={false}
				/>
			) : (
				<Text
					x={textX}
					y={midY - FONT_SIZE / 2}
					text={displayText}
					fontSize={FONT_SIZE}
					fill={BRACKET_COLOR}
					listening={false}
				/>
			)}
			{/* 마커 */}
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
}

function ColRangeBracket({
	annotation,
	startX,
	endX,
	totalHeight,
	isAnnotationMode,
	onMarkerClick,
}: {
	annotation: ColRangeAnnotation;
	startX: number;
	endX: number;
	totalHeight: number;
	isAnnotationMode: boolean;
	onMarkerClick: (id: string, anchorX: number, anchorY: number) => void;
}) {
	const isTop = annotation.side === 'top';
	const bracketY = isTop ? -BRACKET_OFFSET : totalHeight + BRACKET_OFFSET;
	const midX = (startX + endX) / 2;
	const startColNum = annotation.startCol + 1;
	const endColNum = annotation.endCol + 1;
	const rangeLabel = `${startColNum}~${endColNum}열`;
	const displayText = annotation.text ? `${rangeLabel} ${annotation.text}` : rangeLabel;
	const anchorX = midX;
	const anchorY = isTop ? bracketY - 60 : bracketY + 60;

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.id, nativeEvt?.clientX ?? anchorX, nativeEvt?.clientY ?? anchorY);
		},
		[isAnnotationMode, annotation.id, onMarkerClick, anchorX, anchorY],
	);

	// 가로선
	const horizontalPoints = [startX, bracketY, endX, bracketY];
	// 왼쪽 캡 (top이면 아래로, bottom이면 위로)
	const leftCapPoints = isTop
		? [startX, bracketY, startX, bracketY + CAP_LENGTH]
		: [startX, bracketY, startX, bracketY - CAP_LENGTH];
	// 오른쪽 캡
	const rightCapPoints = isTop
		? [endX, bracketY, endX, bracketY + CAP_LENGTH]
		: [endX, bracketY, endX, bracketY - CAP_LENGTH];

	const textY = isTop
		? bracketY - TEXT_OFFSET - FONT_SIZE
		: bracketY + TEXT_OFFSET;

	return (
		<Group>
			{/* 가로선 */}
			<Line
				points={horizontalPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 왼쪽 캡 */}
			<Line
				points={leftCapPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 오른쪽 캡 */}
			<Line
				points={rightCapPoints}
				stroke={BRACKET_COLOR}
				strokeWidth={STROKE_WIDTH}
				listening={false}
			/>
			{/* 텍스트 */}
			<Text
				x={midX + TEXT_OFFSET}
				y={textY}
				text={displayText}
				fontSize={FONT_SIZE}
				fill={BRACKET_COLOR}
				listening={false}
			/>
			{/* 마커 */}
			<Circle
				x={midX}
				y={bracketY}
				radius={MARKER_RADIUS}
				fill={isAnnotationMode ? BRACKET_COLOR : '#93c5fd'}
				opacity={0.7}
				listening={isAnnotationMode}
				onClick={handleMarkerClick}
			/>
		</Group>
	);
}

export const RangeBracketItem = memo(function RangeBracketItemInner({
	annotation,
	startY = 0,
	endY = 0,
	totalWidth = 0,
	totalRows = 0,
	startX = 0,
	endX = 0,
	totalHeight = 0,
	totalCols = 0,
	isAnnotationMode,
	onMarkerClick,
}: RangeBracketItemProps) {
	if (annotation.side === 'top' || annotation.side === 'bottom') {
		return (
			<ColRangeBracket
				annotation={annotation}
				startX={startX}
				endX={endX}
				totalHeight={totalHeight}
				isAnnotationMode={isAnnotationMode}
				onMarkerClick={onMarkerClick}
			/>
		);
	}

	if (annotation.side !== 'left' && annotation.side !== 'right') return null;
	return (
		<RowRangeBracket
			annotation={annotation}
			startY={startY}
			endY={endY}
			totalWidth={totalWidth}
			totalRows={totalRows}
			isAnnotationMode={isAnnotationMode}
			onMarkerClick={onMarkerClick}
		/>
	);
});
