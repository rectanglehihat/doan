import { create } from 'zustand';
import { KnittingSymbol, ShapeGuide, SymmetryMode } from '@/types/knitting';

interface UIState {
	selectedSymbol: KnittingSymbol | null;
	symmetryMode: SymmetryMode;
	isSaveDialogOpen: boolean;
	isLoadDialogOpen: boolean;
	isResetDialogOpen: boolean;
	shapeGuide: ShapeGuide | null;
	isShapeGuideDrawMode: boolean;
	setSelectedSymbol: (symbol: KnittingSymbol | null) => void;
	setSymmetryMode: (mode: SymmetryMode) => void;
	openSaveDialog: () => void;
	closeSaveDialog: () => void;
	openLoadDialog: () => void;
	closeLoadDialog: () => void;
	openResetDialog: () => void;
	closeResetDialog: () => void;
	setShapeGuide: (guide: ShapeGuide | null) => void;
	addShapeGuideStroke: (stroke: number[]) => void;
	removeShapeGuideStroke: (index: number) => void;
	setShapeGuideDrawMode: (active: boolean) => void;
	reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	selectedSymbol: null,
	symmetryMode: 'none',
	isSaveDialogOpen: false,
	isLoadDialogOpen: false,
	isResetDialogOpen: false,
	shapeGuide: null,
	isShapeGuideDrawMode: false,

	setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
	setSymmetryMode: (mode) => set({ symmetryMode: mode }),
	openSaveDialog: () => set({ isSaveDialogOpen: true }),
	closeSaveDialog: () => set({ isSaveDialogOpen: false }),
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
	setShapeGuideDrawMode: (active) => set({ isShapeGuideDrawMode: active }),

	reset: () =>
		set({
			selectedSymbol: null,
			symmetryMode: 'none',
			isSaveDialogOpen: false,
			isLoadDialogOpen: false,
			isResetDialogOpen: false,
			shapeGuide: null,
			isShapeGuideDrawMode: false,
		}),
}));
