'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CellSelection, GridSize } from '@/types/knitting';

export interface UseEditorShortcutsOptions {
	fitToScreen: (sw: number, sh: number, cw: number, ch: number) => void;
	stageWidth: number;
	stageHeight: number;
	gridSize: GridSize;
	cellSize: number;
	isShapeGuideDrawMode: boolean;
	onShapeGuideStrokeRemove?: (index: number) => void;
	isSelectionMode: boolean;
	cellSelection: CellSelection | null;
	onSelectionChange?: (sel: CellSelection | null) => void;
	onCopySelection?: (sel: CellSelection) => void;
	onPasteClipboard?: (row: number, col: number) => void;
	hoverCellRef: React.RefObject<{ row: number; col: number } | null>;
}

export interface UseEditorShortcutsReturn {
	selectedStrokeIndex: number | null;
	setSelectedStrokeIndex: React.Dispatch<React.SetStateAction<number | null>>;
	handleStrokeClick: (index: number) => void;
}

export function useEditorShortcuts({
	fitToScreen,
	stageWidth,
	stageHeight,
	gridSize,
	cellSize,
	isShapeGuideDrawMode,
	onShapeGuideStrokeRemove,
	isSelectionMode,
	cellSelection,
	onSelectionChange,
	onCopySelection,
	onPasteClipboard,
	hoverCellRef,
}: UseEditorShortcutsOptions): UseEditorShortcutsReturn {
	const [selectedStrokeIndex, setSelectedStrokeIndex] = useState<number | null>(null);

	// F 키: 화면에 맞추기
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === 'f' || e.key === 'F') {
				e.preventDefault();
				fitToScreen(stageWidth, stageHeight, gridSize.cols * cellSize, gridSize.rows * cellSize);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [fitToScreen, stageWidth, stageHeight, gridSize, cellSize]);

	// Delete/Backspace: shape guide 스트로크 삭제
	useEffect(() => {
		if (!isShapeGuideDrawMode) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				setSelectedStrokeIndex((prev) => {
					if (prev !== null) {
						onShapeGuideStrokeRemove?.(prev);
					}
					return null;
				});
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isShapeGuideDrawMode, onShapeGuideStrokeRemove]);

	// 선택 모드 단축키: Escape, Ctrl+C/V, 화살표
	useEffect(() => {
		if (!isSelectionMode) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === 'Escape') {
				onSelectionChange?.(null);
			} else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
				e.preventDefault();
				if (cellSelection) onCopySelection?.(cellSelection);
			} else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
				e.preventDefault();
				if (cellSelection) {
					const minRow = Math.min(cellSelection.startRow, cellSelection.endRow);
					const minCol = Math.min(cellSelection.startCol, cellSelection.endCol);
					onPasteClipboard?.(minRow, minCol);
				} else {
					const hover = hoverCellRef.current;
					if (hover) onPasteClipboard?.(hover.row, hover.col);
				}
			} else if (cellSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				e.preventDefault();
				const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
				const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
				const maxRow = gridSize.rows - 1;
				const maxCol = gridSize.cols - 1;

				if (e.shiftKey) {
					const newEndRow = Math.max(0, Math.min(maxRow, cellSelection.endRow + dr));
					const newEndCol = Math.max(0, Math.min(maxCol, cellSelection.endCol + dc));
					onSelectionChange?.({ ...cellSelection, endRow: newEndRow, endCol: newEndCol });
				} else {
					const selRows = cellSelection.endRow - cellSelection.startRow;
					const selCols = cellSelection.endCol - cellSelection.startCol;
					const newStartRow = Math.max(0, Math.min(maxRow - Math.abs(selRows), cellSelection.startRow + dr));
					const newStartCol = Math.max(0, Math.min(maxCol - Math.abs(selCols), cellSelection.startCol + dc));
					onSelectionChange?.({
						startRow: newStartRow,
						startCol: newStartCol,
						endRow: newStartRow + selRows,
						endCol: newStartCol + selCols,
					});
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSelectionMode, cellSelection, gridSize, onSelectionChange, onCopySelection, onPasteClipboard, hoverCellRef]);

	const handleStrokeClick = useCallback((index: number) => {
		setSelectedStrokeIndex((prev) => (prev === index ? null : index));
	}, []);

	return { selectedStrokeIndex, setSelectedStrokeIndex, handleStrokeClick };
}
