'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
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
import { usePatterns } from '@/hooks/usePatterns';
import { PdfPreview } from '@/components/pdf/PdfPreview';

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

interface SaveStatusProps {
	saveError: string | null;
	isSaved: boolean;
	isAutoSaving: boolean;
}

function SaveStatus({ saveError, isSaved, isAutoSaving }: SaveStatusProps) {
	if (saveError !== null) {
		return (
			<div role="alert" className="flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5">
				<svg className="h-3.5 w-3.5 shrink-0 text-red-500" viewBox="0 0 16 16" fill="currentColor">
					<path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 4a.75.75 0 0 0-1.5 0v3.25a.75.75 0 0 0 1.5 0V5zm-.75 6a.875.875 0 1 0 0-1.75A.875.875 0 0 0 7.25 11z" />
				</svg>
				<p className="text-xs text-red-600">
					{saveError === 'limit_reached'
						? '저장 한도(5개)에 도달했습니다.'
						: '저장 중 오류가 발생했습니다.'}
				</p>
			</div>
		);
	}
	if (isSaved) {
		return (
			<div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1.5">
				<svg className="h-3.5 w-3.5 shrink-0 text-green-500" viewBox="0 0 16 16" fill="currentColor">
					<path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.78 4.97a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 0 1 1.06 0z" />
				</svg>
				<p className="text-xs font-medium text-green-700">저장됨</p>
			</div>
		);
	}
	if (isAutoSaving) {
		return (
			<div className="flex items-center gap-1.5 px-2.5 py-1.5">
				<svg className="h-3.5 w-3.5 shrink-0 animate-spin text-zinc-400" viewBox="0 0 16 16" fill="none">
					<circle className="opacity-25" cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
					<path className="opacity-75" fill="currentColor" d="M8 2a6 6 0 0 1 6 6h-2a4 4 0 0 0-4-4V2z" />
				</svg>
				<p className="text-xs text-zinc-400">저장 중...</p>
			</div>
		);
	}
	return null;
}

interface EditorSidebarProps {
	stageRef?: React.RefObject<Konva.Stage | null>;
}

