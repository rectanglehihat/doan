import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
	it('open=true일 때 메시지를 렌더링한다', () => {
		render(<ConfirmDialog open={true} message="초기화하시겠습니까?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByText('초기화하시겠습니까?')).toBeInTheDocument();
	});

	it('open=false일 때 렌더링하지 않는다', () => {
		render(<ConfirmDialog open={false} message="초기화하시겠습니까?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.queryByText('초기화하시겠습니까?')).not.toBeInTheDocument();
	});

	it('title이 있으면 제목을 렌더링한다', () => {
		render(
			<ConfirmDialog
				open={true}
				title="도안 초기화"
				message="초기화하시겠습니까?"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByText('도안 초기화')).toBeInTheDocument();
	});

	it('확인 버튼 클릭 시 onConfirm을 호출한다', async () => {
		const handleConfirm = vi.fn();
		render(<ConfirmDialog open={true} message="초기화하시겠습니까?" onConfirm={handleConfirm} onCancel={vi.fn()} />);
		await userEvent.click(screen.getByRole('button', { name: '확인' }));
		expect(handleConfirm).toHaveBeenCalledTimes(1);
	});

	it('취소 버튼 클릭 시 onCancel을 호출한다', async () => {
		const handleCancel = vi.fn();
		render(<ConfirmDialog open={true} message="초기화하시겠습니까?" onConfirm={vi.fn()} onCancel={handleCancel} />);
		await userEvent.click(screen.getByRole('button', { name: '취소' }));
		expect(handleCancel).toHaveBeenCalledTimes(1);
	});

	it('confirmLabel prop으로 확인 버튼 텍스트를 변경할 수 있다', () => {
		render(
			<ConfirmDialog
				open={true}
				message="초기화하시겠습니까?"
				confirmLabel="초기화"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
	});

	it('cancelLabel prop으로 취소 버튼 텍스트를 변경할 수 있다', () => {
		render(
			<ConfirmDialog
				open={true}
				message="초기화하시겠습니까?"
				cancelLabel="닫기"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
	});

	it('dialog role을 가진다', () => {
		render(<ConfirmDialog open={true} message="초기화하시겠습니까?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});
});
