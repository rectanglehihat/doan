export const ERASE_THRESHOLD_SQ = 0.5 * 0.5;

export function cross2D(ux: number, uy: number, vx: number, vy: number): number {
	return ux * vy - uy * vx;
}

export function pointToSegmentDistSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
	const dx = bx - ax,
		dy = by - ay;
	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
	return (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2;
}

export function segmentsProperlyIntersect(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number,
): boolean {
	const d1 = cross2D(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
	const d2 = cross2D(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
	const d3 = cross2D(x4 - x3, y4 - y3, x1 - x3, y1 - y3);
	const d4 = cross2D(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
	return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0;
}

export function strokeSegmentHitByErase(
	sx1: number,
	sy1: number,
	sx2: number,
	sy2: number,
	ex1: number,
	ey1: number,
	ex2: number,
	ey2: number,
): boolean {
	if (segmentsProperlyIntersect(sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)) return true;
	if (pointToSegmentDistSq(sx1, sy1, ex1, ey1, ex2, ey2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(sx2, sy2, ex1, ey1, ex2, ey2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(ex1, ey1, sx1, sy1, sx2, sy2) <= ERASE_THRESHOLD_SQ) return true;
	if (pointToSegmentDistSq(ex2, ey2, sx1, sy1, sx2, sy2) <= ERASE_THRESHOLD_SQ) return true;
	return false;
}

export function splitStrokeByErasePath(stroke: number[], ex1: number, ey1: number, ex2: number, ey2: number): number[][] {
	const remaining: number[][] = [];
	let current: number[] = [];
	for (let i = 0; i < stroke.length - 2; i += 2) {
		const sx1 = stroke[i],
			sy1 = stroke[i + 1];
		const sx2 = stroke[i + 2],
			sy2 = stroke[i + 3];
		if (strokeSegmentHitByErase(sx1, sy1, sx2, sy2, ex1, ey1, ex2, ey2)) {
			if (current.length >= 4) remaining.push(current);
			current = [];
		} else {
			if (current.length === 0) current = [sx1, sy1, sx2, sy2];
			else current.push(sx2, sy2);
		}
	}
	if (current.length >= 4) remaining.push(current);
	return remaining;
}

export function splitStrokeByPoint(stroke: number[], px: number, py: number, thresholdSq: number): number[][] {
	const remaining: number[][] = [];
	let current: number[] = [];
	for (let i = 0; i < stroke.length - 2; i += 2) {
		const sx1 = stroke[i],
			sy1 = stroke[i + 1];
		const sx2 = stroke[i + 2],
			sy2 = stroke[i + 3];
		if (pointToSegmentDistSq(px, py, sx1, sy1, sx2, sy2) <= thresholdSq) {
			if (current.length >= 4) remaining.push(current);
			current = [];
		} else {
			if (current.length === 0) current = [sx1, sy1, sx2, sy2];
			else current.push(sx2, sy2);
		}
	}
	if (current.length >= 4) remaining.push(current);
	return remaining;
}
