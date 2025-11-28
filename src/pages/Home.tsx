
import { Link } from 'react-router-dom';
import { Shield, Droplets } from 'lucide-react';

const Home = () => {
    return (
        <div className="text-center py-16 px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to DesignApp</h1>
            <p className="text-gray-500 text-xl mb-12">Select your role to continue</p>

            <div className="flex gap-8 justify-center flex-wrap">
                <Link to="/admin" className="bg-white p-8 rounded-xl w-72 no-underline text-inherit shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-4 border-t-4 border-blue-600">
                    <Shield size={48} className="text-blue-600" />
                    <h2 className="m-0 text-gray-800 font-bold text-xl">Admin</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">Manage tasks, assign designers, and review uploads.</p>
                </Link>

                <Link to="/water" className="bg-white p-8 rounded-xl w-72 no-underline text-inherit shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-4 border-t-4 border-emerald-500">
                    <Droplets size={48} className="text-emerald-500" />
                    <h2 className="m-0 text-gray-800 font-bold text-xl">Water User</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">Upload designs, mark finals, and download PDFs.</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
