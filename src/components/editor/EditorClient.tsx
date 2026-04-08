'use client';

import { useRef } from 'react';
import type Konva from 'konva';
import { ChartCanvas } from '@/components/editor/ChartCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { Toolbar } from '@/components/editor/Toolbar';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog';
import { LoadDialog } from '@/components/editor/LoadDialog';
import { useEditorActions } from '@/hooks/useEditorActions';
import { useUIStore } from '@/store/useUIStore';

export function EditorClient() {
	const stageRef = useRef<Konva.Stage | null>(null);
	const {
		canUndo, canRedo, onUndo, onRedo, beginBatch, endBatch,
		isResetDialogOpen, onReset, onResetConfirm, onResetCancel,
		isShapeGuideDrawMode, onShapeGuideDrawModeChange,
		isShapeGuideEraseMode, onShapeGuideEraseModeChange,
		onShapeGuideClear,
		isSelectionMode, onSelectionModeChange,
		rotationalMode, onRotationalModeChange,
		selectedColor, onColorChange, onColorClear,
		recentColors, onFitToScreen,
	} = useEditorActions();
	const isAnnotationMode = useUIStore((state) => state.isAnnotationMode);
	const setAnnotationMode = useUIStore((state) => state.setAnnotationMode);

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-100">
			<main className="flex flex-col flex-1 overflow-hidden">
				<Toolbar
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={onUndo}
					onRedo={onRedo}
					onReset={onReset}
					isShapeGuideDrawMode={isShapeGuideDrawMode}
					onShapeGuideDrawModeChange={onShapeGuideDrawModeChange}
					isShapeGuideEraseMode={isShapeGuideEraseMode}
					onShapeGuideEraseModeChange={onShapeGuideEraseModeChange}
					onShapeGuideClear={onShapeGuideClear}
					isSelectionMode={isSelectionMode}
					onSelectionModeChange={onSelectionModeChange}
					rotationalMode={rotationalMode}
					onRotationalModeChange={onRotationalModeChange}
					selectedColor={selectedColor}
					onColorChange={onColorChange}
					onColorClear={onColorClear}
					recentColors={recentColors}
					onFitToScreen={onFitToScreen}
					isAnnotationMode={isAnnotationMode}
					onAnnotationModeChange={setAnnotationMode}
				/>
				<div className="flex-1 overflow-auto">
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
				onConfirm={onResetConfirm}
				onCancel={onResetCancel}
			/>
			<LoadDialog />
		</div>
	);
}
