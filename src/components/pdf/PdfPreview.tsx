'use client';

import { useState, useCallback } from 'react';
import type React from 'react';
import type Konva from 'konva';
import { Button } from '@/components/ui/atoms/Button';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { PdfPageSize, PdfOrientation } from '@/types/knitting';

interface PdfPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  labelBarRef?: React.RefObject<HTMLDivElement | null>;
}

type ExportError = 'canvas_not_ready' | 'render_failed' | 'unknown';

const ERROR_MESSAGES: Record<ExportError, string> = {
  canvas_not_ready: '캔버스를 찾을 수 없습니다.',
  render_failed: 'PDF 생성 중 오류가 발생했습니다.',
  unknown: '알 수 없는 오류가 발생했습니다.',
};

interface ExportErrorAlertProps {
  error: string;
}

function ExportErrorAlert({ error }: ExportErrorAlertProps) {
  const message =
    error in ERROR_MESSAGES
      ? ERROR_MESSAGES[error as ExportError]
      : ERROR_MESSAGES.unknown;

  return (
    <p role="alert" className="text-red-500 text-sm">
      {message}
    </p>
  );
}

export function PdfPreview({ isOpen, onClose, stageRef, labelBarRef }: PdfPreviewProps) {
  const [pageSize, setPageSize] = useState<PdfPageSize>('A4');
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait');

  const { isExporting, exportError, handleExportPdf, clearError } = usePdfExport();

  const handleClose = useCallback(() => {
    clearError();
    onClose();
  }, [clearError, onClose]);

  const handleDownload = useCallback(async () => {
    await handleExportPdf(stageRef, { pageSize, orientation, includeHeader: true }, labelBarRef);
  }, [handleExportPdf, stageRef, pageSize, orientation, labelBarRef]);

  const handleSelectA4 = useCallback(() => {
    setPageSize('A4');
  }, []);

  const handleSelectLetter = useCallback(() => {
    setPageSize('Letter');
  }, []);

  const handleSelectPortrait = useCallback(() => {
    setOrientation('portrait');
  }, []);

  const handleSelectLandscape = useCallback(() => {
    setOrientation('landscape');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
        className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
      >
        <h2 id="pdf-preview-title" className="text-sm font-semibold text-zinc-800 mb-4">
          PDF 내보내기
        </h2>

        <div className="flex flex-col gap-4 mb-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">페이지 크기</p>
            <div className="flex gap-2">
              <Button
                variant={pageSize === 'A4' ? 'default' : 'outline'}
                size="sm"
                onClick={handleSelectA4}
              >
                A4
              </Button>
              <Button
                variant={pageSize === 'Letter' ? 'default' : 'outline'}
                size="sm"
                onClick={handleSelectLetter}
              >
                Letter
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">방향</p>
            <div className="flex gap-2">
              <Button
                variant={orientation === 'portrait' ? 'default' : 'outline'}
                size="sm"
                onClick={handleSelectPortrait}
              >
                세로
              </Button>
              <Button
                variant={orientation === 'landscape' ? 'default' : 'outline'}
                size="sm"
                onClick={handleSelectLandscape}
              >
                가로
              </Button>
            </div>
          </div>

        </div>

        {exportError !== null && <ExportErrorAlert error={exportError} />}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isExporting}
            onClick={handleDownload}
          >
            다운로드
          </Button>
        </div>
      </div>
    </div>
  );
}
