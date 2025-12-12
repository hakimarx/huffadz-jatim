'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestConnectionPage() {
    const [status, setStatus] = useState('Testing...');
    const [envCheck, setEnvCheck] = useState<any>({});
    const [fetchResult, setFetchResult] = useState<any>(null);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setEnvCheck({
            url_exists: !!url,
            url_value: url, // Be careful showing this if sharing screen, but for debug it's needed
            key_exists: !!key,
            key_length: key?.length
        });

        if (!url || !key) {
            setStatus('Error: Missing Environment Variables');
            return;
        }

        const supabase = createClient(url, key);

        async function test() {
            try {
                // Try a simple health check or fetch
                const start = Date.now();
                const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
                const end = Date.now();

                if (error) {
                    setFetchResult({ success: false, error });
                    setStatus('Failed: Supabase Error');
                } else {
                    setFetchResult({ success: true, data, time: end - start });
                    setStatus('Success: Connected to Supabase');
                }
            } catch (err: any) {
                setFetchResult({ success: false, error: err.message, stack: err.stack });
                setStatus('Failed: Exception Thrown');
            }
        }

        test();
    }, []);

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold">Status: {status}</h2>
            </div>

            <div className="mb-6">
                <h3 className="font-bold">Environment Variables:</h3>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                    {JSON.stringify(envCheck, null, 2)}
                </pre>
            </div>

            <div>
                <h3 className="font-bold">Fetch Result:</h3>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                    {JSON.stringify(fetchResult, null, 2)}
                </pre>
            </div>
        </div>
    );
}
