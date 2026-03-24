'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useChartEditor } from '@/hooks/useChartEditor';

const KonvaGrid = dynamic(
	() => import('./KonvaGrid').then((m) => ({ default: m.KonvaGrid })),
	{ ssr: false, loading: () => <CanvasPlaceholder /> },
);

function CanvasPlaceholder() {
	return (
		<div className="flex items-center justify-center w-full h-full bg-zinc-50">
			<span className="text-sm text-zinc-400">캔버스 로딩 중...</span>
		</div>
	);
}

export function ChartCanvas() {
	const { cells, gridSize, selectedSymbol, symbolsMap, handleCellPaint } = useChartEditor();
	const containerRef = useRef<HTMLDivElement>(null);
	const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

	const updateSize = useCallback(() => {
		const el = containerRef.current;
		if (el) {
			setStageSize({ width: el.clientWidth, height: el.clientHeight });
		}
	}, []);

	useEffect(() => {
		updateSize();
		const observer = new ResizeObserver(updateSize);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [updateSize]);

	return (
		<div className="flex flex-col w-full h-full">
			<div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 shrink-0">
				<span className="text-sm font-medium text-zinc-700">도안 캔버스</span>
				<span className="text-xs text-zinc-400">
					{gridSize.cols} × {gridSize.rows}
				</span>
			</div>
			<div ref={containerRef} className="flex-1 bg-zinc-100 overflow-hidden">
				<KonvaGrid
					cells={cells}
					gridSize={gridSize}
					symbolsMap={symbolsMap}
					selectedSymbolAbbr={selectedSymbol?.abbr ?? null}
					onCellPaint={handleCellPaint}
					stageWidth={stageSize.width}
					stageHeight={stageSize.height}
				/>
			</div>
		</div>
	);
}
