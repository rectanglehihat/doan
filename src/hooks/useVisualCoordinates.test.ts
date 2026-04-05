import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type Konva from 'konva';
import type React from 'react';
import { useVisualCoordinates } from './useVisualCoordinates';
import type { CollapsedBlock, CollapsedColumnBlock, GridSize } from '@/types/knitting';

const nullLayerRef: React.RefObject<Konva.Layer | null> = { current: null };

const defaultArgs = {
  gridSize: { rows: 5, cols: 5 } as GridSize,
  cellSize: 20,
  collapsedBlocks: [] as CollapsedBlock[],
  collapsedColumnBlocks: [] as CollapsedColumnBlock[],
  rotationalMode: 'none' as const,
  layerRef: nullLayerRef,
};

describe('useVisualCoordinates', () => {
  it('중략 없을 때 visualRowCount는 gridSize.rows와 같다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.visualRowCount).toBe(5);
  });

  it('중략 없을 때 visualColCount는 gridSize.cols와 같다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.visualColCount).toBe(5);
  });

  it('totalWidth = visualColCount * cellSize', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.totalWidth).toBe(5 * 20);
  });

  it('totalHeight = visualRowCount * cellSize', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.totalHeight).toBe(5 * 20);
  });

  it('rowVisualYMap의 길이는 gridSize.rows와 같다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.rowVisualYMap).toHaveLength(5);
  });

  it('colVisualXMap의 길이는 gridSize.cols와 같다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.colVisualXMap).toHaveLength(5);
  });

  it('중략 블록이 있으면 visualRowCount가 감소한다', () => {
    const block: CollapsedBlock = { id: 'b1', startRow: 1, endRow: 2 };
    const { result } = renderHook(() =>
      useVisualCoordinates({ ...defaultArgs, collapsedBlocks: [block] }),
    );
    // 2개 행이 1개로 축소 → 5 - (2-1) = 4
    expect(result.current.visualRowCount).toBe(4);
  });

  it('collapsedBlockYMap의 길이는 collapsedBlocks 수와 같다', () => {
    const block: CollapsedBlock = { id: 'b1', startRow: 1, endRow: 2 };
    const { result } = renderHook(() =>
      useVisualCoordinates({ ...defaultArgs, collapsedBlocks: [block] }),
    );
    expect(result.current.collapsedBlockYMap).toHaveLength(1);
  });

  it('getGridPointer는 layerRef가 null이면 null을 반환한다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.getGridPointer()).toBeNull();
  });

  it('getCellFromPointer는 layerRef가 null이면 null을 반환한다', () => {
    const { result } = renderHook(() => useVisualCoordinates(defaultArgs));
    expect(result.current.getCellFromPointer()).toBeNull();
  });
});
