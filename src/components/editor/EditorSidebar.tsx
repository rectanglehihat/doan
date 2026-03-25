'use client';

import { useCallback, useState } from 'react';
import { KnittingSymbol, PatternType } from '@/types/knitting';
import {
	knittingSymbols,
	crochetSymbols,
	SYMBOL_CATEGORY_ORDER,
	SYMBOL_CATEGORY_LABELS,
} from '@/constants/knitting-symbols';
import { SymbolButton } from '@/components/ui/molecules/SymbolButton';
import { DifficultyStars } from '@/components/ui/molecules/DifficultyStars';
import { GridSizeInput } from '@/components/ui/molecules/GridSizeInput';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';

interface SidebarSectionProps {
	title: string;
	children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
	return (
		<div className="border-b border-zinc-100 px-4 py-4">
			<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h3>
			{children}
		</div>
	);
}

export function EditorSidebar() {
	const [patternType, setPatternType] = useState<PatternType>('knitting');
	const [difficulty, setDifficulty] = useState<number>(0);
	const { gridSize, setGridSize, cellSize, setCellSize, patternTitle, setPatternTitle } = useChartStore();
	const { selectedSymbol, setSelectedSymbol } = useUIStore();

	const handleSymbolSelect = useCallback(
		(symbol: KnittingSymbol) => {
			setSelectedSymbol(selectedSymbol?.id === symbol.id ? null : symbol);
		},
		[selectedSymbol, setSelectedSymbol],
	);

	const handlePatternTypeChange = useCallback(
		(type: PatternType) => {
			setPatternType(type);
			setSelectedSymbol(null);
		},
		[setSelectedSymbol],
	);

	const handleKnittingClick = useCallback(() => handlePatternTypeChange('knitting'), [handlePatternTypeChange]);
	const handleCrochetClick = useCallback(() => handlePatternTypeChange('crochet'), [handlePatternTypeChange]);

	const handlePatternTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setPatternTitle(e.target.value);
		},
		[setPatternTitle],
	);

	const handleColsChange = useCallback(
		(cols: number) => {
			setGridSize({ rows: gridSize.rows, cols });
		},
		[gridSize.rows, setGridSize],
	);

	const handleRowsChange = useCallback(
		(rows: number) => {
			setGridSize({ rows, cols: gridSize.cols });
		},
		[gridSize.cols, setGridSize],
	);

	const handleCellSizeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(e.target.value);
			if (value >= 10 && value <= 60) setCellSize(value);
		},
		[setCellSize],
	);

	const symbols = patternType === 'knitting' ? knittingSymbols : crochetSymbols;

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 py-4 border-b border-zinc-200">
				<h2 className="text-sm font-semibold text-zinc-800">편집 도구</h2>
			</div>

			<div className="flex-1 overflow-y-auto">
				<SidebarSection title="뜨개 종류">
					<div className="flex gap-2">
						<Button
							variant={patternType === 'knitting' ? 'default' : 'outline'}
							size="sm"
							className="flex-1"
							onClick={handleKnittingClick}
						>
							대바늘
						</Button>
						<Button
							variant={patternType === 'crochet' ? 'default' : 'outline'}
							size="sm"
							className="flex-1"
							onClick={handleCrochetClick}
						>
							코바늘
						</Button>
					</div>
				</SidebarSection>

				<SidebarSection title="기호 팔레트">
					<div className="flex flex-col gap-3">
						{SYMBOL_CATEGORY_ORDER.map((category) => {
							const categorySymbols = symbols.filter((s) => s.category === category);
							return (
								<div key={category}>
									<p className="mb-1.5 text-[10px] font-medium text-zinc-400">{SYMBOL_CATEGORY_LABELS[category]}</p>
									<div className="grid grid-cols-3 gap-1.5">
										{categorySymbols.map((symbol) => (
											<SymbolButton
												key={symbol.id}
												symbol={symbol}
												isSelected={selectedSymbol?.id === symbol.id}
												onSelect={handleSymbolSelect}
											/>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</SidebarSection>

				<SidebarSection title="격자 설정">
					<div className="flex flex-col gap-2">
						<GridSizeInput
							rows={gridSize.rows}
							cols={gridSize.cols}
							onRowsChange={handleRowsChange}
							onColsChange={handleColsChange}
						/>
						<div className="flex items-center justify-between">
							<label className="text-xs text-zinc-600">칸 크기 (px)</label>
							<Input
								type="number"
								value={cellSize}
								min={10}
								max={60}
								size="sm"
								className="w-16 text-right"
								onChange={handleCellSizeChange}
							/>
						</div>
					</div>
				</SidebarSection>

				<SidebarSection title="도안 정보">
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-1">
							<label className="text-xs text-zinc-600">도안명</label>
							<Input
								type="text"
								placeholder="도안 제목을 입력하세요"
								size="sm"
								className="w-full"
								value={patternTitle}
								onChange={handlePatternTitleChange}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs text-zinc-600">난이도</label>
							<DifficultyStars
								value={difficulty}
								onChange={setDifficulty}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs text-zinc-600">준비물</label>
							<textarea
								placeholder="사용할 실, 바늘, 부자재 등을 적어주세요"
								rows={4}
								className="w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
							/>
						</div>
					</div>
				</SidebarSection>
			</div>

			<div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4">
				<Button
					variant="default"
					size="sm"
					className="w-full"
				>
					저장
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
				>
					PDF 내보내기
				</Button>
			</div>
		</div>
	);
}
