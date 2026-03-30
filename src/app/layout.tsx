import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const DESCRIPTION = '간단한 입력으로 뜨개질 도안을 시각적으로 생성하고 PDF로 출력할 수 있는 웹 기반 도안 에디터';

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
	title: {
		default: '도안 - 뜨개 도안 에디터',
		template: '%s | 도안',
	},
	description: DESCRIPTION,
	openGraph: {
		title: '도안 - 뜨개 도안 에디터',
		description: DESCRIPTION,
		locale: 'ko_KR',
		type: 'website',
		images: [{ url: '/og-image.png', width: 1200, height: 630 }],
	},
	twitter: {
		card: 'summary_large_image',
		title: '도안 - 뜨개 도안 에디터',
		description: DESCRIPTION,
		images: ['/og-image.png'],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ko"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
