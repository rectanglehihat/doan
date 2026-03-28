import type { CollapsedBlock } from '@/types/knitting';

/**
 * collapsedBlocks를 고려하여 rowIndex의 시각적 y 픽셀 좌표를 반환한다.
 * rowIndex가 어떤 collapsed 블록의 startRow~endRow 범위에 속하면 null을 반환한다 (렌더링 skip).
 */
export function getRowVisualY(
	rowIndex: number,
	collapsedBlocks: CollapsedBlock[],
	cellSize: number,
): number | null {
	// 정렬된 collapsed 블록을 순서대로 처리
	const sorted = [...collapsedBlocks].sort((a, b) => a.startRow - b.startRow);

	let skippedRows = 0; // 지금까지 제거된 행 수 (중략 1행씩 대체 반영 포함)

	for (const block of sorted) {
		if (block.startRow > rowIndex) {
			// 이 블록은 rowIndex 이후 → 더 이상 영향 없음
			break;
		}
		if (rowIndex >= block.startRow && rowIndex <= block.endRow) {
			// rowIndex가 collapsed 범위 내 → 렌더링 안 함
			return null;
		}
		// rowIndex가 블록 이후 → 이 블록으로 인해 건너뛴 행 수 계산
		// 블록 행 수: endRow - startRow + 1, 그 자리에 중략 1행
		const blockRows = block.endRow - block.startRow + 1;
		skippedRows += blockRows - 1; // 중략 1행 대체이므로 (blockRows - 1) 감소
	}

	return (rowIndex - skippedRows) * cellSize;
}

/**
 * collapsed 블록을 기준으로 특정 블록이 캔버스에서 차지하는 시각적 y 좌표를 반환한다.
 * (중략 행 자체의 y 좌표)
 */
export function getCollapsedBlockVisualY(
	block: CollapsedBlock,
	collapsedBlocks: CollapsedBlock[],
	cellSize: number,
): number {
	// startRow 바로 이전 행의 y 좌표 + cellSize = 중략 행 y 좌표
	// startRow보다 앞선 collapsed 블록들의 skip 누적을 계산
	const sorted = [...collapsedBlocks].sort((a, b) => a.startRow - b.startRow);

	let skippedRows = 0;

	for (const b of sorted) {
		if (b.startRow >= block.startRow) break;
		const blockRows = b.endRow - b.startRow + 1;
		skippedRows += blockRows - 1;
	}

	// startRow의 시각적 인덱스
	const visualIndex = block.startRow - skippedRows;
	return visualIndex * cellSize;
}

/**
 * collapsedBlocks를 기반으로 전체 행의 시각적 y 좌표 맵을 한 번에 생성한다.
 * collapsed 범위 내 행은 null, 그 외는 y 픽셀 좌표.
 * 내부에서 sort를 한 번만 수행하므로 getRowVisualY를 반복 호출하는 것보다 효율적이다.
 */
export function buildRowVisualYMap(
	collapsedBlocks: CollapsedBlock[],
	totalRows: number,
	cellSize: number,
): (number | null)[] {
	const sorted = [...collapsedBlocks].sort((a, b) => a.startRow - b.startRow);
	const map: (number | null)[] = [];
	let skippedRows = 0;
	let blockIdx = 0;

	for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
		// 현재 행에 적용되는 블록 탐색
		const block = blockIdx < sorted.length ? sorted[blockIdx] : null;

		if (block !== null && rowIndex >= block.startRow && rowIndex <= block.endRow) {
			// 현재 행이 collapsed 범위 내 → null
			map.push(null);
			if (rowIndex === block.endRow) {
				// 블록의 마지막 행을 지나면 skip 누적 후 다음 블록으로
				skippedRows += block.endRow - block.startRow + 1 - 1;
				blockIdx++;
			}
		} else {
			map.push((rowIndex - skippedRows) * cellSize);
		}
	}

	return map;
}

/**
 * collapsedBlocks를 반영한 시각적 총 행 수를 반환한다.
 * 총 시각적 행 수 = 전체 행 수 - collapsed 행 수 합 + collapsed 블록 수
 */
export function calcVisualRowCount(
	totalRows: number,
	collapsedBlocks: CollapsedBlock[],
): number {
	let skipped = 0;
	for (const block of collapsedBlocks) {
		skipped += block.endRow - block.startRow + 1 - 1; // blockRows - 1
	}
	return totalRows - skipped;
}

/**
 * 시각적 행 교차점 인덱스(0~visualRowCount) → 데이터 행 교차점 인덱스(0~totalRows) 매핑 배열을 반환한다.
 * shape guide 형태선 그리기/지우기에서 마우스 픽셀 위치를 데이터 행 좌표로 변환할 때 사용한다.
 *
 * 예: totalRows=10, collapsed {3~6} → visualRowCount=7
 * 반환: [0, 1, 2, 3, 7, 8, 9, 10]  (길이 = visualRowCount + 1)
 */
export function buildVisualToDataIntersectionMap(
	collapsedBlocks: CollapsedBlock[],
	visualRowCount: number,
): number[] {
	const sorted = [...collapsedBlocks].sort((a, b) => a.startRow - b.startRow);
	const map: number[] = [0]; // visual intersection 0 → data intersection 0
	let dataIntersection = 0;
	let blockIdx = 0;

	for (let visualIdx = 0; visualIdx < visualRowCount; visualIdx++) {
		if (blockIdx < sorted.length && sorted[blockIdx].startRow === dataIntersection) {
			// 현재 데이터 교차점이 중략 블록의 시작 → 블록 끝으로 점프
			dataIntersection = sorted[blockIdx].endRow + 1;
			blockIdx++;
		} else {
			dataIntersection++;
		}
		map.push(dataIntersection);
	}

	return map;
}
