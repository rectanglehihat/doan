import Image from 'next/image';
import Link from 'next/link';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/constants/site';
import { stringifyJsonLd } from '@/lib/utils/json-ld';

const websiteJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: SITE_NAME,
	url: SITE_URL,
	description: SITE_DESCRIPTION,
};

export default function Home() {
	return (
		<main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(websiteJsonLd) }}
			/>
			<div className="flex flex-col items-center gap-12 max-w-sm w-full">
				<Image
					src="/main.png"
					alt="뜨개 도안"
					width={320}
					height={320}
					priority
					sizes="(max-width: 640px) 256px, 320px"
					className="w-64 h-64 object-contain"
				/>

				<div className="text-center space-y-3">
					<p className="text-[10px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
						Knitting & Crochet Editor
					</p>
				</div>

				<Link
					href="/editor"
					className="bg-white text-zinc-900 text-sm font-semibold px-10 py-3 hover:bg-zinc-200 transition-colors tracking-wide"
				>
					도안 만들기
				</Link>
			</div>
		</main>
	);
}
