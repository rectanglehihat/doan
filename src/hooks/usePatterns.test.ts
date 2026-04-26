import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePatterns } from './usePatterns';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import type { SavedPatternSnapshot } from '@/types/knitting';
import type { User } from '@supabase/supabase-js';

// patterns-api 전체 모킹
vi.mock('@/lib/api/patterns-api', () => ({
	fetchPatterns: vi.fn(),
	savePattern: vi.fn(),
	deletePattern: vi.fn(),
}));

// migrate-to-cloud 모킹
vi.mock('@/lib/utils/migrate-to-cloud', () => ({
	migrateLocalPatternsToCloud: vi.fn().mockResolvedValue({ migrated: 0, failed: 0 }),
}));

// local-storage-service 모킹
vi.mock('@/lib/utils/local-storage-service', () => ({
	savePattern: vi.fn(),
	loadAllPatterns: vi.fn(),
	deletePattern: vi.fn(),
}));

import * as patternsApi from '@/lib/api/patterns-api';
import { migrateLocalPatternsToCloud } from '@/lib/utils/migrate-to-cloud';
import * as localStorageService from '@/lib/utils/local-storage-service';

const mockFetchPatterns = vi.mocked(patternsApi.fetchPatterns);
const mockSavePattern = vi.mocked(patternsApi.savePattern);
const mockDeletePattern = vi.mocked(patternsApi.deletePattern);
const mockMigrateLocalPatternsToCloud = vi.mocked(migrateLocalPatternsToCloud);

const mockLocalSavePattern = vi.mocked(localStorageService.savePattern);
const mockLocalLoadAllPatterns = vi.mocked(localStorageService.loadAllPatterns);
const mockLocalDeletePattern = vi.mocked(localStorageService.deletePattern);

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
		collapsedColumnBlocks: [],
		shapeGuide: null,
		rotationalMode: 'none',
		savedAt: '2025-01-01T00:00:00.000Z',
		difficulty: 0,
		materials: '',
		rowAnnotations: [],
		rangeAnnotations: [],
		columnAnnotations: [],
		...overrides,
	};
}

const fakeUser = { id: 'user-123', email: 'test@test.com' } as User;

beforeEach(async () => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
	useUserStore.getState().reset();
	vi.clearAllMocks();
	// 로그인 상태 시뮬레이션
	useUserStore.getState().setUser(fakeUser);
	mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });
	// localStorage mock 기본값
	mockLocalLoadAllPatterns.mockReturnValue({ ok: true, data: [] });
	mockLocalSavePattern.mockReturnValue({ ok: true, data: undefined });
	mockLocalDeletePattern.mockReturnValue({ ok: true, data: undefined });
});

