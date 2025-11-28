import React, { useState, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Stroke, ToolType, UserDrawingMap } from './types';
import { COLORS, STROKE_WIDTHS, MIN_SCALE, MAX_SCALE, SCALE_STEP, USERS } from './constants';
import { generateMultiUserPDF } from './utils/pdfUtils';
import { Loader2, ImagePlus } from 'lucide-react';

const App: React.FC = () => {
  // File State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // User State
  const [activeUser, setActiveUser] = useState<string>(USERS[0]);
  const [userDrawings, setUserDrawings] = useState<UserDrawingMap>({});

  // View State
  const [scale, setScale] = useState<number>(1.0);
  
  // Tool State
  const [tool, setTool] = useState<ToolType>(ToolType.MOVE);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [width, setWidth] = useState<number>(STROKE_WIDTHS[1]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Handlers
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const src = e.target.result as string;
          
          // Get dimensions
          const img = new Image();
          img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setImageSrc(src);
            
            // Reset all user drawings when new image is loaded
            setUserDrawings({});
            setActiveUser(USERS[0]);
            
            setTool(ToolType.MOVE);
            setIsLoading(false);
            
            // Auto fit scale if image is huge
            const viewportWidth = window.innerWidth - 64; 
            if (img.naturalWidth > viewportWidth) {
              const newScale = Math.floor((viewportWidth / img.naturalWidth) * 10) / 10;
              setScale(Math.max(newScale, MIN_SCALE));
            } else {
              setScale(1.0);
            }
          };
          img.src = src;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStroke = useCallback((stroke: Stroke) => {
    setUserDrawings((prev) => {
      const currentStrokes = prev[activeUser] || [];
      return {
        ...prev,
        [activeUser]: [...currentStrokes, stroke]
      };
    });
  }, [activeUser]);

  const handleClear = () => {
    if (confirm(`Clear all drawings for ${activeUser}?`)) {
      setUserDrawings((prev) => ({
        ...prev,
        [activeUser]: []
      }));
    }
  };

  const handleDownload = async () => {
    if (!imageSrc || !imageDimensions) return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // UI Breath
      
      await generateMultiUserPDF(
        imageSrc,
        userDrawings,
        USERS,
        imageDimensions.width,
        imageDimensions.height
      );
      
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toolbar
        hasFile={!!imageSrc}
        scale={scale}
        currentTool={tool}
        currentColor={color}
        currentWidth={width}
        activeUser={activeUser}
        isSaving={isSaving}
        onUpload={onFileChange}
        onDownload={handleDownload}
        onZoomIn={() => setScale(s => Math.min(Number((s + SCALE_STEP).toFixed(1)), MAX_SCALE))}
        onZoomOut={() => setScale(s => Math.max(Number((s - SCALE_STEP).toFixed(1)), MIN_SCALE))}
        onSetTool={setTool}
        onSetColor={setColor}
        onSetWidth={setWidth}
        onClear={handleClear}
        onSelectUser={setActiveUser}
      />

      <main className="flex-1 overflow-auto relative p-8 flex justify-center items-start">
        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <ImagePlus className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Image Loaded</h2>
            <p className="text-gray-500">Upload an image to start the team session.</p>
          </div>
        ) : (
          <div 
            className="relative shadow-xl bg-white transition-all duration-200 ease-out border border-gray-200"
            style={{ 
              width: imageDimensions ? imageDimensions.width * scale : 'auto', 
              height: imageDimensions ? imageDimensions.height * scale : 'auto',
            }}
          >
            {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
               </div>
            )}
            
            {imageSrc && (
              <img 
                src={imageSrc} 
                alt="Base" 
                className="block select-none pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )}

            {/* Drawing Layer Overlay - Only shows ACTIVE user's drawings */}
            {imageDimensions && !isLoading && (
              <DrawingCanvas
                width={imageDimensions.width * scale}
                height={imageDimensions.height * scale}
                drawings={userDrawings[activeUser] || []}
                onAddStroke={handleAddStroke}
                currentColor={color}
                currentWidth={width}
                tool={tool}
                scale={scale}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Floating User Indicator */}
      {imageSrc && (
        <div className="fixed bottom-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Current: <span className="text-gray-900">{activeUser}</span>
        </div>
      )}
    </div>
  );
};

export default App;