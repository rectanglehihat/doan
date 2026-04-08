import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnotationPopover } from './AnnotationPopover';

const defaultProps = {
	anchorX: 200,
	anchorY: 100,
	side: 'right' as const,
	rowNumber: 5,
	initialLabel: '',
	onConfirm: vi.fn(),
	onDelete: null,
	onClose: vi.fn(),
};

describe('AnnotationPopover', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rowNumber를 표시한다', () => {
		render(<AnnotationPopover {...defaultProps} rowNumber={5} />);
		expect(screen.getByText(/5단/)).toBeInTheDocument();
	});

	it('initialLabel이 빈 문자열일 때 Input이 비어 있다', () => {
		render(<AnnotationPopover {...defaultProps} initialLabel="" />);
		const input = screen.getByRole('textbox');
		expect(input).toHaveValue('');
	});

	it('initialLabel이 있을 때 Input 초기값이 설정된다', () => {
		render(<AnnotationPopover {...defaultProps} initialLabel="코 줄이기" />);
		const input = screen.getByRole('textbox');
		expect(input).toHaveValue('코 줄이기');
	});

	it('확인 버튼 클릭 시 onConfirm에 현재 input 값이 전달된다', async () => {
		const handleConfirm = vi.fn();
		render(<AnnotationPopover {...defaultProps} initialLabel="기존 라벨" onConfirm={handleConfirm} />);
		await userEvent.click(screen.getByRole('button', { name: /확인/ }));
		expect(handleConfirm).toHaveBeenCalledTimes(1);
		expect(handleConfirm).toHaveBeenCalledWith('기존 라벨');
	});

	it('Input 값 변경 후 확인 버튼 클릭 시 변경된 값이 onConfirm에 전달된다', async () => {
		const handleConfirm = vi.fn();
		render(<AnnotationPopover {...defaultProps} initialLabel="" onConfirm={handleConfirm} />);
		await userEvent.type(screen.getByRole('textbox'), '새 라벨');
		await userEvent.click(screen.getByRole('button', { name: /확인/ }));
		expect(handleConfirm).toHaveBeenCalledWith('새 라벨');
	});

	it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
		const handleClose = vi.fn();
		render(<AnnotationPopover {...defaultProps} onClose={handleClose} />);
		await userEvent.click(screen.getByRole('button', { name: /취소/ }));
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it('onDelete=null일 때 삭제 버튼이 렌더링되지 않는다', () => {
		render(<AnnotationPopover {...defaultProps} onDelete={null} />);
		expect(screen.queryByRole('button', { name: /삭제/ })).not.toBeInTheDocument();
	});

	it('onDelete 함수가 있을 때 삭제 버튼이 렌더링된다', () => {
		render(<AnnotationPopover {...defaultProps} onDelete={vi.fn()} />);
		expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
	});

	it('삭제 버튼 클릭 시 onDelete가 호출된다', async () => {
		const handleDelete = vi.fn();
		render(<AnnotationPopover {...defaultProps} onDelete={handleDelete} />);
		await userEvent.click(screen.getByRole('button', { name: /삭제/ }));
		expect(handleDelete).toHaveBeenCalledTimes(1);
	});

	it('side=right일 때 컨테이너의 left 스타일이 anchorX 기반으로 설정된다', () => {
		render(<AnnotationPopover {...defaultProps} side="right" anchorX={200} anchorY={100} />);
		// 절대위치 div 방식이므로 style 속성으로 확인
		const popover = screen.getByRole('dialog');
		expect(popover).toHaveStyle({ top: '100px' });
		expect(popover).toHaveStyle({ left: '200px' });
	});

	it('컴포넌트는 절대 위치 방식으로 렌더링된다', () => {
		render(<AnnotationPopover {...defaultProps} anchorX={50} anchorY={75} />);
		const popover = screen.getByRole('dialog');
		expect(popover).toHaveStyle({ position: 'absolute' });
	});
});