export function EditorSidebar({ stageRef }: EditorSidebarProps) {
	const [patternType, setPatternType] = useState<PatternType>('knitting');
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isSaved, setIsSaved] = useState(false);
	const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fallbackRef = useRef<Konva.Stage | null>(null);
	const resolvedStageRef = stageRef ?? fallbackRef;
	const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
	const { gridSize, setGridSize, setGridSizeSymmetric, cellSize, setCellSize, patternTitle, setPatternTitle, difficulty, setDifficulty, materials, setMaterials } = useChartStore();
	const { selectedSymbol, setSelectedSymbol, rotationalMode, shiftShapeGuide, openLoadDialog } = useUIStore();
	const { saveCurrentPattern, currentPatternId, isAutoSaving } = usePatterns();

	// 도안이 로드되어 currentPatternId가 변경되면 저장 에러를 초기화한다.
	// React 공식 "storing previous state" 패턴: useState로 이전 값 추적
	const [prevPatternId, setPrevPatternId] = useState(currentPatternId);
	if (prevPatternId !== currentPatternId) {
		setPrevPatternId(currentPatternId);
		if (currentPatternId !== null && saveError !== null) {
			setSaveError(null);
		}
	}

	const handleSymbolSelect = useCallback(
		(symbol: KnittingSymbol) => {
			setSelectedSymbol(selectedSymbol?.id === symbol.id ? null : symbol);
		},
		[selectedSymbol, setSelectedSymbol],
	);

	const handleEmptyCellSelect = useCallback(() => {
		setSelectedSymbol(null);
	}, [setSelectedSymbol]);

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

	const isColSymmetric = rotationalMode === 'horizontal' || rotationalMode === 'both';
	const isRowSymmetric = rotationalMode === 'vertical' || rotationalMode === 'both';
	const stepCols = isColSymmetric ? 2 : 1;
	const stepRows = isRowSymmetric ? 2 : 1;
	// min=2 when step=2 so HTML stepper aligns to even values (2,4,6...20,22)
	const minCols = isColSymmetric ? 2 : 1;
	const minRows = isRowSymmetric ? 2 : 1;

	const handleColsChange = useCallback(
		(cols: number) => {
			if (isColSymmetric) {
				// 짝수로 스냅: min=2,step=2 정렬을 보장
				const snapped = Math.max(2, Math.round(cols / 2) * 2);
				const colOffset = Math.trunc((snapped - gridSize.cols) / 2);
				setGridSizeSymmetric({ rows: gridSize.rows, cols: snapped }, rotationalMode);
				shiftShapeGuide(colOffset, 0);
			} else if (rotationalMode !== 'none') {
				setGridSizeSymmetric({ rows: gridSize.rows, cols }, rotationalMode);
			} else {
				setGridSize({ rows: gridSize.rows, cols });
			}
		},
		[gridSize.rows, gridSize.cols, isColSymmetric, rotationalMode, setGridSize, setGridSizeSymmetric, shiftShapeGuide],
	);

	const handleRowsChange = useCallback(
		(rows: number) => {
			if (isRowSymmetric) {
				const snapped = Math.max(2, Math.round(rows / 2) * 2);
				const rowOffset = Math.trunc((snapped - gridSize.rows) / 2);
				setGridSizeSymmetric({ rows: snapped, cols: gridSize.cols }, rotationalMode);
				shiftShapeGuide(0, rowOffset);
			} else if (rotationalMode !== 'none') {
				setGridSizeSymmetric({ rows, cols: gridSize.cols }, rotationalMode);
			} else {
				setGridSize({ rows, cols: gridSize.cols });
			}
		},
		[gridSize.cols, gridSize.rows, isRowSymmetric, rotationalMode, setGridSize, setGridSizeSymmetric, shiftShapeGuide],
	);

	const handleCellSizeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(e.target.value);
			if (value >= 10 && value <= 60) setCellSize(value);
		},
		[setCellSize],
	);

	const handleDifficultyChange = useCallback(
		(value: number) => {
			setDifficulty(value);
		},
		[setDifficulty],
	);

	const handleMaterialsChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setMaterials(e.target.value);
		},
		[setMaterials],
	);

	const handleSaveClick = useCallback(() => {
		setSaveError(null);
		if (savedTimerRef.current !== null) {
			clearTimeout(savedTimerRef.current);
		}
		const result = saveCurrentPattern(patternTitle);
		if (result.ok) {
			setIsSaved(true);
			savedTimerRef.current = setTimeout(() => {
				setIsSaved(false);
			}, 2000);
		} else {
			setSaveError(result.error);
		}
	}, [saveCurrentPattern, patternTitle]);

	useEffect(() => {
		return () => {
			if (savedTimerRef.current !== null) {
				clearTimeout(savedTimerRef.current);
			}
		};
	}, []);

	const handleLoadClick = useCallback(() => {
		openLoadDialog();
	}, [openLoadDialog]);

	const handlePdfClick = useCallback(() => {
		setIsPdfModalOpen(true);
	}, []);

	const handlePdfModalClose = useCallback(() => {
		setIsPdfModalOpen(false);
	}, []);

	const symbols = patternType === 'knitting' ? knittingSymbols : crochetSymbols;

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 py-3.5 border-b border-zinc-200">
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
						<button
							onClick={handleEmptyCellSelect}
							aria-label="빈 칸"
							aria-pressed={selectedSymbol === null}
							className={`w-full rounded border px-2 py-1.5 text-xs font-medium transition-colors ${
								selectedSymbol === null
									? 'border-zinc-800 bg-zinc-900 text-white'
									: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
							}`}
						>
							빈 칸 (지우개)
						</button>
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
							minCols={minCols}
							minRows={minRows}
							stepCols={stepCols}
							stepRows={stepRows}
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
								onChange={handleDifficultyChange}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs text-zinc-600">준비물</label>
							<textarea
								placeholder="사용할 실, 바늘, 부자재 등을 적어주세요"
								rows={4}
								value={materials}
								onChange={handleMaterialsChange}
								className="w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
							/>
						</div>
					</div>
				</SidebarSection>
			</div>

			<div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4">
				<SaveStatus saveError={saveError} isSaved={isSaved} isAutoSaving={isAutoSaving} />
				<Button
					variant="default"
					size="sm"
					className="w-full"
					disabled={patternTitle.trim() === ''}
					onClick={handleSaveClick}
				>
					저장
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={handleLoadClick}
				>
					불러오기
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					disabled={patternTitle.trim() === ''}
					onClick={handlePdfClick}
				>
					PDF 내보내기
				</Button>
			</div>
			<PdfPreview
				isOpen={isPdfModalOpen}
				onClose={handlePdfModalClose}
				stageRef={resolvedStageRef}
			/>
		</div>
	);
}
