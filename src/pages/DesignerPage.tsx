import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Circle, Square, ThumbsUp, Shield, Pen, Eraser, Check } from 'lucide-react';
import { DesignCollection, DesignMarking, MarkingWithVotes } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBased } from '@/components/PermissionGuard';
import { mockDb } from '@/lib/mockData';

interface DesignerPageProps {
    onLogout: () => void;
}

type ToolType = 'circle' | 'rectangle' | 'pen' | 'tick' | 'eraser' | null;

const DesignerPage: React.FC<DesignerPageProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collections, setCollections] = useState<DesignCollection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<DesignCollection | null>(null);
    const [markings, setMarkings] = useState<MarkingWithVotes[]>([]);
    const [myMarkings, setMyMarkings] = useState<DesignMarking[]>([]);
    const [currentTool, setCurrentTool] = useState<ToolType>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);
    const imageRef = useRef<HTMLDivElement>(null);

    if (!user) {
        return <div>Loading...</div>;
    }

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchMarkings(selectedCollection.id);
        }
    }, [selectedCollection]);

    const fetchCollections = async () => {
        try {
            const data = mockDb.getCollections();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchMarkings = async (collectionId: string) => {
        try {
            const markingsWithVotes = mockDb.getMarkingsWithVotes(collectionId, user.id);
            setMarkings(markingsWithVotes);
            setMyMarkings(markingsWithVotes.filter(m => m.designer_id === user.id));
        } catch (error) {
            console.error('Error fetching markings:', error);
        }
    };

    const getRelativeCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!imageRef.current) return { x: 0, y: 0 };
        const rect = imageRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100
        };
    };

    const handleStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!currentTool || !selectedCollection) return;

        const coords = getRelativeCoords(e);

        if (currentTool === 'pen') {
            setIsDrawing(true);
            setCurrentPath([coords]);
        } else if (currentTool === 'tick') {
            saveMarking({
                type: 'tick',
                x: coords.x,
                y: coords.y,
                color: getRandomColor()
            });
        } else if (currentTool === 'circle' || currentTool === 'rectangle') {
            saveMarking({
                type: currentTool,
                x: coords.x,
                y: coords.y,
                width: 10,
                height: 10,
                radius: 5,
                color: getRandomColor()
            });
        } else if (currentTool === 'eraser') {
            const hitMarking = myMarkings.find(m => {
                const mCoords = m.coordinates as any;
                const tolerance = 5;
                // Simple hit detection logic
                if (mCoords.type === 'path' && mCoords.points) {
                    return mCoords.points.some((p: any) => Math.abs(p.x - coords.x) < tolerance && Math.abs(p.y - coords.y) < tolerance);
                }
                return Math.abs(mCoords.x - coords.x) < tolerance && Math.abs(mCoords.y - coords.y) < tolerance;
            });
            if (hitMarking) {
                deleteMarking(hitMarking.id);
            }
        }
    };

    const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDrawing || currentTool !== 'pen') return;
        const coords = getRelativeCoords(e);
        setCurrentPath(prev => [...prev, coords]);
    };

    const handleEnd = () => {
        if (isDrawing && currentTool === 'pen') {
            setIsDrawing(false);
            if (currentPath.length > 1) {
                saveMarking({
                    type: 'path',
                    points: currentPath,
                    color: getRandomColor()
                });
            }
            setCurrentPath([]);
        }
    };

    const saveMarking = async (coordinates: any) => {
        try {
            setLoading(true);
            const newMarking: DesignMarking = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                collection_id: selectedCollection!.id,
                designer_id: user.id,
                coordinates: {
                    ...coordinates,
                    is_selected: true
                },
                notes: notes || undefined
            };

            mockDb.addMarking(newMarking);

            setNotes('');
            fetchMarkings(selectedCollection!.id);
        } catch (error: any) {
            console.error('Error adding marking:', error);
            alert('Failed to mark design: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (markingId: string, hasVoted: boolean) => {
        try {
            if (hasVoted) {
                mockDb.removeVote(markingId, user.id);
            } else {
                mockDb.addVote({
                    id: Date.now().toString(),
                    created_at: new Date().toISOString(),
                    marking_id: markingId,
                    designer_id: user.id
                });
            }
            fetchMarkings(selectedCollection!.id);
        } catch (error: any) {
            console.error('Error voting:', error);
        }
    };

    const getRandomColor = () => {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const deleteMarking = async (markingId: string) => {
        if (!confirm('Delete this marking?')) return;
        try {
            mockDb.deleteMarking(markingId);
            fetchMarkings(selectedCollection!.id);
        } catch (error: any) {
            alert('Failed to delete: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
                        <p className="text-sm text-gray-600">{user.email} ({user.role})</p>
                    </div>
                    <div className="flex gap-2">
                        <RoleBased allowedRoles="admin">
                            <Button variant="outline" onClick={() => navigate('/admin')}>
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Panel
                            </Button>
                        </RoleBased>
                        <Button variant="ghost" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {!selectedCollection ? (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Active Collections</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {collections.map(collection => (
                                <div
                                    key={collection.id}
                                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedCollection(collection)}
                                >
                                    <img
                                        src={collection.image_url}
                                        alt={collection.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg">{collection.title}</h3>
                                        <Button
                                            className="mt-2 w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCollection(collection);
                                            }}
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <Button variant="ghost" onClick={() => setSelectedCollection(null)}>
                                    ← Back to Collections
                                </Button>
                                <h2 className="text-2xl font-bold mt-2">{selectedCollection.title}</h2>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <Button variant={currentTool === 'pen' ? 'default' : 'outline'} onClick={() => setCurrentTool(currentTool === 'pen' ? null : 'pen')}>
                                    <Pen className="mr-2 h-4 w-4" /> Pen
                                </Button>
                                <Button variant={currentTool === 'tick' ? 'default' : 'outline'} onClick={() => setCurrentTool(currentTool === 'tick' ? null : 'tick')}>
                                    <Check className="mr-2 h-4 w-4" /> Tick
                                </Button>
                                <Button variant={currentTool === 'circle' ? 'default' : 'outline'} onClick={() => setCurrentTool(currentTool === 'circle' ? null : 'circle')}>
                                    <Circle className="mr-2 h-4 w-4" /> Circle
                                </Button>
                                <Button variant={currentTool === 'rectangle' ? 'default' : 'outline'} onClick={() => setCurrentTool(currentTool === 'rectangle' ? null : 'rectangle')}>
                                    <Square className="mr-2 h-4 w-4" /> Rect
                                </Button>
                                <Button variant={currentTool === 'eraser' ? 'default' : 'outline'} onClick={() => setCurrentTool(currentTool === 'eraser' ? null : 'eraser')}>
                                    <Eraser className="mr-2 h-4 w-4" /> Eraser
                                </Button>
                                <Input
                                    placeholder="Add notes (optional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="max-w-xs"
                                />
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div
                                    ref={imageRef}
                                    className="relative bg-white rounded-lg shadow-lg overflow-hidden select-none"
                                    style={{ 
                                        cursor: currentTool === 'eraser' ? 'not-allowed' : 'crosshair',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={handleStart}
                                    onMouseMove={handleMove}
                                    onMouseUp={handleEnd}
                                    onMouseLeave={handleEnd}
                                    onTouchStart={handleStart}
                                    onTouchMove={handleMove}
                                    onTouchEnd={handleEnd}
                                >
                                    <img
                                        src={selectedCollection.image_url}
                                        alt={selectedCollection.title}
                                        className="w-full pointer-events-none"
                                        crossOrigin="anonymous"
                                    />

                                    {/* Render markings */}
                                    {markings.map(marking => {
                                        const coords = marking.coordinates as any;
                                        if (coords.type === 'path') {
                                            return (
                                                <svg key={marking.id} className="absolute inset-0 w-full h-full pointer-events-none">
                                                    <polyline
                                                        points={coords.points.map((p: any) => `${p.x * (imageRef.current?.offsetWidth || 0) / 100},${p.y * (imageRef.current?.offsetHeight || 0) / 100}`).join(' ')}
                                                        fill="none"
                                                        stroke={coords.color}
                                                        strokeWidth="3"
                                                    />
                                                </svg>
                                            );
                                        } else if (coords.type === 'tick') {
                                            return (
                                                <div
                                                    key={marking.id}
                                                    className="absolute pointer-events-none text-4xl font-bold"
                                                    style={{
                                                        left: `${coords.x}%`,
                                                        top: `${coords.y}%`,
                                                        color: coords.color,
                                                        transform: 'translate(-50%, -100%)'
                                                    }}
                                                >
                                                    ✓
                                                </div>
                                            );
                                        } else if (coords.type === 'circle') {
                                            return (
                                                <div
                                                    key={marking.id}
                                                    className="absolute border-4 rounded-full pointer-events-none"
                                                    style={{
                                                        left: `${coords.x}%`,
                                                        top: `${coords.y}%`,
                                                        width: `${coords.radius * 2}%`,
                                                        height: `${coords.radius * 2}%`,
                                                        borderColor: coords.color,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            );
                                        } else if (coords.type === 'rectangle') {
                                            return (
                                                <div
                                                    key={marking.id}
                                                    className="absolute border-4 pointer-events-none"
                                                    style={{
                                                        left: `${coords.x}%`,
                                                        top: `${coords.y}%`,
                                                        width: `${coords.width}%`,
                                                        height: `${coords.height}%`,
                                                        borderColor: coords.color,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Render current drawing path */}
                                    {isDrawing && currentPath.length > 0 && (
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                            <polyline
                                                points={currentPath.map(p => `${p.x * (imageRef.current?.offsetWidth || 0) / 100},${p.y * (imageRef.current?.offsetHeight || 0) / 100}`).join(' ')}
                                                fill="none"
                                                stroke="#000000"
                                                strokeWidth="3"
                                                strokeDasharray="5,5"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="font-bold mb-3">Your Markings</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {myMarkings.map(marking => (
                                            <div key={marking.id} className="p-2 bg-gray-50 rounded border flex justify-between items-center">
                                                <span className="text-sm">{marking.notes || 'No notes'}</span>
                                                <Button variant="ghost" size="sm" onClick={() => deleteMarking(marking.id)}>
                                                    <LogOut className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {myMarkings.length === 0 && <p className="text-sm text-gray-500">No markings yet</p>}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="font-bold mb-3">All Designs</h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {markings.map(marking => (
                                            <div key={marking.id} className="p-3 bg-gray-50 rounded border">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-sm font-medium">{marking.designer_id.split('@')[0]}</span>
                                                        <p className="text-xs text-gray-600">{marking.notes}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-bold">{marking.vote_count}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={marking.has_user_voted ? 'text-blue-600' : 'text-gray-400'}
                                                            onClick={() => handleVote(marking.id, marking.has_user_voted)}
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignerPage;
