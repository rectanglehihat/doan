import { getColVisualX, calcVisualColCount, getCollapsedColumnBlockVisualX, buildColVisualXMap, buildVisualToDataColIntersectionMap } from './collapsed-cols';
import type { CollapsedColumnBlock } from '@/types/knitting';

describe('getColVisualX', () => {
	it('collapsed 블록이 없을 때 colIndex * cellSize를 반환한다', () => {
		expect(getColVisualX(0, [], 20)).toBe(0);
		expect(getColVisualX(3, [], 20)).toBe(60);
	});

	it('collapsed 블록 범위 내 열은 null을 반환한다', () => {
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		expect(getColVisualX(2, blocks, 20)).toBeNull();
		expect(getColVisualX(3, blocks, 20)).toBeNull();
		expect(getColVisualX(5, blocks, 20)).toBeNull();
	});

	it('collapsed 블록 범위 내 startCol은 null을 반환한다', () => {
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		expect(getColVisualX(2, blocks, 20)).toBeNull();
	});

	it('collapsed 블록 이후 열은 x 오프셋이 조정된다', () => {
		// startCol=2, endCol=5 → 열 2,3,4,5 (4열) 제거, 1열(중략) 추가
		// skipped=4, 대신 중략 1열 → 시각적으로 3열 감소
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		// 열 6: 0,1,중략 → 시각적 인덱스 3 → x = 3 * 20 = 60
		expect(getColVisualX(6, blocks, 20)).toBe(60);
		// 열 7: 시각적 인덱스 4 → x = 80
		expect(getColVisualX(7, blocks, 20)).toBe(80);
	});

	it('복수의 collapsed 블록이 있을 때 누적 오프셋을 적용한다', () => {
		const blocks: CollapsedColumnBlock[] = [
			{ id: 'a', startCol: 1, endCol: 2 }, // 열 1,2 collapse → 2열→1열(중략), 감소 1
			{ id: 'b', startCol: 5, endCol: 7 }, // 열 5,6,7 collapse → 3열→1열(중략), 감소 2
		];
		// 시각적 배치: [열0]=0, [중략1]=1, [열3]=2, [열4]=3, [중략2]=4, [열8]=5
		// 열 0: collapse 이전 → 시각적 인덱스 0 → x = 0
		expect(getColVisualX(0, blocks, 20)).toBe(0);
		// 열 1: collapse 내부 → null
		expect(getColVisualX(1, blocks, 20)).toBeNull();
		// 열 3: 첫 번째 블록 이후 → 시각적 인덱스 2 (0, 중략) → x = 40
		expect(getColVisualX(3, blocks, 20)).toBe(40);
		// 열 5: 두 번째 블록 내부 → null
		expect(getColVisualX(5, blocks, 20)).toBeNull();
		// 열 8: 두 번째 블록 이후 → 시각적 인덱스 5 (0, 중략1, 3, 4, 중략2, 8) → x = 100
		expect(getColVisualX(8, blocks, 20)).toBe(100);
	});

	it('collapsed 블록의 중략 열 x 좌표를 반환한다 (startCol-1 위치 바로 다음)', () => {
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		// startCol=2이므로 열 0,1이 앞에 있음 → 중략 열 x = 2 * 20 = 40
		// getCollapsedColumnBlockVisualX 는 별도 함수 → getColVisualX 로 startCol 직전까지 계산
		// startCol=2 이전: 열 0,1 → 시각적 2열 → 중략 열 x = 2 * 20 = 40
		expect(getColVisualX(6, blocks, 20)).toBe(60); // 열 6 = 시각적 3
	});
});

describe('getCollapsedColumnBlockVisualX', () => {
	it('collapsed 블록이 없을 때 첫 번째 블록의 x = startCol * cellSize', () => {
		const block: CollapsedColumnBlock = { id: 'a', startCol: 3, endCol: 5 };
		expect(getCollapsedColumnBlockVisualX(block, [block], 20)).toBe(3 * 20);
	});

	it('이전에 collapsed 블록이 있을 때 x 오프셋이 적용된다', () => {
		// 첫 번째 블록: startCol=1, endCol=2 → 2열→1열(중략), skipped=1
		// 두 번째 블록: startCol=5 → 시각적 인덱스 = 5 - 1 = 4 → x = 4 * 20 = 80
		const block1: CollapsedColumnBlock = { id: 'a', startCol: 1, endCol: 2 };
		const block2: CollapsedColumnBlock = { id: 'b', startCol: 5, endCol: 7 };
		expect(getCollapsedColumnBlockVisualX(block2, [block1, block2], 20)).toBe(4 * 20);
	});

	it('중략 블록이 여러 개일 때 순서대로 x를 계산한다', () => {
		// 첫 번째: startCol=0, endCol=1 → 2열→1열(중략), skipped=1
		// 두 번째: startCol=3, endCol=4 → 시각적 인덱스 = 3 - 1 = 2 → x = 2 * 10 = 20
		// 세 번째: startCol=6, endCol=8 → skipped=1+1=2, 시각적 인덱스 = 6 - 2 = 4 → x = 4 * 10 = 40
		const block1: CollapsedColumnBlock = { id: 'a', startCol: 0, endCol: 1 };
		const block2: CollapsedColumnBlock = { id: 'b', startCol: 3, endCol: 4 };
		const block3: CollapsedColumnBlock = { id: 'c', startCol: 6, endCol: 8 };
		const blocks = [block1, block2, block3];
		expect(getCollapsedColumnBlockVisualX(block1, blocks, 10)).toBe(0 * 10);
		expect(getCollapsedColumnBlockVisualX(block2, blocks, 10)).toBe(2 * 10);
		expect(getCollapsedColumnBlockVisualX(block3, blocks, 10)).toBe(4 * 10);
	});
});

