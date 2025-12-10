'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase';
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
    FiActivity
} from 'react-icons/fi';

// Interfaces
interface DashboardStats {
    total: number;
    lulus: number;
    gender: { L: number; P: number };
    age: { '<20': number; '20-29': number; '30-39': number; '40+': number };
    loading: boolean;
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'hafiz';

    // Mock user data - akan diganti dengan data dari Supabase nanti untuk user session
    const userData = {
        admin_provinsi: {
            role: 'admin_provinsi',
            nama: 'Admin Provinsi LPTQ',
            email: 'admin.provinsi@lptq.jatimprov.go.id',
            kabupaten_kota: 'Provinsi Jawa Timur'
        },
        admin_kabko: {
            role: 'admin_kabko',
            nama: 'Admin Kota Surabaya',
            email: 'admin.surabaya@lptq.jatimprov.go.id',
            kabupaten_kota: 'Kota Surabaya'
        },
        hafiz: {
            role: 'hafiz',
            nama: 'Muhammad Ahmad',
            email: 'hafiz@example.com',
            kabupaten_kota: 'Kota Surabaya'
        }
    };

    const user = userData[role as keyof typeof userData] || userData.hafiz;

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userEmail={user.email}
            />

            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                {/* Modern Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Selamat datang kembali, <span className="font-semibold text-indigo-600">{user.nama}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                        <span className="text-sm font-medium text-slate-600">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Dashboard Content Based on Role */}
                {user.role === 'admin_provinsi' && <AdminProvinsiDashboard />}
                {user.role === 'admin_kabko' && <AdminKabKoDashboard kabko={user.kabupaten_kota} />}
                {user.role === 'hafiz' && <HafizDashboard />}

                {/* Recent Activity Section */}
                <div className="mt-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FiActivity className="text-indigo-500" />
                                Aktivitas Terbaru
                            </h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                Lihat Semua
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
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

// --- Admin Provinsi Dashboard with Real Stats ---
function AdminProvinsiDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        lulus: 0,
        gender: { L: 0, P: 0 },
        age: { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 },
        loading: true
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch basic columns for aggregation
                const { data, error } = await supabase
                    .from('hafiz')
                    .select('jenis_kelamin, tanggal_lahir, status_kelulusan');

                if (error) {
                    console.error('Error fetching stats:', error);
                    setStats(s => ({ ...s, loading: false }));
                    return;
                }

                if (!data) return;

                let total = data.length;
                let lulus = 0;
                let l = 0, p = 0;
                let ageGroups: any = { '<20': 0, '20-29': 0, '30-39': 0, '40+': 0 };
                const currentYear = new Date().getFullYear();

                data.forEach((row: any) => {
                    // Grad Status
                    if (row.status_kelulusan === 'lulus') lulus++;

                    // Gender - Normalize various inputs if dirty data
                    const val = String(row.jenis_kelamin || '').toUpperCase().trim();
                    if (val === 'L' || val === 'LAKI-LAKI') l++;
                    else if (val === 'P' || val === 'PEREMPUAN') p++;

                    // Age
                    if (row.tanggal_lahir) {
                        const birthYear = new Date(row.tanggal_lahir).getFullYear();
                        if (!isNaN(birthYear)) {
                            const age = currentYear - birthYear;
                            if (age < 20) ageGroups['<20']++;
                            else if (age < 30) ageGroups['20-29']++;
                            else if (age < 40) ageGroups['30-39']++;
                            else ageGroups['40+']++;
                        }
                    }
                });

