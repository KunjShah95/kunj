
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';

const Dashboard = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <div className="flex gap-4">
                    <Link to="/admin/review" className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100">
                        <Eye size={18} /> Review Designs
                    </Link>
                    <Link to="/admin/create" className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700">
                        <Plus size={18} /> Create Task
                    </Link>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading tasks...</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left border-b border-gray-100 bg-gray-50 font-semibold text-gray-600">Task Name</th>
                                <th className="p-4 text-left border-b border-gray-100 bg-gray-50 font-semibold text-gray-600">Category</th>
                                <th className="p-4 text-left border-b border-gray-100 bg-gray-50 font-semibold text-gray-600">Designer</th>
                                <th className="p-4 text-left border-b border-gray-100 bg-gray-50 font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-left border-b border-gray-100 bg-gray-50 font-semibold text-gray-600">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-left border-b border-gray-100 text-gray-900">{task.task_name}</td>
                                    <td className="p-4 text-left border-b border-gray-100 text-gray-600">{task.category}</td>
                                    <td className="p-4 text-left border-b border-gray-100 text-gray-600">{task.designer_id}</td>
                                    <td className="p-4 text-left border-b border-gray-100">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${task.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-left border-b border-gray-100 text-gray-500">{new Date(task.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No tasks found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
