'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Implement Supabase authentication
            // const { data, error } = await supabase.auth.signInWithPassword({
            //   email: formData.email,
            //   password: formData.password
            // });

            // Temporary demo login
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Demo: redirect based on email
            if (formData.email.includes('admin.provinsi')) {
                router.push('/dashboard?role=admin_provinsi');
            } else if (formData.email.includes('admin')) {
                router.push('/dashboard?role=admin_kabko');
            } else {
                router.push('/dashboard?role=hafiz');
            }
        } catch (err) {
            setError('Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-4">
                        <span className="text-2xl">📖</span>
                        <span className="font-semibold text-primary-700">LPTQ Jawa Timur</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">Selamat Datang</h1>
                    <p className="text-neutral-600">Masuk ke Sistem Pendataan Huffadz</p>
                </div>

                {/* Login Card */}
                <div className="card-glass">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="alert alert-error">
                                <FiAlertCircle className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="form-group">
                            <label className="form-label required">Email</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    <FiMail />
                                </div>
                                <input
                                    type="email"
                                    className="form-input pl-10"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label className="form-label required">Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    <FiLock />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300" />
                                <span className="text-neutral-600">Ingat saya</span>
                            </label>
                            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                                Lupa password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                'Masuk'
                            )}
                        </button>

                        {/* Demo Accounts */}
                        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 text-sm">
                            <p className="font-semibold text-accent-800 mb-2">🔑 Demo Accounts:</p>
                            <div className="space-y-1 text-neutral-700">
                                <p>• Admin Provinsi: admin.provinsi@lptq.jatimprov.go.id</p>
                                <p>• Admin Kab/Ko: admin.surabaya@lptq.jatimprov.go.id</p>
                                <p>• Hafiz: hafiz@example.com</p>
                                <p className="text-accent-700 font-medium mt-2">Password: admin123</p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Register Link */}
                <div className="text-center mt-6">
                    <p className="text-neutral-600">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Daftar sebagai Hafiz
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-4">
                    <Link href="/" className="text-neutral-500 hover:text-neutral-700 text-sm">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
