import { getRowVisualY, calcVisualRowCount, getCollapsedBlockVisualY, buildRowVisualYMap, buildVisualToDataIntersectionMap } from './collapsed-rows';
import type { CollapsedBlock } from '@/types/knitting';

describe('getRowVisualY', () => {
	it('collapsed 블록이 없을 때 rowIndex * cellSize를 반환한다', () => {
		expect(getRowVisualY(0, [], 20)).toBe(0);
		expect(getRowVisualY(3, [], 20)).toBe(60);
	});

	it('collapsed 블록 범위 내 행은 null을 반환한다', () => {
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		expect(getRowVisualY(2, blocks, 20)).toBeNull();
		expect(getRowVisualY(3, blocks, 20)).toBeNull();
		expect(getRowVisualY(5, blocks, 20)).toBeNull();
	});

	it('collapsed 블록 범위 내 startRow는 null을 반환한다', () => {
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		expect(getRowVisualY(2, blocks, 20)).toBeNull();
	});

	it('collapsed 블록 이후 행은 y 오프셋이 조정된다', () => {
		// startRow=2, endRow=5 → 행 2,3,4,5 (4행) 제거, 1행(중략) 추가
		// skipped=4, 대신 중략 1행 → 시각적으로 3행 감소
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		// 행 6: 0,1,중략 → 시각적 인덱스 3 → y = 3 * 20 = 60
		expect(getRowVisualY(6, blocks, 20)).toBe(60);
		// 행 7: 시각적 인덱스 4 → y = 80
		expect(getRowVisualY(7, blocks, 20)).toBe(80);
	});

	it('복수의 collapsed 블록이 있을 때 누적 오프셋을 적용한다', () => {
		const blocks: CollapsedBlock[] = [
			{ id: 'a', startRow: 1, endRow: 2 }, // 행 1,2 collapse → 2행→1행(중략), 감소 1
			{ id: 'b', startRow: 5, endRow: 7 }, // 행 5,6,7 collapse → 3행→1행(중략), 감소 2
		];
		// 시각적 배치: [행0]=0, [중략1]=1, [행3]=2, [행4]=3, [중략2]=4, [행8]=5
		// 행 0: collapse 이전 → 시각적 인덱스 0 → y = 0
		expect(getRowVisualY(0, blocks, 20)).toBe(0);
		// 행 1: collapse 내부 → null
		expect(getRowVisualY(1, blocks, 20)).toBeNull();
		// 행 3: 첫 번째 블록 이후 → 시각적 인덱스 2 (0, 중략) → y = 40
		expect(getRowVisualY(3, blocks, 20)).toBe(40);
		// 행 5: 두 번째 블록 내부 → null
		expect(getRowVisualY(5, blocks, 20)).toBeNull();
		// 행 8: 두 번째 블록 이후 → 시각적 인덱스 5 (0, 중략1, 3, 4, 중략2, 8) → y = 100
		expect(getRowVisualY(8, blocks, 20)).toBe(100);
	});

	it('collapsed 블록의 중략 행 y 좌표를 반환한다 (startRow-1 위치 바로 다음)', () => {
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		// startRow=2의 중략 행 위치: 행 0, 1 다음 → 시각적 인덱스 2 → y = 40
		// (startRow=2이므로 행 0,1이 앞에 있음)
		// getCollapsedBlockVisualY 는 별도 함수 → getRowVisualY 로 startRow 직전까지 계산
		// startRow=2 이전: 행 0,1 → 시각적 2행 → 중략 행 y = 2 * 20 = 40
		expect(getRowVisualY(6, blocks, 20)).toBe(60); // 행 6 = 시각적 3
	});
});

describe('getCollapsedBlockVisualY', () => {
	it('collapsed 블록이 없을 때 첫 번째 블록의 y = startRow * cellSize', () => {
		const block: CollapsedBlock = { id: 'a', startRow: 3, endRow: 5 };
		expect(getCollapsedBlockVisualY(block, [block], 20)).toBe(3 * 20);
	});

	it('이전에 collapsed 블록이 있을 때 y 오프셋이 적용된다', () => {
		// 첫 번째 블록: startRow=1, endRow=2 → 2행→1행(중략), skipped=1
		// 두 번째 블록: startRow=5 → 시각적 인덱스 = 5 - 1 = 4 → y = 4 * 20 = 80
		const block1: CollapsedBlock = { id: 'a', startRow: 1, endRow: 2 };
		const block2: CollapsedBlock = { id: 'b', startRow: 5, endRow: 7 };
		expect(getCollapsedBlockVisualY(block2, [block1, block2], 20)).toBe(4 * 20);
	});

	it('중략 블록이 여러 개일 때 순서대로 y를 계산한다', () => {
		// 첫 번째: startRow=0, endRow=1 → 2행→1행(중략), skipped=1
		// 두 번째: startRow=3, endRow=4 → 시각적 인덱스 = 3 - 1 = 2 → y = 2 * 10 = 20
		// 세 번째: startRow=6, endRow=8 → skipped=1+1=2, 시각적 인덱스 = 6 - 2 = 4 → y = 4 * 10 = 40
		const block1: CollapsedBlock = { id: 'a', startRow: 0, endRow: 1 };
		const block2: CollapsedBlock = { id: 'b', startRow: 3, endRow: 4 };
		const block3: CollapsedBlock = { id: 'c', startRow: 6, endRow: 8 };
		const blocks = [block1, block2, block3];
		expect(getCollapsedBlockVisualY(block1, blocks, 10)).toBe(0 * 10);
		expect(getCollapsedBlockVisualY(block2, blocks, 10)).toBe(2 * 10);
		expect(getCollapsedBlockVisualY(block3, blocks, 10)).toBe(4 * 10);
	});
});

