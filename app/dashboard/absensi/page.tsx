'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const mockAbsensi = [
    { id: '1', nama: 'Muhammad Ahmad', nik: '3578012345670001', hadir: true, waktu: '08:15', kabupaten: 'Kota Surabaya' },
    { id: '2', nama: 'Fatimah Zahra', nik: '3578012345670002', hadir: true, waktu: '08:20', kabupaten: 'Kota Surabaya' },
    { id: '3', nama: 'Abdullah Hasan', nik: '3578012345670003', hadir: false, waktu: null, kabupaten: 'Kota Surabaya' },
];

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function AbsensiContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API instead of Supabase
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    window.location.href = '/login';
                    return;
                }
                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                console.error('Error fetching user:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    if (loading) return <PageLoader />;

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
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">Absensi Tes</h1>
                    <p className="text-neutral-600">Kelola absensi peserta tes seleksi</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="card bg-green-50 border-2 border-green-200">
                        <h4 className="text-sm font-semibold text-green-700 mb-1">Hadir</h4>
                        <p className="text-3xl font-bold text-green-900">2</p>
                    </div>
                    <div className="card bg-red-50 border-2 border-red-200">
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Tidak Hadir</h4>
                        <p className="text-3xl font-bold text-red-900">1</p>
                    </div>
                    <div className="card bg-blue-50 border-2 border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-700 mb-1">Total Peserta</h4>
                        <p className="text-3xl font-bold text-blue-900">3</p>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Kabupaten</th>
                                <th>Status</th>
                                <th>Waktu Absen</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockAbsensi.map((item) => (
                                <tr key={item.id}>
                                    <td className="font-mono text-sm">{item.nik}</td>
                                    <td className="font-semibold">{item.nama}</td>
                                    <td>{item.kabupaten}</td>
                                    <td>
                                        {item.hadir ? (
                                            <span className="badge badge-success"><FiCheckCircle /> Hadir</span>
                                        ) : (
                                            <span className="badge badge-error"><FiXCircle /> Tidak Hadir</span>
                                        )}
                                    </td>
                                    <td>{item.waktu || '-'}</td>
                                    <td>
                                        <button className="btn btn-secondary text-sm">
                                            {item.hadir ? 'Batalkan' : 'Tandai Hadir'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default function AbsensiPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <AbsensiContent />
        </Suspense>
    );
}
