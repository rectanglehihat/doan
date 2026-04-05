import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymbolButton } from './SymbolButton';
import { KnittingSymbol } from '@/types/knitting';

const mockSymbol: KnittingSymbol = {
	id: 'k',
	abbr: 'k',
	name: '겉뜨기',
	category: 'basic-stitch',
	patternType: 'knitting',
};

describe('SymbolButton', () => {
	it('기호 약어와 이름을 렌더링한다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByText('k')).toBeInTheDocument();
		expect(screen.getByText('겉뜨기')).toBeInTheDocument();
	});

	it('aria-label에 기호 이름과 약어를 포함한다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByRole('button', { name: '겉뜨기 (k)' })).toBeInTheDocument();
	});

	it('title 속성에 기호 이름을 설정한다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).toHaveAttribute('title', '겉뜨기');
	});

	it('isSelected=true일 때 aria-pressed가 true이다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={true} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});

	it('isSelected=false일 때 aria-pressed가 false이다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
	});

	it('isSelected=true일 때 선택 스타일 클래스를 가진다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={true} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).toHaveClass('ring-2');
	});

	it('isSelected=false일 때 선택 스타일 클래스가 없다', () => {
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).not.toHaveClass('ring-2');
	});

	it('클릭 시 onSelect에 해당 기호를 전달한다', async () => {
		const handleSelect = vi.fn();
		render(<SymbolButton symbol={mockSymbol} isSelected={false} onSelect={handleSelect} />);

		await userEvent.click(screen.getByRole('button'));

		expect(handleSelect).toHaveBeenCalledTimes(1);
		expect(handleSelect).toHaveBeenCalledWith(mockSymbol);
	});

	it('카테고리에 따른 배경색 클래스를 가진다', () => {
		const increaseSymbol: KnittingSymbol = {
			id: 'kfb',
			abbr: 'kfb',
			name: 'kfb늘리기',
			category: 'increase',
			patternType: 'knitting',
		};
		render(<SymbolButton symbol={increaseSymbol} isSelected={false} onSelect={vi.fn()} />);

		expect(screen.getByRole('button')).toHaveClass('bg-emerald-50');
	});

	it('다른 기호로 다시 클릭하면 해당 기호를 onSelect에 전달한다', async () => {
		const handleSelect = vi.fn();
		const decreaseSymbol: KnittingSymbol = {
			id: 'k2tog',
			abbr: 'k2tog',
			name: '오른코 줄이기',
			category: 'decrease',
			patternType: 'knitting',
		};
		render(<SymbolButton symbol={decreaseSymbol} isSelected={false} onSelect={handleSelect} />);

		await userEvent.click(screen.getByRole('button'));

		expect(handleSelect).toHaveBeenCalledWith(decreaseSymbol);
	});
});
