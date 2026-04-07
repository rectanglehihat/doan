import { describe, it, expect } from 'vitest';
import { calcCellDiffs, applyDiffs, reverseDiffs } from '@/lib/utils/history-utils';
import type { ChartCell, CellDiff } from '@/types/knitting';

function makeGrid(rows: number, cols: number, fill: Partial<ChartCell> = {}): ChartCell[][] {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => ({ symbolId: null, color: null, ...fill })),
	);
}

describe('calcCellDiffs', () => {
	it('동일한 2×2 그리드에서 빈 배열을 반환한다', () => {
		const grid = makeGrid(2, 2);
		const diffs = calcCellDiffs(grid, grid);
		expect(diffs).toEqual([]);
	});

	it('(0,0)만 symbolId가 바뀐 경우 length=1이고 prev/next를 정확히 반환한다', () => {
		const prev = makeGrid(2, 2);
		const next = makeGrid(2, 2);
		next[0][0] = { symbolId: 'k', color: null };

		const diffs = calcCellDiffs(prev, next);

		expect(diffs).toHaveLength(1);
		expect(diffs[0].row).toBe(0);
		expect(diffs[0].col).toBe(0);
		expect(diffs[0].prev).toEqual({ symbolId: null, color: null });
		expect(diffs[0].next).toEqual({ symbolId: 'k', color: null });
	});

	it('color와 symbolId 모두 변경된 셀은 단일 CellDiff로 처리된다', () => {
		const prev = makeGrid(2, 2);
		const next = makeGrid(2, 2);
		next[1][1] = { symbolId: 'p', color: '#ff0000' };

		const diffs = calcCellDiffs(prev, next);

		expect(diffs).toHaveLength(1);
		expect(diffs[0].next).toEqual({ symbolId: 'p', color: '#ff0000' });
	});

	it('3개 셀이 변경된 경우 length=3을 반환한다', () => {
		const prev = makeGrid(3, 3);
		const next = makeGrid(3, 3);
		next[0][0] = { symbolId: 'k', color: null };
		next[1][1] = { symbolId: 'p', color: null };
		next[2][2] = { symbolId: 'yo', color: null };

		const diffs = calcCellDiffs(prev, next);

		expect(diffs).toHaveLength(3);
	});

	it('400×400 그리드에서 단일 셀 변경 시 length=1을 반환한다 (성능 검증)', () => {
		const prev = makeGrid(400, 400);
		const next = makeGrid(400, 400);
		next[200][200] = { symbolId: 'k', color: null };

		const diffs = calcCellDiffs(prev, next);

		expect(diffs).toHaveLength(1);
		expect(diffs[0].row).toBe(200);
		expect(diffs[0].col).toBe(200);
	});
});

describe('applyDiffs', () => {
	it('빈 diffs → 원본과 동일한 내용의 새 배열을 반환한다 (참조는 다름)', () => {
		const base = makeGrid(2, 2);
		const result = applyDiffs(base, []);

		expect(result).toEqual(base);
		expect(result).not.toBe(base);
	});

	it('diff 적용 후 해당 셀이 next 값으로 변경된다', () => {
		const base = makeGrid(2, 2);
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
		];

		const result = applyDiffs(base, diffs);

		expect(result[0][0].symbolId).toBe('k');
	});

	it('원본 배열을 변경하지 않는다 (불변성 검증)', () => {
		const base = makeGrid(2, 2);
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
		];

		applyDiffs(base, diffs);

		expect(base[0][0].symbolId).toBeNull();
	});

	it('여러 diffs를 한번에 적용하면 각 셀이 정확히 변경된다', () => {
		const base = makeGrid(3, 3);
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
			{ row: 1, col: 1, prev: { symbolId: null, color: null }, next: { symbolId: 'p', color: '#ff0000' } },
			{ row: 2, col: 2, prev: { symbolId: null, color: null }, next: { symbolId: 'yo', color: null } },
		];

		const result = applyDiffs(base, diffs);

		expect(result[0][0].symbolId).toBe('k');
		expect(result[1][1].symbolId).toBe('p');
		expect(result[1][1].color).toBe('#ff0000');
		expect(result[2][2].symbolId).toBe('yo');
	});
});

describe('reverseDiffs', () => {
	it('prev↔next가 교환된 새 배열을 반환한다', () => {
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
		];

		const reversed = reverseDiffs(diffs);

		expect(reversed[0].prev).toEqual({ symbolId: 'k', color: null });
		expect(reversed[0].next).toEqual({ symbolId: null, color: null });
	});

	it('원본 diffs를 변경하지 않는다', () => {
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
		];

		reverseDiffs(diffs);

		expect(diffs[0].prev).toEqual({ symbolId: null, color: null });
		expect(diffs[0].next).toEqual({ symbolId: 'k', color: null });
	});

	it('여러 diffs를 모두 반전한다', () => {
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
			{ row: 1, col: 1, prev: { symbolId: 'p', color: null }, next: { symbolId: null, color: null } },
		];

		const reversed = reverseDiffs(diffs);

		expect(reversed).toHaveLength(2);
		expect(reversed[0].prev.symbolId).toBe('k');
		expect(reversed[0].next.symbolId).toBeNull();
		expect(reversed[1].prev.symbolId).toBeNull();
		expect(reversed[1].next.symbolId).toBe('p');
	});
});

describe('applyDiffs + reverseDiffs 왕복', () => {
	it('cells에 diffs 적용 후 reverseDiffs 적용하면 원본으로 복원된다', () => {
		const original = makeGrid(3, 3);
		const diffs: CellDiff[] = [
			{ row: 0, col: 0, prev: { symbolId: null, color: null }, next: { symbolId: 'k', color: null } },
			{ row: 2, col: 1, prev: { symbolId: null, color: null }, next: { symbolId: 'p', color: '#0000ff' } },
		];

		const modified = applyDiffs(original, diffs);
		const restored = applyDiffs(modified, reverseDiffs(diffs));

		expect(restored[0][0]).toEqual({ symbolId: null, color: null });
		expect(restored[2][1]).toEqual({ symbolId: null, color: null });
	});

	it('400×400 그리드에서 100개 셀 변경 후 왕복 복원이 성공한다', () => {
		const original = makeGrid(400, 400);
		const diffs: CellDiff[] = Array.from({ length: 100 }, (_, i) => ({
			row: i,
			col: i,
			prev: { symbolId: null, color: null },
			next: { symbolId: 'k', color: null },
		}));

		const modified = applyDiffs(original, diffs);
		const restored = applyDiffs(modified, reverseDiffs(diffs));

		expect(restored[0][0].symbolId).toBeNull();
		expect(restored[99][99].symbolId).toBeNull();
	});
});
