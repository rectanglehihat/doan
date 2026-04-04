'use client';

import { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { ChartCell, CollapsedBlock, CollapsedColumnBlock, GridSize, ShapeGuide, CellSelection, RotationalMode } from '@/types/knitting';
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation';
import { ShapeGuideLayer } from './ShapeGuideLayer';
import { buildRowVisualYMap, getCollapsedBlockVisualY, calcVisualRowCount, buildVisualToDataIntersectionMap } from '@/lib/utils/collapsed-rows';
import { buildColVisualXMap, calcVisualColCount, getCollapsedColumnBlockVisualX, buildVisualToDataColIntersectionMap } from '@/lib/utils/collapsed-cols';

// --- 교차 감지 유틸 ---

function cross2D(ux: number, uy: number, vx: number, vy: number): number {
	return ux * vy - uy * vx;
}

function segmentsProperlyIntersect(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number,
): boolean {
	const d1 = cross2D(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
	const d2 = cross2D(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
	const d3 = cross2D(x4 - x3, y4 - y3, x1 - x3, y1 - y3);
	const d4 = cross2D(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
	return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0;
}

const ERASE_THRESHOLD_SQ = 0.5 * 0.5;

function strokeSegmentHitByErase(
	sx1: number,
	sy1: number,
	sx2: number,
	sy2: number,
	ex1: number,
	ey1: number,
	ex2: number,
	ey2: number,
): boolean {
	if (segmentsProperlyIntersect(sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)) return true;
	if (pointToSegmentDistSq(sx1, sy1, ex1, ey1, ex2, ey2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(sx2, sy2, ex1, ey1, ex2, ey2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(ex1, ey1, sx1, sy1, sx2, sy2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(ex2, ey2, sx1, sy1, sx2, sy2) <= ERASE_THRESHOLD_SQ) return true;
	return false;
}

function splitStrokeByErasePath(stroke: number[], ex1: number, ey1: number, ex2: number, ey2: number): number[][] {
	const remaining: number[][] = [];
	let current: number[] = [];
	for (let i = 0; i < stroke.length - 2; i += 2) {
		const sx1 = stroke[i],
			sy1 = stroke[i + 1];
		const sx2 = stroke[i + 2],
			sy2 = stroke[i + 3];
		if (strokeSegmentHitByErase(sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)) {
			if (current.length >= 4) remaining.push(current);
			current = [];
		} else {
			if (current.length === 0) current = [sx1, sy1, sx2, sy2];
			else current.push(sx2, sy2);
		}
	}
	if (current.length >= 4) remaining.push(current);
	return remaining;
}

function splitStrokeByPoint(stroke: number[], px: number, py: number, thresholdSq: number): number[][] {
	const remaining: number[][] = [];
	let current: number[] = [];
	for (let i = 0; i < stroke.length - 2; i += 2) {
		const sx1 = stroke[i],
			sy1 = stroke[i + 1];
		const sx2 = stroke[i + 2],
			sy2 = stroke[i + 3];
		if (pointToSegmentDistSq(px, py, sx1, sy1, sx2, sy2) <= thresholdSq) {
			if (current.length >= 4) remaining.push(current);
			current = [];
		} else {
			if (current.length === 0) current = [sx1, sy1, sx2, sy2];
			else current.push(sx2, sy2);
		}
	}
	if (current.length >= 4) remaining.push(current);
	return remaining;
}

function pointToSegmentDistSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
	const dx = bx - ax,
		dy = by - ay;
	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
	return (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2;
}

// 지우개 커서 SVG (20×20, hotspot 10,18)
const ERASER_CURSOR =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E" +
	"%3Crect x='2' y='10' width='16' height='8' rx='2' fill='%23fde68a' stroke='%23d97706' stroke-width='1.5'/%3E" +
	"%3Crect x='2' y='10' width='8' height='8' rx='2' fill='white' stroke='%23d97706' stroke-width='1.5'/%3E" +
	'%3C/svg%3E") 10 18, cell';

// --- 중략 행 서브컴포넌트 ---

interface CollapsedRowProps {
	block: CollapsedBlock;
	y: number;
	width: number;
	cellSize: number;
	totalRows: number;
	onClick: (blockId: string) => void;
}

const CollapsedRow = memo(function CollapsedRowInner({ block, y, width, cellSize, totalRows, onClick }: CollapsedRowProps) {
	const handleClick = useCallback(() => {
		onClick(block.id);
	}, [block.id, onClick]);

	// 아래가 1단 — displayStart는 작은 단 번호, displayEnd는 큰 단 번호
	const displayStart = totalRows - block.endRow;
	const displayEnd = totalRows - block.startRow;
	const labelText = `${displayStart}~${displayEnd}단 중략`;
	const fontSize = Math.max(11, Math.min(13, Math.floor(cellSize * 0.7)));

	return (
		<Group
			y={y}
			onClick={handleClick}
		>
			<Rect
				x={0}
				y={0}
				width={width}
				height={cellSize}
				fill="#FEFCE8"
				stroke="#EAB308"
				strokeWidth={1}
			/>
			<Text
				x={0}
				y={Math.floor((cellSize - fontSize) / 2)}
				width={width}
				height={cellSize}
				text={labelText}
				align="center"
				verticalAlign="middle"
				fontSize={fontSize}
				fill="#854D0E"
				listening={false}
			/>
		</Group>
	);
});

// --- 중략 열 서브컴포넌트 ---

interface CollapsedColumnProps {
	block: CollapsedColumnBlock;
	x: number;
	height: number;
	cellSize: number;
	totalCols: number;
	onClick: (blockId: string) => void;
}

const CollapsedColumn = memo(function CollapsedColumnInner({ block, x, height, cellSize, totalCols, onClick }: CollapsedColumnProps) {
	const handleClick = useCallback(() => {
		onClick(block.id);
	}, [block.id, onClick]);

	// 오른쪽이 1열 — displayStart는 작은 열 번호, displayEnd는 큰 열 번호
	const displayStart = totalCols - block.endCol;
	const displayEnd = totalCols - block.startCol;
	const labelText = `${displayStart}~${displayEnd}열 중략`;
	const fontSize = Math.max(9, Math.min(11, Math.floor(cellSize * 0.6)));

	return (
		<Group
			x={x}
			onClick={handleClick}
		>
			<Rect
				x={0}
				y={0}
				width={cellSize}
				height={height}
				fill="#FFF7ED"
				stroke="#F59E0B"
				strokeWidth={1}
			/>
			{/* -90도 회전 세로 텍스트: width↔height 교환, offsetX=height 기준 중앙 배치 */}
			<Text
				x={0}
				y={height}
				width={height}
				height={cellSize}
				text={labelText}
				align="center"
				verticalAlign="middle"
				fontSize={fontSize}
				fill="#92400E"
				rotation={-90}
				listening={false}
			/>
		</Group>
	);
});

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
	isShapeGuideEraseMode?: boolean;
	onShapeGuideStrokeAdd?: (stroke: number[]) => void;
	onShapeGuideStrokeRemove?: (index: number) => void;
	onShapeGuideStrokeReplace?: (index: number, newStrokes: number[][]) => void;
	onShapeGuideEraseStart?: () => void;
	onShapeGuideEraseEnd?: () => void;
	isSelectionMode?: boolean;
	cellSelection?: CellSelection | null;
	clipboard?: ChartCell[][] | null;
	onSelectionChange?: (sel: CellSelection | null) => void;
	onCopySelection?: (sel: CellSelection) => void;
	onPasteClipboard?: (row: number, col: number) => void;
	rotationalMode?: RotationalMode;
	collapsedBlocks?: CollapsedBlock[];
	onCollapsedBlockClick?: (blockId: string) => void;
	collapsedColumnBlocks?: CollapsedColumnBlock[];
	onCollapsedColumnBlockClick?: (blockId: string) => void;
	externalStageRef?: React.RefObject<Konva.Stage | null>;
	isColorMode?: boolean;
	selectedColor?: string | null;
	onCellColorPaint?: (row: number, col: number, color: string | null) => void;
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
	isShapeGuideEraseMode = false,
	onShapeGuideStrokeAdd,
	onShapeGuideStrokeRemove,
	onShapeGuideStrokeReplace,
	onShapeGuideEraseStart,
	onShapeGuideEraseEnd,
	isSelectionMode = false,
	cellSelection = null,
	clipboard = null,
	onSelectionChange,
	onCopySelection,
	onPasteClipboard,
	rotationalMode = 'none',
	collapsedBlocks = [],
	onCollapsedBlockClick,
	collapsedColumnBlocks = [],
	onCollapsedColumnBlockClick,
	externalStageRef,
	isColorMode = false,
	selectedColor = null,
	onCellColorPaint,
}: KonvaGridProps) {
	const stageRef = useRef<Konva.Stage>(null);
	const layerRef = useRef<Konva.Layer>(null);
	const isPainting = useRef(false);
	const isDrawingGuide = useRef(false);
	const isErasingGuide = useRef(false);
	const [currentStroke, setCurrentStroke] = useState<number[]>([]);
	const [currentEraseStroke, setCurrentEraseStroke] = useState<number[]>([]);

	// currentEraseStroke를 ref로도 관리해 콜백 내에서 stale closure 없이 최신값 참조
	const currentEraseStrokeRef = useRef<number[]>([]);

	// externalStageRef 동기화 — 외부에서 Konva Stage 인스턴스에 접근할 수 있도록
	useEffect(() => {
		if (externalStageRef) {
			externalStageRef.current = stageRef.current;
		}
		return () => {
			if (externalStageRef) {
				externalStageRef.current = null;
			}
		};
	}, [externalStageRef]);

	// shapeGuide를 ref로 유지해 콜백 클로저 문제 방지
	const shapeGuideRef = useRef(shapeGuide);
	useEffect(() => {
		shapeGuideRef.current = shapeGuide;
	}, [shapeGuide]);

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

	// 영역 선택 관련
	const isSelectingRef = useRef(false);
	const selectionAnchorRef = useRef<{ row: number; col: number } | null>(null);
	const hoverCellRef = useRef<{ row: number; col: number } | null>(null);
	useEffect(() => {
		hoverCellRef.current = hoverCell;
	}, [hoverCell]);

	const handleStrokeClick = useCallback((index: number) => {
		setSelectedStrokeIndex((prev) => (prev === index ? null : index));
	}, []);

	const handleCollapsedRowClick = useCallback(
		(blockId: string) => {
			onCollapsedBlockClick?.(blockId);
		},
		[onCollapsedBlockClick],
	);

	const handleCollapsedColumnClick = useCallback(
		(blockId: string) => {
			onCollapsedColumnBlockClick?.(blockId);
		},
		[onCollapsedColumnBlockClick],
	);

	useEffect(() => {
		if (!isShapeGuideDrawMode) return;
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

	useEffect(() => {
		if (!isSelectionMode) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === 'Escape') {
				onSelectionChange?.(null);
			} else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
				e.preventDefault();
				if (cellSelection) onCopySelection?.(cellSelection);
			} else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
				e.preventDefault();
				if (cellSelection) {
					// 선택 영역이 있으면 선택 영역의 top-left에 붙여넣기 (방향키 이동 후에도 정확히 동작)
					const minRow = Math.min(cellSelection.startRow, cellSelection.endRow);
					const minCol = Math.min(cellSelection.startCol, cellSelection.endCol);
					onPasteClipboard?.(minRow, minCol);
				} else {
					const hover = hoverCellRef.current;
					if (hover) onPasteClipboard?.(hover.row, hover.col);
				}
			} else if (cellSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				e.preventDefault();
				const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
				const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
				const maxRow = gridSize.rows - 1;
				const maxCol = gridSize.cols - 1;

				if (e.shiftKey) {
					// Shift+방향키: 끝점만 확장/축소
					const newEndRow = Math.max(0, Math.min(maxRow, cellSelection.endRow + dr));
					const newEndCol = Math.max(0, Math.min(maxCol, cellSelection.endCol + dc));
					onSelectionChange?.({
						...cellSelection,
						endRow: newEndRow,
						endCol: newEndCol,
					});
				} else {
					// 방향키: 선택 영역 전체 이동
					const selRows = cellSelection.endRow - cellSelection.startRow;
					const selCols = cellSelection.endCol - cellSelection.startCol;
					const newStartRow = Math.max(0, Math.min(maxRow - Math.abs(selRows), cellSelection.startRow + dr));
					const newStartCol = Math.max(0, Math.min(maxCol - Math.abs(selCols), cellSelection.startCol + dc));
					onSelectionChange?.({
						startRow: newStartRow,
						startCol: newStartCol,
						endRow: newStartRow + selRows,
						endCol: newStartCol + selCols,
					});
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSelectionMode, cellSelection, gridSize, onSelectionChange, onCopySelection, onPasteClipboard]);

	const visualRowCount = useMemo(
		() => calcVisualRowCount(gridSize.rows, collapsedBlocks),
		[gridSize.rows, collapsedBlocks],
	);
	const visualColCount = useMemo(
		() => calcVisualColCount(gridSize.cols, collapsedColumnBlocks),
		[gridSize.cols, collapsedColumnBlocks],
	);
	const totalWidth = visualColCount * cellSize;
	const totalHeight = visualRowCount * cellSize;

	// 각 행의 시각적 y 좌표 매핑 (collapsed 행은 null) — 내부에서 한 번만 정렬
	const rowVisualYMap = useMemo(
		() => buildRowVisualYMap(collapsedBlocks, gridSize.rows, cellSize),
		[collapsedBlocks, gridSize.rows, cellSize],
	);

	// 각 열의 시각적 x 좌표 매핑 (collapsed 열은 null)
	const colVisualXMap = useMemo(
		() => buildColVisualXMap(collapsedColumnBlocks, gridSize.cols, cellSize),
		[collapsedColumnBlocks, gridSize.cols, cellSize],
	);

	// 중략 블록 각각의 시각적 y 좌표
	const collapsedBlockYMap = useMemo(() => {
		return collapsedBlocks.map((block) => ({
			block,
			y: getCollapsedBlockVisualY(block, collapsedBlocks, cellSize),
		}));
	}, [collapsedBlocks, cellSize]);

	// 중략 열 블록 각각의 시각적 x 좌표
	const collapsedColumnBlockXMap = useMemo(() => {
		return collapsedColumnBlocks.map((block) => ({
			block,
			x: getCollapsedColumnBlockVisualX(block, collapsedColumnBlocks, cellSize),
		}));
	}, [collapsedColumnBlocks, cellSize]);

	const gridLines = useMemo(() => {
		const lines: { key: string; points: number[] }[] = [];
		// 수직선: 시각적 열 수 기준으로 그림
		for (let i = 0; i <= visualColCount; i++) {
			lines.push({ key: `v${i}`, points: [i * cellSize, 0, i * cellSize, totalHeight] });
		}
		// 수평선: 시각적 행 수 기준으로 그림
		for (let i = 0; i <= visualRowCount; i++) {
			lines.push({ key: `h${i}`, points: [0, i * cellSize, totalWidth, i * cellSize] });
		}
		return lines;
	}, [visualColCount, cellSize, totalHeight, totalWidth, visualRowCount]);

	const nonEmptyCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) => {
				const visualY = rowVisualYMap[rowIdx];
				if (visualY === null) return [];
				return row
					.flatMap((cell, colIdx) => {
						const visualX = colVisualXMap[colIdx];
						if (visualX === null) return [];
						return [{ cell, rowIdx, colIdx, visualY, visualX }];
					})
					.filter(
						(x): x is { cell: ChartCell & { symbolId: string }; rowIdx: number; colIdx: number; visualY: number; visualX: number } =>
							x.cell.symbolId !== null,
					);
			}),
		[cells, rowVisualYMap, colVisualXMap],
	);

	const coloredCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) => {
				const visualY = rowVisualYMap[rowIdx];
				if (visualY === null) return [];
				return row.flatMap((cell, colIdx) => {
					if (cell.color === null) return [];
					const visualX = colVisualXMap[colIdx];
					if (visualX === null) return [];
					return [{ color: cell.color, rowIdx, colIdx, visualY, visualX }];
				});
			}),
		[cells, rowVisualYMap, colVisualXMap],
	);

	// 시각적 행 인덱스(0-based) → 실제 데이터 행 인덱스 역매핑
	const visualToDataRowMap = useMemo(() => {
		const map: number[] = [];
		for (let rowIdx = 0; rowIdx < gridSize.rows; rowIdx++) {
			if (rowVisualYMap[rowIdx] !== null) {
				map.push(rowIdx);
			}
		}
		return map;
	}, [gridSize.rows, rowVisualYMap]);

	// 시각적 행 교차점 인덱스 → 데이터 행 교차점 인덱스 매핑
	// shape guide 그리기/지우기에서 마우스 위치를 올바른 데이터 행 좌표로 변환할 때 사용
	const visualToDataIntersectionMap = useMemo(
		() => buildVisualToDataIntersectionMap(collapsedBlocks, visualRowCount),
		[collapsedBlocks, visualRowCount],
	);

	// 시각적 열 교차점 인덱스 → 데이터 열 교차점 인덱스 매핑
	// shape guide 그리기/지우기에서 마우스 위치를 올바른 데이터 열 좌표로 변환할 때 사용
	const visualToDataColMap = useMemo(
		() => buildVisualToDataColIntersectionMap(collapsedColumnBlocks, visualColCount),
		[collapsedColumnBlocks, visualColCount],
	);

	// 레이어 기준 포인터 위치를 grid 교차점 좌표계(col, row)로 반환
	// row는 데이터 행 교차점 인덱스, col은 데이터 열 교차점 인덱스 (중략 블록을 반영한 역변환 적용)
	const getGridPointer = useCallback((): { col: number; row: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		// 시각적 교차점 인덱스를 데이터 열 교차점 인덱스로 변환
		const visualColIntersection = Math.max(0, Math.min(visualColCount, Math.round(pos.x / cellSize)));
		const col = visualToDataColMap[visualColIntersection] ?? visualColIntersection;
		// 시각적 교차점 인덱스를 데이터 행 교차점 인덱스로 변환
		const visualRowIntersection = Math.max(0, Math.min(visualRowCount, Math.round(pos.y / cellSize)));
		const row = visualToDataIntersectionMap[visualRowIntersection] ?? visualRowIntersection;
		// 활성 영역 체크 (grid 교차점 좌표 기준)
		const halfCols = Math.floor(gridSize.cols / 2);
		const halfRows = Math.floor(gridSize.rows / 2);
		if (rotationalMode === 'horizontal' && col > halfCols) return null;
		if (rotationalMode === 'vertical' && row > halfRows) return null;
		if (rotationalMode === 'both' && (col > halfCols || row > halfRows)) return null;
		return { col, row };
	}, [cellSize, gridSize, rotationalMode, visualRowCount, visualColCount, visualToDataIntersectionMap, visualToDataColMap]);

	const getCellFromPointer = useCallback((): { row: number; col: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		const visualCol = Math.floor(pos.x / cellSize);
		// 시각적 열 인덱스를 실제 데이터 열 인덱스로 변환
		const col = visualToDataColMap[visualCol] ?? -1;
		const visualRow = Math.floor(pos.y / cellSize);
		// 시각적 행 인덱스를 실제 데이터 행 인덱스로 변환
		const row = visualToDataRowMap[visualRow] ?? -1;
		if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
			if (rotationalMode === 'horizontal' && col >= Math.floor(gridSize.cols / 2)) return null;
			if (rotationalMode === 'vertical' && row >= Math.floor(gridSize.rows / 2)) return null;
			if (rotationalMode === 'both' && (col >= Math.floor(gridSize.cols / 2) || row >= Math.floor(gridSize.rows / 2)))
				return null;
			return { row, col };
		}
		return null;
	}, [gridSize, cellSize, rotationalMode, visualToDataRowMap, visualToDataColMap]);

	// 드래그 지우기: erase 세그먼트에 히트된 stroke 세그먼트만 부분 제거
	const erasePartialStrokes = useCallback(
		(ex1: number, ey1: number, ex2: number, ey2: number) => {
			const strokes = shapeGuideRef.current?.strokes;
			if (!strokes) return;
			// 대칭 모드에서 미러 지우기 세그먼트 생성
			const eraseSegments: [number, number, number, number][] = [[ex1, ey1, ex2, ey2]];
			if (rotationalMode !== 'none') {
				const cols = gridSize.cols;
				const rows = gridSize.rows;
				if (rotationalMode === 'horizontal' || rotationalMode === 'both') {
					eraseSegments.push([cols - ex1, ey1, cols - ex2, ey2]);
				}
				if (rotationalMode === 'vertical' || rotationalMode === 'both') {
					eraseSegments.push([ex1, rows - ey1, ex2, rows - ey2]);
				}
				if (rotationalMode === 'both') {
					eraseSegments.push([cols - ex1, rows - ey1, cols - ex2, rows - ey2]);
				}
			}
			for (let i = strokes.length - 1; i >= 0; i--) {
				let result = [strokes[i]];
				for (const [sex1, sey1, sex2, sey2] of eraseSegments) {
					result = result.flatMap((s) => splitStrokeByErasePath(s, sex1, sey1, sex2, sey2));
				}
				if (result.length !== 1 || result[0].length !== strokes[i].length) {
					onShapeGuideStrokeReplace?.(i, result);
				}
			}
		},
		[onShapeGuideStrokeReplace, rotationalMode, gridSize],
	);

	// 클릭(단일 점) 지우기: 해당 점 근방 stroke 세그먼트만 부분 제거
	const erasePartialStrokesNearPoint = useCallback(
		(px: number, py: number) => {
			const strokes = shapeGuideRef.current?.strokes;
			if (!strokes) return;
			const THRESHOLD_SQ = 0.7 * 0.7;
			// 대칭 모드에서 미러 점 생성
			const erasePoints: [number, number][] = [[px, py]];
			if (rotationalMode !== 'none') {
				const cols = gridSize.cols;
				const rows = gridSize.rows;
				if (rotationalMode === 'horizontal' || rotationalMode === 'both') {
					erasePoints.push([cols - px, py]);
				}
				if (rotationalMode === 'vertical' || rotationalMode === 'both') {
					erasePoints.push([px, rows - py]);
				}
				if (rotationalMode === 'both') {
					erasePoints.push([cols - px, rows - py]);
				}
			}
			for (let i = strokes.length - 1; i >= 0; i--) {
				let result = [strokes[i]];
				for (const [epx, epy] of erasePoints) {
					result = result.flatMap((s) => splitStrokeByPoint(s, epx, epy, THRESHOLD_SQ));
				}
				if (result.length !== 1 || result[0].length !== strokes[i].length) {
					onShapeGuideStrokeReplace?.(i, result);
				}
			}
		},
		[onShapeGuideStrokeReplace, rotationalMode, gridSize],
	);

	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (e.evt.button === 1 || (e.evt.button === 0 && isInSpacePanMode())) {
				e.evt.preventDefault();
				startMousePan(e.evt.clientX, e.evt.clientY);
				return;
			}
			if (e.evt.button === 0) {
				if (isSelectionMode) {
					const cell = getCellFromPointer();
					if (cell) {
						isSelectingRef.current = true;
						selectionAnchorRef.current = cell;
						onSelectionChange?.({ startRow: cell.row, startCol: cell.col, endRow: cell.row, endCol: cell.col });
					}
				} else if (isColorMode) {
					isPainting.current = true;
					onPaintStart?.();
					const cell = getCellFromPointer();
					if (cell) onCellColorPaint?.(cell.row, cell.col, selectedColor);
				} else if (isShapeGuideEraseMode) {
					const pt = getGridPointer();
					if (pt) {
						onShapeGuideEraseStart?.();
						isErasingGuide.current = true;
						const init = [pt.col, pt.row];
						currentEraseStrokeRef.current = init;
						setCurrentEraseStroke(init);
					}
				} else if (isShapeGuideDrawMode) {
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
		[
			getCellFromPointer,
			getGridPointer,
			onCellPaint,
			onCellColorPaint,
			onPaintStart,
			onShapeGuideEraseStart,
			startMousePan,
			isInSpacePanMode,
			isColorMode,
			isShapeGuideDrawMode,
			isShapeGuideEraseMode,
			isSelectionMode,
			onSelectionChange,
			selectedColor,
		],
	);

	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (updateMousePan(e.evt.clientX, e.evt.clientY)) return;
			if (isSelectionMode) {
				const cell = getCellFromPointer();
				setHoverCell(cell);
				if (isSelectingRef.current && cell && selectionAnchorRef.current) {
					const anchor = selectionAnchorRef.current;
					onSelectionChange?.({ startRow: anchor.row, startCol: anchor.col, endRow: cell.row, endCol: cell.col });
				}
			} else if (isShapeGuideEraseMode) {
				if (isErasingGuide.current) {
					const pt = getGridPointer();
					if (pt) {
						const prev = currentEraseStrokeRef.current;
						const lastCol = prev[prev.length - 2];
						const lastRow = prev[prev.length - 1];
						if (pt.col !== lastCol || pt.row !== lastRow) {
							erasePartialStrokes(lastCol, lastRow, pt.col, pt.row);
							const next = [...prev, pt.col, pt.row];
							currentEraseStrokeRef.current = next;
							setCurrentEraseStroke(next);
						}
					}
				}
			} else if (isShapeGuideDrawMode) {
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
			} else if (isColorMode) {
				const cell = getCellFromPointer();
				setHoverCell(cell);
				if (isPainting.current && cell) {
					onCellColorPaint?.(cell.row, cell.col, selectedColor);
				}
			} else {
				const cell = getCellFromPointer();
				setHoverCell(cell);
				if (isPainting.current && cell) {
					onCellPaint(cell.row, cell.col);
				}
			}
		},
		[
			getCellFromPointer,
			getGridPointer,
			onCellPaint,
			onCellColorPaint,
			updateMousePan,
			isColorMode,
			isShapeGuideDrawMode,
			isShapeGuideEraseMode,
			erasePartialStrokes,
			isSelectionMode,
			onSelectionChange,
			selectedColor,
		],
	);

	const finishEraseGesture = useCallback(() => {
		if (!isErasingGuide.current) return;
		// 드래그 없이 단일 클릭이면 근접 감지로 지우기
		const eraseStroke = currentEraseStrokeRef.current;
		if (eraseStroke.length === 2) {
			erasePartialStrokesNearPoint(eraseStroke[0], eraseStroke[1]);
		}
		isErasingGuide.current = false;
		currentEraseStrokeRef.current = [];
		setCurrentEraseStroke([]);
		onShapeGuideEraseEnd?.();
	}, [erasePartialStrokesNearPoint, onShapeGuideEraseEnd]);

	const handleMouseUp = useCallback(() => {
		if (isSelectionMode) {
			isSelectingRef.current = false;
			selectionAnchorRef.current = null;
		} else if (isShapeGuideEraseMode) {
			finishEraseGesture();
		} else if (isShapeGuideDrawMode) {
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
	}, [
		endMousePan,
		onPaintEnd,
		onShapeGuideStrokeAdd,
		isShapeGuideDrawMode,
		isShapeGuideEraseMode,
		currentStroke,
		finishEraseGesture,
		isSelectionMode,
	]);

	const handleMouseLeave = useCallback(() => {
		setHoverCell(null);
		if (isSelectionMode) {
			isSelectingRef.current = false;
			selectionAnchorRef.current = null;
		} else if (isShapeGuideEraseMode) {
			finishEraseGesture();
		} else if (isShapeGuideDrawMode) {
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
	}, [
		endMousePan,
		onPaintEnd,
		onShapeGuideStrokeAdd,
		isShapeGuideDrawMode,
		isShapeGuideEraseMode,
		currentStroke,
		finishEraseGesture,
		isSelectionMode,
	]);

	const cursor = isSpacePanning
		? 'grab'
		: isShapeGuideEraseMode
			? ERASER_CURSOR
			: isSelectionMode
				? 'default'
				: isColorMode
					? 'crosshair'
					: 'crosshair';

	const hasShapeGuide = shapeGuide && shapeGuide.strokes.length > 0;

	// IIFE 패턴 대신 조건 변수로 추출
	const hoverCellVisualY =
		hoverCell !== null && !isShapeGuideDrawMode && !isShapeGuideEraseMode && !isSelectionMode
			? rowVisualYMap[hoverCell.row]
			: undefined;

	const hoverCellVisualX =
		hoverCell !== null && !isShapeGuideDrawMode && !isShapeGuideEraseMode && !isSelectionMode
			? colVisualXMap[hoverCell.col]
			: undefined;

	const cellSelectionVisualBounds =
		isSelectionMode && cellSelection !== null
			? (() => {
					const minRow = Math.min(cellSelection.startRow, cellSelection.endRow);
					const maxRow = Math.max(cellSelection.startRow, cellSelection.endRow);
					const minCol = Math.min(cellSelection.startCol, cellSelection.endCol);
					const maxCol = Math.max(cellSelection.startCol, cellSelection.endCol);
					const topY = rowVisualYMap[minRow] ?? minRow * cellSize;
					const bottomY = rowVisualYMap[maxRow] ?? maxRow * cellSize;
					const leftX = colVisualXMap[minCol] ?? minCol * cellSize;
					const rightX = colVisualXMap[maxCol] ?? maxCol * cellSize;
					return { minRow, maxRow, minCol, maxCol, topY, bottomY, leftX, rightX };
				})()
			: null;

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
				<Rect
					x={0}
					y={0}
					width={totalWidth}
					height={totalHeight}
					fill="white"
				/>

				{coloredCells.map(({ color, rowIdx, colIdx, visualY, visualX }) => (
					<Rect
						key={`color-${rowIdx}-${colIdx}`}
						x={visualX}
						y={visualY}
						width={cellSize}
						height={cellSize}
						fill={color}
						listening={false}
					/>
				))}

				{gridLines.map(({ key, points }) => (
					<Line
						key={key}
						points={points}
						stroke="#d4d4d8"
						strokeWidth={0.5}
					/>
				))}

				{nonEmptyCells.map(({ cell, rowIdx, colIdx, visualY, visualX }) => (
					<Text
						key={`${rowIdx}-${colIdx}`}
						x={visualX}
						y={visualY}
						width={cellSize}
						height={cellSize}
						text={symbolsMap[cell.symbolId] ?? cell.symbolId}
						align="center"
						verticalAlign="middle"
						fontSize={Math.max(8, Math.floor(cellSize * 0.4))}
						fill="#1a1a1a"
					/>
				))}

				{/* 대칭 모드: 편집 불가 영역 disabled 오버레이 */}
				{(rotationalMode === 'horizontal' || rotationalMode === 'both') && (
					<Rect
						x={Math.floor(gridSize.cols / 2) * cellSize}
						y={0}
						width={totalWidth - Math.floor(gridSize.cols / 2) * cellSize}
						height={totalHeight}
						fill="rgba(0,0,0,0.06)"
						listening={false}
					/>
				)}
				{rotationalMode === 'vertical' && (
					<Rect
						x={0}
						y={Math.floor(gridSize.rows / 2) * cellSize}
						width={totalWidth}
						height={totalHeight - Math.floor(gridSize.rows / 2) * cellSize}
						fill="rgba(0,0,0,0.06)"
						listening={false}
					/>
				)}
				{rotationalMode === 'both' && (
					<Rect
						x={0}
						y={Math.floor(gridSize.rows / 2) * cellSize}
						width={Math.floor(gridSize.cols / 2) * cellSize}
						height={totalHeight - Math.floor(gridSize.rows / 2) * cellSize}
						fill="rgba(0,0,0,0.06)"
						listening={false}
					/>
				)}


				{/* 대칭 모드: 경계선 */}
				{(rotationalMode === 'horizontal' || rotationalMode === 'both') && (
					<Line
						points={[
							Math.floor(gridSize.cols / 2) * cellSize,
							0,
							Math.floor(gridSize.cols / 2) * cellSize,
							totalHeight,
						]}
						stroke="#ef4444"
						strokeWidth={1.5}
						dash={[4, 4]}
						listening={false}
					/>
				)}
				{(rotationalMode === 'vertical' || rotationalMode === 'both') && (
					<Line
						points={[0, Math.floor(gridSize.rows / 2) * cellSize, totalWidth, Math.floor(gridSize.rows / 2) * cellSize]}
						stroke="#ef4444"
						strokeWidth={1.5}
						dash={[4, 4]}
						listening={false}
					/>
				)}

				{hoverCell !== null && hoverCellVisualY !== null && hoverCellVisualY !== undefined && hoverCellVisualX !== null && hoverCellVisualX !== undefined && (
					<Rect
						x={hoverCellVisualX}
						y={hoverCellVisualY}
						width={cellSize}
						height={cellSize}
						fill={selectedSymbolAbbr ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.08)'}
						listening={false}
					/>
				)}

				{/* 붙여넣기 미리보기 */}
				{isSelectionMode &&
					clipboard &&
					hoverCell &&
					!cellSelection &&
					clipboard.flatMap((row, dr) =>
						row
							.flatMap((cell, dc) => {
								const r = hoverCell.row + dr;
								const c = hoverCell.col + dc;
								if (r >= gridSize.rows || c >= gridSize.cols) return [];
								const py = rowVisualYMap[r];
								if (py === null || py === undefined) return [];
								const px = colVisualXMap[c];
								if (px === null || px === undefined) return [];
								return [
									<Rect
										key={`paste-preview-${dr}-${dc}`}
										x={px}
										y={py}
										width={cellSize}
										height={cellSize}
										fill={cell.symbolId ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.1)'}
										listening={false}
									/>,
								];
							}),
					)}

				{/* 선택 영역 사각형 */}
				{cellSelectionVisualBounds !== null && (
					<Rect
						x={cellSelectionVisualBounds.leftX}
						y={cellSelectionVisualBounds.topY}
						width={cellSelectionVisualBounds.rightX - cellSelectionVisualBounds.leftX + cellSize}
						height={cellSelectionVisualBounds.bottomY - cellSelectionVisualBounds.topY + cellSize}
						stroke="rgba(59,130,246,0.9)"
						strokeWidth={2}
						fill="rgba(59,130,246,0.15)"
						dash={[4, 4]}
						listening={false}
					/>
				)}

				{/* 중략 행 렌더링 */}
				{collapsedBlockYMap.map(({ block, y }) => (
					<CollapsedRow
						key={block.id}
						block={block}
						y={y}
						width={totalWidth}
						cellSize={cellSize}
						totalRows={gridSize.rows}
						onClick={handleCollapsedRowClick}
					/>
				))}

				{/* 중략 열 렌더링 */}
				{collapsedColumnBlockXMap.map(({ block, x }) => (
					<CollapsedColumn
						key={block.id}
						block={block}
						x={x}
						height={totalHeight}
						cellSize={cellSize}
						totalCols={gridSize.cols}
						onClick={handleCollapsedColumnClick}
					/>
				))}
			</Layer>

			{(hasShapeGuide || currentStroke.length >= 4 || currentEraseStroke.length >= 4) && (
				<ShapeGuideLayer
					shapeGuide={shapeGuide ?? { strokes: [] }}
					currentStroke={currentStroke}
					eraseStroke={currentEraseStroke}
					cellSize={cellSize}
					transform={transform}
					selectedStrokeIndex={isShapeGuideDrawMode ? selectedStrokeIndex : null}
					onStrokeClick={handleStrokeClick}
					isDrawMode={isShapeGuideDrawMode}
					collapsedBlocks={collapsedBlocks ?? []}
				collapsedColumnBlocks={collapsedColumnBlocks ?? []}
				/>
			)}
		</Stage>
	);
});
