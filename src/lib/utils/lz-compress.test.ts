import { describe, it, expect } from 'vitest';
import { compressString, decompressString } from '@/lib/utils/lz-compress';
import type { ChartCell } from '@/types/knitting';

describe('compressString / decompressString', () => {
	it('compress 후 decompress하면 원본 문자열과 동일하다', () => {
		const original = '안녕하세요. 뜨개 도안 편집기입니다.';
		const compressed = compressString(original);
		const restored = decompressString(compressed);
		expect(restored).toBe(original);
	});

	it('빈 문자열도 압축/해제가 정상 동작한다', () => {
		const compressed = compressString('');
		const restored = decompressString(compressed);
		expect(restored).toBe('');
	});

	it('큰 JSON 문자열(400×400 셀 직렬화) compress 결과 길이가 원본보다 짧다', () => {
		const cells: ChartCell[][] = Array.from({ length: 400 }, () =>
			Array.from({ length: 400 }, () => ({ symbolId: null, color: null })),
		);
		const json = JSON.stringify(cells);
		const compressed = compressString(json);

		expect(compressed.length).toBeLessThan(json.length);
	});

	it('decompressString에 빈 문자열 전달 시 빈 문자열을 반환한다', () => {
		const compressed = compressString('');
		const result = decompressString(compressed);
		expect(result).toBe('');
	});

	it('임의의 문자열도 왕복 압축/해제가 동작한다', () => {
		const longText = 'k'.repeat(1000) + 'p'.repeat(1000) + 'yo'.repeat(500);
		const compressed = compressString(longText);
		const restored = decompressString(compressed);
		expect(restored).toBe(longText);
	});

	it('압축된 결과는 원본과 다른 문자열이다', () => {
		const original = '테스트 문자열';
		const compressed = compressString(original);
		expect(compressed).not.toBe(original);
	});
});
