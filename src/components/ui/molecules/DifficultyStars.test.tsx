import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DifficultyStars } from './DifficultyStars';

describe('DifficultyStars', () => {
	it('별 5개를 렌더링한다', () => {
		render(<DifficultyStars value={0} onChange={() => {}} />);
		expect(screen.getAllByRole('button')).toHaveLength(5);
	});

	it('value에 해당하는 별까지 선택 상태로 렌더링한다', () => {
		render(<DifficultyStars value={3} onChange={() => {}} />);
		const buttons = screen.getAllByRole('button');
		expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
		expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
		expect(buttons[2]).toHaveAttribute('aria-pressed', 'true');
		expect(buttons[3]).toHaveAttribute('aria-pressed', 'false');
		expect(buttons[4]).toHaveAttribute('aria-pressed', 'false');
	});

	it('별 클릭 시 onChange에 해당 번호를 전달한다', async () => {
		const handleChange = vi.fn();
		render(<DifficultyStars value={0} onChange={handleChange} />);
		await userEvent.click(screen.getAllByRole('button')[2]);
		expect(handleChange).toHaveBeenCalledWith(3);
	});

	it('이미 선택된 별을 다시 클릭하면 onChange에 0을 전달한다', async () => {
		const handleChange = vi.fn();
		render(<DifficultyStars value={3} onChange={handleChange} />);
		await userEvent.click(screen.getAllByRole('button')[2]);
		expect(handleChange).toHaveBeenCalledWith(0);
	});
});
