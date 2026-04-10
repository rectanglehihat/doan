import JsPDF from 'jspdf';
import type Konva from 'konva';
import type { PdfOptions, PdfExportResult } from '@/types/knitting';

const DIFFICULTY_LABELS: Record<number, string> = {
  0: '없음',
  1: '매우 쉬움',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '매우 어려움',
};

const PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

const MARGIN = 15;

// Canvas header constants (pixels)
const HEADER_CANVAS_WIDTH = 1800;
const HEADER_FONT_TITLE = 36;
const HEADER_FONT_BODY = 24;
const HEADER_LINE_HEIGHT = 44;
const HEADER_PADDING_H = 28;
const HEADER_PADDING_V = 24;

export function formatDifficulty(value: number): string {
  return DIFFICULTY_LABELS[value] ?? '없음';
}

interface HeaderImage {
  dataURL: string;
  widthPx: number;
  heightPx: number;
}

/**
 * jsPDF 내장 폰트는 한글 글리프를 포함하지 않으므로,
 * 브라우저 Canvas 2D API(시스템 폰트)로 헤더 텍스트를 렌더링한 뒤
 * PNG 이미지로 PDF에 삽입한다.
 */
function buildHeaderImage(options: PdfOptions): HeaderImage | null {
  if (typeof document === 'undefined') return null;

  try {
    const STAR_COUNT = 5;
    const patternTypeLabel = options.patternType === 'knitting' ? '대바늘' : '코바늘';
    // 라인 수: 타이틀 + 난이도 + 뜨개 종류 + (준비물)
    const lineCount = 3 + (options.materials ? 1 : 0);

    const heightPx =
      HEADER_PADDING_V +
      HEADER_FONT_TITLE +
      HEADER_LINE_HEIGHT * (lineCount - 1) +
      HEADER_PADDING_V;

    const canvas = document.createElement('canvas');
    canvas.width = HEADER_CANVAS_WIDTH;
    canvas.height = heightPx;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, HEADER_CANVAS_WIDTH, heightPx);

    // 타이틀
    let y = HEADER_PADDING_V + HEADER_FONT_TITLE;
    ctx.font = `bold ${HEADER_FONT_TITLE}px sans-serif`;
    ctx.fillStyle = '#111111';
    ctx.fillText(options.title || '도안', HEADER_PADDING_H, y);

    ctx.font = `${HEADER_FONT_BODY}px sans-serif`;
    y += HEADER_LINE_HEIGHT - (HEADER_FONT_TITLE - HEADER_FONT_BODY) / 2 + 4;

    // 난이도: 레이블 + 별 (채워진 별 amber, 빈 별 zinc)
    const diffLabel = '난이도: ';
    ctx.fillStyle = '#111111';
    ctx.fillText(diffLabel, HEADER_PADDING_H, y);
    const labelWidth = ctx.measureText(diffLabel).width;

    const filledCount = Math.max(0, Math.min(STAR_COUNT, options.difficulty));
    const emptyCount = STAR_COUNT - filledCount;
    const filledStr = '★'.repeat(filledCount);
    const emptyStr = '★'.repeat(emptyCount);

    if (filledCount > 0) {
      ctx.fillStyle = '#f59e0b'; // amber-400
      ctx.fillText(filledStr, HEADER_PADDING_H + labelWidth, y);
    }
    const filledWidth = filledCount > 0 ? ctx.measureText(filledStr).width : 0;
    if (emptyCount > 0) {
      ctx.fillStyle = '#d4d4d8'; // zinc-300
      ctx.fillText(emptyStr, HEADER_PADDING_H + labelWidth + filledWidth, y);
    }

    y += HEADER_LINE_HEIGHT;

    // 뜨개 종류
    ctx.fillStyle = '#111111';
    ctx.fillText(`뜨개 종류: ${patternTypeLabel}`, HEADER_PADDING_H, y);
    y += HEADER_LINE_HEIGHT;

    // 준비물
    if (options.materials) {
      ctx.fillText(`준비물: ${options.materials}`, HEADER_PADDING_H, y);
    }

    const dataURL = canvas.toDataURL('image/png');
    return dataURL ? { dataURL, widthPx: HEADER_CANVAS_WIDTH, heightPx } : null;
  } catch {
    return null;
  }
}

async function captureHtmlElement(el: HTMLElement): Promise<{ dataURL: string; widthPx: number; heightPx: number } | null> {
  if (typeof document === 'undefined') return null;
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(el);
    const dataURL = canvas.toDataURL('image/png');
    return dataURL ? { dataURL, widthPx: canvas.width, heightPx: canvas.height } : null;
  } catch {
    return null;
  }
}

export async function exportChartToPdf(
  stage: Konva.Stage,
  options: PdfOptions,
  labelBarEl?: HTMLElement | null,
): Promise<PdfExportResult> {
  try {
    const dataURL = stage.toDataURL({ pixelRatio: 2 });

    if (!dataURL) {
      return { ok: false, error: 'canvas_not_ready' };
    }

    const pageDimensions = PAGE_DIMENSIONS[options.pageSize];
    const isLandscape = options.orientation === 'landscape';

    const pageWidth = isLandscape ? pageDimensions.height : pageDimensions.width;
    const pageHeight = isLandscape ? pageDimensions.width : pageDimensions.height;

    const doc = new JsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    const usableWidth = pageWidth - MARGIN * 2;
    let currentY = MARGIN;

    if (options.includeHeader) {
      const headerImage = buildHeaderImage(options);
      if (headerImage) {
        const headerHeightMm = (headerImage.heightPx / headerImage.widthPx) * usableWidth;
        doc.addImage(headerImage.dataURL, 'PNG', MARGIN, currentY, usableWidth, headerHeightMm);
        currentY += headerHeightMm + 4;
      }
    }

    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const imageWidth = usableWidth;
    const imageHeight = (stageHeight / stageWidth) * imageWidth;

    doc.addImage(dataURL, 'PNG', MARGIN, currentY, imageWidth, imageHeight);
    currentY += imageHeight;

    if (labelBarEl) {
      const labelCapture = await captureHtmlElement(labelBarEl);
      if (labelCapture) {
        const labelHeightMm = (labelCapture.heightPx / labelCapture.widthPx) * usableWidth;
        doc.addImage(labelCapture.dataURL, 'PNG', MARGIN, currentY, usableWidth, labelHeightMm);
      }
    }

    const fileName = `${options.title || '도안'}_${Date.now()}.pdf`;
    doc.save(fileName);

    return { ok: true, fileName };
  } catch {
    return { ok: false, error: 'render_failed' };
  }
}
