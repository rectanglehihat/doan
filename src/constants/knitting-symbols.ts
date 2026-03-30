import { KnittingSymbol, SymbolCategory } from '@/types/knitting';

export const SYMBOL_CATEGORY_LABELS: Record<SymbolCategory, string> = {
	'basic-structure': '기초',
	'basic-stitch': '기본뜨기',
	increase: '늘리기',
	decrease: '줄이기',
	special: '특수뜨기',
};

export const SYMBOL_CATEGORY_COLORS: Record<SymbolCategory, { bg: string; border: string; text: string }> = {
	'basic-structure': { bg: 'bg-zinc-100', border: 'border-zinc-300', text: 'text-zinc-700' },
	'basic-stitch': { bg: 'bg-white', border: 'border-zinc-200', text: 'text-zinc-700' },
	increase: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
	decrease: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
	special: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
};

export const EMPTY_SYMBOL_ID = '빈칸';

export const SYMBOL_CATEGORY_ORDER: SymbolCategory[] = [
	'basic-structure',
	'basic-stitch',
	'increase',
	'decrease',
	'special',
];

export const knittingSymbols: KnittingSymbol[] = [
	// 기초
	{ id: '빈칸', abbr: '', name: '빈 칸', category: 'basic-structure', patternType: 'knitting', icon: '' },
	{ id: '감아코', abbr: '감아코', name: '감아코', category: 'basic-structure', patternType: 'knitting', icon: '' },
	{ id: 'BO', abbr: 'BO', name: '코막기', category: 'basic-structure', patternType: 'knitting', icon: '' },
	{ id: 'CO', abbr: 'CO', name: '코잡기', category: 'basic-structure', patternType: 'knitting', icon: '' },
	// 기본뜨기
	{ id: 'sl', abbr: 'sl', name: '걸러뜨기', category: 'basic-stitch', patternType: 'knitting', icon: '' },
	{ id: 'k', abbr: 'k', name: '겉뜨기', category: 'basic-stitch', patternType: 'knitting', icon: '' },
	{ id: 'tbl', abbr: 'tbl', name: '꼬아뜨기', category: 'basic-stitch', patternType: 'knitting', icon: '' },
	{ id: 'yo', abbr: 'yo', name: '바늘비우기', category: 'basic-stitch', patternType: 'knitting', icon: '' },
	{ id: 'p', abbr: 'p', name: '안뜨기', category: 'basic-stitch', patternType: 'knitting', icon: '' },
	// 늘리기
	{ id: 'kfb', abbr: 'kfb', name: 'kfb늘리기', category: 'increase', patternType: 'knitting', icon: '' },
	{ id: 'M1R', abbr: 'M1R', name: '오른코 늘리기', category: 'increase', patternType: 'knitting', icon: '' },
	{ id: 'M1L', abbr: 'M1L', name: '왼코 늘리기', category: 'increase', patternType: 'knitting', icon: '' },
	// 줄이기
	{ id: 'skpo', abbr: 'skpo', name: '오른코 겹치기', category: 'decrease', patternType: 'knitting', icon: '' },
	{ id: 'k2tog', abbr: 'k2tog', name: '왼코 겹치기', category: 'decrease', patternType: 'knitting', icon: '' },
	// 특수뜨기 (3코 모아뜨기 + 교차뜨기 통합)
	{
		id: 'sssk',
		abbr: 'sssk',
		name: '오른코 중심 3코 모아뜨기',
		category: 'special',
		patternType: 'knitting',
		icon: '',
	},
	{
		id: 'k3tog',
		abbr: 'k3tog',
		name: '왼코 중심 3코 모아뜨기',
		category: 'special',
		patternType: 'knitting',
		icon: '',
	},
	{ id: 's2kpo', abbr: 's2kpo', name: '중심 3코 모아뜨기', category: 'special', patternType: 'knitting', icon: '' },
	{ id: 'RC', abbr: 'RC', name: '오른코 교차뜨기', category: 'special', patternType: 'knitting', icon: '' },
	{ id: 'LC', abbr: 'LC', name: '왼코 교차뜨기', category: 'special', patternType: 'knitting', icon: '' },
];

