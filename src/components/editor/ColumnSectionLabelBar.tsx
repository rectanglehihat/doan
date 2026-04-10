'use client';

import React from 'react';
import type { CollapsedColumnBlock } from '@/types/knitting';

interface ColumnSectionLabelBarProps {
  collapsedColumnBlocks: CollapsedColumnBlock[];
  totalCols: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ColumnSectionLabelBar({
  collapsedColumnBlocks,
  containerRef,
}: ColumnSectionLabelBarProps) {
  if (collapsedColumnBlocks.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-row flex-wrap gap-2 bg-slate-100 px-3 py-1"
    >
      {collapsedColumnBlocks.map((block) => (
        <span
          key={block.id}
          className="rounded bg-slate-300 px-2 py-0.5 text-xs text-slate-700"
        >
          {`${block.startCol + 1}~${block.endCol + 1}열 중략`}
        </span>
      ))}
    </div>
  );
}
