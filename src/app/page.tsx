'use client';

import { useCallback, useState } from 'react';
import { ChartCanvas } from '@/components/editor/ChartCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { Toolbar } from '@/components/editor/Toolbar';

export default function EditorPage() {
	// useHistory 훅 연동 전까지 임시 상태 (1-5에서 교체)
	const [canUndo] = useState(false);
	const [canRedo] = useState(false);

	const handleUndo = useCallback(() => {}, []);
	const handleRedo = useCallback(() => {}, []);

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-100">
			<main className="flex flex-col flex-1 overflow-hidden">
				<Toolbar canUndo={canUndo} canRedo={canRedo} onUndo={handleUndo} onRedo={handleRedo} />
				<div className="flex-1 overflow-auto p-8">
					<ChartCanvas />
				</div>
			</main>
			<aside className="w-72 shrink-0 border-l border-zinc-200 bg-white overflow-y-auto">
				<EditorSidebar />
			</aside>
		</div>
	);
}
