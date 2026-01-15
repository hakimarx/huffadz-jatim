'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
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
                const response = await fetch('/api/auth/session');
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    if (loading) return <PageLoader />;

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">Akses Ditolak</h2>
                    <p className="text-neutral-500">Silakan login terlebih dahulu.</p>
                    <Link href="/login" className="btn btn-primary mt-4 inline-block">Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
                        <p className="text-neutral-500 text-sm">Selamat datang kembali, {user.nama}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            {user.nama.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        {user.role === 'admin_provinsi' && <AdminProvinsiDashboard />}
                        {user.role === 'admin_kabko' && user.kabupaten_kota && <AdminKabKoDashboard kabko={user.kabupaten_kota} />}
                        {user.role === 'hafiz' && <HafizDashboard />}
                    </div>
                </main>
            </div>
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
                const response = await fetch('/api/statistics');
                const result = await response.json();

                if (!response.ok) {
                    if (isMounted) setStats(s => ({ ...s, loading: false, error: result.error || 'Gagal memuat statistik' }));
                    return;
                }

                const total = result.overall?.total || 0;
                const lulus = result.overall?.lulus || 0;

                if (isMounted) {
                    setStats({
                        total,
                        lulus,
                        gender: result.gender || { L: 0, P: 0 },
                        age: result.age || { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 },
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

    if (stats.error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3">
                <FiAlertCircle size={24} />
                <p>Error: {stats.error}. Pastikan koneksi internet stabil dan konfigurasi database benar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary-900/30 group">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary-100 text-xs font-bold mb-6 border border-white/10 backdrop-blur-sm uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Update
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
                                Overview Data <br />Huffadz Jawa Timur
                            </h2>
                            <p className="text-primary-100 max-w-lg text-lg leading-relaxed opacity-90 font-light">
                                Pantau perkembangan jumlah hafiz dan kelulusan seleksi secara real-time.
                            </p>
                            <div className="mt-8 flex gap-4">
                                <Link href="/dashboard/kuota" className="btn bg-white text-primary-900 hover:bg-neutral-100 border-none px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">
                                    Lihat Statistik Lengkap
                                </Link>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="text-center p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/15 transition-colors">
                                <p className="text-xs text-primary-200 uppercase tracking-widest font-bold mb-3">Total Huffadz</p>
                                <p className="text-5xl font-extrabold tracking-tighter">
                                    {stats.loading ? <span className="animate-pulse">...</span> : stats.total}
                                </p>
                            </div>
                            <div className="text-center p-6 bg-emerald-500/20 rounded-3xl backdrop-blur-md border border-emerald-400/30 shadow-xl hover:bg-emerald-500/30 transition-colors">
                                <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold mb-3">Lulus Sertifikasi</p>
                                <p className="text-5xl font-extrabold text-emerald-300 tracking-tighter">
                                    {stats.loading ? <span className="animate-pulse">...</span> : stats.lulus}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Laki-laki"
                    value={stats.loading ? "..." : stats.gender.L.toString()}
                    icon={<FiUsers className="text-white" />}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="+5.2%"
                    subtext="Bulan ini"
                />
                <ModernStatCard
                    title="Perempuan"
                    value={stats.loading ? "..." : stats.gender.P.toString()}
                    icon={<FiUsers className="text-white" />}
                    gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                    trend="+3.8%"
                    subtext="Bulan ini"
                />
                <ModernStatCard
                    title="Rata-rata Usia"
                    value="24"
                    icon={<FiClock className="text-white" />}
                    gradient="bg-gradient-to-br from-orange-400 to-orange-600"
                    subtext="Tahun"
                />
                <ModernStatCard
                    title="Tingkat Kelulusan"
                    value={stats.total > 0 ? `${Math.round((stats.lulus / stats.total) * 100)}%` : "0%"}
                    icon={<FiCheckCircle className="text-white" />}
                    gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
                    trend="+12%"
                    subtext="Dari periode lalu"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gender Distribution */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-neutral-800">Distribusi Gender</h3>
                            <p className="text-neutral-500 text-sm mt-1">Perbandingan jumlah hafiz laki-laki dan perempuan</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FiPieChart size={24} />
                        </div>
                    </div>

                    <div className="flex items-center justify-center h-64 relative">
                        {/* Simple CSS Pie Chart Placeholder */}
                        <div className="w-48 h-48 rounded-full border-[16px] border-indigo-100 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-[16px] border-indigo-600 border-r-transparent border-b-transparent rotate-45"></div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-neutral-800">
                                    {stats.total > 0 ? Math.round((stats.gender.L / stats.total) * 100) : 0}%
                                </span>
                                <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Laki-laki</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                <span className="text-sm font-semibold text-neutral-600">Laki-laki</span>
                            </div>
                            <p className="text-2xl font-bold text-neutral-800">{stats.gender.L}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                                <span className="text-sm font-semibold text-neutral-600">Perempuan</span>
                            </div>
                            <p className="text-2xl font-bold text-neutral-800">{stats.gender.P}</p>
                        </div>
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-neutral-800">Rentang Usia</h3>
                            <p className="text-neutral-500 text-sm mt-1">Statistik usia para huffadz</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <FiBarChart2 size={24} />
                        </div>
                    </div>

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
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-neutral-800">Aktivitas Terbaru</h3>
                    <button className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors">Lihat Semua</button>
                </div>
                <div className="space-y-4">
                    <ActivityItem
                        icon={<FiCheckCircle />}
                        title="Verifikasi Berkas Selesai"
                        description="Admin memverifikasi 15 berkas baru dari Kabupaten Gresik"
                        time="2 jam yang lalu"
                        bg="bg-emerald-100 text-emerald-600"
                    />
                    <ActivityItem
                        icon={<FiUsers />}
                        title="Pendaftaran Baru"
                        description="5 pendaftar baru dari Kota Surabaya"
                        time="4 jam yang lalu"
                        bg="bg-blue-100 text-blue-600"
                    />
                    <ActivityItem
                        icon={<FiAlertCircle />}
                        title="Laporan Perlu Review"
                        description="Ada 3 laporan harian yang perlu ditinjau ulang"
                        time="5 jam yang lalu"
                        bg="bg-orange-100 text-orange-600"
                    />
                </div>
            </div>
        </div>
    );
}

// --- Admin KabKo Dashboard ---
function AdminKabKoDashboard({ kabko }: { kabko: string }) {
    const [stats, setStats] = useState({
        totalHafiz: 0,
        lulusSeleksi: 0,
        laporanPending: 0,
        insentifAktif: 0,
        loading: true
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Get Total Hafiz & Insentif Aktif
                const hafizRes = await fetch(`/api/hafiz?kabupaten_kota=${encodeURIComponent(kabko)}&limit=10000`);
                const hafizData = await hafizRes.json();
                const allHafiz = hafizData.data || [];

                const totalHafiz = hafizData.pagination?.total || allHafiz.length;
                const insentifAktif = allHafiz.filter((h: any) => h.mengajar === 1).length;

                // 2. Get Lulus Seleksi
                const lulusSeleksi = allHafiz.filter((h: any) => h.status_kelulusan === 'lulus').length;

                // 3. Get Laporan Pending
                const laporanRes = await fetch(`/api/laporan?status=pending&kabupaten_kota=${encodeURIComponent(kabko)}`);
                const laporanData = await laporanRes.json();
                const laporanPending = laporanData.pagination?.total || (laporanData.data || []).length;

                setStats({
                    totalHafiz,
                    lulusSeleksi,
                    laporanPending,
                    insentifAktif,
                    loading: false
                });

            } catch (err) {
                console.error('Error fetching kabko stats:', err);
                setStats(s => ({ ...s, loading: false }));
            }
        }

        fetchStats();
    }, [kabko]);

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
                        <div className="bg-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-indigo-700/50 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Total Hafiz</p>
                            <p className="text-4xl font-extrabold">
                                {stats.loading ? <span className="animate-pulse">...</span> : stats.totalHafiz}
                            </p>
                        </div>
                        <div className="bg-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-indigo-700/50 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Lulus Seleksi</p>
                            <p className="text-4xl font-extrabold text-emerald-400">
                                {stats.loading ? <span className="animate-pulse">...</span> : stats.lulusSeleksi}
                            </p>
                        </div>
                        <div className="bg-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-indigo-700/50 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Laporan Pending</p>
                            <p className="text-4xl font-extrabold text-amber-400">
                                {stats.loading ? <span className="animate-pulse">...</span> : stats.laporanPending}
                            </p>
                        </div>
                        <div className="bg-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-indigo-700/50 transition-colors">
                            <p className="text-primary-200 text-sm font-medium mb-2 uppercase tracking-wider">Insentif Aktif</p>
                            <p className="text-4xl font-extrabold">
                                {stats.loading ? <span className="animate-pulse">...</span> : stats.insentifAktif}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/hafiz" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg text-white">
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Data Hafiz</h3>
                            <p className="text-neutral-500 text-sm">Kelola data Huffadz wilayah</p>
                        </div>
                    </div>
                </Link>
                <Link href="/dashboard/laporan" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg text-white">
                            <FiFileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Verifikasi Laporan</h3>
                            <p className="text-neutral-500 text-sm">12 laporan menunggu</p>
                        </div>
                    </div>
                </Link>
                <Link href="/dashboard/kuota" className="card-modern group cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg text-white">
                            <FiPieChart size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Statistik</h3>
                            <p className="text-neutral-500 text-sm">Lihat statistik wilayah</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

// --- Hafiz Dashboard ---
function HafizDashboard() {
    const [stats, setStats] = useState({
        totalLaporan: 0,
        laporanPending: 0,
        laporanDisetujui: 0,
        totalAbsensi: 0,
        loading: true
    });
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Get user session first
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();
                if (!sessionData.user) return;
                setUser(sessionData.user);

                // Get Hafiz ID
                const hafizRes = await fetch(`/api/hafiz?limit=1`);
                const hafizData = await hafizRes.json();

                if (hafizData.data && hafizData.data.length > 0) {
                    const hafizId = hafizData.data[0].id;

                    // Fetch Laporan Stats
                    const laporanRes = await fetch(`/api/laporan?hafiz_id=${hafizId}`);
                    const laporanResult = await laporanRes.json();
                    const laporanList = laporanResult.data || [];

                    // Fetch Absensi Stats
                    const absensiRes = await fetch(`/api/absensi?hafiz_id=${hafizId}`);
                    const absensiResult = await absensiRes.json();
                    const absensiList = absensiResult.data || [];

                    setStats({
                        totalLaporan: laporanList.length,
                        laporanPending: laporanList.filter((l: any) => l.status_verifikasi === 'pending').length,
                        laporanDisetujui: laporanList.filter((l: any) => l.status_verifikasi === 'disetujui').length,
                        totalAbsensi: absensiList.filter((a: any) => a.status === 'hadir').length,
                        loading: false
                    });
                } else {
                    setStats(s => ({ ...s, loading: false }));
                }
            } catch (error) {
                console.error('Error fetching hafiz stats:', error);
                setStats(s => ({ ...s, loading: false }));
            }
        }
        fetchData();
    }, []);

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
                                Status: Aktif
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-none tracking-tight">
                                Ahlan Wa Sahlan, <br /> {user?.nama || 'Hafiz'}
                            </h2>
                            <p className="text-indigo-100 max-w-lg text-lg leading-relaxed opacity-90 font-light">
                                Teruslah menjaga hafalan dan memberikan manfaat untuk umat.
                            </p>
                        </div>
                        <div className="flex gap-8 text-center bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-2">Total Laporan</p>
                                <p className="text-5xl font-extrabold">
                                    {stats.loading ? '...' : stats.totalLaporan}
                                </p>
                            </div>
                            <div className="w-px bg-indigo-400/30 h-16 self-center"></div>
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-2">Kehadiran</p>
                                <p className="text-5xl font-extrabold">
                                    {stats.loading ? '...' : stats.totalAbsensi}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernStatCard
                    title="Laporan Disetujui"
                    value={stats.loading ? "..." : stats.laporanDisetujui.toString()}
                    icon={<FiCheckCircle className="text-white" />}
                    gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
                    subtext="Total laporan yang telah diverifikasi"
                />
                <ModernStatCard
                    title="Menunggu Verifikasi"
                    value={stats.loading ? "..." : stats.laporanPending.toString()}
                    icon={<FiClock className="text-white" />}
                    gradient="bg-gradient-to-br from-orange-400 to-orange-600"
                    subtext="Laporan perlu tinjauan admin"
                />
                <ModernStatCard
                    title="Total Kehadiran"
                    value={stats.loading ? "..." : stats.totalAbsensi.toString()}
                    icon={<FiActivity className="text-white" />}
                    gradient="bg-gradient-to-br from-blue-400 to-blue-600"
                    subtext="Jumlah kehadiran tercatat"
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
