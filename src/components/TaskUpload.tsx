import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface TaskUploadProps {
  adminId: string;
}

export default function TaskUpload({ adminId }: TaskUploadProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Rings');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Pendants', 'Chains'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a task title' });
      return;
    }

    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Supabase Storage
      const filename = `tasks/${adminId}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filename, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('designs')
        .getPublicUrl(filename);

      // Create task in database
      const { data: taskData, error: dbError } = await supabase
        .from('tasks')
        .insert([
          {
            title: title.trim(),
            category,
            description: description.trim(),
            admin_id: adminId,
            image_url: publicData.publicUrl,
            status: 'pending'
          }
        ])
        .select();

      if (dbError) {
        throw new Error(`Failed to create task: ${dbError.message}`);
      }

      setMessage({ type: 'success', text: 'Task created successfully!' });
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview('');

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Upload size={24} />
        Create New Design Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Wedding Ring Collection - Set A"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes or instructions for designers..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Design Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="h-40 w-auto mx-auto rounded" />
                  <p className="text-sm text-gray-600">{file?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={32} />
                  <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
