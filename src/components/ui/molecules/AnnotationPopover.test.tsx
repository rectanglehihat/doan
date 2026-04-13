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

	it('Escape 키 입력 시 onClose가 호출된다', async () => {
		render(<AnnotationPopover {...defaultProps} />);
		await userEvent.keyboard('{Escape}');
		expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
	});

	describe('mode=range', () => {
		const rangeProps = {
			anchorX: 200,
			anchorY: 100,
			side: 'right' as const,
			mode: 'range' as const,
			startRowNumber: 3,
			endRowNumber: 7,
			initialText: '',
			onConfirm: vi.fn(),
			onDelete: null,
			onClose: vi.fn(),
		};

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('mode=range일 때 textarea가 렌더링된다', () => {
			render(<AnnotationPopover {...rangeProps} />);
			expect(screen.getByRole('textbox')).toBeInTheDocument();
			// textarea는 multiline이므로 tagName 확인
			expect(screen.getByRole('textbox').tagName.toLowerCase()).toBe('textarea');
		});

		it('mode=range일 때 {startRowNumber}~{endRowNumber}단 제목이 표시된다', () => {
			render(<AnnotationPopover {...rangeProps} startRowNumber={3} endRowNumber={7} />);
			expect(screen.getByText(/3~7단/)).toBeInTheDocument();
		});

		it('mode=range일 때 initialText가 textarea 초기값으로 설정된다', () => {
			render(<AnnotationPopover {...rangeProps} initialText="초기 텍스트" />);
			expect(screen.getByRole('textbox')).toHaveValue('초기 텍스트');
		});

		it('mode=range일 때 textarea 입력 후 확인 클릭 시 onConfirm(text)이 호출된다', async () => {
			const handleConfirm = vi.fn();
			render(<AnnotationPopover {...rangeProps} initialText="" onConfirm={handleConfirm} />);
			await userEvent.type(screen.getByRole('textbox'), '멀티라인\n텍스트');
			await userEvent.click(screen.getByRole('button', { name: /확인/ }));
			expect(handleConfirm).toHaveBeenCalledTimes(1);
			expect(handleConfirm).toHaveBeenCalledWith(expect.stringContaining('멀티라인'));
		});

		it('mode=range일 때 initialText가 있으면 확인 클릭 시 initialText가 onConfirm에 전달된다', async () => {
			const handleConfirm = vi.fn();
			render(
				<AnnotationPopover {...rangeProps} initialText="기존 브라켓 텍스트" onConfirm={handleConfirm} />,
			);
			await userEvent.click(screen.getByRole('button', { name: /확인/ }));
			expect(handleConfirm).toHaveBeenCalledWith('기존 브라켓 텍스트');
		});

		it('mode=range일 때 취소 버튼 클릭 시 onClose가 호출된다', async () => {
			const handleClose = vi.fn();
			render(<AnnotationPopover {...rangeProps} onClose={handleClose} />);
			await userEvent.click(screen.getByRole('button', { name: /취소/ }));
			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('mode=range일 때 onDelete가 있으면 삭제 버튼이 렌더링된다', () => {
			render(<AnnotationPopover {...rangeProps} onDelete={vi.fn()} />);
			expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
		});

		it('mode=range일 때 onDelete=null이면 삭제 버튼이 렌더링되지 않는다', () => {
			render(<AnnotationPopover {...rangeProps} onDelete={null} />);
			expect(screen.queryByRole('button', { name: /삭제/ })).not.toBeInTheDocument();
		});

		it('mode=range일 때 Escape 키 입력 시 onClose가 호출된다', async () => {
			const handleClose = vi.fn();
			render(<AnnotationPopover {...rangeProps} onClose={handleClose} />);
			await userEvent.keyboard('{Escape}');
			expect(handleClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('4방향 지원 — side top/bottom', () => {
		it('side=top일 때 transform: translateY(-100%) 스타일이 적용된다', () => {
			render(
				<AnnotationPopover
					{...defaultProps}
					side="top"
					anchorX={150}
					anchorY={50}
				/>,
			);
			const popover = screen.getByRole('dialog');
			expect(popover).toHaveStyle({ transform: 'translateY(-100%)' });
		});

		it('side=bottom일 때 transform 스타일이 적용되지 않는다', () => {
			render(
				<AnnotationPopover
					{...defaultProps}
					side="bottom"
					anchorX={150}
					anchorY={200}
				/>,
			);
			const popover = screen.getByRole('dialog');
			// bottom은 transform 없음 — translateX/translateY 모두 없어야 함
			expect(popover).not.toHaveStyle({ transform: 'translateX(-100%)' });
			expect(popover).not.toHaveStyle({ transform: 'translateY(-100%)' });
		});

		it('side=top일 때 anchorX/anchorY 기반 절대 위치가 설정된다', () => {
			render(
				<AnnotationPopover
					{...defaultProps}
					side="top"
					anchorX={120}
					anchorY={80}
				/>,
			);
			const popover = screen.getByRole('dialog');
			expect(popover).toHaveStyle({ left: '120px', top: '80px' });
		});

		it('side=bottom일 때 anchorX/anchorY 기반 절대 위치가 설정된다', () => {
			render(
				<AnnotationPopover
					{...defaultProps}
					side="bottom"
					anchorX={60}
					anchorY={300}
				/>,
			);
			const popover = screen.getByRole('dialog');
			expect(popover).toHaveStyle({ left: '60px', top: '300px' });
		});
	});

	describe('4방향 지원 — mode=column', () => {
		const columnProps = {
			anchorX: 200,
			anchorY: 50,
			side: 'top' as const,
			colNumber: 3,
			initialLabel: '',
			onConfirm: vi.fn(),
			onDelete: null,
			onClose: vi.fn(),
			mode: 'column' as const,
		};

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('mode=column일 때 colNumber를 표시한다 (예: "3열")', () => {
			render(<AnnotationPopover {...columnProps} colNumber={3} />);
			expect(screen.getByText(/3열/)).toBeInTheDocument();
		});

		it('mode=column일 때 Input이 렌더링된다 (label 입력)', () => {
			render(<AnnotationPopover {...columnProps} />);
			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('mode=column일 때 initialLabel이 Input 초기값으로 설정된다', () => {
			render(<AnnotationPopover {...columnProps} initialLabel="기존 열 주석" />);
			expect(screen.getByRole('textbox')).toHaveValue('기존 열 주석');
		});

		it('mode=column일 때 Input 값 변경 후 확인 클릭 시 변경된 값이 onConfirm에 전달된다', async () => {
			const handleConfirm = vi.fn();
			render(<AnnotationPopover {...columnProps} initialLabel="" onConfirm={handleConfirm} />);
			await userEvent.type(screen.getByRole('textbox'), '열 라벨');
			await userEvent.click(screen.getByRole('button', { name: /확인/ }));
			expect(handleConfirm).toHaveBeenCalledWith('열 라벨');
		});

		it('mode=column일 때 취소 버튼 클릭 시 onClose가 호출된다', async () => {
			const handleClose = vi.fn();
			render(<AnnotationPopover {...columnProps} onClose={handleClose} />);
			await userEvent.click(screen.getByRole('button', { name: /취소/ }));
			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('mode=column일 때 onDelete가 있으면 삭제 버튼이 렌더링된다', () => {
			render(<AnnotationPopover {...columnProps} onDelete={vi.fn()} />);
			expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
		});

		it('mode=column일 때 onDelete=null이면 삭제 버튼이 렌더링되지 않는다', () => {
			render(<AnnotationPopover {...columnProps} onDelete={null} />);
			expect(screen.queryByRole('button', { name: /삭제/ })).not.toBeInTheDocument();
		});

		it('mode=column일 때 colNumber=1이면 "1열"이 표시된다', () => {
			render(<AnnotationPopover {...columnProps} colNumber={1} />);
			expect(screen.getByText(/1열/)).toBeInTheDocument();
		});
	});
});
