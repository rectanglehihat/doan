'use client';

import { useCallback, useMemo } from 'react';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { knittingSymbols, crochetSymbols } from '@/constants/knitting-symbols';
import { GridSize } from '@/types/knitting';

export function useChartEditor() {
	const { cells, gridSize, cellSize, patternType, setCellSymbol, setCells, setGridSize, setCellSize, setPatternType, reset } =
		useChartStore();
	const { selectedSymbol, symmetryMode, setSymmetryMode } = useUIStore();

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
	};
}
