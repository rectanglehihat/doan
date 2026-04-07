import type { ChartCell, CellDiff } from '@/types/knitting';

export function calcCellDiffs(prev: ChartCell[][], next: ChartCell[][]): CellDiff[] {
	const prevRows = prev.length;
	const nextRows = next.length;

	if (prevRows !== nextRows) return [];

	const prevCols = prev[0]?.length ?? 0;
	const nextCols = next[0]?.length ?? 0;

	if (prevCols !== nextCols) return [];

	const diffs: CellDiff[] = [];

	for (let row = 0; row < prevRows; row++) {
		for (let col = 0; col < prevCols; col++) {
			const prevCell = prev[row][col];
			const nextCell = next[row][col];
			if (prevCell !== nextCell && (prevCell.symbolId !== nextCell.symbolId || prevCell.color !== nextCell.color)) {
				diffs.push({ row, col, prev: prevCell, next: nextCell });
			}
		}
	}

	return diffs;
}

export function applyDiffs(base: ChartCell[][], diffs: CellDiff[]): ChartCell[][] {
	const result = base.map((row) => [...row]);

	for (const diff of diffs) {
		result[diff.row][diff.col] = diff.next;
	}

	return result;
}

export function reverseDiffs(diffs: CellDiff[]): CellDiff[] {
	return diffs.map((diff) => ({ ...diff, prev: diff.next, next: diff.prev }));
}
