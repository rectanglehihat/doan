import LZString from 'lz-string';

export function compressString(input: string): string {
	return LZString.compressToUTF16(input);
}

export function decompressString(compressed: string): string | null {
	return LZString.decompressFromUTF16(compressed);
}
