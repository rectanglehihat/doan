import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Konva from 'konva';
import type { PdfExportResult } from '@/types/knitting';
import { usePdfExport } from './usePdfExport';

vi.mock('@/lib/utils/export-pdf', () => ({
  exportChartToPdf: vi.fn(),
}));

vi.mock('@/store/useChartStore', () => ({
  useChartStore: vi.fn(() => ({
    patternTitle: '테스트 도안',
    difficulty: 3,
    materials: '메리노 울',
    patternType: 'knitting',
  })),
}));

const makeStageRef = (
  stage: Konva.Stage | null = null,
): React.RefObject<Konva.Stage | null> => ({ current: stage });

const makeMockStage = (): Konva.Stage =>
  ({ toDataURL: vi.fn() } as unknown as Konva.Stage);

const defaultOptions = {
  pageSize: 'A4' as const,
  orientation: 'portrait' as const,
  includeHeader: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePdfExport', () => {
  it('초기 상태에서 isExporting은 false이다', () => {
    const { result } = renderHook(() => usePdfExport());
    expect(result.current.isExporting).toBe(false);
  });

  it('초기 상태에서 exportError는 null이다', () => {
    const { result } = renderHook(() => usePdfExport());
    expect(result.current.exportError).toBeNull();
  });

  it('handleExportPdf 호출 중 isExporting이 true로 설정된다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);

    let resolveExport!: (value: PdfExportResult) => void;
    mockExport.mockReturnValue(
      new Promise<PdfExportResult>((resolve) => {
        resolveExport = resolve;
      }),
    );

    const stageRef = makeStageRef(makeMockStage());
    const { result } = renderHook(() => usePdfExport());

    act(() => {
      void result.current.handleExportPdf(stageRef, defaultOptions);
    });

    await waitFor(() => {
      expect(result.current.isExporting).toBe(true);
    });

    await act(async () => {
      resolveExport({ ok: true, fileName: 'done.pdf' });
    });
  });

  it('exportChartToPdf가 { ok: true }를 반환하면 isExporting이 false로 복귀한다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);
    const successResult: PdfExportResult = { ok: true, fileName: 'test.pdf' };
    mockExport.mockResolvedValue(successResult);

    const stageRef = makeStageRef(makeMockStage());
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      await result.current.handleExportPdf(stageRef, defaultOptions);
    });

    expect(result.current.isExporting).toBe(false);
  });

  it('exportChartToPdf가 { ok: true }를 반환하면 exportError는 null이다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);
    const successResult: PdfExportResult = { ok: true, fileName: 'test.pdf' };
    mockExport.mockResolvedValue(successResult);

    const stageRef = makeStageRef(makeMockStage());
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      await result.current.handleExportPdf(stageRef, defaultOptions);
    });

    expect(result.current.exportError).toBeNull();
  });

  it('exportChartToPdf가 { ok: false, error: "render_failed" }를 반환하면 exportError가 "render_failed"로 설정된다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);
    const failResult: PdfExportResult = { ok: false, error: 'render_failed' };
    mockExport.mockResolvedValue(failResult);

    const stageRef = makeStageRef(makeMockStage());
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      await result.current.handleExportPdf(stageRef, defaultOptions);
    });

    expect(result.current.exportError).toBe('render_failed');
  });

  it('stageRef.current가 null이면 exportChartToPdf를 호출하지 않고 exportError를 "canvas_not_ready"로 설정한다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);

    const stageRef = makeStageRef(null);
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      await result.current.handleExportPdf(stageRef, defaultOptions);
    });

    expect(mockExport).not.toHaveBeenCalled();
    expect(result.current.exportError).toBe('canvas_not_ready');
  });

  it('clearError 호출 시 exportError가 null로 초기화된다', async () => {
    const { exportChartToPdf } = await import('@/lib/utils/export-pdf');
    const mockExport = vi.mocked(exportChartToPdf);
    const failResult: PdfExportResult = { ok: false, error: 'render_failed' };
    mockExport.mockResolvedValue(failResult);

    const stageRef = makeStageRef(makeMockStage());
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      await result.current.handleExportPdf(stageRef, defaultOptions);
    });

    expect(result.current.exportError).toBe('render_failed');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.exportError).toBeNull();
  });
});
