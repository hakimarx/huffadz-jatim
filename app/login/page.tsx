'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Supabase Authentication
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // Check user role from public.users table to redirect correctly
                // Note: This matches the table schema we saw earlier
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user role:', userError);
                    // Fallback to generic dashboard if role check fails
                    router.push('/dashboard');
                } else if (userData) {
                    router.push(`/dashboard?role=${userData.role}`);
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-200/40 rounded-full blur-[100px] animate-float opacity-60 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-200/40 rounded-full blur-[100px] animate-float opacity-60 mix-blend-multiply" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-md w-full space-y-8 glass p-10 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in border border-white/50">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/30 mx-auto group-hover:scale-105 transition-transform">
                            L
                        </div>
                    </Link>
                    <h2 className="text-3xl font-display font-bold text-neutral-800 tracking-tight">
                        Selamat Datang
                    </h2>
                    <p className="mt-2 text-neutral-500 font-light">
                        Masuk untuk mengakses dashboard Huffadz
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                        <FiAlertCircle size={20} className="flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                <FiMail size={20} />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-modern pl-12 w-full"
                                placeholder="Alamat Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                <FiLock size={20} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input-modern pl-12 w-full"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded-lg transition-colors"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-neutral-500">
                                Ingat saya
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                Lupa password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" /> Masuk...
                                </>
                            ) : (
                                <>
                                    Masuk <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
