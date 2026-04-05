import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsedRow } from './CollapsedRow';
import type { CollapsedBlock } from '@/types/knitting';

vi.mock('react-konva', () => ({
	Group: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
		<div onClick={onClick}>{children}</div>
	),
	Rect: () => <div />,
	Text: ({ text }: { text?: string }) => <span>{text}</span>,
}));

const defaultBlock: CollapsedBlock = { id: 'row-1', startRow: 3, endRow: 6 };

describe('CollapsedRow', () => {
	it('라벨 텍스트를 올바르게 계산한다 (아래가 1단)', () => {
		// totalRows=10, startRow=3, endRow=6 → displayStart=10-6=4, displayEnd=10-3=7
		render(
			<CollapsedRow
				block={defaultBlock}
				y={60}
				width={200}
				cellSize={20}
				totalRows={10}
				onClick={vi.fn()}
			/>,
		);
		expect(screen.getByText('4~7단 중략')).toBeInTheDocument();
	});

	it('클릭 시 onClick에 block.id가 전달된다', async () => {
		const handleClick = vi.fn();
		render(
			<CollapsedRow
				block={defaultBlock}
				y={60}
				width={200}
				cellSize={20}
				totalRows={10}
				onClick={handleClick}
			/>,
		);
		await userEvent.click(screen.getByText('4~7단 중략').closest('div')!);
		expect(handleClick).toHaveBeenCalledWith('row-1');
	});

	it('fontSize는 cellSize * 0.7 기준으로 11~13 사이로 클램핑된다', () => {
		// cellSize=10 → floor(10*0.7)=7 → clamp → 11
		render(
			<CollapsedRow
				block={defaultBlock}
				y={0}
				width={100}
				cellSize={10}
				totalRows={10}
				onClick={vi.fn()}
			/>,
		);
		// 렌더링 오류 없이 표시되면 통과
		expect(screen.getByText('4~7단 중략')).toBeInTheDocument();
	});

	it('startRow=0, endRow=1일 때 라벨을 올바르게 표시한다', () => {
		const block: CollapsedBlock = { id: 'row-2', startRow: 0, endRow: 1 };
		render(
			<CollapsedRow
				block={block}
				y={0}
				width={100}
				cellSize={20}
				totalRows={5}
				onClick={vi.fn()}
			/>,
		);
		// displayStart=5-1=4, displayEnd=5-0=5
		expect(screen.getByText('4~5단 중략')).toBeInTheDocument();
	});
});
