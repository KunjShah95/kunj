import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
    const [status, setStatus] = useState<string>('Testing...');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);

    useEffect(() => {
        runTests();
    }, []);

    const runTests = async () => {
        addLog('Starting Supabase connection tests...');

        // Check Config
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        addLog(`Config Check: URL starts with ${url?.substring(0, 8)}...`);
        addLog(`Config Check: Key exists? ${!!key}`);

        try {
            // Test 1: Check Session
            addLog('Test 1: Checking session...');
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                addLog(`❌ Session Error: ${sessionError.message}`);
            } else {
                addLog(`✅ Session Check: ${sessionData.session ? 'Active Session' : 'No Active Session'}`);
            }

            // Test 2: Try to Sign Up a dummy user with gmail
            const testEmail = `test_user_${Date.now()}@gmail.com`;
            addLog(`Test 2: Attempting Sign Up with ${testEmail}...`);
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: testEmail,
                password: 'password123',
            });

            if (signUpError) {
                addLog(`❌ Sign Up Error: ${signUpError.message}`);
                addLog(`   Status: ${signUpError.status}`);
            } else {
                addLog(`✅ Sign Up Success: User ID ${signUpData.user?.id}`);
                await supabase.auth.signOut();
            }

        } catch (err: any) {
            addLog(`❌ CRITICAL ERROR: ${err.message}`);
        } finally {
            setStatus('Tests Completed');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            <div className="mb-4 font-semibold text-blue-600">Status: {status}</div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
}
