'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { hexToHsv, hsvToHex, isValidHex } from '@/lib/utils/color-utils';

interface ColorPickerProps {
	selectedColor: string | null;
	onColorChange: (color: string | null) => void;
	recentColors: string[];
	disabled?: boolean;
	className?: string;
}

export function ColorPicker({
	selectedColor,
	onColorChange,
	recentColors,
	disabled = false,
	className,
}: ColorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hexInput, setHexInput] = useState(selectedColor ?? '#ff0000');
	const [hue, setHue] = useState(0);
	const [sat, setSat] = useState(1);
	const [hsv, setHsv] = useState(1);
	const containerRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	const isDraggingRef = useRef(false);
	const hueRef = useRef(hue);
	const satRef = useRef(sat);
	const hsvRef = useRef(hsv);
	const onColorChangeRef = useRef(onColorChange);

	// Keep onColorChange ref in sync (stale closure 방지)
	useEffect(() => {
		onColorChangeRef.current = onColorChange;
	}, [onColorChange]);

	// Keep refs in sync for drag handler
	useEffect(() => {
		hueRef.current = hue;
	}, [hue]);
	useEffect(() => {
		satRef.current = sat;
	}, [sat]);
	useEffect(() => {
		hsvRef.current = hsv;
	}, [hsv]);

	// Initialize state when popup opens
	useEffect(() => {
		if (!isOpen) return;
		const initColor = selectedColor;
		if (initColor && isValidHex(initColor)) {
			const { h, s, v } = hexToHsv(initColor);
			setHue(h);
			setSat(s);
			setHsv(v);
			setHexInput(initColor);
		} else {
			setHue(0);
			setSat(1);
			setHsv(1);
			setHexInput('#ff0000');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	// Outside click and Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false);
		};
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Mouse drag for saturation/value picker
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current || !pickerRef.current) return;
			const rect = pickerRef.current.getBoundingClientRect();
			const newSat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const newVal = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
			setSat(newSat);
			setHsv(newVal);
			const newHex = hsvToHex(hueRef.current, newSat, newVal);
			setHexInput(newHex);
		};
		const handleMouseUp = () => {
			if (isDraggingRef.current) {
				const hex = hsvToHex(hueRef.current, satRef.current, hsvRef.current);
				onColorChangeRef.current(hex);
			}
			isDraggingRef.current = false;
		};
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	const handleTriggerClick = useCallback(() => {
		if (!disabled) setIsOpen((prev) => !prev);
	}, [disabled]);

	const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setHexInput(e.target.value);
	}, []);

	const handleHexBlur = useCallback(() => {
		if (isValidHex(hexInput)) {
			const { h, s, v } = hexToHsv(hexInput);
			setHue(h);
			setSat(s);
			setHsv(v);
			onColorChange(hexInput);
		} else {
			setHexInput(selectedColor ?? '#ff0000');
		}
	}, [hexInput, selectedColor, onColorChange]);

	const handleHueChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newHue = Number(e.target.value);
			setHue(newHue);
			const newHex = hsvToHex(newHue, satRef.current, hsvRef.current);
			setHexInput(newHex);
			onColorChange(newHex);
		},
		[onColorChange],
	);

	const handlePickerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		isDraggingRef.current = true;
		if (pickerRef.current) {
			const rect = pickerRef.current.getBoundingClientRect();
			const newSat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const newVal = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
			setSat(newSat);
			setHsv(newVal);
			const newHex = hsvToHex(hueRef.current, newSat, newVal);
			setHexInput(newHex);
		}
	}, []);

	const handleRecentColorClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			const color = e.currentTarget.dataset['color'];
			if (!color || !isValidHex(color)) return;
			const { h, s, v } = hexToHsv(color);
			setHue(h);
			setSat(s);
			setHsv(v);
			setHexInput(color);
			onColorChange(color);
		},
		[onColorChange],
	);

	const previewColor = isValidHex(hexInput) ? hexInput : (selectedColor ?? '#ffffff');

	return (
		<div
			ref={containerRef}
			className={cn('relative inline-block', className)}
		>
			{/* Trigger Button */}
			<button
				type="button"
				aria-label="색상 선택"
				disabled={disabled}
				onClick={handleTriggerClick}
				className={cn(
					'flex items-center gap-1.5 h-8 px-2 rounded bg-white hover:bg-zinc-50 text-xs text-zinc-700 transition-colors',
					'disabled:pointer-events-none disabled:opacity-50',
					isOpen && 'ring-2 ring-zinc-900 ring-offset-1',
				)}
			>
				<span
					className="w-4 h-4 rounded-sm border border-zinc-300 shrink-0"
					style={{ backgroundColor: selectedColor ?? 'transparent' }}
					aria-hidden="true"
				/>
				색상
			</button>

			{/* Popup */}
			{isOpen && (
				<div
					role="dialog"
					aria-label="색상 선택 팝업"
					className="absolute top-full left-0 mt-1 z-50 w-72 rounded-lg border border-zinc-200 bg-white shadow-xl p-4 flex flex-col gap-3"
				>
					{/* Saturation/Value Picker */}
					<div
						ref={pickerRef}
						className="relative h-40 rounded overflow-hidden select-none"
						style={{ cursor: 'crosshair', background: `linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
						onMouseDown={handlePickerMouseDown}
					>
						<div
							className="absolute inset-0 pointer-events-none"
							style={{ background: 'linear-gradient(to bottom, transparent, #000)' }}
						/>
						<div
							className="absolute w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
							style={{
								left: `${sat * 100}%`,
								top: `${(1 - hsv) * 100}%`,
								transform: 'translate(-50%, -50%)',
							}}
						/>
					</div>

					{/* HUE Slider */}
					<div>
						<div className="text-[10px] font-medium text-zinc-400 mb-1.5 tracking-widest">HUE</div>
						<input
							type="range"
							min={0}
							max={360}
							step={1}
							value={hue}
							onChange={handleHueChange}
							className="w-full h-3 rounded appearance-none cursor-pointer"
							style={{
								background:
									'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
							}}
						/>
					</div>

					{/* HEX Input */}
					<div>
						<div className="text-[10px] font-medium text-zinc-400 mb-1.5 tracking-widest">HEX</div>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={hexInput}
								onChange={handleHexChange}
								onBlur={handleHexBlur}
								className="flex-1 h-10 px-3 border border-zinc-200 rounded bg-zinc-50 text-sm font-mono outline-none focus:ring-2 focus:ring-zinc-400"
								maxLength={7}
							/>
							<div
								className="w-10 h-10 rounded border border-zinc-200 shrink-0"
								style={{ backgroundColor: previewColor }}
								aria-hidden="true"
							/>
						</div>
					</div>

					{/* Recent Colors */}
					{recentColors.length > 0 && (
						<div>
							<div className="text-[10px] font-medium text-zinc-400 mb-1.5 tracking-widest">RECENT COLORS</div>
							<div className="flex gap-1 flex-wrap">
								{recentColors.map((color) => (
									<button
										key={color}
										type="button"
										aria-label={`최근 색상 ${color}`}
										data-color={color}
										onClick={handleRecentColorClick}
										className="w-8 h-8 rounded border border-zinc-200 hover:ring-2 hover:ring-zinc-400 transition-all"
										style={{ backgroundColor: color }}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
