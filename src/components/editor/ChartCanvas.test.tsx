import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartCanvas } from './ChartCanvas';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

// KonvaGrid는 SSR 비호환 → 테스트에서 mock 처리
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

describe('ChartCanvas', () => {
	it('캔버스 컨테이너와 KonvaGrid를 렌더링한다', () => {
		render(<ChartCanvas />);
		expect(screen.getByTestId('konva-grid')).toBeInTheDocument();
	});

	it('isSelectionMode=true이고 cellSelection이 있을 때 "행 중략" 버튼이 렌더링된다', () => {
		act(() => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setCellSelection({ startRow: 1, startCol: 0, endRow: 4, endCol: 19 });
		});
		render(<ChartCanvas />);
		expect(screen.getByRole('button', { name: '행 중략' })).toBeInTheDocument();
	});

	it('isSelectionMode=false이면 "행 중략" 버튼이 없다', () => {
		act(() => {
			useUIStore.getState().setSelectionMode(false);
		});
		render(<ChartCanvas />);
		expect(screen.queryByRole('button', { name: '행 중략' })).not.toBeInTheDocument();
	});

	it('cellSelection이 null이면 "행 중략" 버튼이 없다', () => {
		act(() => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setCellSelection(null);
		});
		render(<ChartCanvas />);
		expect(screen.queryByRole('button', { name: '행 중략' })).not.toBeInTheDocument();
	});

	it('"행 중략" 버튼 클릭 시 addCollapsedBlock 이 호출되고 cellSelection이 해제된다', async () => {
		act(() => {
			useUIStore.getState().setSelectionMode(true);
			useUIStore.getState().setCellSelection({ startRow: 1, startCol: 0, endRow: 4, endCol: 19 });
		});
		render(<ChartCanvas />);
		const btn = screen.getByRole('button', { name: '행 중략' });
		await userEvent.click(btn);
		// collapsedBlocks 추가 확인
		const blocks = useChartStore.getState().collapsedBlocks;
		expect(blocks).toHaveLength(1);
		expect(blocks[0].startRow).toBe(1);
		expect(blocks[0].endRow).toBe(4);
		// cellSelection 해제 확인
		expect(useUIStore.getState().cellSelection).toBeNull();
	});

	it('"행 중략" 클릭 시 startRow >= endRow이면 추가하지 않는다', async () => {
		act(() => {
			useUIStore.getState().setSelectionMode(true);
			// 단일 행 선택 (startRow === endRow)
			useUIStore.getState().setCellSelection({ startRow: 3, startCol: 0, endRow: 3, endCol: 5 });
		});
		render(<ChartCanvas />);
		// startRow === endRow인 경우 버튼 자체가 없어야 함 (또는 disabled)
		// 구현 정책: startRow < endRow인 경우만 버튼 노출
		expect(screen.queryByRole('button', { name: '행 중략' })).not.toBeInTheDocument();
	});
});
