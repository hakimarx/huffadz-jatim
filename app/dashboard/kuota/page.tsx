'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiUsers,
    FiTrendingUp,
    FiPieChart,
    FiBarChart2,
    FiDownload
} from 'react-icons/fi';

// Mock data kuota per kabupaten
const mockKuota = [
    { kabupaten: 'Kota Surabaya', pendaftar: 1250, kuota: 150, lulus: 142, persen: 94.7 },
    { kabupaten: 'Kabupaten Sidoarjo', pendaftar: 890, kuota: 100, lulus: 95, persen: 95.0 },
    { kabupaten: 'Kabupaten Gresik', pendaftar: 750, kuota: 85, lulus: 80, persen: 94.1 },
    { kabupaten: 'Kota Malang', pendaftar: 680, kuota: 75, lulus: 70, persen: 93.3 },
    { kabupaten: 'Kabupaten Jember', pendaftar: 620, kuota: 70, lulus: 65, persen: 92.9 },
];

function KuotaStatistikContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin_provinsi';
    const [selectedYear, setSelectedYear] = useState(2024);

    const userData = {
        role: role,
        nama: role === 'admin_provinsi' ? 'Admin Provinsi' : 'Admin Kab/Ko',
        email: `${role}@example.com`,
        kabupaten_kota: role === 'admin_kabko' ? 'Kota Surabaya' : ''
    };

    const exportData = () => {
        // TODO: Export to Excel
        alert('Export data kuota ke Excel');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={userData.role}
                userName={userData.nama}
                userEmail={userData.email}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                            Kuota & Statistik
                        </h1>
                        <p className="text-neutral-600">
                            Statistik pendaftar dan kuota per kabupaten/kota
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 lg:mt-0">
                        <select
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            <option value={2024}>Tahun 2024</option>
                            <option value={2023}>Tahun 2023</option>
                            <option value={2022}>Tahun 2022</option>
                            <option value={2021}>Tahun 2021</option>
                        </select>
                        <button onClick={exportData} className="btn btn-secondary">
                            <FiDownload />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Pendaftar"
                        value="4,190"
                        icon={<FiUsers />}
                        color="primary"
                        trend={{ value: 15, isPositive: true }}
                    />
                    <StatsCard
                        title="Total Kuota"
                        value="1,000"
                        icon={<FiPieChart />}
                        color="accent"
                    />
                    <StatsCard
                        title="Total Lulus"
                        value="952"
                        icon={<FiTrendingUp />}
                        color="success"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatsCard
                        title="Tingkat Kelulusan"
                        value="95.2%"
                        icon={<FiBarChart2 />}
                        color="info"
                    />
                </div>

                {/* Statistik per Kabupaten */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">Statistik per Kabupaten/Kota</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Kabupaten/Kota</th>
                                    <th>Pendaftar</th>
                                    <th>Kuota</th>
                                    <th>Lulus</th>
                                    <th>% Kelulusan</th>
                                    <th>Visualisasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockKuota.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="font-semibold">{item.kabupaten}</td>
                                        <td>{item.pendaftar.toLocaleString()}</td>
                                        <td>{item.kuota}</td>
                                        <td>{item.lulus}</td>
                                        <td>
                                            <span className="badge badge-success">
                                                {item.persen}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="w-full bg-neutral-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                                    style={{ width: `${item.persen}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pie Chart Placeholder */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Distribusi Pendaftar</h3>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                            <div className="text-center text-neutral-500">
                                <FiPieChart size={48} className="mx-auto mb-2" />
                                <p>Pie Chart - Distribusi per Kab/Ko</p>
                                <p className="text-sm">(Akan diimplementasikan dengan Chart.js)</p>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart Placeholder */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Tren Pendaftar per Tahun</h3>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                            <div className="text-center text-neutral-500">
                                <FiBarChart2 size={48} className="mx-auto mb-2" />
                                <p>Bar Chart - Tren 2015-2024</p>
                                <p className="text-sm">(Akan diimplementasikan dengan Chart.js)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
                        <h4 className="font-bold text-primary-800 mb-2">Kab/Ko Tertinggi</h4>
                        <p className="text-2xl font-bold text-primary-900">Kota Surabaya</p>
                        <p className="text-sm text-primary-700">1,250 pendaftar</p>
                    </div>
                    <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200">
                        <h4 className="font-bold text-accent-800 mb-2">Tingkat Kelulusan Tertinggi</h4>
                        <p className="text-2xl font-bold text-accent-900">Kabupaten Sidoarjo</p>
                        <p className="text-sm text-accent-700">95.0% lulus</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                        <h4 className="font-bold text-green-800 mb-2">Total Penerima Insentif</h4>
                        <p className="text-2xl font-bold text-green-900">7,234 Huffadz</p>
                        <p className="text-sm text-green-700">Aktif menerima insentif</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function KuotaStatistikPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <KuotaStatistikContent />
        </Suspense>
    );
}
