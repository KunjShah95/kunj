export interface Point {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser?: boolean;
}

export enum ToolType {
  PEN = 'PEN',
  ERASER = 'ERASER', 
  MOVE = 'MOVE'
}

export interface DrawingConfig {
  color: string;
  width: number;
  tool: ToolType;
}

export type UploadedFile = File | null;

export type UserDrawingMap = Record<string, Stroke[]>;