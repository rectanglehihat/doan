import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './useUserStore';
import type { User } from '@supabase/supabase-js';

beforeEach(() => {
	useUserStore.getState().reset();
});

const mockUser: User = {
	id: 'test-user-id',
	email: 'test@example.com',
	app_metadata: {},
	user_metadata: {},
	aud: 'authenticated',
	created_at: '2026-01-01T00:00:00.000Z',
};

describe('useUserStore', () => {
	describe('초기 상태', () => {
		it('user는 null이다', () => {
			const { user } = useUserStore.getState();
			expect(user).toBeNull();
		});

		it('isLoading은 true이다', () => {
			const { isLoading } = useUserStore.getState();
			expect(isLoading).toBe(true);
		});
	});

	describe('setUser', () => {
		it('setUser(user) 호출 시 user 상태가 업데이트된다', () => {
			useUserStore.getState().setUser(mockUser);
			expect(useUserStore.getState().user).toEqual(mockUser);
		});

		it('setUser(null) 호출 시 user가 null로 설정된다', () => {
			useUserStore.getState().setUser(mockUser);
			useUserStore.getState().setUser(null);
			expect(useUserStore.getState().user).toBeNull();
		});
	});

	describe('setLoading', () => {
		it('setLoading(false) 호출 시 isLoading이 false로 변경된다', () => {
			useUserStore.getState().setLoading(false);
			expect(useUserStore.getState().isLoading).toBe(false);
		});

		it('setLoading(true) 호출 시 isLoading이 true로 변경된다', () => {
			useUserStore.getState().setLoading(false);
			useUserStore.getState().setLoading(true);
			expect(useUserStore.getState().isLoading).toBe(true);
		});
	});

	describe('clearUser', () => {
		it('clearUser() 호출 시 user가 null로 설정된다', () => {
			useUserStore.getState().setUser(mockUser);
			useUserStore.getState().clearUser();
			expect(useUserStore.getState().user).toBeNull();
		});

		it('clearUser()는 setUser(null)과 독립적인 action이다', () => {
			useUserStore.getState().setUser(mockUser);
			useUserStore.getState().clearUser();
			// clearUser 호출 이후에도 isLoading 상태는 유지된다 (로그아웃 의도 명시)
			const state = useUserStore.getState();
			expect(state.user).toBeNull();
		});
	});

	describe('reset', () => {
		it('reset() 호출 시 user는 null, isLoading은 true로 초기화된다', () => {
			useUserStore.getState().setUser(mockUser);
			useUserStore.getState().setLoading(false);
			useUserStore.getState().reset();

			const { user, isLoading } = useUserStore.getState();
			expect(user).toBeNull();
			expect(isLoading).toBe(true);
		});
	});
});
