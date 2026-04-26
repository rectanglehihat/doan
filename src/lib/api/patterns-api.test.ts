import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SavedPatternSnapshot } from '@/types/knitting';

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/client', () => ({
	createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/client';
import { fetchPatterns, savePattern, deletePattern } from './patterns-api';

const mockCreateClient = vi.mocked(createClient);

// Supabase chained builder 헬퍼
function makeQueryBuilder(overrides: {
	data?: unknown;
	error?: { message: string } | null;
}) {
	const result = { data: overrides.data ?? null, error: overrides.error ?? null };
	const builder = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		order: vi.fn().mockResolvedValue(result),
		upsert: vi.fn().mockResolvedValue(result),
		delete: vi.fn().mockReturnThis(),
	};
	return builder;
}

function makeClient(builder: ReturnType<typeof makeQueryBuilder>) {
	return {
		from: vi.fn().mockReturnValue(builder),
	};
}

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

function makeDbRow(overrides: Partial<{
	id: string;
	user_id: string;
	title: string;
	pattern_type: 'knitting' | 'crochet';
	grid_rows: number;
	grid_cols: number;
	cells: unknown;
	collapsed_blocks: unknown;
	collapsed_column_blocks: unknown;
	shape_guide: unknown;
	rotational_mode: 'none' | 'horizontal' | 'vertical' | 'both';
	difficulty: number;
	materials: string;
	row_annotations: unknown;
	range_annotations: unknown;
	column_annotations: unknown;
	saved_at: string;
	created_at: string;
	updated_at: string;
}> = {}) {
	return {
		id: 'snap-id-1',
		user_id: 'user-123',
		title: '테스트 도안',
		pattern_type: 'knitting' as const,
		grid_rows: 10,
		grid_cols: 10,
		cells: Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => ({ symbolId: null })),
		),
		collapsed_blocks: [],
		collapsed_column_blocks: [],
		shape_guide: null,
		rotational_mode: 'none' as const,
		difficulty: 0,
		materials: '',
		row_annotations: [],
		range_annotations: [],
		column_annotations: [],
		saved_at: '2025-01-01T00:00:00.000Z',
		created_at: '2025-01-01T00:00:00.000Z',
		updated_at: '2025-01-01T00:00:00.000Z',
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('fetchPatterns', () => {
	it('userId로 패턴 목록을 DB Row에서 SavedPatternSnapshot으로 변환하여 반환한다', async () => {
		const row = makeDbRow({ id: 'snap-id-1', title: '테스트 도안', user_id: 'user-123' });
		const builder = makeQueryBuilder({ data: [row] });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const result = await fetchPatterns('user-123');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toHaveLength(1);
			const snapshot = result.data[0];
			expect(snapshot.id).toBe('snap-id-1');
			expect(snapshot.title).toBe('테스트 도안');
			expect(snapshot.patternType).toBe('knitting');
			expect(snapshot.gridSize).toEqual({ rows: 10, cols: 10 });
			expect(snapshot.savedAt).toBe('2025-01-01T00:00:00.000Z');
		}
	});

	it('DB Row의 snake_case 필드를 camelCase SavedPatternSnapshot으로 변환한다', async () => {
		const row = makeDbRow({
			pattern_type: 'crochet',
			grid_rows: 5,
			grid_cols: 8,
			rotational_mode: 'horizontal',
			collapsed_blocks: [{ id: 'cb-1', startRow: 0, endRow: 2 }],
			collapsed_column_blocks: [],
			shape_guide: { strokes: [[1, 2, 3, 4]] },
			difficulty: 3,
			materials: '대바늘 4mm',
			row_annotations: [],
			range_annotations: [],
			column_annotations: [],
		});
		const builder = makeQueryBuilder({ data: [row] });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const result = await fetchPatterns('user-123');

		expect(result.ok).toBe(true);
		if (result.ok) {
			const snapshot = result.data[0];
			expect(snapshot.patternType).toBe('crochet');
			expect(snapshot.gridSize).toEqual({ rows: 5, cols: 8 });
			expect(snapshot.rotationalMode).toBe('horizontal');
			expect(snapshot.collapsedBlocks).toEqual([{ id: 'cb-1', startRow: 0, endRow: 2 }]);
			expect(snapshot.shapeGuide).toEqual({ strokes: [[1, 2, 3, 4]] });
			expect(snapshot.difficulty).toBe(3);
			expect(snapshot.materials).toBe('대바늘 4mm');
		}
	});

	it('Supabase 에러 시 { ok: false, error: 메시지 }를 반환한다', async () => {
		const builder = makeQueryBuilder({ data: null, error: { message: 'DB connection failed' } });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const result = await fetchPatterns('user-123');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('DB connection failed');
		}
	});

	it('패턴이 없으면 빈 배열을 반환한다', async () => {
		const builder = makeQueryBuilder({ data: [] });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const result = await fetchPatterns('user-123');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toEqual([]);
		}
	});

	it('user_id 파라미터로 eq 필터를 적용하고 saved_at 내림차순으로 정렬한다', async () => {
		const builder = makeQueryBuilder({ data: [] });
		const client = makeClient(builder);
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		await fetchPatterns('user-abc');

		expect(client.from).toHaveBeenCalledWith('patterns');
		expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-abc');
		expect(builder.order).toHaveBeenCalledWith('saved_at', { ascending: false });
	});
});

