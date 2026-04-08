import { create } from 'zustand';
import { AnnotationSide, RangeAnnotation, RowAnnotation } from '@/types/annotation';
import { ChartCell, CollapsedBlock, CollapsedColumnBlock, GridSize, PatternType, RotationalMode } from '@/types/knitting';

const DEFAULT_GRID_SIZE: GridSize = { rows: 20, cols: 20 };
const DEFAULT_CELL_SIZE = 15;

function createEmptyGrid(rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ symbolId: null, color: null })));
}

function resizeGrid(prevCells: ChartCell[][], rows: number, cols: number): ChartCell[][] {
	return Array.from({ length: rows }, (_, rowIdx) =>
		Array.from({ length: cols }, (_, colIdx) => prevCells[rowIdx]?.[colIdx] ?? { symbolId: null, color: null }),
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
			return prevCells[srcRow]?.[srcCol] ?? { symbolId: null, color: null };
		}),
	);
}

export interface ChartState {
	cells: ChartCell[][];
	gridSize: GridSize;
	cellSize: number;
	patternType: PatternType;
	patternTitle: string;
	collapsedBlocks: CollapsedBlock[];
	collapsedColumnBlocks: CollapsedColumnBlock[];
	setCellSymbol: (row: number, col: number, symbolId: string | null) => void;
	setCellColor: (row: number, col: number, color: string | null) => void;
	clearAllColors: () => void;
	setCells: (cells: ChartCell[][]) => void;
	setGridSize: (gridSize: GridSize) => void;
	setGridSizeSymmetric: (gridSize: GridSize, mode: RotationalMode) => void;
	setCellSize: (cellSize: number) => void;
	setPatternType: (patternType: PatternType) => void;
	setPatternTitle: (patternTitle: string) => void;
	difficulty: number;
	materials: string;
	setCollapsedBlocks: (blocks: CollapsedBlock[]) => void;
	setCellsAndBlocks: (cells: ChartCell[][], blocks: CollapsedBlock[], columnBlocks?: CollapsedColumnBlock[], gridSize?: GridSize) => void;
	addCollapsedBlock: (startRow: number, endRow: number) => void;
	removeCollapsedBlock: (id: string) => void;
	addCollapsedColumnBlock: (startCol: number, endCol: number) => void;
	removeCollapsedColumnBlock: (id: string) => void;
	setCollapsedColumnBlocks: (blocks: CollapsedColumnBlock[]) => void;
	setDifficulty: (difficulty: number) => void;
	setMaterials: (materials: string) => void;
	rowAnnotations: RowAnnotation[];
	addRowAnnotation: (rowIndex: number, label: string, side: AnnotationSide) => void;
	updateRowAnnotation: (id: string, label: string) => void;
	removeRowAnnotation: (id: string) => void;
	rangeAnnotations: RangeAnnotation[];
	addRangeAnnotation: (startRow: number, endRow: number, text: string) => void;
	updateRangeAnnotation: (id: string, text: string) => void;
	removeRangeAnnotation: (id: string) => void;
	restoreSnapshot: (
		cells: ChartCell[][],
		gridSize: GridSize,
		patternType: PatternType,
		patternTitle: string,
		collapsedBlocks: CollapsedBlock[],
		difficulty: number,
		materials: string,
		collapsedColumnBlocks?: CollapsedColumnBlock[],
		rowAnnotations?: RowAnnotation[],
		rangeAnnotations?: RangeAnnotation[],
	) => void;
	reset: () => void;
}

const initialState = {
	cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
	gridSize: DEFAULT_GRID_SIZE,
	cellSize: DEFAULT_CELL_SIZE,
	patternType: 'knitting',
	patternTitle: '',
	collapsedBlocks: [],
	collapsedColumnBlocks: [],
	difficulty: 0,
	materials: '',
	rowAnnotations: [],
	rangeAnnotations: [],
} satisfies {
	cells: ChartCell[][];
	gridSize: GridSize;
	cellSize: number;
	patternType: PatternType;
	patternTitle: string;
	collapsedBlocks: CollapsedBlock[];
	collapsedColumnBlocks: CollapsedColumnBlock[];
	difficulty: number;
	materials: string;
	rowAnnotations: RowAnnotation[];
	rangeAnnotations: RangeAnnotation[];
};

