import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { CollapsedColumnBlock } from '@/types/knitting';
import { ColumnSectionLabelBar } from './ColumnSectionLabelBar';

describe('ColumnSectionLabelBar', () => {
  it('collapsedColumnBlocks가 빈 배열이면 null을 반환한다', () => {
    const { container } = render(
      <ColumnSectionLabelBar collapsedColumnBlocks={[]} totalCols={20} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('collapsedColumnBlocks가 있으면 컨테이너 div를 렌더링한다', () => {
    const blocks: CollapsedColumnBlock[] = [
      { id: 'block-1', startCol: 4, endCol: 14 },
    ];
    const { container } = render(
      <ColumnSectionLabelBar collapsedColumnBlocks={blocks} totalCols={20} />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('각 중략 블록의 범위 레이블을 표시한다', () => {
    const blocks: CollapsedColumnBlock[] = [
      { id: 'block-1', startCol: 4, endCol: 14 },
    ];
    render(
      <ColumnSectionLabelBar collapsedColumnBlocks={blocks} totalCols={20} />,
    );
    expect(screen.getByText('5~15열 중략')).toBeInTheDocument();
  });

  it('totalCols=20, startCol=4, endCol=14이면 "5~15열 중략"을 표시한다', () => {
    const blocks: CollapsedColumnBlock[] = [
      { id: 'block-a', startCol: 4, endCol: 14 },
    ];
    render(
      <ColumnSectionLabelBar collapsedColumnBlocks={blocks} totalCols={20} />,
    );
    expect(screen.getByText('5~15열 중략')).toBeInTheDocument();
  });

  it('containerRef가 전달되면 div에 ref가 연결된다', () => {
    const blocks: CollapsedColumnBlock[] = [
      { id: 'block-1', startCol: 0, endCol: 4 },
    ];
    const containerRef = React.createRef<HTMLDivElement>();
    render(
      <ColumnSectionLabelBar
        collapsedColumnBlocks={blocks}
        totalCols={10}
        containerRef={containerRef}
      />,
    );
    expect(containerRef.current).not.toBeNull();
    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('여러 개의 collapsedColumnBlocks가 있으면 모두 표시한다', () => {
    const blocks: CollapsedColumnBlock[] = [
      { id: 'block-1', startCol: 2, endCol: 6 },
      { id: 'block-2', startCol: 10, endCol: 14 },
    ];
    render(
      <ColumnSectionLabelBar collapsedColumnBlocks={blocks} totalCols={20} />,
    );
    expect(screen.getByText('3~7열 중략')).toBeInTheDocument();
    expect(screen.getByText('11~15열 중략')).toBeInTheDocument();
  });
});
