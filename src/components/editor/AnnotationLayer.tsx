'use client';

import { memo, useCallback, useMemo } from 'react';
import { Layer, Group, Line, Text, Rect, Circle } from 'react-konva';
import type Konva from 'konva';
import type { ColumnAnnotation, RangeAnnotation, RowAnnotation } from '@/types/annotation';
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
	onSideAreaClick: (rowIndex: number, side: 'left' | 'right', anchorX: number, anchorY: number) => void;
	rangeAnnotations?: RangeAnnotation[];
	rangeAnnotationDraft?: { startRow: number; endRow: number; side?: 'left' | 'right' } | null;
	colRangeAnnotationDraft?: { startCol: number; endCol: number; side: 'top' | 'bottom' } | null;
	onRangeBracketClick?: (id: string, anchorX: number, anchorY: number) => void;
	onRangeDragStart?: (rowIndex: number, side?: 'left' | 'right') => void;
	onRangeDragMove?: (rowIndex: number) => void;
	onRangeDragEnd?: (anchorX: number, anchorY: number) => void;
	// 열 주석 (상/하)
	columnAnnotations?: ColumnAnnotation[];
	colVisualXMap?: (number | null)[];
	totalHeight?: number;
	annotationSideHeight?: number;
	onColumnMarkerClick?: (colIndex: number, anchorX: number, anchorY: number, existingId: string | null) => void;
	onColumnAreaClick?: (colIndex: number, side: 'top' | 'bottom', anchorX: number, anchorY: number) => void;
	onColRangeDragStart?: (colIndex: number, side: 'top' | 'bottom') => void;
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
	annotationSideWidth: number;
	isAnnotationMode: boolean;
	totalRows: number;
	onMarkerClick: (rowIndex: number, anchorX: number, anchorY: number, existingId: string | null) => void;
}

const AnnotationItem = memo(function AnnotationItemInner({
	annotation,
	visualY,
	totalWidth,
	cellSize,
	annotationSideWidth,
	isAnnotationMode,
	totalRows,
	onMarkerClick,
}: AnnotationItemProps) {
	const rowCenter = visualY + cellSize / 2;
	const rowNumber = totalRows - annotation.rowIndex;
	const labelText = annotation.label ? `${rowNumber}단 ${annotation.label}` : `${rowNumber}단`;
	const isLeft = annotation.side === 'left';

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.rowIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0, annotation.id);
		},
		[isAnnotationMode, annotation.rowIndex, annotation.id, onMarkerClick],
	);

	if (isLeft) {
		return (
			<Group>
				{/* 연결선 (왼쪽) */}
				<Line
					points={[0, rowCenter, -LINE_EXTEND, rowCenter]}
					stroke="#6366f1"
					strokeWidth={1.5}
					listening={false}
				/>
				{/* 단 번호 텍스트 (오른쪽 정렬) */}
				<Text
					x={-annotationSideWidth}
					y={rowCenter - FONT_SIZE / 2}
					width={annotationSideWidth - TEXT_OFFSET_X}
					text={labelText}
					fontSize={FONT_SIZE}
					fill="#4f46e5"
					align="right"
					listening={false}
				/>
				{/* 마커 */}
				<Circle
					x={-LINE_EXTEND / 2}
					y={rowCenter}
					radius={MARKER_RADIUS}
					fill={isAnnotationMode ? '#6366f1' : '#818cf8'}
					opacity={0.7}
					listening={isAnnotationMode}
					onClick={handleMarkerClick}
				/>
			</Group>
		);
	}

	return (
		<Group>
			{/* 연결선 (오른쪽) */}
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
	side: 'left' | 'right';
	onSideAreaClick: (rowIndex: number, side: 'left' | 'right', anchorX: number, anchorY: number) => void;
	onRangeDragStart?: (rowIndex: number, side?: 'left' | 'right') => void;
}

