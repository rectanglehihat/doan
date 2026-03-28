import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorSidebar } from './EditorSidebar';
import { useChartStore } from '@/store/useChartStore';

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
		newPattern: vi.fn(),
		refreshPatterns: vi.fn(),
		isAutoSaving: false,
		currentPatternId: null,
		...overrides,
	});
}

beforeEach(() => {
	useChartStore.getState().reset();
	vi.clearAllMocks();
	setupMockUsePatterns();
});

describe('EditorSidebar', () => {
	it('준비물 섹션을 렌더링한다', () => {
		render(<EditorSidebar />);
		expect(screen.getByText('준비물')).toBeInTheDocument();
	});

	it('준비물 textarea가 렌더링된다', () => {
		render(<EditorSidebar />);
		expect(screen.getByPlaceholderText('사용할 실, 바늘, 부자재 등을 적어주세요')).toBeInTheDocument();
	});

	it('도안명이 비어있으면 저장 버튼이 비활성화된다', () => {
		render(<EditorSidebar />);
		expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled();
	});

	it('도안명을 입력하면 저장 버튼이 활성화된다', async () => {
		render(<EditorSidebar />);
		await userEvent.type(screen.getByPlaceholderText('도안 제목을 입력하세요'), '테스트 도안');
		expect(screen.getByRole('button', { name: /저장/ })).not.toBeDisabled();
	});

	it('저장 버튼 클릭 시 saveCurrentPattern을 호출한다', async () => {
		const mockSave = vi.fn().mockReturnValue({ ok: true, data: undefined });
		setupMockUsePatterns({ saveCurrentPattern: mockSave });

		render(<EditorSidebar />);
		await userEvent.type(screen.getByPlaceholderText('도안 제목을 입력하세요'), '테스트 도안');
		await userEvent.click(screen.getByRole('button', { name: /저장/ }));

		expect(mockSave).toHaveBeenCalledWith('테스트 도안');
	});

	it('저장 성공 시 newPattern을 호출한다', async () => {
		const mockNew = vi.fn();
		setupMockUsePatterns({
			saveCurrentPattern: vi.fn().mockReturnValue({ ok: true, data: undefined }),
			newPattern: mockNew,
		});

		render(<EditorSidebar />);
		await userEvent.type(screen.getByPlaceholderText('도안 제목을 입력하세요'), '테스트 도안');
		await userEvent.click(screen.getByRole('button', { name: /저장/ }));

		expect(mockNew).toHaveBeenCalledTimes(1);
	});

	it('limit_reached 에러 시 에러 메시지를 표시한다', async () => {
		setupMockUsePatterns({
			saveCurrentPattern: vi.fn().mockReturnValue({ ok: false, error: 'limit_reached' }),
		});

		render(<EditorSidebar />);
		await userEvent.type(screen.getByPlaceholderText('도안 제목을 입력하세요'), '테스트 도안');
		await userEvent.click(screen.getByRole('button', { name: /저장/ }));

		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it('limit_reached 에러 표시 중 패턴이 로드되면 에러 메시지가 사라진다', async () => {
		setupMockUsePatterns({
			saveCurrentPattern: vi.fn().mockReturnValue({ ok: false, error: 'limit_reached' }),
			currentPatternId: null,
		});

		const { rerender } = render(<EditorSidebar />);
		await userEvent.type(screen.getByPlaceholderText('도안 제목을 입력하세요'), '테스트 도안');
		await userEvent.click(screen.getByRole('button', { name: /저장/ }));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		setupMockUsePatterns({ currentPatternId: 'loaded-pattern-id' });
		rerender(<EditorSidebar />);

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});
});
