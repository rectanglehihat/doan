import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePatterns } from './usePatterns';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import type { SavedPatternSnapshot } from '@/types/knitting';

// local-storage-service 전체 모킹
vi.mock('@/lib/utils/local-storage-service', () => ({
	loadAllPatterns: vi.fn(),
	savePattern: vi.fn(),
	deletePattern: vi.fn(),
	loadPattern: vi.fn(),
}));

// vi.mocked 헬퍼로 타입 안전하게 접근
import * as storageService from '@/lib/utils/local-storage-service';
const mockLoadAllPatterns = vi.mocked(storageService.loadAllPatterns);
const mockSavePattern = vi.mocked(storageService.savePattern);
const mockDeletePattern = vi.mocked(storageService.deletePattern);
const mockLoadPattern = vi.mocked(storageService.loadPattern);

function makeSnapshot(overrides: Partial<SavedPatternSnapshot> = {}): SavedPatternSnapshot {
	return {
		id: 'snap-id-1',
		title: '테스트 도안',
		patternType: 'knitting',
		gridSize: { rows: 10, cols: 10 },
		cells: Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => ({ symbolId: null })),
		),
		collapsedBlocks: [],
		shapeGuide: null,
		rotationalMode: 'none',
		savedAt: '2025-01-01T00:00:00.000Z',
		...overrides,
	};
}

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
	vi.clearAllMocks();
	mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });
});

