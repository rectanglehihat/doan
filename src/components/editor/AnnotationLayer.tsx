'use client';

import { memo, useCallback, useMemo } from 'react';
import { Layer, Group, Line, Text, Rect, Circle } from 'react-konva';
import type Konva from 'konva';
import type { RowAnnotation } from '@/types/annotation';

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
	onMarkerClick: (rowIndex: number, anchorX: number, anchorY: number) => void;
	onSideAreaClick: (rowIndex: number, anchorX: number, anchorY: number) => void;
}

const FONT_SIZE = 11;
const MARKER_RADIUS = 6;
const LINE_EXTEND = 8;
const TEXT_OFFSET_X = 12;

interface AnnotationItemProps {
	annotation: RowAnnotation;
	visualY: number;
	totalWidth: number;
	cellSize: number;
	isAnnotationMode: boolean;
	totalRows: number;
	onMarkerClick: (rowIndex: number, anchorX: number, anchorY: number) => void;
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
	const labelText = `${rowNumber}단`;

	const handleMarkerClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			if (!isAnnotationMode) return;
			// jsdom 테스트 환경에서 e.evt가 undefined일 수 있음 (mock 한계)
			const nativeEvt: MouseEvent | undefined = e.evt;
			onMarkerClick(annotation.rowIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
		},
		[isAnnotationMode, annotation.rowIndex, onMarkerClick],
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
}

const SideHitArea = memo(function SideHitAreaInner({
	rowIndex,
	visualY,
	totalWidth,
	cellSize,
	annotationSideWidth,
	onSideAreaClick,
}: SideHitAreaProps) {
	const handleClick = useCallback(
		(e: Konva.KonvaEventObject<MouseEvent>) => {
			// jsdom 테스트 환경에서 e.evt가 undefined일 수 있음 (mock 한계)
			const nativeEvt: MouseEvent | undefined = e.evt;
			onSideAreaClick(rowIndex, nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
		},
		[rowIndex, onSideAreaClick],
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
		/>
	);
});

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
				/>
			))}
		</Layer>
	);
});
