import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';
import { KnittingSymbol, ShapeGuide, CellSelection } from '@/types/knitting';

const mockShapeGuide: ShapeGuide = {
	strokes: [[0, 0, 10, 5, 20, 10]],
};

const mockSymbol: KnittingSymbol = {
	id: 'k',
	abbr: 'k',
	name: '겉뜨기',
	category: 'basic-stitch',
	patternType: 'knitting',
};

beforeEach(() => {
	useUIStore.getState().reset();
});

describe('useUIStore', () => {
	describe('초기 상태', () => {
		it('selectedSymbol은 null이다', () => {
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});

		it('isLoadDialogOpen은 false이다', () => {
			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});
	});

	describe('setSelectedSymbol', () => {
		it('selectedSymbol을 설정한다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().selectedSymbol).toEqual(mockSymbol);
		});

		it('null로 설정하면 선택이 해제된다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().setSelectedSymbol(null);
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});
	});

	describe('openLoadDialog / closeLoadDialog', () => {
		it('openLoadDialog 호출 시 isLoadDialogOpen이 true가 된다', () => {
			useUIStore.getState().openLoadDialog();
			expect(useUIStore.getState().isLoadDialogOpen).toBe(true);
		});

		it('closeLoadDialog 호출 시 isLoadDialogOpen이 false가 된다', () => {
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().closeLoadDialog();
			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});
	});


	describe('shapeGuide', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('setShapeGuide 호출 시 shapeGuide가 설정된다', () => {
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			expect(useUIStore.getState().shapeGuide).toEqual(mockShapeGuide);
		});

		it('setShapeGuide(null) 호출 시 shapeGuide가 null이 된다', () => {
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			useUIStore.getState().setShapeGuide(null);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('addShapeGuideStroke 호출 시 stroke가 추가된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(2);
		});

		it('removeShapeGuideStroke 호출 시 해당 인덱스 stroke가 제거된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			useUIStore.getState().removeShapeGuideStroke(0);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([10, 10, 20, 20]);
		});

		it('removeShapeGuideStroke 호출 후 shapeGuide가 null이면 그대로 null이다', () => {
			useUIStore.getState().removeShapeGuideStroke(0);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('replaceShapeGuideStroke 호출 시 지정 인덱스 스트로크를 여러 스트로크로 교체한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 10, 10]);
			useUIStore.getState().replaceShapeGuideStroke(0, [[0, 0, 4, 4], [6, 6, 10, 10]]);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(2);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([0, 0, 4, 4]);
			expect(useUIStore.getState().shapeGuide?.strokes[1]).toEqual([6, 6, 10, 10]);
		});

		it('replaceShapeGuideStroke에 빈 배열 전달 시 해당 스트로크가 삭제된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 20, 20]);
			useUIStore.getState().replaceShapeGuideStroke(0, []);
			expect(useUIStore.getState().shapeGuide?.strokes).toHaveLength(1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([10, 10, 20, 20]);
		});

		it('replaceShapeGuideStroke에 단일 배열 전달 시 해당 스트로크를 교체한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 5, 5]);
			useUIStore.getState().replaceShapeGuideStroke(0, [[1, 1, 4, 4]]);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([1, 1, 4, 4]);
		});

		it('replaceShapeGuideStroke 호출 시 shapeGuide가 null이면 아무것도 하지 않는다', () => {
			useUIStore.getState().replaceShapeGuideStroke(0, [[0, 0, 5, 5]]);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});
	});

	describe('shiftShapeGuide', () => {
		it('shapeGuide가 null이면 아무것도 하지 않는다', () => {
			useUIStore.getState().shiftShapeGuide(1, 0);
			expect(useUIStore.getState().shapeGuide).toBeNull();
		});

		it('colOffset=1, rowOffset=0이면 각 stroke의 col 좌표(짝수 인덱스)가 1씩 증가한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 10, 5, 20, 10]);
			useUIStore.getState().shiftShapeGuide(1, 0);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([1, 0, 11, 5, 21, 10]);
		});

		it('colOffset=0, rowOffset=1이면 각 stroke의 row 좌표(홀수 인덱스)가 1씩 증가한다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 10, 5, 20, 10]);
			useUIStore.getState().shiftShapeGuide(0, 1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([0, 1, 10, 6, 20, 11]);
		});

		it('음수 offset도 올바르게 동작한다 (감소)', () => {
			useUIStore.getState().addShapeGuideStroke([4, 6, 8, 10]);
			useUIStore.getState().shiftShapeGuide(-2, -3);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([2, 3, 6, 7]);
		});

		it('여러 stroke가 있을 때 모두 이동된다', () => {
			useUIStore.getState().addShapeGuideStroke([0, 0, 2, 2]);
			useUIStore.getState().addShapeGuideStroke([10, 10, 12, 12]);
			useUIStore.getState().shiftShapeGuide(1, 1);
			expect(useUIStore.getState().shapeGuide?.strokes[0]).toEqual([1, 1, 3, 3]);
			expect(useUIStore.getState().shapeGuide?.strokes[1]).toEqual([11, 11, 13, 13]);
		});
	});

	describe('isShapeGuideDrawMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('setShapeGuideDrawMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(true);
		});

		it('setShapeGuideDrawMode(true) 호출 시 selectedColor가 null이 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().selectedColor).toBeNull();
		});

		it('setShapeGuideDrawMode(true) 호출 시 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setShapeGuideDrawMode(false) 호출 시 색상 상태에 영향을 주지 않는다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideDrawMode(false);
			expect(useUIStore.getState().selectedColor).toBe('#FF0000');
			expect(useUIStore.getState().isColorMode).toBe(true);
		});

		it('setShapeGuideDrawMode(true) 호출 시 isAnnotationMode가 false가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setShapeGuideDrawMode(true) 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().setShapeGuideDrawMode(true);
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});
	});

	describe('isShapeGuideEraseMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setShapeGuideEraseMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(true);
		});

		it('setShapeGuideEraseMode(false) 호출 시 false가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setShapeGuideEraseMode(false);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setShapeGuideEraseMode(true) 호출 시 selectedColor가 null이 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().selectedColor).toBeNull();
		});

		it('setShapeGuideEraseMode(true) 호출 시 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setShapeGuideEraseMode(false) 호출 시 색상 상태에 영향을 주지 않는다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setShapeGuideEraseMode(false);
			expect(useUIStore.getState().selectedColor).toBe('#FF0000');
			expect(useUIStore.getState().isColorMode).toBe(true);
		});

		it('setShapeGuideEraseMode(true) 호출 시 isAnnotationMode가 false가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setShapeGuideEraseMode(true) 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().setShapeGuideEraseMode(true);
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});
	});

	describe('cellSelection', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().cellSelection).toBeNull();
		});

		it('setCellSelection 호출 시 cellSelection이 설정된다', () => {
			const sel: CellSelection = { startRow: 0, startCol: 0, endRow: 2, endCol: 3 };
			useUIStore.getState().setCellSelection(sel);
			expect(useUIStore.getState().cellSelection).toEqual(sel);
		});

		it('setCellSelection(null) 호출 시 null이 된다', () => {
			useUIStore.getState().setCellSelection({ startRow: 0, startCol: 0, endRow: 2, endCol: 3 });
			useUIStore.getState().setCellSelection(null);
			expect(useUIStore.getState().cellSelection).toBeNull();
		});
	});

	describe('clipboard', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().clipboard).toBeNull();
		});

		it('setClipboard 호출 시 clipboard가 설정된다', () => {
			const cells = [[{ symbolId: 'k' }, { symbolId: null }]];
			useUIStore.getState().setClipboard(cells);
			expect(useUIStore.getState().clipboard).toEqual(cells);
		});

		it('setClipboard(null) 호출 시 null이 된다', () => {
			useUIStore.getState().setClipboard([[{ symbolId: 'k' }]]);
			useUIStore.getState().setClipboard(null);
			expect(useUIStore.getState().clipboard).toBeNull();
		});
	});

	describe('isSelectionMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setSelectionMode(true) 호출 시 true가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().isSelectionMode).toBe(true);
		});

		it('setSelectionMode(false) 호출 시 false가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setSelectionMode(false);
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setSelectionMode(true) 호출 시 isAnnotationMode가 false가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setSelectionMode(true) 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('setSelectionMode(true) 호출 시 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setSelectionMode(true) 호출 시 selectedColor가 null이 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setSelectionMode(true);
			expect(useUIStore.getState().selectedColor).toBeNull();
		});
	});

	describe('툴바 모드와 기호 선택 상호 배타성', () => {
		it('setSelectedSymbol(symbol) 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 isSelectionMode가 false가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 cellSelection이 null이 된다', () => {
			useUIStore.getState().setCellSelection({ startRow: 0, startCol: 0, endRow: 2, endCol: 3 });
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().cellSelection).toBeNull();
		});

		it('setSelectedSymbol(symbol) 호출 시 isAnnotationMode가 false가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setSelectedSymbol(symbol) 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('setSelectedSymbol(symbol) 호출 시 selectedColor가 null이 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().selectedColor).toBeNull();
		});

		it('setSelectedSymbol(symbol) 호출 시 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setSelectedSymbol(null) 호출 시 모드 상태에 영향을 주지 않는다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setSelectedSymbol(null);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(true);
		});
	});

	describe('selectedColor / isColorMode', () => {
		it('초기 selectedColor는 null이다', () => {
			expect(useUIStore.getState().selectedColor).toBeNull();
		});

		it('초기 isColorMode는 false이다', () => {
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setSelectedColor("#FF0000") 호출 시 selectedColor가 "#FF0000"이고 isColorMode가 true가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().selectedColor).toBe('#FF0000');
			expect(useUIStore.getState().isColorMode).toBe(true);
		});

		it('setSelectedColor(null) 호출 시 selectedColor가 null이고 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setSelectedColor(null);
			expect(useUIStore.getState().selectedColor).toBeNull();
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('색상 선택 시 selectedSymbol이 null로 해제된다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});

		it('색상 선택 시 isShapeGuideDrawMode가 false로 해제된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('색상 선택 시 isShapeGuideEraseMode가 false로 해제된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('색상 선택 시 isSelectionMode가 false로 해제된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('색상 선택 시 isAnnotationMode가 false로 해제된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('색상 선택 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().setSelectedColor('#FF0000');
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('reset() 후 selectedColor는 null이고 isColorMode는 false이다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().reset();
			expect(useUIStore.getState().selectedColor).toBeNull();
			expect(useUIStore.getState().isColorMode).toBe(false);
		});
	});

	describe('rotationalMode', () => {
		it('초기값은 none이다', () => {
			expect(useUIStore.getState().rotationalMode).toBe('none');
		});

		it('setRotationalMode("horizontal") 호출 시 horizontal이 된다', () => {
			useUIStore.getState().setRotationalMode('horizontal');
			expect(useUIStore.getState().rotationalMode).toBe('horizontal');
		});

		it('setRotationalMode("vertical") 호출 시 vertical이 된다', () => {
			useUIStore.getState().setRotationalMode('vertical');
			expect(useUIStore.getState().rotationalMode).toBe('vertical');
		});

		it('setRotationalMode("both") 호출 시 both가 된다', () => {
			useUIStore.getState().setRotationalMode('both');
			expect(useUIStore.getState().rotationalMode).toBe('both');
		});

		it('setRotationalMode("none") 호출 시 none으로 되돌아온다', () => {
			useUIStore.getState().setRotationalMode('horizontal');
			useUIStore.getState().setRotationalMode('none');
			expect(useUIStore.getState().rotationalMode).toBe('none');
		});
	});

	describe('triggerHistoryClear', () => {
		it('초기 historyResetToken은 0이다', () => {
			expect(useUIStore.getState().historyResetToken).toBe(0);
		});

		it('triggerHistoryClear 호출 시 historyResetToken이 1 증가한다', () => {
			useUIStore.getState().triggerHistoryClear();
			expect(useUIStore.getState().historyResetToken).toBe(1);
		});

		it('triggerHistoryClear를 여러 번 호출하면 호출 수만큼 증가한다', () => {
			useUIStore.getState().triggerHistoryClear();
			useUIStore.getState().triggerHistoryClear();
			useUIStore.getState().triggerHistoryClear();
			expect(useUIStore.getState().historyResetToken).toBe(3);
		});
	});

	describe('recentColors / addRecentColor', () => {
		it('초기 recentColors는 []이다', () => {
			expect(useUIStore.getState().recentColors).toEqual([]);
		});

		it('addRecentColor("#ff0000") 호출 시 recentColors에 ["#ff0000"]이 된다', () => {
			useUIStore.getState().addRecentColor('#ff0000');
			expect(useUIStore.getState().recentColors).toEqual(['#ff0000']);
		});

		it('여러 색상 추가 시 최신 색상이 맨 앞에 위치한다', () => {
			useUIStore.getState().addRecentColor('#ff0000');
			useUIStore.getState().addRecentColor('#00ff00');
			useUIStore.getState().addRecentColor('#0000ff');
			expect(useUIStore.getState().recentColors[0]).toBe('#0000ff');
			expect(useUIStore.getState().recentColors[1]).toBe('#00ff00');
			expect(useUIStore.getState().recentColors[2]).toBe('#ff0000');
		});

		it('중복 색상 추가 시 기존 항목을 제거하고 맨 앞으로 이동한다 (배열 길이 유지)', () => {
			useUIStore.getState().addRecentColor('#ff0000');
			useUIStore.getState().addRecentColor('#00ff00');
			useUIStore.getState().addRecentColor('#ff0000');
			const colors = useUIStore.getState().recentColors;
			expect(colors[0]).toBe('#ff0000');
			expect(colors).toHaveLength(2);
		});

		it('6개 초과 추가 시 7번째부터 잘린다 (최대 6개)', () => {
			useUIStore.getState().addRecentColor('#111111');
			useUIStore.getState().addRecentColor('#222222');
			useUIStore.getState().addRecentColor('#333333');
			useUIStore.getState().addRecentColor('#444444');
			useUIStore.getState().addRecentColor('#555555');
			useUIStore.getState().addRecentColor('#666666');
			useUIStore.getState().addRecentColor('#777777');
			expect(useUIStore.getState().recentColors).toHaveLength(6);
		});

		it('reset() 후 recentColors는 []이다', () => {
			useUIStore.getState().addRecentColor('#ff0000');
			useUIStore.getState().reset();
			expect(useUIStore.getState().recentColors).toEqual([]);
		});
	});

	describe('reset', () => {
		it('모든 상태를 초기값으로 되돌린다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().openLoadDialog();
			useUIStore.getState().setShapeGuide(mockShapeGuide);
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setCellSelection({ startRow: 1, startCol: 1, endRow: 3, endCol: 3 });
			useUIStore.getState().setClipboard([[{ symbolId: 'k' }]]);
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setRotationalMode('both');
			useUIStore.getState().setSymmetryMode('horizontal');
			useUIStore.getState().reset();

			const { selectedSymbol, isLoadDialogOpen, shapeGuide, isShapeGuideDrawMode, isShapeGuideEraseMode, cellSelection, clipboard, isSelectionMode, rotationalMode, symmetryMode } =
				useUIStore.getState();
			expect(selectedSymbol).toBeNull();
			expect(isLoadDialogOpen).toBe(false);
			expect(shapeGuide).toBeNull();
			expect(isShapeGuideDrawMode).toBe(false);
			expect(isShapeGuideEraseMode).toBe(false);
			expect(cellSelection).toBeNull();
			expect(clipboard).toBeNull();
			expect(isSelectionMode).toBe(false);
			expect(rotationalMode).toBe('none');
			expect(symmetryMode).toBe('none');
		});
	});

	describe('isAnnotationMode', () => {
		it('초기값은 false이다', () => {
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setAnnotationMode(true) 호출 시 isAnnotationMode가 true가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().isAnnotationMode).toBe(true);
		});

		it('setAnnotationMode(true) 호출 시 isShapeGuideDrawMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideDrawMode(true);
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().isShapeGuideDrawMode).toBe(false);
		});

		it('setAnnotationMode(true) 호출 시 isShapeGuideEraseMode가 false가 된다', () => {
			useUIStore.getState().setShapeGuideEraseMode(true);
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().isShapeGuideEraseMode).toBe(false);
		});

		it('setAnnotationMode(true) 호출 시 isSelectionMode가 false가 된다', () => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().isSelectionMode).toBe(false);
		});

		it('setAnnotationMode(true) 호출 시 cellSelection이 null이 된다', () => {
			useUIStore.getState().setCellSelection({ startRow: 0, startCol: 0, endRow: 2, endCol: 2 });
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().cellSelection).toBeNull();
		});

		it('setAnnotationMode(true) 호출 시 selectedSymbol이 null이 된다', () => {
			useUIStore.getState().setSelectedSymbol(mockSymbol);
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().selectedSymbol).toBeNull();
		});

		it('setAnnotationMode(true) 호출 시 isColorMode가 false가 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().isColorMode).toBe(false);
		});

		it('setAnnotationMode(true) 호출 시 selectedColor가 null이 된다', () => {
			useUIStore.getState().setSelectedColor('#FF0000');
			useUIStore.getState().setAnnotationMode(true);
			expect(useUIStore.getState().selectedColor).toBeNull();
		});

		it('setAnnotationMode(false) 호출 시 isAnnotationMode가 false가 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().setAnnotationMode(false);
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});

		it('setAnnotationMode(false) 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 10, anchorY: 20, side: 'right', existingId: null });
			useUIStore.getState().setAnnotationMode(false);
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('reset() 후 isAnnotationMode가 false이다', () => {
			useUIStore.getState().setAnnotationMode(true);
			useUIStore.getState().reset();
			expect(useUIStore.getState().isAnnotationMode).toBe(false);
		});
	});

	describe('rangeAnnotationPopover', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().rangeAnnotationPopover).toBeNull();
		});

		it('openRangeAnnotationPopover 호출 시 rangeAnnotationPopover가 설정된다', () => {
			const state = {
				startRowIndex: 2,
				endRowIndex: 6,
				anchorX: 150,
				anchorY: 80,
				existingId: null,
			};
			useUIStore.getState().openRangeAnnotationPopover(state);
			expect(useUIStore.getState().rangeAnnotationPopover).toEqual(state);
		});

		it('openRangeAnnotationPopover에 existingId가 있을 때 저장된다', () => {
			const state = {
				startRowIndex: 1,
				endRowIndex: 5,
				anchorX: 100,
				anchorY: 60,
				existingId: 'range-abc',
			};
			useUIStore.getState().openRangeAnnotationPopover(state);
			expect(useUIStore.getState().rangeAnnotationPopover?.existingId).toBe('range-abc');
		});

		it('closeRangeAnnotationPopover 호출 시 rangeAnnotationPopover가 null이 된다', () => {
			useUIStore.getState().openRangeAnnotationPopover({
				startRowIndex: 0,
				endRowIndex: 3,
				anchorX: 0,
				anchorY: 0,
				existingId: null,
			});
			useUIStore.getState().closeRangeAnnotationPopover();
			expect(useUIStore.getState().rangeAnnotationPopover).toBeNull();
		});

		it('openRangeAnnotationPopover 호출 시 기존 annotationPopover도 닫힌다 (배타적)', () => {
			useUIStore.getState().openAnnotationPopover({
				rowIndex: 0,
				anchorX: 0,
				anchorY: 0,
				side: 'right',
				existingId: null,
			});
			useUIStore.getState().openRangeAnnotationPopover({
				startRowIndex: 2,
				endRowIndex: 5,
				anchorX: 100,
				anchorY: 60,
				existingId: null,
			});
			expect(useUIStore.getState().annotationPopover).toBeNull();
			expect(useUIStore.getState().rangeAnnotationPopover).not.toBeNull();
		});

		it('openAnnotationPopover 호출 시 기존 rangeAnnotationPopover도 닫힌다 (배타적)', () => {
			useUIStore.getState().openRangeAnnotationPopover({
				startRowIndex: 2,
				endRowIndex: 5,
				anchorX: 100,
				anchorY: 60,
				existingId: null,
			});
			useUIStore.getState().openAnnotationPopover({
				rowIndex: 0,
				anchorX: 0,
				anchorY: 0,
				side: 'right',
				existingId: null,
			});
			expect(useUIStore.getState().rangeAnnotationPopover).toBeNull();
			expect(useUIStore.getState().annotationPopover).not.toBeNull();
		});

		it('reset() 후 rangeAnnotationPopover가 null이다', () => {
			useUIStore.getState().openRangeAnnotationPopover({
				startRowIndex: 1,
				endRowIndex: 4,
				anchorX: 10,
				anchorY: 20,
				existingId: null,
			});
			useUIStore.getState().reset();
			expect(useUIStore.getState().rangeAnnotationPopover).toBeNull();
		});
	});

	describe('rangeAnnotationDraft', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});

		it('setRangeAnnotationDraft 호출 시 draft 상태가 설정된다', () => {
			const draft = { startRow: 3, endRow: 7 };
			useUIStore.getState().setRangeAnnotationDraft(draft);
			expect(useUIStore.getState().rangeAnnotationDraft).toEqual(draft);
		});

		it('setRangeAnnotationDraft(null) 호출 시 null이 된다', () => {
			useUIStore.getState().setRangeAnnotationDraft({ startRow: 0, endRow: 5 });
			useUIStore.getState().setRangeAnnotationDraft(null);
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});

		it('reset() 후 rangeAnnotationDraft가 null이다', () => {
			useUIStore.getState().setRangeAnnotationDraft({ startRow: 1, endRow: 3 });
			useUIStore.getState().reset();
			expect(useUIStore.getState().rangeAnnotationDraft).toBeNull();
		});
	});

	describe('annotationPopover', () => {
		it('초기값은 null이다', () => {
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('openAnnotationPopover 호출 시 annotationPopover가 설정된다', () => {
			const state = { rowIndex: 3, anchorX: 100, anchorY: 60, side: 'right' as const, existingId: null };
			useUIStore.getState().openAnnotationPopover(state);
			expect(useUIStore.getState().annotationPopover).toEqual(state);
		});

		it('openAnnotationPopover에 existingId가 있을 때 저장된다', () => {
			const state = { rowIndex: 2, anchorX: 50, anchorY: 40, side: 'right' as const, existingId: 'abc-123' };
			useUIStore.getState().openAnnotationPopover(state);
			expect(useUIStore.getState().annotationPopover?.existingId).toBe('abc-123');
		});

		it('closeAnnotationPopover 호출 시 annotationPopover가 null이 된다', () => {
			useUIStore.getState().openAnnotationPopover({ rowIndex: 0, anchorX: 0, anchorY: 0, side: 'right', existingId: null });
			useUIStore.getState().closeAnnotationPopover();
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});

		it('reset() 후 annotationPopover가 null이다', () => {
			useUIStore.getState().openAnnotationPopover({ rowIndex: 1, anchorX: 10, anchorY: 20, side: 'right', existingId: null });
			useUIStore.getState().reset();
			expect(useUIStore.getState().annotationPopover).toBeNull();
		});
	});
});