export const useChartStore = create<ChartState>((set, get) => ({
	...initialState,

	setCellSymbol: (row, col, symbolId) =>
		set((state) => {
			const cells = state.cells.map((r, rIdx) =>
				r.map((cell, cIdx) => (rIdx === row && cIdx === col ? { ...cell, symbolId } : cell)),
			);
			return { cells };
		}),

	setCellColor: (row, col, color) =>
		set((state) => {
			const cells = state.cells.map((r, rIdx) =>
				r.map((cell, cIdx) => (rIdx === row && cIdx === col ? { ...cell, color } : cell)),
			);
			return { cells };
		}),

	clearAllColors: () =>
		set((state) => ({
			cells: state.cells.map((row) => row.map((cell) => ({ ...cell, color: null }))),
		})),

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

	setCollapsedBlocks: (blocks) => set({ collapsedBlocks: blocks }),

	setCellsAndBlocks: (cells, blocks, columnBlocks, gridSize) =>
		set({
			cells,
			collapsedBlocks: blocks,
			...(columnBlocks !== undefined ? { collapsedColumnBlocks: columnBlocks } : {}),
			...(gridSize !== undefined ? { gridSize } : {}),
		}),

	addCollapsedBlock: (startRow, endRow) => {
		if (startRow >= endRow) {
			throw new Error('startRow는 endRow보다 작아야 합니다');
		}
		const { collapsedBlocks } = get();
		const overlapping = collapsedBlocks.some(
			(block) => startRow <= block.endRow && endRow >= block.startRow,
		);
		if (overlapping) {
			throw new Error('이미 중략된 범위와 겹칩니다');
		}
		const newBlock: CollapsedBlock = {
			id: crypto.randomUUID(),
			startRow,
			endRow,
		};
		set((state) => ({ collapsedBlocks: [...state.collapsedBlocks, newBlock] }));
	},

	removeCollapsedBlock: (id) =>
		set((state) => ({
			collapsedBlocks: state.collapsedBlocks.filter((block) => block.id !== id),
		})),

	setCollapsedColumnBlocks: (blocks) => set({ collapsedColumnBlocks: blocks }),

	addCollapsedColumnBlock: (startCol, endCol) => {
		if (startCol >= endCol) {
			throw new Error('startCol는 endCol보다 작아야 합니다');
		}
		const { collapsedColumnBlocks } = get();
		const overlapping = collapsedColumnBlocks.some(
			(block) => startCol <= block.endCol && endCol >= block.startCol,
		);
		if (overlapping) {
			throw new Error('이미 중략된 범위와 겹칩니다');
		}
		const newBlock: CollapsedColumnBlock = {
			id: crypto.randomUUID(),
			startCol,
			endCol,
		};
		set((state) => ({ collapsedColumnBlocks: [...state.collapsedColumnBlocks, newBlock] }));
	},

	removeCollapsedColumnBlock: (id) =>
		set((state) => ({
			collapsedColumnBlocks: state.collapsedColumnBlocks.filter((block) => block.id !== id),
		})),

	setDifficulty: (difficulty) => set({ difficulty }),

	setMaterials: (materials) => set({ materials }),

	addRowAnnotation: (rowIndex, label, side) => {
		const newAnnotation: RowAnnotation = {
			id: crypto.randomUUID(),
			rowIndex,
			label,
			side,
		};
		set((state) => ({ rowAnnotations: [...state.rowAnnotations, newAnnotation] }));
	},

	updateRowAnnotation: (id, label) =>
		set((state) => ({
			rowAnnotations: state.rowAnnotations.map((annotation) =>
				annotation.id === id ? { ...annotation, label } : annotation,
			),
		})),

	removeRowAnnotation: (id) =>
		set((state) => ({
			rowAnnotations: state.rowAnnotations.filter((annotation) => annotation.id !== id),
		})),

	addRangeAnnotation: (startRow, endRow, text) => {
		const newAnnotation: RangeAnnotation = {
			id: crypto.randomUUID(),
			startRow,
			endRow,
			text,
		};
		set((state) => ({ rangeAnnotations: [...state.rangeAnnotations, newAnnotation] }));
	},

	updateRangeAnnotation: (id, text) =>
		set((state) => ({
			rangeAnnotations: state.rangeAnnotations.map((annotation) =>
				annotation.id === id ? { ...annotation, text } : annotation,
			),
		})),

	removeRangeAnnotation: (id) =>
		set((state) => ({
			rangeAnnotations: state.rangeAnnotations.filter((annotation) => annotation.id !== id),
		})),

	restoreSnapshot: (cells, gridSize, patternType, patternTitle, collapsedBlocks, difficulty, materials, collapsedColumnBlocks, rowAnnotations, rangeAnnotations) =>
		set({ cells, gridSize, patternType, patternTitle, collapsedBlocks, difficulty, materials, collapsedColumnBlocks: collapsedColumnBlocks ?? [], rowAnnotations: rowAnnotations ?? [], rangeAnnotations: rangeAnnotations ?? [] }),

	reset: () =>
		set({
			cells: createEmptyGrid(DEFAULT_GRID_SIZE.rows, DEFAULT_GRID_SIZE.cols),
			gridSize: DEFAULT_GRID_SIZE,
			cellSize: DEFAULT_CELL_SIZE,
			patternType: 'knitting',
			patternTitle: '',
			collapsedBlocks: [],
			collapsedColumnBlocks: [],
			difficulty: 0,
			materials: '',
			rowAnnotations: [],
			rangeAnnotations: [],
		}),
}));
