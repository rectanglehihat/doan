import { create } from 'zustand';
import { KnittingSymbol } from '@/types/knitting';

interface UIState {
	selectedSymbol: KnittingSymbol | null;
	isSaveDialogOpen: boolean;
	isLoadDialogOpen: boolean;
	setSelectedSymbol: (symbol: KnittingSymbol | null) => void;
	openSaveDialog: () => void;
	closeSaveDialog: () => void;
	openLoadDialog: () => void;
	closeLoadDialog: () => void;
	reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	selectedSymbol: null,
	isSaveDialogOpen: false,
	isLoadDialogOpen: false,

	setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
	openSaveDialog: () => set({ isSaveDialogOpen: true }),
	closeSaveDialog: () => set({ isSaveDialogOpen: false }),
	openLoadDialog: () => set({ isLoadDialogOpen: true }),
	closeLoadDialog: () => set({ isLoadDialogOpen: false }),

	reset: () =>
		set({
			selectedSymbol: null,
			isSaveDialogOpen: false,
			isLoadDialogOpen: false,
		}),
}));
