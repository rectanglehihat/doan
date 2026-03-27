import { render, screen, act } from '@testing-library/react';
import EditorPage from './page';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

vi.mock('next/dynamic', () => ({
	default: () => {
		return function MockKonvaGrid() {
			return <div data-testid="konva-grid" />;
		};
	},
}));

beforeEach(() => {
	useChartStore.getState().reset();
	useUIStore.getState().reset();
});

describe('EditorPage', () => {
	it('페이지를 렌더링한다', () => {
		render(<EditorPage />);
		// Toolbar가 렌더링됨
		expect(screen.getByRole('button', { name: /실행 취소/i })).toBeInTheDocument();
	});

	it('collapsedBlock이 있어도 페이지가 정상 렌더링된다', () => {
		act(() => {
			useChartStore.getState().addCollapsedBlock(2, 5);
		});
		render(<EditorPage />);
		// KonvaGrid mock 환경에서 중략 행 클릭 불가, 기본 렌더링만 확인
		expect(screen.getByRole('button', { name: /실행 취소/i })).toBeInTheDocument();
	});

	it('초기 상태에서 collapsedBlocks가 비어있다', () => {
		render(<EditorPage />);
		expect(useChartStore.getState().collapsedBlocks).toHaveLength(0);
	});
});
