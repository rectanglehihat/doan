import { render, screen } from '@testing-library/react';
import Home from './page';

describe('랜딩 페이지', () => {
	it('히어로 서브타이틀이 렌더링된다', () => {
		render(<Home />);
		expect(screen.getByText(/Knitting & Crochet Editor/i)).toBeInTheDocument();
	});

	it('"도안 만들기" CTA가 /editor로 연결된다', () => {
		render(<Home />);
		const cta = screen.getByRole('link', { name: /도안 만들기/i });
		expect(cta).toBeInTheDocument();
		expect(cta).toHaveAttribute('href', '/editor');
	});
});