                setStats({
                    total,
                    lulus,
                    gender: { L: l, P: p },
                    age: ageGroups,
                    loading: false
                });

            } catch (err) {
                console.error(err);
                setStats(s => ({ ...s, loading: false }));
            }
        }

        fetchStats();
    }, []);

    // Derived Percentages
    const genderPercent = stats.total > 0 ? {
        L: Math.round((stats.gender.L / stats.total) * 100) || 0,
        P: Math.round((stats.gender.P / stats.total) * 100) || 0
    } : { L: 0, P: 0 };

    // Fix rounding errors to ensure 100% if total > 0 (simplification)

    const lulusPercent = stats.total > 0 ? Math.round((stats.lulus / stats.total) * 100) : 0;

    if (stats.loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Total Huffadz"
                    value={stats.total.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="from-indigo-500 to-blue-600"
                    trend="+12%"
                />
                <ModernStatCard
                    title="Lulus Sertifikasi"
                    value={stats.lulus.toLocaleString()}
                    icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                    gradient="from-emerald-500 to-green-600"
                    trend={`${lulusPercent}% Rate`}
                />
                <ModernStatCard
                    title="Laki-laki"
                    value={stats.gender.L.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="from-blue-400 to-cyan-500"
                    subtext={`${genderPercent.L}% dari total`}
                />
                <ModernStatCard
                    title="Perempuan"
                    value={stats.gender.P.toLocaleString()}
                    icon={<FiUsers className="w-6 h-6 text-white" />}
                    gradient="from-pink-500 to-rose-500"
                    subtext={`${genderPercent.P}% dari total`}
                />
            </div>

            {/* Infographics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gender Distribution Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2 self-start">
                        <FiPieChart className="text-indigo-500" />
                        Distribusi Gender
                    </h3>

                    {stats.total === 0 ? (
                        <div className="text-slate-400 py-10">Belum ada data</div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            {/* CSS Donut Chart */}
                            <div className="relative w-56 h-56 rounded-full shadow-xl shadow-indigo-100"
                                style={{
                                    background: `conic-gradient(#3b82f6 0% ${genderPercent.L}%, #ec4899 ${genderPercent.L}% 100%)`
                                }}>
                                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                                    <span className="text-4xl font-extrabold text-slate-800">{stats.total}</span>
                                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 text-left w-full">
                                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-3 h-12 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold text-slate-800">Laki-laki</p>
                                            <p className="text-sm font-bold text-blue-500">{genderPercent.L}%</p>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{stats.gender.L} Orang</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-3 h-12 rounded-full bg-pink-500 shadow-sm shadow-pink-200"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold text-slate-800">Perempuan</p>
                                            <p className="text-sm font-bold text-pink-500">{genderPercent.P}%</p>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{stats.gender.P} Orang</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Age Distribution Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                        <FiBarChart2 className="text-indigo-500" />
                        Rentang Usia Huffadz
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(stats.age).map(([range, count]: [string, any]) => {
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={range}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-semibold text-slate-700">{range} Tahun</span>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-900">{count}</span>
                                            <span className="text-xs text-slate-500 ml-1">({Math.round(percent)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
                                        <div
                                            className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-200"
                                            style={{ width: `${percent}%` }}
                                        >
                                            {/* Shine effect */}
                                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {stats.total > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Mayoritas huffadz berada di rentang usia <span className="font-bold text-indigo-600">20-29 Tahun</span>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Admin KabKo Dashboard (Mocked for now, but using modern UI) ---
function AdminKabKoDashboard({ kabko }: { kabko: string }) {
    return (
        <div className="space-y-6">
            <div className="p-8 bg-gradient-to-r from-indigo-700 to-blue-800 rounded-3xl shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Wilayah</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{kabko}</h2>
                    <p className="text-indigo-100 opacity-90 text-lg">Laporan Statistik Wilayah Terkini</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Total Hafiz</p>
                            <p className="text-3xl font-bold">487</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Lulus</p>
                            <p className="text-3xl font-bold text-emerald-300">312</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Pending</p>
                            <p className="text-3xl font-bold text-amber-300">175</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Insentif Aktif</p>
                            <p className="text-3xl font-bold">290</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Hafiz Dashboard (Modern) ---
function HafizDashboard() {
    return (
        <div className="space-y-6">
            {/* Greeting Card */}
            <div className="relative overflow-hidden bg-[#2D31FA] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/30">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-900/10 backdrop-blur-sm">
                                STATUS: LULUS SELEKSI
                            </span>
                            <h2 className="text-4xl font-bold mb-3 leading-tight">Pencapaian <br />Luar Biasa!</h2>
                            <p className="text-indigo-100 max-w-lg text-lg leading-relaxed opacity-90">
                                Selamat! Anda menyelesaikan seleksi 2024 dengan hasil memuaskan.
                            </p>
                        </div>
                        <div className="flex gap-8 text-center bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">Nilai Tahfidz</p>
                                <p className="text-5xl font-extrabold mt-2">92.5</p>
                            </div>
                            <div className="w-px bg-indigo-400/30 h-16 self-center"></div>
                            <div>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">Wawasan</p>
                                <p className="text-5xl font-extrabold mt-2">88.0</p>
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
                    gradient="from-orange-400 to-orange-600"
                />
                <ModernStatCard
                    title="Insentif Diterima"
                    value="Rp 12.000.000"
                    icon={<FiAward className="text-white" />}
                    gradient="from-emerald-400 to-teal-500"
                />
                <ModernStatCard
                    title="Total Jam Mengajar"
                    value="124 Jam"
                    icon={<FiClock className="text-white" />}
                    gradient="from-purple-400 to-purple-600"
                />
            </div>
        </div>
    );
}

// --- Components ---

function ModernStatCard({ title, value, icon, gradient, trend, subtext }: any) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-500/10`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1 tracking-wide">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
                {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
            </div>
        </div>
    );
}

function ActivityItem({ icon, title, description, time, bg }: any) {
    return (
        <div className="p-5 hover:bg-slate-50 transition-colors flex gap-5 items-start group">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">{description}</p>
                <p className="text-xs text-indigo-500 font-medium mt-2">{time}</p>
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
