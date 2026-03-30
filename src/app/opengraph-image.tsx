import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '도안 — 뜨개 도안 에디터';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					background: '#0f172a',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'sans-serif',
					padding: '60px',
				}}
			>
				{/* 그리드 데코 */}
				<div
					style={{
						position: 'absolute',
						top: 40,
						right: 60,
						display: 'grid',
						gridTemplateColumns: 'repeat(6, 1fr)',
						gap: 8,
						opacity: 0.15,
					}}
				>
					{Array.from({ length: 30 }).map((_, i) => (
						<div
							key={i}
							style={{
								width: 40,
								height: 40,
								background: i % 5 === 0 || i % 7 === 0 ? '#6366f1' : '#334155',
								borderRadius: 4,
							}}
						/>
					))}
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						width: '100%',
						maxWidth: 760,
					}}
				>
					<span
						style={{
							fontSize: 20,
							color: '#6366f1',
							letterSpacing: '0.1em',
							marginBottom: 20,
							fontWeight: 600,
						}}
					>
						DOAN
					</span>
					<h1
						style={{
							fontSize: 72,
							fontWeight: 800,
							color: '#f8fafc',
							margin: 0,
							lineHeight: 1.1,
						}}
					>
						뜨개 도안 에디터
					</h1>
					<p
						style={{
							fontSize: 28,
							color: '#94a3b8',
							marginTop: 24,
							lineHeight: 1.4,
						}}
					>
						기호를 배치하고 PDF로 출력하는
						<br />
						무료 온라인 도안 도구
					</p>
				</div>
			</div>
		),
		{ ...size },
	);
}
