'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

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
                console.error('Supabase Auth Error:', error.message);
                throw error;
            }

            if (data.user) {
                // Check user role from public.users table to redirect correctly
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .maybeSingle();

                if (userError) {
                    console.error('Error fetching user role:', userError);
                    // Fallback to generic dashboard if role check fails
                    router.push('/dashboard');
                } else if (userData) {
                    router.push(`/dashboard?role=${userData.role}`);
                } else {
                    console.log('User has no profile in public.users, defaulting to generic dashboard');
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Login exception:', err);
            if (err.message && err.message.includes('Email not confirmed')) {
                setError('Email belum dikonfirmasi. Silakan cek inbox email Anda atau hubungi admin.');
            } else {
                setError(err.message || 'Email atau password salah. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setSocialLoading(provider);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                throw error;
            }
        } catch (err: any) {
            console.error(`${provider} login error:`, err);
            setError(err.message || `Gagal login dengan ${provider}. Silakan coba lagi.`);
            setSocialLoading(null);
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
                            H
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

                {/* Social Login Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        disabled={socialLoading !== null || loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {socialLoading === 'google' ? (
                            <FiLoader className="animate-spin text-neutral-400" size={20} />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span className="font-medium text-neutral-700">
                            {socialLoading === 'google' ? 'Menghubungkan...' : 'Masuk dengan Google'}
                        </span>
                    </button>

                    <button
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={socialLoading !== null || loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] border border-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {socialLoading === 'facebook' ? (
                            <FiLoader className="animate-spin text-white" size={20} />
                        ) : (
                            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        )}
                        <span className="font-medium text-white">
                            {socialLoading === 'facebook' ? 'Menghubungkan...' : 'Masuk dengan Facebook'}
                        </span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-neutral-400">atau masuk dengan email</span>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="input-modern pl-12 pr-10 w-full"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-primary-500 transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
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
                            disabled={loading || socialLoading !== null}
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

