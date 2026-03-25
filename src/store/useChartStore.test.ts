import { describe, it, expect, beforeEach } from 'vitest';
import { useChartStore } from './useChartStore';

beforeEach(() => {
	useChartStore.getState().reset();
});

describe('useChartStore', () => {
	describe('초기 상태', () => {
		it('기본 gridSize는 20x20이다', () => {
			const { gridSize } = useChartStore.getState();
			expect(gridSize).toEqual({ rows: 20, cols: 20 });
		});

		it('기본 patternType은 knitting이다', () => {
			const { patternType } = useChartStore.getState();
			expect(patternType).toBe('knitting');
		});

		it('기본 patternTitle은 빈 문자열이다', () => {
			const { patternTitle } = useChartStore.getState();
			expect(patternTitle).toBe('');
		});

		it('cells는 20x20 2D 배열이고 모든 셀의 symbolId는 null이다', () => {
			const { cells, gridSize } = useChartStore.getState();
			expect(cells).toHaveLength(gridSize.rows);
			cells.forEach((row) => {
				expect(row).toHaveLength(gridSize.cols);
				row.forEach((cell) => {
					expect(cell.symbolId).toBeNull();
				});
			});
		});
	});

	describe('setCellSymbol', () => {
		it('지정한 셀의 symbolId를 변경한다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});

		it('다른 셀에는 영향을 주지 않는다', () => {
			useChartStore.getState().setCellSymbol(1, 2, 'p');
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
			expect(useChartStore.getState().cells[1][3].symbolId).toBeNull();
		});

		it('symbolId를 null로 설정하면 셀이 비워진다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellSymbol(0, 0, null);
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
		});
	});

	describe('setGridSize', () => {
		it('gridSize를 업데이트한다', () => {
			useChartStore.getState().setGridSize({ rows: 10, cols: 15 });
			expect(useChartStore.getState().gridSize).toEqual({ rows: 10, cols: 15 });
		});

		it('그리드 크기가 커지면 새 셀은 symbolId가 null이다', () => {
			useChartStore.getState().setGridSize({ rows: 25, cols: 25 });
			const { cells } = useChartStore.getState();
			expect(cells).toHaveLength(25);
			expect(cells[24][24].symbolId).toBeNull();
		});

		it('그리드 크기가 작아져도 기존 셀 데이터를 유지한다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellSymbol(1, 1, 'p');
			useChartStore.getState().setGridSize({ rows: 5, cols: 5 });
			const { cells } = useChartStore.getState();
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[1][1].symbolId).toBe('p');
		});

		it('그리드 크기가 작아지면 범위 밖 셀 데이터는 잘린다', () => {
			useChartStore.getState().setGridSize({ rows: 25, cols: 25 });
			useChartStore.getState().setCellSymbol(24, 24, 'k');
			useChartStore.getState().setGridSize({ rows: 5, cols: 5 });
			const { cells } = useChartStore.getState();
			expect(cells).toHaveLength(5);
			expect(cells[0]).toHaveLength(5);
		});
	});

	describe('setPatternType', () => {
		it('patternType을 crochet으로 변경한다', () => {
			useChartStore.getState().setPatternType('crochet');
			expect(useChartStore.getState().patternType).toBe('crochet');
		});

		it('patternType을 knitting으로 변경한다', () => {
			useChartStore.getState().setPatternType('crochet');
			useChartStore.getState().setPatternType('knitting');
			expect(useChartStore.getState().patternType).toBe('knitting');
		});
	});

	describe('setPatternTitle', () => {
		it('patternTitle을 변경한다', () => {
			useChartStore.getState().setPatternTitle('여름 조끼');
			expect(useChartStore.getState().patternTitle).toBe('여름 조끼');
		});

		it('빈 문자열로 변경할 수 있다', () => {
			useChartStore.getState().setPatternTitle('여름 조끼');
			useChartStore.getState().setPatternTitle('');
			expect(useChartStore.getState().patternTitle).toBe('');
		});
	});

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setGridSize({ rows: 5, cols: 5 });
			useChartStore.getState().setPatternType('crochet');
			useChartStore.getState().setPatternTitle('테스트 도안');
			useChartStore.getState().reset();

			const { cells, gridSize, patternType, patternTitle } = useChartStore.getState();
			expect(gridSize).toEqual({ rows: 20, cols: 20 });
			expect(patternType).toBe('knitting');
			expect(patternTitle).toBe('');
			expect(cells).toHaveLength(20);
			cells.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.symbolId).toBeNull();
				});
			});
		});
	});
});
