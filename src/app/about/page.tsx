import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/constants/site';
import { stringifyJsonLd } from '@/lib/utils/json-ld';

export const metadata: Metadata = {
	title: '도안 소개 — 무료 뜨개질 도안 에디터',
	description:
		'도안은 대바늘·코바늘 뜨개 기호를 그리드에 배치해 나만의 패턴을 만드는 무료 온라인 뜨개질 도안 에디터입니다. PDF 출력을 지원합니다.',
	alternates: {
		canonical: `${SITE_URL}/about`,
	},
};

const FEATURES = [
	{
		title: '직관적인 그리드 편집',
		description:
			'셀 클릭·드래그 한 번으로 뜨개 기호를 배치합니다. 실행 취소·다시 실행(Ctrl+Z/Y, 최대 50단계)으로 편집 부담 없이 작업할 수 있습니다.',
	},
	{
		title: '풍부한 뜨개 기호 지원',
		description:
			'대바늘 17개·코바늘 29개 등 국제 표준 기호 46개를 지원합니다. 기호와 색상을 함께 사용해 컬러 도안도 만들 수 있습니다.',
	},
	{
		title: '대칭 모드 & 고급 편집',
		description:
			'좌우·상하·4방향 대칭 모드로 복잡한 무늬를 빠르게 완성합니다. 영역 선택 후 Ctrl+C/V로 반복 구간을 복사·붙여넣고, 행·열 축약으로 긴 도안을 간결하게 정리할 수 있습니다.',
	},
	{
		title: '도안 자동 저장',
		description:
			'편집 내용이 0.3초마다 자동으로 저장됩니다. 비로그인 시 브라우저에 최대 5개, Google 계정으로 로그인하면 클라우드에 무제한으로 저장하고 다른 기기에서도 이어 작업할 수 있습니다.',
	},
	{
		title: 'PDF 출력',
		description:
			'완성된 도안을 PDF로 저장하거나 바로 인쇄할 수 있습니다. A4·Letter·B4 용지와 가로·세로 방향을 선택할 수 있으며, 기호 범례·재료 정보가 자동으로 포함됩니다.',
	},
	{
		title: '무료·설치 불필요',
		description: '회원가입이나 앱 설치 없이 브라우저에서 바로 사용할 수 있습니다.',
	},
];

const FAQS = [
	{
		question: '도안 에디터는 무료인가요?',
		answer: '네, 완전 무료입니다. 회원가입 없이 브라우저에서 바로 사용할 수 있습니다.',
	},
	{
		question: '어떤 기기에서 사용할 수 있나요?',
		answer: 'PC, 태블릿, 스마트폰 등 최신 웹 브라우저가 설치된 모든 기기에서 사용할 수 있습니다.',
	},
	{
		question: '만든 도안을 저장할 수 있나요?',
		answer:
			'편집 내용은 0.3초마다 자동으로 저장됩니다. 비로그인 상태에서는 브라우저에 최대 5개까지 보관되며, Google 계정으로 로그인하면 클라우드에 무제한으로 저장하고 다른 기기에서도 이어 작업할 수 있습니다. 완성된 도안은 PDF로도 내보낼 수 있습니다.',
	},
	{
		question: '대바늘과 코바늘 기호를 모두 지원하나요?',
		answer: '네, 대바늘·코바늘 국제 표준 기호를 모두 포함하고 있습니다.',
	},
	{
		question: '도안 크기는 얼마나 크게 만들 수 있나요?',
		answer:
			'행(단)과 열(코)을 자유롭게 설정할 수 있습니다. 대형 도안도 PDF 한 페이지에 맞게 자동 레이아웃됩니다.',
	},
];

const faqJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: FAQS.map(({ question, answer }) => ({
		'@type': 'Question',
		name: question,
		acceptedAnswer: {
			'@type': 'Answer',
			text: answer,
		},
	})),
};

const breadcrumbJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [
		{ '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
		{ '@type': 'ListItem', position: 2, name: '소개', item: `${SITE_URL}/about` },
	],
};

export default function AboutPage() {
	return (
		<main className="max-w-2xl mx-auto px-6 py-12">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
			/>

			<nav className="text-sm text-gray-500 mb-6">
				<Link href="/" className="hover:underline">
					홈
				</Link>
				<span className="mx-2">/</span>
				<span>소개</span>
			</nav>

			<h1 className="text-3xl font-bold mb-4">도안 — 무료 뜨개질 도안 에디터</h1>
			<p className="text-gray-600 mb-10 leading-relaxed">
				도안은 누구나 쉽게 뜨개질 도안을 만들 수 있는 무료 온라인 도구입니다. 그리드에 대바늘·코바늘
				기호를 배치하고 PDF로 출력하면 나만의 뜨개 패턴이 완성됩니다.
			</p>

			<section aria-labelledby="features-heading" className="mb-12">
				<h2 id="features-heading" className="text-xl font-semibold mb-6">
					주요 기능
				</h2>
				<ul className="space-y-5">
					{FEATURES.map(({ title, description }) => (
						<li key={title}>
							<h3 className="font-semibold mb-1">{title}</h3>
							<p className="text-sm text-gray-600 leading-relaxed">{description}</p>
						</li>
					))}
				</ul>
			</section>

			<section aria-labelledby="faq-heading" className="mb-12">
				<h2 id="faq-heading" className="text-xl font-semibold mb-6">
					자주 묻는 질문
				</h2>
				<dl className="space-y-6">
					{FAQS.map(({ question, answer }) => (
						<div key={question}>
							<dt className="font-semibold mb-1">{question}</dt>
							<dd className="text-sm text-gray-600 leading-relaxed">{answer}</dd>
						</div>
					))}
				</dl>
			</section>

			<div className="border-t pt-8 flex gap-4">
				<Link
					href="/"
					className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
				>
					도안 만들기 시작 →
				</Link>
				<Link
					href="/guide"
					className="inline-block border border-slate-900 text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
				>
					사용 가이드 보기
				</Link>
			</div>
		</main>
	);
}
