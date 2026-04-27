'use client';

import { Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SocialLoginButton } from '@/components/ui/atoms/SocialLoginButton';
import { AUTH_ERROR_CODES } from '@/types/auth';
import type { AuthError } from '@/types/auth';

const ERROR_MESSAGE: Record<AuthError, string> = {
	oauth_failed: '로그인에 실패했습니다. 다시 시도해주세요.',
	session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
	unknown: '알 수 없는 오류가 발생했습니다.',
};

function parseAuthError(raw: string | null): AuthError | null {
	if (!raw) return null;
	const found = AUTH_ERROR_CODES.find((code) => code === raw);
	return found ?? 'unknown';
}

function LoginForm() {
	const searchParams = useSearchParams();
	const authError = parseAuthError(searchParams.get('error'));
	const [googleLoading, setGoogleLoading] = useState(false);
	const [kakaoLoading, setKakaoLoading] = useState(false);
	const { signInWithGoogle, signInWithKakao } = useAuth();

	const handleGoogleSignIn = useCallback(async () => {
		setGoogleLoading(true);
		await signInWithGoogle();
		setGoogleLoading(false);
	}, [signInWithGoogle]);

	const handleKakaoSignIn = useCallback(async () => {
		setKakaoLoading(true);
		await signInWithKakao();
		setKakaoLoading(false);
	}, [signInWithKakao]);

	return (
		<>
			{authError && (
				<div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGE[authError]}</div>
			)}
			<div className="flex flex-col gap-3">
				<SocialLoginButton
					provider="google"
					isLoading={googleLoading}
					onClick={handleGoogleSignIn}
				/>
				<SocialLoginButton
					provider="kakao"
					isLoading={kakaoLoading}
					onClick={handleKakaoSignIn}
				/>
			</div>
		</>
	);
}

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50">
			<div className="w-full max-w-sm px-6 py-8 bg-white rounded-2xl shadow-sm border border-zinc-200">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-zinc-900">DOAN</h1>
					<p className="mt-2 text-sm text-zinc-500">뜨개 도안 에디터에 로그인하세요</p>
				</div>
				<Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-zinc-100" />}>
					<LoginForm />
				</Suspense>
			</div>
		</div>
	);
}
