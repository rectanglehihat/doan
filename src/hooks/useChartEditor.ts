'use client';

import { useCallback, useMemo } from 'react';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { knittingSymbols, crochetSymbols } from '@/constants/knitting-symbols';
import { GridSize } from '@/types/knitting';

export function useChartEditor() {
	const { cells, gridSize, patternType, setCellSymbol, setGridSize, setPatternType, reset } =
		useChartStore();
	const { selectedSymbol } = useUIStore();

	const symbolsMap = useMemo<Record<string, string>>(() => {
		const symbols = patternType === 'knitting' ? knittingSymbols : crochetSymbols;
		return Object.fromEntries(symbols.map((s) => [s.id, s.abbr]));
	}, [patternType]);

	const handleCellPaint = useCallback(
		(row: number, col: number) => {
			setCellSymbol(row, col, selectedSymbol?.id ?? null);
		},
		[setCellSymbol, selectedSymbol],
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
		patternType,
		selectedSymbol,
		symbolsMap,
		handleCellPaint,
		clearCell,
		resizeGrid,
		reset,
		setPatternType,
	};
}
