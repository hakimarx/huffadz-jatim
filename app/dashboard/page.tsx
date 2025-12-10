'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiUsers,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiFileText,
    FiCalendar,
    FiAward
} from 'react-icons/fi';

function DashboardContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'hafiz';

    // Mock user data - akan diganti dengan data dari Supabase
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
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userEmail={user.email}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-neutral-600">
                        Selamat datang, <span className="font-semibold">{user.nama}</span>
                    </p>
                </div>

                {/* Stats Grid - Different for each role */}
                {user.role === 'admin_provinsi' && <AdminProvinsiDashboard />}
                {user.role === 'admin_kabko' && <AdminKabKoDashboard kabko={user.kabupaten_kota} />}
                {user.role === 'hafiz' && <HafizDashboard />}

                {/* Recent Activity */}
                <div className="mt-8">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Aktivitas Terbaru</h2>
                        </div>
                        <div className="space-y-4">
                            <ActivityItem
                                icon={<FiCheckCircle className="text-green-600" />}
                                title="Laporan harian disetujui"
                                description="Laporan kegiatan mengajar tanggal 10 Desember 2025"
                                time="2 jam yang lalu"
                            />
                            <ActivityItem
                                icon={<FiFileText className="text-blue-600" />}
                                title="Laporan baru ditambahkan"
                                description="Kegiatan muroja'ah di Masjid Al-Akbar"
                                time="5 jam yang lalu"
                            />
                            <ActivityItem
                                icon={<FiCalendar className="text-purple-600" />}
                                title="Jadwal tes diperbarui"
                                description="Tes periode 2026 akan dimulai Juni 2026"
                                time="1 hari yang lalu"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AdminProvinsiDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Huffadz"
                value="14,349"
                icon={<FiUsers />}
                color="primary"
                trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
                title="Huffadz Lulus"
                value="7,234"
                icon={<FiCheckCircle />}
                color="success"
                trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
                title="Penerima Insentif"
                value="7,000"
                icon={<FiAward />}
                color="accent"
            />
            <StatsCard
                title="Laporan Pending"
                value="156"
                icon={<FiClock />}
                color="warning"
            />
        </div>
    );
}

function AdminKabKoDashboard({ kabko }: { kabko: string }) {
    return (
        <>
            <div className="mb-6 p-4 bg-primary-50 border-l-4 border-primary-600 rounded-lg">
                <p className="text-sm font-semibold text-primary-800">
                    📍 Wilayah: {kabko}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Huffadz"
                    value="487"
                    icon={<FiUsers />}
                    color="primary"
                />
                <StatsCard
                    title="Huffadz Lulus"
                    value="312"
                    icon={<FiCheckCircle />}
                    color="success"
                />
                <StatsCard
                    title="Laporan Bulan Ini"
                    value="1,245"
                    icon={<FiFileText />}
                    color="info"
                />
                <StatsCard
                    title="Perlu Verifikasi"
                    value="23"
                    icon={<FiClock />}
                    color="warning"
                />
            </div>
        </>
    );
}

function HafizDashboard() {
    return (
        <>
            <div className="mb-6 p-6 card-glass">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                            Status Kelulusan
                        </h3>
                        <p className="text-3xl font-bold gradient-text mb-2">LULUS</p>
                        <p className="text-sm text-neutral-600">Periode Tes 2024</p>
                    </div>
                    <div className="badge badge-success text-lg px-4 py-2">
                        ✓ Aktif
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">Nilai Tahfidz</p>
                        <p className="text-xl font-bold text-neutral-800">92.5</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 mb-1">Nilai Wawasan</p>
                        <p className="text-xl font-bold text-neutral-800">88.0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Laporan Bulan Ini"
                    value="18"
                    icon={<FiFileText />}
                    color="primary"
                />
                <StatsCard
                    title="Laporan Disetujui"
                    value="16"
                    icon={<FiCheckCircle />}
                    color="success"
                />
                <StatsCard
                    title="Total Jam Mengajar"
                    value="124"
                    icon={<FiTrendingUp />}
                    color="accent"
                />
            </div>
        </>
    );
}

interface ActivityItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    time: string;
}

function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
    return (
        <div className="flex gap-4 p-4 rounded-lg hover:bg-neutral-50 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-800 mb-1">{title}</h4>
                <p className="text-sm text-neutral-600 mb-1">{description}</p>
                <p className="text-xs text-neutral-500">{time}</p>
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
