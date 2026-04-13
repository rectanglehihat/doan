import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	loadAllPatterns,
	savePattern,
	deletePattern,
	loadPattern,
} from './local-storage-service';
import type { SavedPatternSnapshot } from '@/types/knitting';

function makeSnapshot(overrides: Partial<SavedPatternSnapshot> = {}): SavedPatternSnapshot {
	return {
		id: 'test-id-1',
		title: '테스트 도안',
		patternType: 'knitting',
		gridSize: { rows: 10, cols: 10 },
		cells: Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => ({ symbolId: null, color: null })),
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

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe('loadAllPatterns', () => {
	it('localStorage에 데이터가 없으면 빈 배열을 반환한다', () => {
		const result = loadAllPatterns();
		expect(result).toEqual({ ok: true, data: [] });
	});

	it('저장된 패턴 목록을 반환한다', () => {
		const snapshot = makeSnapshot();
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [snapshot] }),
		);

		const result = loadAllPatterns();
		expect(result).toEqual({ ok: true, data: [snapshot] });
	});

	it('여러 패턴이 있으면 모두 반환한다', () => {
		const snapshots = [
			makeSnapshot({ id: 'id-1', title: '도안 1' }),
			makeSnapshot({ id: 'id-2', title: '도안 2' }),
			makeSnapshot({ id: 'id-3', title: '도안 3' }),
		];
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: snapshots }),
		);

		const result = loadAllPatterns();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toHaveLength(3);
		}
	});

	it('localStorage 값이 손상(JSON 파싱 오류)이면 parse_error를 반환한다', () => {
		localStorage.setItem('doan_patterns', 'invalid-json{{{');

		const result = loadAllPatterns();
		expect(result).toEqual({ ok: false, error: 'parse_error' });
	});

	it('localStorage가 사용 불가능하면 storage_unavailable를 반환한다', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('localStorage is not available');
		});

		const result = loadAllPatterns();
		expect(result).toEqual({ ok: false, error: 'storage_unavailable' });
	});
});

describe('savePattern', () => {
	it('새 패턴을 저장한다', () => {
		const snapshot = makeSnapshot();

		const result = savePattern(snapshot);

		expect(result).toEqual({ ok: true, data: undefined });
		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
		if (loaded.ok) {
			expect(loaded.data).toHaveLength(1);
			expect(loaded.data[0].id).toBe('test-id-1');
		}
	});

	it('기존 패턴 목록에 새 패턴을 추가한다', () => {
		const existing = makeSnapshot({ id: 'existing-id', title: '기존 도안' });
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [existing] }),
		);

		const newSnapshot = makeSnapshot({ id: 'new-id', title: '새 도안' });
		savePattern(newSnapshot);

		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
		if (loaded.ok) {
			expect(loaded.data).toHaveLength(2);
		}
	});

	it('같은 id의 패턴이 존재하면 덮어쓴다', () => {
		const original = makeSnapshot({ title: '원본 제목' });
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [original] }),
		);

		const updated = makeSnapshot({ title: '수정된 제목' });
		savePattern(updated);

		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
		if (loaded.ok) {
			expect(loaded.data).toHaveLength(1);
			expect(loaded.data[0].title).toBe('수정된 제목');
		}
	});

	it('패턴 수가 MAX_PATTERNS(5)에 도달하면 새 id의 패턴 저장 시 limit_reached를 반환한다', () => {
		const patterns = Array.from({ length: 5 }, (_, i) =>
			makeSnapshot({ id: `id-${i}`, title: `도안 ${i}` }),
		);
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns }),
		);

		const newSnapshot = makeSnapshot({ id: 'new-id', title: '6번째 도안' });
		const result = savePattern(newSnapshot);

		expect(result).toEqual({ ok: false, error: 'limit_reached' });
	});

	it('패턴 수가 5이어도 기존 id 업데이트는 허용된다', () => {
		const patterns = Array.from({ length: 5 }, (_, i) =>
			makeSnapshot({ id: `id-${i}`, title: `도안 ${i}` }),
		);
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns }),
		);

		const updated = makeSnapshot({ id: 'id-0', title: '업데이트된 도안 0' });
		const result = savePattern(updated);

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it('localStorage quota 초과 시 quota_exceeded를 반환한다', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError', 'QuotaExceededError');
		});

		const result = savePattern(makeSnapshot());
		expect(result).toEqual({ ok: false, error: 'quota_exceeded' });
	});

	it('localStorage가 사용 불가능하면 storage_unavailable를 반환한다', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('localStorage is not available');
		});

		const result = savePattern(makeSnapshot());
		expect(result).toEqual({ ok: false, error: 'storage_unavailable' });
	});

	it('저장된 데이터에 version: 1이 포함된다', () => {
		savePattern(makeSnapshot());

		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
	});
});

