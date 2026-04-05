import type { RotationalMode } from '@/types/knitting';
import { splitStrokeByErasePath, splitStrokeByPoint } from './geometry';

export interface EraseResult {
	index: number;
	newStrokes: number[][];
}

function buildMirrorEraseSegments(
	ex1: number,
	ey1: number,
	ex2: number,
	ey2: number,
	rotationalMode: RotationalMode,
	cols: number,
	rows: number,
): [number, number, number, number][] {
	const segments: [number, number, number, number][] = [[ex1, ey1, ex2, ey2]];
	if (rotationalMode !== 'none') {
		if (rotationalMode === 'horizontal' || rotationalMode === 'both') {
			segments.push([cols - ex1, ey1, cols - ex2, ey2]);
		}
		if (rotationalMode === 'vertical' || rotationalMode === 'both') {
			segments.push([ex1, rows - ey1, ex2, rows - ey2]);
		}
		if (rotationalMode === 'both') {
			segments.push([cols - ex1, rows - ey1, cols - ex2, rows - ey2]);
		}
	}
	return segments;
}

function buildMirrorErasePoints(
	px: number,
	py: number,
	rotationalMode: RotationalMode,
	cols: number,
	rows: number,
): [number, number][] {
	const points: [number, number][] = [[px, py]];
	if (rotationalMode !== 'none') {
		if (rotationalMode === 'horizontal' || rotationalMode === 'both') {
			points.push([cols - px, py]);
		}
		if (rotationalMode === 'vertical' || rotationalMode === 'both') {
			points.push([px, rows - py]);
		}
		if (rotationalMode === 'both') {
			points.push([cols - px, rows - py]);
		}
	}
	return points;
}

/**
 * 드래그 지우기: 지우기 세그먼트(ex1,ey1)~(ex2,ey2)에 히트된 stroke 세그먼트만 부분 제거.
 * 변경된 stroke에 대해 { index, newStrokes } 배열을 반환한다.
 * 변경이 없는 stroke는 결과에 포함되지 않는다.
 */
export function calcErasePartialStrokes(
	strokes: number[][],
	ex1: number,
	ey1: number,
	ex2: number,
	ey2: number,
	rotationalMode: RotationalMode,
	cols: number,
	rows: number,
): EraseResult[] {
	const eraseSegments = buildMirrorEraseSegments(ex1, ey1, ex2, ey2, rotationalMode, cols, rows);
	const results: EraseResult[] = [];
	for (let i = strokes.length - 1; i >= 0; i--) {
		let result = [strokes[i]];
		for (const [sex1, sey1, sex2, sey2] of eraseSegments) {
			result = result.flatMap((s) => splitStrokeByErasePath(s, sex1, sey1, sex2, sey2));
		}
		if (result.length !== 1 || result[0].length !== strokes[i].length) {
			results.push({ index: i, newStrokes: result });
		}
	}
	return results;
}

/**
 * 클릭(단일 점) 지우기: 점(px,py) 근방의 stroke 세그먼트만 부분 제거.
 * 변경된 stroke에 대해 { index, newStrokes } 배열을 반환한다.
 */
export function calcErasePartialStrokesNearPoint(
	strokes: number[][],
	px: number,
	py: number,
	rotationalMode: RotationalMode,
	cols: number,
	rows: number,
): EraseResult[] {
	const THRESHOLD_SQ = 0.7 * 0.7;
	const erasePoints = buildMirrorErasePoints(px, py, rotationalMode, cols, rows);
	const results: EraseResult[] = [];
	for (let i = strokes.length - 1; i >= 0; i--) {
		let result = [strokes[i]];
		for (const [epx, epy] of erasePoints) {
			result = result.flatMap((s) => splitStrokeByPoint(s, epx, epy, THRESHOLD_SQ));
		}
		if (result.length !== 1 || result[0].length !== strokes[i].length) {
			results.push({ index: i, newStrokes: result });
		}
	}
	return results;
}
