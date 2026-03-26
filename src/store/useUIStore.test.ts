import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';
import { KnittingSymbol, ShapeGuide, CellSelection } from '@/types/knitting';

const mockShapeGuide: ShapeGuide = {
	strokes: [[0, 0, 10, 5, 20, 10]],
};

const mockSymbol: KnittingSymbol = {
	id: 'k',
	abbr: 'k',
	name: '겉뜨기',
	category: 'basic-stitch',
	patternType: 'knitting',
};

beforeEach(() => {
	useUIStore.getState().reset();
});

describe('useUIStore', () => {
	describe('초기 상태', () => {
		it('selectedSymbol은 null이다', () => {
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});

		it('isSaveDialogOpen은 false이다', () => {
			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});

		it('isLoadDialogOpen은 false이다', () => {
			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});
	});

	describe('setSelectedSymbol', () => {
		it('selectedSymbol을 설정한다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().selectedSymbol).toEqual(mockSymbol);
		});

		it('null로 설정하면 선택이 해제된다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().setSelectedSymbol(null);
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});
	});

	describe('openSaveDialog / closeSaveDialog', () => {
		it('openSaveDialog 호출 시 isSaveDialogOpen이 true가 된다', () => {
			useUIStore.getState().openSaveDialog();
			expect(useUIStore.getState().isSaveDialogOpen).toBe(true);
		});

		it('closeSaveDialog 호출 시 isSaveDialogOpen이 false가 된다', () => {
			useUIStore.getState().openSaveDialog();
			useUIStore.getState().closeSaveDialog();
			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});
	});

	describe('openLoadDialog / closeLoadDialog', () => {
		it('openLoadDialog 호출 시 isLoadDialogOpen이 true가 된다', () => {
			useUIStore.getState().openLoadDialog();
			expect(useUIStore.getState().isLoadDialogOpen).toBe(true);
		});

		it('closeLoadDialog 호출 시 isLoadDialogOpen이 false가 된다', () => {
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().closeLoadDialog();
			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});
	});

	describe('다이얼로그 상호 독립', () => {
		it('SaveDialog와 LoadDialog는 독립적으로 동작한다', () => {
			useUIStore.getState().openSaveDialog();
			useUIStore.getState().openLoadDialog();
			expect(useUIStore.getState().isSaveDialogOpen).toBe(true);
			expect(useUIStore.getState().isLoadDialogOpen).toBe(true);
		});
	});

	describe('shapeGuide', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('setShapeGuide 호출 시 shapeGuide가 설정된다', () => {
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			expect(useUIStore.getState().shapeGuide).toEqual(mockShapeGuide);
		});

		it('setShapeGuide(null) 호출 시 shapeGuide가 null이 된다', () => {
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			useUIStore.getState().setShapeGuide(null);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('addShapeGuideStroke 호출 시 stroke가 추가된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(2);
		});

		it('removeShapeGuideStroke 호출 시 해당 인덱스 stroke가 제거된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			useUIStore.getState().removeShapeGuideStroke(0);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([10, 10, 20, 20]);
		});

		it('removeShapeGuideStroke 호출 후 shapeGuide가 null이면 그대로 null이다', () => {
			useUIStore.getState().removeShapeGuideStroke(0);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('replaceShapeGuideStroke 호출 시 지정 인덱스 스트로크를 여러 스트로크로 교체한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 10, 10]);
			useUIStore.getState().replaceShapeGuideStroke(0, [[0, 0, 4, 4], [6, 6, 10, 10]]);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(2);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([0, 0, 4, 4]);
			expect(useUIStore.getState().shapeGuide?.strokes[1]).toEqual([6, 6, 10, 10]);
		});

		it('replaceShapeGuideStroke에 빈 배열 전달 시 해당 스트로크가 삭제된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			useUIStore.getState().replaceShapeGuideStroke(0, []);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([10, 10, 20, 20]);
		});

		it('replaceShapeGuideStroke에 단일 배열 전달 시 해당 스트로크를 교체한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().replaceShapeGuideStroke(0, [[1, 1, 4, 4]]);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([1, 1, 4, 4]);
		});

		it('replaceShapeGuideStroke 호출 시 shapeGuide가 null이면 아무것도 하지 않는다', () => {
			useUIStore.getState().replaceShapeGuideStroke(0, [[0, 0, 5, 5]]);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});
	});

	describe('isShapeGuideDrawMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('setShapeGuideDrawMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(true);
		});
	});

	describe('isShapeGuideEraseMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setShapeGuideEraseMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(true);
		});

		it('setShapeGuideEraseMode(false) 호출 시 false가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setShapeGuideEraseMode(false);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});
	});

	describe('cellSelection', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().cellSelection).toBeNull();
		});

		it('setCellSelection 호출 시 cellSelection이 설정된다', () => {
			const sel: CellSelection = { startRow: 0, startCol: 0, endRow: 2, endCol: 3 };
			useUIStore.getState().setCellSelection(sel);
			expect(useUIStore.getState().cellSelection).toEqual(sel);
		});

		it('setCellSelection(null) 호출 시 null이 된다', () => {
			useUIStore.getState().setCellSelection({ startRow: 0, startCol: 0, endRow: 2, endCol: 3 });
			useUIStore.getState().setCellSelection(null);
			expect(useUIStore.getState().cellSelection).toBeNull();
		});
	});

	describe('clipboard', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().clipboard).toBeNull();
		});

		it('setClipboard 호출 시 clipboard가 설정된다', () => {
			const cells = [[{ symbolId: 'k' }, { symbolId: null }]];
			useUIStore.getState().setClipboard(cells);
			expect(useUIStore.getState().clipboard).toEqual(cells);
		});

		it('setClipboard(null) 호출 시 null이 된다', () => {
			useUIStore.getState().setClipboard([[{ symbolId: 'k' }]]);
			useUIStore.getState().setClipboard(null);
			expect(useUIStore.getState().clipboard).toBeNull();
		});
	});

	describe('isSelectionMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setSelectionMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().isSelectionMode).toBe(true);
		});

		it('setSelectionMode(false) 호출 시 false가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setSelectionMode(false);
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});
	});

	describe('툴바 모드와 기호 선택 상호 배타성', () => {
		it('setSelectedSymbol(symbol) 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 isSelectionMode가 false가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 cellSelection이 null이 된다', () => {
			useUIStore.getState().setCellSelection({ startRow: 0, startCol: 0, endRow: 2, endCol: 3 });
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().cellSelection).toBeNull();
		});

		it('setSelectedSymbol(null) 호출 시 모드 상태에 영향을 주지 않는다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setSelectedSymbol(null);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(true);
		});
	});

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().openSaveDialog();
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setCellSelection({ startRow: 1, startCol: 1, endRow: 3, endCol: 3 });
			useUIStore.getState().setClipboard([[{ symbolId: 'k' }]]);
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().reset();

			const { selectedSymbol, isSaveDialogOpen, isLoadDialogOpen, shapeGuide, isShapeGuideDrawMode, isShapeGuideEraseMode, cellSelection, clipboard, isSelectionMode } =
				useUIStore.getState();
			expect(selectedSymbol).toBeNull();
			expect(isSaveDialogOpen).toBe(false);
			expect(isLoadDialogOpen).toBe(false);
			expect(shapeGuide).toBeNull();
			expect(isShapeGuideDrawMode).toBe(false);
			expect(isShapeGuideEraseMode).toBe(false);
			expect(cellSelection).toBeNull();
			expect(clipboard).toBeNull();
			expect(isSelectionMode).toBe(false);
		});
	});
});
