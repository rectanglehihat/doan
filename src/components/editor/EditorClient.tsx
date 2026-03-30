'use client';

import { useCallback, useEffect, useRef } from 'react';
import type Konva from 'konva';
import { ChartCanvas } from '@/components/editor/ChartCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { Toolbar } from '@/components/editor/Toolbar';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog';
import { LoadDialog } from '@/components/editor/LoadDialog';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { useHistory } from '@/hooks/useHistory';
import { RotationalMode } from '@/types/knitting';

export function EditorClient() {
	const stageRef = useRef<Konva.Stage | null>(null);
	const { undo, redo, canUndo, canRedo, beginBatch, endBatch } = useHistory();
	const reset = useChartStore((state) => state.reset);
	const {
		isResetDialogOpen,
		openResetDialog,
		closeResetDialog,
		reset: resetUI,
		shapeGuide,
		isShapeGuideDrawMode,
		isShapeGuideEraseMode,
		isCellEraseMode,
		setShapeGuide,
		setShapeGuideDrawMode,
		setShapeGuideEraseMode,
		setCellEraseMode,
		isSelectionMode,
		setSelectionMode,
		setCellSelection,
		setSelectedSymbol,
		rotationalMode,
		setRotationalMode,
	} = useUIStore();

	const handleUndo = useCallback(() => {
		undo();
	}, [undo]);

	const handleRedo = useCallback(() => {
		redo();
	}, [redo]);

	const handleResetConfirm = useCallback(() => {
		reset();
		resetUI();
	}, [reset, resetUI]);

	const handleResetCancel = useCallback(() => {
		closeResetDialog();
	}, [closeResetDialog]);

	const handleShapeGuideDrawModeChange = useCallback(
		(active: boolean) => {
			setShapeGuideDrawMode(active);
			if (active) {
				setShapeGuideEraseMode(false);
				setSelectionMode(false);
				setCellSelection(null);
				setSelectedSymbol(null);
			}
		},
		[setShapeGuideDrawMode, setShapeGuideEraseMode, setSelectionMode, setCellSelection, setSelectedSymbol],
	);

	const handleShapeGuideEraseModeChange = useCallback(
		(active: boolean) => {
			setShapeGuideEraseMode(active);
			if (active) {
				setShapeGuideDrawMode(false);
				setSelectionMode(false);
				setCellSelection(null);
				setSelectedSymbol(null);
			}
		},
		[setShapeGuideEraseMode, setShapeGuideDrawMode, setSelectionMode, setCellSelection, setSelectedSymbol],
	);

	const handleShapeGuideClear = useCallback(() => {
		setShapeGuide(null);
		setShapeGuideDrawMode(false);
		setShapeGuideEraseMode(false);
	}, [setShapeGuide, setShapeGuideDrawMode, setShapeGuideEraseMode]);

	const handleCellEraseModeChange = useCallback(
		(active: boolean) => {
			setCellEraseMode(active);
		},
		[setCellEraseMode],
	);

	const handleSelectionModeChange = useCallback(
		(active: boolean) => {
			setSelectionMode(active);
			if (active) {
				setShapeGuideDrawMode(false);
				setShapeGuideEraseMode(false);
				setSelectedSymbol(null);
			} else {
				setCellSelection(null);
			}
		},
		[setSelectionMode, setShapeGuideDrawMode, setShapeGuideEraseMode, setCellSelection, setSelectedSymbol],
	);

	const handleRotationalModeChange = useCallback(
		(mode: RotationalMode) => {
			setRotationalMode(mode);
		},
		[setRotationalMode],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (!(e.ctrlKey || e.metaKey)) return;

			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				undo();
			} else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
				e.preventDefault();
				redo();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo]);

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-100">
			<main className="flex flex-col flex-1 overflow-hidden">
				<Toolbar
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={handleUndo}
					onRedo={handleRedo}
					onReset={openResetDialog}
					isShapeGuideDrawMode={isShapeGuideDrawMode}
					onShapeGuideDrawModeChange={handleShapeGuideDrawModeChange}
					isShapeGuideEraseMode={isShapeGuideEraseMode}
					onShapeGuideEraseModeChange={handleShapeGuideEraseModeChange}
					hasShapeGuide={(shapeGuide?.strokes.length ?? 0) > 0}
					onShapeGuideClear={handleShapeGuideClear}
					isCellEraseMode={isCellEraseMode}
					onCellEraseModeChange={handleCellEraseModeChange}
					isSelectionMode={isSelectionMode}
					onSelectionModeChange={handleSelectionModeChange}
					rotationalMode={rotationalMode}
					onRotationalModeChange={handleRotationalModeChange}
				/>
				<div className="flex-1 overflow-auto p-8">
					<ChartCanvas
						onPaintStart={beginBatch}
						onPaintEnd={endBatch}
						onShapeGuideDrawStart={beginBatch}
						onShapeGuideDrawEnd={endBatch}
						onShapeGuideEraseStart={beginBatch}
						onShapeGuideEraseEnd={endBatch}
						stageRef={stageRef}
					/>
				</div>
			</main>
			<aside className="w-72 shrink-0 border-l border-zinc-200 bg-white overflow-y-auto">
				<EditorSidebar stageRef={stageRef} />
			</aside>
			<ConfirmDialog
				open={isResetDialogOpen}
				title="도안 초기화"
				message="모든 셀 데이터가 삭제됩니다. 초기화하시겠습니까?"
				confirmLabel="초기화"
				onConfirm={handleResetConfirm}
				onCancel={handleResetCancel}
			/>
			<LoadDialog />
		</div>
	);
}
