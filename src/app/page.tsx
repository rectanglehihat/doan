import Link from 'next/link';

const CELL = 26;
const COLS = 16;
const ROWS = 14;
const GW = COLS * CELL;
const GH = ROWS * CELL;
const HIGHLIGHT: number[] = [7, 8];

interface GridMark {
	row: number;
	col: number;
	type: 'purl' | 'cable';
}

const MARKS: GridMark[] = [
	{ row: 7, col: 3, type: 'purl' },
	{ row: 7, col: 7, type: 'cable' },
	{ row: 8, col: 4, type: 'purl' },
	{ row: 8, col: 8, type: 'cable' },
];

const TOOLBAR_ICONS = [
	{ label: '그리기', d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
	{ label: '레이어', d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
	{ label: '확대', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
	{ label: '되돌리기', d: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
];

const PALETTE = [
	{ label: 'KNIT', style: 'bg-zinc-900' },
	{ label: 'PURL', style: 'border border-zinc-400' },
	{ label: 'CABLE_L', style: 'bg-violet-400' },
];

const META = [
	{ label: 'GAUGE', value: '18st × 24r' },
	{ label: 'WIDTH', value: '54.0cm' },
	{ label: 'COMPLEXITY', value: '142,560 st' },
	{ label: 'EST. TIME', value: '42h 00m' },
];

export default function Home() {
	return (
		<main className="flex flex-1 overflow-hidden">
			{/* Left panel — knitting visual */}
			<div className="relative w-1/2 bg-zinc-950 overflow-hidden">
				<svg
					className="absolute inset-0 w-full h-full"
					aria-hidden="true"
				>
					<defs>
						<pattern
							id="knit-bg"
							x="0"
							y="0"
							width="52"
							height="52"
							patternUnits="userSpaceOnUse"
						>
							<text
								x="8"
								y="24"
								fontSize="17"
								fill="white"
								fillOpacity="0.07"
								fontFamily="monospace"
							>
								×
							</text>
							<text
								x="34"
								y="24"
								fontSize="17"
								fill="white"
								fillOpacity="0.07"
								fontFamily="monospace"
							>
								○
							</text>
							<text
								x="8"
								y="50"
								fontSize="17"
								fill="white"
								fillOpacity="0.07"
								fontFamily="monospace"
							>
								○
							</text>
							<text
								x="34"
								y="50"
								fontSize="17"
								fill="white"
								fillOpacity="0.07"
								fontFamily="monospace"
							>
								×
							</text>
						</pattern>
					</defs>
					<rect
						width="100%"
						height="100%"
						fill="url(#knit-bg)"
					/>
				</svg>

				{/* Caption card */}
				<div className="absolute bottom-8 left-8 right-8 bg-zinc-100/95 p-7">
					<p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-3">
						뜨개 도안 에디터 / 무료
					</p>
					<h1 className="text-xl font-semibold text-zinc-900 mb-2 leading-snug">
						뜨개 도안을 더 쉽게
					</h1>
					<p className="text-sm text-zinc-600 leading-relaxed mb-5">
						격자에 기호와 색상을 칠하고 PDF로 출력하는 온라인 뜨개 도안 에디터입니다.
					</p>
					<Link
						href="/editor"
						className="text-xs font-semibold text-zinc-900 hover:text-zinc-500 transition-colors"
					>
						도안 만들기 →
					</Link>
				</div>
			</div>

			{/* Right panel — editor preview */}
			<div className="relative w-1/2 flex flex-col bg-white border-l border-zinc-100 overflow-hidden">
				{/* SVG grid */}
				<div className="relative flex-1 overflow-hidden">
					<svg
						viewBox={`0 0 ${GW} ${GH}`}
						preserveAspectRatio="xMidYMid meet"
						className="absolute inset-0 w-full h-full"
						aria-hidden="true"
					>
						{/* Highlight rows */}
						{HIGHLIGHT.map((r) => (
							<rect
								key={r}
								x={0}
								y={r * CELL}
								width={GW}
								height={CELL}
								fill="#eef0fb"
							/>
						))}

						{/* Horizontal lines */}
						{Array.from({ length: ROWS + 1 }, (_, i) => (
							<line
								key={`h${i}`}
								x1={0}
								y1={i * CELL}
								x2={GW}
								y2={i * CELL}
								stroke="#e4e4e7"
								strokeWidth={0.5}
							/>
						))}

						{/* Vertical lines */}
						{Array.from({ length: COLS + 1 }, (_, i) => (
							<line
								key={`v${i}`}
								x1={i * CELL}
								y1={0}
								x2={i * CELL}
								y2={GH}
								stroke="#e4e4e7"
								strokeWidth={0.5}
							/>
						))}

						{/* Symbols */}
						{MARKS.map(({ row, col, type }) => {
							const cx = col * CELL + CELL / 2;
							const cy = row * CELL + CELL / 2;
							return type === 'purl' ? (
								<text
									key={`${row}-${col}`}
									x={cx}
									y={cy + 5}
									fontSize={13}
									textAnchor="middle"
									fill="#52525b"
									fontFamily="monospace"
								>
									×
								</text>
							) : (
								<circle
									key={`${row}-${col}`}
									cx={cx}
									cy={cy}
									r={6}
									fill="none"
									stroke="#7c3aed"
									strokeWidth={1.5}
								/>
							);
						})}
					</svg>

					{/* Floating toolbar */}
					<div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 bg-zinc-900 rounded-xl p-1.5 shadow-xl">
						{TOOLBAR_ICONS.map(({ label, d }) => (
							<div
								key={label}
								className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400"
								aria-hidden="true"
							>
								<svg
									width="15"
									height="15"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d={d} />
								</svg>
							</div>
						))}
					</div>
				</div>

				{/* Bottom info bar */}
				<div className="shrink-0 border-t border-zinc-100 px-6 py-4 flex gap-10">
					<div>
						<p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-400 uppercase mb-2.5">
							Stitch Palette
						</p>
						<div className="flex items-center gap-4">
							{PALETTE.map(({ label, style }) => (
								<span
									key={label}
									className="flex items-center gap-1.5 text-[11px] text-zinc-700"
								>
									<span className={`w-2.5 h-2.5 inline-block ${style}`} />
									{label}
								</span>
							))}
						</div>
					</div>
					<div>
						<p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-400 uppercase mb-2.5">
							Metadata
						</p>
						<div className="grid grid-cols-2 gap-x-6 gap-y-1">
							{META.map(({ label, value }) => (
								<div key={label}>
									<p className="text-[9px] text-zinc-400 uppercase tracking-wide">{label}</p>
									<p className="text-[11px] text-zinc-900 font-medium">{value}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
