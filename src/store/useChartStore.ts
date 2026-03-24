import { create } from 'zustand';
import { ChartCell, GridSize, PatternType } from '@/types/knitting';

const DEFAULT_GRID_SIZE: GridSize = { rows: 20, cols: 20 };

function createEmptyGrid(rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => ({ symbolId: null })),
	);
}

function resizeGrid(prevCells: ChartCell[][], rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, (_, rowIdx) =>
		Array.from({ length: cols }, (_, colIdx) => prevCells[rowIdx]?.[colIdx] ?? { symbolId: null }),
	);
}

interface ChartState {
	cells: ChartCell[][];
	gridSize: GridSize;
	patternType: PatternType;
	setCellSymbol: (row: number, col: number, symbolId: string | null) => void;
	setGridSize: (gridSize: GridSize) => void;
	setPatternType: (patternType: PatternType) => void;
	reset: () => void;
}

const initialState = {
	cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
	gridSize: DEFAULT_GRID_SIZE,
	patternType: 'knitting' as PatternType,
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

	setGridSize: (gridSize) =>
		set((state) => ({
			gridSize,
			cells: resizeGrid(state.cells, gridSize.rows, gridSize.cols),
		})),

	setPatternType: (patternType) => set({ patternType }),

	reset: () =>
		set({
			cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
			gridSize: DEFAULT_GRID_SIZE,
			patternType: 'knitting',
		}),
}));
