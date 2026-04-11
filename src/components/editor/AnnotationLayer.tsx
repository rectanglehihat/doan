'use client';

import { memo, useCallback, useMemo } from 'react';
import { Layer, Group, Line, Text, Rect, Circle } from 'react-konva';
import type Konva from 'konva';
import type { RangeAnnotation, RowAnnotation } from '@/types/annotation';
import { RangeBracketItem } from './RangeBracketItem';

export interface AnnotationLayerTransform {
	x: number;
	y: number;
	scale: number;
}

export interface AnnotationLayerProps {
	rowAnnotations: RowAnnotation[];
	rowVisualYMap: (number | null)[];
	totalWidth: number;
	cellSize: number;
	annotationSideWidth: number;
	isAnnotationMode: boolean;
	totalRows: number;
	transform?: AnnotationLayerTransform;
	onMarkerClick: (rowIndex: number, anchorX: number, anchorY: number, existingId: string | null) => void;
	onSideAreaClick: (rowIndex: number, anchorX: number, anchorY: number) => void;
	rangeAnnotations?: RangeAnnotation[];
	rangeAnnotationDraft?: { startRow: number; endRow: number } | null;
	onRangeBracketClick?: (id: string, anchorX: number, anchorY: number) => void;
	onRangeDragStart?: (rowIndex: number) => void;
	onRangeDragMove?: (rowIndex: number) => void;
	onRangeDragEnd?: (anchorX: number, anchorY: number) => void;
}

const FONT_SIZE = 11;
const MARKER_RADIUS = 6;

const noopMarkerClick: (id: string, anchorX: number, anchorY: number) => void = () => {
	// no-op default handler for RangeBracketItem.onMarkerClick
};
const LINE_EXTEND = 8;
const TEXT_OFFSET_X = 12;

interface AnnotationItemProps {
	annotation: RowAnnotation;
	visualY: number;
	totalWidth: number;
	cellSize: number;
	isAnnotationMode: boolean;
	totalRows: number;
	onMarkerClick: (rowIndex: number, anchorX: number, anchorY: number, existingId: string | null) => void;
}

const AnnotationItem = memo(function AnnotationItemInner({
	annotation,
	visualY,
	totalWidth,
	cellSize,
	isAnnotationMode,
	totalRows,
	onMarkerClick,
}: AnnotationItemProps) {
	const rowCenter = visualY + cellSize / 2;
	const rowNumber = totalRows - annotation.rowIndex;
	const labelText = annotation.label ? `${rowNumber}단 ${annotation.label}` : `${rowNumber}단`;

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			// jsdom 테스트 환경에서 e.evt가 undefined일 수 있음 (mock 한계)
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.rowIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0, annotation.id);
		},
		[isAnnotationMode, annotation.rowIndex, annotation.id, onMarkerClick],
	);

	return (
		<Group>
			{/* 연결선 */}
			<Line
				points={[totalWidth, rowCenter, totalWidth + LINE_EXTEND, rowCenter]}
				stroke="#6366f1"
				strokeWidth={1.5}
				listening={false}
			/>
			{/* 단 번호 텍스트 */}
			<Text
				x={totalWidth + TEXT_OFFSET_X}
				y={rowCenter - FONT_SIZE / 2}
				text={labelText}
				fontSize={FONT_SIZE}
				fill="#4f46e5"
				listening={false}
			/>
			{/* 마커 (클릭 히트 영역) */}
			<Circle
				x={totalWidth + LINE_EXTEND / 2}
				y={rowCenter}
				radius={MARKER_RADIUS}
				fill={isAnnotationMode ? '#6366f1' : '#818cf8'}
				opacity={0.7}
				listening={isAnnotationMode}
				onClick={handleMarkerClick}
			/>
		</Group>
	);
});

interface SideHitAreaProps {
	rowIndex: number;
	visualY: number;
	totalWidth: number;
	cellSize: number;
	annotationSideWidth: number;
	onSideAreaClick: (rowIndex: number, anchorX: number, anchorY: number) => void;
	onRangeDragStart?: (rowIndex: number) => void;
}

const SideHitArea = memo(function SideHitAreaInner({
	rowIndex,
	visualY,
	totalWidth,
	cellSize,
	annotationSideWidth,
	onSideAreaClick,
	onRangeDragStart,
}: SideHitAreaProps) {
	const handleClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			// jsdom 테스트 환경에서 e.evt가 undefined일 수 있음 (mock 한계)
			const nativeEvt: MouseEvent | undefined = e.evt;
			onSideAreaClick(rowIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
		},
		[rowIndex, onSideAreaClick],
	);

	const handleMouseDown = useCallback(
		() => {
			onRangeDragStart?.(rowIndex);
		},
		[rowIndex, onRangeDragStart],
	);

	return (
		<Rect
			x={totalWidth}
			y={visualY}
			width={annotationSideWidth}
			height={cellSize}
			fill="transparent"
			listening={true}
			onClick={handleClick}
			onMouseDown={handleMouseDown}
		/>
	);
});

