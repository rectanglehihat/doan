import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
	const base = SITE_URL;
	return [
		{
			url: base,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${base}/guide`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${base}/about`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.7,
		},
	];
}
