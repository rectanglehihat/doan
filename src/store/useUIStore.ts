import { create } from 'zustand';
import { KnittingSymbol, ShapeGuide, SymmetryMode, RotationalMode, CellSelection, ChartCell } from '@/types/knitting';

const COLOR_MODE_RESET = { selectedColor: null, isColorMode: false };

interface UIState {
	selectedSymbol: KnittingSymbol | null;
	selectedColor: string | null;
	isColorMode: boolean;
	symmetryMode: SymmetryMode;
	isLoadDialogOpen: boolean;
	isResetDialogOpen: boolean;
	currentPatternId: string | null;
	setCurrentPatternId: (id: string | null) => void;
	historyResetToken: number;
	triggerHistoryClear: () => void;
	shapeGuide: ShapeGuide | null;
	isShapeGuideDrawMode: boolean;
	isShapeGuideEraseMode: boolean;
	rotationalMode: RotationalMode;
	setSelectedSymbol: (symbol: KnittingSymbol | null) => void;
	setSelectedColor: (color: string | null) => void;
	setSymmetryMode: (mode: SymmetryMode) => void;
	setRotationalMode: (mode: RotationalMode) => void;
	openLoadDialog: () => void;
	closeLoadDialog: () => void;
	openResetDialog: () => void;
	closeResetDialog: () => void;
	setShapeGuide: (guide: ShapeGuide | null) => void;
	addShapeGuideStroke: (stroke: number[]) => void;
	removeShapeGuideStroke: (index: number) => void;
	replaceShapeGuideStroke: (index: number, newStrokes: number[][]) => void;
	shiftShapeGuide: (colOffset: number, rowOffset: number) => void;
	setShapeGuideDrawMode: (active: boolean) => void;
	setShapeGuideEraseMode: (active: boolean) => void;
	cellSelection: CellSelection | null;
	clipboard: ChartCell[][] | null;
	isSelectionMode: boolean;
	recentColors: string[];
	isAnnotationMode: boolean;
	annotationPopover: {
		rowIndex: number;
		anchorX: number;
		anchorY: number;
		side: 'right' | 'left';
		existingId: string | null;
	} | null;
	rangeAnnotationPopover: {
		startRowIndex: number;
		endRowIndex: number;
		anchorX: number;
		anchorY: number;
		existingId: string | null;
	} | null;
	rangeAnnotationDraft: { startRow: number; endRow: number } | null;
	setCellSelection: (sel: CellSelection | null) => void;
	setClipboard: (cells: ChartCell[][] | null) => void;
	setSelectionMode: (active: boolean) => void;
	addRecentColor: (color: string) => void;
	setAnnotationMode: (active: boolean) => void;
	openAnnotationPopover: (state: {
		rowIndex: number;
		anchorX: number;
		anchorY: number;
		side: 'right' | 'left';
		existingId: string | null;
	}) => void;
	closeAnnotationPopover: () => void;
	openRangeAnnotationPopover: (state: {
		startRowIndex: number;
		endRowIndex: number;
		anchorX: number;
		anchorY: number;
		existingId: string | null;
	}) => void;
	closeRangeAnnotationPopover: () => void;
	setRangeAnnotationDraft: (draft: { startRow: number; endRow: number } | null) => void;
	reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	selectedSymbol: null,
	selectedColor: null,
	isColorMode: false,
	symmetryMode: 'none',
	isLoadDialogOpen: false,
	isResetDialogOpen: false,
	currentPatternId: null,
	setCurrentPatternId: (id) => set({ currentPatternId: id }),
	historyResetToken: 0,
	triggerHistoryClear: () => set((state) => ({ historyResetToken: state.historyResetToken + 1 })),
	shapeGuide: null,
	isShapeGuideDrawMode: false,
	isShapeGuideEraseMode: false,
	rotationalMode: 'none',
	cellSelection: null,
	clipboard: null,
	isSelectionMode: false,
	recentColors: [],
	isAnnotationMode: false,
	annotationPopover: null,
	rangeAnnotationPopover: null,
	rangeAnnotationDraft: null,

