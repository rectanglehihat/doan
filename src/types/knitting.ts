export type SymbolCategory = 'basic-structure' | 'basic-stitch' | 'increase' | 'decrease' | 'special';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

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

export interface ChartPattern {
	id: string;
	metadata: PatternMetadata;
	patternType: PatternType;
	gridSize: GridSize;
	cells: ChartCell[][];
}
