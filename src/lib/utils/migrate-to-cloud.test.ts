import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SavedPatternSnapshot } from '@/types/knitting';

vi.mock('@/lib/utils/local-storage-service', () => ({
	loadAllPatterns: vi.fn(),
}));

vi.mock('@/lib/api/patterns-api', () => ({
	savePattern: vi.fn(),
}));

import * as localStorageService from '@/lib/utils/local-storage-service';
import * as patternsApi from '@/lib/api/patterns-api';
import { migrateLocalPatternsToCloud } from './migrate-to-cloud';

const mockLoadAllPatterns = vi.mocked(localStorageService.loadAllPatterns);
const mockSavePattern = vi.mocked(patternsApi.savePattern);

function makeSnapshot(overrides: Partial<SavedPatternSnapshot> = {}): SavedPatternSnapshot {
	return {
		id: `snap-${Math.random().toString(36).slice(2)}`,
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

function migrationFlagKey(userId: string): string {
	return `doan_cloud_migrated_${userId}`;
}

beforeEach(() => {
	localStorage.clear();
	vi.clearAllMocks();
});

describe('migrateLocalPatternsToCloud', () => {
	it('이미 마이그레이션된 경우(플래그 존재) { migrated: 0, failed: 0 }을 반환하고 savePattern을 호출하지 않는다', async () => {
		localStorage.setItem(migrationFlagKey('user-123'), 'true');

		const result = await migrateLocalPatternsToCloud('user-123');

		expect(result).toEqual({ migrated: 0, failed: 0 });
		expect(mockSavePattern).not.toHaveBeenCalled();
	});

	it('로컬 패턴이 없는 경우 { migrated: 0, failed: 0 }을 반환하고 플래그를 설정한다', async () => {
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

		const result = await migrateLocalPatternsToCloud('user-123');

		expect(result).toEqual({ migrated: 0, failed: 0 });
		expect(localStorage.getItem(migrationFlagKey('user-123'))).toBeTruthy();
	});

	it('로컬 패턴 3개 모두 성공 시 { migrated: 3, failed: 0 }을 반환하고 플래그를 설정한다', async () => {
		const snapshots = [
			makeSnapshot({ id: 'snap-1', title: '도안 1' }),
			makeSnapshot({ id: 'snap-2', title: '도안 2' }),
			makeSnapshot({ id: 'snap-3', title: '도안 3' }),
		];
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: snapshots });
		mockSavePattern.mockResolvedValue({ ok: true, data: undefined });

		const result = await migrateLocalPatternsToCloud('user-123');

		expect(result).toEqual({ migrated: 3, failed: 0 });
		expect(mockSavePattern).toHaveBeenCalledTimes(3);
		expect(localStorage.getItem(migrationFlagKey('user-123'))).toBeTruthy();
	});

	it('3개 중 1개 실패 시 { migrated: 2, failed: 1 }을 반환하고 플래그를 설정하지 않는다', async () => {
		const snapshots = [
			makeSnapshot({ id: 'snap-1', title: '도안 1' }),
			makeSnapshot({ id: 'snap-2', title: '도안 2' }),
			makeSnapshot({ id: 'snap-3', title: '도안 3' }),
		];
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: snapshots });
		mockSavePattern
			.mockResolvedValueOnce({ ok: true, data: undefined })
			.mockResolvedValueOnce({ ok: false, error: 'upload_failed' })
			.mockResolvedValueOnce({ ok: true, data: undefined });

		const result = await migrateLocalPatternsToCloud('user-123');

		expect(result).toEqual({ migrated: 2, failed: 1 });
		expect(localStorage.getItem(migrationFlagKey('user-123'))).toBeNull();
	});

	it('다른 userId는 다른 플래그 키를 사용한다', async () => {
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

		await migrateLocalPatternsToCloud('user-aaa');
		await migrateLocalPatternsToCloud('user-bbb');

		expect(localStorage.getItem(migrationFlagKey('user-aaa'))).toBeTruthy();
		expect(localStorage.getItem(migrationFlagKey('user-bbb'))).toBeTruthy();

		// user-aaa의 플래그가 user-bbb에 영향을 주지 않아야 함
		localStorage.removeItem(migrationFlagKey('user-bbb'));
		expect(localStorage.getItem(migrationFlagKey('user-bbb'))).toBeNull();
		expect(localStorage.getItem(migrationFlagKey('user-aaa'))).toBeTruthy();
	});

	it('user-aaa의 마이그레이션 완료 플래그가 있어도 user-bbb는 마이그레이션을 수행한다', async () => {
		localStorage.setItem(migrationFlagKey('user-aaa'), 'true');
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: [] });

		await migrateLocalPatternsToCloud('user-bbb');

		expect(mockLoadAllPatterns).toHaveBeenCalled();
	});

	it('loadAllPatterns가 실패할 경우 graceful하게 { migrated: 0, failed: 0 }을 반환한다', async () => {
		mockLoadAllPatterns.mockReturnValue({ ok: false, error: 'storage_unavailable' });

		const result = await migrateLocalPatternsToCloud('user-123');

		expect(result).toEqual({ migrated: 0, failed: 0 });
		expect(mockSavePattern).not.toHaveBeenCalled();
	});

	it('savePattern 각 호출에 userId가 함께 전달된다', async () => {
		const snapshot = makeSnapshot({ id: 'snap-1' });
		mockLoadAllPatterns.mockReturnValue({ ok: true, data: [snapshot] });
		mockSavePattern.mockResolvedValue({ ok: true, data: undefined });

		await migrateLocalPatternsToCloud('user-xyz');

		expect(mockSavePattern).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'snap-1' }),
			'user-xyz',
		);
	});
});
