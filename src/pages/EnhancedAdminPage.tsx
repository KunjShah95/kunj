import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Search, Filter, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';


interface EnhancedAdminPageProps {
    adminId: string;
    onLogout: () => void;
}

const EnhancedAdminPage: React.FC<EnhancedAdminPageProps> = ({ adminId, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [drawings, setDrawings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrawings = async () => {
            try {
                // Mock data
                const mockDrawings = [
                    {
                        id: '1',
                        title: 'Mock Drawing 1',
                        uploaded_by: 'user1@example.com',
                        created_at: new Date().toISOString(),
                        image_url: 'https://via.placeholder.com/400x300'
                    },
                    {
                        id: '2',
                        title: 'Mock Drawing 2',
                        uploaded_by: 'user2@example.com',
                        created_at: new Date().toISOString(),
                        image_url: 'https://via.placeholder.com/400x300'
                    }
                ];
                setDrawings(mockDrawings);
            } catch (error) {
                console.error('Error fetching uploads:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrawings();
    }, []);

    const filteredDrawings = drawings.filter(drawing =>
        drawing.uploaded_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                            {adminId}
                        </span>
                    </div>
                    <Button variant="ghost" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search users or tasks..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredDrawings.map((drawing) => (
                            <div key={drawing.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{drawing.uploaded_by}</h3>
                                        <p className="text-xs text-gray-500">{drawing.title}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(drawing.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="mb-4 aspect-video rounded-md bg-gray-100 flex items-center justify-center overflow-hidden relative group">
                                    {drawing.image_url ? (
                                        <img
                                            src={drawing.image_url}
                                            alt="Drawing"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="text-gray-400">No Preview</span>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    <Button size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {filteredDrawings.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No drawings found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default EnhancedAdminPage;
