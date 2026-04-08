import type Konva from 'konva';
import type { ChartCell, CellSelection, CollapsedBlock, CollapsedColumnBlock, GridSize, RotationalMode, RowAnnotation, ShapeGuide } from './knitting';

export interface GridCoreProps {
	cells: ChartCell[][];
	gridSize: GridSize;
	cellSize: number;
	symbolsMap: Record<string, string>;
	stageWidth: number;
	stageHeight: number;
	externalStageRef?: React.RefObject<Konva.Stage | null>;
}

export interface PaintingProps {
	selectedSymbolAbbr: string | null;
	onCellPaint: (row: number, col: number) => void;
	onPaintStart?: () => void;
	onPaintEnd?: () => void;
}

export interface ColorProps {
	isColorMode?: boolean;
	selectedColor?: string | null;
	onCellColorPaint?: (row: number, col: number) => void;
}

export interface ShapeGuideProps {
	shapeGuide?: ShapeGuide | null;
	isShapeGuideDrawMode?: boolean;
	isShapeGuideEraseMode?: boolean;
	onShapeGuideStrokeAdd?: (stroke: number[]) => void;
	onShapeGuideStrokeRemove?: (index: number) => void;
	onShapeGuideStrokeReplace?: (index: number, newStrokes: number[][]) => void;
	onShapeGuideEraseStart?: () => void;
	onShapeGuideEraseEnd?: () => void;
}

export interface SelectionProps {
	isSelectionMode?: boolean;
	cellSelection?: CellSelection | null;
	clipboard?: ChartCell[][] | null;
	onSelectionChange?: (sel: CellSelection | null) => void;
	onCopySelection?: (sel: CellSelection) => void;
	onPasteClipboard?: (row: number, col: number) => void;
}

export interface CollapsedProps {
	collapsedBlocks?: CollapsedBlock[];
	onCollapsedBlockClick?: (blockId: string) => void;
	collapsedColumnBlocks?: CollapsedColumnBlock[];
	onCollapsedColumnBlockClick?: (blockId: string) => void;
}

export interface RotationalProps {
	rotationalMode?: RotationalMode;
}

export interface AnnotationProps {
	rowAnnotations?: RowAnnotation[];
	isAnnotationMode?: boolean;
	annotationSideWidth?: number;
	onAnnotationAreaClick?: (
		rowIndex: number,
		side: 'right' | 'left',
		anchorX: number,
		anchorY: number,
		existingAnnotationId: string | null,
	) => void;
}

export type KonvaGridProps = GridCoreProps &
	PaintingProps &
	ColorProps &
	ShapeGuideProps &
	SelectionProps &
	CollapsedProps &
	RotationalProps &
	AnnotationProps;
