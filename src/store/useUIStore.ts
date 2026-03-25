import { create } from 'zustand';
import { KnittingSymbol, SymmetryMode } from '@/types/knitting';

interface UIState {
	selectedSymbol: KnittingSymbol | null;
	symmetryMode: SymmetryMode;
	isSaveDialogOpen: boolean;
	isLoadDialogOpen: boolean;
	isResetDialogOpen: boolean;
	setSelectedSymbol: (symbol: KnittingSymbol | null) => void;
	setSymmetryMode: (mode: SymmetryMode) => void;
	openSaveDialog: () => void;
	closeSaveDialog: () => void;
	openLoadDialog: () => void;
	closeLoadDialog: () => void;
	openResetDialog: () => void;
	closeResetDialog: () => void;
	reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	selectedSymbol: null,
	symmetryMode: 'none',
	isSaveDialogOpen: false,
	isLoadDialogOpen: false,
	isResetDialogOpen: false,

	setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
	setSymmetryMode: (mode) => set({ symmetryMode: mode }),
	openSaveDialog: () => set({ isSaveDialogOpen: true }),
	closeSaveDialog: () => set({ isSaveDialogOpen: false }),
	openLoadDialog: () => set({ isLoadDialogOpen: true }),
	closeLoadDialog: () => set({ isLoadDialogOpen: false }),
	openResetDialog: () => set({ isResetDialogOpen: true }),
	closeResetDialog: () => set({ isResetDialogOpen: false }),

	reset: () =>
		set({
			selectedSymbol: null,
			symmetryMode: 'none',
			isSaveDialogOpen: false,
			isLoadDialogOpen: false,
			isResetDialogOpen: false,
		}),
}));
