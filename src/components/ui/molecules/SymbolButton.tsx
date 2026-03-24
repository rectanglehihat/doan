'use client';

import { useCallback } from 'react';
import { KnittingSymbol } from '@/types/knitting';
import { SYMBOL_CATEGORY_COLORS } from '@/constants/knitting-symbols';
import { Button } from '@/components/ui/atoms/Button';

interface SymbolButtonProps {
	symbol: KnittingSymbol;
	isSelected: boolean;
	onSelect: (symbol: KnittingSymbol) => void;
}

export function SymbolButton({ symbol, isSelected, onSelect }: SymbolButtonProps) {
	const handleClick = useCallback(() => {
		onSelect(symbol);
	}, [onSelect, symbol]);

	const colors = SYMBOL_CATEGORY_COLORS[symbol.category];

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleClick}
			title={symbol.name}
			aria-label={`${symbol.name} (${symbol.abbr})`}
			aria-pressed={isSelected}
			className={[
				'flex-col h-14 w-full gap-0.5 py-1.5 px-1',
				colors.bg,
				colors.border,
				colors.text,
				isSelected
					? 'ring-2 ring-offset-1 ring-zinc-800 border-zinc-800 shadow-sm'
					: 'hover:brightness-95 hover:bg-inherit',
			].join(' ')}
		>
			<span className="font-mono text-xs font-bold leading-none">{symbol.abbr}</span>
			<span className="text-[9px] leading-tight text-center line-clamp-2 opacity-70 px-0.5">
				{symbol.name}
			</span>
		</Button>
	);
}
