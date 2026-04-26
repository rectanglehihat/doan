'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { ColorPicker } from '@/components/ui/molecules/ColorPicker';
import { UserMenu } from '@/components/ui/molecules/UserMenu';
import { useUserStore } from '@/store/useUserStore';
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
	onShapeGuideClear: () => void;
	isSelectionMode: boolean;
	onSelectionModeChange: (active: boolean) => void;
	rotationalMode: RotationalMode;
	onRotationalModeChange: (mode: RotationalMode) => void;
	selectedColor: string | null;
	onColorChange: (color: string | null) => void;
	onColorClear: () => void;
	recentColors: string[];
	onFitToScreen?: () => void;
	isAnnotationMode: boolean;
	onAnnotationModeChange: (active: boolean) => void;
	onSignOut?: () => Promise<void>;
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
	onShapeGuideClear,
	isSelectionMode,
	onSelectionModeChange,
	rotationalMode,
	onRotationalModeChange,
	selectedColor,
	onColorChange,
	onColorClear,
	recentColors,
	onFitToScreen,
	isAnnotationMode,
	onAnnotationModeChange,
	onSignOut,
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

	const handleAnnotationModeToggle = useCallback(() => {
		onAnnotationModeChange(!isAnnotationMode);
	}, [onAnnotationModeChange, isAnnotationMode]);

	const handleColorClear = useCallback(() => {
		onColorClear();
	}, [onColorClear]);

	const handleFitToScreen = useCallback(() => {
		onFitToScreen?.();
	}, [onFitToScreen]);

	const user = useUserStore((state) => state.user);
	const isAuthLoading = useUserStore((state) => state.isLoading);
	const handleSignOut = useCallback(async () => {
		await onSignOut?.();
	}, [onSignOut]);

	return (
		<div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-200 bg-white px-3 py-2">
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
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 주석 모드 */}
			<div className="flex items-center gap-1">
				<Button
					variant={isAnnotationMode ? 'default' : 'ghost'}
					size="sm"
					onClick={handleAnnotationModeToggle}
					aria-label="주석 모드"
					aria-pressed={isAnnotationMode}
				>
					주석
				</Button>
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 색상 */}
			<div className="flex items-center gap-1">
				<ColorPicker
					selectedColor={selectedColor}
					onColorChange={onColorChange}
					recentColors={recentColors}
				/>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleColorClear}
					aria-label="색상 전체 지우기"
				>
					전체 지우기
				</Button>
			</div>

			<div className="h-5 w-px bg-zinc-200" />

			{/* 화면 맞추기 */}
			{onFitToScreen && (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleFitToScreen}
						aria-label="화면에 맞추기"
						title="화면에 맞추기 (F)"
					>
						화면 맞추기
					</Button>
				</div>
			)}

			{/* 새 도안 + 사용자 메뉴 */}
			<div className="ml-auto flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleReset}
					aria-label="새 도안"
				>
					새 도안
				</Button>
				{!isAuthLoading && user && (
					<UserMenu user={user} onSignOut={handleSignOut} />
				)}
			</div>
		</div>
	);
}
