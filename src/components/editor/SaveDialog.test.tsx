import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveDialog } from './SaveDialog';
import { useUIStore } from '@/store/useUIStore';
import { useChartStore } from '@/store/useChartStore';

// usePatterns 훅 모킹
vi.mock('@/hooks/usePatterns', () => ({
	usePatterns: vi.fn(),
}));

import { usePatterns } from '@/hooks/usePatterns';
const mockUsePatterns = vi.mocked(usePatterns);

function setupMockUsePatterns(overrides: Partial<ReturnType<typeof usePatterns>> = {}) {
	mockUsePatterns.mockReturnValue({
		patterns: [],
		saveCurrentPattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
		loadPattern: vi.fn(),
		deletePattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
		refreshPatterns: vi.fn(),
		isAutoSaving: false,
		currentPatternId: null,
		...overrides,
	});
}

beforeEach(() => {
	useUIStore.getState().reset();
	useChartStore.getState().reset();
	vi.clearAllMocks();
	setupMockUsePatterns();
});

describe('SaveDialog', () => {
	describe('렌더링', () => {
		it('isSaveDialogOpen=false이면 다이얼로그가 렌더링되지 않는다', () => {
			render(<SaveDialog />);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('isSaveDialogOpen=true이면 다이얼로그가 렌더링된다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('도안명 입력 필드를 렌더링한다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('저장 버튼을 렌더링한다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument();
		});

		it('취소 버튼을 렌더링한다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('button', { name: /취소/ })).toBeInTheDocument();
		});
	});

	describe('저장 동작', () => {
		it('도안명을 입력하고 저장 버튼을 클릭하면 saveCurrentPattern을 호출한다', async () => {
			const mockSave = vi.fn().mockReturnValue({ ok: true, data: undefined });
			setupMockUsePatterns({ saveCurrentPattern: mockSave });
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.type(screen.getByRole('textbox'), '여름 조끼 도안');
			await userEvent.click(screen.getByRole('button', { name: /저장/ }));

			expect(mockSave).toHaveBeenCalledWith('여름 조끼 도안');
		});

		it('저장 성공 시 closeSaveDialog를 호출해 다이얼로그가 닫힌다', async () => {
			setupMockUsePatterns({
				saveCurrentPattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
			});
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.type(screen.getByRole('textbox'), '도안 제목');
			await userEvent.click(screen.getByRole('button', { name: /저장/ }));

			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});

		it('도안명이 비어있으면 저장 버튼이 비활성화된다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled();
		});

		it('limit_reached 에러 시 에러 메시지를 표시한다', async () => {
			setupMockUsePatterns({
				saveCurrentPattern: vi.fn().mockReturnValue({ ok: false, error: 'limit_reached' }),
			});
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.type(screen.getByRole('textbox'), '11번째 도안');
			await userEvent.click(screen.getByRole('button', { name: /저장/ }));

			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('limit_reached 에러 시 다이얼로그가 닫히지 않는다', async () => {
			setupMockUsePatterns({
				saveCurrentPattern: vi.fn().mockReturnValue({ ok: false, error: 'limit_reached' }),
			});
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.type(screen.getByRole('textbox'), '11번째 도안');
			await userEvent.click(screen.getByRole('button', { name: /저장/ }));

			expect(useUIStore.getState().isSaveDialogOpen).toBe(true);
		});
	});

	describe('닫기 동작', () => {
		it('취소 버튼 클릭 시 closeSaveDialog가 호출된다', async () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.click(screen.getByRole('button', { name: /취소/ }));

			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});

		it('ESC 키 입력 시 다이얼로그가 닫힌다', async () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			await userEvent.keyboard('{Escape}');

			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});

		it('오버레이 클릭 시 다이얼로그가 닫힌다', async () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			// 다이얼로그 바깥 오버레이 클릭
			const overlay = screen.getByTestId('save-dialog-overlay');
			await userEvent.click(overlay);

			expect(useUIStore.getState().isSaveDialogOpen).toBe(false);
		});
	});

	describe('접근성', () => {
		it('다이얼로그에 role="dialog" 속성이 있다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('다이얼로그에 aria-modal 속성이 있다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});

		it('다이얼로그가 열릴 때 입력 필드에 포커스가 이동한다', () => {
			useUIStore.getState().openSaveDialog();

			render(<SaveDialog />);

			expect(screen.getByRole('textbox')).toHaveFocus();
		});
	});
});
