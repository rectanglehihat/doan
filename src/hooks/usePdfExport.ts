'use client';

import { useState, useCallback } from 'react';
import type React from 'react';
import type Konva from 'konva';
import { useShallow } from 'zustand/react/shallow';
import { exportChartToPdf } from '@/lib/utils/export-pdf';
import { useChartStore } from '@/store/useChartStore';
import type { PdfOptions, PdfExportResult } from '@/types/knitting';

type ExportError = 'canvas_not_ready' | 'render_failed' | 'unknown';

interface UsePdfExportReturn {
  isExporting: boolean;
  exportError: ExportError | null;
  handleExportPdf: (
    stageRef: React.RefObject<Konva.Stage | null>,
    options: Pick<PdfOptions, 'pageSize' | 'orientation' | 'includeHeader'>,
    labelBarRef?: React.RefObject<HTMLDivElement | null>,
  ) => Promise<void>;
  clearError: () => void;
}

export function usePdfExport(): UsePdfExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<ExportError | null>(null);

  const { patternTitle, difficulty, materials, patternType } = useChartStore(
    useShallow((s) => ({
      patternTitle: s.patternTitle,
      difficulty: s.difficulty,
      materials: s.materials,
      patternType: s.patternType,
    })),
  );

  const handleExportPdf = useCallback(
    async (
      stageRef: React.RefObject<Konva.Stage | null>,
      options: Pick<PdfOptions, 'pageSize' | 'orientation' | 'includeHeader'>,
      labelBarRef?: React.RefObject<HTMLDivElement | null>,
    ): Promise<void> => {
      if (stageRef.current === null) {
        setExportError('canvas_not_ready');
        return;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const fullOptions: PdfOptions = {
          ...options,
          title: patternTitle,
          difficulty,
          materials,
          patternType,
        };

        const result: PdfExportResult = await exportChartToPdf(
          stageRef.current,
          fullOptions,
          labelBarRef?.current ?? null,
        );

        if (!result.ok) {
          setExportError(result.error);
        }
      } finally {
        setIsExporting(false);
      }
    },
    [patternTitle, difficulty, materials, patternType],
  );

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportError,
    handleExportPdf,
    clearError,
  };
}
