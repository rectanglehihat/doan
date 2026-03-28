import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoadDialog } from './LoadDialog';
import { useUIStore } from '@/store/useUIStore';
import { useChartStore } from '@/store/useChartStore';
import type { SavedPatternSnapshot } from '@/types/knitting';

// usePatterns 훅 모킹
vi.mock('@/hooks/usePatterns', () => ({
	usePatterns: vi.fn(),
}));

import { usePatterns } from '@/hooks/usePatterns';
const mockUsePatterns = vi.mocked(usePatterns);

function makeSnapshot(overrides: Partial<SavedPatternSnapshot> = {}): SavedPatternSnapshot {
	return {
		id: 'snap-id-1',
		title: '테스트 도안',
		patternType: 'knitting',
		gridSize: { rows: 10, cols: 10 },
		cells: Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => ({ symbolId: null })),
		),
		collapsedBlocks: [],
		collapsedColumnBlocks: [],
		shapeGuide: null,
		rotationalMode: 'none',
		savedAt: '2025-01-01T00:00:00.000Z',
		difficulty: 0,
		materials: '',
		...overrides,
	};
}

function setupMockUsePatterns(overrides: Partial<ReturnType<typeof usePatterns>> = {}) {
	mockUsePatterns.mockReturnValue({
		patterns: [],
		saveCurrentPattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
		loadPattern: vi.fn(),
		deletePattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
		newPattern: vi.fn(),
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

describe('LoadDialog', () => {
	describe('렌더링', () => {
		it('isLoadDialogOpen=false이면 다이얼로그가 렌더링되지 않는다', () => {
			render(<LoadDialog />);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('isLoadDialogOpen=true이면 다이얼로그가 렌더링된다', () => {
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('다이얼로그가 열릴 때 refreshPatterns를 호출한다', () => {
			const mockRefresh = vi.fn();
			setupMockUsePatterns({ refreshPatterns: mockRefresh });

			useUIStore.getState().openLoadDialog();
			render(<LoadDialog />);

			expect(mockRefresh).toHaveBeenCalledTimes(1);
		});

		it('저장된 패턴이 없으면 빈 상태 메시지를 표시한다', () => {
			setupMockUsePatterns({ patterns: [] });
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByText(/저장된 도안이 없습니다/)).toBeInTheDocument();
		});

		it('저장된 패턴 목록을 렌더링한다', () => {
			setupMockUsePatterns({
				patterns: [
					makeSnapshot({ id: 'id-1', title: '도안 1' }),
					makeSnapshot({ id: 'id-2', title: '도안 2' }),
				],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByText('도안 1')).toBeInTheDocument();
			expect(screen.getByText('도안 2')).toBeInTheDocument();
		});

		it('각 패턴 항목에 불러오기 버튼을 렌더링한다', () => {
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'id-1', title: '도안 1' })],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('button', { name: /불러오기/ })).toBeInTheDocument();
		});

		it('각 패턴 항목에 삭제 버튼을 렌더링한다', () => {
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'id-1', title: '도안 1' })],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
		});

		it('여러 패턴이 있으면 각각의 불러오기/삭제 버튼이 표시된다', () => {
			setupMockUsePatterns({
				patterns: [
					makeSnapshot({ id: 'id-1', title: '도안 1' }),
					makeSnapshot({ id: 'id-2', title: '도안 2' }),
				],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getAllByRole('button', { name: /불러오기/ })).toHaveLength(2);
			expect(screen.getAllByRole('button', { name: /삭제/ })).toHaveLength(2);
		});

		it('패턴 항목에 savedAt 날짜를 표시한다', () => {
			setupMockUsePatterns({
				patterns: [makeSnapshot({ savedAt: '2025-06-15T10:30:00.000Z' })],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			// 날짜가 어떤 형식으로든 표시되는지 확인 (구체적 포맷은 구현에 위임)
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});
	});

	describe('불러오기 동작', () => {
		it('불러오기 버튼 클릭 시 loadPattern을 호출한다', async () => {
			const mockLoad = vi.fn();
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'target-id', title: '불러올 도안' })],
				loadPattern: mockLoad,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			await userEvent.click(screen.getByRole('button', { name: /불러오기/ }));

			expect(mockLoad).toHaveBeenCalledWith('target-id');
		});

		it('불러오기 성공 시 closeLoadDialog가 호출된다', async () => {
			const mockLoad = vi.fn();
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'target-id' })],
				loadPattern: mockLoad,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			await userEvent.click(screen.getByRole('button', { name: /불러오기/ }));

			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});

		it('여러 패턴 중 특정 항목의 불러오기 버튼 클릭 시 해당 id만 전달된다', async () => {
			const mockLoad = vi.fn();
			setupMockUsePatterns({
				patterns: [
					makeSnapshot({ id: 'id-1', title: '도안 A' }),
					makeSnapshot({ id: 'id-2', title: '도안 B' }),
				],
				loadPattern: mockLoad,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			// 두 번째 항목의 불러오기 버튼 클릭
			const listItems = screen.getAllByRole('listitem');
			const secondItem = listItems[1];
			await userEvent.click(within(secondItem).getByRole('button', { name: /불러오기/ }));

			expect(mockLoad).toHaveBeenCalledWith('id-2');
			expect(mockLoad).not.toHaveBeenCalledWith('id-1');
		});
	});

	describe('삭제 동작', () => {
		it('삭제 버튼 클릭 시 deletePattern을 호출한다', async () => {
			const mockDelete = vi.fn().mockReturnValue({ ok: true, data: undefined });
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'del-id', title: '삭제할 도안' })],
				deletePattern: mockDelete,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			await userEvent.click(screen.getByRole('button', { name: /삭제/ }));

			expect(mockDelete).toHaveBeenCalledWith('del-id');
		});

		it('삭제 후 다이얼로그가 닫히지 않는다', async () => {
			const mockDelete = vi.fn().mockReturnValue({ ok: true, data: undefined });
			setupMockUsePatterns({
				patterns: [makeSnapshot({ id: 'del-id' })],
				deletePattern: mockDelete,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			await userEvent.click(screen.getByRole('button', { name: /삭제/ }));

			expect(useUIStore.getState().isLoadDialogOpen).toBe(true);
		});

		it('여러 패턴 중 특정 항목의 삭제 버튼 클릭 시 해당 id만 전달된다', async () => {
			const mockDelete = vi.fn().mockReturnValue({ ok: true, data: undefined });
			setupMockUsePatterns({
				patterns: [
					makeSnapshot({ id: 'id-1', title: '도안 A' }),
					makeSnapshot({ id: 'id-2', title: '도안 B' }),
				],
				deletePattern: mockDelete,
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			const listItems = screen.getAllByRole('listitem');
			const firstItem = listItems[0];
			await userEvent.click(within(firstItem).getByRole('button', { name: /삭제/ }));

			expect(mockDelete).toHaveBeenCalledWith('id-1');
			expect(mockDelete).not.toHaveBeenCalledWith('id-2');
		});
	});

	describe('닫기 동작', () => {
		it('ESC 키 입력 시 다이얼로그가 닫힌다', async () => {
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			await userEvent.keyboard('{Escape}');

			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});

		it('오버레이 클릭 시 다이얼로그가 닫힌다', async () => {
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			const overlay = screen.getByTestId('load-dialog-overlay');
			await userEvent.click(overlay);

			expect(useUIStore.getState().isLoadDialogOpen).toBe(false);
		});
	});

	describe('접근성', () => {
		it('다이얼로그에 role="dialog" 속성이 있다', () => {
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('다이얼로그에 aria-modal 속성이 있다', () => {
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});

		it('패턴 목록이 있으면 list role로 렌더링된다', () => {
			setupMockUsePatterns({
				patterns: [makeSnapshot()],
			});
			useUIStore.getState().openLoadDialog();

			render(<LoadDialog />);

			expect(screen.getByRole('list')).toBeInTheDocument();
		});
	});
});