const SideHitArea = memo(function SideHitAreaInner({
	rowIndex,
	visualY,
	totalWidth,
	cellSize,
	annotationSideWidth,
	side,
	onSideAreaClick,
	onRangeDragStart,
}: SideHitAreaProps) {
	const handleClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			const nativeEvt: MouseEvent | undefined = e.evt;
			onSideAreaClick(rowIndex, side, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
		},
		[rowIndex, side, onSideAreaClick],
	);

	const handleMouseDown = useCallback(
		() => {
			onRangeDragStart?.(rowIndex, side);
		},
		[rowIndex, side, onRangeDragStart],
	);

	const x = side === 'left' ? -annotationSideWidth : totalWidth;

	return (
		<Rect
			x={x}
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

interface ColumnAnnotationItemProps {
	annotation: ColumnAnnotation;
	visualX: number;
	totalHeight: number;
	cellSize: number;
	isAnnotationMode: boolean;
	onMarkerClick: (colIndex: number, anchorX: number, anchorY: number, existingId: string | null) => void;
}

const ColumnAnnotationItem = memo(function ColumnAnnotationItemInner({
	annotation,
	visualX,
	totalHeight,
	cellSize,
	isAnnotationMode,
	onMarkerClick,
}: ColumnAnnotationItemProps) {
	const colCenter = visualX + cellSize / 2;
	const colNumber = annotation.colIndex + 1;
	const labelText = annotation.label ? `${colNumber}열 ${annotation.label}` : `${colNumber}열`;
	const isTop = annotation.side === 'top';

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.colIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0, annotation.id);
		},
		[isAnnotationMode, annotation.colIndex, annotation.id, onMarkerClick],
	);

	if (isTop) {
		return (
			<Group>
				{/* 연결선 (위) */}
				<Line
					points={[colCenter, 0, colCenter, -LINE_EXTEND]}
					stroke="#6366f1"
					strokeWidth={1.5}
					listening={false}
				/>
				{/* 열 번호 텍스트 */}
				<Text
					x={colCenter + TEXT_OFFSET_X / 2}
					y={-(LINE_EXTEND + TEXT_OFFSET_X + FONT_SIZE)}
					text={labelText}
					fontSize={FONT_SIZE}
					fill="#4f46e5"
					listening={false}
				/>
				{/* 마커 */}
				<Circle
					x={colCenter}
					y={-LINE_EXTEND / 2}
					radius={MARKER_RADIUS}
					fill={isAnnotationMode ? '#6366f1' : '#818cf8'}
					opacity={0.7}
					listening={isAnnotationMode}
					onClick={handleMarkerClick}
				/>
			</Group>
		);
	}

	// bottom
	return (
		<Group>
			{/* 연결선 (아래) */}
			<Line
				points={[colCenter, totalHeight, colCenter, totalHeight + LINE_EXTEND]}
				stroke="#6366f1"
				strokeWidth={1.5}
				listening={false}
			/>
			{/* 열 번호 텍스트 */}
			<Text
				x={colCenter + TEXT_OFFSET_X / 2}
				y={totalHeight + LINE_EXTEND + TEXT_OFFSET_X / 2}
				text={labelText}
				fontSize={FONT_SIZE}
				fill="#4f46e5"
				listening={false}
			/>
			{/* 마커 */}
			<Circle
				x={colCenter}
				y={totalHeight + LINE_EXTEND / 2}
				radius={MARKER_RADIUS}
				fill={isAnnotationMode ? '#6366f1' : '#818cf8'}
				opacity={0.7}
				listening={isAnnotationMode}
				onClick={handleMarkerClick}
			/>
		</Group>
	);
});

interface ColHitAreaProps {
	colIndex: number;
	visualX: number;
	totalHeight: number;
	cellSize: number;
	annotationSideHeight: number;
	side: 'top' | 'bottom';
	onColumnAreaClick: (colIndex: number, side: 'top' | 'bottom', anchorX: number, anchorY: number) => void;
	onColRangeDragStart?: (colIndex: number, side: 'top' | 'bottom') => void;
}

