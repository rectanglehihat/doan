import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface UserState {
	user: User | null;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	setLoading: (isLoading: boolean) => void;
	clearUser: () => void;
	reset: () => void;
}

const initialState = {
	user: null,
	isLoading: true,
} satisfies {
	user: User | null;
	isLoading: boolean;
};

export const useUserStore = create<UserState>((set) => ({
	...initialState,

	setUser: (user) => set({ user }),

	setLoading: (isLoading) => set({ isLoading }),

	clearUser: () => set({ user: null }),

	reset: () => set(initialState),
}));
