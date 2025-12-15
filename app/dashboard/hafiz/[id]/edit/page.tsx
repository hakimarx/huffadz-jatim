'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HafizForm from '../../components/HafizForm';
import { FiEdit, FiArrowLeft, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { PageLoader } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';

function EditHafizContent() {
    const params = useParams();
    const router = useRouter();
    const hafizId = params.id as string;

    const [hafizData, setHafizData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchHafiz() {
            try {
                const supabase = createClient();

                // First try to get by id
                let { data, error } = await supabase
                    .from('hafiz')
                    .select('*')
                    .eq('id', hafizId)
                    .maybeSingle();

                // If not found by id, try by nik (hafizId might be NIK)
                if (!data && !error) {
                    const nikResult = await supabase
                        .from('hafiz')
                        .select('*')
                        .eq('nik', hafizId)
                        .maybeSingle();
                    data = nikResult.data;
                    error = nikResult.error;
                }

                if (error) throw error;

                if (!data) {
                    setError('Data hafiz tidak ditemukan');
                    return;
                }

                setHafizData(data);
            } catch (err: any) {
                console.error('Error fetching hafiz:', err);
                setError(err.message || 'Gagal memuat data hafiz');
            } finally {
                setLoading(false);
            }
        }

        fetchHafiz();
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
            <div className="min-h-screen bg-neutral-50">
                <Navbar userRole="admin_provinsi" userName="Admin" />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar userRole="admin_provinsi" userName="Admin" />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
