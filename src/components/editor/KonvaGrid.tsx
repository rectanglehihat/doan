'use client';

import { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation';
import { useVisualCoordinates } from '@/hooks/useVisualCoordinates';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { useViewportCulling } from '@/hooks/useViewportCulling';
import { calcErasePartialStrokes, calcErasePartialStrokesNearPoint } from '@/lib/utils/eraser';
import { ShapeGuideLayer } from './ShapeGuideLayer';
import { CollapsedRow } from './CollapsedRow';
import { CollapsedColumn } from './CollapsedColumn';
import { AnnotationLayer } from './AnnotationLayer';
import type { KonvaGridProps } from '@/types/konva-grid';

export type { KonvaGridProps };

// 지우개 커서 SVG (20×20, hotspot 10,18)
const ERASER_CURSOR =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E" +
	"%3Crect x='2' y='10' width='16' height='8' rx='2' fill='%23fde68a' stroke='%23d97706' stroke-width='1.5'/%3E" +
	"%3Crect x='2' y='10' width='8' height='8' rx='2' fill='white' stroke='%23d97706' stroke-width='1.5'/%3E" +
	'%3C/svg%3E") 10 18, cell';

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
	onCellColorPaint,
	rowAnnotations = [],
	isAnnotationMode = false,
	annotationSideWidth = 80,
	onAnnotationAreaClick,
	rangeAnnotations = [],
	rangeAnnotationDraft = null,
	onRangeBracketClick,
	onRangeDragStart,
	onRangeDragMove,
	onRangeDragEnd,
}: KonvaGridProps) {
	const stageRef = useRef<Konva.Stage>(null);
	const layerRef = useRef<Konva.Layer>(null);
	const isPainting = useRef(false);
	const isDrawingGuide = useRef(false);
	const isErasingGuide = useRef(false);
	const [currentStroke, setCurrentStroke] = useState<number[]>([]);
	const [currentEraseStroke, setCurrentEraseStroke] = useState<number[]>([]);
	const currentEraseStrokeRef = useRef<number[]>([]);

	// externalStageRef 동기화
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
		fitToScreen,
	} = useCanvasNavigation(stageRef);

	// 'doan:fit-to-screen' 커스텀 이벤트
	useEffect(() => {
		const handleFitToScreenEvent = () => {
			fitToScreen(stageWidth, stageHeight, gridSize.cols * cellSize, gridSize.rows * cellSize);
		};
		window.addEventListener('doan:fit-to-screen', handleFitToScreenEvent);
		return () => window.removeEventListener('doan:fit-to-screen', handleFitToScreenEvent);
	}, [fitToScreen, stageWidth, stageHeight, gridSize, cellSize]);

	const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
	const hoverCellRef = useRef<{ row: number; col: number } | null>(null);
	useEffect(() => {
		hoverCellRef.current = hoverCell;
	}, [hoverCell]);

	const isSelectingRef = useRef(false);
	const selectionAnchorRef = useRef<{ row: number; col: number } | null>(null);

	const {
		visualRowCount,
		visualColCount,
		totalWidth,
		totalHeight,
		rowVisualYMap,
		colVisualXMap,
		collapsedBlockYMap,
		collapsedColumnBlockXMap,
		getGridPointer,
		getCellFromPointer,
	} = useVisualCoordinates({
		gridSize,
		cellSize,
		collapsedBlocks,
		collapsedColumnBlocks,
		rotationalMode,
		layerRef,
	});

	const { selectedStrokeIndex, setSelectedStrokeIndex, handleStrokeClick } = useEditorShortcuts({
		fitToScreen,
		stageWidth,
		stageHeight,
		gridSize,
		cellSize,
		isShapeGuideDrawMode,
		onShapeGuideStrokeRemove,
		isSelectionMode,
		cellSelection,
		onSelectionChange,
		onCopySelection,
		onPasteClipboard,
		hoverCellRef,
	});

	// 뷰포트에 보이는 행/열 인덱스 범위 (3셀 버퍼 포함)
	const { startRow, endRow, startCol, endCol } = useViewportCulling({
		transform,
		stageWidth,
		stageHeight,
		cellSize,
		totalRows: gridSize.rows,
		totalCols: gridSize.cols,
	});

	const gridLines = useMemo(() => {
		const lines: { key: string; points: number[] }[] = [];
		for (let i = 0; i <= visualColCount; i++) {
			if (i < startCol || i > endCol) continue;
			lines.push({ key: `v${i}`, points: [i * cellSize, 0, i * cellSize, totalHeight] });
		}
		for (let i = 0; i <= visualRowCount; i++) {
			if (i < startRow || i > endRow) continue;
			lines.push({ key: `h${i}`, points: [0, i * cellSize, totalWidth, i * cellSize] });
		}
		return lines;
	}, [visualColCount, cellSize, totalHeight, totalWidth, visualRowCount, startRow, endRow, startCol, endCol]);

	const nonEmptyCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) => {
				const visualY = rowVisualYMap[rowIdx];
				if (visualY === null) return [];
				const visualRowIdx = Math.floor(visualY / cellSize);
				if (visualRowIdx < startRow || visualRowIdx > endRow) return [];
				return row
					.flatMap((cell, colIdx) => {
						const visualX = colVisualXMap[colIdx];
						if (visualX === null) return [];
						const visualColIdx = Math.floor(visualX / cellSize);
						if (visualColIdx < startCol || visualColIdx > endCol) return [];
						return [{ cell, rowIdx, colIdx, visualY, visualX }];
					})
					.filter(
						(x): x is { cell: (typeof cells)[0][0] & { symbolId: string }; rowIdx: number; colIdx: number; visualY: number; visualX: number } =>
							x.cell.symbolId !== null,
					);
			}),
		[cells, rowVisualYMap, colVisualXMap, cellSize, startRow, endRow, startCol, endCol],
	);

	const coloredCells = useMemo(
		() =>
			cells.flatMap((row, rowIdx) => {
				const visualY = rowVisualYMap[rowIdx];
				if (visualY === null) return [];
				const visualRowIdx = Math.floor(visualY / cellSize);
				if (visualRowIdx < startRow || visualRowIdx > endRow) return [];
				return row.flatMap((cell, colIdx) => {
					if (cell.color === null) return [];
					const visualX = colVisualXMap[colIdx];
					if (visualX === null) return [];
					const visualColIdx = Math.floor(visualX / cellSize);
					if (visualColIdx < startCol || visualColIdx > endCol) return [];
					return [{ color: cell.color, rowIdx, colIdx, visualY, visualX }];
				});
			}),
		[cells, rowVisualYMap, colVisualXMap, cellSize, startRow, endRow, startCol, endCol],
	);

	// 드래그 지우기
	const erasePartialStrokes = useCallback(
		(ex1: number, ey1: number, ex2: number, ey2: number) => {
			const strokes = shapeGuideRef.current?.strokes;
			if (!strokes) return;
			const results = calcErasePartialStrokes(strokes, ex1, ey1, ex2, ey2, rotationalMode, gridSize.cols, gridSize.rows);
			results.forEach(({ index, newStrokes }) => onShapeGuideStrokeReplace?.(index, newStrokes));
		},
		[onShapeGuideStrokeReplace, rotationalMode, gridSize],
	);

	// 클릭 지우기
	const erasePartialStrokesNearPoint = useCallback(
		(px: number, py: number) => {
			const strokes = shapeGuideRef.current?.strokes;
			if (!strokes) return;
			const results = calcErasePartialStrokesNearPoint(strokes, px, py, rotationalMode, gridSize.cols, gridSize.rows);
			results.forEach(({ index, newStrokes }) => onShapeGuideStrokeReplace?.(index, newStrokes));
		},
		[onShapeGuideStrokeReplace, rotationalMode, gridSize],
	);

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

	const handleAnnotationMarkerClick = useCallback(
		(rowIndex: number, anchorX: number, anchorY: number, existingId: string | null) => {
			onAnnotationAreaClick?.(rowIndex, 'right', anchorX, anchorY, existingId);
		},
		[onAnnotationAreaClick],
	);

	const handleAnnotationSideAreaClick = useCallback(
		(rowIndex: number, anchorX: number, anchorY: number) => {
			// SideHitArea는 주석 없는 행에만 렌더링되므로 항상 신규 생성(existingId = null)
			onAnnotationAreaClick?.(rowIndex, 'right', anchorX, anchorY, null);
		},
		[onAnnotationAreaClick],
	);

	// Stage Y 좌표를 논리 rowIndex로 변환 (0 ~ rows-1 클램핑)
	const getRowIndexFromStageY = useCallback(
		(stageY: number): number => {
			const paddingTop = 0;
			const rawIndex = Math.floor((stageY - paddingTop) / cellSize);
			return Math.max(0, Math.min(gridSize.rows - 1, rawIndex));
		},
		[cellSize, gridSize.rows],
	);

	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (e.evt.button === 1 || (e.evt.button === 0 && isInSpacePanMode())) {
				e.evt.preventDefault();
				startMousePan(e.evt.clientX, e.evt.clientY);
				return;
			}
			if (e.evt.button === 0) {
				if (isAnnotationMode) {
					return;
				}
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
					if (cell) onCellColorPaint?.(cell.row, cell.col);
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
			isAnnotationMode,
			isColorMode,
			isShapeGuideDrawMode,
			isShapeGuideEraseMode,
			isSelectionMode,
			onSelectionChange,
			setSelectedStrokeIndex,
		],
	);

	const finishEraseGesture = useCallback(() => {
		if (!isErasingGuide.current) return;
		const eraseStroke = currentEraseStrokeRef.current;
		if (eraseStroke.length === 2) {
			erasePartialStrokesNearPoint(eraseStroke[0], eraseStroke[1]);
		}
		isErasingGuide.current = false;
		currentEraseStrokeRef.current = [];
		setCurrentEraseStroke([]);
		onShapeGuideEraseEnd?.();
	}, [erasePartialStrokesNearPoint, onShapeGuideEraseEnd]);

	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (updateMousePan(e.evt.clientX, e.evt.clientY)) return;
			if (isAnnotationMode && onRangeDragMove) {
				const stage = stageRef.current;
				if (stage) {
					const pointer = stage.getPointerPosition();
					if (pointer) {
						const layerY = (pointer.y - transform.y) / transform.scale;
						const rowIndex = getRowIndexFromStageY(layerY);
						onRangeDragMove(rowIndex);
					}
				}
			}
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
					onCellColorPaint?.(cell.row, cell.col);
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
			isAnnotationMode,
			onRangeDragMove,
			transform,
			getRowIndexFromStageY,
		],
	);

	const handleMouseUp = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			if (isAnnotationMode && onRangeDragEnd) {
				const nativeEvt: MouseEvent | undefined = e.evt;
				onRangeDragEnd(nativeEvt?.clientX ?? 0, nativeEvt?.clientY ?? 0);
			}
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
		},
		[
			endMousePan,
			onPaintEnd,
			onShapeGuideStrokeAdd,
			isShapeGuideDrawMode,
			isShapeGuideEraseMode,
			currentStroke,
			finishEraseGesture,
			isSelectionMode,
			isAnnotationMode,
			onRangeDragEnd,
		],
	);

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
	}, [endMousePan, onPaintEnd, onShapeGuideStrokeAdd, isShapeGuideDrawMode, isShapeGuideEraseMode, currentStroke, finishEraseGesture, isSelectionMode]);

	const cursor = isSpacePanning
		? 'grab'
		: isShapeGuideEraseMode
			? ERASER_CURSOR
			: isSelectionMode
				? 'default'
				: 'crosshair';

	const hasShapeGuide = shapeGuide && shapeGuide.strokes.length > 0;

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
			{/* Layer 1: 정적 콘텐츠 — 그리드, 셀, 대칭 오버레이 */}
			<Layer
				ref={layerRef}
				listening={false}
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

				{/* 대칭 모드: 편집 불가 영역 오버레이 */}
				{(rotationalMode === 'horizontal' || rotationalMode === 'both') && (
					<Rect
						x={Math.floor(gridSize.cols / 2) * cellSize}
						y={0}
						width={totalWidth - Math.floor(gridSize.cols / 2) * cellSize}
						height={totalHeight}
						fill="rgba(0,0,0,0.06)"
					/>
				)}
				{rotationalMode === 'vertical' && (
					<Rect
						x={0}
						y={Math.floor(gridSize.rows / 2) * cellSize}
						width={totalWidth}
						height={totalHeight - Math.floor(gridSize.rows / 2) * cellSize}
						fill="rgba(0,0,0,0.06)"
					/>
				)}
				{rotationalMode === 'both' && (
					<Rect
						x={0}
						y={Math.floor(gridSize.rows / 2) * cellSize}
						width={Math.floor(gridSize.cols / 2) * cellSize}
						height={totalHeight - Math.floor(gridSize.rows / 2) * cellSize}
						fill="rgba(0,0,0,0.06)"
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
					/>
				)}
				{(rotationalMode === 'vertical' || rotationalMode === 'both') && (
					<Line
						points={[0, Math.floor(gridSize.rows / 2) * cellSize, totalWidth, Math.floor(gridSize.rows / 2) * cellSize]}
						stroke="#ef4444"
						strokeWidth={1.5}
						dash={[4, 4]}
					/>
				)}
			</Layer>

			{/* Layer 2: 동적 UI — hover, 선택, 붙여넣기 미리보기 (마우스 이동마다 갱신) */}
			<Layer
				listening={false}
				x={transform.x}
				y={transform.y}
				scaleX={transform.scale}
				scaleY={transform.scale}
			>
				{hoverCell !== null && hoverCellVisualY !== null && hoverCellVisualY !== undefined && hoverCellVisualX !== null && hoverCellVisualX !== undefined && (
					<Rect
						x={hoverCellVisualX}
						y={hoverCellVisualY}
						width={cellSize}
						height={cellSize}
						fill={selectedSymbolAbbr ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.08)'}
					/>
				)}

				{/* 붙여넣기 미리보기 */}
				{isSelectionMode &&
					clipboard &&
					hoverCell &&
					!cellSelection &&
					clipboard.flatMap((row, dr) =>
						row.flatMap((cell, dc) => {
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
					/>
				)}
			</Layer>

			{/* Layer 3: 중략 컴포넌트 — onClick 이벤트가 있어 listening 기본값(true) 유지 */}
			<Layer
				x={transform.x}
				y={transform.y}
				scaleX={transform.scale}
				scaleY={transform.scale}
			>
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

			{/* Layer 4: 주석 레이어 — 행 주석 마커, 클릭 히트 영역, 범위 브라켓 */}
			<AnnotationLayer
				rowAnnotations={rowAnnotations}
				rowVisualYMap={rowVisualYMap}
				totalWidth={totalWidth}
				cellSize={cellSize}
				annotationSideWidth={annotationSideWidth}
				isAnnotationMode={isAnnotationMode}
				totalRows={gridSize.rows}
				transform={transform}
				onMarkerClick={handleAnnotationMarkerClick}
				onSideAreaClick={handleAnnotationSideAreaClick}
				rangeAnnotations={rangeAnnotations}
				rangeAnnotationDraft={rangeAnnotationDraft}
				onRangeBracketClick={onRangeBracketClick}
				onRangeDragStart={onRangeDragStart}
			/>

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

