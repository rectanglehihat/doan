import { useMemo } from 'react';

interface ViewportCullingInput {
	transform: { scale: number; x: number; y: number };
	stageWidth: number;
	stageHeight: number;
	cellSize: number;
	totalRows: number;
	totalCols: number;
	bufferCells?: number;
}

interface ViewportRange {
	startRow: number;
	endRow: number;
	startCol: number;
	endCol: number;
}

export function useViewportCulling(input: ViewportCullingInput): ViewportRange {
	const {
		transform,
		stageWidth,
		stageHeight,
		cellSize,
		totalRows,
		totalCols,
		bufferCells = 3,
	} = input;

	return useMemo<ViewportRange>(() => {
		if (stageWidth === 0 || stageHeight === 0) {
			return { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };
		}

		const { scale, x, y } = transform;

		const visibleXStart = (0 - x) / scale;
		const visibleXEnd = (stageWidth - x) / scale;
		const visibleYStart = (0 - y) / scale;
		const visibleYEnd = (stageHeight - y) / scale;

		const rawStartCol = Math.floor(visibleXStart / cellSize) - bufferCells;
		const rawEndCol = Math.floor(visibleXEnd / cellSize) + bufferCells;
		const rawStartRow = Math.floor(visibleYStart / cellSize) - bufferCells;
		const rawEndRow = Math.floor(visibleYEnd / cellSize) + bufferCells;

		const startCol = Math.max(0, rawStartCol);
		const endCol = Math.min(totalCols - 1, rawEndCol);
		const startRow = Math.max(0, rawStartRow);
		const endRow = Math.min(totalRows - 1, rawEndRow);

		return { startRow, endRow, startCol, endCol };
	}, [transform, stageWidth, stageHeight, cellSize, totalRows, totalCols, bufferCells]);
}
