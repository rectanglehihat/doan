import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/constants/site';
import { stringifyJsonLd } from '@/lib/utils/json-ld';

export const metadata: Metadata = {
	title: '뜨개 도안 만들기 가이드',
	description:
		'도안 에디터로 뜨개질 도안을 만드는 방법을 단계별로 안내합니다. 그리드 설정, 기호 배치, 색상, 대칭, 주석, PDF 출력까지 모든 기능을 설명합니다.',
	alternates: {
		canonical: `${SITE_URL}/guide`,
	},
};

const STEPS = [
	{
		step: 1,
		title: '그리드 크기 설정',
		description:
			'오른쪽 사이드바 "그리드 설정"에서 행(단)과 열(코) 수를 입력합니다. 예를 들어 20코 × 30단 도안을 만들려면 열 20, 행 30으로 입력합니다. 셀 크기 슬라이더로 각 칸의 크기를 5px~50px 사이에서 조절할 수 있습니다.',
	},
	{
		step: 2,
		title: '뜨개 기호 선택',
		description:
			'사이드바 기호 팔레트에서 대바늘 또는 코바늘 탭을 선택한 뒤 원하는 기호를 클릭합니다. 기초·기본뜨기·늘리기·줄이기·특수뜨기 카테고리로 정리되어 있습니다.',
	},
	{
		step: 3,
		title: '셀에 기호 배치',
		description:
			'그리드의 셀을 클릭하거나 드래그해 선택한 기호를 배치합니다. 드래그하면 여러 셀을 한 번에 채울 수 있습니다. 색상 모드로 전환하면 기호 대신 배경 색상을 칠할 수 있습니다.',
	},
	{
		step: 4,
		title: 'PDF로 출력',
		description:
			'도안이 완성되면 사이드바 하단 "PDF 내보내기" 버튼을 클릭합니다. 페이지 크기(A4, B4, US Letter 등)와 방향(가로/세로)을 선택할 수 있으며, 도안 제목·난이도·재료 정보가 PDF에 함께 포함됩니다.',
	},
];