const ColHitArea = memo(function ColHitAreaInner({
	colIndex,
	visualX,
	totalHeight,
	cellSize,
	annotationSideHeight,
	side,
	onColumnAreaClick,
	onColRangeDragStart,
}: ColHitAreaProps) {
	const handleClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			const nativeEvt: MouseEvent | undefined = e.evt;
			onColumnAreaClick(colIndex, side, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
		},
		[colIndex, side, onColumnAreaClick],
	);

	const handleMouseDown = useCallback(
		() => {
			onColRangeDragStart?.(colIndex, side);
		},
		[colIndex, side, onColRangeDragStart],
	);

	const y = side === 'top' ? -annotationSideHeight : totalHeight;

	return (
		<Rect
			x={visualX}
			y={y}
			width={cellSize}
			height={annotationSideHeight}
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
	colRangeAnnotationDraft = null,
	onRangeBracketClick,
	onRangeDragStart,
	columnAnnotations = [],
	colVisualXMap = [],
	totalHeight = 0,
	annotationSideHeight = 80,
	onColumnMarkerClick,
	onColumnAreaClick,
	onColRangeDragStart,
}: AnnotationLayerProps) {
	// annotation이 있는 rowIndex Set
	const annotatedRowIndices = useMemo(
		() => new Set(rowAnnotations.map((a) => a.rowIndex)),
		[rowAnnotations],
	);

	// annotation이 있는 colIndex Set (top/bottom 각각)
	const annotatedColIndicesTop = useMemo(
		() => new Set(columnAnnotations.filter((a) => a.side === 'top').map((a) => a.colIndex)),
		[columnAnnotations],
	);
	const annotatedColIndicesBottom = useMemo(
		() => new Set(columnAnnotations.filter((a) => a.side === 'bottom').map((a) => a.colIndex)),
		[columnAnnotations],
	);

	// isAnnotationMode일 때 표시할 행 목록 (annotation 없는 행 포함) — 우측 히트
	const sideHitRowsRight = useMemo(() => {
		if (!isAnnotationMode) return [];
		const rows: { rowIndex: number; visualY: number }[] = [];
		rowVisualYMap.forEach((visualY, rowIndex) => {
			if (visualY === null) return;
			if (annotatedRowIndices.has(rowIndex)) return;
			rows.push({ rowIndex, visualY });
		});
		return rows;
	}, [isAnnotationMode, rowVisualYMap, annotatedRowIndices]);

	// isAnnotationMode일 때 표시할 행 목록 — 좌측 히트 (오른쪽 주석이 없는 행)
	const sideHitRowsLeft = useMemo(() => {
		if (!isAnnotationMode) return [];
		const rows: { rowIndex: number; visualY: number }[] = [];
		rowVisualYMap.forEach((visualY, rowIndex) => {
			if (visualY === null) return;
			if (annotatedRowIndices.has(rowIndex)) return;
			rows.push({ rowIndex, visualY });
		});
		return rows;
	}, [isAnnotationMode, rowVisualYMap, annotatedRowIndices]);

	// 열 히트 영역 — top (onColumnAreaClick이 없으면 빈 배열)
	const colHitTop = useMemo(() => {
		if (!isAnnotationMode || onColumnAreaClick === undefined) return [];
		const cols: { colIndex: number; visualX: number }[] = [];
		colVisualXMap.forEach((visualX, colIndex) => {
			if (visualX === null) return;
			if (annotatedColIndicesTop.has(colIndex)) return;
			cols.push({ colIndex, visualX });
		});
		return cols;
	}, [isAnnotationMode, colVisualXMap, annotatedColIndicesTop, onColumnAreaClick]);

	// 열 히트 영역 — bottom (onColumnAreaClick이 없으면 빈 배열)
	const colHitBottom = useMemo(() => {
		if (!isAnnotationMode || onColumnAreaClick === undefined) return [];
		const cols: { colIndex: number; visualX: number }[] = [];
		colVisualXMap.forEach((visualX, colIndex) => {
			if (visualX === null) return;
			if (annotatedColIndicesBottom.has(colIndex)) return;
			cols.push({ colIndex, visualX });
		});
		return cols;
	}, [isAnnotationMode, colVisualXMap, annotatedColIndicesBottom, onColumnAreaClick]);

	const handleColumnMarkerClick = useCallback(
		(colIndex: number, anchorX: number, anchorY: number, existingId: string | null) => {
			onColumnMarkerClick?.(colIndex, anchorX, anchorY, existingId);
		},
		[onColumnMarkerClick],
	);

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
						annotationSideWidth={annotationSideWidth}
						isAnnotationMode={isAnnotationMode}
						totalRows={totalRows}
						onMarkerClick={onMarkerClick}
					/>
				);
			})}

			{/* isAnnotationMode일 때 비어있는 행 우측 히트 영역 */}
			{sideHitRowsRight.map(({ rowIndex, visualY }) => (
				<SideHitArea
					key={`hit-right-${rowIndex}`}
					rowIndex={rowIndex}
					visualY={visualY}
					totalWidth={totalWidth}
					cellSize={cellSize}
					annotationSideWidth={annotationSideWidth}
					side="right"
					onSideAreaClick={onSideAreaClick}
					onRangeDragStart={onRangeDragStart}
				/>
			))}

			{/* isAnnotationMode일 때 비어있는 행 좌측 히트 영역 */}
			{sideHitRowsLeft.map(({ rowIndex, visualY }) => (
				<SideHitArea
					key={`hit-left-${rowIndex}`}
					rowIndex={rowIndex}
					visualY={visualY}
					totalWidth={totalWidth}
					cellSize={cellSize}
					annotationSideWidth={annotationSideWidth}
					side="left"
					onSideAreaClick={onSideAreaClick}
				/>
			))}

			{/* 범위 주석 브라켓 목록 */}
			{rangeAnnotations.map((annotation) => {
				if (annotation.side === 'left' || annotation.side === 'right') {
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
				}
				// top / bottom (ColRangeAnnotation)
				if (annotation.side !== 'top' && annotation.side !== 'bottom') return null;
				const startX = colVisualXMap[annotation.startCol];
				const endColX = colVisualXMap[annotation.endCol];
				if (startX === null || startX === undefined) return null;
				if (endColX === null || endColX === undefined) return null;
				const endX = endColX + cellSize;
				return (
					<RangeBracketItem
						key={annotation.id}
						annotation={annotation}
						startX={startX}
						endX={endX}
						totalHeight={totalHeight}
						totalCols={colVisualXMap.length}
						cellSize={cellSize}
						annotationSideHeight={annotationSideHeight}
						isAnnotationMode={isAnnotationMode}
						onMarkerClick={onRangeBracketClick ?? noopMarkerClick}
					/>
				);
			})}

			{/* 드래그 중 row range draft 브라켓 (점선, listening=false) */}
			{rangeAnnotationDraft !== null && (() => {
				const draftStartY = rowVisualYMap[rangeAnnotationDraft.startRow];
				const draftEndRowY = rowVisualYMap[rangeAnnotationDraft.endRow];
				if (draftStartY === null || draftStartY === undefined) return null;
				if (draftEndRowY === null || draftEndRowY === undefined) return null;
				const draftEndY = draftEndRowY + cellSize;
				const isLeft = rangeAnnotationDraft.side === 'left';
				const bracketX = isLeft ? -DRAFT_BRACKET_OFFSET : totalWidth + DRAFT_BRACKET_OFFSET;
				const leftCapX = isLeft ? bracketX + DRAFT_CAP_LENGTH : bracketX - DRAFT_CAP_LENGTH;
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
							points={[bracketX, draftStartY, leftCapX, draftStartY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
						<Line
							points={[bracketX, draftEndY, leftCapX, draftEndY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
					</Group>
				);
			})()}

			{/* 드래그 중 col range draft 브라켓 (점선, listening=false) */}
			{colRangeAnnotationDraft !== null && (() => {
				const draftStartX = colVisualXMap[colRangeAnnotationDraft.startCol];
				const draftEndColX = colVisualXMap[colRangeAnnotationDraft.endCol];
				if (draftStartX === null || draftStartX === undefined) return null;
				if (draftEndColX === null || draftEndColX === undefined) return null;
				const draftEndX = draftEndColX + cellSize;
				const isTop = colRangeAnnotationDraft.side === 'top';
				const bracketY = isTop ? -DRAFT_BRACKET_OFFSET : totalHeight + DRAFT_BRACKET_OFFSET;
				const capY = isTop ? bracketY + DRAFT_CAP_LENGTH : bracketY - DRAFT_CAP_LENGTH;
				return (
					<Group listening={false}>
						<Line
							points={[draftStartX, bracketY, draftEndX, bracketY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
						<Line
							points={[draftStartX, bracketY, draftStartX, capY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
						<Line
							points={[draftEndX, bracketY, draftEndX, capY]}
							stroke={DRAFT_BRACKET_COLOR}
							strokeWidth={DRAFT_STROKE_WIDTH}
							dash={[4, 3]}
							opacity={0.5}
						/>
					</Group>
				);
			})()}

			{/* 열 주석 렌더링 */}
			{columnAnnotations.map((annotation) => {
				const visualX = colVisualXMap[annotation.colIndex];
				if (visualX === null || visualX === undefined) return null;
				return (
					<ColumnAnnotationItem
						key={annotation.id}
						annotation={annotation}
						visualX={visualX}
						totalHeight={totalHeight}
						cellSize={cellSize}
						isAnnotationMode={isAnnotationMode}
						onMarkerClick={handleColumnMarkerClick}
					/>
				);
			})}

			{/* isAnnotationMode일 때 열 상단 히트 영역 (colHitTop은 onColumnAreaClick 없으면 빈 배열) */}
			{onColumnAreaClick !== undefined && colHitTop.map(({ colIndex, visualX }) => (
				<ColHitArea
					key={`hit-top-${colIndex}`}
					colIndex={colIndex}
					visualX={visualX}
					totalHeight={totalHeight}
					cellSize={cellSize}
					annotationSideHeight={annotationSideHeight}
					side="top"
					onColumnAreaClick={onColumnAreaClick}
					onColRangeDragStart={onColRangeDragStart}
				/>
			))}

			{/* isAnnotationMode일 때 열 하단 히트 영역 (colHitBottom은 onColumnAreaClick 없으면 빈 배열) */}
			{onColumnAreaClick !== undefined && colHitBottom.map(({ colIndex, visualX }) => (
				<ColHitArea
					key={`hit-bottom-${colIndex}`}
					colIndex={colIndex}
					visualX={visualX}
					totalHeight={totalHeight}
					cellSize={cellSize}
					annotationSideHeight={annotationSideHeight}
					side="bottom"
					onColumnAreaClick={onColumnAreaClick}
					onColRangeDragStart={onColRangeDragStart}
				/>
			))}
		</Layer>
	);
});
