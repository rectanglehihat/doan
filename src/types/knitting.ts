export type SymbolCategory = 'basic-structure' | 'basic-stitch' | 'increase' | 'decrease' | 'special';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

export type RotationalMode = 'none' | 'horizontal' | 'vertical' | 'both';

export type PatternType = 'knitting' | 'crochet';

export interface KnittingSymbol {
	id: string;
	abbr: string;
	name: string;
	category: SymbolCategory;
	patternType: PatternType;
	icon?: string;
}

export interface ChartCell {
	symbolId: string | null;
}

export interface GridSize {
	rows: number;
	cols: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface PatternMetadata {
	title: string;
	difficulty: Difficulty;
	yarnType: string;
	needleSize: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface CollapsedBlock {
	id: string;
	startRow: number; // 0-based
	endRow: number; // 0-based, inclusive (startRow < endRow 보장)
}

export interface ChartPattern {
	id: string;
	metadata: PatternMetadata;
	patternType: PatternType;
	gridSize: GridSize;
	cells: ChartCell[][];
	collapsedBlocks?: CollapsedBlock[];
}

export interface CellSelection {
	startRow: number;
	startCol: number;
	endRow: number;
	endCol: number;
}

/**
 * 사용자가 직접 그린 형태선.
 * 각 stroke는 grid 좌표계 기준의 점 배열: [col0, row0, col1, row1, ...] (float)
 * 렌더링 시 cellSize를 곱해 픽셀 좌표로 변환한다.
 */
export interface ShapeGuide {
	strokes: number[][];
}
