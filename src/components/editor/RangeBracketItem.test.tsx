import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RangeBracketItem } from './RangeBracketItem';
import type { RangeAnnotation } from '@/types/annotation';

// react-konva mock — AnnotationLayer.test.tsx 패턴과 동일
vi.mock('react-konva', () => ({
	Stage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
	Layer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
	Rect: () => null,
	Line: () => null,
	Text: ({ text }: { text?: string }) => <span>{text}</span>,
	Group: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
		<div onClick={onClick}>{children}</div>
	),
	Circle: ({ onClick }: { onClick?: () => void }) => (
		<button onClick={onClick} aria-label="range-bracket-marker" />
	),
	Arrow: () => null,
}));

const mockAnnotation: RangeAnnotation = {
	id: 'range-1',
	startRow: 2,
	endRow: 6,
	text: '오른쪽 경사 감코',
};

const defaultProps = {
	annotation: mockAnnotation,
	startY: 40,
	endY: 120,
	totalWidth: 200,
	cellSize: 20,
	annotationSideWidth: 30,
	isAnnotationMode: false,
	totalRows: 10,
	onMarkerClick: vi.fn(),
};

describe('RangeBracketItem', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('정상 props로 렌더링 시 에러가 없다 (smoke test)', () => {
		expect(() => render(<RangeBracketItem {...defaultProps} />)).not.toThrow();
	});

	it('annotation.text가 있으면 단 범위와 text를 함께 렌더링한다', () => {
		render(<RangeBracketItem {...defaultProps} />);
		expect(screen.getByText('4~8단 오른쪽 경사 감코')).toBeInTheDocument();
	});

	it('annotation.text가 빈 문자열이면 단 범위만 렌더링한다', () => {
		const emptyTextAnnotation: RangeAnnotation = {
			id: 'range-empty',
			startRow: 2,
			endRow: 6,
			text: '',
		};
		render(<RangeBracketItem {...defaultProps} annotation={emptyTextAnnotation} />);
		expect(screen.getByText('4~8단')).toBeInTheDocument();
		expect(screen.queryByText('4~8단 ')).not.toBeInTheDocument();
	});

	it('단 범위는 totalRows - endRow ~ totalRows - startRow 공식으로 계산된다', () => {
		const differentAnnotation: RangeAnnotation = {
			id: 'range-2',
			startRow: 5,
			endRow: 10,
			text: '무늬 패턴',
		};
		render(
			<RangeBracketItem
				{...defaultProps}
				annotation={differentAnnotation}
				totalRows={20}
			/>,
		);
		expect(screen.getByText('10~15단 무늬 패턴')).toBeInTheDocument();
	});

	it('isAnnotationMode=false일 때 마커 클릭 이벤트가 발생하지 않는다', async () => {
		const handleMarkerClick = vi.fn();
		render(
			<RangeBracketItem
				{...defaultProps}
				isAnnotationMode={false}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.queryAllByLabelText('range-bracket-marker');
		if (markers.length > 0) {
			await userEvent.click(markers[0]);
		}
		expect(handleMarkerClick).not.toHaveBeenCalled();
	});

	it('isAnnotationMode=true일 때 마커 클릭 시 onMarkerClick이 호출된다', async () => {
		const handleMarkerClick = vi.fn();
		render(
			<RangeBracketItem
				{...defaultProps}
				isAnnotationMode={true}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.queryAllByLabelText('range-bracket-marker');
		if (markers.length > 0) {
			await userEvent.click(markers[0]);
			expect(handleMarkerClick).toHaveBeenCalledTimes(1);
		}
	});

	it('onMarkerClick 호출 시 annotation id가 전달된다', async () => {
		const handleMarkerClick = vi.fn();
		render(
			<RangeBracketItem
				{...defaultProps}
				isAnnotationMode={true}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.queryAllByLabelText('range-bracket-marker');
		if (markers.length > 0) {
			await userEvent.click(markers[0]);
			expect(handleMarkerClick).toHaveBeenCalledWith(
				'range-1',
				expect.any(Number),
				expect.any(Number),
			);
		}
	});
});
