
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload as UploadIcon, CheckCircle } from 'lucide-react';

const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [marked, setMarked] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setMarked(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { error } = await supabase.storage
                .from('designs')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('designs')
                .getPublicUrl(fileName);

            // Save metadata to DB
            const { error: dbError } = await supabase
                .from('design_uploads')
                .insert([
                    {
                        design_url: publicUrl,
                        status: marked ? 'marked' : 'pending',
                        uploaded_at: new Date().toISOString()
                    }
                ]);

            if (dbError) throw dbError;

            alert('Upload successful!');
            setFile(null);
            setPreview(null);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Design</h2>

            <div className="my-8 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden transition-colors hover:border-blue-500 bg-gray-50">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="file-upload"
                    hidden
                />
                <label htmlFor="file-upload" className="block cursor-pointer min-h-[300px] flex items-center justify-center w-full h-full">
                    {preview ? (
                        <img src={preview} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center gap-4">
                            <UploadIcon size={48} className="text-gray-400" />
                            <p className="text-lg font-medium">Click to upload image</p>
                            <p className="text-sm text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                    )}
                </label>
            </div>

            {preview && (
                <div className="flex gap-4 justify-end mt-6">
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${marked
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setMarked(!marked)}
                    >
                        <CheckCircle size={20} />
                        {marked ? 'Marked as Final' : 'Mark as Final'}
                    </button>

                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Submit Design'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Upload;
