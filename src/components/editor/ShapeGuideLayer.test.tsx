import { render } from '@testing-library/react';
import { ShapeGuideLayer } from './ShapeGuideLayer';
import { CollapsedBlock, ShapeGuide } from '@/types/knitting';

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

	it('eraseStroke가 4점 이상이면 추가 Line을 렌더링한다', () => {
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={mockShapeGuide}
				currentStroke={[]}
				eraseStroke={[0, 0, 5, 5, 10, 10]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		// strokes 2개 + eraseStroke 1개
		expect(getAllByTestId('konva-line')).toHaveLength(3);
	});

	it('eraseStroke가 2점 미만이면 추가 Line을 렌더링하지 않는다', () => {
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={mockShapeGuide}
				currentStroke={[]}
				eraseStroke={[0, 0]}
				cellSize={15}
				transform={{ x: 0, y: 0, scale: 1 }}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(2);
	});

	it('eraseStroke가 없으면 추가 Line을 렌더링하지 않는다', () => {
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

});

describe('ShapeGuideLayer with collapsedBlocks', () => {
	const collapsedBlocks: CollapsedBlock[] = [{ id: 'b1', startRow: 4, endRow: 6 }];
	const cellSize = 15;
	const transform = { x: 0, y: 0, scale: 1 };

	it('collapsedBlocks가 빈 배열이면 모든 stroke를 렌더링한다', () => {
		const shapeGuide: ShapeGuide = { strokes: [[0, 0, 5, 3, 10, 6]] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={[]}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(1);
	});

	it('stroke가 중략 범위 내에만 있으면 렌더링하지 않는다', () => {
		const shapeGuide: ShapeGuide = { strokes: [[0, 5, 10, 5]] };
		const { queryAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(queryAllByTestId('konva-line')).toHaveLength(0);
	});

	it('stroke의 모든 점이 중략 범위 밖이면 렌더링한다', () => {
		const shapeGuide: ShapeGuide = { strokes: [[0, 2, 10, 3]] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(1);
	});

	it('stroke가 중략 범위를 가로지르면 visible segment만 렌더링한다', () => {
		// points: row=2(visible), row=3(visible), row=5(null, 4-6 범위), row=8(visible), row=9(visible)
		// segment1: [(0,2),(5,3)] → 1 Line
		// segment2: [(12,8),(15,9)] → 1 Line
		const shapeGuide: ShapeGuide = { strokes: [[0, 2, 5, 3, 8, 5, 12, 8, 15, 9]] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(2);
	});

	it('currentStroke가 중략 범위 내에만 있으면 렌더링하지 않는다', () => {
		const shapeGuide: ShapeGuide = { strokes: [] };
		const { queryAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[0, 5, 10, 5]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(queryAllByTestId('konva-line')).toHaveLength(0);
	});

	it('currentStroke가 중략 범위를 가로지르면 visible segment만 렌더링한다', () => {
		// points: row=2(visible), row=3(visible), row=5(null), row=8(visible), row=9(visible)
		// → 2 Lines
		const shapeGuide: ShapeGuide = { strokes: [] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[0, 2, 5, 3, 8, 5, 12, 8, 15, 9]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(2);
	});

	it('stroke 점이 중략 startRow 경계에 있으면 중략 전 segment에 포함된다', () => {
		// row=4는 collapsedBlocks startRow → 바로 위 격자의 하단 경계이므로 visible
		const shapeGuide: ShapeGuide = { strokes: [[0, 2, 0, 4]] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedBlocks={collapsedBlocks}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(1);
	});
});

describe('ShapeGuideLayer with collapsedColumnBlocks', () => {
	const collapsedColumnBlocks: import('@/types/knitting').CollapsedColumnBlock[] = [
		{ id: 'c1', startCol: 4, endCol: 6 },
	];
	const cellSize = 15;
	const transform = { x: 0, y: 0, scale: 1 };

	it('stroke 점이 중략 startCol 경계에 있으면 중략 전 segment에 포함된다', () => {
		// col=4는 collapsedColumnBlocks startCol → 바로 왼쪽 격자의 우측 경계이므로 visible
		const shapeGuide: ShapeGuide = { strokes: [[2, 0, 4, 0]] };
		const { getAllByTestId } = render(
			<ShapeGuideLayer
				shapeGuide={shapeGuide}
				currentStroke={[]}
				cellSize={cellSize}
				transform={transform}
				collapsedColumnBlocks={collapsedColumnBlocks}
			/>,
		);
		expect(getAllByTestId('konva-line')).toHaveLength(1);
	});
});
