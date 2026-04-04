import { describe, it, expect } from 'vitest';
import { hexToHsv, hsvToHex, isValidHex } from './color-utils';

describe('hexToHsv', () => {
	it('#ff0000을 { h: 0, s: 1, v: 1 }로 변환한다 (순수 빨강)', () => {
		expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 1, v: 1 });
	});

	it('#000000을 { h: 0, s: 0, v: 0 }으로 변환한다 (검정)', () => {
		expect(hexToHsv('#000000')).toEqual({ h: 0, s: 0, v: 0 });
	});

	it('#ffffff을 { h: 0, s: 0, v: 1 }로 변환한다 (흰색)', () => {
		expect(hexToHsv('#ffffff')).toEqual({ h: 0, s: 0, v: 1 });
	});

	it('#00ff00을 { h: 120, s: 1, v: 1 }로 변환한다 (순수 초록)', () => {
		expect(hexToHsv('#00ff00')).toEqual({ h: 120, s: 1, v: 1 });
	});

	it('#0000ff을 { h: 240, s: 1, v: 1 }로 변환한다 (순수 파랑)', () => {
		expect(hexToHsv('#0000ff')).toEqual({ h: 240, s: 1, v: 1 });
	});
});

describe('hsvToHex', () => {
	it('(0, 1, 1)을 "#ff0000"으로 변환한다', () => {
		expect(hsvToHex(0, 1, 1)).toBe('#ff0000');
	});

	it('(0, 0, 0)을 "#000000"으로 변환한다', () => {
		expect(hsvToHex(0, 0, 0)).toBe('#000000');
	});

	it('(0, 0, 1)을 "#ffffff"으로 변환한다', () => {
		expect(hsvToHex(0, 0, 1)).toBe('#ffffff');
	});

	it('(120, 1, 1)을 "#00ff00"으로 변환한다', () => {
		expect(hsvToHex(120, 1, 1)).toBe('#00ff00');
	});

	it('hsvToHex(hexToHsv(hex))는 원래 hex를 반환한다 (round-trip)', () => {
		const original = '#ff4d4d';
		const { h, s, v } = hexToHsv(original);
		expect(hsvToHex(h, s, v)).toBe(original);
	});
});

describe('isValidHex', () => {
	it('#ff0000은 유효하다', () => {
		expect(isValidHex('#ff0000')).toBe(true);
	});

	it('#FF0000은 유효하다 (대문자)', () => {
		expect(isValidHex('#FF0000')).toBe(true);
	});

	it('ff0000은 유효하지 않다 (# 없음)', () => {
		expect(isValidHex('ff0000')).toBe(false);
	});

	it('#gg0000은 유효하지 않다 (유효하지 않은 문자)', () => {
		expect(isValidHex('#gg0000')).toBe(false);
	});

	it('#ff00은 유효하지 않다 (너무 짧음)', () => {
		expect(isValidHex('#ff00')).toBe(false);
	});

	it('빈 문자열은 유효하지 않다', () => {
		expect(isValidHex('')).toBe(false);
	});
});
