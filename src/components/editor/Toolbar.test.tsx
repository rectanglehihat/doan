import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
	describe('렌더링', () => {
		it('실행 취소 버튼을 렌더링한다', () => {
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).toBeInTheDocument();
		});

		it('다시 실행 버튼을 렌더링한다', () => {
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).toBeInTheDocument();
		});

		it('patternTitle이 전달되면 오른쪽 영역에 도안명을 표시한다', () => {
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} patternTitle="여름 조끼" />);
			expect(screen.getByText('여름 조끼')).toBeInTheDocument();
		});

		it('patternTitle이 빈 문자열이면 기본 placeholder를 표시한다', () => {
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} patternTitle="" />);
			expect(screen.getByText('제목 없는 도안')).toBeInTheDocument();
		});

		it('patternTitle prop이 없으면 기본 placeholder를 표시한다', () => {
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByText('제목 없는 도안')).toBeInTheDocument();
		});
	});

	describe('disabled 상태', () => {
		it('canUndo=false이면 실행 취소 버튼이 비활성화된다', () => {
			render(<Toolbar canUndo={false} canRedo={true} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).toBeDisabled();
		});

		it('canUndo=true이면 실행 취소 버튼이 활성화된다', () => {
			render(<Toolbar canUndo={true} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).not.toBeDisabled();
		});

		it('canRedo=false이면 다시 실행 버튼이 비활성화된다', () => {
			render(<Toolbar canUndo={true} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).toBeDisabled();
		});

		it('canRedo=true이면 다시 실행 버튼이 활성화된다', () => {
			render(<Toolbar canUndo={false} canRedo={true} onUndo={vi.fn()} onRedo={vi.fn()} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).not.toBeDisabled();
		});
	});

	describe('이벤트', () => {
		it('실행 취소 버튼 클릭 시 onUndo를 호출한다', async () => {
			const handleUndo = vi.fn();
			render(<Toolbar canUndo={true} canRedo={false} onUndo={handleUndo} onRedo={vi.fn()} />);
			await userEvent.click(screen.getByRole('button', { name: /실행 취소/ }));
			expect(handleUndo).toHaveBeenCalledTimes(1);
		});

		it('다시 실행 버튼 클릭 시 onRedo를 호출한다', async () => {
			const handleRedo = vi.fn();
			render(<Toolbar canUndo={false} canRedo={true} onUndo={vi.fn()} onRedo={handleRedo} />);
			await userEvent.click(screen.getByRole('button', { name: /다시 실행/ }));
			expect(handleRedo).toHaveBeenCalledTimes(1);
		});

		it('비활성화된 실행 취소 버튼 클릭 시 onUndo를 호출하지 않는다', async () => {
			const handleUndo = vi.fn();
			render(<Toolbar canUndo={false} canRedo={false} onUndo={handleUndo} onRedo={vi.fn()} />);
			await userEvent.click(screen.getByRole('button', { name: /실행 취소/ }));
			expect(handleUndo).not.toHaveBeenCalled();
		});

		it('비활성화된 다시 실행 버튼 클릭 시 onRedo를 호출하지 않는다', async () => {
			const handleRedo = vi.fn();
			render(<Toolbar canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={handleRedo} />);
			await userEvent.click(screen.getByRole('button', { name: /다시 실행/ }));
			expect(handleRedo).not.toHaveBeenCalled();
		});
	});
});
