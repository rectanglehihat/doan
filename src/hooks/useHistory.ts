'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartCell } from '@/types/knitting';
import { useChartStore } from '@/store/useChartStore';

const MAX_HISTORY = 50;

export function useHistory() {
	const pastRef = useRef<ChartCell[][][]>([]);
	const futureRef = useRef<ChartCell[][][]>([]);
	const isApplyingRef = useRef(false);
	const prevCellsRef = useRef<ChartCell[][]>(useChartStore.getState().cells);

	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const setCells = useChartStore((state) => state.setCells);

	// Zustand subscribe 콜백 내에서 setState 호출 — effect body에서 직접 호출 아님
	useEffect(() => {
		const unsubscribe = useChartStore.subscribe((state) => {
			const cells = state.cells;

			// undo/redo로 인한 변경은 히스토리에 기록하지 않음
			if (isApplyingRef.current) {
				isApplyingRef.current = false;
				prevCellsRef.current = cells;
				return;
			}

			if (cells === prevCellsRef.current) return;

			pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prevCellsRef.current];
			futureRef.current = [];
			prevCellsRef.current = cells;
			setCanUndo(true);
			setCanRedo(false);
		});
		return unsubscribe;
	}, []);

	const undo = useCallback(() => {
		if (pastRef.current.length === 0) return;
		const previous = pastRef.current[pastRef.current.length - 1];
		futureRef.current = [prevCellsRef.current, ...futureRef.current];
		pastRef.current = pastRef.current.slice(0, -1);
		isApplyingRef.current = true;
		prevCellsRef.current = previous;
		setCells(previous);
		setCanUndo(pastRef.current.length > 0);
		setCanRedo(true);
	}, [setCells]);

	const redo = useCallback(() => {
		if (futureRef.current.length === 0) return;
		const next = futureRef.current[0];
		pastRef.current = [...pastRef.current, prevCellsRef.current];
		futureRef.current = futureRef.current.slice(1);
		isApplyingRef.current = true;
		prevCellsRef.current = next;
		setCells(next);
		setCanUndo(true);
		setCanRedo(futureRef.current.length > 0);
	}, [setCells]);

	return { undo, redo, canUndo, canRedo };
}
