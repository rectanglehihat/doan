import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';
import { KnittingSymbol } from '@/types/knitting';

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

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().openSaveDialog();
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().reset();

			const { selectedSymbol, isSaveDialogOpen, isLoadDialogOpen } = useUIStore.getState();
			expect(selectedSymbol).toBeNull();
			expect(isSaveDialogOpen).toBe(false);
			expect(isLoadDialogOpen).toBe(false);
		});
	});
});
