import React from 'react';
import { 
  Upload, 
  FileDown, 
  ZoomIn, 
  ZoomOut, 
  PenTool, 
  Move, 
  Trash2,
  Image as ImageIcon,
  Users,
  Eraser
} from 'lucide-react';
import { COLORS, STROKE_WIDTHS, MIN_SCALE, MAX_SCALE, USERS } from '../constants';
import { ToolType } from '../types';

interface ToolbarProps {
  hasFile: boolean;
  scale: number;
  currentTool: ToolType;
  currentColor: string;
  currentWidth: number;
  activeUser: string;
  isSaving: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetTool: (t: ToolType) => void;
  onSetColor: (c: string) => void;
  onSetWidth: (w: number) => void;
  onClear: () => void;
  onSelectUser: (user: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  hasFile,
  scale,
  currentTool,
  currentColor,
  currentWidth,
  activeUser,
  isSaving,
  onUpload,
  onDownload,
  onZoomIn,
  onZoomOut,
  onSetTool,
  onSetColor,
  onSetWidth,
  onClear,
  onSelectUser
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm p-3 sticky top-0 z-50 flex flex-col gap-3">
      
      {/* Top Row: File & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Upload & Download */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-sm text-sm font-medium">
            <Upload size={16} />
            <span>Upload Image</span>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={onUpload} 
              className="hidden" 
            />
          </label>
          
          {hasFile && (
            <button
              onClick={onDownload}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
            >
              <FileDown size={16} />
              <span>{isSaving ? 'Generating PDF...' : 'Download Combined PDF'}</span>
            </button>
          )}
        </div>

        {hasFile && (
          /* Right: Zoom Controls */
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={onZoomOut}
              disabled={scale <= MIN_SCALE}
              className="p-1.5 rounded-md hover:bg-white hover:shadow disabled:opacity-30 transition-all"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-medium w-10 text-center text-gray-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              disabled={scale >= MAX_SCALE}
              className="p-1.5 rounded-md hover:bg-white hover:shadow disabled:opacity-30 transition-all"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Row: User Selection & Tools */}
      {hasFile && (
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          
          {/* User Selector */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <div className="px-2 text-gray-400">
              <Users size={16} />
            </div>
            {USERS.map((user) => (
              <button
                key={user}
                onClick={() => onSelectUser(user)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeUser === user 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {user}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

          {/* Tools */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetTool(ToolType.MOVE)}
                  className={`p-2 rounded-lg transition-all ${currentTool === ToolType.MOVE ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Move/Pan"
                >
                  <Move size={18} />
                </button>
                <button
                  onClick={() => onSetTool(ToolType.PEN)}
                  className={`p-2 rounded-lg transition-all ${currentTool === ToolType.PEN ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Pen Tool"
                >
                  <PenTool size={18} />
                </button>
                <button
                  onClick={() => onSetTool(ToolType.ERASER)}
                  className={`p-2 rounded-lg transition-all ${currentTool === ToolType.ERASER ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Eraser Tool"
                >
                  <Eraser size={18} />
                </button>
                <button
                  onClick={onClear}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Clear Current User Drawings"
                >
                  <Trash2 size={18} />
                </button>
             </div>

             {(currentTool === ToolType.PEN || currentTool === ToolType.ERASER) && (
               <>
                 <div className="w-px h-6 bg-gray-200"></div>
                 {/* Only show color picker for PEN */}
                 {currentTool === ToolType.PEN && (
                   <>
                    <div className="flex items-center gap-1">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => onSetColor(color)}
                            className={`w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110 ${currentColor === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                   </>
                 )}
                 <div className="flex items-center gap-1">
                    {STROKE_WIDTHS.map((width) => (
                      <button
                        key={width}
                        onClick={() => onSetWidth(width)}
                        className={`rounded-full bg-gray-800 transition-all ${currentWidth === width ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}
                        style={{ width: Math.min(width + 2, 14), height: Math.min(width + 2, 14) }}
                      />
                    ))}
                 </div>
               </>
             )}
          </div>
        </div>
      )}

      {!hasFile && (
        <div className="flex-1 flex justify-center py-2 text-sm text-gray-400 italic items-center gap-2">
            <ImageIcon size={16}/>
            <span>No image loaded</span>
        </div>
      )}
    </div>
  );
};