import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SITE_URL, SITE_DESCRIPTION as DESCRIPTION } from '@/constants/site';
import { stringifyJsonLd } from '@/lib/utils/json-ld';
import { Navbar } from '@/components/editor/Navbar';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'DOAN - 뜨개 도안 에디터',
	description: DESCRIPTION,
	url: SITE_URL,
	applicationCategory: 'UtilitiesApplication',
	operatingSystem: 'Web',
	inLanguage: 'ko',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'KRW',
	},
	keywords:
		'뜨개질 도안, 뜨개 도안, 도안 에디터, 뜨개 에디터, 뜨개 도안 만들기, 뜨개 도안 에디터, 대바늘 도안, 코바늘 도안, 뜨개 차트, 도안 만들기, 무료 도안, 무료 도안 만들기, 도안 pdf, 무료 뜨개 도안, 무료 뜨개질 도안 만들기, 뜨개 도안 만들기, 대바늘 무료 도안, 코바늘 무료 도안',
};

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: 'DOAN - 뜨개 도안 에디터',
		template: '%s | DOAN',
	},
	description: DESCRIPTION,
	keywords: [
		'뜨개질 도안',
		'뜨개 도안',
		'뜨개 도안 만들기',
		'도안 에디터',
		'뜨개 에디터',
		'대바늘 도안',
		'코바늘 도안',
		'뜨개 차트',
		'뜨개 기호',
		'도안 PDF 출력',
		'온라인 뜨개 도구',
		'무료 도안',
	],
	authors: [{ name: 'DOAN' }],
	creator: 'DOAN',
	alternates: {
		canonical: SITE_URL,
	},
	openGraph: {
		title: 'DOAN - 뜨개 도안 에디터',
		description: DESCRIPTION,
		url: SITE_URL,
		siteName: 'DOAN',
		locale: 'ko_KR',
		type: 'website',
		images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '도안 뜨개 도안 에디터' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'DOAN - 뜨개 도안 에디터',
		description: DESCRIPTION,
		images: ['/og-image.png'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	verification: {
		google: 'lg5pbOVQqrF7uHHbRoViT7IjOl3_KLuO45Y-tW1VmrI',
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ko"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
					suppressHydrationWarning
				/>
				<Navbar />
				{children}
			</body>
		</html>
	);
}
