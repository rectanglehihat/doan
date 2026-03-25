import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';

const defaultProps = {
	canUndo: false,
	canRedo: false,
	onUndo: vi.fn(),
	onRedo: vi.fn(),
	onReset: vi.fn(),
	symmetryMode: 'none' as const,
	onSymmetryChange: vi.fn(),
	isShapeGuideDrawMode: false,
	onShapeGuideDrawModeChange: vi.fn(),
	isShapeGuideEraseMode: false,
	onShapeGuideEraseModeChange: vi.fn(),
	hasShapeGuide: false,
	onShapeGuideClear: vi.fn(),
	isSelectionMode: false,
	onSelectionModeChange: vi.fn(),
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

		it('대칭 모드 버튼 4개를 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '대칭 없음' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '대칭 좌우' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '대칭 상하' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '대칭 양방향' })).toBeInTheDocument();
		});

		it('현재 symmetryMode 버튼이 선택(aria-pressed) 상태이다', () => {
			render(<Toolbar {...defaultProps} symmetryMode="horizontal" />);
			expect(screen.getByRole('button', { name: '대칭 좌우' })).toHaveAttribute('aria-pressed', 'true');
			expect(screen.getByRole('button', { name: '대칭 없음' })).toHaveAttribute('aria-pressed', 'false');
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

		it('대칭 모드 버튼 클릭 시 onSymmetryChange를 해당 모드로 호출한다', async () => {
			const handleSymmetryChange = vi.fn();
			render(<Toolbar {...defaultProps} onSymmetryChange={handleSymmetryChange} />);
			await userEvent.click(screen.getByRole('button', { name: '대칭 좌우' }));
			expect(handleSymmetryChange).toHaveBeenCalledWith('horizontal');
		});

		it('초기화 버튼 클릭 시 onReset을 호출한다', async () => {
			const handleReset = vi.fn();
			render(<Toolbar {...defaultProps} onReset={handleReset} />);
			await userEvent.click(screen.getByRole('button', { name: '도안 초기화' }));
			expect(handleReset).toHaveBeenCalledTimes(1);
		});

		it('형태선 그리기 버튼을 렌더링한다', () => {
			render(<Toolbar {...defaultProps} />);
			expect(screen.getByRole('button', { name: '형태선 그리기' })).toBeInTheDocument();
		});

		it('hasShapeGuide=false이면 지우개, 전체 지우기 버튼이 없다', () => {
			render(<Toolbar {...defaultProps} hasShapeGuide={false} />);
			expect(screen.queryByRole('button', { name: '형태선 지우개' })).not.toBeInTheDocument();
			expect(screen.queryByRole('button', { name: '형태선 전체 지우기' })).not.toBeInTheDocument();
		});

		it('hasShapeGuide=true이면 지우개 버튼이 표시된다', () => {
			render(<Toolbar {...defaultProps} hasShapeGuide={true} />);
			expect(screen.getByRole('button', { name: '형태선 지우개' })).toBeInTheDocument();
		});

		it('hasShapeGuide=true이면 전체 지우기 버튼이 표시된다', () => {
			render(<Toolbar {...defaultProps} hasShapeGuide={true} />);
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
			render(<Toolbar {...defaultProps} hasShapeGuide={true} isShapeGuideEraseMode={false} onShapeGuideEraseModeChange={handleEraseModeChange} />);
			await userEvent.click(screen.getByRole('button', { name: '형태선 지우개' }));
			expect(handleEraseModeChange).toHaveBeenCalledWith(true);
		});

		it('isShapeGuideEraseMode=true이면 지우개 버튼이 활성(aria-pressed) 상태이다', () => {
			render(<Toolbar {...defaultProps} hasShapeGuide={true} isShapeGuideEraseMode={true} />);
			expect(screen.getByRole('button', { name: '형태선 지우개' })).toHaveAttribute('aria-pressed', 'true');
		});

		it('전체 지우기 버튼 클릭 시 onShapeGuideClear를 호출한다', async () => {
			const handleClear = vi.fn();
			render(<Toolbar {...defaultProps} hasShapeGuide={true} onShapeGuideClear={handleClear} />);
			await userEvent.click(screen.getByRole('button', { name: '형태선 전체 지우기' }));
			expect(handleClear).toHaveBeenCalledTimes(1);
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
	});
});
