import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/lib/roleUtils';

const SimpleCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<AppRole>('water');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signIn(email, role);
            // Navigation is handled by App.tsx
        } catch (err) {
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <SimpleCard className="w-full max-w-md p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Image Ink Studio</h1>
                    <p className="text-gray-500">Enter your details to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email / Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Enter your name or email"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select Role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('water')}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${role === 'water'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <User className="h-6 w-6" />
                                <span className="font-medium">Designer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${role === 'admin'
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Shield className="h-6 w-6" />
                                <span className="font-medium">Admin</span>
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Continue'}
                    </Button>
                </form>
            </SimpleCard>
        </div>
    );
};

export default LoginPage;
