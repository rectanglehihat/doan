'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/ui/molecules/UserMenu';
import { useUserStore } from '@/store/useUserStore';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
	const user = useUserStore((s) => s.user);
	const isLoading = useUserStore((s) => s.isLoading);
	const { signOut } = useAuth();

	const handleSignOut = useCallback(async () => {
		await signOut();
	}, [signOut]);

	return (
		<header className="flex items-center px-4 h-10 bg-zinc-50 border-b border-zinc-200 shrink-0">
			<div className="flex-1">
				<Link
					href="/"
					className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
				>
					DOAN
				</Link>
			</div>
			<div className="flex-1 flex justify-center">
				<Link
					href="/editor"
					className="text-sm font-semibold tracking-widest text-zinc-900 uppercase hover:text-zinc-900 transition-colors"
				>
					도안 만들기
				</Link>
			</div>
			<div className="flex-1 flex justify-end items-center gap-3">
				{!isLoading && !user && (
					<>
						<Link
							href="/login"
							className="text-xs font-semibold tracking-widest text-zinc-500 uppercase hover:text-zinc-900 transition-colors"
						>
							Sign In
						</Link>
						<div
							className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-400"
							aria-hidden="true"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<circle
									cx="12"
									cy="8"
									r="4"
								/>
								<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
							</svg>
						</div>
					</>
				)}
				{!isLoading && user && (
					<UserMenu
						user={user}
						onSignOut={handleSignOut}
					/>
				)}
			</div>
		</header>
	);
}
