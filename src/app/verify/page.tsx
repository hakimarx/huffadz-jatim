'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight } from 'react-icons/fi';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Sedang memverifikasi email Anda...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token verifikasi tidak ditemukan.');
            return;
        }

        async function verifyEmail() {
            try {
                const response = await fetch(`/api/auth/verify?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email Anda telah berhasil diverifikasi.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Gagal memverifikasi email.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Terjadi kesalahan koneksi.');
            }
        }

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-neutral-100">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center text-4xl mx-auto animate-pulse">
                            <FiLoader className="animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-800">Memverifikasi...</h2>
                        <p className="text-neutral-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto">
                            <FiCheckCircle />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-800">Verifikasi Berhasil!</h2>
                        <p className="text-neutral-500">{message}</p>
                        <Link href="/login" className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group">
                            Login Sekarang <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto">
                            <FiXCircle />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-800">Verifikasi Gagal</h2>
                        <p className="text-neutral-500">{message}</p>
                        <Link href="/register" className="btn bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-none w-full py-4 rounded-2xl">
                            Daftar Ulang
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <FiLoader className="animate-spin text-4xl text-primary-600" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
