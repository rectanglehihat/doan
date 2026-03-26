'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { RotationalMode } from '@/types/knitting';

interface ToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onReset: () => void;
	isShapeGuideDrawMode: boolean;
	onShapeGuideDrawModeChange: (active: boolean) => void;
	isShapeGuideEraseMode: boolean;
	onShapeGuideEraseModeChange: (active: boolean) => void;
	hasShapeGuide: boolean;
	onShapeGuideClear: () => void;
	isSelectionMode: boolean;
	onSelectionModeChange: (active: boolean) => void;
	rotationalMode: RotationalMode;
	onRotationalModeChange: (mode: RotationalMode) => void;
}

export function Toolbar({
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	onReset,
	isShapeGuideDrawMode,
	onShapeGuideDrawModeChange,
	isShapeGuideEraseMode,
	onShapeGuideEraseModeChange,
	hasShapeGuide,
	onShapeGuideClear,
	isSelectionMode,
	onSelectionModeChange,
	rotationalMode,
	onRotationalModeChange,
}: ToolbarProps) {
	const handleUndo = useCallback(() => {
		onUndo();
	}, [onUndo]);

	const handleRedo = useCallback(() => {
		onRedo();
	}, [onRedo]);

	const handleReset = useCallback(() => {
		onReset();
	}, [onReset]);

	const handleShapeGuideDrawToggle = useCallback(() => {
		onShapeGuideDrawModeChange(!isShapeGuideDrawMode);
	}, [onShapeGuideDrawModeChange, isShapeGuideDrawMode]);

	const handleShapeGuideEraseToggle = useCallback(() => {
		onShapeGuideEraseModeChange(!isShapeGuideEraseMode);
	}, [onShapeGuideEraseModeChange, isShapeGuideEraseMode]);

	const handleShapeGuideClear = useCallback(() => {
		onShapeGuideClear();
	}, [onShapeGuideClear]);

	const handleSelectionModeToggle = useCallback(() => {
		onSelectionModeChange(!isSelectionMode);
	}, [onSelectionModeChange, isSelectionMode]);

	const handleRotationalHorizontal = useCallback(() => {
		onRotationalModeChange(rotationalMode === 'horizontal' ? 'none' : 'horizontal');
	}, [onRotationalModeChange, rotationalMode]);

	const handleRotationalVertical = useCallback(() => {
		onRotationalModeChange(rotationalMode === 'vertical' ? 'none' : 'vertical');
	}, [onRotationalModeChange, rotationalMode]);

	const handleRotationalBoth = useCallback(() => {
		onRotationalModeChange(rotationalMode === 'both' ? 'none' : 'both');
	}, [onRotationalModeChange, rotationalMode]);

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-zinc-200 bg-white px-3 py-2">
			{/* 실행 취소 / 다시 실행 */}
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="sm"
					disabled={!canUndo}
					onClick={handleUndo}
					aria-label="실행 취소"
				>
					실행 취소
				</Button>
				<Button
					variant="ghost"
					size="sm"
					disabled={!canRedo}
					onClick={handleRedo}
					aria-label="다시 실행"
				>
					다시 실행
				</Button>
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 영역 선택 */}
			<div className="flex items-center gap-1">
				<Button
					variant={isSelectionMode ? 'default' : 'ghost'}
					size="sm"
					onClick={handleSelectionModeToggle}
					aria-label="영역 선택"
					aria-pressed={isSelectionMode}
				>
					영역 선택
				</Button>
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 대칭 모드 */}
			<div className="flex items-center gap-1">
				<span className="text-xs text-zinc-400 mr-0.5">대칭 모드</span>
				<Button
					variant={rotationalMode === 'horizontal' ? 'default' : 'ghost'}
					size="sm"
					onClick={handleRotationalHorizontal}
					aria-label="대칭 모드 좌우"
					aria-pressed={rotationalMode === 'horizontal'}
				>
					좌우
				</Button>
				<Button
					variant={rotationalMode === 'vertical' ? 'default' : 'ghost'}
					size="sm"
					onClick={handleRotationalVertical}
					aria-label="대칭 모드 상하"
					aria-pressed={rotationalMode === 'vertical'}
				>
					상하
				</Button>
				<Button
					variant={rotationalMode === 'both' ? 'default' : 'ghost'}
					size="sm"
					onClick={handleRotationalBoth}
					aria-label="대칭 모드 양방향"
					aria-pressed={rotationalMode === 'both'}
				>
					양방향
				</Button>
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 형태선 */}
			<div className="flex items-center gap-1">
				<Button
					variant={isShapeGuideDrawMode ? 'default' : 'ghost'}
					size="sm"
					onClick={handleShapeGuideDrawToggle}
					aria-label="형태선 그리기"
					aria-pressed={isShapeGuideDrawMode}
				>
					형태선 그리기
				</Button>
				{hasShapeGuide && (
					<>
						<Button
							variant={isShapeGuideEraseMode ? 'default' : 'ghost'}
							size="sm"
							onClick={handleShapeGuideEraseToggle}
							aria-label="형태선 지우개"
							aria-pressed={isShapeGuideEraseMode}
						>
							지우개
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleShapeGuideClear}
							aria-label="형태선 전체 지우기"
						>
							전체 지우기
						</Button>
					</>
				)}
			</div>

			{/* 초기화 */}
			<div className="ml-auto">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleReset}
					aria-label="도안 초기화"
				>
					초기화
				</Button>
			</div>
		</div>
	);
}
