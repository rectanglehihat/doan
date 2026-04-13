'use client';

import { useCallback, useRef, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';

interface UseRangeAnnotationDragParams {
	onSingleRow?: (rowIndex: number, side?: 'left' | 'right') => void;
}

interface UseRangeAnnotationDragResult {
	dragStartRow: number | null;
	handleRangeDragStart: (rowIndex: number, side?: 'left' | 'right') => void;
	handleRangeDragMove: (rowIndex: number) => void;
	handleRangeDragEnd: (anchorX: number, anchorY: number) => void;
}

export function useRangeAnnotationDrag(
	params: UseRangeAnnotationDragParams = {},
): UseRangeAnnotationDragResult {
	const { onSingleRow } = params;
	const { setRangeAnnotationDraft, openRangeAnnotationPopover } = useUIStore();
	const dragStartRowRef = useRef<number | null>(null);
	const dragSideRef = useRef<'left' | 'right'>('right');
	const [dragStartRow, setDragStartRow] = useState<number | null>(null);

	const handleRangeDragStart = useCallback(
		(rowIndex: number, side?: 'left' | 'right') => {
			dragStartRowRef.current = rowIndex;
			dragSideRef.current = side ?? 'right';
			setDragStartRow(rowIndex);
			setRangeAnnotationDraft(null);
		},
		[setRangeAnnotationDraft],
	);

	const handleRangeDragMove = useCallback(
		(rowIndex: number) => {
			if (dragStartRowRef.current === null) return;
			const startRow = Math.min(dragStartRowRef.current, rowIndex);
			const endRow = Math.max(dragStartRowRef.current, rowIndex);
			setRangeAnnotationDraft({ startRow, endRow, side: dragSideRef.current });
		},
		[setRangeAnnotationDraft],
	);

	const handleRangeDragEnd = useCallback(
		(anchorX: number, anchorY: number) => {
			dragStartRowRef.current = null;
			setDragStartRow(null);

			const draft = useUIStore.getState().rangeAnnotationDraft;
			if (draft === null) {
				return;
			}

			if (draft.startRow === draft.endRow) {
				if (onSingleRow !== undefined) {
					onSingleRow(draft.startRow, dragSideRef.current);
				}
			} else {
				openRangeAnnotationPopover({
					startRowIndex: draft.startRow,
					endRowIndex: draft.endRow,
					anchorX,
					anchorY,
					existingId: null,
					side: dragSideRef.current,
				});
			}

			setRangeAnnotationDraft(null);
		},
		[onSingleRow, openRangeAnnotationPopover, setRangeAnnotationDraft],
	);

	return {
		dragStartRow,
		handleRangeDragStart,
		handleRangeDragMove,
		handleRangeDragEnd,
	};
}
