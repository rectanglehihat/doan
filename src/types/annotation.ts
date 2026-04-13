export type AnnotationSide = 'right' | 'left';

export interface RowAnnotation {
	id: string;
	rowIndex: number; // 0-based data row index
	label: string;
	side: AnnotationSide;
}

export type RangeAnnotationSide = 'left' | 'right' | 'top' | 'bottom';

interface RangeAnnotationBase {
	id: string;
	text: string; // 멀티라인 지원 (\n 포함)
}

export interface RowRangeAnnotation extends RangeAnnotationBase {
	side: 'left' | 'right';
	startRow: number; // 0-based (startRow <= endRow 보장)
	endRow: number; // 0-based (inclusive)
}

export interface ColRangeAnnotation extends RangeAnnotationBase {
	side: 'top' | 'bottom';
	startCol: number; // 0-based (startCol <= endCol 보장)
	endCol: number; // 0-based (inclusive)
}

export type RangeAnnotation = RowRangeAnnotation | ColRangeAnnotation;

export type ColumnAnnotationSide = 'top' | 'bottom';

export interface ColumnAnnotation {
	id: string;
	colIndex: number; // 0-based data column index
	label: string;
	side: ColumnAnnotationSide;
}
