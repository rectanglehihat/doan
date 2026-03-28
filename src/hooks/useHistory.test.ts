import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useHistory } from './useHistory';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
});

describe('useHistory', () => {
	describe('초기 상태', () => {
		it('canUndo는 false이다', () => {
			const { result } = renderHook(() => useHistory());
			expect(result.current.canUndo).toBe(false);
		});

		it('canRedo는 false이다', () => {
			const { result } = renderHook(() => useHistory());
			expect(result.current.canRedo).toBe(false);
		});
	});

	describe('undo', () => {
		it('셀 변경 후 canUndo가 true가 된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => {
				expect(result.current.canUndo).toBe(true);
			});
		});

		it('undo 호출 시 이전 cells 상태로 복원된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
		});

		it('undo 후 canRedo가 true가 된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(result.current.canRedo).toBe(true);
		});

		it('히스토리가 없을 때 undo를 호출해도 셀이 변경되지 않는다', () => {
			const { result } = renderHook(() => useHistory());
			const before = useChartStore.getState().cells;
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells).toBe(before);
		});

		it('여러 번 변경 후 undo를 반복하면 각 단계가 복원된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				useChartStore.getState().setCellSymbol(1, 1, 'p');
			});
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells[1][1].symbolId).toBeNull();
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});

		it('중략 추가 후 undo 시 collapsedBlocks가 제거된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().addCollapsedBlock(0, 5);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(0);
		});

		it('중략 추가 후 undo 1번 후 canUndo가 false이다 (히스토리 스택이 비어야 함)', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().addCollapsedBlock(0, 5);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(result.current.canUndo).toBe(false);
		});
	});

	describe('batch', () => {
		it('beginBatch/endBatch 사이의 여러 변경이 하나의 히스토리 항목으로 기록된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				useChartStore.getState().setCellSymbol(0, 0, 'k');
				useChartStore.getState().setCellSymbol(0, 1, 'k');
				useChartStore.getState().setCellSymbol(0, 2, 'k');
				result.current.endBatch();
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			// undo 한 번으로 3개 셀 모두 취소
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
			expect(useChartStore.getState().cells[0][1].symbolId).toBeNull();
			expect(useChartStore.getState().cells[0][2].symbolId).toBeNull();
		});

		it('endBatch 후 상태가 변경되지 않으면 히스토리에 기록되지 않는다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				result.current.endBatch();
			});
			// 아무 변경 없으므로 canUndo는 false여야 함
			expect(result.current.canUndo).toBe(false);
		});

		it('배치 중 canUndo/canRedo 상태가 변경되지 않는다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			// 배치 중이므로 아직 canUndo가 true여서는 안 됨
			expect(result.current.canUndo).toBe(false);
			act(() => {
				result.current.endBatch();
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
		});
	});

	describe('shapeGuide undo/redo', () => {
		it('형태선 추가 후 canUndo가 true가 된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			await waitFor(() => {
				expect(result.current.canUndo).toBe(true);
			});
		});

		it('형태선 추가 후 undo 호출 시 형태선이 제거된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('형태선 undo 후 redo 호출 시 형태선이 복원된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			act(() => {
				result.current.redo();
			});
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(1);
		});

		it('셀 변경과 형태선 변경이 각각 독립적인 히스토리 항목으로 기록된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			// 형태선 undo
			act(() => {
				result.current.undo();
			});
			expect(useUIStore.getState().shapeGuide).toBeNull();
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
			// 셀 undo
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
		});

		it('undo/redo 적용 시 형태선 변경이 새 히스토리에 기록되지 않는다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			// undo 후 past 스택이 비어있어야 함
			expect(result.current.canUndo).toBe(false);
		});
	});

	describe('shapeGuide batch', () => {
		it('beginBatch/endBatch 사이의 shapeGuide 변경이 히스토리에 기록되지 않는다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			// 배치 중이므로 아직 canUndo가 true여서는 안 됨
			expect(result.current.canUndo).toBe(false);
		});

		it('beginBatch/endBatch 사이에 shapeGuide만 변경되어도 endBatch 후 단일 히스토리로 기록된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
				useUIStore.getState().addShapeGuideStroke([1, 1, 2, 2]);
				useUIStore.getState().addShapeGuideStroke([2, 2, 3, 3]);
				result.current.endBatch();
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			// undo 한 번으로 3개 스트로크 추가 전 상태(shapeGuide === null)로 복원
			act(() => {
				result.current.undo();
			});
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('beginBatch/endBatch 사이에 shapeGuide와 cells 모두 변경되면 endBatch 후 단일 히스토리로 기록된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				useChartStore.getState().setCellSymbol(0, 0, 'k');
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
				result.current.endBatch();
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			// undo 한 번으로 cells와 shapeGuide 모두 복원
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('변경 없이 beginBatch/endBatch만 호출하면 canUndo가 false다', () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				result.current.beginBatch();
				result.current.endBatch();
			});
			expect(result.current.canUndo).toBe(false);
		});
	});

	describe('historyResetToken — 히스토리 초기화', () => {
		it('triggerHistoryClear 호출 시 canUndo가 false가 된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));

			act(() => {
				useUIStore.getState().triggerHistoryClear();
			});

			expect(result.current.canUndo).toBe(false);
		});

		it('triggerHistoryClear 호출 시 canRedo가 false가 된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(result.current.canRedo).toBe(true);

			act(() => {
				useUIStore.getState().triggerHistoryClear();
			});

			expect(result.current.canRedo).toBe(false);
		});

		it('triggerHistoryClear 후 undo를 호출해도 셀이 변경되지 않는다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));

			act(() => {
				useUIStore.getState().triggerHistoryClear();
			});

			const cellsBefore = useChartStore.getState().cells;
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().cells).toBe(cellsBefore);
		});

		it('triggerHistoryClear 후 새 변경 사항은 정상적으로 히스토리에 기록된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));

			act(() => {
				useUIStore.getState().triggerHistoryClear();
			});
			expect(result.current.canUndo).toBe(false);

			act(() => {
				useChartStore.getState().setCellSymbol(1, 1, 'p');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
		});
	});

	describe('redo', () => {
		it('undo 후 redo 호출 시 원래 상태로 복원된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			act(() => {
				result.current.redo();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBe('k');
		});

		it('redo 후 canRedo가 false가 된다 (스택이 비면)', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			act(() => {
				result.current.redo();
			});
			expect(result.current.canRedo).toBe(false);
		});

		it('새로운 변경 후 redo 스택이 초기화된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(result.current.canRedo).toBe(true);
			act(() => {
				useChartStore.getState().setCellSymbol(2, 2, 'p');
			});
			await waitFor(() => expect(result.current.canRedo).toBe(false));
		});

		it('redo 히스토리가 없을 때 redo를 호출해도 셀이 변경되지 않는다', () => {
			const { result } = renderHook(() => useHistory());
			const before = useChartStore.getState().cells;
			act(() => {
				result.current.redo();
			});
			expect(useChartStore.getState().cells).toBe(before);
		});

		it('중략 추가 → undo → redo 시 collapsedBlocks가 복원된다', async () => {
			const { result } = renderHook(() => useHistory());
			act(() => {
				useChartStore.getState().addCollapsedBlock(0, 5);
			});
			await waitFor(() => expect(result.current.canUndo).toBe(true));
			act(() => {
				result.current.undo();
			});
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(0);
			act(() => {
				result.current.redo();
			});
			expect(useChartStore.getState().collapsedBlocks).toHaveLength(1);
			expect(useChartStore.getState().collapsedBlocks[0].startRow).toBe(0);
			expect(useChartStore.getState().collapsedBlocks[0].endRow).toBe(5);
		});
	});
});
