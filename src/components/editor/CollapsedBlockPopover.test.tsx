import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsedBlockPopover } from './CollapsedBlockPopover';

const defaultProps = {
	startRow: 2,
	endRow: 5,
	totalRows: 10,
	onRemove: vi.fn(),
	onClose: vi.fn(),
};

describe('CollapsedBlockPopover', () => {
	it('"N~M단 중략 중" 정보 텍스트를 렌더링한다', () => {
		render(<CollapsedBlockPopover {...defaultProps} startRow={2} endRow={5} totalRows={10} />);
		// 아래가 1단: displayStart = totalRows - endRow = 5, displayEnd = totalRows - startRow = 8
		expect(screen.getByText(/5~8단 중략 중/)).toBeInTheDocument();
	});

	it('startRow=0, endRow=9, totalRows=10일 때 "1~10단 중략 중"을 렌더링한다', () => {
		render(<CollapsedBlockPopover {...defaultProps} startRow={0} endRow={9} totalRows={10} />);
		expect(screen.getByText(/1~10단 중략 중/)).toBeInTheDocument();
	});

	it('[중략 해제] 버튼이 렌더링된다', () => {
		render(<CollapsedBlockPopover {...defaultProps} />);
		expect(screen.getByRole('button', { name: '중략 해제' })).toBeInTheDocument();
	});

	it('[중략 해제] 클릭 시 onRemove 콜백이 호출된다', async () => {
		const handleRemove = vi.fn();
		render(<CollapsedBlockPopover {...defaultProps} onRemove={handleRemove} />);
		await userEvent.click(screen.getByRole('button', { name: '중략 해제' }));
		expect(handleRemove).toHaveBeenCalledTimes(1);
	});

	it('ESC 키 입력 시 onClose가 호출된다', async () => {
		const handleClose = vi.fn();
		render(<CollapsedBlockPopover {...defaultProps} onClose={handleClose} />);
		await userEvent.keyboard('{Escape}');
		expect(handleClose).toHaveBeenCalledTimes(1);
	});
});
