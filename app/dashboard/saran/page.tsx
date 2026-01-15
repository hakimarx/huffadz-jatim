'use client';

import { useState, useEffect } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

export default function SaranPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (response.ok && data.user) {
                    setUser(data.user as UserData);
                } else {
                    window.location.href = '/login';
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSending(false);
        setSent(true);
        setMessage('');

        setTimeout(() => setSent(false), 3000);
    };

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                <FiMessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800">Saran & Masukan</h2>
                                {/* Text removed as requested */}
                            </div>
                        </div>

                        {sent && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                                <FiSend />
                                Terima kasih! Saran Anda telah kami terima.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Pesan Anda
                                </label>
                                <textarea
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder="Tuliskan saran, kritik, atau masukan Anda di sini..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="btn btn-primary flex items-center gap-2 px-6"
                                >
                                    {sending ? 'Mengirim...' : (
                                        <>
                                            <FiSend /> Kirim Masukan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
