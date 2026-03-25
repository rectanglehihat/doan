'use client';

import { useCallback, useEffect } from 'react';
import { ChartCanvas } from '@/components/editor/ChartCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { Toolbar } from '@/components/editor/Toolbar';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { useHistory } from '@/hooks/useHistory';
import { SymmetryMode } from '@/types/knitting';

export default function EditorPage() {
	const { undo, redo, canUndo, canRedo } = useHistory();
	const patternTitle = useChartStore((state) => state.patternTitle);
	const reset = useChartStore((state) => state.reset);
	const { isResetDialogOpen, closeResetDialog, openSaveDialog, symmetryMode, setSymmetryMode } = useUIStore();

	const handleUndo = useCallback(() => {
		undo();
	}, [undo]);

	const handleRedo = useCallback(() => {
		redo();
	}, [redo]);

	const handleResetConfirm = useCallback(() => {
		reset();
		closeResetDialog();
	}, [reset, closeResetDialog]);

	const handleResetCancel = useCallback(() => {
		closeResetDialog();
	}, [closeResetDialog]);

	const handleSymmetryChange = useCallback(
		(mode: SymmetryMode) => {
			setSymmetryMode(mode);
		},
		[setSymmetryMode],
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
			} else if (e.key === 's') {
				e.preventDefault();
				openSaveDialog();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo, openSaveDialog]);

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-100">
			<main className="flex flex-col flex-1 overflow-hidden">
				<Toolbar
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={handleUndo}
					onRedo={handleRedo}
					patternTitle={patternTitle}
					symmetryMode={symmetryMode}
					onSymmetryChange={handleSymmetryChange}
				/>
				<div className="flex-1 overflow-auto p-8">
					<ChartCanvas />
				</div>
			</main>
			<aside className="w-72 shrink-0 border-l border-zinc-200 bg-white overflow-y-auto">
				<EditorSidebar />
			</aside>
			<ConfirmDialog
				open={isResetDialogOpen}
				title="도안 초기화"
				message="모든 셀 데이터가 삭제됩니다. 초기화하시겠습니까?"
				confirmLabel="초기화"
				onConfirm={handleResetConfirm}
				onCancel={handleResetCancel}
			/>
		</div>
	);
}
