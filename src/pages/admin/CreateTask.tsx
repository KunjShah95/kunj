
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle } from 'lucide-react';

const CreateTask = () => {
    const [taskName, setTaskName] = useState('');
    const [category, setCategory] = useState('Rings');
    const [designer, setDesigner] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('tasks')
                .insert([
                    {
                        task_name: taskName,
                        category,
                        designer_id: designer, // Assuming simple string for now
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            alert('Task created successfully!');
            setTaskName('');
            setDesigner('');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error creating task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
            <form onSubmit={handleCreate} className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto border border-gray-100">
                <div className="mb-6">
                    <label className="block mb-2 font-medium text-gray-900">Task Name</label>
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="e.g., Diamond Ring Design 001"
                        required
                        className="w-full p-3 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-gray-900">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    >
                        <option value="Rings">Rings</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bracelets">Bracelets</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-gray-900">Assign Designer</label>
                    <input
                        type="text"
                        value={designer}
                        onChange={(e) => setDesigner(e.target.value)}
                        placeholder="Designer Name or ID"
                        required
                        className="w-full p-3 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                    disabled={loading}
                >
                    <PlusCircle size={20} />
                    {loading ? 'Creating...' : 'Create Task'}
                </button>
            </form>
        </div>
    );
};

export default CreateTask;