const FEATURES = [
	{
		id: 'grid',
		title: '그리드 설정',
		items: [
			{
				label: '행·열 크기',
				detail:
					'행(단)은 세로 줄 수, 열(코)는 가로 줄 수를 의미합니다. 최소 2, 최대 100까지 입력할 수 있습니다. 크기를 변경해도 기존에 배치한 기호는 유지됩니다.',
			},
			{
				label: '셀 크기',
				detail:
					'슬라이더로 각 칸의 픽셀 크기를 조절합니다. 기호를 크게 보고 싶을 때는 키우고, 전체 도안을 한눈에 보고 싶을 때는 줄이세요.',
			},
			{
				label: '줌 & 패닝',
				detail:
					'Ctrl + 마우스 휠로 확대·축소, 스페이스바를 누른 채 드래그하거나 마우스 휠로 캔버스를 이동합니다. 트랙패드에서는 2손가락 핀치로 줌, 스크롤로 패닝할 수 있습니다. F 키를 누르면 그리드 전체가 화면에 딱 맞게 맞춰집니다.',
			},
		],
	},
	{
		id: 'symbols',
		title: '기호 배치와 색상',
		items: [
			{
				label: '기호 배치',
				detail:
					'팔레트에서 기호를 선택한 뒤 셀을 클릭하거나 드래그하면 기호가 배치됩니다. 같은 기호가 이미 있는 셀을 클릭하면 기호가 제거됩니다.',
			},
			{
				label: '색상 칠하기',
				detail:
					'색상 피커에서 색상을 선택하면 색상 모드로 전환됩니다. 셀을 클릭하거나 드래그해 배경 색상을 칠할 수 있습니다. 기호와 색상을 함께 사용하면 컬러 패턴 도안을 만들 수 있습니다.',
			},
			{
				label: '최근 색상',
				detail: '최근 사용한 색상 6개가 팔레트 상단에 표시됩니다. 클릭하면 즉시 해당 색상으로 전환됩니다.',
			},
		],
	},
	{
		id: 'symmetry',
		title: '대칭 모드',
		items: [
			{
				label: '좌우 대칭',
				detail:
					'도구모음에서 좌우 대칭 버튼을 켜면, 왼쪽 절반에 기호를 배치하면 오른쪽에 자동으로 미러링됩니다. 숄이나 넥라인처럼 좌우 대칭 도안에 유용합니다.',
			},
			{
				label: '상하 대칭',
				detail:
					'상하 대칭 버튼을 켜면 위쪽에 배치한 기호가 아래쪽에 자동으로 반영됩니다. 상하 반복 패턴 작업에 활용하세요.',
			},
			{
				label: '4방향 대칭',
				detail:
					'좌우·상하를 모두 켜면 4각 대칭이 적용됩니다. 중심점 기준으로 한 번 배치하면 네 방향 모두 동시에 채워집니다. 레이스·원형 요크·대칭 무늬 작업에 적합합니다.',
			},
		],
	},
	{
		id: 'selection',
		title: '선택 & 복사·붙여넣기',
		items: [
			{
				label: '범위 선택',
				detail:
					'도구모음에서 선택 모드를 켠 뒤 그리드를 드래그하면 사각형 범위를 선택할 수 있습니다. 선택 영역은 하이라이트로 표시됩니다.',
			},
			{
				label: '복사·붙여넣기',
				detail:
					'범위를 선택한 뒤 Ctrl+C로 복사하고, 원하는 위치에서 Ctrl+V로 붙여넣습니다. 반복 무늬를 여러 위치에 빠르게 배치할 때 활용하세요.',
			},
			{
				label: '선택 영역 이동',
				detail:
					'선택 상태에서 방향 키를 누르면 선택 영역을 한 칸씩 이동할 수 있습니다. Shift + 방향 키를 누르면 선택 범위의 크기가 조절됩니다.',
			},
		],
	},
	{
		id: 'collapse',
		title: '행·열 축약',
		items: [
			{
				label: '반복 구간 축약',
				detail:
					'패턴이 반복되는 행이나 열 범위를 선택해 "축약" 처리하면 해당 구간이 얇은 블록 하나로 접혀 표시됩니다. 긴 도안을 한눈에 파악하기 좋습니다.',
			},
			{
				label: '축약 해제',
				detail:
					'축약된 블록을 클릭하면 팝오버가 열리며 해제 버튼을 통해 원래 상태로 돌아올 수 있습니다. 데이터는 삭제되지 않고 숨겨진 상태로 유지됩니다.',
			},
			{
				label: 'PDF 출력 시 표기',
				detail: 'PDF에서도 축약 구간은 "• • • 중략"으로 자동 표기됩니다.',
			},
		],
	},
	{
		id: 'annotation',
		title: '주석 (단수·코수 메모)',
		items: [
			{
				label: '행 주석',
				detail:
					'주석 모드를 켠 뒤 행 마커를 클릭하면 해당 행 옆에 텍스트를 추가할 수 있습니다. "2코 늘리기", "진동 줄임 시작" 같은 뜨기 지시를 기록하세요.',
			},
			{
				label: '범위 주석',
				detail:
					'여러 행을 드래그하면 괄호와 함께 범위 주석을 달 수 있습니다. 반복 구간이나 셰이핑 구간을 표시할 때 유용합니다.',
			},
			{
				label: '열 주석',
				detail:
					'열 마커를 클릭하면 특정 열 위·아래에 텍스트를 추가할 수 있습니다. 코 번호나 패널 경계를 표시하는 데 활용하세요.',
			},
		],
	},
	{
		id: 'shape-guide',
		title: '형태선 (Shape Guide)',
		items: [
			{
				label: '보조선 그리기',
				detail:
					'도구모음에서 보조선 그리기 모드를 켜면 그리드 위에 자유롭게 선을 그릴 수 있습니다. 목선·진동·소매산 같은 실루엣을 반투명 가이드라인으로 표시해 셰이핑 위치를 직관적으로 확인할 수 있습니다.',
			},
			{
				label: '보조선 지우기',
				detail:
					'지우기 모드로 전환하면 특정 스트로크를 지우거나 원하지 않는 선을 제거할 수 있습니다. 도구모음의 초기화 버튼으로 모든 보조선을 한번에 삭제합니다.',
			},
			{
				label: '대칭 자동 반영',
				detail: '대칭 모드가 켜져 있으면 보조선도 함께 미러링됩니다.',
			},
		],
	},
	{
		id: 'history',
		title: '실행 취소 & 다시 실행',
		items: [
			{
				label: 'Undo / Redo',
				detail:
					'Ctrl+Z로 직전 동작을 취소하고, Ctrl+Y로 다시 실행합니다. 기호 배치·색상 칠하기·주석 추가·보조선 그리기 등 모든 편집 동작이 히스토리에 쌓이며 최대 50단계까지 되돌릴 수 있습니다.',
			},
		],
	},
	{
		id: 'save',
		title: '저장',
		items: [
			{
				label: '자동 저장',
				detail:
					'편집 내용은 0.3초마다 자동으로 저장됩니다. 비로그인 상태에서는 브라우저 로컬스토리지에 저장되고, Google 계정으로 로그인하면 클라우드에 저장되어 다른 기기에서도 불러올 수 있습니다.',
			},
			{
				label: '도안 제목·메타데이터',
				detail:
					'사이드바 상단에서 도안 제목을 입력하고, 난이도(별점 1~5)와 재료 정보를 기록할 수 있습니다. PDF에 자동으로 포함됩니다.',
			},
			{
				label: '여러 도안 관리',
				detail:
					'저장된 도안 목록에서 불러오기·삭제가 가능합니다. 로컬 저장은 최대 5개, 클라우드 저장은 제한 없이 저장할 수 있습니다.',
			},
		],
	},
	{
		id: 'pdf',
		title: 'PDF 내보내기',
		items: [
			{
				label: '페이지 설정',
				detail:
					'A4, B4, US Letter 등 다양한 용지 크기와 가로·세로 방향을 선택할 수 있습니다. 넓은 도안은 가로 방향으로 출력하면 한 페이지에 담기 편합니다.',
			},
			{
				label: '포함 정보',
				detail:
					'도안 제목, 난이도, 재료, 패턴 타입(대바늘/코바늘)이 PDF 상단에 함께 출력됩니다. 뜨개 기호 범례도 자동으로 추가됩니다.',
			},
		],
	},
];

