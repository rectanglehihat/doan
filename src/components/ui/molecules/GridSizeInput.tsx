'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/atoms/Input';

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 200;

interface GridSizeInputProps {
	rows: number;
	cols: number;
	onRowsChange: (rows: number) => void;
	onColsChange: (cols: number) => void;
	min?: number;
	max?: number;
}

export function GridSizeInput({
	rows,
	cols,
	onRowsChange,
	onColsChange,
	min = DEFAULT_MIN,
	max = DEFAULT_MAX,
}: GridSizeInputProps) {
	const handleColsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(min, Math.min(max, Number(e.target.value)));
			if (!Number.isNaN(value)) onColsChange(value);
		},
		[min, max, onColsChange],
	);

	const handleRowsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(min, Math.min(max, Number(e.target.value)));
			if (!Number.isNaN(value)) onRowsChange(value);
		},
		[min, max, onRowsChange],
	);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<label className="text-xs text-zinc-600">너비 (코)</label>
				<Input
					type="number"
					value={cols}
					min={min}
					max={max}
					size="sm"
					className="w-16 text-right"
					aria-label="너비 코 수"
					onChange={handleColsChange}
				/>
			</div>
			<div className="flex items-center justify-between">
				<label className="text-xs text-zinc-600">높이 (단)</label>
				<Input
					type="number"
					value={rows}
					min={min}
					max={max}
					size="sm"
					className="w-16 text-right"
					aria-label="높이 단 수"
					onChange={handleRowsChange}
				/>
			</div>
		</div>
	);
}
