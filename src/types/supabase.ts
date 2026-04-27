// supabase gen types typescript --project-id <project-id> 로 재생성 가능
// 현재는 supabase/migrations/20260416000000_create_patterns.sql 기반 수동 작성

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

import type { ChartCell, CollapsedBlock, CollapsedColumnBlock, ShapeGuide } from './knitting';
import type { RowAnnotation, RangeAnnotation, ColumnAnnotation } from './annotation';

export type Database = {
	public: {
		Tables: {
			patterns: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					pattern_type: 'knitting' | 'crochet';
					grid_rows: number;
					grid_cols: number;
					cells: ChartCell[][];
					collapsed_blocks: CollapsedBlock[];
					collapsed_column_blocks: CollapsedColumnBlock[];
					shape_guide: ShapeGuide | null;
					rotational_mode: 'none' | 'horizontal' | 'vertical' | 'both';
					difficulty: number;
					materials: string;
					row_annotations: RowAnnotation[];
					range_annotations: RangeAnnotation[];
					column_annotations: ColumnAnnotation[];
					saved_at: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					pattern_type: 'knitting' | 'crochet';
					grid_rows: number;
					grid_cols: number;
					cells?: ChartCell[][];
					collapsed_blocks?: CollapsedBlock[];
					collapsed_column_blocks?: CollapsedColumnBlock[];
					shape_guide?: ShapeGuide | null;
					rotational_mode?: 'none' | 'horizontal' | 'vertical' | 'both';
					difficulty?: number;
					materials?: string;
					row_annotations?: RowAnnotation[];
					range_annotations?: RangeAnnotation[];
					column_annotations?: ColumnAnnotation[];
					saved_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					pattern_type?: 'knitting' | 'crochet';
					grid_rows?: number;
					grid_cols?: number;
					cells?: ChartCell[][];
					collapsed_blocks?: CollapsedBlock[];
					collapsed_column_blocks?: CollapsedColumnBlock[];
					shape_guide?: ShapeGuide | null;
					rotational_mode?: 'none' | 'horizontal' | 'vertical' | 'both';
					difficulty?: number;
					materials?: string;
					row_annotations?: RowAnnotation[];
					range_annotations?: RangeAnnotation[];
					column_annotations?: ColumnAnnotation[];
					saved_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'patterns_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: Record<string, never>;
		Functions: {
			set_updated_at: {
				Args: Record<PropertyKey, never>;
				Returns: unknown;
			};
		};
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;
