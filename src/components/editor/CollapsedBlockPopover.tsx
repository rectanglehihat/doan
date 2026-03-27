'use client';

import { useCallback, useEffect } from 'react';

interface CollapsedBlockPopoverProps {
	startRow: number;
	endRow: number;
	totalRows: number;
	onRemove: () => void;
	onClose: () => void;
}

export function CollapsedBlockPopover({
	startRow,
	endRow,
	totalRows,
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

	// 아래가 1단 — displayStart는 작은 단 번호, displayEnd는 큰 단 번호
	const displayStart = totalRows - endRow;
	const displayEnd = totalRows - startRow;

	return (
		<div role="dialog">
			<p>{displayStart}~{displayEnd}단 중략 중</p>
			<button type="button" onClick={handleRemove}>
				중략 해제
			</button>
		</div>
	);
}
