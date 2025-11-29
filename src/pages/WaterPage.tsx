
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eraser, Pen, Move, Download, LogOut, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';

import { Stroke, ToolType, Point } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface WaterPageProps {
    onLogout: () => void;
}

const WaterPage: React.FC<WaterPageProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<ToolType>(ToolType.PEN);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Refs for accessing latest state in event listeners (like resize)
    const strokesRef = useRef(strokes);
    const currentStrokeRef = useRef(currentStroke);
    const backgroundImageRef = useRef(backgroundImage);

    // Update refs on every render
    strokesRef.current = strokes;
    currentStrokeRef.current = currentStroke;
    backgroundImageRef.current = backgroundImage;

    if (!user) {
        return <div>Loading...</div>;
    }

    // Redraw function
    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure context properties are set (they reset on resize)
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bg = backgroundImageRef.current;
        const currentStrokes = strokesRef.current;
        const currStroke = currentStrokeRef.current;

        // Draw background image if exists
        if (bg) {
            // Calculate aspect ratio to fit image within canvas while maintaining proportions
            const scale = Math.min(
                canvas.width / bg.width,
                canvas.height / bg.height
            );
            const x = (canvas.width / 2) - (bg.width / 2) * scale;
            const y = (canvas.height / 2) - (bg.height / 2) * scale;

            ctx.drawImage(bg, x, y, bg.width * scale, bg.height * scale);
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

        currentStrokes.forEach(drawStroke);
        if (currStroke) drawStroke(currStroke);
    };

    // Initialize canvas and handle resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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

    // Trigger redraw when state changes
    useEffect(() => {
        redraw();
    }, [strokes, currentStroke, backgroundImage]);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        };
    };

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (tool === ToolType.MOVE) return;
        
        // Only draw with primary button (left mouse) or pen/touch contact
        if (e.buttons !== 1 && e.pointerType === 'mouse') return;

        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDrawing(true);
        
        const point = getPoint(e);
        setCurrentStroke({
            points: [point],
            color: color,
            width: lineWidth,
            isEraser: tool === ToolType.ERASER
        });
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStroke) return;
        
        // If using pen, we could use pressure here: e.pressure
        
        const point = getPoint(e);
        setCurrentStroke((prev: Stroke | null) => prev ? {
            ...prev,
            points: [...prev.points, point]
        } : null);
    };

    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        if (isDrawing && currentStroke) {
            setStrokes(prev => [...prev, currentStroke]);
            setCurrentStroke(null);
        }
        setIsDrawing(false);
    };

    const saveWork = async () => {
        if (!taskName.trim()) {
            alert('Please enter a task name');
            return;
        }

        setSaving(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            // Simulate save delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Mock saving work:', {
                taskName,
                taskDescription,
                strokesCount: strokes.length
            });

            alert('Work saved successfully! (Mock)');
            setTaskName('');
            setTaskDescription('');
            setShowSaveDialog(false);
        } catch (error: any) {
            console.error('Error saving work:', error);
            alert('Failed to save work: ' + error.message);
        } finally {
            setSaving(false);
        }
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
        <div className="flex h-[100dvh] flex-col bg-gray-50">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-2 md:p-4 shadow-sm gap-2 md:gap-4 z-10">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h1 className="text-sm md:text-xl font-bold truncate max-w-[150px] md:max-w-none">
                        {user.email?.split('@')[0]}
                        {user.role && <span className="ml-1 md:ml-2 text-xs md:text-sm text-blue-600 font-medium">({user.role})</span>}
                    </h1>
                    
                    {/* Mobile-optimized tool group */}
                    <div className="flex items-center gap-1 md:gap-2 border-l pl-2 md:pl-4 overflow-x-auto no-scrollbar">
                        <Button
                            variant={tool === ToolType.PEN ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() => setTool(ToolType.PEN)}
                        >
                            <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={tool === ToolType.ERASER ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() => setTool(ToolType.ERASER)}
                        >
                            <Eraser className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={tool === ToolType.MOVE ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
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
                                className="h-8 w-8 md:h-10 md:w-10"
                                onClick={() => fileInputRef.current?.click()}
                                title="Add Image"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 border-r pr-2 md:border-l md:border-r-0 md:pl-4 md:pr-0">
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
                            className="w-20 md:w-24"
                        />
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear Canvas" className="h-8 w-8 md:h-10 md:w-10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="default" size="sm" onClick={() => setShowSaveDialog(true)} className="h-8 md:h-10">
                            <Save className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Save</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportPDF} className="h-8 md:h-10">
                            <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 md:h-10 md:w-10">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden p-2 md:p-4 relative">
                <div className="h-full w-full rounded-lg bg-white shadow-lg ring-1 ring-gray-200 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="h-full w-full touch-none cursor-crosshair block"
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerLeave={stopDrawing}
                    />
                </div>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Save Your Work</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Logo Design"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add any notes about this work..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowSaveDialog(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={saveWork}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaterPage;
