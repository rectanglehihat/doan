import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCanvasNavigation } from './useCanvasNavigation';

const stageRef = { current: null };

describe('useCanvasNavigation', () => {
	describe('fitToScreen', () => {
		it('정상 케이스: scaleY가 더 제약이 되는 경우 정확한 scale, x, y를 계산한다', () => {
			// stageWidth=800, stageHeight=600, gridWidth=300, gridHeight=400
			// scaleX = 800 * 0.9 / 300 = 2.4
			// scaleY = 600 * 0.9 / 400 = 1.35
			// newScale = min(2.4, 1.35) = 1.35 (clamp 범위 내)
			// newX = (800 - 300 * 1.35) / 2 = 197.5
			// newY = (600 - 400 * 1.35) / 2 = 30
			const { result } = renderHook(() => useCanvasNavigation(stageRef));

			act(() => {
				result.current.fitToScreen(800, 600, 300, 400);
			});

			expect(result.current.transform.scale).toBeCloseTo(1.35);
			expect(result.current.transform.x).toBeCloseTo(197.5);
			expect(result.current.transform.y).toBeCloseTo(30);
		});

		it('정사각형 그리드: 더 좁은 방향의 scale로 결정된다', () => {
			// stageWidth=600, stageHeight=800, gridWidth=400, gridHeight=400
			// scaleX = 600 * 0.9 / 400 = 1.35
			// scaleY = 800 * 0.9 / 400 = 1.8
			// newScale = min(1.35, 1.8) = 1.35 (가로가 더 제약)
			// newX = (600 - 400 * 1.35) / 2 = 30
			// newY = (800 - 400 * 1.35) / 2 = 130
			const { result } = renderHook(() => useCanvasNavigation(stageRef));

			act(() => {
				result.current.fitToScreen(600, 800, 400, 400);
			});

			expect(result.current.transform.scale).toBeCloseTo(1.35);
			expect(result.current.transform.x).toBeCloseTo(30);
			expect(result.current.transform.y).toBeCloseTo(130);
		});

		it('MAX_SCALE 경계: 그리드가 매우 작을 때 scale이 MAX_SCALE(5)을 넘지 않는다', () => {
			// stageWidth=1000, stageHeight=1000, gridWidth=10, gridHeight=10
			// scaleX = 1000 * 0.9 / 10 = 90
			// scaleY = 1000 * 0.9 / 10 = 90
			// newScale = clamp(90, 0.2, 5) = 5
			const { result } = renderHook(() => useCanvasNavigation(stageRef));

			act(() => {
				result.current.fitToScreen(1000, 1000, 10, 10);
			});

			expect(result.current.transform.scale).toBe(5);
		});

		it('MIN_SCALE 경계: 그리드가 매우 클 때 scale이 MIN_SCALE(0.2) 미만이 되지 않는다', () => {
			// stageWidth=100, stageHeight=100, gridWidth=10000, gridHeight=10000
			// scaleX = 100 * 0.9 / 10000 = 0.009
			// scaleY = 100 * 0.9 / 10000 = 0.009
			// newScale = clamp(0.009, 0.2, 5) = 0.2
			const { result } = renderHook(() => useCanvasNavigation(stageRef));

			act(() => {
				result.current.fitToScreen(100, 100, 10000, 10000);
			});

			expect(result.current.transform.scale).toBe(0.2);
		});

		it('중앙 정렬: fitToScreen 후 x, y가 중앙 정렬 수식에 맞는다', () => {
			// stageWidth=500, stageHeight=400, gridWidth=200, gridHeight=200
			// scaleX = 500 * 0.9 / 200 = 2.25
			// scaleY = 400 * 0.9 / 200 = 1.8
			// newScale = min(2.25, 1.8) = 1.8
			// newX = (500 - 200 * 1.8) / 2 = (500 - 360) / 2 = 70
			// newY = (400 - 200 * 1.8) / 2 = (400 - 360) / 2 = 20
			const stageWidth = 500;
			const stageHeight = 400;
			const gridWidth = 200;
			const gridHeight = 200;

			const { result } = renderHook(() => useCanvasNavigation(stageRef));

			act(() => {
				result.current.fitToScreen(stageWidth, stageHeight, gridWidth, gridHeight);
			});

			const { scale, x, y } = result.current.transform;
			const expectedX = (stageWidth - gridWidth * scale) / 2;
			const expectedY = (stageHeight - gridHeight * scale) / 2;

			expect(x).toBeCloseTo(expectedX);
			expect(y).toBeCloseTo(expectedY);
		});
	});
});
