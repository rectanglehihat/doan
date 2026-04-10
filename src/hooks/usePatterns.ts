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
	const collapsedColumnBlocks = useChartStore((s) => s.collapsedColumnBlocks);
	const difficulty = useChartStore((s) => s.difficulty);
	const materials = useChartStore((s) => s.materials);
	const rowAnnotations = useChartStore((s) => s.rowAnnotations);
	const rangeAnnotations = useChartStore((s) => s.rangeAnnotations);
	const restoreSnapshot = useChartStore((s) => s.restoreSnapshot);
	const resetChart = useChartStore((s) => s.reset);

	const shapeGuide = useUIStore((s) => s.shapeGuide);
	const setShapeGuide = useUIStore((s) => s.setShapeGuide);
	const rotationalMode = useUIStore((s) => s.rotationalMode);
	const setRotationalMode = useUIStore((s) => s.setRotationalMode);
	const currentPatternId = useUIStore((s) => s.currentPatternId);
	const setCurrentPatternId = useUIStore((s) => s.setCurrentPatternId);
	const triggerHistoryClear = useUIStore((s) => s.triggerHistoryClear);

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
				collapsedColumnBlocks,
				rowAnnotations,
				rangeAnnotations,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
				difficulty,
				materials,
			};

			const result = savePattern(snapshot);
			if (result.ok) {
				setCurrentPatternId(id);
				refreshPatterns();
			}
			return result;
		},
		[cells, gridSize, patternType, collapsedBlocks, collapsedColumnBlocks, rowAnnotations, rangeAnnotations, shapeGuide, rotationalMode, difficulty, materials, refreshPatterns, setCurrentPatternId],
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
				snapshot.difficulty ?? 0,
				snapshot.materials ?? '',
				snapshot.collapsedColumnBlocks,
				snapshot.rowAnnotations,
				snapshot.rangeAnnotations,
			);
			setShapeGuide(snapshot.shapeGuide);
			setRotationalMode(snapshot.rotationalMode ?? 'none');
			setCurrentPatternId(snapshot.id);
			triggerHistoryClear();
		},
		[restoreSnapshot, setShapeGuide, setRotationalMode, setCurrentPatternId, triggerHistoryClear],
	);

	const newPattern = useCallback(() => {
		resetChart();
		setShapeGuide(null);
		setRotationalMode('none');
		setCurrentPatternId(null);
		triggerHistoryClear();
	}, [resetChart, setShapeGuide, setRotationalMode, setCurrentPatternId, triggerHistoryClear]);

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
				collapsedColumnBlocks,
				rowAnnotations,
				rangeAnnotations,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
				difficulty,
				materials,
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
	}, [cells, gridSize, patternType, patternTitle, collapsedBlocks, collapsedColumnBlocks, rowAnnotations, rangeAnnotations, shapeGuide, rotationalMode, difficulty, materials]);

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
