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

	describe('대칭 모드 (handleCellPaint)', () => {
		it('horizontal 모드에서 좌우 대칭 셀에도 기호가 적용된다', () => {
			act(() => useUIStore.getState().setSelectedSymbol(kSymbol));
			act(() => useUIStore.getState().setSymmetryMode('horizontal'));
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			const cells = useChartStore.getState().cells;
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[0][19].symbolId).toBe('k'); // col 19 = 20-1-0
		});

		it('vertical 모드에서 상하 대칭 셀에도 기호가 적용된다', () => {
			act(() => useUIStore.getState().setSelectedSymbol(kSymbol));
			act(() => useUIStore.getState().setSymmetryMode('vertical'));
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			const cells = useChartStore.getState().cells;
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[19][0].symbolId).toBe('k'); // row 19 = 20-1-0
		});

		it('both 모드에서 4방향 대칭 셀에 모두 기호가 적용된다', () => {
			act(() => useUIStore.getState().setSelectedSymbol(kSymbol));
			act(() => useUIStore.getState().setSymmetryMode('both'));
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			const cells = useChartStore.getState().cells;
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[0][19].symbolId).toBe('k');
			expect(cells[19][0].symbolId).toBe('k');
			expect(cells[19][19].symbolId).toBe('k');
		});

		it('none 모드에서는 해당 셀만 변경된다', () => {
			act(() => useUIStore.getState().setSelectedSymbol(kSymbol));
			act(() => useUIStore.getState().setSymmetryMode('none'));
			const { result } = renderHook(() => useChartEditor());
			act(() => result.current.handleCellPaint(0, 0));
			const cells = useChartStore.getState().cells;
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[0][19].symbolId).toBeNull();
			expect(cells[19][0].symbolId).toBeNull();
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
