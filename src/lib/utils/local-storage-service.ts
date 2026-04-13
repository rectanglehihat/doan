import type { ChartCell, PatternStorageEntry, SavedPatternSnapshot } from '@/types/knitting';
import { compressString, decompressString } from '@/lib/utils/lz-compress';

const STORAGE_KEY = 'doan_patterns';
const MAX_PATTERNS = 5;
const COMPRESSED_PREFIX = 'lz:';

function isPatternStorageEntry(value: unknown): value is PatternStorageEntry {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as Record<string, unknown>)['version'] === 1 &&
		Array.isArray((value as Record<string, unknown>)['patterns'])
	);
}

export type StorageResult<T> =
	| { ok: true; data: T }
	| {
			ok: false;
			error: 'storage_unavailable' | 'quota_exceeded' | 'limit_reached' | 'not_found' | 'parse_error';
	  };

function readStorage(): StorageResult<PatternStorageEntry> {
	if (typeof window === 'undefined') {
		return { ok: false, error: 'storage_unavailable' };
	}

	let raw: string | null;
	try {
		raw = localStorage.getItem(STORAGE_KEY);
	} catch {
		return { ok: false, error: 'storage_unavailable' };
	}

	if (raw === null) {
		return { ok: true, data: { version: 1, patterns: [] } };
	}

	let parsed: unknown;
	if (raw.startsWith(COMPRESSED_PREFIX)) {
		const decompressed = decompressString(raw.slice(COMPRESSED_PREFIX.length));
		if (decompressed === null) {
			return { ok: false, error: 'parse_error' };
		}
		try {
			parsed = JSON.parse(decompressed);
		} catch {
			return { ok: false, error: 'parse_error' };
		}
	} else {
		try {
			parsed = JSON.parse(raw);
		} catch {
			return { ok: false, error: 'parse_error' };
		}
	}

	if (!isPatternStorageEntry(parsed)) {
		return { ok: true, data: { version: 1, patterns: [] } };
	}

	return { ok: true, data: parsed };
}

function writeStorage(entry: PatternStorageEntry): StorageResult<void> {
	if (typeof window === 'undefined') {
		return { ok: false, error: 'storage_unavailable' };
	}

	try {
		const json = JSON.stringify(entry);
		const compressed = COMPRESSED_PREFIX + compressString(json);
		localStorage.setItem(STORAGE_KEY, compressed);
		return { ok: true, data: undefined };
	} catch (err) {
		if (err instanceof DOMException && err.name === 'QuotaExceededError') {
			return { ok: false, error: 'quota_exceeded' };
		}
		return { ok: false, error: 'storage_unavailable' };
	}
}

function migrateCells(cells: ChartCell[][]): ChartCell[][] {
	return cells.map((row) => row.map((cell) => ({ ...cell, color: cell.color ?? null })));
}

function migrateSnapshot(snapshot: SavedPatternSnapshot): SavedPatternSnapshot {
	return {
		...snapshot,
		cells: migrateCells(snapshot.cells),
		rowAnnotations: snapshot.rowAnnotations ?? [],
		rangeAnnotations: snapshot.rangeAnnotations ?? [],
		columnAnnotations: snapshot.columnAnnotations ?? [],
	};
}

export function loadAllPatterns(): StorageResult<SavedPatternSnapshot[]> {
	const result = readStorage();
	if (!result.ok) return result;
	return { ok: true, data: result.data.patterns.map(migrateSnapshot) };
}

export function savePattern(snapshot: SavedPatternSnapshot): StorageResult<void> {
	const result = readStorage();
	if (!result.ok) return result;

	const { patterns } = result.data;
	const existingIndex = patterns.findIndex((p) => p.id === snapshot.id);

	if (existingIndex === -1 && patterns.length >= MAX_PATTERNS) {
		return { ok: false, error: 'limit_reached' };
	}

	let updatedPatterns: SavedPatternSnapshot[];
	if (existingIndex !== -1) {
		updatedPatterns = patterns.map((p, i) => (i === existingIndex ? snapshot : p));
	} else {
		updatedPatterns = [...patterns, snapshot];
	}

	return writeStorage({ version: 1, patterns: updatedPatterns });
}

export function deletePattern(id: string): StorageResult<void> {
	const result = readStorage();
	if (!result.ok) return result;

	const { patterns } = result.data;
	const index = patterns.findIndex((p) => p.id === id);

	if (index === -1) {
		return { ok: false, error: 'not_found' };
	}

	const updatedPatterns = patterns.filter((p) => p.id !== id);
	return writeStorage({ version: 1, patterns: updatedPatterns });
}

export function loadPattern(id: string): StorageResult<SavedPatternSnapshot> {
	const result = readStorage();
	if (!result.ok) return result;

	const found = result.data.patterns.find((p) => p.id === id);
	if (!found) {
		return { ok: false, error: 'not_found' };
	}

	return { ok: true, data: migrateSnapshot(found) };
}
