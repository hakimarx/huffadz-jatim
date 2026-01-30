'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiArrowLeft, FiSave, FiSearch } from 'react-icons/fi';

interface KuotaWilayah {
    id?: number; // ID from kuota table if exists
    kabupaten_kota: string;
    kuota: number;
    terpakai: number;
}

interface PeriodeTes {
    id: number;
    nama_periode: string;
    kuota_total: number;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function ManageKuotaContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [periode, setPeriode] = useState<PeriodeTes | null>(null);
    const [kuotaList, setKuotaList] = useState<KuotaWilayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
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

                    // Fetch kuota list
                    const kuotaResponse = await fetch(`/api/periode/${id}/kuota`);
                    const kuotaResult = await kuotaResponse.json();
                    if (kuotaResult.data) {
                        setKuotaList(kuotaResult.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    const handleKuotaChange = (index: number, value: string) => {
        const newList = [...kuotaList];
        newList[index].kuota = parseInt(value) || 0;
        setKuotaList(newList);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/periode/${id}/kuota`, {
                method: 'POST', // Use POST/PUT to update batch
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kuota: kuotaList })
            });

            if (!response.ok) {
                throw new Error('Gagal menyimpan kuota');
            }

            alert('✅ Kuota berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Calculate totals
    const totalAllocated = kuotaList.reduce((sum, item) => sum + item.kuota, 0);
    const totalUsed = kuotaList.reduce((sum, item) => sum + item.terpakai, 0);

    const filteredList = kuotaList.filter(item =>
        item.kabupaten_kota.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Manajemen Kuota</h1>
                            <p className="text-neutral-600">
                                {periode?.nama_periode}
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            <FiSave className="mr-2" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-blue-50 border-blue-100">
                        <p className="text-sm text-blue-600 font-semibold">Total Kuota Periode</p>
                        <p className="text-2xl font-bold text-blue-800">{periode?.kuota_total.toLocaleString()}</p>
                    </div>
                    <div className={`card ${totalAllocated > (periode?.kuota_total || 0) ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-sm font-semibold ${totalAllocated > (periode?.kuota_total || 0) ? 'text-red-600' : 'text-green-600'}`}>
                            Total Dialokasikan
                        </p>
                        <p className={`text-2xl font-bold ${totalAllocated > (periode?.kuota_total || 0) ? 'text-red-800' : 'text-green-800'}`}>
                            {totalAllocated.toLocaleString()}
                        </p>
                        {totalAllocated > (periode?.kuota_total || 0) && (
                            <p className="text-xs text-red-600 mt-1">Melebihi total kuota!</p>
                        )}
                    </div>
                    <div className="card bg-neutral-50 border-neutral-200">
                        <p className="text-sm text-neutral-600 font-semibold">Total Terpakai</p>
                        <p className="text-2xl font-bold text-neutral-800">{totalUsed.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="card mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Cari Kabupaten/Kota..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Kabupaten/Kota</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase w-32">Kuota</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Terpakai</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Sisa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Persentase</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredList.map((item, index) => (
                                    <tr key={item.kabupaten_kota} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-800">{item.kabupaten_kota}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="form-input py-1 px-2 text-sm"
                                                value={item.kuota}
                                                onChange={(e) => {
                                                    // Find index in original list
                                                    const originalIndex = kuotaList.findIndex(k => k.kabupaten_kota === item.kabupaten_kota);
                                                    if (originalIndex !== -1) {
                                                        handleKuotaChange(originalIndex, e.target.value);
                                                    }
                                                }}
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">{item.terpakai}</td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">{item.kuota - item.terpakai}</td>
                                        <td className="px-4 py-3">
                                            <div className="w-full bg-neutral-200 rounded-full h-2 max-w-[100px]">
                                                <div
                                                    className={`h-2 rounded-full ${(item.terpakai / item.kuota) > 0.9 ? 'bg-red-500' :
                                                            (item.terpakai / item.kuota) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (item.terpakai / (item.kuota || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ManageKuotaPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ManageKuotaContent />
        </Suspense>
    );
}
