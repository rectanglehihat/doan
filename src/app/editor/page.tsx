import type { Metadata } from 'next';
import { SITE_URL } from '@/constants/site';
import { stringifyJsonLd } from '@/lib/utils/json-ld';
import { EditorClient } from '@/components/editor/EditorClient';

export const metadata: Metadata = {
	title: '도안 편집기',
	description: '뜨개 기호를 그리드에 배치하고 PDF로 출력하는 온라인 뜨개질 도안 에디터입니다.',
	alternates: {
		canonical: `${SITE_URL}/editor`,
	},
};

const softwareAppJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	name: 'DOAN 도안 편집기',
	applicationCategory: 'UtilitiesApplication',
	operatingSystem: 'Web',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'KRW',
	},
	url: `${SITE_URL}/editor`,
	description: '뜨개 기호를 그리드에 배치하고 PDF로 출력하는 온라인 뜨개질 도안 에디터입니다.',
};

export default function EditorPage() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(softwareAppJsonLd) }}
			/>
			<EditorClient />
		</>
	);
}
