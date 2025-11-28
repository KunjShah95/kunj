
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { generatePDF } from '../../lib/pdfGenerator';
import { Download } from 'lucide-react';

const DesignReview = () => {
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

    const handleDownloadAll = async () => {
        if (uploads.length === 0) return;
        const urls = uploads.map(u => u.design_url);
        await generatePDF(urls, 'all-designs-combined.pdf');
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Design Review</h2>
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handleDownloadAll}
                    disabled={uploads.length === 0}
                >
                    <Download size={18} /> Download All as PDF
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploads.map((upload) => (
                    <div key={upload.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                        <img src={upload.design_url} alt="Design" className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-1"><strong>Status:</strong> {upload.status}</p>
                            <p className="text-sm text-gray-700 mb-2"><strong>Date:</strong> {new Date(upload.uploaded_at).toLocaleDateString()}</p>
                            <a
                                href={upload.design_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-2 text-blue-600 hover:underline text-sm font-medium"
                            >
                                View Full Size
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DesignReview;