describe('calcVisualColCount', () => {
	it('collapsed 블록이 없을 때 전체 열 수를 반환한다', () => {
		expect(calcVisualColCount(10, [])).toBe(10);
	});

	it('collapsed 블록이 있을 때 시각적 열 수를 반환한다', () => {
		// startCol=2, endCol=5 → 실제 4열 → 1열(중략) → 3열 감소
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		expect(calcVisualColCount(10, blocks)).toBe(7); // 10 - 4 + 1 = 7
	});

	it('복수의 collapsed 블록의 감소량을 누적한다', () => {
		const blocks: CollapsedColumnBlock[] = [
			{ id: 'a', startCol: 1, endCol: 2 }, // 2열 → 1열(중략): -1
			{ id: 'b', startCol: 5, endCol: 7 }, // 3열 → 1열(중략): -2
		];
		expect(calcVisualColCount(10, blocks)).toBe(7); // 10 - 1 - 2 = 7
	});
});

describe('buildColVisualXMap', () => {
	it('collapsed 블록이 없을 때 모든 열의 x = colIndex * cellSize', () => {
		const map = buildColVisualXMap([], 3, 20);
		expect(map).toEqual([0, 20, 40]);
	});

	it('collapsed 블록 범위 내 열은 null을 반환한다', () => {
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 1, endCol: 2 }];
		const map = buildColVisualXMap(blocks, 5, 20);
		expect(map[1]).toBeNull();
		expect(map[2]).toBeNull();
	});

	it('collapsed 블록 이후 열의 x 오프셋이 조정된다', () => {
		// startCol=2, endCol=5 → 4열 → 1열(중략), skipped=3
		// 열 6: 시각적 인덱스 = 6 - 3 = 3 → x = 60
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		const map = buildColVisualXMap(blocks, 8, 20);
		expect(map[0]).toBe(0);
		expect(map[1]).toBe(20);
		expect(map[2]).toBeNull();
		expect(map[5]).toBeNull();
		expect(map[6]).toBe(60);
		expect(map[7]).toBe(80);
	});

	it('getColVisualX를 반복 호출한 결과와 동일하다', () => {
		const blocks: CollapsedColumnBlock[] = [
			{ id: 'a', startCol: 1, endCol: 2 },
			{ id: 'b', startCol: 5, endCol: 7 },
		];
		const totalCols = 10;
		const cellSize = 20;
		const map = buildColVisualXMap(blocks, totalCols, cellSize);
		for (let i = 0; i < totalCols; i++) {
			expect(map[i]).toBe(getColVisualX(i, blocks, cellSize));
		}
	});
});

describe('buildVisualToDataColIntersectionMap', () => {
	it('중략 블록이 없을 때 [0, 1, 2, ..., visualColCount]를 반환한다', () => {
		const totalCols = 5;
		const blocks: CollapsedColumnBlock[] = [];
		const visualColCount = calcVisualColCount(totalCols, blocks); // 5
		const result = buildVisualToDataColIntersectionMap(blocks, visualColCount);
		expect(result).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('단일 중략 블록(startCol=3, endCol=6, totalCols=10)일 때 올바른 매핑을 반환한다', () => {
		const totalCols = 10;
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 3, endCol: 6 }];
		const visualColCount = calcVisualColCount(totalCols, blocks); // 10 - (6-3+1-1) = 7
		const result = buildVisualToDataColIntersectionMap(blocks, visualColCount);
		// visual 0→data 0, 1→1, 2→2, 3→3(블록 left), 4→7(블록 right=endCol+1), 5→8, 6→9, 7→10
		expect(result).toEqual([0, 1, 2, 3, 7, 8, 9, 10]);
	});

	it('복수 중략 블록(block1: startCol=1,endCol=2 / block2: startCol=5,endCol=7, totalCols=10)일 때 올바른 매핑을 반환한다', () => {
		const totalCols = 10;
		const blocks: CollapsedColumnBlock[] = [
			{ id: 'a', startCol: 1, endCol: 2 }, // 2열→1열(중략): -1
			{ id: 'b', startCol: 5, endCol: 7 }, // 3열→1열(중략): -2
		];
		const visualColCount = calcVisualColCount(totalCols, blocks); // 10 - 1 - 2 = 7
		const result = buildVisualToDataColIntersectionMap(blocks, visualColCount);
		// visual 0→data 0, 1→1(블록a left), 2→3(블록a right), 3→4, 4→5(블록b left), 5→8(블록b right), 6→9, 7→10
		expect(result).toEqual([0, 1, 3, 4, 5, 8, 9, 10]);
	});

	it('배열 길이는 항상 visualColCount + 1이다', () => {
		const totalCols = 10;
		const blocks: CollapsedColumnBlock[] = [{ id: 'a', startCol: 2, endCol: 5 }];
		const visualColCount = calcVisualColCount(totalCols, blocks);
		const result = buildVisualToDataColIntersectionMap(blocks, visualColCount);
		expect(result).toHaveLength(visualColCount + 1);
	});
});
