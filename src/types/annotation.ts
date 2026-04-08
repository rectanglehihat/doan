export type AnnotationSide = 'right' | 'left';

export interface RowAnnotation {
	id: string;
	rowIndex: number; // 0-based data row index
	label: string;
	side: AnnotationSide;
}
