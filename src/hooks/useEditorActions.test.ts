import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorActions } from './useEditorActions';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
});

describe('useEditorActions', () => {
	describe('초기 반환값', () => {
		it('canUndo는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.canUndo).toBe(false);
		});

		it('canRedo는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.canRedo).toBe(false);
		});

		it('isShapeGuideDrawMode는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.isShapeGuideDrawMode).toBe(false);
		});

		it('isShapeGuideEraseMode는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.isShapeGuideEraseMode).toBe(false);
		});

		it('isSelectionMode는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.isSelectionMode).toBe(false);
		});

		it('isResetDialogOpen는 false이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.isResetDialogOpen).toBe(false);
		});
	});

	describe('ShapeGuide Draw 모드 상호배타성', () => {
		it('onShapeGuideDrawModeChange(true) 호출 시 isShapeGuideDrawMode가 true가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			expect(result.current.isShapeGuideDrawMode).toBe(true);
		});

		it('onShapeGuideDrawModeChange(true) 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			expect(result.current.isShapeGuideEraseMode).toBe(false);
		});

		it('onShapeGuideDrawModeChange(true) 호출 시 isSelectionMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onSelectionModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			expect(result.current.isSelectionMode).toBe(false);
		});
	});

	describe('ShapeGuide Erase 모드 상호배타성', () => {
		it('onShapeGuideEraseModeChange(true) 호출 시 isShapeGuideEraseMode가 true가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			expect(result.current.isShapeGuideEraseMode).toBe(true);
		});

		it('onShapeGuideEraseModeChange(true) 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			expect(result.current.isShapeGuideDrawMode).toBe(false);
		});

		it('onShapeGuideEraseModeChange(true) 호출 시 isSelectionMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onSelectionModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			expect(result.current.isSelectionMode).toBe(false);
		});
	});

	describe('Selection 모드 상호배타성', () => {
		it('onSelectionModeChange(true) 호출 시 isSelectionMode가 true가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onSelectionModeChange(true);
			});
			expect(result.current.isSelectionMode).toBe(true);
		});

		it('onSelectionModeChange(true) 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			act(() => {
				result.current.onSelectionModeChange(true);
			});
			expect(result.current.isShapeGuideDrawMode).toBe(false);
		});

		it('onSelectionModeChange(true) 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			act(() => {
				result.current.onSelectionModeChange(true);
			});
			expect(result.current.isShapeGuideEraseMode).toBe(false);
		});
	});

	describe('onShapeGuideClear', () => {
		it('onShapeGuideClear 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideDrawModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideClear();
			});
			expect(result.current.isShapeGuideDrawMode).toBe(false);
		});

		it('onShapeGuideClear 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideEraseModeChange(true);
			});
			act(() => {
				result.current.onShapeGuideClear();
			});
			expect(result.current.isShapeGuideEraseMode).toBe(false);
		});

		it('onShapeGuideClear 호출 시 스토어의 shapeGuide가 null이 된다', () => {
			act(() => {
				useUIStore.getState().addShapeGuideStroke([0, 0, 1, 1]);
			});
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onShapeGuideClear();
			});
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});
	});

	describe('onResetConfirm', () => {
		it('onResetConfirm 호출 시 chartStore의 셀 데이터가 초기화된다', () => {
			act(() => {
				useChartStore.getState().setCellSymbol(0, 0, 'k');
			});
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onResetConfirm();
			});
			expect(useChartStore.getState().cells[0][0].symbolId).toBeNull();
		});

		it('onResetConfirm 호출 시 uiStore의 선택 상태가 초기화된다', () => {
			act(() => {
				useUIStore.getState().setShapeGuideDrawMode(true);
			});
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onResetConfirm();
			});
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('onResetConfirm 호출 시 isResetDialogOpen이 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onReset();
			});
			expect(result.current.isResetDialogOpen).toBe(true);
			act(() => {
				result.current.onResetConfirm();
			});
			expect(result.current.isResetDialogOpen).toBe(false);
		});
	});

	describe('리셋 다이얼로그', () => {
		it('onReset 호출 시 isResetDialogOpen이 true가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onReset();
			});
			expect(result.current.isResetDialogOpen).toBe(true);
		});

		it('onResetCancel 호출 시 isResetDialogOpen이 false가 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onReset();
			});
			act(() => {
				result.current.onResetCancel();
			});
			expect(result.current.isResetDialogOpen).toBe(false);
		});
	});

	describe('색상 변경 + recentColors', () => {
		it('onColorChange("#ff0000") 호출 시 selectedColor가 "#ff0000"이 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			expect(result.current.selectedColor).toBe('#ff0000');
		});

		it('onColorChange("#ff0000") 호출 시 recentColors에 추가된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			expect(result.current.recentColors).toContain('#ff0000');
		});

		it('동일한 색상을 여러 번 추가해도 recentColors에 중복 없이 유지된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			const count = result.current.recentColors.filter((c) => c === '#ff0000').length;
			expect(count).toBe(1);
		});

		it('여러 색상을 순서대로 추가하면 가장 최근 색상이 앞에 위치한다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			act(() => {
				result.current.onColorChange('#00ff00');
			});
			expect(result.current.recentColors[0]).toBe('#00ff00');
		});
	});

	describe('onColorChange(null)', () => {
		it('null 전달 시 selectedColor가 null이 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			act(() => {
				result.current.onColorChange(null);
			});
			expect(result.current.selectedColor).toBeNull();
		});

		it('null 전달 시 recentColors에 추가되지 않는다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange(null);
			});
			expect(result.current.recentColors).toHaveLength(0);
		});

		it('기존에 추가된 색상은 null 전달 후에도 recentColors에 유지된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			act(() => {
				result.current.onColorChange(null);
			});
			expect(result.current.recentColors).toContain('#ff0000');
		});
	});

	describe('onColorClear', () => {
		it('onColorClear 호출 시 selectedColor가 null이 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onColorChange('#ff0000');
			});
			act(() => {
				result.current.onColorClear();
			});
			expect(result.current.selectedColor).toBeNull();
		});
	});

	describe('rotationalMode', () => {
		it('초기 rotationalMode는 "none"이다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(result.current.rotationalMode).toBe('none');
		});

		it('onRotationalModeChange("horizontal") 호출 시 rotationalMode가 "horizontal"이 된다', () => {
			const { result } = renderHook(() => useEditorActions());
			act(() => {
				result.current.onRotationalModeChange('horizontal');
			});
			expect(result.current.rotationalMode).toBe('horizontal');
		});
	});

	describe('history — beginBatch / endBatch 위임', () => {
		it('beginBatch와 endBatch가 함수로 반환된다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(typeof result.current.beginBatch).toBe('function');
			expect(typeof result.current.endBatch).toBe('function');
		});
	});

	describe('onFitToScreen', () => {
		it('onFitToScreen이 함수로 반환된다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(typeof result.current.onFitToScreen).toBe('function');
		});

		it('onFitToScreen 호출 시 오류가 발생하지 않는다', () => {
			const { result } = renderHook(() => useEditorActions());
			expect(() => {
				act(() => {
					result.current.onFitToScreen();
				});
			}).not.toThrow();
		});
	});
});
