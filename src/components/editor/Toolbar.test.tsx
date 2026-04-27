import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';

const defaultProps = {
	canUndo: false,
	canRedo: false,
	onUndo: vi.fn(),
	onRedo: vi.fn(),
	onReset: vi.fn(),
	isShapeGuideDrawMode: false,
	onShapeGuideDrawModeChange: vi.fn(),
	isShapeGuideEraseMode: false,
	onShapeGuideEraseModeChange: vi.fn(),
	onShapeGuideClear: vi.fn(),
	isSelectionMode: false,
	onSelectionModeChange: vi.fn(),
	rotationalMode: 'none' as const,
	onRotationalModeChange: vi.fn(),
	selectedColor: null,
	onColorChange: vi.fn(),
	onColorClear: vi.fn(),
	recentColors: [],
	onFitToScreen: vi.fn(),
	isAnnotationMode: false,
	onAnnotationModeChange: vi.fn(),
};

describe('Toolbar', () => {
	describe('렌더링', () => {
		it('실행 취소 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).toBeInTheDocument();
		});

		it('다시 실행 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).toBeInTheDocument();
		});

	});

	describe('disabled 상태', () => {
		it('canUndo=false이면 실행 취소 버튼이 비활성화된다', () => {
			render(<Toolbar {...defaultProps} canUndo={false} canRedo={true} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).toBeDisabled();
		});

		it('canUndo=true이면 실행 취소 버튼이 활성화된다', () => {
			render(<Toolbar {...defaultProps} canUndo={true} canRedo={false} />);
			expect(screen.getByRole('button', { name: /실행 취소/ })).not.toBeDisabled();
		});

		it('canRedo=false이면 다시 실행 버튼이 비활성화된다', () => {
			render(<Toolbar {...defaultProps} canUndo={true} canRedo={false} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).toBeDisabled();
		});

		it('canRedo=true이면 다시 실행 버튼이 활성화된다', () => {
			render(<Toolbar {...defaultProps} canUndo={false} canRedo={true} />);
			expect(screen.getByRole('button', { name: /다시 실행/ })).not.toBeDisabled();
		});
	});

	describe('이벤트', () => {
		it('실행 취소 버튼 클릭 시 onUndo를 호출한다', async () => {
			const handleUndo = vi.fn();
			render(<Toolbar {...defaultProps} canUndo={true} onUndo={handleUndo} />);
			await userEvent.click(screen.getByRole('button', { name: /실행 취소/ }));
			expect(handleUndo).toHaveBeenCalledTimes(1);
		});

		it('다시 실행 버튼 클릭 시 onRedo를 호출한다', async () => {
			const handleRedo = vi.fn();
			render(<Toolbar {...defaultProps} canRedo={true} onRedo={handleRedo} />);
			await userEvent.click(screen.getByRole('button', { name: /다시 실행/ }));
			expect(handleRedo).toHaveBeenCalledTimes(1);
		});

		it('비활성화된 실행 취소 버튼 클릭 시 onUndo를 호출하지 않는다', async () => {
			const handleUndo = vi.fn();
			render(<Toolbar {...defaultProps} canUndo={false} onUndo={handleUndo} />);
			await userEvent.click(screen.getByRole('button', { name: /실행 취소/ }));
			expect(handleUndo).not.toHaveBeenCalled();
		});

		it('비활성화된 다시 실행 버튼 클릭 시 onRedo를 호출하지 않는다', async () => {
			const handleRedo = vi.fn();
			render(<Toolbar {...defaultProps} canRedo={false} onRedo={handleRedo} />);
			await userEvent.click(screen.getByRole('button', { name: /다시 실행/ }));
			expect(handleRedo).not.toHaveBeenCalled();
		});

		it('새 도안 버튼 클릭 시 onReset을 호출한다', async () => {
			const handleReset = vi.fn();
			render(<Toolbar {...defaultProps} onReset={handleReset} />);
			await userEvent.click(screen.getByRole('button', { name: '새 도안' }));
			expect(handleReset).toHaveBeenCalledTimes(1);
		});

		it('형태선 그리기 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '형태선 그리기' })).toBeInTheDocument();
		});

		it('지우개 버튼을 항상 표시한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '형태선 지우개' })).toBeInTheDocument();
		});

		it('전체 지우기 버튼을 항상 표시한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '형태선 전체 지우기' })).toBeInTheDocument();
		});

		it('형태선 그리기 버튼 클릭 시 onShapeGuideDrawModeChange를 호출한다', async () => {
			const handleDrawModeChange = vi.fn();
			render(<Toolbar {...defaultProps} isShapeGuideDrawMode={false} onShapeGuideDrawModeChange={handleDrawModeChange} />);
			await userEvent.click(screen.getByRole('button', { name: '형태선 그리기' }));
			expect(handleDrawModeChange).toHaveBeenCalledWith(true);
		});

		it('isShapeGuideDrawMode=true이면 버튼이 활성(aria-pressed) 상태이다', () => {
			render(<Toolbar {...defaultProps} isShapeGuideDrawMode={true} />);
			expect(screen.getByRole('button', { name: '형태선 그리기' })).toHaveAttribute('aria-pressed', 'true');
		});

		it('형태선 지우개 버튼 클릭 시 onShapeGuideEraseModeChange를 호출한다', async () => {
			const handleEraseModeChange = vi.fn();
			render(<Toolbar {...defaultProps} isShapeGuideEraseMode={false} onShapeGuideEraseModeChange={handleEraseModeChange} />);
			await userEvent.click(screen.getByRole('button', { name: '형태선 지우개' }));
			expect(handleEraseModeChange).toHaveBeenCalledWith(true);
		});

		it('isShapeGuideEraseMode=true이면 지우개 버튼이 활성(aria-pressed) 상태이다', () => {
			render(<Toolbar {...defaultProps} isShapeGuideEraseMode={true} />);
			expect(screen.getByRole('button', { name: '형태선 지우개' })).toHaveAttribute('aria-pressed', 'true');
		});

		it('전체 지우기 버튼 클릭 시 onShapeGuideClear를 호출한다', async () => {
			const handleClear = vi.fn();
			render(<Toolbar {...defaultProps} onShapeGuideClear={handleClear} />);
			await userEvent.click(screen.getByRole('button', { name: '형태선 전체 지우기' }));
			expect(handleClear).toHaveBeenCalledTimes(1);
		});

		it('색상 전체 지우기 버튼 클릭 시 onColorClear를 호출한다', async () => {
			const handleColorClear = vi.fn();
			render(<Toolbar {...defaultProps} onColorClear={handleColorClear} />);
			await userEvent.click(screen.getByRole('button', { name: '색상 전체 지우기' }));
			expect(handleColorClear).toHaveBeenCalledTimes(1);
		});

		it('선택 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '영역 선택' })).toBeInTheDocument();
		});

		it('isSelectionMode=false이면 선택 버튼이 비활성(aria-pressed=false) 상태이다', () => {
			render(<Toolbar {...defaultProps} isSelectionMode={false} />);
			expect(screen.getByRole('button', { name: '영역 선택' })).toHaveAttribute('aria-pressed', 'false');
		});

		it('isSelectionMode=true이면 선택 버튼이 활성(aria-pressed=true) 상태이다', () => {
			render(<Toolbar {...defaultProps} isSelectionMode={true} />);
			expect(screen.getByRole('button', { name: '영역 선택' })).toHaveAttribute('aria-pressed', 'true');
		});

		it('선택 버튼 클릭 시 onSelectionModeChange를 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} isSelectionMode={false} onSelectionModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '영역 선택' }));
			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it('isSelectionMode=true일 때 선택 버튼 클릭 시 false로 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} isSelectionMode={true} onSelectionModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '영역 선택' }));
			expect(handleChange).toHaveBeenCalledWith(false);
		});

		it('대칭 모드 버튼 3개를 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '대칭 모드 좌우' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '대칭 모드 상하' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '대칭 모드 양방향' })).toBeInTheDocument();
		});

		it('rotationalMode=none이면 모든 대칭 모드 버튼이 비활성(aria-pressed=false) 상태이다', () => {
			render(<Toolbar {...defaultProps} rotationalMode="none" />);
			expect(screen.getByRole('button', { name: '대칭 모드 좌우' })).toHaveAttribute('aria-pressed', 'false');
			expect(screen.getByRole('button', { name: '대칭 모드 상하' })).toHaveAttribute('aria-pressed', 'false');
			expect(screen.getByRole('button', { name: '대칭 모드 양방향' })).toHaveAttribute('aria-pressed', 'false');
		});

		it('rotationalMode=horizontal이면 좌우 버튼만 활성(aria-pressed=true) 상태이다', () => {
			render(<Toolbar {...defaultProps} rotationalMode="horizontal" />);
			expect(screen.getByRole('button', { name: '대칭 모드 좌우' })).toHaveAttribute('aria-pressed', 'true');
			expect(screen.getByRole('button', { name: '대칭 모드 상하' })).toHaveAttribute('aria-pressed', 'false');
		});

		it('좌우 버튼 클릭 시 onRotationalModeChange를 horizontal로 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} rotationalMode="none" onRotationalModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '대칭 모드 좌우' }));
			expect(handleChange).toHaveBeenCalledWith('horizontal');
		});

		it('활성화된 좌우 버튼 클릭 시 onRotationalModeChange를 none으로 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} rotationalMode="horizontal" onRotationalModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '대칭 모드 좌우' }));
			expect(handleChange).toHaveBeenCalledWith('none');
		});

		it('상하 버튼 클릭 시 onRotationalModeChange를 vertical로 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} rotationalMode="none" onRotationalModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '대칭 모드 상하' }));
			expect(handleChange).toHaveBeenCalledWith('vertical');
		});

		it('양방향 버튼 클릭 시 onRotationalModeChange를 both로 호출한다', async () => {
			const handleChange = vi.fn();
			render(<Toolbar {...defaultProps} rotationalMode="none" onRotationalModeChange={handleChange} />);
			await userEvent.click(screen.getByRole('button', { name: '대칭 모드 양방향' }));
			expect(handleChange).toHaveBeenCalledWith('both');
		});

		it('onFitToScreen prop이 있을 때 "화면에 맞추기" 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} onFitToScreen={vi.fn()} />);
			expect(screen.getByRole('button', { name: '화면에 맞추기' })).toBeInTheDocument();
		});

		it('"화면에 맞추기" 버튼 클릭 시 onFitToScreen을 호출한다', async () => {
			const handleFitToScreen = vi.fn();
			render(<Toolbar {...defaultProps} onFitToScreen={handleFitToScreen} />);
			await userEvent.click(screen.getByRole('button', { name: '화면에 맞추기' }));
			expect(handleFitToScreen).toHaveBeenCalledTimes(1);
		});

		it('onFitToScreen prop이 없을 때 "화면에 맞추기" 버튼을 렌더링하지 않는다', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { onFitToScreen, ...propsWithoutFitToScreen } = defaultProps;
			render(<Toolbar {...propsWithoutFitToScreen} />);
			expect(screen.queryByRole('button', { name: '화면에 맞추기' })).not.toBeInTheDocument();
		});
		});
});
