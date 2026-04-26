import '@testing-library/jest-dom';

// Supabase 환경변수 — 테스트에서 client.ts의 환경변수 검사를 통과시키기 위한 더미값
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// jsdom에 없는 브라우저 API 폴리필
globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
