import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: '뜨개 도안 만들기 가이드',
	description:
		'도안 에디터로 뜨개질 도안을 만드는 방법을 단계별로 안내합니다. 그리드 설정부터 기호 배치, PDF 출력까지 10분이면 완성.',
	alternates: {
		canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/guide`,
	},
};

const STEPS = [
	{
		step: 1,
		title: '그리드 크기 설정',
		description:
			'도안의 행(row)과 열(column) 수를 설정합니다. 예를 들어 20코 × 30단 도안을 만들려면 열 20, 행 30으로 입력합니다.',
	},
	{
		step: 2,
		title: '뜨개 기호 선택',
		description:
			'왼쪽 팔레트에서 사용할 뜨개 기호를 선택합니다. 대바늘 기호(겉뜨기, 안뜨기, 코늘리기 등)와 코바늘 기호를 모두 지원합니다.',
	},
	{
		step: 3,
		title: '셀에 기호 배치',
		description:
			'그리드의 셀을 클릭하거나 드래그해 선택한 기호를 배치합니다. 드래그로 여러 셀을 한 번에 채울 수 있습니다.',
	},
	{
		step: 4,
		title: 'PDF로 출력',
		description:
			'도안이 완성되면 "PDF 출력" 버튼을 클릭해 파일을 저장하거나 인쇄합니다. A4 용지에 맞게 자동 레이아웃됩니다.',
	},
];

const TIPS = [
	'셀 크기를 크게 설정하면 복잡한 기호도 잘 보입니다.',
	'도안 완성 전 미리보기로 전체 레이아웃을 확인하세요.',
	'자주 쓰는 기호 조합은 구역을 나눠 반복 배치하면 편리합니다.',
	'PDF 출력 시 A4 가로 방향을 선택하면 넓은 도안도 한 페이지에 담을 수 있습니다.',
];

export default function GuidePage() {
	return (
		<main className="max-w-2xl mx-auto px-6 py-12">
			<nav className="text-sm text-gray-500 mb-6">
				<Link href="/" className="hover:underline">
					홈
				</Link>
				<span className="mx-2">/</span>
				<span>가이드</span>
			</nav>

			<h1 className="text-3xl font-bold mb-4">뜨개 도안 만들기 가이드</h1>
			<p className="text-gray-600 mb-10">
				도안 에디터를 처음 사용하시나요? 아래 단계를 따라 하면 누구나 10분 안에 나만의 뜨개질 도안을
				완성할 수 있습니다.
			</p>

			<section aria-labelledby="steps-heading" className="mb-12">
				<h2 id="steps-heading" className="text-xl font-semibold mb-6">
					4단계로 완성하는 뜨개 도안
				</h2>
				<ol className="space-y-6">
					{STEPS.map(({ step, title, description }) => (
						<li key={step} className="flex gap-4">
							<span
								className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center"
								aria-hidden="true"
							>
								{step}
							</span>
							<div>
								<h3 className="font-semibold mb-1">{title}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">{description}</p>
							</div>
						</li>
					))}
				</ol>
			</section>

			<section aria-labelledby="tips-heading" className="mb-12">
				<h2 id="tips-heading" className="text-xl font-semibold mb-4">
					도안 작성 팁
				</h2>
				<ul className="space-y-2">
					{TIPS.map((tip) => (
						<li key={tip} className="flex gap-2 text-sm text-gray-600">
							<span aria-hidden="true">•</span>
							<span>{tip}</span>
						</li>
					))}
				</ul>
			</section>

			<section aria-labelledby="supported-heading" className="mb-12">
				<h2 id="supported-heading" className="text-xl font-semibold mb-4">
					지원하는 뜨개 기호
				</h2>
				<p className="text-sm text-gray-600 leading-relaxed">
					도안 에디터는 대바늘 기호(겉뜨기, 안뜨기, 오른코 늘리기, 왼코 늘리기, 코 줄이기 등)와 코바늘
					기호(사슬뜨기, 짧은뜨기, 긴뜨기, 한길긴뜨기 등)를 모두 지원합니다. 국제 표준 기호를 사용해
					전 세계 뜨개 패턴과 호환됩니다.
				</p>
			</section>

			<div className="border-t pt-8">
				<Link
					href="/"
					className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
				>
					지금 도안 만들기 →
				</Link>
			</div>
		</main>
	);
}
