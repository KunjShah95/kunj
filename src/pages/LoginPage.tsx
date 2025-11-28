import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock } from 'lucide-react';

// Simple Card components since I didn't implement them yet
const SimpleCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

interface LoginPageProps {
    onLogin: (role: 'admin' | 'water', userId: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (userId === 'admin' && password === 'admin123') {
            onLogin('admin', userId);
        } else if (userId.startsWith('water') && password === 'water123') {
            onLogin('water', userId);
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <SimpleCard className="w-full max-w-md p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Image Ink Studio</h1>
                    <p className="text-gray-500">Login to your account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">User ID</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Enter User ID"
                                className="pl-10"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                type="password"
                                placeholder="Enter Password"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </SimpleCard>
        </div>
    );
};

export default LoginPage;
