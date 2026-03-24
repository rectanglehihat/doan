'use client';

import { useCallback } from 'react';

const STAR_COUNT = 5;

interface DifficultyStarsProps {
	value: number;
	onChange: (value: number) => void;
}

export function DifficultyStars({ value, onChange }: DifficultyStarsProps) {
	const makeHandleClick = useCallback(
		(star: number) => () => {
			onChange(value === star ? 0 : star);
		},
		[value, onChange],
	);

	return (
		<div className="flex items-center gap-1">
			{Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((star) => (
				<button
					key={star}
					type="button"
					aria-label={`난이도 ${star}점`}
					aria-pressed={star <= value}
					onClick={makeHandleClick(star)}
					className={`text-lg leading-none transition-colors ${
						star <= value ? 'text-amber-400' : 'text-zinc-200'
					} hover:text-amber-300`}
				>
					★
				</button>
			))}
		</div>
	);
}