describe('usePatterns', () => {
	describe('초기 상태', () => {
		it('patterns는 빈 배열로 시작한다', async () => {
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			await waitFor(() => {
				expect(result.current.patterns).toEqual([]);
			});
		});

		it('isAutoSaving은 false로 시작한다', async () => {
			const { result } = renderHook(() => usePatterns());

			await act(async () => {});

			expect(result.current.isAutoSaving).toBe(false);
		});

		it('currentPatternId는 null로 시작한다', async () => {
			const { result } = renderHook(() => usePatterns());

			await act(async () => {});

			expect(result.current.currentPatternId).toBeNull();
		});

		it('마운트 시 fetchPatterns를 호출해 패턴 목록을 불러온다', async () => {
			const snapshots = [makeSnapshot()];
			mockFetchPatterns.mockResolvedValue({ ok: true, data: snapshots });

			const { result } = renderHook(() => usePatterns());

			await waitFor(() => {
				expect(result.current.patterns).toEqual(snapshots);
			});

			expect(mockFetchPatterns).toHaveBeenCalledWith('user-123');
		});
	});

	describe('saveCurrentPattern', () => {
		it('제목을 받아 현재 스토어 상태를 저장한다', async () => {
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });
			useChartStore.getState().setPatternTitle('기존 제목');

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			let saveResult:
				| Awaited<ReturnType<typeof result.current.saveCurrentPattern>>
				| undefined;
			await act(async () => {
				saveResult = await result.current.saveCurrentPattern('새 도안 제목');
			});

			expect(mockSavePattern).toHaveBeenCalledTimes(1);
			const calledWith = mockSavePattern.mock.calls[0][0];
			expect(calledWith.title).toBe('새 도안 제목');
			expect(saveResult).toEqual({ ok: true, data: undefined });
		});

		it('저장 성공 시 patterns 목록이 갱신된다', async () => {
			const savedSnapshot = makeSnapshot({ id: 'new-id', title: '새 도안 제목' });
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });
			mockFetchPatterns
				.mockResolvedValueOnce({ ok: true, data: [] })
				.mockResolvedValue({ ok: true, data: [savedSnapshot] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.saveCurrentPattern('새 도안 제목');
			});

			expect(result.current.patterns).toEqual([savedSnapshot]);
		});

		it('저장 성공 시 currentPatternId가 저장된 스냅샷의 id로 업데이트된다', async () => {
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.saveCurrentPattern('새 도안');
			});

			expect(result.current.currentPatternId).not.toBeNull();
		});

		it('savePattern이 에러를 반환하면 동일한 에러를 반환한다', async () => {
			mockSavePattern.mockResolvedValue({ ok: false, error: 'limit_reached' });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			let saveResult:
				| Awaited<ReturnType<typeof result.current.saveCurrentPattern>>
				| undefined;
			await act(async () => {
				saveResult = await result.current.saveCurrentPattern('초과 도안');
			});

			expect(saveResult).toEqual({ ok: false, error: 'limit_reached' });
		});

		it('저장할 때 현재 스토어의 gridSize, patternType, collapsedBlocks를 포함한다', async () => {
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });
			useChartStore.getState().setGridSize({ rows: 5, cols: 8 });
			useChartStore.getState().setPatternType('crochet');

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.saveCurrentPattern('코바늘 5x8');
			});

			const calledWith = mockSavePattern.mock.calls[0][0];
			expect(calledWith.gridSize).toEqual({ rows: 5, cols: 8 });
			expect(calledWith.patternType).toBe('crochet');
			expect(calledWith.savedAt).toBeTruthy();
		});

		it('저장할 때 현재 스토어의 difficulty와 materials를 포함한다', async () => {
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });
			useChartStore.getState().setDifficulty(3);
			useChartStore.getState().setMaterials('대바늘 4mm');

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.saveCurrentPattern('난이도 있는 도안');
			});

			const calledWith = mockSavePattern.mock.calls[0][0];
			expect(calledWith.difficulty).toBe(3);
			expect(calledWith.materials).toBe('대바늘 4mm');
		});

		it('saveCurrentPattern 호출 시 userId가 함께 전달된다', async () => {
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.saveCurrentPattern('도안 제목');
			});

			expect(mockSavePattern).toHaveBeenCalledWith(
				expect.objectContaining({ title: '도안 제목' }),
				'user-123',
			);
		});
	});

	describe('loadPattern', () => {
		it('id로 패턴을 불러와 스토어를 복원한다', async () => {
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
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });

			const { result } = renderHook(() => usePatterns());

			// 훅 마운트 후 fetchPatterns 완료 대기
			await act(async () => {});

			// loadPattern은 동기적으로 patterns 상태에서 조회
			act(() => {
				result.current.loadPattern('load-id');
			});

			const storeState = useChartStore.getState();
			expect(storeState.patternTitle).toBe('불러올 도안');
			expect(storeState.patternType).toBe('crochet');
			expect(storeState.gridSize).toEqual({ rows: 5, cols: 5 });
		});

		it('loadPattern 성공 시 currentPatternId가 해당 id로 설정된다', async () => {
			const snapshot = makeSnapshot({ id: 'target-id' });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				result.current.loadPattern('target-id');
			});

			expect(result.current.currentPatternId).toBe('target-id');
		});

		it('loadPattern 실패 시 currentPatternId가 변경되지 않는다', async () => {
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				result.current.loadPattern('non-existent-id');
			});

			expect(result.current.currentPatternId).toBeNull();
		});

		it('loadPattern 성공 시 difficulty와 materials가 스토어에 복원된다', async () => {
			const snapshot = makeSnapshot({
				id: 'load-id',
				difficulty: 4,
				materials: '실 200g',
			});
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				result.current.loadPattern('load-id');
			});

			const storeState = useChartStore.getState();
			expect(storeState.difficulty).toBe(4);
			expect(storeState.materials).toBe('실 200g');
		});
	});

	describe('deletePattern', () => {
		it('id로 패턴을 삭제한다', async () => {
			mockDeletePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			let deleteResult:
				| Awaited<ReturnType<typeof result.current.deletePattern>>
				| undefined;
			await act(async () => {
				deleteResult = await result.current.deletePattern('del-id');
			});

			expect(mockDeletePattern).toHaveBeenCalledWith('del-id');
			expect(deleteResult).toEqual({ ok: true, data: undefined });
		});

		it('삭제 성공 시 patterns 목록에서 해당 항목이 제거된다', async () => {
			const snapshot = makeSnapshot({ id: 'del-id' });
			mockFetchPatterns
				.mockResolvedValueOnce({ ok: true, data: [snapshot] })
				.mockResolvedValue({ ok: true, data: [] });
			mockDeletePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.deletePattern('del-id');
			});

			expect(result.current.patterns).toEqual([]);
		});

		it('삭제 실패 시 not_found 에러를 반환한다', async () => {
			mockDeletePattern.mockResolvedValue({ ok: false, error: 'not_found' });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			let deleteResult:
				| Awaited<ReturnType<typeof result.current.deletePattern>>
				| undefined;
			await act(async () => {
				deleteResult = await result.current.deletePattern('missing-id');
			});

			expect(deleteResult).toEqual({ ok: false, error: 'not_found' });
		});

		it('현재 열린 패턴을 삭제하면 currentPatternId가 null로 초기화된다', async () => {
			const snapshot = makeSnapshot({ id: 'open-id' });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });
			mockDeletePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				result.current.loadPattern('open-id');
			});

			await act(async () => {
				await result.current.deletePattern('open-id');
			});

			expect(result.current.currentPatternId).toBeNull();
		});
	});

	describe('newPattern', () => {
		it('호출 시 useChartStore.reset을 호출하여 차트를 초기화한다', async () => {
			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				useChartStore.getState().setPatternTitle('기존 제목');
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useChartStore.getState().patternTitle).toBe('');
		});

		it('호출 시 currentPatternId가 null로 초기화된다', async () => {
			const snapshot = makeSnapshot({ id: 'some-id' });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				result.current.loadPattern('some-id');
			});

			expect(result.current.currentPatternId).toBe('some-id');

			act(() => {
				result.current.newPattern();
			});

			expect(result.current.currentPatternId).toBeNull();
		});

		it('호출 시 shapeGuide가 null로 초기화된다', async () => {
			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				useUIStore.getState().setShapeGuide({ strokes: [[1, 2, 3, 4]] });
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('호출 시 rotationalMode가 none으로 초기화된다', async () => {
			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			act(() => {
				useUIStore.getState().setRotationalMode('horizontal');
			});

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().rotationalMode).toBe('none');
		});

		it('호출 시 historyResetToken이 증가하여 히스토리 초기화 신호를 보낸다', async () => {
			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			const tokenBefore = useUIStore.getState().historyResetToken;

			act(() => {
				result.current.newPattern();
			});

			expect(useUIStore.getState().historyResetToken).toBe(tokenBefore + 1);
		});
	});

	describe('refreshPatterns', () => {
		it('호출 시 fetchPatterns를 다시 실행해 patterns를 갱신한다', async () => {
			const initialSnapshots = [makeSnapshot({ id: 'id-1' })];
			const refreshedSnapshots = [
				makeSnapshot({ id: 'id-1' }),
				makeSnapshot({ id: 'id-2', title: '새로 추가된 도안' }),
			];
			mockFetchPatterns
				.mockResolvedValueOnce({ ok: true, data: initialSnapshots })
				.mockResolvedValue({ ok: true, data: refreshedSnapshots });

			const { result } = renderHook(() => usePatterns());
			await act(async () => {});

			await act(async () => {
				await result.current.refreshPatterns();
			});

			expect(result.current.patterns).toEqual(refreshedSnapshots);
		});
	});

	describe('마이그레이션 트리거', () => {
		it('사용자가 처음 로그인 시 migrateLocalPatternsToCloud가 호출된다', async () => {
			// 처음엔 user 없는 상태로 시작
			useUserStore.getState().reset();
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });

			const { result } = renderHook(() => usePatterns());

			// 로그인 시뮬레이션: user: null → user: { id: 'user-123' }
			await act(async () => {
				useUserStore.getState().setUser(fakeUser);
			});

			await waitFor(() => {
				expect(mockMigrateLocalPatternsToCloud).toHaveBeenCalledWith('user-123');
			});

			expect(result.current).toBeDefined();
		});
	});

	describe('자동저장 (auto-save)', () => {
		it('currentPatternId가 null이면 자동저장을 수행하지 않는다', async () => {
			vi.useFakeTimers();
			renderHook(() => usePatterns());

			await act(async () => {});

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
			const snapshot = makeSnapshot({ id: 'auto-id' });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());

			await act(async () => {});

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

		it('debounce 완료 후 isAutoSaving이 false로 돌아온다', async () => {
			vi.useFakeTimers();
			const snapshot = makeSnapshot({ id: 'auto-id' });
			mockFetchPatterns.mockResolvedValue({ ok: true, data: [snapshot] });
			mockSavePattern.mockResolvedValue({ ok: true, data: undefined });

			const { result } = renderHook(() => usePatterns());

			await act(async () => {});

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

describe('비로그인 상태 (localStorage 분기)', () => {
	beforeEach(() => {
		useChartStore.getState().reset();
		useUIStore.getState().reset();
		// user를 null로 초기화 (비로그인 상태)
		useUserStore.getState().reset();
	});

	it('user=null 상태로 마운트 시 localLoadAllPatterns가 호출되고 반환된 패턴이 patterns에 세팅된다', async () => {
		const localSnapshots = [makeSnapshot({ id: 'local-1', title: '로컬 도안' })];
		mockLocalLoadAllPatterns.mockReturnValue({ ok: true, data: localSnapshots });

		const { result } = renderHook(() => usePatterns());

		await waitFor(() => {
			expect(mockLocalLoadAllPatterns).toHaveBeenCalled();
			expect(result.current.patterns).toEqual(localSnapshots);
		});

		// Supabase fetchPatterns는 호출되지 않아야 한다
		expect(mockFetchPatterns).not.toHaveBeenCalled();
	});

	it('user=null 상태에서 saveCurrentPattern 호출 시 localSavePattern이 호출되고 { ok: true } 계열을 반환한다', async () => {
		mockLocalSavePattern.mockReturnValue({ ok: true, data: undefined });

		const { result } = renderHook(() => usePatterns());
		await act(async () => {});

		let saveResult:
			| Awaited<ReturnType<typeof result.current.saveCurrentPattern>>
			| undefined;
		await act(async () => {
			saveResult = await result.current.saveCurrentPattern('로컬 저장 도안');
		});

		expect(mockLocalSavePattern).toHaveBeenCalledTimes(1);
		const calledWith = mockLocalSavePattern.mock.calls[0][0];
		expect(calledWith.title).toBe('로컬 저장 도안');
		expect(saveResult).toMatchObject({ ok: true });

		// Supabase savePattern은 호출되지 않아야 한다
		expect(mockSavePattern).not.toHaveBeenCalled();
	});

	it('user=null 상태에서 deletePattern 호출 시 localDeletePattern이 호출된다', async () => {
		const localSnapshot = makeSnapshot({ id: 'local-del-id' });
		mockLocalLoadAllPatterns.mockReturnValue({ ok: true, data: [localSnapshot] });
		mockLocalDeletePattern.mockReturnValue({ ok: true, data: undefined });

		const { result } = renderHook(() => usePatterns());
		await act(async () => {});

		let deleteResult:
			| Awaited<ReturnType<typeof result.current.deletePattern>>
			| undefined;
		await act(async () => {
			deleteResult = await result.current.deletePattern('local-del-id');
		});

		expect(mockLocalDeletePattern).toHaveBeenCalledWith('local-del-id');
		expect(deleteResult).toMatchObject({ ok: true });

		// Supabase deletePattern은 호출되지 않아야 한다
		expect(mockDeletePattern).not.toHaveBeenCalled();
	});

	it('user=null, currentPatternId가 설정된 상태에서 스토어 변경 시 debounce 후 localSavePattern이 호출된다', async () => {
		vi.useFakeTimers();
		const localSnapshot = makeSnapshot({ id: 'local-auto-id' });
		mockLocalLoadAllPatterns.mockReturnValue({ ok: true, data: [localSnapshot] });
		mockLocalSavePattern.mockReturnValue({ ok: true, data: undefined });

		const { result } = renderHook(() => usePatterns());
		await act(async () => {});

		// 패턴 불러와 currentPatternId 설정
		act(() => {
			result.current.loadPattern('local-auto-id');
		});

		// 스토어 변경 → debounce 트리거
		act(() => {
			useChartStore.getState().setCellSymbol(0, 0, 'k');
		});

		// debounce 완료 전에는 저장 안됨
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(mockLocalSavePattern).toHaveBeenCalledTimes(0);

		// debounce 완료 후 localSavePattern 호출
		await act(async () => {
			vi.advanceTimersByTime(200);
		});
		expect(mockLocalSavePattern).toHaveBeenCalledTimes(1);

		// Supabase savePattern은 호출되지 않아야 한다
		expect(mockSavePattern).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('로그인 상태에서 로그아웃(setUser(null)) 하면 localLoadAllPatterns가 호출되어 localStorage 패턴이 로드된다', async () => {
		// 먼저 로그인 상태로 시작
		useUserStore.getState().setUser(fakeUser);
		mockFetchPatterns.mockResolvedValue({ ok: true, data: [] });

		const localSnapshots = [makeSnapshot({ id: 'local-after-logout', title: '로컬 도안' })];
		mockLocalLoadAllPatterns.mockReturnValue({ ok: true, data: localSnapshots });

		const { result } = renderHook(() => usePatterns());
		await act(async () => {});

		// 로그아웃 시뮬레이션
		await act(async () => {
			useUserStore.getState().setUser(null);
		});

		await waitFor(() => {
			expect(mockLocalLoadAllPatterns).toHaveBeenCalled();
			expect(result.current.patterns).toEqual(localSnapshots);
		});
	});
});
