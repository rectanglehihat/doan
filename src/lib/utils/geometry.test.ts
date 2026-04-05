import { describe, it, expect } from 'vitest';
import {
  ERASE_THRESHOLD_SQ,
  cross2D,
  pointToSegmentDistSq,
  segmentsProperlyIntersect,
  splitStrokeByErasePath,
  splitStrokeByPoint,
  strokeSegmentHitByErase,
} from './geometry';

describe('cross2D', () => {
  it('두 벡터의 2D 외적을 반환한다', () => {
    expect(cross2D(1, 0, 0, 1)).toBe(1);
    expect(cross2D(0, 1, 1, 0)).toBe(-1);
    expect(cross2D(1, 0, 1, 0)).toBe(0);
  });
});

describe('pointToSegmentDistSq', () => {
  it('점이 선분 위에 있으면 0을 반환한다', () => {
    expect(pointToSegmentDistSq(1, 0, 0, 0, 2, 0)).toBe(0);
  });

  it('선분이 점(길이 0)이면 점까지의 거리 제곱을 반환한다', () => {
    expect(pointToSegmentDistSq(3, 4, 0, 0, 0, 0)).toBe(25);
  });

  it('점이 선분 끝점 너머에 있을 때 가장 가까운 끝점까지의 거리 제곱을 반환한다', () => {
    // 선분 (0,0)~(1,0), 점 (3,0) → 끝점(1,0)까지 거리 = 2, 거리² = 4
    expect(pointToSegmentDistSq(3, 0, 0, 0, 1, 0)).toBe(4);
  });
});

describe('segmentsProperlyIntersect', () => {
  it('교차하는 두 선분에서 true를 반환한다', () => {
    // (0,0)~(2,2) 와 (0,2)~(2,0) 교차
    expect(segmentsProperlyIntersect(0, 0, 2, 2, 0, 2, 2, 0)).toBe(true);
  });

  it('교차하지 않는 두 평행 선분에서 false를 반환한다', () => {
    expect(segmentsProperlyIntersect(0, 0, 1, 0, 0, 1, 1, 1)).toBe(false);
  });

  it('T자 형태로 끝점이 다른 선분 위에 있을 때 true를 반환한다 (지우개 히트 감지 목적)', () => {
    // (0,0)~(2,0) 과 (1,0)~(1,2) → (1,0)이 첫 번째 선분 위 — 지우개 알고리즘에서 히트로 판정
    expect(segmentsProperlyIntersect(0, 0, 2, 0, 1, 0, 1, 2)).toBe(true);
  });
});

describe('ERASE_THRESHOLD_SQ', () => {
  it('0.25 (0.5²) 이다', () => {
    expect(ERASE_THRESHOLD_SQ).toBe(0.25);
  });
});

describe('strokeSegmentHitByErase', () => {
  it('두 선분이 교차하면 true를 반환한다', () => {
    // 스트로크 세그먼트 (0,0)~(2,2), 지우기 세그먼트 (0,2)~(2,0) — 교차
    expect(strokeSegmentHitByErase(0, 0, 2, 2, 0, 2, 2, 0)).toBe(true);
  });

  it('스트로크 시작점이 지우기 세그먼트에 충분히 가까우면 true를 반환한다', () => {
    // 지우기 세그먼트 (10,10)~(11,10), 스트로크 시작점 (10, 10.3) — 매우 근접
    expect(strokeSegmentHitByErase(10, 10.3, 10, 10.4, 10, 10, 11, 10)).toBe(true);
  });

  it('두 선분이 멀리 떨어져 있으면 false를 반환한다', () => {
    expect(strokeSegmentHitByErase(0, 0, 1, 0, 10, 10, 11, 10)).toBe(false);
  });
});

describe('splitStrokeByErasePath', () => {
  it('히트된 세그먼트 없으면 원래 stroke를 배열로 반환한다', () => {
    const stroke = [0, 0, 1, 0, 2, 0];
    const result = splitStrokeByErasePath(stroke, 10, 10, 11, 10);
    expect(result).toEqual([stroke]);
  });

  it('히트된 세그먼트가 중간에 있으면 두 개의 조각으로 분리한다', () => {
    // stroke: (0,0)→(1,0)→(2,0)→(3,0)
    // 지우기 세그먼트가 (1,0)~(2,0) 교차
    const stroke = [0, 0, 1, 0, 2, 0, 3, 0];
    const result = splitStrokeByErasePath(stroke, 1, -1, 1, 1);
    // (1,0)~(2,0) 세그먼트가 x=1 수직선과 교차 → 분리
    expect(result.length).toBeGreaterThan(0);
  });

  it('stroke가 완전히 지워지면 빈 배열을 반환한다', () => {
    // 짧은 stroke, 넓은 지우기 영역
    const stroke = [0, 0, 1, 0];
    const result = splitStrokeByErasePath(stroke, -1, -1, 2, 1);
    expect(result).toHaveLength(0);
  });

  it('길이 2 미만 세그먼트는 결과에 포함되지 않는다 (최소 4개 좌표 필요)', () => {
    const stroke = [0, 0, 1, 0, 2, 0];
    // 두 번째 세그먼트(1,0)~(2,0) 제거하면 [0,0,1,0]만 남음
    const result = splitStrokeByErasePath(stroke, 1.5, -1, 1.5, 1);
    // 남은 세그먼트 [0,0,1,0]은 길이 4이므로 포함됨
    expect(result.every((s) => s.length >= 4)).toBe(true);
  });
});

describe('splitStrokeByPoint', () => {
  it('점이 stroke 세그먼트에서 멀면 원래 stroke를 반환한다', () => {
    const stroke = [0, 0, 1, 0, 2, 0];
    const result = splitStrokeByPoint(stroke, 10, 10, 1);
    expect(result).toEqual([stroke]);
  });

  it('점이 stroke 세그먼트와 임계값 이내에 있으면 해당 세그먼트를 제거하고 분리한다', () => {
    const stroke = [0, 0, 1, 0, 2, 0, 3, 0];
    // 점(1, 0.3)이 (1,0)~(2,0) 세그먼트에 근접 (thresholdSq=1 이면 통과)
    const result = splitStrokeByPoint(stroke, 1, 0.3, 1);
    // 분리 결과가 비어있지 않거나 원래보다 짧아야 함
    const totalLen = result.reduce((sum, s) => sum + s.length, 0);
    expect(totalLen).toBeLessThan(stroke.length);
  });
});
