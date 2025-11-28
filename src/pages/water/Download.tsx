
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { generatePDF } from '../../lib/pdfGenerator';
import { Download as DownloadIcon, FileText } from 'lucide-react';

const Download = () => {
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUploads();
    }, []);

    const fetchUploads = async () => {
        try {
            const { data, error } = await supabase
                .from('design_uploads')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) throw error;
            setUploads(data || []);
        } catch (error) {
            console.error('Error fetching uploads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (uploads.length === 0) return;
        const urls = uploads.map(u => u.design_url);
        await generatePDF(urls, 'my-designs.pdf');
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">My Downloads</h2>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                    onClick={handleDownloadPDF}
                    disabled={uploads.length === 0}
                >
                    <DownloadIcon size={20} />
                    Download All as PDF
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-12">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <img src={upload.design_url} alt="Design" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex justify-between items-center bg-white">
                                <span className="text-sm text-gray-500">{new Date(upload.uploaded_at).toLocaleDateString()}</span>
                                {upload.status === 'marked' && (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md uppercase tracking-wide">Final</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {uploads.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No designs uploaded yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Download;
