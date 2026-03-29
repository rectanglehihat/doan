import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Konva from 'konva';
import { PdfPreview } from './PdfPreview';

const mockHandleExportPdf = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/hooks/usePdfExport', () => ({
  usePdfExport: vi.fn(() => ({
    isExporting: false,
    exportError: null,
    handleExportPdf: mockHandleExportPdf,
    clearError: mockClearError,
  })),
}));


const makeStageRef = (): React.RefObject<Konva.Stage | null> => ({
  current: null,
});

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  stageRef: makeStageRef(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PdfPreview', () => {
  describe('렌더링', () => {
    it('isOpen=false이면 컴포넌트가 렌더되지 않는다', () => {
      render(<PdfPreview {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('PDF 내보내기')).not.toBeInTheDocument();
    });

    it('isOpen=true이면 "PDF 내보내기" 텍스트가 보인다', () => {
      render(<PdfPreview {...defaultProps} isOpen={true} />);
      expect(screen.getByText('PDF 내보내기')).toBeInTheDocument();
    });

    it('"A4" 버튼이 렌더된다', () => {
      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'A4' })).toBeInTheDocument();
    });

    it('"Letter" 버튼이 렌더된다', () => {
      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Letter' })).toBeInTheDocument();
    });

    it('"세로" 방향 버튼이 렌더된다', () => {
      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: '세로' })).toBeInTheDocument();
    });

    it('"가로" 방향 버튼이 렌더된다', () => {
      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: '가로' })).toBeInTheDocument();
    });
  });

  describe('닫기 이벤트', () => {
    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const handleClose = vi.fn();
      render(<PdfPreview {...defaultProps} onClose={handleClose} />);
      await userEvent.click(screen.getByRole('button', { name: /취소/ }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('다운로드 버튼', () => {
    it('다운로드 버튼 클릭 시 handleExportPdf가 호출된다', async () => {
      render(<PdfPreview {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /다운로드/ }));
      expect(mockHandleExportPdf).toHaveBeenCalledTimes(1);
    });

    it('isExporting=true이면 다운로드 버튼이 disabled이다', async () => {
      const { usePdfExport } = await import('@/hooks/usePdfExport');
      vi.mocked(usePdfExport).mockReturnValue({
        isExporting: true,
        exportError: null,
        handleExportPdf: mockHandleExportPdf,
        clearError: mockClearError,
      });

      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('button', { name: /다운로드/ })).toBeDisabled();
    });

  });

  describe('에러 상태', () => {
    it('exportError="render_failed"이면 에러 메시지가 렌더된다', async () => {
      const { usePdfExport } = await import('@/hooks/usePdfExport');
      vi.mocked(usePdfExport).mockReturnValue({
        isExporting: false,
        exportError: 'render_failed',
        handleExportPdf: mockHandleExportPdf,
        clearError: mockClearError,
      });

      render(<PdfPreview {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
