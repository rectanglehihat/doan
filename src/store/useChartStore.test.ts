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

		it('기본 difficulty는 0이다', () => {
			const { difficulty } = useChartStore.getState();
			expect(difficulty).toBe(0);
		});

		it('기본 materials는 빈 문자열이다', () => {
			const { materials } = useChartStore.getState();
			expect(materials).toBe('');
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

		it('초기 그리드의 모든 셀에 color: null이 포함된다', () => {
			const { cells } = useChartStore.getState();
			cells.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.color).toBeNull();
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

	describe('setGridSizeSymmetric', () => {
		it('horizontal 모드에서 cols 증가 시 좌우 외부에 균등하게 추가된다', () => {
			useChartStore.getState().setGridSize({ rows: 4, cols: 4 });
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellSymbol(0, 3, 'p');
			useChartStore.getState().setGridSizeSymmetric({ rows: 4, cols: 6 }, 'horizontal');
			const { cells } = useChartStore.getState();
			// colOffset = trunc((6-4)/2) = 1 → 기존 셀이 오른쪽으로 1칸 이동
			expect(cells[0][1].symbolId).toBe('k');
			expect(cells[0][4].symbolId).toBe('p');
			expect(cells[0][0].symbolId).toBeNull(); // 새로 추가된 왼쪽 셀
			expect(cells[0][5].symbolId).toBeNull(); // 새로 추가된 오른쪽 셀
		});

		it('horizontal 모드에서 cols 감소 시 좌우 외부에서 균등하게 제거된다', () => {
			useChartStore.getState().setGridSize({ rows: 4, cols: 6 });
			useChartStore.getState().setCellSymbol(0, 1, 'k');
			useChartStore.getState().setCellSymbol(0, 4, 'p');
			useChartStore.getState().setGridSizeSymmetric({ rows: 4, cols: 4 }, 'horizontal');
			const { cells } = useChartStore.getState();
			// colOffset = trunc((4-6)/2) = -1 → 기존 셀이 왼쪽으로 1칸 이동
			expect(cells[0][0].symbolId).toBe('k');
			expect(cells[0][3].symbolId).toBe('p');
		});

		it('vertical 모드에서 rows 증가 시 상하 외부에 균등하게 추가된다', () => {
			useChartStore.getState().setGridSize({ rows: 4, cols: 4 });
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellSymbol(3, 0, 'p');
			useChartStore.getState().setGridSizeSymmetric({ rows: 6, cols: 4 }, 'vertical');
			const { cells } = useChartStore.getState();
			// rowOffset = 1 → 기존 셀이 아래로 1칸 이동
			expect(cells[1][0].symbolId).toBe('k');
			expect(cells[4][0].symbolId).toBe('p');
			expect(cells[0][0].symbolId).toBeNull();
			expect(cells[5][0].symbolId).toBeNull();
		});

		it('none 모드에서는 일반 resizeGrid와 동일하게 동작한다', () => {
			useChartStore.getState().setGridSize({ rows: 4, cols: 4 });
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setGridSizeSymmetric({ rows: 4, cols: 6 }, 'none');
			const { cells } = useChartStore.getState();
			// none 모드 → offset 없음 → 기존 셀 위치 유지
			expect(cells[0][0].symbolId).toBe('k');
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

	describe('setDifficulty', () => {
		it('difficulty를 변경한다', () => {
			useChartStore.getState().setDifficulty(3);
			expect(useChartStore.getState().difficulty).toBe(3);
		});

		it('0~5 범위의 값을 설정할 수 있다', () => {
			useChartStore.getState().setDifficulty(0);
			expect(useChartStore.getState().difficulty).toBe(0);

			useChartStore.getState().setDifficulty(5);
			expect(useChartStore.getState().difficulty).toBe(5);
		});
	});

	describe('setMaterials', () => {
		it('materials를 변경한다', () => {
			useChartStore.getState().setMaterials('4mm 대바늘, 100g 실');
			expect(useChartStore.getState().materials).toBe('4mm 대바늘, 100g 실');
		});

		it('빈 문자열로 변경할 수 있다', () => {
			useChartStore.getState().setMaterials('대바늘');
			useChartStore.getState().setMaterials('');
			expect(useChartStore.getState().materials).toBe('');
		});
	});

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setGridSize({ rows: 5, cols: 5 });
			useChartStore.getState().setPatternType('crochet');
			useChartStore.getState().setPatternTitle('테스트 도안');
			useChartStore.getState().setDifficulty(3);
			useChartStore.getState().setMaterials('4mm 대바늘, 100g 실');
			useChartStore.getState().reset();

			const { cells, gridSize, patternType, patternTitle, difficulty, materials } =
				useChartStore.getState();
			expect(gridSize).toEqual({ rows: 20, cols: 20 });
			expect(patternType).toBe('knitting');
			expect(patternTitle).toBe('');
			expect(difficulty).toBe(0);
			expect(materials).toBe('');
			expect(cells).toHaveLength(20);
			cells.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.symbolId).toBeNull();
				});
			});
		});
	});

	describe('restoreSnapshot', () => {
		it('cells, gridSize, patternType, patternTitle, collapsedBlocks, difficulty, materials를 한번에 덮어쓴다', () => {
			const cells = [[{ symbolId: 'k' }, { symbolId: null }], [{ symbolId: 'p' }, { symbolId: null }]];
			const gridSize = { rows: 2, cols: 2 };
			const collapsedBlocks = [{ id: 'block-1', startRow: 0, endRow: 1 }];

			useChartStore
				.getState()
				.restoreSnapshot(cells, gridSize, 'crochet', '코바늘 도안', collapsedBlocks, 4, '5mm 코바늘, 200g 실');

			const state = useChartStore.getState();
			expect(state.cells).toEqual(cells);
			expect(state.gridSize).toEqual(gridSize);
			expect(state.patternType).toBe('crochet');
			expect(state.patternTitle).toBe('코바늘 도안');
			expect(state.collapsedBlocks).toEqual(collapsedBlocks);
			expect(state.difficulty).toBe(4);
			expect(state.materials).toBe('5mm 코바늘, 200g 실');
		});

		it('기존 cells를 새 cells로 완전히 교체한다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			const newCells = [[{ symbolId: 'p' }]];

			useChartStore
				.getState()
				.restoreSnapshot(newCells, { rows: 1, cols: 1 }, 'knitting', '', [], 0, '');

			expect(useChartStore.getState().cells).toEqual([[{ symbolId: 'p' }]]);
		});

		it('collapsedBlocks가 빈 배열이면 빈 배열로 설정된다', () => {
			useChartStore.getState().addCollapsedBlock(1, 3);
			const cells = [[{ symbolId: null }]];

			useChartStore
				.getState()
				.restoreSnapshot(cells, { rows: 1, cols: 1 }, 'knitting', '', [], 0, '');

			expect(useChartStore.getState().collapsedBlocks).toEqual([]);
		});

		it('gridSize가 cells 배열 크기와 일치하도록 설정된다', () => {
			const cells = Array.from({ length: 5 }, () =>
				Array.from({ length: 8 }, () => ({ symbolId: null })),
			);

			useChartStore
				.getState()
				.restoreSnapshot(cells, { rows: 5, cols: 8 }, 'knitting', '5x8 도안', [], 0, '');

			expect(useChartStore.getState().gridSize).toEqual({ rows: 5, cols: 8 });
			expect(useChartStore.getState().cells).toHaveLength(5);
			expect(useChartStore.getState().cells[0]).toHaveLength(8);
		});

		it('difficulty와 materials가 복원된다', () => {
			const cells = [[{ symbolId: null }]];

			useChartStore
				.getState()
				.restoreSnapshot(cells, { rows: 1, cols: 1 }, 'knitting', '복원 도안', [], 2, '대바늘 3mm');

			expect(useChartStore.getState().difficulty).toBe(2);
			expect(useChartStore.getState().materials).toBe('대바늘 3mm');
		});
	});

	describe('clearAllColors', () => {
		it('모든 셀의 color를 null로 변경한다', () => {
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			useChartStore.getState().setCellColor(1, 1, '#00FF00');
			useChartStore.getState().clearAllColors();
			const { cells } = useChartStore.getState();
			cells.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.color).toBeNull();
				});
			});
		});

		it('clearAllColors 호출 시 symbolId는 변경되지 않는다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			useChartStore.getState().clearAllColors();
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});
	});

	describe('setCellColor', () => {
		it('setCellColor(0, 0, "#FF0000") 호출 시 해당 셀의 color가 "#FF0000"로 변경된다', () => {
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			expect(useChartStore.getState().cells[0][0].color).toBe('#FF0000');
		});

		it('setCellColor(0, 0, null) 호출 시 해당 셀의 color가 null로 변경된다', () => {
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			useChartStore.getState().setCellColor(0, 0, null);
			expect(useChartStore.getState().cells[0][0].color).toBeNull();
		});

		it('setCellColor 호출 시 symbolId는 변경되지 않는다', () => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});

		it('reset() 후 모든 셀의 color가 null이다', () => {
			useChartStore.getState().setCellColor(0, 0, '#FF0000');
			useChartStore.getState().setCellColor(1, 1, '#00FF00');
			useChartStore.getState().reset();
			const { cells } = useChartStore.getState();
			cells.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.color).toBeNull();
				});
			});
		});
	});

	describe('collapsedBlocks', () => {
		beforeEach(() => {
			useChartStore.getState().reset();
		});

		it('초기값은 빈 배열이다', () => {
			const { collapsedBlocks } = useChartStore.getState();
			expect(collapsedBlocks).toEqual([]);
		});

		it('addCollapsedBlock 호출 시 collapsedBlocks에 추가된다', () => {
			useChartStore.getState().addCollapsedBlock(2, 5);
			const { collapsedBlocks } = useChartStore.getState();
			expect(collapsedBlocks).toHaveLength(1);
			expect(typeof collapsedBlocks[0].id).toBe('string');
			expect(collapsedBlocks[0].startRow).toBe(2);
			expect(collapsedBlocks[0].endRow).toBe(5);
		});

		it('addCollapsedBlock 범위가 겹치면 에러를 던진다', () => {
			useChartStore.getState().addCollapsedBlock(2, 5);
			expect(() => useChartStore.getState().addCollapsedBlock(3, 7)).toThrow();
			expect(() => useChartStore.getState().addCollapsedBlock(0, 3)).toThrow();
		});

		it('addCollapsedBlock startRow >= endRow이면 에러를 던진다', () => {
			expect(() => useChartStore.getState().addCollapsedBlock(3, 3)).toThrow();
			expect(() => useChartStore.getState().addCollapsedBlock(5, 3)).toThrow();
		});

		it('removeCollapsedBlock 호출 시 해당 블록이 제거된다', () => {
			useChartStore.getState().addCollapsedBlock(2, 5);
			const { collapsedBlocks } = useChartStore.getState();
			const { id } = collapsedBlocks[0];
			useChartStore.getState().removeCollapsedBlock(id);
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(0);
		});

		it('removeCollapsedBlock 존재하지 않는 id는 무시한다', () => {
			expect(() =>
				useChartStore.getState().removeCollapsedBlock('non-existent-id'),
			).not.toThrow();
		});

		it('reset 호출 시 collapsedBlocks가 초기화된다', () => {
			useChartStore.getState().addCollapsedBlock(2, 5);
			useChartStore.getState().reset();
			expect(useChartStore.getState().collapsedBlocks).toEqual([]);
		});

		it('여러 collapsedBlocks를 겹치지 않게 추가할 수 있다', () => {
			useChartStore.getState().addCollapsedBlock(0, 2);
			useChartStore.getState().addCollapsedBlock(5, 8);
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(2);
		});

		it('기존 블록 종료 행과 새 블록 시작 행이 동일하면 에러를 던진다', () => {
			useChartStore.getState().addCollapsedBlock(0, 2);
			expect(() => useChartStore.getState().addCollapsedBlock(2, 5)).toThrow();
		});

		it('기존 블록 바로 다음 행부터 시작하면 에러 없이 추가된다', () => {
			useChartStore.getState().addCollapsedBlock(0, 2);
			expect(() => useChartStore.getState().addCollapsedBlock(3, 5)).not.toThrow();
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(2);
		});
	});

	describe('rowAnnotations', () => {
		it('초기값은 빈 배열이다', () => {
			const { rowAnnotations } = useChartStore.getState();
			expect(rowAnnotations).toEqual([]);
		});

		it('addRowAnnotation 호출 시 항목이 추가된다', () => {
			useChartStore.getState().addRowAnnotation(3, '10단', 'right');
			const { rowAnnotations } = useChartStore.getState();
			expect(rowAnnotations).toHaveLength(1);
			expect(typeof rowAnnotations[0].id).toBe('string');
			expect(rowAnnotations[0].rowIndex).toBe(3);
			expect(rowAnnotations[0].label).toBe('10단');
			expect(rowAnnotations[0].side).toBe('right');
		});

		it('addRowAnnotation 여러 번 호출 시 각각 고유한 id를 가진다', () => {
			useChartStore.getState().addRowAnnotation(0, '1단', 'right');
			useChartStore.getState().addRowAnnotation(5, '6단', 'right');
			const { rowAnnotations } = useChartStore.getState();
			expect(rowAnnotations).toHaveLength(2);
			expect(rowAnnotations[0].id).not.toBe(rowAnnotations[1].id);
		});

		it('updateRowAnnotation 호출 시 해당 항목의 label이 변경된다', () => {
			useChartStore.getState().addRowAnnotation(2, '원래 라벨', 'right');
			const { id } = useChartStore.getState().rowAnnotations[0];
			useChartStore.getState().updateRowAnnotation(id, '수정된 라벨');
			expect(useChartStore.getState().rowAnnotations[0].label).toBe('수정된 라벨');
		});

		it('updateRowAnnotation 호출 시 rowIndex와 side는 변경되지 않는다', () => {
			useChartStore.getState().addRowAnnotation(7, '7단', 'right');
			const { id } = useChartStore.getState().rowAnnotations[0];
			useChartStore.getState().updateRowAnnotation(id, '수정');
			const annotation = useChartStore.getState().rowAnnotations[0];
			expect(annotation.rowIndex).toBe(7);
			expect(annotation.side).toBe('right');
		});

		it('removeRowAnnotation 호출 시 해당 항목이 삭제된다', () => {
			useChartStore.getState().addRowAnnotation(1, '2단', 'right');
			const { id } = useChartStore.getState().rowAnnotations[0];
			useChartStore.getState().removeRowAnnotation(id);
			expect(useChartStore.getState().rowAnnotations).toHaveLength(0);
		});

		it('removeRowAnnotation 존재하지 않는 id는 무시한다', () => {
			useChartStore.getState().addRowAnnotation(0, '1단', 'right');
			expect(() => useChartStore.getState().removeRowAnnotation('non-existent-id')).not.toThrow();
			expect(useChartStore.getState().rowAnnotations).toHaveLength(1);
		});

		it('reset() 호출 시 rowAnnotations가 빈 배열로 초기화된다', () => {
			useChartStore.getState().addRowAnnotation(0, '1단', 'right');
			useChartStore.getState().addRowAnnotation(5, '6단', 'right');
			useChartStore.getState().reset();
			expect(useChartStore.getState().rowAnnotations).toEqual([]);
		});

		it('addRowAnnotation side=left도 저장된다', () => {
			useChartStore.getState().addRowAnnotation(4, '5단', 'left');
			expect(useChartStore.getState().rowAnnotations[0].side).toBe('left');
		});
	});
});
