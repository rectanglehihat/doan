'use client';

import { useCallback, useMemo } from 'react';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { knittingSymbols, crochetSymbols } from '@/constants/knitting-symbols';
import { GridSize, CellSelection } from '@/types/knitting';

export function useChartEditor() {
	const { cells, gridSize, cellSize, patternType, setCellSymbol, setCells, setGridSize, setCellSize, setPatternType, reset } =
		useChartStore();
	const { selectedSymbol, symmetryMode, setSymmetryMode, clipboard, setClipboard } = useUIStore();

	const symbolsMap = useMemo<Record<string, string>>(() => {
		const symbols = patternType === 'knitting' ? knittingSymbols : crochetSymbols;
		return Object.fromEntries(symbols.map((s) => [s.id, s.abbr]));
	}, [patternType]);

	const handleCellPaint = useCallback(
		(row: number, col: number) => {
			const symbolId = selectedSymbol?.id ?? null;

			if (symmetryMode === 'none') {
				setCellSymbol(row, col, symbolId);
				return;
			}

			const mirrorCol = gridSize.cols - 1 - col;
			const mirrorRow = gridSize.rows - 1 - row;
			const paintSet = new Set([`${row},${col}`]);
			if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
				paintSet.add(`${row},${mirrorCol}`);
			}
			if (symmetryMode === 'vertical' || symmetryMode === 'both') {
				paintSet.add(`${mirrorRow},${col}`);
			}
			if (symmetryMode === 'both') {
				paintSet.add(`${mirrorRow},${mirrorCol}`);
			}

			const newCells = cells.map((r, rIdx) =>
				r.map((cell, cIdx) => (paintSet.has(`${rIdx},${cIdx}`) ? { symbolId } : cell)),
			);
			setCells(newCells);
		},
		[setCellSymbol, setCells, cells, selectedSymbol, symmetryMode, gridSize],
	);

	const clearCell = useCallback(
		(row: number, col: number) => {
			setCellSymbol(row, col, null);
		},
		[setCellSymbol],
	);

	const resizeGrid = useCallback(
		(newGridSize: GridSize) => {
			setGridSize(newGridSize);
		},
		[setGridSize],
	);

	const copySelection = useCallback(
		(selection: CellSelection) => {
			const minRow = Math.min(selection.startRow, selection.endRow);
			const maxRow = Math.max(selection.startRow, selection.endRow);
			const minCol = Math.min(selection.startCol, selection.endCol);
			const maxCol = Math.max(selection.startCol, selection.endCol);
			const copied = cells.slice(minRow, maxRow + 1).map((row) => row.slice(minCol, maxCol + 1));
			setClipboard(copied);
		},
		[cells, setClipboard],
	);

	const pasteClipboard = useCallback(
		(startRow: number, startCol: number) => {
			if (!clipboard) return;
			const newCells = cells.map((r) => [...r]);
			clipboard.forEach((row, dr) => {
				row.forEach((cell, dc) => {
					const r = startRow + dr;
					const c = startCol + dc;
					if (r >= 0 && r < gridSize.rows && c >= 0 && c < gridSize.cols) {
						newCells[r][c] = { ...cell };
					}
				});
			});
			setCells(newCells);
		},
		[cells, clipboard, gridSize, setCells],
	);

	return {
		cells,
		gridSize,
		cellSize,
		patternType,
		selectedSymbol,
		symbolsMap,
		symmetryMode,
		handleCellPaint,
		clearCell,
		resizeGrid,
		setCellSize,
		setSymmetryMode,
		reset,
		setPatternType,
		copySelection,
		pasteClipboard,
	};
}
