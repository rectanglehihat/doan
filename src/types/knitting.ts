export type SymbolCategory = 'basic-structure' | 'knit-stitch' | 'increase' | 'decrease' | 'triple-decrease' | 'cable';

export interface KnittingSymbol {
	id: string;
	abbr: string;
	name: string;
	category: SymbolCategory;
	icon?: string;
}
