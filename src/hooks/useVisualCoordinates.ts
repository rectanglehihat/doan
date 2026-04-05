import { useCallback, useMemo } from 'react';
import type Konva from 'konva';
import type { CollapsedBlock, CollapsedColumnBlock, GridSize, RotationalMode } from '@/types/knitting';
import {
	buildRowVisualYMap,
	buildVisualToDataIntersectionMap,
	calcVisualRowCount,
	getCollapsedBlockVisualY,
} from '@/lib/utils/collapsed-rows';
import {
	buildColVisualXMap,
	buildVisualToDataColIntersectionMap,
	calcVisualColCount,
	getCollapsedColumnBlockVisualX,
} from '@/lib/utils/collapsed-cols';

export interface UseVisualCoordinatesOptions {
	gridSize: GridSize;
	cellSize: number;
	collapsedBlocks: CollapsedBlock[];
	collapsedColumnBlocks: CollapsedColumnBlock[];
	rotationalMode: RotationalMode;
	layerRef: React.RefObject<Konva.Layer | null>;
}

export interface UseVisualCoordinatesReturn {
	visualRowCount: number;
	visualColCount: number;
	totalWidth: number;
	totalHeight: number;
	rowVisualYMap: (number | null)[];
	colVisualXMap: (number | null)[];
	collapsedBlockYMap: { block: CollapsedBlock; y: number }[];
	collapsedColumnBlockXMap: { block: CollapsedColumnBlock; x: number }[];
	visualToDataRowMap: number[];
	visualToDataIntersectionMap: number[];
	visualToDataColMap: number[];
	getGridPointer: () => { col: number; row: number } | null;
	getCellFromPointer: () => { row: number; col: number } | null;
}

export function useVisualCoordinates({
	gridSize,
	cellSize,
	collapsedBlocks,
	collapsedColumnBlocks,
	rotationalMode,
	layerRef,
}: UseVisualCoordinatesOptions): UseVisualCoordinatesReturn {
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

	const rowVisualYMap = useMemo(
		() => buildRowVisualYMap(collapsedBlocks, gridSize.rows, cellSize),
		[collapsedBlocks, gridSize.rows, cellSize],
	);

	const colVisualXMap = useMemo(
		() => buildColVisualXMap(collapsedColumnBlocks, gridSize.cols, cellSize),
		[collapsedColumnBlocks, gridSize.cols, cellSize],
	);

	const collapsedBlockYMap = useMemo(
		() => collapsedBlocks.map((block) => ({ block, y: getCollapsedBlockVisualY(block, collapsedBlocks, cellSize) })),
		[collapsedBlocks, cellSize],
	);

	const collapsedColumnBlockXMap = useMemo(
		() =>
			collapsedColumnBlocks.map((block) => ({
				block,
				x: getCollapsedColumnBlockVisualX(block, collapsedColumnBlocks, cellSize),
			})),
		[collapsedColumnBlocks, cellSize],
	);

	const visualToDataRowMap = useMemo(() => {
		const map: number[] = [];
		for (let rowIdx = 0; rowIdx < gridSize.rows; rowIdx++) {
			if (rowVisualYMap[rowIdx] !== null) {
				map.push(rowIdx);
			}
		}
		return map;
	}, [gridSize.rows, rowVisualYMap]);

	const visualToDataIntersectionMap = useMemo(
		() => buildVisualToDataIntersectionMap(collapsedBlocks, visualRowCount),
		[collapsedBlocks, visualRowCount],
	);

	const visualToDataColMap = useMemo(
		() => buildVisualToDataColIntersectionMap(collapsedColumnBlocks, visualColCount),
		[collapsedColumnBlocks, visualColCount],
	);

	const getGridPointer = useCallback((): { col: number; row: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		const visualColIntersection = Math.max(0, Math.min(visualColCount, Math.round(pos.x / cellSize)));
		const col = visualToDataColMap[visualColIntersection] ?? visualColIntersection;
		const visualRowIntersection = Math.max(0, Math.min(visualRowCount, Math.round(pos.y / cellSize)));
		const row = visualToDataIntersectionMap[visualRowIntersection] ?? visualRowIntersection;
		const halfCols = Math.floor(gridSize.cols / 2);
		const halfRows = Math.floor(gridSize.rows / 2);
		if (rotationalMode === 'horizontal' && col > halfCols) return null;
		if (rotationalMode === 'vertical' && row > halfRows) return null;
		if (rotationalMode === 'both' && (col > halfCols || row > halfRows)) return null;
		return { col, row };
	}, [cellSize, gridSize, rotationalMode, visualRowCount, visualColCount, visualToDataIntersectionMap, visualToDataColMap, layerRef]);

	const getCellFromPointer = useCallback((): { row: number; col: number } | null => {
		const layer = layerRef.current;
		if (!layer) return null;
		const pos = layer.getRelativePointerPosition();
		if (!pos) return null;
		const visualCol = Math.floor(pos.x / cellSize);
		const col = visualToDataColMap[visualCol] ?? -1;
		const visualRow = Math.floor(pos.y / cellSize);
		const row = visualToDataRowMap[visualRow] ?? -1;
		if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
			if (rotationalMode === 'horizontal' && col >= Math.floor(gridSize.cols / 2)) return null;
			if (rotationalMode === 'vertical' && row >= Math.floor(gridSize.rows / 2)) return null;
			if (rotationalMode === 'both' && (col >= Math.floor(gridSize.cols / 2) || row >= Math.floor(gridSize.rows / 2)))
				return null;
			return { row, col };
		}
		return null;
	}, [gridSize, cellSize, rotationalMode, visualToDataRowMap, visualToDataColMap, layerRef]);

	return {
		visualRowCount,
		visualColCount,
		totalWidth,
		totalHeight,
		rowVisualYMap,
		colVisualXMap,
		collapsedBlockYMap,
		collapsedColumnBlockXMap,
		visualToDataRowMap,
		visualToDataIntersectionMap,
		visualToDataColMap,
		getGridPointer,
		getCellFromPointer,
	};
}
