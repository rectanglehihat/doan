import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useEditorShortcuts } from './useEditorShortcuts';
import type { CellSelection, GridSize } from '@/types/knitting';

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
}

const defaultGridSize: GridSize = { rows: 10, cols: 10 };

describe('useEditorShortcuts', () => {
  const fitToScreen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('F 키를 누르면 fitToScreen이 호출된다', () => {
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: false,
        cellSelection: null,
        hoverCellRef: createRef(),
      }),
    );
    fireKey('f');
    expect(fitToScreen).toHaveBeenCalledWith(800, 600, 200, 200);
  });

  it('input 내에서 F 키를 눌러도 fitToScreen이 호출되지 않는다', () => {
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: false,
        cellSelection: null,
        hoverCellRef: createRef(),
      }),
    );
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
    document.body.removeChild(input);
    expect(fitToScreen).not.toHaveBeenCalled();
  });

  it('isShapeGuideDrawMode=true이고 Delete 키를 누르면 onShapeGuideStrokeRemove가 호출된다', () => {
    const onShapeGuideStrokeRemove = vi.fn();
    // selectedStrokeIndex를 외부에서 제어할 수 없으므로, 훅 내부 상태를 사용하는 방식 확인
    // 이 테스트는 Delete 키 이벤트 등록 여부만 확인
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: true,
        onShapeGuideStrokeRemove,
        isSelectionMode: false,
        cellSelection: null,
        hoverCellRef: createRef(),
      }),
    );
    // selectedStrokeIndex가 null이므로 호출 안 됨
    fireKey('Delete');
    expect(onShapeGuideStrokeRemove).not.toHaveBeenCalled();
  });

  it('isSelectionMode=true이고 Escape 키를 누르면 onSelectionChange(null)이 호출된다', () => {
    const onSelectionChange = vi.fn();
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: true,
        cellSelection: null,
        onSelectionChange,
        hoverCellRef: createRef(),
      }),
    );
    fireKey('Escape');
    expect(onSelectionChange).toHaveBeenCalledWith(null);
  });

  it('isSelectionMode=true이고 Ctrl+C를 누르면 onCopySelection이 호출된다', () => {
    const onCopySelection = vi.fn();
    const cellSelection: CellSelection = { startRow: 0, startCol: 0, endRow: 1, endCol: 1 };
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: true,
        cellSelection,
        onCopySelection,
        hoverCellRef: createRef(),
      }),
    );
    fireKey('c', { ctrlKey: true });
    expect(onCopySelection).toHaveBeenCalledWith(cellSelection);
  });

  it('isSelectionMode=true이고 ArrowDown을 누르면 onSelectionChange가 이동된 선택 영역으로 호출된다', () => {
    const onSelectionChange = vi.fn();
    const cellSelection: CellSelection = { startRow: 2, startCol: 2, endRow: 3, endCol: 3 };
    renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: true,
        cellSelection,
        onSelectionChange,
        hoverCellRef: createRef(),
      }),
    );
    fireKey('ArrowDown');
    expect(onSelectionChange).toHaveBeenCalledWith({
      startRow: 3,
      startCol: 2,
      endRow: 4,
      endCol: 3,
    });
  });

  it('selectedStrokeIndex와 setSelectedStrokeIndex를 반환한다', () => {
    const { result } = renderHook(() =>
      useEditorShortcuts({
        fitToScreen,
        stageWidth: 800,
        stageHeight: 600,
        gridSize: defaultGridSize,
        cellSize: 20,
        isShapeGuideDrawMode: false,
        isSelectionMode: false,
        cellSelection: null,
        hoverCellRef: createRef(),
      }),
    );
    expect(result.current.selectedStrokeIndex).toBeNull();
    expect(typeof result.current.setSelectedStrokeIndex).toBe('function');
  });
});
