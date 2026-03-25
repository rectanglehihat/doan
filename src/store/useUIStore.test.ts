import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';
import { KnittingSymbol, ShapeGuide } from '@/types/knitting';

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

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().openSaveDialog();
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().reset();

			const { selectedSymbol, isSaveDialogOpen, isLoadDialogOpen, shapeGuide, isShapeGuideDrawMode } =
				useUIStore.getState();
			expect(selectedSymbol).toBeNull();
			expect(isSaveDialogOpen).toBe(false);
			expect(isLoadDialogOpen).toBe(false);
			expect(shapeGuide).toBeNull();
			expect(isShapeGuideDrawMode).toBe(false);
		});
	});
});
