import { NextResponse } from 'next/server';

export function GET() {
	return NextResponse.json({
		hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
		hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	});
}