describe('savePattern', () => {
	it('성공 시 { ok: true, data: undefined }를 반환한다', async () => {
		const builder = makeQueryBuilder({ data: null, error: null });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const snapshot = makeSnapshot();
		const result = await savePattern(snapshot, 'user-123');

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it('Supabase 에러 시 { ok: false, error: 메시지 }를 반환한다', async () => {
		const builder = makeQueryBuilder({ data: null, error: { message: 'upsert failed' } });
		mockCreateClient.mockReturnValue(makeClient(builder) as ReturnType<typeof createClient>);

		const snapshot = makeSnapshot();
		const result = await savePattern(snapshot, 'user-123');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('upsert failed');
		}
	});

	it('upsert 호출 시 userId가 user_id로 포함된다', async () => {
		const builder = makeQueryBuilder({ data: null, error: null });
		const client = makeClient(builder);
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		const snapshot = makeSnapshot({ id: 'snap-id-1' });
		await savePattern(snapshot, 'user-xyz');

		expect(client.from).toHaveBeenCalledWith('patterns');
		expect(builder.upsert).toHaveBeenCalledWith(
			expect.objectContaining({ user_id: 'user-xyz' }),
		);
	});

	it('upsert 호출 시 snapshot의 camelCase 필드가 snake_case DB Row로 변환된다', async () => {
		const builder = makeQueryBuilder({ data: null, error: null });
		const client = makeClient(builder);
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		const snapshot = makeSnapshot({
			id: 'snap-id-1',
			title: '코바늘 도안',
			patternType: 'crochet',
			gridSize: { rows: 5, cols: 8 },
			rotationalMode: 'vertical',
			savedAt: '2025-06-01T00:00:00.000Z',
			difficulty: 4,
			materials: '코바늘 2mm',
		});
		await savePattern(snapshot, 'user-123');

		expect(builder.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'snap-id-1',
				title: '코바늘 도안',
				pattern_type: 'crochet',
				grid_rows: 5,
				grid_cols: 8,
				rotational_mode: 'vertical',
				saved_at: '2025-06-01T00:00:00.000Z',
				difficulty: 4,
				materials: '코바늘 2mm',
			}),
		);
	});
});

describe('deletePattern', () => {
	it('성공 시 { ok: true, data: undefined }를 반환한다', async () => {
		const result = { data: null, error: null };
		const builder = {
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue(result),
			delete: vi.fn().mockReturnThis(),
		};
		const client = { from: vi.fn().mockReturnValue(builder) };
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		const deleteResult = await deletePattern('snap-id-1');

		expect(deleteResult).toEqual({ ok: true, data: undefined });
	});

	it('Supabase 에러 시 { ok: false, error: 메시지 }를 반환한다', async () => {
		const result = { data: null, error: { message: 'delete failed' } };
		const builder = {
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue(result),
			delete: vi.fn().mockReturnThis(),
		};
		const client = { from: vi.fn().mockReturnValue(builder) };
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		const deleteResult = await deletePattern('snap-id-1');

		expect(deleteResult.ok).toBe(false);
		if (!deleteResult.ok) {
			expect(deleteResult.error).toBe('delete failed');
		}
	});

	it('from("patterns").delete().eq("id", id) 체인으로 호출된다', async () => {
		const result = { data: null, error: null };
		const builder = {
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue(result),
			delete: vi.fn().mockReturnThis(),
		};
		const client = { from: vi.fn().mockReturnValue(builder) };
		mockCreateClient.mockReturnValue(client as ReturnType<typeof createClient>);

		await deletePattern('target-id');

		expect(client.from).toHaveBeenCalledWith('patterns');
		expect(builder.delete).toHaveBeenCalled();
		expect(builder.eq).toHaveBeenCalledWith('id', 'target-id');
	});
});
