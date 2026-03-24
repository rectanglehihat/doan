'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';

interface ToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

export function Toolbar({ canUndo, canRedo, onUndo, onRedo }: ToolbarProps) {
	const handleUndo = useCallback(() => {
		onUndo();
	}, [onUndo]);

	const handleRedo = useCallback(() => {
		onRedo();
	}, [onRedo]);

	return (
		<div className="flex items-center gap-1 border-b border-zinc-200 bg-white px-3 py-2">
			<Button
				variant="ghost"
				size="sm"
				disabled={!canUndo}
				onClick={handleUndo}
				aria-label="실행 취소"
			>
				↩ 실행 취소
			</Button>
			<Button
				variant="ghost"
				size="sm"
				disabled={!canRedo}
				onClick={handleRedo}
				aria-label="다시 실행"
			>
				↪ 다시 실행
			</Button>
		</div>
	);
}
