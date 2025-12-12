'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { FiMail, FiLock, FiUser, FiHash, FiPhone, FiMapPin, FiEye, FiEyeOff, FiLoader, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nama: '',
        nik: '',
        telepon: '',
        kabupaten_kota: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Basic validation
            if (formData.nik.length !== 16) {
                throw new Error('NIK harus terdiri dari 16 digit angka.');
            }

            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.nama,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into public.users
                const { error: userError } = await supabase.from('users').insert({
                    id: authData.user.id,
                    email: formData.email,
                    role: 'hafiz',
                    nama: formData.nama,
                    telepon: formData.telepon,
                    kabupaten_kota: formData.kabupaten_kota || null
                });

                if (userError) throw userError;

                // 3. Insert into public.hafiz (Initial profile)
                const { error: hafizError } = await supabase.from('hafiz').insert({
                    user_id: authData.user.id,
                    nik: formData.nik,
                    nama: formData.nama,
                    tempat_lahir: '-', // Placeholder until they update profile
                    tanggal_lahir: '2000-01-01', // Placeholder
                    alamat: '-', // Placeholder
                    desa_kelurahan: '-', // Placeholder
                    kecamatan: '-', // Placeholder
                    kabupaten_kota: formData.kabupaten_kota || 'Jawa Timur',
                    tahun_tes: new Date().getFullYear(),
                    telepon: formData.telepon
                });

                if (hafizError) {
                    console.error('Error creating hafiz profile:', hafizError);
                    // Don't throw here, allowing user to login and fix profile later if needed
                }

                alert('Registrasi berhasil! Silakan login.');
                router.push('/login');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Terjadi kesalahan saat registrasi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-200/40 rounded-full blur-[100px] animate-float opacity-60 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-200/40 rounded-full blur-[100px] animate-float opacity-60 mix-blend-multiply" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-xl w-full glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in border border-white/50 my-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/30 mx-auto group-hover:scale-105 transition-transform">
                            L
                        </div>
                    </Link>
                    <h2 className="text-3xl font-display font-bold text-neutral-800 tracking-tight">
                        Daftar Akun Baru
                    </h2>
                    <p className="mt-2 text-neutral-500 font-light">
                        Bergabunglah sebagai Hafiz LPTQ Jawa Timur
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                        <FiAlertCircle size={20} className="flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="nama"
                                    required
                                    className="input-modern pl-11 w-full"
                                    placeholder="Sesuai KTP"
                                    value={formData.nama}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 ml-1">NIK</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiHash size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="nik"
                                    required
                                    minLength={16}
                                    maxLength={16}
                                    className="input-modern pl-11 w-full"
                                    placeholder="16 Digit NIK"
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiMail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="input-modern pl-11 w-full"
                                    placeholder="email@contoh.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 ml-1">Telepon / WA</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiPhone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    name="telepon"
                                    required
                                    className="input-modern pl-11 w-full"
                                    placeholder="08..."
                                    value={formData.telepon}
                                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                <FiLock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                minLength={6}
                                className="input-modern pl-11 pr-12 w-full"
                                placeholder="Minimal 6 karakter"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 ml-1">Kabupaten/Kota Domisili</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                <FiMapPin size={18} />
                            </div>
                            <select
                                name="kabupaten_kota"
                                required
                                className="input-modern pl-11 w-full appearance-none bg-white"
                                value={formData.kabupaten_kota}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Kabupaten/Kota...</option>
                                <option value="Kota Surabaya">Kota Surabaya</option>
                                <option value="Kabupaten Gresik">Kabupaten Gresik</option>
                                <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo</option>
                                <option value="Kabupaten Malang">Kabupaten Malang</option>
                                <option value="Kota Malang">Kota Malang</option>
                                <option value="Kabupaten Banyuwangi">Kabupaten Banyuwangi</option>
                                <option value="Kabupaten Jember">Kabupaten Jember</option>
                                {/* Add more areas as needed */}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" /> Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    Daftar Sekarang <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                            Masuk disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
