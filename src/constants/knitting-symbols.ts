import { KnittingSymbol, SymbolCategory } from '@/types/knitting';

export const SYMBOL_CATEGORY_LABELS: Record<SymbolCategory, string> = {
	'basic-structure': '기초',
	'knit-stitch': '기본 뜨기',
	increase: '늘리기',
	decrease: '줄이기',
	'triple-decrease': '3코 모아뜨기',
	cable: '교차뜨기',
};


export const SYMBOL_CATEGORY_COLORS: Record<SymbolCategory, { bg: string; border: string; text: string }> = {
	'basic-structure': {
		bg: 'bg-zinc-100',
		border: 'border-zinc-300',
		text: 'text-zinc-700',
	},
	'knit-stitch': {
		bg: 'bg-white',
		border: 'border-zinc-200',
		text: 'text-zinc-700',
	},
	increase: {
		bg: 'bg-emerald-50',
		border: 'border-emerald-200',
		text: 'text-emerald-800',
	},
	decrease: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		text: 'text-red-800',
	},
	'triple-decrease': {
		bg: 'bg-orange-50',
		border: 'border-orange-200',
		text: 'text-orange-800',
	},
	cable: {
		bg: 'bg-violet-50',
		border: 'border-violet-200',
		text: 'text-violet-800',
	},
};

export const SYMBOL_CATEGORY_ORDER: SymbolCategory[] = [
	'basic-structure',
	'knit-stitch',
	'increase',
	'decrease',
	'triple-decrease',
	'cable',
];

export const knittingSymbols: KnittingSymbol[] = [
	// 기초
	{ id: '감아코', abbr: '감아코', name: '감아코', category: 'basic-structure', icon: '' },
	{ id: 'BO', abbr: 'BO', name: '코막기', category: 'basic-structure', icon: '' },
	{ id: 'CO', abbr: 'CO', name: '코잡기', category: 'basic-structure', icon: '' },
	// 기본 뜨기
	{ id: 'sl', abbr: 'sl', name: '걸러뜨기', category: 'knit-stitch', icon: '' },
	{ id: 'k', abbr: 'k', name: '겉뜨기', category: 'knit-stitch', icon: '' },
	{ id: 'tbl', abbr: 'tbl', name: '꼬아뜨기', category: 'knit-stitch', icon: '' },
	{ id: 'yo', abbr: 'yo', name: '바늘비우기', category: 'knit-stitch', icon: '' },
	{ id: 'p', abbr: 'p', name: '안뜨기', category: 'knit-stitch', icon: '' },
	// 늘리기
	{ id: 'kfb', abbr: 'kfb', name: 'kfb늘리기', category: 'increase', icon: '' },
	{ id: 'M1R', abbr: 'M1R', name: '오른코 늘리기', category: 'increase', icon: '' },
	{ id: 'M1L', abbr: 'M1L', name: '왼코 늘리기', category: 'increase', icon: '' },
	// 줄이기
	{ id: 'skpo', abbr: 'skpo', name: '오른코 겹치기', category: 'decrease', icon: '' },
	{ id: 'k2tog', abbr: 'k2tog', name: '왼코 겹치기', category: 'decrease', icon: '' },
	// 3코 모아뜨기
	{ id: 'sssk', abbr: 'sssk', name: '오른코 중심 3코 모아뜨기', category: 'triple-decrease', icon: '' },
	{ id: 'k3tog', abbr: 'k3tog', name: '왼코 중심 3코 모아뜨기', category: 'triple-decrease', icon: '' },
	{ id: 's2kpo', abbr: 's2kpo', name: '중심 3코 모아뜨기', category: 'triple-decrease', icon: '' },
	// 교차뜨기
	{ id: 'RC', abbr: 'RC', name: '오른코 교차뜨기', category: 'cable', icon: '' },
	{ id: 'LC', abbr: 'LC', name: '왼코 교차뜨기', category: 'cable', icon: '' },
];
