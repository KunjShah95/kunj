import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Upload, AlertCircle, Download, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBased } from '@/components/PermissionGuard';
import jsPDF from 'jspdf';
import { mockDb } from '@/lib/mockData';
import { DesignCollection, MarkingWithVotes, FinalSelection, AuthUser } from '../types';

// Type definitions

interface AdminCollectionsPageProps {
    user: AuthUser;
    onLogout: () => void;
}

const AdminCollectionsPage: React.FC<AdminCollectionsPageProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<DesignCollection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<DesignCollection | null>(null);
    const [markings, setMarkings] = useState<MarkingWithVotes[]>([]);
    const [finalSelections, setFinalSelections] = useState<FinalSelection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [newCollectionTitle, setNewCollectionTitle] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchMarkingsAndSelections(selectedCollection.id);
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

    const fetchMarkingsAndSelections = async (collectionId: string) => {
        try {
            const markingsData = mockDb.getMarkingsWithVotes(collectionId, user?.id || '');
            const selectionsData = mockDb.getSelections(collectionId);

            setMarkings(markingsData);
            setFinalSelections(selectionsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionTitle) return;

        setLoading(true);
        setError('');

        try {
            let imageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop';

            if (uploadFile) {
                // Convert file to Base64 for local mock storage
                // Note: localStorage has size limits (usually 5MB), so large images might fail.
                // In a real app, this would upload to a server/bucket.
                imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(uploadFile);
                });
            }

            const newCollection: DesignCollection = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                title: newCollectionTitle,
                image_url: imageUrl,
                uploaded_by: user?.id || 'admin',
                status: 'active'
            };

            mockDb.addCollection(newCollection);

            setNewCollectionTitle('');
            setUploadFile(null);
            setShowUploadDialog(false);
            fetchCollections();
            alert('Collection created successfully');
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload');
        } finally {
            setLoading(false);
        }
    };

    const selectDesign = async (marking: MarkingWithVotes) => {
        if (!isAdmin) return;
        const alreadySelected = finalSelections.some(fs => fs.marking_id === marking.id);
        if (alreadySelected) return;

        try {
            const newSelection: FinalSelection = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                marking_id: marking.id,
                selected_by: user?.id || 'admin',
                collection_id: selectedCollection!.id
            };

            mockDb.addSelection(newSelection);
            fetchMarkingsAndSelections(selectedCollection!.id);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const removeSelection = async (selectionId: string) => {
        if (!isAdmin) return;
        if (!confirm('Remove from final selections?')) return;

        try {
            mockDb.removeSelection(selectionId);
            fetchMarkingsAndSelections(selectedCollection!.id);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDownload = async (format: 'pdf' | 'png' | 'jpg') => {
        if (finalSelections.length === 0 || !selectedCollection || !imageRef.current) {
            alert('No selections to export');
            return;
        }

        setLoading(true);
        try {
            const img = imageRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            // Load main image onto canvas
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            // Prepare data for export
            const exportData = [];
            for (let i = 0; i < finalSelections.length; i++) {
                const selection = finalSelections[i];
                const marking = markings.find(m => m.id === selection.marking_id);
                if (!marking) continue;

                // Crop logic
                const coords = marking.coordinates as any;
                let cropX = 0, cropY = 0, cropW = 0, cropH = 0;
                const imgW = canvas.width;
                const imgH = canvas.height;

                if (coords.type === 'circle') {
                    const r = (coords.radius / 100) * imgW;
                    cropW = r * 4;
                    cropH = r * 4;
                    cropX = (coords.x / 100) * imgW - cropW / 2;
                    cropY = (coords.y / 100) * imgH - cropH / 2;
                } else if (coords.type === 'rectangle') {
                    cropW = (coords.width / 100) * imgW * 1.5;
                    cropH = (coords.height / 100) * imgH * 1.5;
                    cropX = (coords.x / 100) * imgW - cropW / 2;
                    cropY = (coords.y / 100) * imgH - cropH / 2;
                } else {
                    cropW = imgW * 0.2;
                    cropH = imgH * 0.2;
                    const x = coords.points ? coords.points[0].x : coords.x;
                    const y = coords.points ? coords.points[0].y : coords.y;
                    cropX = (x / 100) * imgW - cropW / 2;
                    cropY = (y / 100) * imgH - cropH / 2;
                }

                cropX = Math.max(0, cropX);
                cropY = Math.max(0, cropY);
                cropW = Math.min(imgW - cropX, cropW);
                cropH = Math.min(imgH - cropY, cropH);

                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = cropW;
                cropCanvas.height = cropH;
                const cropCtx = cropCanvas.getContext('2d');
                cropCtx?.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

                exportData.push({
                    imgData: cropCanvas.toDataURL('image/jpeg'),
                    width: cropW,
                    height: cropH,
                    notes: marking.notes
                });
            }

            if (format === 'pdf') {
                const pdf = new jsPDF();
                let yOffset = 20;
                pdf.setFontSize(20);
                pdf.text(`Design Selections: ${selectedCollection.title}`, 20, yOffset);
                yOffset += 20;

                exportData.forEach((item, i) => {
                    if (yOffset > 250) {
                        pdf.addPage();
                        yOffset = 20;
                    }
                    pdf.setFontSize(14);
                    pdf.text(`Selection #${i + 1}`, 20, yOffset);
                    yOffset += 10;

                    const ratio = item.width / item.height;
                    const pdfImgW = 100;
                    const pdfImgH = pdfImgW / ratio;

                    pdf.addImage(item.imgData, 'JPEG', 20, yOffset, pdfImgW, pdfImgH);

                    if (item.notes) {
                        pdf.setFontSize(10);
                        pdf.text(`Notes: ${item.notes}`, 20 + pdfImgW + 10, yOffset + 10);
                    }
                    yOffset += pdfImgH + 20;
                });

                pdf.save(`selections-${selectedCollection.title}.pdf`);
                // Attempt to open PDF in new tab
                window.open(pdf.output('bloburl'), '_blank');

            } else {
                // Generate single image for PNG/JPG
                const reportCanvas = document.createElement('canvas');
                const padding = 20;
                const headerHeight = 60;
                const itemHeight = 300; // Fixed height per item for simplicity
                const totalHeight = headerHeight + (exportData.length * itemHeight) + padding;
                const totalWidth = 800; // Fixed width

                reportCanvas.width = totalWidth;
                reportCanvas.height = totalHeight;
                const rCtx = reportCanvas.getContext('2d');
                if (!rCtx) throw new Error('Ctx error');

                // White background
                rCtx.fillStyle = '#ffffff';
                rCtx.fillRect(0, 0, totalWidth, totalHeight);

                // Header
                rCtx.fillStyle = '#000000';
                rCtx.font = 'bold 24px Arial';
                rCtx.fillText(`Design Selections: ${selectedCollection.title}`, padding, 40);

                // Items
                let currentY = headerHeight;

                // Helper to load image
                const loadImage = (src: string): Promise<HTMLImageElement> => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.src = src;
                    });
                };

                for (let i = 0; i < exportData.length; i++) {
                    const item = exportData[i];
                    rCtx.font = 'bold 18px Arial';
                    rCtx.fillText(`Selection #${i + 1}`, padding, currentY + 20);

                    const img = await loadImage(item.imgData);
                    const ratio = item.width / item.height;
                    const drawW = 200;
                    const drawH = drawW / ratio;

                    rCtx.drawImage(img, padding, currentY + 30, drawW, drawH);

                    if (item.notes) {
                        rCtx.font = '14px Arial';
                        rCtx.fillText(`Notes: ${item.notes}`, padding + drawW + 20, currentY + 50);
                    }

                    currentY += itemHeight;
                }

                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = reportCanvas.toDataURL(mimeType);

                // Download
                const link = document.createElement('a');
                link.download = `selections-${selectedCollection.title}.${format}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Open in new tab
                const win = window.open();
                if (win) {
                    win.document.write(`<img src="${dataUrl}" style="max-width: 100%"/>`);
                }
            }

        } catch (err: any) {
            console.error('Export Error:', err);
            alert('Failed to export: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600">{user?.email} {isAdmin && <span className="text-green-600 font-medium">(Admin)</span>}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <RoleBased allowedRoles="water">
                            <Button variant="outline" onClick={() => navigate('/water')} className="flex-1 md:flex-none">
                                <Palette className="mr-2 h-4 w-4" />
                                Designer View
                            </Button>
                        </RoleBased>
                        <RoleBased allowedRoles="admin">
                            <Button onClick={() => setShowUploadDialog(true)} className="flex-1 md:flex-none">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Collection
                            </Button>
                        </RoleBased>
                        <Button variant="ghost" onClick={onLogout} className="flex-1 md:flex-none">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-900">Error</h3>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {!selectedCollection ? (
                    <div>
                        <h2 className="text-xl font-bold mb-6">All Collections</h2>
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
                                        <div className="mt-3 flex items-center justify-between mb-2">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-sm">{collection.status}</span>
                                        </div>
                                        <Button
                                            className="w-full"
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
                                    ← Back
                                </Button>
                                <h2 className="text-2xl font-bold mt-2">{selectedCollection.title}</h2>
                            </div>
                            <RoleBased allowedRoles="admin">
                                <div className="flex gap-2">
                                    <select
                                        className="border rounded p-2 text-sm"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleDownload(e.target.value as 'pdf' | 'png' | 'jpg');
                                                e.target.value = ''; // Reset
                                            }
                                        }}
                                        disabled={loading || finalSelections.length === 0}
                                    >
                                        <option value="">Download Options...</option>
                                        <option value="pdf">Download PDF</option>
                                        <option value="png">Download PNG</option>
                                        <option value="jpg">Download JPG</option>
                                    </select>
                                </div>
                            </RoleBased>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
                                <div className="relative">
                                    <img
                                        ref={imageRef}
                                        src={selectedCollection.image_url}
                                        alt={selectedCollection.title}
                                        className="w-full rounded"
                                        crossOrigin="anonymous"
                                    />
                                    {/* Render markings */}
                                    {markings.map(marking => {
                                        const coords = marking.coordinates as any;
                                        const isSelected = finalSelections.some(fs => fs.marking_id === marking.id);

                                        return (
                                            <div
                                                key={marking.id}
                                                className={`absolute ${isSelected ? 'ring-4 ring-green-500 ring-offset-2' : ''}`}
                                                style={{
                                                    left: `${coords.x}%`,
                                                    top: `${coords.y}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                {/* Simple rendering for admin view */}
                                                {coords.type === 'tick' ? (
                                                    <div className="text-4xl font-bold" style={{ color: coords.color }}>✓</div>
                                                ) : coords.type === 'path' ? (
                                                    <div className="w-4 h-4 bg-current rounded-full" style={{ color: coords.color }} />
                                                ) : (
                                                    <div
                                                        className="border-4"
                                                        style={{
                                                            width: coords.radius ? `${coords.radius * 20}px` : `${coords.width * 2}px`,
                                                            height: coords.radius ? `${coords.radius * 20}px` : `${coords.height * 2}px`,
                                                            borderColor: coords.color,
                                                            borderRadius: coords.type === 'circle' ? '50%' : '0'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
                                <h3 className="font-bold mb-4">Design Markings</h3>
                                <div className="space-y-3">
                                    {markings.map(marking => {
                                        const isSelected = finalSelections.some(fs => fs.marking_id === marking.id);
                                        const selection = finalSelections.find(fs => fs.marking_id === marking.id);

                                        return (
                                            <div
                                                key={marking.id}
                                                className={`p-3 rounded border ${isSelected ? 'border-green-500 bg-green-50' : 'bg-gray-50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-sm font-medium">{marking.designer_id.split('@')[0]}</span>
                                                        <p className="text-xs text-gray-600">{marking.notes || 'No notes'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                            {marking.vote_count} votes
                                                        </span>
                                                    </div>
                                                </div>

                                                {isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        className="w-full mt-2"
                                                        variant={isSelected ? "destructive" : "default"}
                                                        onClick={() => isSelected ? removeSelection(selection!.id) : selectDesign(marking)}
                                                    >
                                                        {isSelected ? 'Remove Selection' : 'Select for Export'}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {markings.length === 0 && <p className="text-gray-500">No markings yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showUploadDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">Upload New Collection</h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Collection Title</label>
                                    <Input
                                        value={newCollectionTitle}
                                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                                        placeholder="e.g., Summer 2024"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image File</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCollectionsPage;
