import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Konva from 'konva';
import type { PdfExportResult } from '@/types/knitting';
import { formatDifficulty, exportChartToPdf } from './export-pdf';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,labelbar'),
    width: 800,
    height: 60,
  }),
}));

vi.mock('jspdf', () => {
  function MockJsPDF(this: Record<string, unknown>) {
    this.setFontSize = vi.fn();
    this.setFont = vi.fn();
    this.text = vi.fn();
    this.addImage = vi.fn();
    this.save = vi.fn();
    this.splitTextToSize = vi.fn().mockReturnValue(['준비물 텍스트']);
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
  }
  return { default: vi.fn().mockImplementation(MockJsPDF) };
});

const makeMockStage = (overrides?: {
  dataURL?: string;
  throwOnDataURL?: boolean;
}): Konva.Stage => {
  const toDataURL = overrides?.throwOnDataURL
    ? vi.fn().mockImplementation(() => { throw new Error('render error'); })
    : vi.fn().mockReturnValue(overrides?.dataURL ?? 'data:image/png;base64,abc');

  return {
    toDataURL,
    width: vi.fn().mockReturnValue(800),
    height: vi.fn().mockReturnValue(600),
  } as unknown as Konva.Stage;
};

describe('formatDifficulty', () => {
  it('0이면 "없음"을 반환한다', () => {
    expect(formatDifficulty(0)).toBe('없음');
  });

  it('1이면 "매우 쉬움"을 반환한다', () => {
    expect(formatDifficulty(1)).toBe('매우 쉬움');
  });

  it('2이면 "쉬움"을 반환한다', () => {
    expect(formatDifficulty(2)).toBe('쉬움');
  });

  it('3이면 "보통"을 반환한다', () => {
    expect(formatDifficulty(3)).toBe('보통');
  });

  it('4이면 "어려움"을 반환한다', () => {
    expect(formatDifficulty(4)).toBe('어려움');
  });

  it('5이면 "매우 어려움"을 반환한다', () => {
    expect(formatDifficulty(5)).toBe('매우 어려움');
  });

  it('음수이면 "없음"을 반환한다', () => {
    expect(formatDifficulty(-1)).toBe('없음');
  });

  it('6 이상이면 "없음"을 반환한다', () => {
    expect(formatDifficulty(6)).toBe('없음');
  });
});

describe('exportChartToPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stage.toDataURL()이 빈 문자열이면 { ok: false, error: "canvas_not_ready" }를 반환한다', async () => {
    const stage = makeMockStage({ dataURL: '' });
    const result: PdfExportResult = await exportChartToPdf(stage, {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      title: '테스트 도안',
      difficulty: 3,
      materials: '메리노 울',
      patternType: 'knitting',
    });
    expect(result).toEqual({ ok: false, error: 'canvas_not_ready' });
  });

  it('정상 경로에서 { ok: true }를 반환한다', async () => {
    const stage = makeMockStage();
    const result: PdfExportResult = await exportChartToPdf(stage, {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      title: '테스트 도안',
      difficulty: 3,
      materials: '메리노 울',
      patternType: 'knitting',
    });
    expect(result.ok).toBe(true);
  });

  it('반환된 fileName에 patternTitle이 포함된다', async () => {
    const stage = makeMockStage();
    const result: PdfExportResult = await exportChartToPdf(stage, {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      title: '나의 도안',
      difficulty: 2,
      materials: '코튼 얀',
      patternType: 'knitting',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fileName).toContain('나의 도안');
    }
  });

  it('stage.toDataURL()이 throw하면 { ok: false, error: "render_failed" }를 반환한다', async () => {
    const stage = makeMockStage({ throwOnDataURL: true });
    const result: PdfExportResult = await exportChartToPdf(stage, {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      title: '테스트 도안',
      difficulty: 1,
      materials: '',
      patternType: 'crochet',
    });
    expect(result).toEqual({ ok: false, error: 'render_failed' });
  });

  it('labelBarEl이 제공되지 않으면 html2canvas를 호출하지 않는다', async () => {
    const { default: html2canvas } = await import('html2canvas');
    const mockHtml2canvas = vi.mocked(html2canvas);

    const stage = makeMockStage();
    await exportChartToPdf(stage, {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      title: '테스트 도안',
      difficulty: 2,
      materials: '',
      patternType: 'knitting',
    });

    expect(mockHtml2canvas).not.toHaveBeenCalled();
  });

  it('labelBarEl이 HTMLElement로 제공되면 html2canvas를 호출해 결과를 addImage에 추가한다', async () => {
    const { default: html2canvas } = await import('html2canvas');
    const mockHtml2canvas = vi.mocked(html2canvas);

    const { default: JsPDF } = await import('jspdf');
    const MockJsPDFCtor = vi.mocked(JsPDF);

    const stage = makeMockStage();
    const labelBarEl = document.createElement('div');

    await exportChartToPdf(
      stage,
      {
        pageSize: 'A4',
        orientation: 'portrait',
        includeHeader: true,
        title: '테스트 도안',
        difficulty: 2,
        materials: '',
        patternType: 'knitting',
      },
      labelBarEl,
    );

    expect(mockHtml2canvas).toHaveBeenCalledWith(labelBarEl);

    const mockInstance = MockJsPDFCtor.mock.results[0].value as {
      addImage: ReturnType<typeof vi.fn>;
    };
    expect(mockInstance.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,labelbar',
      'PNG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('html2canvas가 실패해도 { ok: true }로 graceful degradation한다', async () => {
    const { default: html2canvas } = await import('html2canvas');
    const mockHtml2canvas = vi.mocked(html2canvas);
    mockHtml2canvas.mockRejectedValueOnce(new Error('html2canvas error'));

    const stage = makeMockStage();
    const labelBarEl = document.createElement('div');

    const result: PdfExportResult = await exportChartToPdf(
      stage,
      {
        pageSize: 'A4',
        orientation: 'portrait',
        includeHeader: true,
        title: '테스트 도안',
        difficulty: 2,
        materials: '',
        patternType: 'knitting',
      },
      labelBarEl,
    );

    expect(result.ok).toBe(true);
  });
});