	setSelectedSymbol: (symbol) =>
		set(
			symbol !== null
				? { selectedSymbol: symbol, isShapeGuideDrawMode: false, isShapeGuideEraseMode: false, isSelectionMode: false, cellSelection: null, isAnnotationMode: false, annotationPopover: null }
				: { selectedSymbol: null },
		),
	setSelectedColor: (color) =>
		set(
			color !== null
				? { selectedColor: color, isColorMode: true, selectedSymbol: null, isShapeGuideDrawMode: false, isShapeGuideEraseMode: false, isSelectionMode: false, isAnnotationMode: false, annotationPopover: null }
				: { selectedColor: null, isColorMode: false },
		),
	setSymmetryMode: (mode) => set({ symmetryMode: mode }),
	openLoadDialog: () => set({ isLoadDialogOpen: true }),
	closeLoadDialog: () => set({ isLoadDialogOpen: false }),
	openResetDialog: () => set({ isResetDialogOpen: true }),
	closeResetDialog: () => set({ isResetDialogOpen: false }),
	setShapeGuide: (guide) => set({ shapeGuide: guide }),
	addShapeGuideStroke: (stroke) =>
		set((state) => ({
			shapeGuide: {
				strokes: [...(state.shapeGuide?.strokes ?? []), stroke],
			},
		})),
	removeShapeGuideStroke: (index) =>
		set((state) => ({
			shapeGuide: state.shapeGuide
				? { strokes: state.shapeGuide.strokes.filter((_, i) => i !== index) }
				: null,
		})),
	replaceShapeGuideStroke: (index, newStrokes) =>
		set((state) => {
			if (!state.shapeGuide) return state;
			const strokes = [...state.shapeGuide.strokes];
			strokes.splice(index, 1, ...newStrokes);
			return { shapeGuide: { strokes } };
		}),
	shiftShapeGuide: (colOffset, rowOffset) =>
		set((state) => {
			if (!state.shapeGuide) return state;
			return {
				shapeGuide: {
					strokes: state.shapeGuide.strokes.map((stroke) =>
						stroke.map((v, i) => v + (i % 2 === 0 ? colOffset : rowOffset)),
					),
				},
			};
		}),
	setShapeGuideDrawMode: (active) =>
		set(active ? { isShapeGuideDrawMode: true, isAnnotationMode: false, annotationPopover: null, ...COLOR_MODE_RESET } : { isShapeGuideDrawMode: false }),
	setShapeGuideEraseMode: (active) =>
		set(active ? { isShapeGuideEraseMode: true, isAnnotationMode: false, annotationPopover: null, ...COLOR_MODE_RESET } : { isShapeGuideEraseMode: false }),
	setRotationalMode: (mode) => set({ rotationalMode: mode }),
	setCellSelection: (sel) => set({ cellSelection: sel }),
	setClipboard: (cells) => set({ clipboard: cells }),
	setSelectionMode: (active) =>
		set(active ? { isSelectionMode: true, isAnnotationMode: false, annotationPopover: null, ...COLOR_MODE_RESET } : { isSelectionMode: false }),
	addRecentColor: (color) =>
		set((state) => ({
			recentColors: [color, ...state.recentColors.filter((c) => c !== color)].slice(0, 6),
		})),

	setAnnotationMode: (active) =>
		set(
			active
				? {
						isAnnotationMode: true,
						isShapeGuideDrawMode: false,
						isShapeGuideEraseMode: false,
						isSelectionMode: false,
						cellSelection: null,
						selectedSymbol: null,
						isColorMode: false,
						selectedColor: null,
					}
				: { isAnnotationMode: false, annotationPopover: null },
		),

	openAnnotationPopover: (popoverState) => set({ annotationPopover: popoverState, rangeAnnotationPopover: null }),

	closeAnnotationPopover: () => set({ annotationPopover: null }),

	openRangeAnnotationPopover: (popoverState) => set({ rangeAnnotationPopover: popoverState, annotationPopover: null }),

	closeRangeAnnotationPopover: () => set({ rangeAnnotationPopover: null }),

	setRangeAnnotationDraft: (draft) => set({ rangeAnnotationDraft: draft }),

	reset: () =>
		set({
			selectedSymbol: null,
			selectedColor: null,
			isColorMode: false,
			symmetryMode: 'none',
			isLoadDialogOpen: false,
			isResetDialogOpen: false,
			currentPatternId: null,
			shapeGuide: null,
			isShapeGuideDrawMode: false,
			isShapeGuideEraseMode: false,
			cellSelection: null,
			clipboard: null,
			isSelectionMode: false,
			rotationalMode: 'none',
			historyResetToken: 0,
			recentColors: [],
			isAnnotationMode: false,
			annotationPopover: null,
			rangeAnnotationPopover: null,
			rangeAnnotationDraft: null,
		}),
}));
