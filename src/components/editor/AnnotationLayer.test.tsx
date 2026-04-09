import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnotationLayer } from './AnnotationLayer';
import type { RowAnnotation } from '@/types/annotation';

// react-konva mock — KonvaGrid.test.tsx 패턴과 동일
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
		<button onClick={onClick} aria-label="annotation-marker" />
	),
}));

const defaultProps = {
	rowAnnotations: [] as RowAnnotation[],
	rowVisualYMap: [0, 20, 40, 60, 80] as (number | null)[],
	totalWidth: 100,
	cellSize: 20,
	annotationSideWidth: 30,
	isAnnotationMode: false,
	totalRows: 5,
	onMarkerClick: vi.fn(),
	onSideAreaClick: vi.fn(),
};

describe('AnnotationLayer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rowAnnotations가 빈 배열이면 단 번호 텍스트가 렌더링되지 않는다', () => {
		render(<AnnotationLayer {...defaultProps} rowAnnotations={[]} />);
		// 라벨이 없으므로 annotation 텍스트 없음
		expect(screen.queryByText(/단/)).not.toBeInTheDocument();
	});

	it('rowAnnotations에 항목이 있을 때 단 번호 텍스트를 렌더링한다', () => {
		const annotations: RowAnnotation[] = [
			{ id: 'ann-1', rowIndex: 0, label: '코 줄이기', side: 'right' },
		];
		// totalRows=5, rowIndex=0 → 단 번호 = 5 - 0 = 5단
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				totalRows={5}
			/>,
		);
		expect(screen.getByText('5단')).toBeInTheDocument();
	});

	it('단 번호는 totalRows - rowIndex 공식으로 계산된다', () => {
		const annotations: RowAnnotation[] = [
			{ id: 'ann-2', rowIndex: 3, label: '무늬 시작', side: 'right' },
		];
		// totalRows=10, rowIndex=3 → 단 번호 = 10 - 3 = 7단
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				totalRows={10}
				rowVisualYMap={[0, 20, 40, 60, 80, 100, 120, 140, 160, 180]}
			/>,
		);
		expect(screen.getByText('7단')).toBeInTheDocument();
	});

	it('rowVisualYMap[rowIndex]가 null이면 해당 항목을 렌더링하지 않는다', () => {
		const annotations: RowAnnotation[] = [
			{ id: 'ann-3', rowIndex: 2, label: '중략 내부', side: 'right' },
		];
		// rowIndex=2인 항목의 visualY를 null로 설정 (중략 내부)
		const rowVisualYMap: (number | null)[] = [0, 20, null, 60, 80];
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				rowVisualYMap={rowVisualYMap}
				totalRows={5}
			/>,
		);
		expect(screen.queryByText('3단')).not.toBeInTheDocument();
	});

	it('여러 항목 중 rowVisualYMap이 null인 항목만 스킵된다', () => {
		const annotations: RowAnnotation[] = [
			{ id: 'ann-4', rowIndex: 1, label: '정상', side: 'right' },
			{ id: 'ann-5', rowIndex: 2, label: '중략', side: 'right' },
		];
		const rowVisualYMap: (number | null)[] = [0, 20, null, 60, 80];
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				rowVisualYMap={rowVisualYMap}
				totalRows={5}
			/>,
		);
		// rowIndex=1 → 5-1=4단 렌더링
		expect(screen.getByText('4단')).toBeInTheDocument();
		// rowIndex=2 → null이므로 3단 렌더링 안 됨
		expect(screen.queryByText('3단')).not.toBeInTheDocument();
	});

	it('isAnnotationMode=false일 때 마커 클릭해도 onMarkerClick이 호출되지 않는다', async () => {
		const handleMarkerClick = vi.fn();
		const annotations: RowAnnotation[] = [
			{ id: 'ann-6', rowIndex: 0, label: '테스트', side: 'right' },
		];
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				isAnnotationMode={false}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.queryAllByLabelText('annotation-marker');
		if (markers.length > 0) {
			await userEvent.click(markers[0]);
		}
		expect(handleMarkerClick).not.toHaveBeenCalled();
	});

	it('isAnnotationMode=true일 때 마커 클릭 시 onMarkerClick이 호출된다', async () => {
		const handleMarkerClick = vi.fn();
		const annotations: RowAnnotation[] = [
			{ id: 'ann-7', rowIndex: 1, label: '테스트', side: 'right' },
		];
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				isAnnotationMode={true}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.getAllByLabelText('annotation-marker');
		await userEvent.click(markers[0]);
		expect(handleMarkerClick).toHaveBeenCalledTimes(1);
	});

	it('onMarkerClick 호출 시 rowIndex가 올바르게 전달된다', async () => {
		const handleMarkerClick = vi.fn();
		const annotations: RowAnnotation[] = [
			{ id: 'ann-8', rowIndex: 2, label: '클릭 테스트', side: 'right' },
		];
		render(
			<AnnotationLayer
				{...defaultProps}
				rowAnnotations={annotations}
				isAnnotationMode={true}
				onMarkerClick={handleMarkerClick}
			/>,
		);
		const markers = screen.getAllByLabelText('annotation-marker');
		await userEvent.click(markers[0]);
		expect(handleMarkerClick).toHaveBeenCalledWith(2, expect.any(Number), expect.any(Number), 'ann-8');
	});

	describe('마커 클릭 시 existingId 전달 (Phase 3)', () => {
		it('마커 클릭 시 onMarkerClick이 annotation.id를 네 번째 인수로 전달한다', async () => {
			const handleMarkerClick = vi.fn();
			const annotations: RowAnnotation[] = [
				{ id: 'existing-ann-id', rowIndex: 1, label: '편집 테스트', side: 'right' },
			];
			render(
				<AnnotationLayer
					{...defaultProps}
					rowAnnotations={annotations}
					isAnnotationMode={true}
					onMarkerClick={handleMarkerClick}
				/>,
			);
			const markers = screen.getAllByLabelText('annotation-marker');
			await userEvent.click(markers[0]);
			expect(handleMarkerClick).toHaveBeenCalledWith(
				1,
				expect.any(Number),
				expect.any(Number),
				'existing-ann-id',
			);
		});

		it('새 주석 생성 클릭(SideArea)과 구별되도록 기존 주석 마커 클릭 시 existingId가 null이 아닌 string이다', async () => {
			const handleMarkerClick = vi.fn();
			const annotations: RowAnnotation[] = [
				{ id: 'check-id-string', rowIndex: 0, label: '확인', side: 'right' },
			];
			render(
				<AnnotationLayer
					{...defaultProps}
					rowAnnotations={annotations}
					isAnnotationMode={true}
					onMarkerClick={handleMarkerClick}
				/>,
			);
			const markers = screen.getAllByLabelText('annotation-marker');
			await userEvent.click(markers[0]);
			const callArgs = handleMarkerClick.mock.calls[0];
			const existingId = callArgs[3];
			expect(typeof existingId).toBe('string');
			expect(existingId).toBe('check-id-string');
		});
	});
});
