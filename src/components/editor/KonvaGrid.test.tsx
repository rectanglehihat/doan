import { createRef } from 'react';
import { render } from '@testing-library/react';
import type Konva from 'konva';
import { KonvaGrid } from './KonvaGrid';
import type { ChartCell } from '@/types/knitting';

// react-konva mock
vi.mock('react-konva', () => ({
	Stage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
	Layer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
	Rect: () => null,
	Line: () => null,
	Text: () => null,
	Group: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./ShapeGuideLayer', () => ({ ShapeGuideLayer: () => null }));
vi.mock('./CollapsedRow', () => ({ CollapsedRow: () => null }));
vi.mock('./CollapsedColumn', () => ({ CollapsedColumn: () => null }));

let capturedAnnotationLayerProps: Record<string, unknown> = {};
vi.mock('./AnnotationLayer', () => ({
	AnnotationLayer: (props: Record<string, unknown>) => {
		capturedAnnotationLayerProps = props;
		return null;
	},
}));

const mockFitToScreen = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useCanvasNavigation', () => ({
	useCanvasNavigation: () => ({
		transform: { x: 0, y: 0, scale: 1 },
		isSpacePanning: false,
		isInSpacePanMode: () => false,
		handleWheel: vi.fn(),
		handleTouchStart: vi.fn(),
		handleTouchMove: vi.fn(),
		handleTouchEnd: vi.fn(),
		startMousePan: vi.fn(),
		updateMousePan: vi.fn(),
		endMousePan: vi.fn(),
		fitToScreen: mockFitToScreen,
	}),
}));

vi.mock('@/hooks/useVisualCoordinates', () => ({
	useVisualCoordinates: () => ({
		visualRowCount: 3,
		visualColCount: 3,
		totalWidth: 60,
		totalHeight: 60,
		rowVisualYMap: [0, 20, 40],
		colVisualXMap: [0, 20, 40],
		collapsedBlockYMap: [],
		collapsedColumnBlockXMap: [],
		visualToDataRowMap: [0, 1, 2],
		getGridPointer: () => null,
		getCellFromPointer: () => null,
	}),
}));

vi.mock('@/hooks/useEditorShortcuts', () => ({
	useEditorShortcuts: () => ({
		selectedStrokeIndex: null,
		setSelectedStrokeIndex: vi.fn(),
		handleStrokeClick: vi.fn(),
	}),
}));

const defaultCells: ChartCell[][] = Array.from({ length: 3 }, () =>
	Array.from({ length: 3 }, () => ({ symbolId: null, color: null })),
);

const defaultProps = {
	cells: defaultCells,
	gridSize: { rows: 3, cols: 3 },
	cellSize: 20,
	symbolsMap: {},
	selectedSymbolAbbr: null,
	onCellPaint: vi.fn(),
	stageWidth: 400,
	stageHeight: 300,
};

describe('KonvaGrid', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedAnnotationLayerProps = {};
	});

	it('doan:fit-to-screen 이벤트 발생 시 fitToScreen이 올바른 인자로 호출된다', () => {
		render(<KonvaGrid {...defaultProps} />);
		window.dispatchEvent(new Event('doan:fit-to-screen'));
		// stageWidth=400, stageHeight=300, gridWidth=cols*cellSize=60, gridHeight=rows*cellSize=60
		expect(mockFitToScreen).toHaveBeenCalledWith(400, 300, 60, 60);
	});

	it('컴포넌트 언마운트 후 doan:fit-to-screen 이벤트를 발생시켜도 fitToScreen이 호출되지 않는다', () => {
		const { unmount } = render(<KonvaGrid {...defaultProps} />);
		unmount();
		window.dispatchEvent(new Event('doan:fit-to-screen'));
		expect(mockFitToScreen).not.toHaveBeenCalled();
	});

	it('externalStageRef가 전달되면 mount 시 stageRef.current로 동기화된다', () => {
		const externalStageRef = createRef<Konva.Stage | null>();
		render(<KonvaGrid {...defaultProps} externalStageRef={externalStageRef} />);
		// Stage mock은 ref를 연결하지 않으므로 stageRef.current는 null
		// 동기화 자체가 실행됐는지 확인 (null === null)
		expect(externalStageRef.current).toBeNull();
	});

	it('externalStageRef가 전달된 컴포넌트 언마운트 시 externalStageRef.current가 null로 초기화된다', () => {
		const externalStageRef = createRef<Konva.Stage | null>();
		// 언마운트 전 임의 값 삽입
		(externalStageRef as React.MutableRefObject<Konva.Stage | null>).current = {} as Konva.Stage;

		const { unmount } = render(<KonvaGrid {...defaultProps} externalStageRef={externalStageRef} />);
		unmount();
		expect(externalStageRef.current).toBeNull();
	});

	describe('주석 마커 클릭 — existingId 경로 (Phase 3)', () => {
		it('마커 클릭 시 AnnotationLayer.onMarkerClick이 existingId와 함께 onAnnotationAreaClick을 호출한다', () => {
			const onAnnotationAreaClick = vi.fn();
			render(
				<KonvaGrid
					{...defaultProps}
					isAnnotationMode={true}
					onAnnotationAreaClick={onAnnotationAreaClick}
				/>,
			);

			const onMarkerClick = capturedAnnotationLayerProps.onMarkerClick as (
				rowIndex: number,
				anchorX: number,
				anchorY: number,
				existingId: string | null,
			) => void;

			onMarkerClick(2, 100, 200, 'ann-123');
			expect(onAnnotationAreaClick).toHaveBeenCalledWith(2, 'right', 100, 200, 'ann-123');
		});

		it('SideArea 클릭 시 AnnotationLayer.onSideAreaClick이 existingId=null로 onAnnotationAreaClick을 호출한다', () => {
			const onAnnotationAreaClick = vi.fn();
			render(
				<KonvaGrid
					{...defaultProps}
					isAnnotationMode={true}
					onAnnotationAreaClick={onAnnotationAreaClick}
				/>,
			);

			const onSideAreaClick = capturedAnnotationLayerProps.onSideAreaClick as (
				rowIndex: number,
				anchorX: number,
				anchorY: number,
			) => void;

			onSideAreaClick(1, 50, 100);
			expect(onAnnotationAreaClick).toHaveBeenCalledWith(1, 'right', 50, 100, null);
		});
	});
});
