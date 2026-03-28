import type { CollapsedColumnBlock } from '@/types/knitting';

/**
 * collapsedColumnBlocks를 고려하여 colIndex의 시각적 x 픽셀 좌표를 반환한다.
 * colIndex가 어떤 collapsed 블록의 startCol~endCol 범위에 속하면 null을 반환한다 (렌더링 skip).
 */
export function getColVisualX(
	colIndex: number,
	collapsedColumnBlocks: CollapsedColumnBlock[],
	cellSize: number,
): number | null {
	const sorted = [...collapsedColumnBlocks].sort((a, b) => a.startCol - b.startCol);

	let skippedCols = 0;

	for (const block of sorted) {
		if (block.startCol > colIndex) {
			break;
		}
		if (colIndex >= block.startCol && colIndex <= block.endCol) {
			return null;
		}
		const blockCols = block.endCol - block.startCol + 1;
		skippedCols += blockCols - 1;
	}

	return (colIndex - skippedCols) * cellSize;
}

/**
 * collapsed 블록을 기준으로 특정 블록이 캔버스에서 차지하는 시각적 x 좌표를 반환한다.
 * (중략 열 자체의 x 좌표)
 */
export function getCollapsedColumnBlockVisualX(
	block: CollapsedColumnBlock,
	collapsedColumnBlocks: CollapsedColumnBlock[],
	cellSize: number,
): number {
	const sorted = [...collapsedColumnBlocks].sort((a, b) => a.startCol - b.startCol);

	let skippedCols = 0;

	for (const b of sorted) {
		if (b.startCol >= block.startCol) break;
		const blockCols = b.endCol - b.startCol + 1;
		skippedCols += blockCols - 1;
	}

	const visualIndex = block.startCol - skippedCols;
	return visualIndex * cellSize;
}

/**
 * collapsedColumnBlocks를 기반으로 전체 열의 시각적 x 좌표 맵을 한 번에 생성한다.
 * collapsed 범위 내 열은 null, 그 외는 x 픽셀 좌표.
 */
export function buildColVisualXMap(
	collapsedColumnBlocks: CollapsedColumnBlock[],
	totalCols: number,
	cellSize: number,
): (number | null)[] {
	const sorted = [...collapsedColumnBlocks].sort((a, b) => a.startCol - b.startCol);
	const map: (number | null)[] = [];
	let skippedCols = 0;
	let blockIdx = 0;

	for (let colIndex = 0; colIndex < totalCols; colIndex++) {
		const block = blockIdx < sorted.length ? sorted[blockIdx] : null;

		if (block !== null && colIndex >= block.startCol && colIndex <= block.endCol) {
			map.push(null);
			if (colIndex === block.endCol) {
				skippedCols += block.endCol - block.startCol + 1 - 1;
				blockIdx++;
			}
		} else {
			map.push((colIndex - skippedCols) * cellSize);
		}
	}

	return map;
}

/**
 * collapsedColumnBlocks를 반영한 시각적 총 열 수를 반환한다.
 * 총 시각적 열 수 = 전체 열 수 - collapsed 열 수 합 + collapsed 블록 수
 */
export function calcVisualColCount(
	totalCols: number,
	collapsedColumnBlocks: CollapsedColumnBlock[],
): number {
	let skipped = 0;
	for (const block of collapsedColumnBlocks) {
		skipped += block.endCol - block.startCol + 1 - 1;
	}
	return totalCols - skipped;
}

/**
 * 시각적 열 교차점 인덱스(0~visualColCount) → 데이터 열 교차점 인덱스(0~totalCols) 매핑 배열을 반환한다.
 * shape guide 형태선 그리기/지우기에서 마우스 픽셀 위치를 데이터 열 좌표로 변환할 때 사용한다.
 */
export function buildVisualToDataColIntersectionMap(
	collapsedColumnBlocks: CollapsedColumnBlock[],
	visualColCount: number,
): number[] {
	const sorted = [...collapsedColumnBlocks].sort((a, b) => a.startCol - b.startCol);
	const map: number[] = [0];
	let dataIntersection = 0;
	let blockIdx = 0;

	for (let visualIdx = 0; visualIdx < visualColCount; visualIdx++) {
		if (blockIdx < sorted.length && sorted[blockIdx].startCol === dataIntersection) {
			dataIntersection = sorted[blockIdx].endCol + 1;
			blockIdx++;
		} else {
			dataIntersection++;
		}
		map.push(dataIntersection);
	}

	return map;
}
