import { render, screen } from '@testing-library/react';
import { EditorSidebar } from './EditorSidebar';

describe('EditorSidebar', () => {
	it('준비물 섹션을 렌더링한다', () => {
		render(<EditorSidebar />);
		expect(screen.getByText('준비물')).toBeInTheDocument();
	});

	it('준비물 textarea가 렌더링된다', () => {
		render(<EditorSidebar />);
		expect(screen.getByPlaceholderText('사용할 실, 바늘, 부자재 등을 적어주세요')).toBeInTheDocument();
	});
});
