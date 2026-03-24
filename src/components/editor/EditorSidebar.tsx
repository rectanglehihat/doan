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
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Option } from '@/components/ui/atoms/Option';
import { Select } from '@/components/ui/molecules/Select';
import { useChartStore } from '@/store/useChartStore';

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
	const [selectedSymbol, setSelectedSymbol] = useState<KnittingSymbol | null>(null);
	const [patternType, setPatternType] = useState<PatternType>('knitting');
	const { gridSize, setGridSize } = useChartStore();

	const handleSymbolSelect = useCallback((symbol: KnittingSymbol) => {
		setSelectedSymbol((prev) => (prev?.id === symbol.id ? null : symbol));
	}, []);

	const handlePatternTypeChange = useCallback((type: PatternType) => {
		setPatternType(type);
		setSelectedSymbol(null);
	}, []);

	const handleKnittingClick = useCallback(() => {
		handlePatternTypeChange('knitting');
	}, [handlePatternTypeChange]);

	const handleCrochetClick = useCallback(() => {
		handlePatternTypeChange('crochet');
	}, [handlePatternTypeChange]);

	const handleColsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const cols = Math.max(1, Math.min(200, Number(e.target.value)));
			if (!Number.isNaN(cols)) setGridSize({ rows: gridSize.rows, cols });
		},
		[gridSize.rows, setGridSize],
	);

	const handleRowsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const rows = Math.max(1, Math.min(200, Number(e.target.value)));
			if (!Number.isNaN(rows)) setGridSize({ rows, cols: gridSize.cols });
		},
		[gridSize.cols, setGridSize],
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
						<div className="flex items-center justify-between">
							<label className="text-xs text-zinc-600">너비 (코)</label>
							<Input
								type="number"
								value={gridSize.cols}
								min={1}
								max={200}
								size="sm"
								className="w-16 text-right"
								onChange={handleColsChange}
							/>
						</div>
						<div className="flex items-center justify-between">
							<label className="text-xs text-zinc-600">높이 (단)</label>
							<Input
								type="number"
								value={gridSize.rows}
								min={1}
								max={200}
								size="sm"
								className="w-16 text-right"
								onChange={handleRowsChange}
							/>
						</div>
						<div className="flex items-center justify-between">
							<label className="text-xs text-zinc-600">칸 크기 (px)</label>
							<Input
								type="number"
								defaultValue={20}
								min={10}
								max={40}
								size="sm"
								className="w-16 text-right"
							/>
						</div>
					</div>
				</SidebarSection>

				<SidebarSection title="도안 정보">
					<div className="flex flex-col gap-2">
						<Input
							type="text"
							placeholder="도안 제목"
							size="sm"
							className="w-full"
						/>
						<Select size="sm" placeholder="난이도 선택">
							<Option value="beginner">초급</Option>
							<Option value="intermediate">중급</Option>
							<Option value="advanced">고급</Option>
						</Select>
					</div>
				</SidebarSection>

				<SidebarSection title="준비물">
					<textarea
						placeholder="사용할 실, 바늘, 부자재 등을 적어주세요"
						rows={4}
						className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
					/>
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
