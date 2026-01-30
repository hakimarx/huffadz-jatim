'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiArrowLeft,
    FiCalendar,
    FiUsers,
    FiPieChart,
    FiSettings,
    FiList,
    FiEdit
} from 'react-icons/fi';

interface PeriodeTes {
    id: number;
    tahun: number;
    nama_periode: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    kuota_total: number;
    status: string;
    deskripsi?: string;
    created_at?: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DetailPeriodeContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [periode, setPeriode] = useState<PeriodeTes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

                // Fetch periode detail
                if (id) {
                    const response = await fetch(`/api/periode/${id}`);
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Gagal memuat data periode');
                    }

                    setPeriode(result.data);
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    if (loading) return <PageLoader />;

    if (!user) return null;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => router.back()} className="btn btn-primary">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    if (!periode) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" /> Kembali ke Daftar Periode
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-neutral-800">{periode.nama_periode}</h1>
                                <span className={`badge ${periode.status === 'selesai' ? 'badge-success' :
                                        periode.status === 'tes' ? 'badge-info' :
                                            periode.status === 'pendaftaran' ? 'badge-warning' : 'badge-neutral'
                                    }`}>
                                    {periode.status}
                                </span>
                            </div>
                            <p className="text-neutral-600">
                                Tahun {periode.tahun} • {new Date(periode.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(periode.tanggal_selesai).toLocaleDateString('id-ID')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/dashboard/periode-tes/${id}/kuota`)}
                                className="btn btn-secondary"
                            >
                                <FiPieChart className="mr-2" /> Atur Kuota
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/periode-tes/${id}/pendaftaran`)}
                                className="btn btn-primary"
                            >
                                <FiList className="mr-2" /> Data Pendaftar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <FiUsers size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Total Kuota</p>
                                <p className="text-2xl font-bold text-neutral-800">{periode.kuota_total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <FiList size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Pendaftar Masuk</p>
                                <p className="text-2xl font-bold text-neutral-800">0</p>
                                {/* TODO: Fetch real count */}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <FiCalendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Sisa Hari</p>
                                <p className="text-2xl font-bold text-neutral-800">
                                    {Math.max(0, Math.ceil((new Date(periode.tanggal_selesai).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="card">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Detail Periode</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-neutral-500 block mb-1">Deskripsi</label>
                            <p className="text-neutral-800">{periode.deskripsi || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500 block mb-1">Dibuat Pada</label>
                            <p className="text-neutral-800">
                                {periode.created_at ? new Date(periode.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : '-'}
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default function DetailPeriodePage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DetailPeriodeContent />
        </Suspense>
    );
}
