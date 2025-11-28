
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
            <div className="text-2xl font-bold text-gray-800">
                <Link to="/" className="no-underline text-inherit">DesignApp</Link>
            </div>
            <div className="flex gap-6">
                <Link to="/admin" className="text-gray-600 no-underline font-medium hover:text-blue-600 transition-colors">Admin</Link>
                <Link to="/water" className="text-gray-600 no-underline font-medium hover:text-blue-600 transition-colors">Water User</Link>
            </div>
        </nav>
    );
};

export default Navbar;
