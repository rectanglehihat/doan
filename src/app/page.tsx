import Link from 'next/link';

const features = [
	{
		title: '격자 그리기',
		description: '마우스 클릭 또는 드래그로 뜨개 기호와 색상을 격자에 배치합니다.',
	},
	{
		title: '기호 팔레트',
		description: '국제 표준 대바늘·코바늘 기호를 선택해 도안을 구성합니다.',
	},
	{
		title: 'PDF 내보내기',
		description: '완성된 도안을 PDF로 저장하고 기호 범례를 자동으로 생성합니다.',
	},
];

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-24 gap-24">
			<section className="flex flex-col items-center gap-6 text-center max-w-xl">
				<h1 className="text-4xl font-bold tracking-tight text-zinc-900">
					뜨개 도안을 더 쉽게
				</h1>
				<p className="text-base text-zinc-500 leading-relaxed">
					격자에 기호와 색상을 칠하고 PDF로 출력하는 무료 온라인 뜨개 도안 에디터입니다.
				</p>
				<Link
					href="/editor"
					className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
				>
					도안 만들기
				</Link>
			</section>

			<section className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
				{features.map((feature) => (
					<div
						key={feature.title}
						className="flex flex-col gap-2 p-6 rounded-lg border border-zinc-200 bg-white"
					>
						<h2 className="text-sm font-semibold text-zinc-900">{feature.title}</h2>
						<p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
					</div>
				))}
			</section>
		</main>
	);
}
