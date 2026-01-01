'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiArrowLeft, FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi';

interface Pendaftaran {
    id: number;
    hafiz_id: number;
    nik: string;
    nama: string;
    kabupaten_kota: string;
    tanggal_daftar: string;
    status: 'pending' | 'diterima' | 'ditolak';
    keterangan?: string;
}

interface PeriodeTes {
    id: number;
    nama_periode: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function PendaftaranContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [periode, setPeriode] = useState<PeriodeTes | null>(null);
    const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');

    const fetchData = async () => {
        try {
            // Fetch user
            const sessionResponse = await fetch('/api/auth/session');
            const sessionData = await sessionResponse.json();

            if (!sessionResponse.ok || !sessionData.user) {
                window.location.href = '/login';
                return;
            }

            setUser(sessionData.user as UserData);

            if (id) {
                // Fetch periode detail
                const periodeResponse = await fetch(`/api/periode/${id}`);
                const periodeResult = await periodeResponse.json();
                if (periodeResult.data) {
                    setPeriode(periodeResult.data);
                }

                // Fetch pendaftaran list
                const pendaftaranResponse = await fetch(`/api/periode/${id}/pendaftaran`);
                const pendaftaranResult = await pendaftaranResponse.json();
                if (pendaftaranResult.data) {
                    setPendaftaranList(pendaftaranResult.data);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdateStatus = async (pendaftaranId: number, newStatus: 'diterima' | 'ditolak') => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

        try {
            const response = await fetch(`/api/periode/${id}/pendaftaran/${pendaftaranId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Gagal mengupdate status');
            }

            // Refresh data
            fetchData();
            alert(`✅ Status berhasil diubah menjadi ${newStatus}`);
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        }
    };

    const filteredList = pendaftaranList.filter(item => {
        const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nik.includes(searchQuery);
        const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" /> Kembali
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Data Pendaftar</h1>
                        <p className="text-neutral-600">
                            {periode?.nama_periode}
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="card mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                className="form-input pl-10"
                                placeholder="Cari Nama atau NIK..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="semua">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="diterima">Diterima</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            Tidak ada data pendaftar yang sesuai.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">NIK</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Kabupaten/Kota</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Tanggal Daftar</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {filteredList.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-neutral-50">
                                            <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-neutral-800">{item.nik}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-neutral-800">{item.nama}</td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">{item.kabupaten_kota}</td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">
                                                {new Date(item.tanggal_daftar).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`badge ${item.status === 'diterima' ? 'badge-success' :
                                                        item.status === 'ditolak' ? 'badge-danger' : 'badge-warning'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/hafiz/${item.hafiz_id || item.nik}`)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Lihat Profil"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'diterima')}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                title="Terima"
                                                            >
                                                                <FiCheck size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                title="Tolak"
                                                            >
                                                                <FiX size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function PendaftaranPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <PendaftaranContent />
        </Suspense>
    );
}
