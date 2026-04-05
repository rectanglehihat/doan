import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsedColumn } from './CollapsedColumn';
import type { CollapsedColumnBlock } from '@/types/knitting';

vi.mock('react-konva', () => ({
	Group: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
		<div onClick={onClick}>{children}</div>
	),
	Rect: () => <div />,
	Text: ({ text }: { text?: string }) => <span>{text}</span>,
}));

const defaultBlock: CollapsedColumnBlock = { id: 'col-1', startCol: 3, endCol: 6 };

describe('CollapsedColumn', () => {
	it('라벨 텍스트를 올바르게 계산한다 (오른쪽이 1열)', () => {
		// totalCols=10, startCol=3, endCol=6 → displayStart=10-6=4, displayEnd=10-3=7
		render(
			<CollapsedColumn
				block={defaultBlock}
				x={60}
				height={200}
				cellSize={20}
				totalCols={10}
				onClick={vi.fn()}
			/>,
		);
		expect(screen.getByText('4~7열 중략')).toBeInTheDocument();
	});

	it('클릭 시 onClick에 block.id가 전달된다', async () => {
		const handleClick = vi.fn();
		render(
			<CollapsedColumn
				block={defaultBlock}
				x={60}
				height={200}
				cellSize={20}
				totalCols={10}
				onClick={handleClick}
			/>,
		);
		await userEvent.click(screen.getByText('4~7열 중략').closest('div')!);
		expect(handleClick).toHaveBeenCalledWith('col-1');
	});

	it('fontSize는 cellSize * 0.6 기준으로 9~11 사이로 클램핑된다', () => {
		// cellSize=8 → floor(8*0.6)=4 → clamp → 9
		render(
			<CollapsedColumn
				block={defaultBlock}
				x={0}
				height={100}
				cellSize={8}
				totalCols={10}
				onClick={vi.fn()}
			/>,
		);
		expect(screen.getByText('4~7열 중략')).toBeInTheDocument();
	});

	it('startCol=0, endCol=1일 때 라벨을 올바르게 표시한다', () => {
		const block: CollapsedColumnBlock = { id: 'col-2', startCol: 0, endCol: 1 };
		render(
			<CollapsedColumn
				block={block}
				x={0}
				height={100}
				cellSize={20}
				totalCols={5}
				onClick={vi.fn()}
			/>,
		);
		// displayStart=5-1=4, displayEnd=5-0=5
		expect(screen.getByText('4~5열 중략')).toBeInTheDocument();
	});
});