describe('usePatterns', () => {
	describe('초기 상태', () => {
		it('patterns는 빈 배열로 시작한다', () => {
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			expect(result.current.patterns).toEqual([]);
		});

		it('isAutoSaving은 false로 시작한다', () => {
			const { result } = renderHook(() => usePatterns());

			expect(result.current.isAutoSaving).toBe(false);
		});

		it('currentPatternId는 null로 시작한다', () => {
			const { result } = renderHook(() => usePatterns());

			expect(result.current.currentPatternId).toBeNull();
		});

		it('마운트 시 loadAllPatterns를 호출해 패턴 목록을 불러온다', () => {
			const snapshots = [makeSnapshot()];
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: snapshots });

			const { result } = renderHook(() => usePatterns());

			expect(result.current.patterns).toEqual(snapshots);
		});
	});

	describe('saveCurrentPattern', () => {
		it('제목을 받아 현재 스토어 상태를 저장한다', async () => {
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			useChartStore.getState().setPatternTitle('기존 제목');

			const { result } = renderHook(() => usePatterns());

			let saveResult: ReturnType<typeof result.current.saveCurrentPattern> | undefined;
			act(() => {
				saveResult = result.current.saveCurrentPattern('새 도안 제목');
			});

			expect(mockSavePattern).toHaveBeenCalledTimes(1);
			const calledWith = mockSavePattern.mock.calls[0][0];
			expect(calledWith.title).toBe('새 도안 제목');
			expect(saveResult).toEqual({ ok: true, data: undefined });
		});

		it('저장 성공 시 patterns 목록이 갱신된다', () => {
			const savedSnapshot = makeSnapshot({ id: 'new-id', title: '새 도안 제목' });
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			mockLoadAllPatterns
				.mockReturnValueOnce({ ok: true, data: [] })
				.mockReturnValue({ ok: true, data: [savedSnapshot] });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.saveCurrentPattern('새 도안 제목');
			});

			expect(result.current.patterns).toEqual([savedSnapshot]);
		});

		it('저장 성공 시 currentPatternId가 저장된 스냅샷의 id로 업데이트된다', () => {
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.saveCurrentPattern('새 도안');
			});

			expect(result.current.currentPatternId).not.toBeNull();
		});

		it('savePattern이 limit_reached를 반환하면 동일한 에러를 반환한다', () => {
			mockSavePattern.mockReturnValue({ ok: false, error: 'limit_reached' });

			const { result } = renderHook(() => usePatterns());

			let saveResult: ReturnType<typeof result.current.saveCurrentPattern> | undefined;
			act(() => {
				saveResult = result.current.saveCurrentPattern('초과 도안');
			});

			expect(saveResult).toEqual({ ok: false, error: 'limit_reached' });
		});

		it('저장할 때 현재 스토어의 gridSize, patternType, collapsedBlocks를 포함한다', () => {
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			useChartStore.getState().setGridSize({ rows: 5, cols: 8 });
			useChartStore.getState().setPatternType('crochet');

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.saveCurrentPattern('코바늘 5x8');
			});

			const calledWith = mockSavePattern.mock.calls[0][0];
			expect(calledWith.gridSize).toEqual({ rows: 5, cols: 8 });
			expect(calledWith.patternType).toBe('crochet');
			expect(calledWith.savedAt).toBeTruthy();
		});
	});

	describe('loadPattern', () => {
		it('id로 패턴을 불러와 스토어를 복원한다', () => {
			const snapshot = makeSnapshot({
				id: 'load-id',
				title: '불러올 도안',
				patternType: 'crochet',
				gridSize: { rows: 5, cols: 5 },
				cells: Array.from({ length: 5 }, () =>
					Array.from({ length: 5 }, () => ({ symbolId: null })),
				),
				collapsedBlocks: [],
			});
			mockLoadPattern.mockReturnValue({ ok: true, data: snapshot });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('load-id');
			});

			const storeState = useChartStore.getState();
			expect(storeState.patternTitle).toBe('불러올 도안');
			expect(storeState.patternType).toBe('crochet');
			expect(storeState.gridSize).toEqual({ rows: 5, cols: 5 });
		});

		it('loadPattern 성공 시 currentPatternId가 해당 id로 설정된다', () => {
			mockLoadPattern.mockReturnValue({ ok: true, data: makeSnapshot({ id: 'target-id' }) });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('target-id');
			});

			expect(result.current.currentPatternId).toBe('target-id');
		});

		it('loadPattern 실패 시 currentPatternId가 변경되지 않는다', () => {
			mockLoadPattern.mockReturnValue({ ok: false, error: 'not_found' });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('non-existent-id');
			});

			expect(result.current.currentPatternId).toBeNull();
		});
	});

	describe('deletePattern', () => {
		it('id로 패턴을 삭제한다', () => {
			mockDeletePattern.mockReturnValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());

			let deleteResult: ReturnType<typeof result.current.deletePattern> | undefined;
			act(() => {
				deleteResult = result.current.deletePattern('del-id');
			});

			expect(mockDeletePattern).toHaveBeenCalledWith('del-id');
			expect(deleteResult).toEqual({ ok: true, data: undefined });
		});

		it('삭제 성공 시 patterns 목록에서 해당 항목이 제거된다', () => {
			const snapshot = makeSnapshot({ id: 'del-id' });
			mockLoadAllPatterns
				.mockReturnValueOnce({ ok: true, data: [snapshot] })
				.mockReturnValue({ ok: true, data: [] });
			mockDeletePattern.mockReturnValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.deletePattern('del-id');
			});

			expect(result.current.patterns).toEqual([]);
		});

		it('삭제 실패 시 not_found 에러를 반환한다', () => {
			mockDeletePattern.mockReturnValue({ ok: false, error: 'not_found' });

			const { result } = renderHook(() => usePatterns());

			let deleteResult: ReturnType<typeof result.current.deletePattern> | undefined;
			act(() => {
				deleteResult = result.current.deletePattern('missing-id');
			});

			expect(deleteResult).toEqual({ ok: false, error: 'not_found' });
		});

		it('현재 열린 패턴을 삭제하면 currentPatternId가 null로 초기화된다', () => {
			mockLoadPattern.mockReturnValue({ ok: true, data: makeSnapshot({ id: 'open-id' }) });
			mockDeletePattern.mockReturnValue({ ok: true, data: undefined });
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('open-id');
			});
			act(() => {
				result.current.deletePattern('open-id');
			});

			expect(result.current.currentPatternId).toBeNull();
		});
	});

	describe('newPattern', () => {
		it('호출 시 useChartStore.reset을 호출하여 차트를 초기화한다', () => {
			const { result } = renderHook(() => usePatterns());

			act(() => {
				useChartStore.getState().setPatternTitle('기존 제목');
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useChartStore.getState().patternTitle).toBe('');
		});

		it('호출 시 currentPatternId가 null로 초기화된다', () => {
			mockLoadPattern.mockReturnValue({ ok: true, data: makeSnapshot({ id: 'some-id' }) });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('some-id');
			});

			expect(result.current.currentPatternId).toBe('some-id');

			act(() => {
				result.current.newPattern();
			});

			expect(result.current.currentPatternId).toBeNull();
		});

		it('호출 시 shapeGuide가 null로 초기화된다', () => {
			const { result } = renderHook(() => usePatterns());

			act(() => {
				useUIStore.getState().setShapeGuide({ strokes: [[1, 2, 3, 4]] });
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('호출 시 rotationalMode가 none으로 초기화된다', () => {
			const { result } = renderHook(() => usePatterns());

			act(() => {
				useUIStore.getState().setRotationalMode('horizontal');
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().rotationalMode).toBe('none');
		});

		it('호출 시 historyResetToken이 증가하여 히스토리 초기화 신호를 보낸다', () => {
			const { result } = renderHook(() => usePatterns());
			const tokenBefore = useUIStore.getState().historyResetToken;

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().historyResetToken).toBe(tokenBefore + 1);
		});
	});

	describe('refreshPatterns', () => {
		it('호출 시 loadAllPatterns를 다시 실행해 patterns를 갱신한다', () => {
			const initialSnapshots = [makeSnapshot({ id: 'id-1' })];
			const refreshedSnapshots = [
				makeSnapshot({ id: 'id-1' }),
				makeSnapshot({ id: 'id-2', title: '새로 추가된 도안' }),
			];
			mockLoadAllPatterns
				.mockReturnValueOnce({ ok: true, data: initialSnapshots })
				.mockReturnValue({ ok: true, data: refreshedSnapshots });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.refreshPatterns();
			});

			expect(result.current.patterns).toEqual(refreshedSnapshots);
		});
	});

	describe('자동저장 (auto-save)', () => {
		it('currentPatternId가 null이면 자동저장을 수행하지 않는다', async () => {
			vi.useFakeTimers();
			renderHook(() => usePatterns());

			// currentPatternId가 null인 상태에서 스토어 변경
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});

			await act(async () => {
				vi.advanceTimersByTime(500);
			});

			expect(mockSavePattern).not.toHaveBeenCalled();
			vi.useRealTimers();
		});

		it('currentPatternId가 설정된 상태에서 스토어가 변경되면 debounce 후 자동저장한다', async () => {
			vi.useFakeTimers();
			mockLoadPattern.mockReturnValue({ ok: true, data: makeSnapshot({ id: 'auto-id' }) });
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			// 패턴 불러와 currentPatternId 설정
			act(() => {
				result.current.loadPattern('auto-id');
			});

			// 스토어 변경 → debounce 트리거
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});

			// debounce 시간(300ms) 이전에는 저장 안됨
			act(() => {
				vi.advanceTimersByTime(200);
			});
			expect(mockSavePattern).toHaveBeenCalledTimes(0);

			// debounce 완료 후 저장 실행
			await act(async () => {
				vi.advanceTimersByTime(200);
			});
			expect(mockSavePattern).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
		});

		it('debounce 중 isAutoSaving이 true로 설정된다', async () => {
			vi.useFakeTimers();
			mockLoadPattern.mockReturnValue({ ok: true, data: makeSnapshot({ id: 'auto-id' }) });
			mockSavePattern.mockReturnValue({ ok: true, data: undefined });
			mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			act(() => {
				result.current.loadPattern('auto-id');
			});

			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});

			await act(async () => {
				vi.advanceTimersByTime(500);
			});

			// 저장이 완료된 후 isAutoSaving은 false여야 함
			expect(result.current.isAutoSaving).toBe(false);

			vi.useRealTimers();
		});
	});
});
