'use client';

import { memo, useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { CollapsedColumnBlock } from '@/types/knitting';

export interface CollapsedColumnProps {
	block: CollapsedColumnBlock;
	x: number;
	height: number;
	cellSize: number;
	totalCols: number;
	onClick: (blockId: string) => void;
}

export const CollapsedColumn = memo(function CollapsedColumnInner({ block, x, height, cellSize, totalCols, onClick }: CollapsedColumnProps) {
	const handleClick = useCallback(() => {
		onClick(block.id);
	}, [block.id, onClick]);

	// 오른쪽이 1열 — displayStart는 작은 열 번호, displayEnd는 큰 열 번호
	const displayStart = totalCols - block.endCol;
	const displayEnd = totalCols - block.startCol;
	const labelText = `${displayStart}~${displayEnd}열 중략`;
	const fontSize = Math.max(9, Math.min(11, Math.floor(cellSize * 0.6)));

	return (
		<Group
			x={x}
			onClick={handleClick}
		>
			<Rect
				x={0}
				y={0}
				width={cellSize}
				height={height}
				fill="#FFF7ED"
				stroke="#F59E0B"
				strokeWidth={1}
			/>
			{/* -90도 회전 세로 텍스트: width↔height 교환, offsetX=height 기준 중앙 배치 */}
			<Text
				x={0}
				y={height}
				width={height}
				height={cellSize}
				text={labelText}
				align="center"
				verticalAlign="middle"
				fontSize={fontSize}
				fill="#92400E"
				rotation={-90}
				listening={false}
			/>
		</Group>
	);
});
