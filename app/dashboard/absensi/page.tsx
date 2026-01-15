'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiCheckCircle, FiXCircle, FiClock, FiSearch } from 'react-icons/fi';

interface AbsensiData {
    id: number;
    hafiz_id: number;
    tanggal: string;
    waktu: string;
    status: 'hadir' | 'tidak_hadir' | 'izin';
    keterangan: string;
    nama: string;
    nik: string;
    kabupaten_kota: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    telepon?: string;
    foto_profil?: string;
}

function AbsensiContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [absensiList, setAbsensiList] = useState<AbsensiData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch user
                const userRes = await fetch('/api/auth/me');
                if (!userRes.ok) {
                    window.location.href = '/login';
                    return;
                }
                const userData = await userRes.json();
                setUser(userData.user);

                // Fetch absensi data
                const absensiRes = await fetch('/api/absensi');
                if (absensiRes.ok) {
                    const absensiData = await absensiRes.json();
                    setAbsensiList(absensiData.data);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredList = absensiList.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nik.includes(searchTerm) ||
        item.kabupaten_kota.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        hadir: absensiList.filter(x => x.status === 'hadir').length,
        tidak_hadir: absensiList.filter(x => x.status === 'tidak_hadir').length,
        total: absensiList.length
    };

    if (loading) return <PageLoader />;

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto lg:ml-64">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">Data Absensi</h1>
                    <p className="text-neutral-600">Monitoring kehadiran peserta</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-green-700 mb-1">Hadir</h4>
                        <p className="text-3xl font-bold text-green-900">{stats.hadir}</p>
                    </div>
                    <div className="card bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Tidak Hadir</h4>
                        <p className="text-3xl font-bold text-red-900">{stats.tidak_hadir}</p>
                    </div>
                    <div className="card bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-blue-700 mb-1">Total Entri</h4>
                        <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="p-4 border-b border-neutral-100 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, NIK, atau kota..."
                                className="input input-bordered w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-neutral-50 text-neutral-600">
                                <tr>
                                    <th className="px-6 py-4 text-left">Waktu</th>
                                    <th className="px-6 py-4 text-left">Hafiz</th>
                                    <th className="px-6 py-4 text-left">Kabupaten/Kota</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                            Belum ada data absensi
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-neutral-900">
                                                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">{item.waktu}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-neutral-800">{item.nama}</div>
                                                <div className="text-xs font-mono text-neutral-500">{item.nik}</div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{item.kabupaten_kota}</td>
                                            <td className="px-6 py-4">
                                                {item.status === 'hadir' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <FiCheckCircle /> Hadir
                                                    </span>
                                                )}
                                                {item.status === 'tidak_hadir' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <FiXCircle /> Tidak Hadir
                                                    </span>
                                                )}
                                                {item.status === 'izin' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                        <FiClock /> Izin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 text-sm">
                                                {item.keterangan || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
