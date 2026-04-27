import { loadAllPatterns } from '@/lib/utils/local-storage-service';
import { savePattern } from '@/lib/api/patterns-api';

const MIGRATION_FLAG_PREFIX = 'doan_cloud_migrated_';

export interface MigrationResult {
	migrated: number;
	failed: number;
}

export async function migrateLocalPatternsToCloud(userId: string): Promise<MigrationResult> {
	if (typeof window === 'undefined') return { migrated: 0, failed: 0 };

	const flagKey = `${MIGRATION_FLAG_PREFIX}${userId}`;
	if (localStorage.getItem(flagKey) === 'true') return { migrated: 0, failed: 0 };

	const localResult = loadAllPatterns();
	if (!localResult.ok) return { migrated: 0, failed: 0 };

	const { data: patterns } = localResult;

	if (patterns.length === 0) {
		localStorage.setItem(flagKey, 'true');
		return { migrated: 0, failed: 0 };
	}

	let migrated = 0;
	let failed = 0;

	for (const pattern of patterns) {
		const result = await savePattern(pattern, userId);
		if (result.ok) {
			migrated++;
		} else {
			failed++;
		}
	}

	if (failed === 0) {
		localStorage.setItem(flagKey, 'true');
	}

	return { migrated, failed };
}
