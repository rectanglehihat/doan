export type SymbolCategory = 'basic-structure' | 'basic-stitch' | 'increase' | 'decrease' | 'special';

export type PatternType = 'knitting' | 'crochet';

export interface KnittingSymbol {
	id: string;
	abbr: string;
	name: string;
	category: SymbolCategory;
	patternType: PatternType;
	icon?: string;
}
