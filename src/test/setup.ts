import '@testing-library/jest-dom';

// jsdom에 없는 브라우저 API 폴리필
globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
