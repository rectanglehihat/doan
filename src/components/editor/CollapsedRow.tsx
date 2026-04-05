'use client';

import { memo, useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { CollapsedBlock } from '@/types/knitting';

export interface CollapsedRowProps {
	block: CollapsedBlock;
	y: number;
	width: number;
	cellSize: number;
	totalRows: number;
	onClick: (blockId: string) => void;
}

export const CollapsedRow = memo(function CollapsedRowInner({ block, y, width, cellSize, totalRows, onClick }: CollapsedRowProps) {
	const handleClick = useCallback(() => {
		onClick(block.id);
	}, [block.id, onClick]);

	// 아래가 1단 — displayStart는 작은 단 번호, displayEnd는 큰 단 번호
	const displayStart = totalRows - block.endRow;
	const displayEnd = totalRows - block.startRow;
	const labelText = `${displayStart}~${displayEnd}단 중략`;
	const fontSize = Math.max(11, Math.min(13, Math.floor(cellSize * 0.7)));

	return (
		<Group
			y={y}
			onClick={handleClick}
		>
			<Rect
				x={0}
				y={0}
				width={width}
				height={cellSize}
				fill="#FEFCE8"
				stroke="#EAB308"
				strokeWidth={1}
			/>
			<Text
				x={0}
				y={Math.floor((cellSize - fontSize) / 2)}
				width={width}
				height={cellSize}
				text={labelText}
				align="center"
				verticalAlign="middle"
				fontSize={fontSize}
				fill="#854D0E"
				listening={false}
			/>
		</Group>
	);
});
