import { describe, it, expect } from 'vitest';
import { calcErasePartialStrokes, calcErasePartialStrokesNearPoint } from './eraser';

describe('calcErasePartialStrokes', () => {
  const stroke1 = [0, 0, 5, 0, 10, 0]; // 수평 선분 두 개

  it('strokes가 비어있으면 빈 배열을 반환한다', () => {
    const result = calcErasePartialStrokes([], 0, 0, 1, 1, 'none', 10, 10);
    expect(result).toEqual([]);
  });

  it('지우기 세그먼트와 겹치지 않으면 빈 배열을 반환한다', () => {
    const result = calcErasePartialStrokes([stroke1], 0, 10, 1, 10, 'none', 20, 20);
    expect(result).toEqual([]);
  });

  it('stroke가 완전히 지워지면 { index, newStrokes: [] }를 반환한다', () => {
    const shortStroke = [0, 0, 1, 0];
    const result = calcErasePartialStrokes([shortStroke], -1, -1, 2, 1, 'none', 10, 10);
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(0);
    expect(result[0].newStrokes).toEqual([]);
  });

  it('rotationalMode=horizontal이면 수평 미러 지우기 세그먼트도 적용한다', () => {
    // cols=10, stroke가 (9,0)~(10,0)에 위치 (미러 위치)
    const mirrorStroke = [9, 0, 10, 0];
    // 지우기 세그먼트 (0,0)~(1,0) → 미러는 (10,0)~(9,0)
    const result = calcErasePartialStrokes([mirrorStroke], 0, -0.1, 1, 0.1, 'horizontal', 10, 10);
    expect(result).toHaveLength(1);
    expect(result[0].newStrokes).toEqual([]);
  });
});

describe('calcErasePartialStrokesNearPoint', () => {
  it('strokes가 비어있으면 빈 배열을 반환한다', () => {
    const result = calcErasePartialStrokesNearPoint([], 5, 5, 'none', 10, 10);
    expect(result).toEqual([]);
  });

  it('점이 stroke 근방에 없으면 빈 배열을 반환한다', () => {
    const stroke = [0, 0, 1, 0];
    const result = calcErasePartialStrokesNearPoint([stroke], 10, 10, 'none', 20, 20);
    expect(result).toEqual([]);
  });

  it('점이 stroke 근방에 있으면 해당 stroke에 대한 변경 사항을 반환한다', () => {
    const stroke = [0, 0, 1, 0, 2, 0];
    // 점(1, 0.5)이 (1,0)~(2,0) 세그먼트에 근접 (THRESHOLD_SQ = 0.49)
    const result = calcErasePartialStrokesNearPoint([stroke], 1, 0.5, 'none', 10, 10);
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(0);
  });
});