export const crochetSymbols: KnittingSymbol[] = [
	// 기초
	{ id: '빈칸', abbr: '', name: '빈 칸', category: 'basic-structure', patternType: 'crochet', icon: '' },
	{ id: 'magic-ring', abbr: 'mr', name: '매직링', category: 'basic-structure', patternType: 'crochet', icon: '' },
	{ id: 'ch', abbr: 'ch', name: '사슬뜨기', category: 'basic-structure', patternType: 'crochet', icon: '' },
	{ id: 'ch2', abbr: 'ch2', name: '이중사슬뜨기', category: 'basic-structure', patternType: 'crochet', icon: '' },
	{ id: 'sl-st', abbr: 'ss', name: '빼뜨기', category: 'basic-structure', patternType: 'crochet', icon: '' },
	// 기본뜨기
	{ id: 'sc', abbr: 'sc', name: '짧은뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	{ id: 'spike-sc', abbr: 'spike sc', name: '겹짧은뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	{ id: 'hdc', abbr: 'hdc', name: '긴뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	{ id: 'dc', abbr: 'dc', name: '한길긴뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	{ id: 'tr', abbr: 'tr', name: '두길긴뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	{ id: 'dtr', abbr: 'dtr', name: '세길긴뜨기', category: 'basic-stitch', patternType: 'crochet', icon: '' },
	// 늘리기
	{ id: 'sc-inc', abbr: '2sc', name: '짧은뜨기 2코 늘려뜨기', category: 'increase', patternType: 'crochet', icon: '' },
	{ id: 'sc3inc', abbr: '3sc', name: '짧은뜨기 3코 늘려뜨기', category: 'increase', patternType: 'crochet', icon: '' },
	{ id: 'hdc-inc', abbr: '2hdc', name: '긴뜨기 2코 늘려뜨기', category: 'increase', patternType: 'crochet', icon: '' },
	{
		id: 'dc-inc',
		abbr: '2dc',
		name: '한길긴뜨기 2코 늘려뜨기',
		category: 'increase',
		patternType: 'crochet',
		icon: '',
	},
	// 줄이기
	{
		id: 'sc2tog',
		abbr: 'sc2tog',
		name: '짧은뜨기 2코 모아뜨기',
		category: 'decrease',
		patternType: 'crochet',
		icon: '',
	},
	{
		id: 'sc3tog',
		abbr: 'sc3tog',
		name: '짧은뜨기 3코 모아뜨기',
		category: 'decrease',
		patternType: 'crochet',
		icon: '',
	},
	{
		id: 'hdc2tog',
		abbr: 'hdc2tog',
		name: '긴뜨기 2코 모아뜨기',
		category: 'decrease',
		patternType: 'crochet',
		icon: '',
	},
	{
		id: 'dc2tog',
		abbr: 'dc2tog',
		name: '한길긴뜨기 2코 모아뜨기',
		category: 'decrease',
		patternType: 'crochet',
		icon: '',
	},
	// 특수뜨기
	{ id: 'picot', abbr: 'p', name: '피코뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'shell', abbr: 'clu', name: '구슬뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'sc-flo', abbr: 'sc fl(o)', name: '앞 이랑 짧은뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'sc-blo', abbr: 'sc bl(o)', name: '뒤 이랑 짧은뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'fp', abbr: 'fp', name: '앞 걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'bp', abbr: 'bp', name: '뒤 걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'fpsc', abbr: 'FPsc', name: '짧은뜨기 앞걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'fphdc', abbr: 'FPhdc', name: '긴뜨기 앞걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'fpdc', abbr: 'FPdc', name: '한길긴뜨기 앞걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'bpsc', abbr: 'BPsc', name: '짧은뜨기 뒤걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'bphdc', abbr: 'BPhdc', name: '긴뜨기 뒤걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'bpdc', abbr: 'BPdc', name: '한길긴뜨기 뒤걸어뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'sc-ring', abbr: 'last', name: '짧은뜨기 링뜨기', category: 'special', patternType: 'crochet', icon: '' },
	{ id: 'rsc', abbr: 'rsc', name: '되돌아 짧은뜨기', category: 'special', patternType: 'crochet', icon: '' },
];