const SHORTCUTS = [
	{ key: 'Ctrl + Z', desc: '실행 취소' },
	{ key: 'Ctrl + Y', desc: '다시 실행' },
	{ key: 'Ctrl + C', desc: '선택 범위 복사' },
	{ key: 'Ctrl + V', desc: '붙여넣기' },
	{ key: 'F', desc: '그리드를 화면에 맞추기' },
	{ key: 'Ctrl + 휠', desc: '캔버스 확대·축소' },
	{ key: 'Space + 드래그', desc: '캔버스 이동(패닝)' },
	{ key: '방향 키', desc: '선택 영역 이동' },
	{ key: 'Shift + 방향 키', desc: '선택 영역 크기 조절' },
	{ key: 'Escape', desc: '선택 모드 해제' },
	{ key: 'Delete / Backspace', desc: '선택한 보조선 삭제' },
];

const howToJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'HowTo',
	name: '뜨개 도안 만드는 방법',
	description: '도안 에디터로 뜨개질 도안을 만드는 방법을 단계별로 안내합니다.',
	totalTime: 'PT10M',
	tool: [{ '@type': 'HowToTool', name: '도안 에디터' }],
	step: STEPS.map(({ step, title, description }) => ({
		'@type': 'HowToStep',
		position: step,
		name: title,
		text: description,
	})),
};

const breadcrumbJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [
		{ '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
		{ '@type': 'ListItem', position: 2, name: '가이드', item: `${SITE_URL}/guide` },
	],
};

export default function GuidePage() {
	return (
		<main className="max-w-2xl mx-auto px-6 py-12">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(howToJsonLd) }}
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
				<span>가이드</span>
			</nav>

			<h1 className="text-3xl font-bold mb-4">뜨개 도안 만들기 가이드</h1>
			<p className="text-gray-600 mb-10">
				도안 에디터를 처음 사용하시나요? 아래 단계를 따라 하면 누구나 10분 안에 나만의 뜨개질 도안을
				완성할 수 있습니다.
			</p>

			{/* 빠른 시작 */}
			<section aria-labelledby="steps-heading" className="mb-14">
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

			{/* 기능 상세 */}
			<section aria-labelledby="features-heading" className="mb-14">
				<h2 id="features-heading" className="text-xl font-semibold mb-8">
					기능 상세 설명
				</h2>
				<div className="space-y-10">
					{FEATURES.map(({ id, title, items }) => (
						<div key={id}>
							<h3 className="font-semibold text-base mb-4 pb-2 border-b border-gray-200">{title}</h3>
							<dl className="space-y-4">
								{items.map(({ label, detail }) => (
									<div key={label}>
										<dt className="text-sm font-medium text-slate-800 mb-1">{label}</dt>
										<dd className="text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">
											{detail}
										</dd>
									</div>
								))}
							</dl>
						</div>
					))}
				</div>
			</section>

			{/* 단축키 */}
			<section aria-labelledby="shortcuts-heading" className="mb-14">
				<h2 id="shortcuts-heading" className="text-xl font-semibold mb-4">
					단축키
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="text-left py-2 pr-6 font-medium text-gray-700 whitespace-nowrap">키</th>
								<th className="text-left py-2 font-medium text-gray-700">동작</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{SHORTCUTS.map(({ key, desc }) => (
								<tr key={key}>
									<td className="py-2 pr-6 whitespace-nowrap">
										<kbd className="inline-block bg-gray-100 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono">
											{key}
										</kbd>
									</td>
									<td className="py-2 text-gray-600">{desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<div className="border-t pt-8 flex flex-wrap gap-4">
				<Link
					href="/"
					className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
				>
					지금 도안 만들기 →
				</Link>
				<Link
					href="/about"
					className="inline-block border border-slate-900 text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
				>
					도안 소개 보기
				</Link>
			</div>
		</main>
	);
}
