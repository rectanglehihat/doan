import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useHistory } from './useHistory';
import { useChartStore } from '@/store/useChartStore';

beforeEach(() => {
	useChartStore.getState().reset();
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
	});
});
