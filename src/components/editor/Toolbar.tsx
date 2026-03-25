'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { SymmetryMode } from '@/types/knitting';

const SYMMETRY_OPTIONS: { value: SymmetryMode; label: string }[] = [
	{ value: 'none', label: '없음' },
	{ value: 'horizontal', label: '좌우' },
	{ value: 'vertical', label: '상하' },
	{ value: 'both', label: '양방향' },
];

interface ToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onReset: () => void;
	symmetryMode: SymmetryMode;
	onSymmetryChange: (mode: SymmetryMode) => void;
}

export function Toolbar({ canUndo, canRedo, onUndo, onRedo, onReset, symmetryMode, onSymmetryChange }: ToolbarProps) {
	const handleUndo = useCallback(() => {
		onUndo();
	}, [onUndo]);

	const handleRedo = useCallback(() => {
		onRedo();
	}, [onRedo]);

	const handleReset = useCallback(() => {
		onReset();
	}, [onReset]);

	const symmetryHandlers = useMemo<Record<SymmetryMode, () => void>>(
		() => ({
			none: () => onSymmetryChange('none'),
			horizontal: () => onSymmetryChange('horizontal'),
			vertical: () => onSymmetryChange('vertical'),
			both: () => onSymmetryChange('both'),
		}),
		[onSymmetryChange],
	);

	return (
		<div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5">
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
			<div className="flex items-center gap-1 border-l border-zinc-200 pl-3">
				<span className="text-xs text-zinc-400 mr-1">대칭</span>
				{SYMMETRY_OPTIONS.map(({ value, label }) => (
					<Button
						key={value}
						variant={symmetryMode === value ? 'default' : 'ghost'}
						size="sm"
						onClick={symmetryHandlers[value]}
						aria-label={`대칭 ${label}`}
						aria-pressed={symmetryMode === value}
					>
						{label}
					</Button>
				))}
			</div>
			<div className="ml-auto">
				<Button variant="ghost" size="sm" onClick={handleReset} aria-label="도안 초기화">
					초기화
				</Button>
			</div>
		</div>
	);
}
