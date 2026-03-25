'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';

interface ToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	patternTitle?: string;
}

export function Toolbar({ canUndo, canRedo, onUndo, onRedo, patternTitle }: ToolbarProps) {
	const handleUndo = useCallback(() => {
		onUndo();
	}, [onUndo]);

	const handleRedo = useCallback(() => {
		onRedo();
	}, [onRedo]);

	return (
		<div className="flex items-center border-b border-zinc-200 bg-white px-3 py-2">
			<div className="flex items-center gap-1">
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
			<div className="ml-auto">
				<span className="text-sm font-medium text-zinc-700">
					{patternTitle || '제목 없는 도안'}
				</span>
			</div>
		</div>
	);
}
