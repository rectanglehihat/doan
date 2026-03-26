'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useChartEditor } from '@/hooks/useChartEditor';
import { useUIStore } from '@/store/useUIStore';

const KonvaGrid = dynamic(() => import('./KonvaGrid').then((m) => ({ default: m.KonvaGrid })), {
	ssr: false,
	loading: () => <CanvasPlaceholder />,
});

function CanvasPlaceholder() {
	return (
		<div className="flex items-center justify-center w-full h-full bg-zinc-50">
			<span className="text-sm text-zinc-400">캔버스 로딩 중...</span>
		</div>
	);
}

interface ChartCanvasProps {
	onPaintStart?: () => void;
	onPaintEnd?: () => void;
}

export function ChartCanvas({ onPaintStart, onPaintEnd }: ChartCanvasProps) {
	const { cells, gridSize, cellSize, selectedSymbol, symbolsMap, handleCellPaint, copySelection, pasteClipboard } = useChartEditor();
	const shapeGuide = useUIStore((state) => state.shapeGuide);
	const isShapeGuideDrawMode = useUIStore((state) => state.isShapeGuideDrawMode);
	const isShapeGuideEraseMode = useUIStore((state) => state.isShapeGuideEraseMode);
	const addShapeGuideStroke = useUIStore((state) => state.addShapeGuideStroke);
	const removeShapeGuideStroke = useUIStore((state) => state.removeShapeGuideStroke);
	const replaceShapeGuideStroke = useUIStore((state) => state.replaceShapeGuideStroke);
	const isSelectionMode = useUIStore((state) => state.isSelectionMode);
	const rotationalMode = useUIStore((state) => state.rotationalMode);
	const cellSelection = useUIStore((state) => state.cellSelection);
	const clipboard = useUIStore((state) => state.clipboard);
	const setCellSelection = useUIStore((state) => state.setCellSelection);
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
			<div ref={containerRef} className="flex-1 bg-zinc-100 overflow-hidden">
				<KonvaGrid
					cells={cells}
					gridSize={gridSize}
					cellSize={cellSize}
					symbolsMap={symbolsMap}
					selectedSymbolAbbr={selectedSymbol?.abbr ?? null}
					onCellPaint={handleCellPaint}
					onPaintStart={onPaintStart}
					onPaintEnd={onPaintEnd}
					stageWidth={stageSize.width}
					stageHeight={stageSize.height}
					shapeGuide={shapeGuide}
					isShapeGuideDrawMode={isShapeGuideDrawMode}
					isShapeGuideEraseMode={isShapeGuideEraseMode}
					onShapeGuideStrokeAdd={addShapeGuideStroke}
					onShapeGuideStrokeRemove={removeShapeGuideStroke}
					onShapeGuideStrokeReplace={replaceShapeGuideStroke}
					isSelectionMode={isSelectionMode}
					cellSelection={cellSelection}
					clipboard={clipboard}
					onSelectionChange={setCellSelection}
					onCopySelection={copySelection}
					onPasteClipboard={pasteClipboard}
					rotationalMode={rotationalMode}
				/>
			</div>
		</div>
	);
}
