import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRangeAnnotationDrag } from './useRangeAnnotationDrag';
import { useUIStore } from '@/store/useUIStore';
import { useChartStore } from '@/store/useChartStore';

beforeEach(() => {
	useUIStore.getState().reset();
	useChartStore.getState().reset();
	vi.clearAllMocks();
});

describe('useRangeAnnotationDrag', () => {
	describe('초기 상태', () => {
		it('dragStartRow는 null이다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			expect(result.current.dragStartRow).toBeNull();
		});
	});

	describe('handleRangeDragStart', () => {
		it('호출 시 dragStartRow가 설정된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(5);
			});
			expect(result.current.dragStartRow).toBe(5);
		});

		it('호출 시 rangeAnnotationDraft가 초기화된다 (null)', () => {
			useUIStore.getState().setRangeAnnotationDraft({ startRow: 0, endRow: 3 });
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(2);
			});
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});
	});

	describe('handleRangeDragMove', () => {
		it('dragStartRow보다 currentRow가 크면 startRow < endRow로 draft가 설정된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(3);
			});
			act(() => {
				result.current.handleRangeDragMove(7);
			});
			const draft = useUIStore.getState().rangeAnnotationDraft;
			expect(draft?.startRow).toBe(3);
			expect(draft?.endRow).toBe(7);
		});

		it('위로 드래그 시 startRow < endRow 보장 (min/max 정규화)', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(8);
			});
			act(() => {
				result.current.handleRangeDragMove(3);
			});
			const draft = useUIStore.getState().rangeAnnotationDraft;
			expect(draft).not.toBeNull();
			expect(draft?.startRow).toBe(3);
			expect(draft?.endRow).toBe(8);
		});

		it('dragStartRow가 null이면 draft가 설정되지 않는다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragMove(5);
			});
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});

		it('같은 행으로 드래그하면 startRow === endRow인 draft가 설정된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(4);
			});
			act(() => {
				result.current.handleRangeDragMove(4);
			});
			const draft = useUIStore.getState().rangeAnnotationDraft;
			expect(draft?.startRow).toBe(4);
			expect(draft?.endRow).toBe(4);
		});
	});

	describe('handleRangeDragEnd', () => {
		it('draft가 단일 행(startRow === endRow)이면 singleRowCallback이 호출된다', () => {
			const singleRowCallback = vi.fn();
			const { result } = renderHook(() =>
				useRangeAnnotationDrag({ onSingleRow: singleRowCallback }),
			);
			act(() => {
				result.current.handleRangeDragStart(3);
			});
			act(() => {
				result.current.handleRangeDragMove(3);
			});
			act(() => {
				result.current.handleRangeDragEnd(100, 60);
			});
			expect(singleRowCallback).toHaveBeenCalledWith(3, 'right');
		});

		it('draft가 다중 행이면 openRangeAnnotationPopover가 호출된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(2);
			});
			act(() => {
				result.current.handleRangeDragMove(6);
			});
			act(() => {
				result.current.handleRangeDragEnd(100, 60);
			});
			const popover = useUIStore.getState().rangeAnnotationPopover;
			expect(popover).not.toBeNull();
			expect(popover?.startRowIndex).toBe(2);
			expect(popover?.endRowIndex).toBe(6);
		});

		it('handleRangeDragEnd 후 draft가 null로 초기화된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(1);
			});
			act(() => {
				result.current.handleRangeDragMove(4);
			});
			act(() => {
				result.current.handleRangeDragEnd(50, 80);
			});
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});

		it('handleRangeDragEnd 후 dragStartRow가 null로 초기화된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(0);
			});
			act(() => {
				result.current.handleRangeDragMove(3);
			});
			act(() => {
				result.current.handleRangeDragEnd(0, 0);
			});
			expect(result.current.dragStartRow).toBeNull();
		});

		it('draft가 null이면 아무 콜백도 호출되지 않는다', () => {
			const singleRowCallback = vi.fn();
			const { result } = renderHook(() =>
				useRangeAnnotationDrag({ onSingleRow: singleRowCallback }),
			);
			act(() => {
				result.current.handleRangeDragEnd(0, 0);
			});
			expect(singleRowCallback).not.toHaveBeenCalled();
			expect(useUIStore.getState().rangeAnnotationPopover).toBeNull();
		});

		it('draft가 null이어도 dragStartRow가 null로 초기화된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(3);
			});
			act(() => {
				result.current.handleRangeDragEnd(0, 0);
			});
			expect(result.current.dragStartRow).toBeNull();
		});

		it('draft가 null일 때 DragEnd 후 DragMove를 호출해도 draft가 설정되지 않는다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(3);
			});
			act(() => {
				result.current.handleRangeDragEnd(0, 0);
			});
			act(() => {
				result.current.handleRangeDragMove(5);
			});
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});

		it('openRangeAnnotationPopover 호출 시 anchorX, anchorY가 전달된다', () => {
			const { result } = renderHook(() => useRangeAnnotationDrag());
			act(() => {
				result.current.handleRangeDragStart(0);
			});
			act(() => {
				result.current.handleRangeDragMove(5);
			});
			act(() => {
				result.current.handleRangeDragEnd(200, 150);
			});
			const popover = useUIStore.getState().rangeAnnotationPopover;
			expect(popover?.anchorX).toBe(200);
			expect(popover?.anchorY).toBe(150);
		});
	});
});
