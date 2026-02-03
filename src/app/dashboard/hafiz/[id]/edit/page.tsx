'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import HafizForm from '../../components/HafizForm';
import { FiEdit, FiArrowLeft, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { PageLoader } from '@/components/LoadingSpinner';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function EditHafizContent() {
    const params = useParams();
    const router = useRouter();
    const hafizId = params.id as string;

    const [hafizData, setHafizData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch current user via MySQL session API
                const userResponse = await fetch('/api/auth/me');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setCurrentUser(userData.user);
                }

                // Fetch hafiz data via MySQL API
                const response = await fetch(`/api/hafiz/${hafizId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Data hafiz tidak ditemukan');
                        return;
                    }
                    throw new Error('Gagal memuat data hafiz');
                }

                const result = await response.json();
                const data = result.data;

                // Format dates for input type="date"
                // Format dates for input type="date"
                if (data.tanggal_lahir) {
                    try {
                        data.tanggal_lahir = new Date(data.tanggal_lahir).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn('Invalid tanggal_lahir:', data.tanggal_lahir);
                        data.tanggal_lahir = '';
                    }
                }
                if (data.tmt_mengajar) {
                    try {
                        data.tmt_mengajar = new Date(data.tmt_mengajar).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn('Invalid tmt_mengajar:', data.tmt_mengajar);
                        data.tmt_mengajar = '';
                    }
                }

                setHafizData(data);
            } catch (err: any) {
                console.error('Error fetching hafiz:', err);
                setError(err.message || 'Gagal memuat data hafiz');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [hafizId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
                    <p className="text-neutral-600">Memuat data hafiz...</p>
                </div>
            </div>
        );
    }

    if (error || !hafizData) {
        return (
            <div className="min-h-screen bg-neutral-50 flex">
                <Sidebar userRole={currentUser?.role || 'admin_kabko'} userName={currentUser?.nama || 'Admin'} />
                <main className="flex-1 p-6 lg:ml-64">
                    <div className="max-w-5xl">
                        <div className="alert alert-error">
                            <p>{error || 'Data tidak ditemukan'}</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/hafiz')}
                            className="btn btn-secondary mt-4"
                        >
                            <FiArrowLeft />
                            Kembali ke Data Hafiz
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            <Sidebar userRole={currentUser?.role || 'admin_kabko'} userName={currentUser?.nama || 'Admin'} userPhoto={currentUser?.foto_profil} />

            <main className="flex-1 p-6 lg:ml-64">
                <div className="max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/dashboard/hafiz"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
                        >
                            <FiArrowLeft />
                            <span>Kembali ke Data Hafiz</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
                                <FiEdit size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-800">
                                    Edit Data Hafiz
                                </h1>
                                <p className="text-neutral-600 mt-1">
                                    {hafizData.nama} - NIK: {hafizData.nik}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="alert alert-info mb-8">
                        <div>
                            <p className="font-semibold">Petunjuk Edit:</p>
                            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                                <li>NIK tidak dapat diubah untuk menjaga integritas data</li>
                                <li>Pastikan perubahan data sudah benar sebelum menyimpan</li>
                                <li>Semua perubahan akan tercatat dalam history</li>
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <HafizForm
                        mode="edit"
                        hafizId={hafizId}
                        initialData={hafizData}
                    />
                </div>
            </main>
        </div>
    );
}

export default function EditHafizPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <EditHafizContent />
        </Suspense>
    );
}
