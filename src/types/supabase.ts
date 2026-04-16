// 이 파일은 DB 스키마 구성 후 `supabase gen types typescript` 명령으로 교체됩니다.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: Record<string, never>;
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
