import type { Metadata } from 'next';
import { SITE_URL } from '@/constants/site';
import { EditorClient } from '@/components/editor/EditorClient';

export const metadata: Metadata = {
	title: '도안 편집기',
	description: '뜨개 기호를 그리드에 배치하고 PDF로 출력하는 온라인 뜨개질 도안 에디터입니다.',
	alternates: {
		canonical: `${SITE_URL}/editor`,
	},
};

export default function EditorPage() {
	return <EditorClient />;
}