describe('calcVisualRowCount', () => {
	it('collapsed 블록이 없을 때 전체 행 수를 반환한다', () => {
		expect(calcVisualRowCount(10, [])).toBe(10);
	});

	it('collapsed 블록이 있을 때 시각적 행 수를 반환한다', () => {
		// startRow=2, endRow=5 → 실제 4행 → 1행(중략) → 3행 감소
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		expect(calcVisualRowCount(10, blocks)).toBe(7); // 10 - 4 + 1 = 7
	});

	it('복수의 collapsed 블록의 감소량을 누적한다', () => {
		const blocks: CollapsedBlock[] = [
			{ id: 'a', startRow: 1, endRow: 2 }, // 2행 → 1행(중략): -1
			{ id: 'b', startRow: 5, endRow: 7 }, // 3행 → 1행(중략): -2
		];
		expect(calcVisualRowCount(10, blocks)).toBe(7); // 10 - 1 - 2 = 7
	});
});

describe('buildRowVisualYMap', () => {
	it('collapsed 블록이 없을 때 모든 행의 y = rowIndex * cellSize', () => {
		const map = buildRowVisualYMap([], 3, 20);
		expect(map).toEqual([0, 20, 40]);
	});

	it('collapsed 블록 범위 내 행은 null을 반환한다', () => {
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 1, endRow: 2 }];
		const map = buildRowVisualYMap(blocks, 5, 20);
		expect(map[1]).toBeNull();
		expect(map[2]).toBeNull();
	});

	it('collapsed 블록 이후 행의 y 오프셋이 조정된다', () => {
		// startRow=2, endRow=5 → 4행 → 1행(중략), skipped=3
		// 행 6: 시각적 인덱스 = 6 - 3 = 3 → y = 60
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		const map = buildRowVisualYMap(blocks, 8, 20);
		expect(map[0]).toBe(0);
		expect(map[1]).toBe(20);
		expect(map[2]).toBeNull();
		expect(map[5]).toBeNull();
		expect(map[6]).toBe(60);
		expect(map[7]).toBe(80);
	});

	it('getRowVisualY를 반복 호출한 결과와 동일하다', () => {
		const blocks: CollapsedBlock[] = [
			{ id: 'a', startRow: 1, endRow: 2 },
			{ id: 'b', startRow: 5, endRow: 7 },
		];
		const totalRows = 10;
		const cellSize = 20;
		const map = buildRowVisualYMap(blocks, totalRows, cellSize);
		for (let i = 0; i < totalRows; i++) {
			expect(map[i]).toBe(getRowVisualY(i, blocks, cellSize));
		}
	});
});

describe('buildVisualToDataIntersectionMap', () => {
	it('중략 블록이 없을 때 [0, 1, 2, ..., visualRowCount]를 반환한다', () => {
		const totalRows = 5;
		const blocks: CollapsedBlock[] = [];
		const visualRowCount = calcVisualRowCount(totalRows, blocks); // 5
		const result = buildVisualToDataIntersectionMap(blocks, visualRowCount);
		expect(result).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('단일 중략 블록(startRow=3, endRow=6, totalRows=10)일 때 올바른 매핑을 반환한다', () => {
		const totalRows = 10;
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 3, endRow: 6 }];
		const visualRowCount = calcVisualRowCount(totalRows, blocks); // 10 - (6-3+1-1) = 7
		const result = buildVisualToDataIntersectionMap(blocks, visualRowCount);
		// visual 0→data 0, 1→1, 2→2, 3→3(블록 top), 4→7(블록 bottom=endRow+1), 5→8, 6→9, 7→10
		expect(result).toEqual([0, 1, 2, 3, 7, 8, 9, 10]);
	});

	it('복수 중략 블록(block1: startRow=1,endRow=2 / block2: startRow=5,endRow=7, totalRows=10)일 때 올바른 매핑을 반환한다', () => {
		const totalRows = 10;
		const blocks: CollapsedBlock[] = [
			{ id: 'a', startRow: 1, endRow: 2 }, // 2행→1행(중략): -1
			{ id: 'b', startRow: 5, endRow: 7 }, // 3행→1행(중략): -2
		];
		const visualRowCount = calcVisualRowCount(totalRows, blocks); // 10 - 1 - 2 = 7
		const result = buildVisualToDataIntersectionMap(blocks, visualRowCount);
		// visual 0→data 0, 1→1(블록a top), 2→3(블록a bottom), 3→4, 4→5(블록b top), 5→8(블록b bottom), 6→9, 7→10
		expect(result).toEqual([0, 1, 3, 4, 5, 8, 9, 10]);
	});

	it('배열 길이는 항상 visualRowCount + 1이다', () => {
		const totalRows = 10;
		const blocks: CollapsedBlock[] = [{ id: 'a', startRow: 2, endRow: 5 }];
		const visualRowCount = calcVisualRowCount(totalRows, blocks);
		const result = buildVisualToDataIntersectionMap(blocks, visualRowCount);
		expect(result).toHaveLength(visualRowCount + 1);
	});
});
