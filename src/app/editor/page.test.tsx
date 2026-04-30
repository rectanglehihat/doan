import { render, screen, act } from '@testing-library/react';
import { EditorClient } from '@/components/editor/EditorClient';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';

vi.mock('next/dynamic', () => ({
	default: () => {
		return function MockKonvaGrid() {
			return <div data-testid="konva-grid" />;
		};
	},
}));

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	})),
}));

vi.mock('@supabase/ssr', () => ({
	createBrowserClient: vi.fn(() => ({
		auth: {
			signInWithOAuth: vi.fn(),
			signOut: vi.fn(),
			onAuthStateChange: vi.fn(() => ({
				data: { subscription: { unsubscribe: vi.fn() } },
			})),
		},
	})),
}));

vi.mock('@/components/editor/ChartCanvas', () => ({
	ChartCanvas: () => <div data-testid="chart-canvas" />,
}));

vi.mock('@/components/editor/EditorSidebar', () => ({
	EditorSidebar: () => <div data-testid="editor-sidebar" />,
}));

vi.mock('@/components/editor/LoadDialog', () => ({
	LoadDialog: () => <div data-testid="load-dialog" />,
}));

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
	useUserStore.getState().reset();
});

describe('에디터 페이지 (/editor)', () => {
	it('EditorClient가 렌더링된다 (Toolbar 실행 취소 버튼 존재 확인)', () => {
		render(<EditorClient />);
		expect(screen.getByRole('button', { name: /실행 취소/i })).toBeInTheDocument();
	});

	it('collapsedBlock이 있어도 정상 렌더링된다', () => {
		act(() => {
			useChartStore.getState().addCollapsedBlock(2, 5);
		});
		render(<EditorClient />);
		expect(screen.getByRole('button', { name: /실행 취소/i })).toBeInTheDocument();
	});

	it('초기 상태에서 collapsedBlocks가 비어있다', () => {
		render(<EditorClient />);
		expect(useChartStore.getState().collapsedBlocks).toHaveLength(0);
	});
});
