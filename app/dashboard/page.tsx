'use client';

import { Suspense, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiUsers,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiFileText,
    FiCalendar,
    FiAward,
    FiPieChart,
    FiBarChart2,
    FiActivity,
    FiAlertCircle
} from 'react-icons/fi';

// Interfaces
interface DashboardStats {
    total: number;
    lulus: number;
    gender: { L: number; P: number };
    age: { '<20': number; '20-29': number; '30-39': number; '40+': number };
    loading: boolean;
    error?: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DashboardContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL API endpoint instead of Supabase
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (!response.ok || !data.user) {
                    console.error('No session found:', data);
                    window.location.href = '/login';
                    return;
                }

                setUser(data.user as UserData);
            } catch (err) {
                console.error('Unexpected error fetching user:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Gagal memuat data user</p>
                    <button onClick={() => window.location.href = '/login'} className="btn btn-primary">
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans flex">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-neutral-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/40 rounded-full blur-[100px] animate-float opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-200/40 rounded-full blur-[100px] animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
            </div>

            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
                {/* Clean Header */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            Dashboard <span className="gradient-text">Overview</span>
                        </h1>
                        <p className="text-neutral-500 text-lg">
                            Selamat datang kembali, <span className="font-semibold text-neutral-800">{user.nama}</span>
                        </p>
                    </div>
                    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium text-neutral-600 shadow-sm border border-white/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Dashboard Content Based on Role */}
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {user.role === 'admin_provinsi' && <AdminProvinsiDashboard />}
                    {user.role === 'admin_kabko' && <AdminKabKoDashboard kabko={user.kabupaten_kota || 'Unknown'} />}
                    {user.role === 'hafiz' && <HafizDashboard />}
                </div>

                {/* Recent Activity Section */}
                <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="card-modern">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                    <FiActivity size={24} />
                                </div>
                                Aktivitas Terbaru
                            </h2>
                            <button className="btn btn-ghost text-sm font-medium">
                                Lihat Semua
                            </button>
                        </div>
                        <div className="space-y-6">
                            <ActivityItem
                                icon={<FiCheckCircle className="text-emerald-500" />}
                                title="Laporan harian disetujui"
                                description="Laporan kegiatan mengajar tanggal 10 Desember 2025 telah diverifikasi."
                                time="2 jam yang lalu"
                                bg="bg-emerald-50"
                            />
                            <ActivityItem
                                icon={<FiFileText className="text-blue-500" />}
                                title="Laporan baru ditambahkan"
                                description="Muhammad Ahmad menambahkan laporan kegiatan muroja'ah."
                                time="5 jam yang lalu"
                                bg="bg-blue-50"
                            />
                            <ActivityItem
                                icon={<FiCalendar className="text-purple-500" />}
                                title="Jadwal tes diperbarui"
                                description="Periode tes tahun 2026 telah dibuka pendaftarannya."
                                time="1 hari yang lalu"
                                bg="bg-purple-50"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Admin Provinsi Dashboard ---
function AdminProvinsiDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        lulus: 0,
        gender: { L: 0, P: 0 },
        age: { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 },
        loading: true,
        error: ''
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchStats() {
            try {
                // Use MySQL API endpoint
                const response = await fetch('/api/statistics');
                const result = await response.json();

                if (!response.ok) {
                    if (isMounted) setStats(s => ({ ...s, loading: false, error: result.error || 'Gagal memuat statistik' }));
                    return;
                }

                // Map API response to stats format
                const total = result.overall?.total || 0;
                const lulus = result.overall?.lulus || 0;

                if (isMounted) {
                    setStats({
                        total,
                        lulus,
                        gender: { L: Math.floor(total * 0.65), P: Math.floor(total * 0.35) }, // Placeholder
                        age: { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 }, // Placeholder
                        loading: false,
                        error: ''
                    });
                }

            } catch (err: any) {
                console.error('Unexpected error fetching stats:', err);
                if (isMounted) setStats(s => ({ ...s, loading: false, error: err.message || 'Terjadi kesalahan tidak terduga' }));
            }
        }

        fetchStats();
        return () => { isMounted = false; };
    }, []);

    const genderPercent = stats.total > 0 ? {
        L: Math.round((stats.gender.L / stats.total) * 100) || 0,
        P: Math.round((stats.gender.P / stats.total) * 100) || 0
    } : { L: 0, P: 0 };

    const lulusPercent = stats.total > 0 ? Math.round((stats.lulus / stats.total) * 100) : 0;

    if (stats.loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm"></div>
                ))}
            </div>
        );
    }

    if (stats.error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3">
                <FiAlertCircle size={24} />
                <p>Error: {stats.error}. Pastikan koneksi internet stabil dan konfigurasi Supabase benar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Total Huffadz"
                    value={stats.total.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-primary-500 to-primary-600"
                    trend="+12%"
                />
                <ModernStatCard
                    title="Lulus Sertifikasi"
                    value={stats.lulus.toLocaleString()}
                    icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    trend={`${lulusPercent}% Rate`}
                />
                <ModernStatCard
                    title="Laki-laki"
                    value={stats.gender.L.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-blue-400 to-blue-500"
                    subtext={`${genderPercent.L}% dari total`}
                />
                <ModernStatCard
                    title="Perempuan"
                    value={stats.gender.P.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-secondary-500 to-pink-600"
                    subtext={`${genderPercent.P}% dari total`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-modern flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2 self-start">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <FiPieChart size={20} />
                        </div>
                        Distribusi Gender
                    </h3>
                    {stats.total === 0 ? (
                        <div className="text-neutral-400 py-10">Belum ada data</div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-10 w-full px-4">
                            <div className="relative w-48 h-48 rounded-full shadow-2xl shadow-primary-200/50 flex-shrink-0"
                                style={{
                                    background: `conic-gradient(#3b82f6 0% ${genderPercent.L}%, #ec4899 ${genderPercent.L}% 100%)`
                                }}>
                                <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center flex-col">
                                    <span className="text-4xl font-extrabold text-neutral-800 tracking-tight">{stats.total}</span>
                                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">Total</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 text-left w-full">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                                    <div className="w-2 h-10 rounded-full bg-blue-500"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold text-neutral-800">Laki-laki</p>
                                            <p className="text-sm font-bold text-blue-600">{genderPercent.L}%</p>
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium">{stats.gender.L} Orang</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                                    <div className="w-2 h-10 rounded-full bg-secondary-500"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold text-neutral-800">Perempuan</p>
                                            <p className="text-sm font-bold text-secondary-500">{genderPercent.P}%</p>
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium">{stats.gender.P} Orang</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-modern">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <FiBarChart2 size={20} />
                        </div>
                        Rentang Usia Huffadz
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(stats.age).map(([range, count]: [string, any]) => {
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={range}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-semibold text-neutral-700">{range} Tahun</span>
                                        <div className="text-right">
                                            <span className="font-bold text-neutral-900">{count}</span>
                                            <span className="text-xs text-neutral-500 ml-1 font-medium">({Math.round(percent)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Admin KabKo Dashboard - For Admin Kabupaten/Kota ---
function AdminKabKoDashboard({ kabko }: { kabko: string }) {
    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="p-10 bg-gradient-to-br from-indigo-900 to-primary-900 rounded-[2.5rem] shadow-2xl shadow-primary-900/30 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                            Admin Wilayah
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{kabko}</h2>
                    <p className="text-primary-100 opacity-90 text-xl font-light max-w-xl">
                        Kelola data Huffadz dan verifikasi laporan di wilayah Anda
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Total Hafiz</p>
                            <p className="text-4xl font-extrabold">487</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Lulus Seleksi</p>
                            <p className="text-4xl font-extrabold text-emerald-400">412</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Laporan Pending</p>
                            <p className="text-4xl font-extrabold text-amber-400">12</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Insentif Aktif</p>
                            <p className="text-4xl font-extrabold">290</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/dashboard/hafiz" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg text-white">
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Data Hafiz</h3>
                            <p className="text-neutral-500 text-sm">Kelola data Huffadz wilayah</p>
                        </div>
                    </div>
                </a>
                <a href="/dashboard/laporan" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg text-white">
                            <FiFileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Verifikasi Laporan</h3>
                            <p className="text-neutral-500 text-sm">12 laporan menunggu</p>
                        </div>
                    </div>
                </a>
                <a href="/dashboard/kuota" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg text-white">
                            <FiPieChart size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Statistik</h3>
                            <p className="text-neutral-500 text-sm">Lihat statistik wilayah</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}

// --- Hafiz Dashboard ---
function HafizDashboard() {
    return (
        <div className="space-y-8">
            {/* Greeting Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/30 group">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold mb-6 border border-emerald-500/30 backdrop-blur-sm uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Status: Lulus Seleksi
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-none tracking-tight">Pencapaian <br />Luar Biasa!</h2>
                            <p className="text-indigo-100 max-w-lg text-lg leading-relaxed opacity-90 font-light">
                                Selamat! Anda menyelesaikan seleksi 2024 dengan hasil memuaskan.
                            </p>
                        </div>
                        <div className="flex gap-8 text-center bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-2">Nilai Tahfidz</p>
                                <p className="text-5xl font-extrabold">92.5</p>
                            </div>
                            <div className="w-px bg-indigo-400/30 h-16 self-center"></div>
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-2">Wawasan</p>
                                <p className="text-5xl font-extrabold">88.0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernStatCard
                    title="Laporan Bulan Ini"
                    value="18"
                    icon={<FiFileText className="text-white" />}
                    gradient="bg-gradient-to-br from-orange-400 to-orange-600"
                />
                <ModernStatCard
                    title="Insentif Diterima"
                    value="Rp 12.000.000"
                    icon={<FiAward className="text-white" />}
                    gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
                />
                <ModernStatCard
                    title="Total Jam Mengajar"
                    value="124 Jam"
                    icon={<FiClock className="text-white" />}
                    gradient="bg-gradient-to-br from-purple-400 to-purple-600"
                />
            </div>
        </div>
    );
}

// --- Components ---

interface ModernStatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    gradient: string;
    trend?: string;
    subtext?: string;
}

function ModernStatCard({ title, value, icon, gradient, trend, subtext }: ModernStatCardProps) {
    return (
        <div className="card-modern group">
            <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${gradient} shadow-lg shadow-indigo-500/10 text-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <FiTrendingUp />
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-neutral-500 text-sm font-medium mb-1 tracking-wide">{title}</p>
                <h3 className="text-3xl font-extrabold text-neutral-800 tracking-tight">{value}</h3>
                {subtext && <p className="text-xs text-neutral-400 mt-2 font-medium">{subtext}</p>}
            </div>
        </div>
    );
}

interface ActivityItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    time: string;
    bg: string;
}

function ActivityItem({ icon, title, description, time, bg }: ActivityItemProps) {
    return (
        <div className="p-4 hover:bg-neutral-50 rounded-2xl transition-colors flex gap-5 items-start group border border-transparent hover:border-neutral-100">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-neutral-800 text-base">{title}</h4>
                <p className="text-neutral-500 text-sm mt-1 leading-relaxed">{description}</p>
                <p className="text-xs text-primary-500 font-medium mt-2">{time}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DashboardContent />
        </Suspense>
    );
}
