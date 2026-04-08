export type AnnotationSide = 'right' | 'left';

export interface RowAnnotation {
	id: string;
	rowIndex: number; // 0-based data row index
	label: string;
	side: AnnotationSide;
}

export interface RangeAnnotation {
	id: string;
	startRow: number; // 0-based (startRow <= endRow 보장)
	endRow: number; // 0-based (inclusive)
	text: string; // 멀티라인 지원 (\n 포함)
}
