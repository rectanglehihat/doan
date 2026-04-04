export function hexToHsv(hex: string): { h: number; s: number; v: number } {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	const v = max;
	const s = max === 0 ? 0 : delta / max;

	let h = 0;
	if (delta !== 0) {
		if (max === r) {
			h = ((g - b) / delta) % 6;
			h = h * 60;
		} else if (max === g) {
			h = ((b - r) / delta) * 60 + 120;
		} else {
			h = ((r - g) / delta) * 60 + 240;
		}
	}

	if (h < 0) h += 360;

	return { h: Math.round(h), s, v };
}

export function hsvToHex(h: number, s: number, v: number): string {
	const c = v * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = v - c;

	let r = 0;
	let g = 0;
	let b = 0;

	if (h >= 0 && h < 60) {
		r = c; g = x; b = 0;
	} else if (h >= 60 && h < 120) {
		r = x; g = c; b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0; g = c; b = x;
	} else if (h >= 180 && h < 240) {
		r = 0; g = x; b = c;
	} else if (h >= 240 && h < 300) {
		r = x; g = 0; b = c;
	} else {
		r = c; g = 0; b = x;
	}

	const toHex = (n: number): string => {
		return Math.round((n + m) * 255).toString(16).padStart(2, '0');
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function isValidHex(hex: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(hex);
}
