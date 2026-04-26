'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
	fetchPatterns,
	savePattern as savePatternApi,
	deletePattern as deletePatternApi,
} from '@/lib/api/patterns-api';
import type { ApiResult } from '@/lib/api/patterns-api';
import { migrateLocalPatternsToCloud } from '@/lib/utils/migrate-to-cloud';
import type { SavedPatternSnapshot } from '@/types/knitting';

const DEBOUNCE_MS = 300;

export function usePatterns() {
	const [patterns, setPatterns] = useState<SavedPatternSnapshot[]>([]);
	const [isAutoSaving, setIsAutoSaving] = useState(false);

	const user = useUserStore((s) => s.user);
	const userRef = useRef<User | null>(null);
	userRef.current = user;

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
	const columnAnnotations = useChartStore((s) => s.columnAnnotations);
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

	const refreshPatterns = useCallback(async (): Promise<void> => {
		const currentUser = userRef.current;
		if (currentUser === null) return;
		const result = await fetchPatterns(currentUser.id);
		if (result.ok) setPatterns(result.data);
	}, []);

	// 사용자 변경 감지: 처음 로그인 시 마이그레이션 후 패턴 로드
	const prevUserIdRef = useRef<string | null>(null);
	useEffect(() => {
		if (user === null) return;
		if (prevUserIdRef.current === user.id) return;
		prevUserIdRef.current = user.id;

		migrateLocalPatternsToCloud(user.id).then(() => refreshPatterns());
	}, [user, refreshPatterns]);

	const saveCurrentPattern = useCallback(
		async (title: string): Promise<ApiResult<void>> => {
			const currentUser = userRef.current;
			if (currentUser === null) return { ok: false, error: 'unauthenticated' };

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
				columnAnnotations,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
				difficulty,
				materials,
			};

			const result = await savePatternApi(snapshot, currentUser.id);
			if (result.ok) {
				setCurrentPatternId(id);
				await refreshPatterns();
			}
			return result;
		},
		[
			cells,
			gridSize,
			patternType,
			collapsedBlocks,
			collapsedColumnBlocks,
			rowAnnotations,
			rangeAnnotations,
			columnAnnotations,
			shapeGuide,
			rotationalMode,
			difficulty,
			materials,
			refreshPatterns,
			setCurrentPatternId,
		],
	);

	const loadPattern = useCallback(
		(id: string): void => {
			const snapshot = patterns.find((p) => p.id === id);
			if (!snapshot) return;

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
				snapshot.columnAnnotations,
			);
			setShapeGuide(snapshot.shapeGuide);
			setRotationalMode(snapshot.rotationalMode ?? 'none');
			setCurrentPatternId(snapshot.id);
			triggerHistoryClear();
		},
		[patterns, restoreSnapshot, setShapeGuide, setRotationalMode, setCurrentPatternId, triggerHistoryClear],
	);

	const newPattern = useCallback(() => {
		resetChart();
		setShapeGuide(null);
		setRotationalMode('none');
		setCurrentPatternId(null);
		triggerHistoryClear();
	}, [resetChart, setShapeGuide, setRotationalMode, setCurrentPatternId, triggerHistoryClear]);

	const deletePattern = useCallback(
		async (id: string): Promise<ApiResult<void>> => {
			const result = await deletePatternApi(id);
			if (result.ok) {
				if (currentPatternIdRef.current === id) setCurrentPatternId(null);
				await refreshPatterns();
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

		debounceTimerRef.current = setTimeout(async () => {
			const id = currentPatternIdRef.current;
			const currentUser = userRef.current;
			if (id === null || currentUser === null) {
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
				columnAnnotations,
				shapeGuide,
				rotationalMode,
				savedAt: new Date().toISOString(),
				difficulty,
				materials,
			};

			await savePatternApi(snapshot, currentUser.id);
			setIsAutoSaving(false);
		}, DEBOUNCE_MS);

		return () => {
			if (debounceTimerRef.current !== null) {
				clearTimeout(debounceTimerRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cells, gridSize, patternType, patternTitle, collapsedBlocks, collapsedColumnBlocks, rowAnnotations, rangeAnnotations, columnAnnotations, shapeGuide, rotationalMode, difficulty, materials]);

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
