'use client';

import { useCallback, useEffect } from 'react';

interface CollapsedBlockPopoverProps {
	startRow: number;
	endRow: number;
	onRemove: () => void;
	onClose: () => void;
}

export function CollapsedBlockPopover({
	startRow,
	endRow,
	onRemove,
	onClose,
}: CollapsedBlockPopoverProps) {
	const handleRemove = useCallback(() => {
		onRemove();
	}, [onRemove]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose]);

	// 0-based → 1-based 변환
	const displayStart = startRow + 1;
	const displayEnd = endRow + 1;

	return (
		<div role="dialog">
			<p>{displayStart}~{displayEnd}단 중략 중</p>
			<button type="button" onClick={handleRemove}>
				중략 해제
			</button>
		</div>
	);
}
