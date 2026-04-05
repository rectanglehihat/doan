import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { EditorClient } from './EditorClient';

// Konva 기반 컴포넌트는 jsdom에서 렌더링 불가 → mock으로 대체
vi.mock('@/components/editor/ChartCanvas', () => ({
  ChartCanvas: () => <div data-testid="chart-canvas" />,
}));

vi.mock('@/components/editor/EditorSidebar', () => ({
  EditorSidebar: () => <div data-testid="editor-sidebar" />,
}));

vi.mock('@/components/editor/LoadDialog', () => ({
  LoadDialog: () => <div data-testid="load-dialog" />,
}));

beforeEach(() => {
  useChartStore.getState().reset();
  useUIStore.getState().reset();
});

describe('EditorClient', () => {
  it('마운트 시 주요 영역이 렌더링된다', () => {
    render(<EditorClient />);

    // Toolbar 버튼으로 존재 확인
    expect(screen.getByRole('button', { name: '실행 취소' })).toBeInTheDocument();
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
  });

  it('초기 상태에서 리셋 다이얼로그가 렌더링되지 않는다', () => {
    render(<EditorClient />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('새 도안 버튼 클릭 시 리셋 다이얼로그가 열린다', async () => {
    render(<EditorClient />);

    await userEvent.click(screen.getByRole('button', { name: '새 도안' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('모든 셀 데이터가 삭제됩니다. 초기화하시겠습니까?')).toBeInTheDocument();
  });

  it('리셋 다이얼로그에서 취소 클릭 시 다이얼로그가 닫힌다', async () => {
    render(<EditorClient />);

    await userEvent.click(screen.getByRole('button', { name: '새 도안' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('리셋 다이얼로그에서 초기화 클릭 시 다이얼로그가 닫힌다', async () => {
    render(<EditorClient />);

    await userEvent.click(screen.getByRole('button', { name: '새 도안' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('LoadDialog가 렌더링된다', () => {
    render(<EditorClient />);

    expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
  });
});