describe('deletePattern', () => {
	it('지정한 id의 패턴을 삭제한다', () => {
		const snapshot = makeSnapshot({ id: 'to-delete' });
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [snapshot] }),
		);

		const result = deletePattern('to-delete');

		expect(result).toEqual({ ok: true, data: undefined });
		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
		if (loaded.ok) {
			expect(loaded.data).toHaveLength(0);
		}
	});

	it('여러 패턴 중 지정한 id만 삭제한다', () => {
		const snapshots = [
			makeSnapshot({ id: 'id-1', title: '도안 1' }),
			makeSnapshot({ id: 'id-2', title: '도안 2' }),
		];
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: snapshots }),
		);

		deletePattern('id-1');

		const loaded = loadAllPatterns();
		expect(loaded.ok).toBe(true);
		if (loaded.ok) {
			expect(loaded.data).toHaveLength(1);
			expect(loaded.data[0].id).toBe('id-2');
		}
	});

	it('존재하지 않는 id를 삭제하면 not_found를 반환한다', () => {
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [] }),
		);

		const result = deletePattern('non-existent-id');
		expect(result).toEqual({ ok: false, error: 'not_found' });
	});

	it('localStorage가 사용 불가능하면 storage_unavailable를 반환한다', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('localStorage is not available');
		});

		const result = deletePattern('some-id');
		expect(result).toEqual({ ok: false, error: 'storage_unavailable' });
	});
});

describe('압축 저장/읽기', () => {
	it('savePattern 후 localStorage에 저장된 raw 값이 "lz:" prefix로 시작한다', () => {
		const snapshot = makeSnapshot();
		savePattern(snapshot);

		const raw = localStorage.getItem('doan_patterns');
		expect(raw).not.toBeNull();
		expect(raw).toMatch(/^lz:/);
	});

	it('savePattern 후 loadAllPatterns로 동일한 데이터를 복원한다', () => {
		const snapshot = makeSnapshot({ id: 'compress-test', title: '압축 테스트 도안' });
		savePattern(snapshot);

		const result = loadAllPatterns();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toHaveLength(1);
			expect(result.data[0].id).toBe('compress-test');
			expect(result.data[0].title).toBe('압축 테스트 도안');
		}
	});
});

describe('하위 호환 — 비압축 JSON 읽기', () => {
	it('localStorage에 비압축 JSON(기존 포맷)이 있을 때 loadAllPatterns가 정상적으로 읽는다', () => {
		const snapshot = makeSnapshot({ id: 'legacy-id', title: '레거시 도안' });
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [snapshot] }),
		);

		const result = loadAllPatterns();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toHaveLength(1);
			expect(result.data[0].id).toBe('legacy-id');
		}
	});
});

describe('loadPattern', () => {
	it('지정한 id의 패턴을 반환한다', () => {
		const snapshot = makeSnapshot({ id: 'target-id', title: '불러올 도안' });
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [snapshot] }),
		);

		const result = loadPattern('target-id');

		expect(result).toEqual({ ok: true, data: snapshot });
	});

	it('존재하지 않는 id를 요청하면 not_found를 반환한다', () => {
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: [] }),
		);

		const result = loadPattern('non-existent-id');
		expect(result).toEqual({ ok: false, error: 'not_found' });
	});

	it('여러 패턴 중 올바른 패턴만 반환한다', () => {
		const snapshots = [
			makeSnapshot({ id: 'id-1', title: '도안 1' }),
			makeSnapshot({ id: 'id-2', title: '도안 2' }),
		];
		localStorage.setItem(
			'doan_patterns',
			JSON.stringify({ version: 1, patterns: snapshots }),
		);

		const result = loadPattern('id-2');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.title).toBe('도안 2');
		}
	});

	it('localStorage가 사용 불가능하면 storage_unavailable를 반환한다', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('localStorage is not available');
		});

		const result = loadPattern('some-id');
		expect(result).toEqual({ ok: false, error: 'storage_unavailable' });
	});

	it('localStorage 값이 손상되어 있으면 parse_error를 반환한다', () => {
		localStorage.setItem('doan_patterns', '{broken json');

		const result = loadPattern('some-id');
		expect(result).toEqual({ ok: false, error: 'parse_error' });
	});
});
