'use client';

import { createClient } from '@/lib/supabase/client';
import type { TablesInsert, Tables } from '@/types/supabase';
import type { SavedPatternSnapshot } from '@/types/knitting';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

type PatternRow = Tables<'patterns'>;

function rowToSnapshot(row: PatternRow): SavedPatternSnapshot {
	return {
		id: row.id,
		title: row.title,
		patternType: row.pattern_type,
		gridSize: { rows: row.grid_rows, cols: row.grid_cols },
		cells: row.cells,
		collapsedBlocks: row.collapsed_blocks,
		collapsedColumnBlocks: row.collapsed_column_blocks,
		shapeGuide: row.shape_guide,
		rotationalMode: row.rotational_mode,
		savedAt: row.saved_at,
		difficulty: row.difficulty,
		materials: row.materials,
		rowAnnotations: row.row_annotations,
		rangeAnnotations: row.range_annotations,
		columnAnnotations: row.column_annotations,
	};
}

function snapshotToInsert(snapshot: SavedPatternSnapshot, userId: string): TablesInsert<'patterns'> {
	return {
		id: snapshot.id,
		user_id: userId,
		title: snapshot.title,
		pattern_type: snapshot.patternType,
		grid_rows: snapshot.gridSize.rows,
		grid_cols: snapshot.gridSize.cols,
		cells: snapshot.cells,
		collapsed_blocks: snapshot.collapsedBlocks,
		collapsed_column_blocks: snapshot.collapsedColumnBlocks,
		shape_guide: snapshot.shapeGuide,
		rotational_mode: snapshot.rotationalMode,
		difficulty: snapshot.difficulty,
		materials: snapshot.materials,
		row_annotations: snapshot.rowAnnotations ?? [],
		range_annotations: snapshot.rangeAnnotations ?? [],
		column_annotations: snapshot.columnAnnotations ?? [],
		saved_at: snapshot.savedAt,
	};
}

export async function fetchPatterns(userId: string): Promise<ApiResult<SavedPatternSnapshot[]>> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('patterns')
		.select('*')
		.eq('user_id', userId)
		.order('saved_at', { ascending: false });

	if (error !== null) return { ok: false, error: error.message };
	return { ok: true, data: (data ?? []).map(rowToSnapshot) };
}

export async function savePattern(
	snapshot: SavedPatternSnapshot,
	userId: string,
): Promise<ApiResult<void>> {
	const supabase = createClient();
	const { error } = await supabase.from('patterns').upsert(snapshotToInsert(snapshot, userId));

	if (error !== null) return { ok: false, error: error.message };
	return { ok: true, data: undefined };
}

export async function deletePattern(id: string): Promise<ApiResult<void>> {
	const supabase = createClient();
	const { error } = await supabase.from('patterns').delete().eq('id', id);

	if (error !== null) return { ok: false, error: error.message };
	return { ok: true, data: undefined };
}
