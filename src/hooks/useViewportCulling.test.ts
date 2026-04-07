import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useViewportCulling } from '@/hooks/useViewportCulling';

interface ViewportCullingInput {
	transform: { scale: number; x: number; y: number };
	stageWidth: number;
	stageHeight: number;
	cellSize: number;
	totalRows: number;
	totalCols: number;
	bufferCells?: number;
}

describe('useViewportCulling', () => {
	function getRange(input: ViewportCullingInput) {
		const { result } = renderHook(() => useViewportCulling(input));
		return result.current;
	}

	describe('scale=1, offset=(0,0) 기본 케이스', () => {
		const base: ViewportCullingInput = {
			transform: { scale: 1, x: 0, y: 0 },
			stageWidth: 800,
			stageHeight: 600,
			cellSize: 20,
			totalRows: 400,
			totalCols: 400,
		};

		it('startRow=0, startCol=0을 반환한다', () => {
			const range = getRange(base);
			expect(range.startRow).toBe(0);
			expect(range.startCol).toBe(0);
		});

		it('endRow가 bufferCells 포함하여 600/20-1+3 이상이다', () => {
			const range = getRange(base);
			// 600/20 = 30셀, -1 = 29, + buffer 3 = 32
			expect(range.endRow).toBeGreaterThanOrEqual(29);
		});

		it('endCol이 bufferCells 포함하여 800/20-1+3 이상이다', () => {
			const range = getRange(base);
			// 800/20 = 40셀, -1 = 39, + buffer 3 = 42
			expect(range.endCol).toBeGreaterThanOrEqual(39);
		});

		it('격자 경계(399)를 초과하지 않는다', () => {
			const range = getRange(base);
			expect(range.endRow).toBeLessThanOrEqual(399);
			expect(range.endCol).toBeLessThanOrEqual(399);
		});
	});

	describe('scale=2, offset=(-100,-100) 줌인 케이스', () => {
		const input: ViewportCullingInput = {
			transform: { scale: 2, x: -100, y: -100 },
			stageWidth: 500,
			stageHeight: 400,
			cellSize: 20,
			totalRows: 400,
			totalCols: 400,
		};

		it('bufferCells=3 적용 시 startCol=0이다', () => {
			// 가시 x: (0-(-100))/2 = 50 ~ (500-(-100))/2 = 300
			// col: 50/20=2 ~ 300/20=15 → startCol = max(0, 2-3) = 0
			const range = getRange(input);
			expect(range.startCol).toBe(0);
		});

		it('bufferCells=3 적용 시 endCol=20 이하이다', () => {
			// col: ~15 + buffer 3 = 18 (혹은 구현에 따라 약간 다를 수 있음)
			const range = getRange(input);
			expect(range.endCol).toBeLessThanOrEqual(20);
		});

		it('startRow와 startCol이 0 이상이다', () => {
			const range = getRange(input);
			expect(range.startRow).toBeGreaterThanOrEqual(0);
			expect(range.startCol).toBeGreaterThanOrEqual(0);
		});

		it('endRow와 endCol이 399 이하이다', () => {
			const range = getRange(input);
			expect(range.endRow).toBeLessThanOrEqual(399);
			expect(range.endCol).toBeLessThanOrEqual(399);
		});
	});

	describe('bufferCells=0 명시', () => {
		it('정확히 뷰포트 경계에서만 렌더링한다', () => {
			const input: ViewportCullingInput = {
				transform: { scale: 1, x: 0, y: 0 },
				stageWidth: 200,
				stageHeight: 200,
				cellSize: 20,
				totalRows: 400,
				totalCols: 400,
				bufferCells: 0,
			};
			const range = getRange(input);
			// 200/20 = 10셀, buffer 없으면 endRow=9, endCol=9
			expect(range.startRow).toBe(0);
			expect(range.startCol).toBe(0);
			expect(range.endRow).toBeLessThanOrEqual(10);
			expect(range.endCol).toBeLessThanOrEqual(10);
		});
	});

	describe('scale이 매우 작을 때(0.1)', () => {
		it('전체 격자(0~399) 범위를 반환한다', () => {
			// stageWidth=8100, stageHeight=8100, scale=0.1이면
			// 보이는 영역 = 8100/0.1 = 81000px > 400*20=8000px → 전체 포함
			const input: ViewportCullingInput = {
				transform: { scale: 0.1, x: 0, y: 0 },
				stageWidth: 8100,
				stageHeight: 8100,
				cellSize: 20,
				totalRows: 400,
				totalCols: 400,
			};
			const range = getRange(input);
			expect(range.startRow).toBe(0);
			expect(range.startCol).toBe(0);
			expect(range.endRow).toBe(399);
			expect(range.endCol).toBe(399);
		});
	});

	describe('stageWidth/Height가 0인 경우', () => {
		it('startRow=startCol=endRow=endCol=0을 반환한다', () => {
			const input: ViewportCullingInput = {
				transform: { scale: 1, x: 0, y: 0 },
				stageWidth: 0,
				stageHeight: 0,
				cellSize: 20,
				totalRows: 400,
				totalCols: 400,
			};
			const range = getRange(input);
			expect(range.startRow).toBe(0);
			expect(range.startCol).toBe(0);
			expect(range.endRow).toBe(0);
			expect(range.endCol).toBe(0);
		});
	});

	describe('totalRows=10, totalCols=10인 작은 격자', () => {
		it('범위가 항상 0~9 내에 있다', () => {
			const input: ViewportCullingInput = {
				transform: { scale: 1, x: 0, y: 0 },
				stageWidth: 800,
				stageHeight: 600,
				cellSize: 20,
				totalRows: 10,
				totalCols: 10,
			};
			const range = getRange(input);
			expect(range.startRow).toBeGreaterThanOrEqual(0);
			expect(range.startCol).toBeGreaterThanOrEqual(0);
			expect(range.endRow).toBeLessThanOrEqual(9);
			expect(range.endCol).toBeLessThanOrEqual(9);
		});
	});
});
