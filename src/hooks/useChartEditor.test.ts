import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useChartEditor } from './useChartEditor';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { knittingSymbols } from '@/constants/knitting-symbols';

const kSymbol = knittingSymbols.find((s) => s.id === 'k')!;

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
});

describe('useChartEditor', () => {
	describe('초기 상태', () => {
		it('gridSize를 반환한다', () => {
			const { result } = renderHook(() => useChartEditor());
			expect(result.current.gridSize).toEqual({ rows: 20, cols: 20 });
		});

		it('cells를 반환한다', () => {
			const { result } = renderHook(() => useChartEditor());
			expect(result.current.cells).toHaveLength(20);
		});

		it('selectedSymbol은 null이다', () => {
			const { result } = renderHook(() => useChartEditor());
			expect(result.current.selectedSymbol).toBeNull();
		});
	});

	describe('handleCellPaint', () => {
		it('선택된 기호가 있으면 해당 기호 id를 셀에 적용한다', () => {
			act(() => useUIStore.getState().setSelectedSymbol(kSymbol));
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});

		it('선택된 기호가 없으면 셀을 비운다 (null)', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
		});
	});

	describe('clearCell', () => {
		it('셀의 기호를 null로 설정한다', () => {
			useChartStore.getState().setCellSymbol(1, 1, 'p');
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.clearCell(1, 1));
			expect(useChartStore.getState().cells[1][1].symbolId).toBeNull();
		});
	});

	describe('resizeGrid', () => {
		it('gridSize를 변경한다', () => {
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.resizeGrid({ rows: 10, cols: 15 }));
			expect(useChartStore.getState().gridSize).toEqual({ rows: 10, cols: 15 });
		});
	});

	describe('symbolsMap', () => {
		it('knitting 모드에서 기호 id를 abbr로 매핑한다', () => {
			const { result } = renderHook(() => useChartEditor());
			expect(result.current.symbolsMap['k']).toBe('k');
			expect(result.current.symbolsMap['p']).toBe('p');
		});

		it('patternType이 crochet으로 바뀌면 코바늘 기호 맵을 반환한다', () => {
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.setPatternType('crochet'));
			expect(result.current.symbolsMap['sc']).toBe('sc');
			expect(result.current.symbolsMap['k']).toBeUndefined();
		});
	});
});
