import { render } from '@testing-library/react';
import { ShapeGuideLayer } from './ShapeGuideLayer';
import { ShapeGuide } from '@/types/knitting';

vi.mock('react-konva', async () => {
	const actual = await vi.importActual<typeof import('react-konva')>('react-konva');
	return {
		...actual,
		Stage: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-stage">{children}</div>,
		Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-layer">{children}</div>,
		Line: (props: { 'data-testid'?: string }) => <div data-testid={props['data-testid'] ?? 'konva-line'} />,
	};
});

const mockShapeGuide: ShapeGuide = {
	strokes: [
		[0, 0, 5, 3, 10, 6],
		[2, 2, 8, 8],
	],
};

describe('ShapeGuideLayer', () => {
	it('strokes 수만큼 Line을 렌더링한다', () => {
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={mockShapeGuide}
				currentStroke={[]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(2);
	});

	it('currentStroke가 있으면 추가 Line을 렌더링한다', () => {
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={mockShapeGuide}
				currentStroke={[0, 0, 5, 5, 10, 10]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		// strokes 2개 + currentStroke 1개
		expect(getAllByTestId('konva-line')).toHaveLength(3);
	});

	it('currentStroke가 2점 미만이면 추가 Line을 렌더링하지 않는다', () => {
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={mockShapeGuide}
				currentStroke={[0, 0]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(2);
	});

	it('strokes가 없으면 Line을 렌더링하지 않는다', () => {
		const { queryAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={{ strokes: [] }}
				currentStroke={[]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		expect(queryAllByTestId('konva-line')).toHaveLength(0);
	});
});
