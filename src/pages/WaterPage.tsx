
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Move, Download, LogOut, Trash2, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/supabaseClient';
import { Stroke, ToolType, Point } from '@/types';

interface WaterPageProps {
    userId: string;
    onLogout: () => void;
}

const WaterPage: React.FC<WaterPageProps> = ({ userId, onLogout }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<ToolType>(ToolType.PEN);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Set canvas size to match window
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                redraw();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Redraw function
    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image if exists
        if (backgroundImage) {
            // Calculate aspect ratio to fit image within canvas while maintaining proportions
            const scale = Math.min(
                canvas.width / backgroundImage.width,
                canvas.height / backgroundImage.height
            );
            const x = (canvas.width / 2) - (backgroundImage.width / 2) * scale;
            const y = (canvas.height / 2) - (backgroundImage.height / 2) * scale;

            ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
        }

        const drawStroke = (stroke: Stroke) => {
            if (stroke.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = stroke.isEraser ? '#ffffff' : stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';

            const start = stroke.points[0];
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);

            for (let i = 1; i < stroke.points.length; i++) {
                const p = stroke.points[i];
                ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            }
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        };

        strokes.forEach(drawStroke);
        if (currentStroke) drawStroke(currentStroke);
    };

    useEffect(() => {
        redraw();
    }, [strokes, currentStroke, backgroundImage]);

    const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        return {
            x: (clientX - rect.left) / canvas.width,
            y: (clientY - rect.top) / canvas.height
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (tool === ToolType.MOVE) return;
        setIsDrawing(true);
        const point = getPoint(e);
        setCurrentStroke({
            points: [point],
            color: color,
            width: lineWidth,
            isEraser: tool === ToolType.ERASER
        });
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentStroke) return;
        const point = getPoint(e);
        setCurrentStroke(prev => prev ? {
            ...prev,
            points: [...prev.points, point]
        } : null);
    };

    const stopDrawing = () => {
        if (isDrawing && currentStroke) {
            setStrokes(prev => [...prev, currentStroke]);
            setCurrentStroke(null);
            // Save to Supabase here if needed
            saveToSupabase([...strokes, currentStroke]);
        }
        setIsDrawing(false);
    };

    const saveToSupabase = async (newStrokes: Stroke[]) => {
        // Placeholder for Supabase save
        console.log('Saving to Supabase', newStrokes);
    };

    const clearCanvas = () => {
        setStrokes([]);
        setBackgroundImage(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setBackgroundImage(img);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const exportPDF = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('drawing.pdf');
    };

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Designer: {userId}</h1>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <Button
                            variant={tool === ToolType.PEN ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setTool(ToolType.PEN)}
                        >
                            <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={tool === ToolType.ERASER ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setTool(ToolType.ERASER)}
                        >
                            <Eraser className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={tool === ToolType.MOVE ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setTool(ToolType.MOVE)}
                        >
                            <Move className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                title="Add Image"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border-none"
                        />
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(parseInt(e.target.value))}
                            className="w-24"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear Canvas">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={exportPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="ghost" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden p-4">
                <div className="h-full w-full rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
                    <canvas
                        ref={canvasRef}
                        className="h-full w-full touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
            </div>
        </div>
    );
};

export default WaterPage;
