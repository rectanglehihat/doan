import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from '@supabase/supabase-js';
import { Navbar } from './Navbar';
import { useUserStore } from '@/store/useUserStore';

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@supabase/ssr', () => ({
	createBrowserClient: vi.fn(() => ({
		auth: {
			signInWithOAuth: vi.fn(),
			signOut: vi.fn(),
			onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
		},
	})),
}));

vi.mock('@/hooks/useAuth', () => ({
	useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';
const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
	mockUseAuth.mockReturnValue({
		signInWithGoogle: vi.fn(),
		signInWithKakao: vi.fn(),
		signOut: vi.fn(),
		getSession: vi.fn(),
		isLoading: false,
	});
});

afterEach(() => {
	useUserStore.getState().reset();
});

describe('Navbar', () => {
	it('앱 이름을 렌더링한다', () => {
		useUserStore.setState({ user: null, isLoading: false });
		render(<Navbar />);
		expect(screen.getByText('도안')).toBeInTheDocument();
	});

	describe('비로그인 상태', () => {
		beforeEach(() => {
			useUserStore.setState({ user: null, isLoading: false });
		});

		it('"SIGN IN" 링크를 렌더링한다', () => {
			render(<Navbar />);
			expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
		});

		it('"SIGN IN" 링크가 /login 을 가리킨다', () => {
			render(<Navbar />);
			expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
		});

		it('UserMenu 아바타 버튼을 렌더링하지 않는다', () => {
			render(<Navbar />);
			expect(screen.queryByRole('button', { name: /^T$/i })).not.toBeInTheDocument();
		});
	});

	describe('로그인 상태', () => {
		const fakeUser = { id: 'user-1', email: 'test@test.com' } as User;

		beforeEach(() => {
			useUserStore.setState({ user: fakeUser, isLoading: false });
		});

		it('UserMenu(이메일 첫 글자 아바타)를 렌더링한다', () => {
			render(<Navbar />);
			expect(screen.getByRole('button', { name: /^T$/i })).toBeInTheDocument();
		});

		it('"SIGN IN" 링크를 렌더링하지 않는다', () => {
			render(<Navbar />);
			expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
		});

		it('로그아웃 버튼 클릭 시 signOut을 호출한다', async () => {
			const mockSignOut = vi.fn();
			mockUseAuth.mockReturnValue({
				signInWithGoogle: vi.fn(),
				signInWithKakao: vi.fn(),
				signOut: mockSignOut,
				getSession: vi.fn(),
				isLoading: false,
			});
			render(<Navbar />);
			await userEvent.click(screen.getByRole('button', { name: /^T$/i }));
			await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));
			expect(mockSignOut).toHaveBeenCalledTimes(1);
		});
	});
});
