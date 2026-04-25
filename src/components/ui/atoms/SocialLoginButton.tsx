'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import type { AuthProvider } from '@/types/auth';
import { cn } from '@/lib/utils/cn';

const PROVIDER_LABEL: Record<AuthProvider, string> = {
  google: 'Google로 계속하기',
  kakao: '카카오로 계속하기',
};

const providerClasses: Record<AuthProvider, string> = {
  google:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
  kakao:
    'bg-yellow-300 text-gray-900 border border-yellow-400 hover:bg-yellow-400 active:bg-yellow-500',
};

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const KakaoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 1C4.582 1 1 3.79 1 7.22c0 2.163 1.418 4.065 3.573 5.17l-.91 3.393c-.08.298.271.534.533.356l3.988-2.66A9.7 9.7 0 0 0 9 13.44c4.418 0 8-2.79 8-6.22C17 3.79 13.418 1 9 1z"
      fill="#3C1E1E"
    />
  </svg>
);

const PROVIDER_ICON: Record<AuthProvider, () => React.ReactElement> = {
  google: GoogleIcon,
  kakao: KakaoIcon,
};

const base =
  'inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

interface SocialLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: AuthProvider;
  isLoading?: boolean;
}

export const SocialLoginButton = forwardRef<HTMLButtonElement, SocialLoginButtonProps>(
  (
    {
      provider,
      isLoading = false,
      type = 'button',
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const Icon = PROVIDER_ICON[provider];
    const label = PROVIDER_LABEL[provider];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isLoading}
        className={cn(base, providerClasses[provider], className)}
        {...props}
      >
        {isLoading ? (
          <span>로딩 중...</span>
        ) : (
          <>
            <Icon />
            <span>{label}</span>
          </>
        )}
        {children}
      </button>
    );
  },
);

SocialLoginButton.displayName = 'SocialLoginButton';
