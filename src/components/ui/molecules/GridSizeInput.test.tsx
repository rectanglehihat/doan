import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridSizeInput } from './GridSizeInput';

describe('GridSizeInput', () => {
	describe('렌더링', () => {
		it('너비(cols) 입력 필드를 렌더링한다', () => {
			render(<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={vi.fn()} />);
			expect(screen.getByRole('spinbutton', { name: '너비 코 수' })).toBeInTheDocument();
		});

		it('높이(rows) 입력 필드를 렌더링한다', () => {
			render(<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={vi.fn()} />);
			expect(screen.getByRole('spinbutton', { name: '높이 단 수' })).toBeInTheDocument();
		});

		it('cols 값을 너비 입력에 표시한다', () => {
			render(<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={vi.fn()} />);
			expect(screen.getByRole('spinbutton', { name: '너비 코 수' })).toHaveValue(20);
		});

		it('rows 값을 높이 입력에 표시한다', () => {
			render(<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={vi.fn()} />);
			expect(screen.getByRole('spinbutton', { name: '높이 단 수' })).toHaveValue(10);
		});
	});

	describe('이벤트', () => {
		it('너비 입력 변경 시 onColsChange를 호출한다', async () => {
			const handleColsChange = vi.fn();
			render(<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={handleColsChange} />);
			await userEvent.clear(screen.getByRole('spinbutton', { name: '너비 코 수' }));
			await userEvent.type(screen.getByRole('spinbutton', { name: '너비 코 수' }), '15');
			expect(handleColsChange).toHaveBeenCalled();
		});

		it('높이 입력 변경 시 onRowsChange를 호출한다', async () => {
			const handleRowsChange = vi.fn();
			render(<GridSizeInput rows={10} cols={20} onRowsChange={handleRowsChange} onColsChange={vi.fn()} />);
			await userEvent.clear(screen.getByRole('spinbutton', { name: '높이 단 수' }));
			await userEvent.type(screen.getByRole('spinbutton', { name: '높이 단 수' }), '5');
			expect(handleRowsChange).toHaveBeenCalled();
		});
	});

	describe('값 범위', () => {
		it('max를 초과하는 값은 max로 클램핑된다', async () => {
			const handleColsChange = vi.fn();
			render(
				<GridSizeInput rows={10} cols={20} onRowsChange={vi.fn()} onColsChange={handleColsChange} max={50} />,
			);
			await userEvent.clear(screen.getByRole('spinbutton', { name: '너비 코 수' }));
			await userEvent.type(screen.getByRole('spinbutton', { name: '너비 코 수' }), '999');
			const lastCall = handleColsChange.mock.calls.at(-1)?.[0] as number;
			expect(lastCall).toBeLessThanOrEqual(50);
		});

		it('min 미만의 값은 min으로 클램핑된다', async () => {
			const handleRowsChange = vi.fn();
			render(
				<GridSizeInput rows={10} cols={20} onRowsChange={handleRowsChange} onColsChange={vi.fn()} min={5} />,
			);
			await userEvent.clear(screen.getByRole('spinbutton', { name: '높이 단 수' }));
			await userEvent.type(screen.getByRole('spinbutton', { name: '높이 단 수' }), '1');
			const lastCall = handleRowsChange.mock.calls.at(-1)?.[0] as number;
			expect(lastCall).toBeGreaterThanOrEqual(5);
		});
	});
});
