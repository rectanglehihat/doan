import { create } from 'zustand';
import { ChartCell, GridSize, PatternType, RotationalMode } from '@/types/knitting';

const DEFAULT_GRID_SIZE: GridSize = { rows: 20, cols: 20 };
const DEFAULT_CELL_SIZE = 15;

function createEmptyGrid(rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ symbolId: null })));
}

function resizeGrid(prevCells: ChartCell[][], rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, (_, rowIdx) =>
		Array.from({ length: cols }, (_, colIdx) => prevCells[rowIdx]?.[colIdx] ?? { symbolId: null }),
	);
}

// 대칭 모드에서 외부 가장자리 기준으로 균등하게 추가/제거
function resizeGridSymmetric(
	prevCells: ChartCell[][],
	rows: number,
	cols: number,
	mode: RotationalMode,
): ChartCell[][] {
	const prevRows = prevCells.length;
	const prevCols = prevCells[0]?.length ?? 0;

	const rowOffset =
		mode === 'vertical' || mode === 'both' ? Math.trunc((rows - prevRows) / 2) : 0;
	const colOffset =
		mode === 'horizontal' || mode === 'both' ? Math.trunc((cols - prevCols) / 2) : 0;

	return Array.from({ length: rows }, (_, rowIdx) =>
		Array.from({ length: cols }, (_, colIdx) => {
			const srcRow = rowIdx - rowOffset;
			const srcCol = colIdx - colOffset;
			return prevCells[srcRow]?.[srcCol] ?? { symbolId: null };
		}),
	);
}

interface ChartState {
	cells: ChartCell[][];
	gridSize: GridSize;
	cellSize: number;
	patternType: PatternType;
	patternTitle: string;
	setCellSymbol: (row: number, col: number, symbolId: string | null) => void;
	setCells: (cells: ChartCell[][]) => void;
	setGridSize: (gridSize: GridSize) => void;
	setGridSizeSymmetric: (gridSize: GridSize, mode: RotationalMode) => void;
	setCellSize: (cellSize: number) => void;
	setPatternType: (patternType: PatternType) => void;
	setPatternTitle: (patternTitle: string) => void;
	reset: () => void;
}

const initialState = {
	cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
	gridSize: DEFAULT_GRID_SIZE,
	cellSize: DEFAULT_CELL_SIZE,
	patternType: 'knitting' as PatternType,
	patternTitle: '',
};

export const useChartStore = create<ChartState>((set) => ({
	...initialState,

	setCellSymbol: (row, col, symbolId) =>
		set((state) => {
			const cells = state.cells.map((r, rIdx) =>
				r.map((cell, cIdx) => (rIdx === row && cIdx === col ? { symbolId } : cell)),
			);
			return { cells };
		}),

	setCells: (cells) => set({ cells }),

	setGridSize: (gridSize) =>
		set((state) => ({
			gridSize,
			cells: resizeGrid(state.cells, gridSize.rows, gridSize.cols),
		})),

	setGridSizeSymmetric: (gridSize, mode) =>
		set((state) => ({
			gridSize,
			cells: resizeGridSymmetric(state.cells, gridSize.rows, gridSize.cols, mode),
		})),

	setCellSize: (cellSize) => set({ cellSize }),

	setPatternType: (patternType) => set({ patternType }),

	setPatternTitle: (patternTitle) => set({ patternTitle }),

	reset: () =>
		set({
			cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
			gridSize: DEFAULT_GRID_SIZE,
			cellSize: DEFAULT_CELL_SIZE,
			patternType: 'knitting',
			patternTitle: '',
		}),
}));