const DRAFT_BRACKET_COLOR = '#2563EB';
const DRAFT_BRACKET_OFFSET = 4;
const DRAFT_CAP_LENGTH = 8;
const DRAFT_STROKE_WIDTH = 1.5;

export const AnnotationLayer = memo(function AnnotationLayerInner({
	rowAnnotations,
	rowVisualYMap,
	totalWidth,
	cellSize,
	annotationSideWidth,
	isAnnotationMode,
	totalRows,
	transform,
	onMarkerClick,
	onSideAreaClick,
	rangeAnnotations = [],
	rangeAnnotationDraft = null,
	onRangeBracketClick,
	onRangeDragStart,
}: AnnotationLayerProps) {
	// annotation이 있는 rowIndex Set
	const annotatedRowIndices = useMemo(
		() => new Set(rowAnnotations.map((a) => a.rowIndex)),
		[rowAnnotations],
	);

	// isAnnotationMode일 때 표시할 행 목록 (annotation 없는 행 포함)
	const sideHitRows = useMemo(() => {
		if (!isAnnotationMode) return [];
		const rows: { rowIndex: number; visualY: number }[] = [];
		rowVisualYMap.forEach((visualY, rowIndex) => {
			if (visualY === null) return;
			if (annotatedRowIndices.has(rowIndex)) return;
			rows.push({ rowIndex, visualY });
		});
		return rows;
	}, [isAnnotationMode, rowVisualYMap, annotatedRowIndices]);

	return (
		<Layer
			listening={isAnnotationMode}
			x={transform?.x}
			y={transform?.y}
			scaleX={transform?.scale}
			scaleY={transform?.scale}
		>
			{/* 기존 주석 마커 렌더링 */}
			{rowAnnotations.map((annotation) => {
				const visualY = rowVisualYMap[annotation.rowIndex];
				if (visualY === null || visualY === undefined) return null;
				return (
					<AnnotationItem
						key={annotation.id}
						annotation={annotation}
						visualY={visualY}
						totalWidth={totalWidth}
						cellSize={cellSize}
						isAnnotationMode={isAnnotationMode}
						totalRows={totalRows}
						onMarkerClick={onMarkerClick}
					/>
				);
			})}

			{/* isAnnotationMode일 때 비어있는 행 측면 클릭 히트 영역 */}
			{sideHitRows.map(({ rowIndex, visualY }) => (
				<SideHitArea
					key={`hit-${rowIndex}`}
					rowIndex={rowIndex}
					visualY={visualY}
					totalWidth={totalWidth}
					cellSize={cellSize}
					annotationSideWidth={annotationSideWidth}
					onSideAreaClick={onSideAreaClick}
					onRangeDragStart={onRangeDragStart}
				/>
			))}

			{/* 범위 주석 브라켓 목록 */}
			{rangeAnnotations.map((annotation) => {
				const startY = rowVisualYMap[annotation.startRow];
				const endRowY = rowVisualYMap[annotation.endRow];
				if (startY === null || startY === undefined) return null;
				if (endRowY === null || endRowY === undefined) return null;
				const endY = endRowY + cellSize;
				return (
					<RangeBracketItem
						key={annotation.id}
						annotation={annotation}
						startY={startY}
						endY={endY}
						totalWidth={totalWidth}
						cellSize={cellSize}
						annotationSideWidth={annotationSideWidth}
						isAnnotationMode={isAnnotationMode}
						totalRows={totalRows}
						onMarkerClick={onRangeBracketClick ?? noopMarkerClick}
					/>
				);
			})}

			{/* 드래그 중 draft 브라켓 (점선, listening=false) */}
			{rangeAnnotationDraft !== null && (() => {
				const draftStartY = rowVisualYMap[rangeAnnotationDraft.startRow];
				const draftEndRowY = rowVisualYMap[rangeAnnotationDraft.endRow];
				if (draftStartY === null || draftStartY === undefined) return null;
				if (draftEndRowY === null || draftEndRowY === undefined) return null;
				const draftEndY = draftEndRowY + cellSize;
				const bracketX = totalWidth + DRAFT_BRACKET_OFFSET;
				return (
					<Group listening={false}>
						<Line
							points={[bracketX, draftStartY, bracketX, draftEndY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
						<Line
							points={[bracketX, draftStartY, bracketX - DRAFT_CAP_LENGTH, draftStartY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
						<Line
							points={[bracketX, draftEndY, bracketX - DRAFT_CAP_LENGTH, draftEndY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
					</Group>
				);
			})()}
		</Layer>
	);
});
