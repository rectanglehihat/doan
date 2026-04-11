'use client';

import { useCallback, useRef, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';

interface UseRangeAnnotationDragParams {
	onSingleRow?: (rowIndex: number) => void;
}

interface UseRangeAnnotationDragResult {
	dragStartRow: number | null;
	handleRangeDragStart: (rowIndex: number) => void;
	handleRangeDragMove: (rowIndex: number) => void;
	handleRangeDragEnd: (anchorX: number, anchorY: number) => void;
}

export function useRangeAnnotationDrag(
	params: UseRangeAnnotationDragParams = {},
): UseRangeAnnotationDragResult {
	const { onSingleRow } = params;
	const { setRangeAnnotationDraft, openRangeAnnotationPopover } = useUIStore();
	const dragStartRowRef = useRef<number | null>(null);
	const [dragStartRow, setDragStartRow] = useState<number | null>(null);

	const handleRangeDragStart = useCallback(
		(rowIndex: number) => {
			dragStartRowRef.current = rowIndex;
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
			setRangeAnnotationDraft({ startRow, endRow });
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
					onSingleRow(draft.startRow);
				}
			} else {
				openRangeAnnotationPopover({
					startRowIndex: draft.startRow,
					endRowIndex: draft.endRow,
					anchorX,
					anchorY,
					existingId: null,
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
