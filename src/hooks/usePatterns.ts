'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import {
	loadAllPatterns,
	savePattern,
	deletePattern as deletePatternFromStorage,
	loadPattern as loadPatternFromStorage,
} from '@/lib/utils/local-storage-service';
import type { StorageResult } from '@/lib/utils/local-storage-service';
import type { SavedPatternSnapshot } from '@/types/knitting';

const DEBOUNCE_MS = 300;

export function usePatterns() {
	const [patterns, setPatterns] = useState<SavedPatternSnapshot[]>([]);
	const [isAutoSaving, setIsAutoSaving] = useState(false);

	const cells = useChartStore((s) => s.cells);
	const gridSize = useChartStore((s) => s.gridSize);
	const patternType = useChartStore((s) => s.patternType);
	const patternTitle = useChartStore((s) => s.patternTitle);
	const collapsedBlocks = useChartStore((s) => s.collapsedBlocks);
	const restoreSnapshot = useChartStore((s) => s.restoreSnapshot);
	const resetChart = useChartStore((s) => s.reset);

	const shapeGuide = useUIStore((s) => s.shapeGuide);
	const setShapeGuide = useUIStore((s) => s.setShapeGuide);
	const rotationalMode = useUIStore((s) => s.rotationalMode);
	const setRotationalMode = useUIStore((s) => s.setRotationalMode);
	const currentPatternId = useUIStore((s) => s.currentPatternId);
	const setCurrentPatternId = useUIStore((s) => s.setCurrentPatternId);

	const currentPatternIdRef = useRef<string | null>(null);
	currentPatternIdRef.current = currentPatternId;

	const refreshPatterns = useCallback(() => {
		const result = loadAllPatterns();
		if (result.ok) {
			setPatterns(result.data);
		}
	}, []);

	useEffect(() => {
		refreshPatterns();
	}, [refreshPatterns]);

	const saveCurrentPattern = useCallback(
		(title: string): StorageResult<void> => {
			const id = currentPatternIdRef.current ?? crypto.randomUUID();
			const snapshot: SavedPatternSnapshot = {
				id,
				title,
				patternType,
				gridSize,
				cells,
				collapsedBlocks,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
			};

			const result = savePattern(snapshot);
			if (result.ok) {
				setCurrentPatternId(id);
				refreshPatterns();
			}
			return result;
		},
		[cells, gridSize, patternType, collapsedBlocks, shapeGuide, rotationalMode, refreshPatterns, setCurrentPatternId],
	);

	const loadPattern = useCallback(
		(id: string): void => {
			const result = loadPatternFromStorage(id);
			if (!result.ok) return;

			const snapshot = result.data;
			restoreSnapshot(
				snapshot.cells,
				snapshot.gridSize,
				snapshot.patternType,
				snapshot.title,
				snapshot.collapsedBlocks,
			);
			setShapeGuide(snapshot.shapeGuide);
			setRotationalMode(snapshot.rotationalMode ?? 'none');
			setCurrentPatternId(snapshot.id);
		},
		[restoreSnapshot, setShapeGuide, setRotationalMode, setCurrentPatternId],
	);

	const newPattern = useCallback(() => {
		resetChart();
		setShapeGuide(null);
		setRotationalMode('none');
		setCurrentPatternId(null);
	}, [resetChart, setShapeGuide, setRotationalMode, setCurrentPatternId]);

	const deletePattern = useCallback(
		(id: string): StorageResult<void> => {
			const result = deletePatternFromStorage(id);
			if (result.ok) {
				if (currentPatternIdRef.current === id) {
					setCurrentPatternId(null);
				}
				refreshPatterns();
			}
			return result;
		},
		[refreshPatterns, setCurrentPatternId],
	);

	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (currentPatternId === null) return;

		if (debounceTimerRef.current !== null) {
			clearTimeout(debounceTimerRef.current);
		}

		setIsAutoSaving(true);

		debounceTimerRef.current = setTimeout(() => {
			const id = currentPatternIdRef.current;
			if (id === null) {
				setIsAutoSaving(false);
				return;
			}

			const snapshot: SavedPatternSnapshot = {
				id,
				title: patternTitle,
				patternType,
				gridSize,
				cells,
				collapsedBlocks,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
			};

			savePattern(snapshot);
			refreshPatterns();
			setIsAutoSaving(false);
		}, DEBOUNCE_MS);

		return () => {
			if (debounceTimerRef.current !== null) {
				clearTimeout(debounceTimerRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cells, gridSize, patternType, patternTitle, collapsedBlocks, shapeGuide, rotationalMode]);

	return {
		patterns,
		currentPatternId,
		isAutoSaving,
		saveCurrentPattern,
		loadPattern,
		deletePattern,
		newPattern,
		refreshPatterns,
	};
}
