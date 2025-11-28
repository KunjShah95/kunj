import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke, Point, ToolType } from '../types';

interface DrawingCanvasProps {
  width: number;
  height: number;
  drawings: Stroke[];
  onAddStroke: (stroke: Stroke) => void;
  currentColor: string;
  currentWidth: number;
  tool: ToolType;
  scale: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  drawings,
  onAddStroke,
  currentColor,
  currentWidth,
  tool,
  scale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  // Function to render all drawings
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Common style setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw saved strokes
    drawings.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      
      ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      
      // Scale stroke width for consistent relative size
      ctx.lineWidth = stroke.width * scale; 

      const startX = stroke.points[0].x * width;
      const startY = stroke.points[0].y * height;
      
      ctx.moveTo(startX, startY);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
      }
      ctx.stroke();
    });

    // Draw current stroke (live preview)
    if (currentStroke.length > 0) {
      // Set composite operation for current stroke based on tool
      ctx.globalCompositeOperation = tool === ToolType.ERASER ? 'destination-out' : 'source-over';
      
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth * scale;
      
      const startX = currentStroke[0].x * width;
      const startY = currentStroke[0].y * height;
      
      ctx.moveTo(startX, startY);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x * width, currentStroke[i].y * height);
      }
      ctx.stroke();
    }
    
    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';
    
  }, [drawings, currentStroke, width, height, scale, currentColor, currentWidth, tool]);

  // Effect to re-render when props change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getNormalizedPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === ToolType.MOVE) return; // Allow interaction only if Pen or Eraser
    setIsDrawing(true);
    setCurrentStroke([getNormalizedPoint(e)]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const newPoint = getNormalizedPoint(e);
    setCurrentStroke((prev) => [...prev, newPoint]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length > 1) {
      onAddStroke({
        points: currentStroke,
        color: currentColor, // Eraser effectively ignores color, but good to keep consistency
        width: currentWidth,
        isEraser: tool === ToolType.ERASER
      });
    }
    setCurrentStroke([]);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute top-0 left-0 z-10 ${tool === ToolType.MOVE ? 'cursor-grab' : 'cursor-crosshair'}`}
      style={{ width, height, touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};