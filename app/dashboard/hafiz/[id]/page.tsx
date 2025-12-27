'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { FiUser, FiArrowLeft, FiEdit, FiTrash2, FiLoader, FiMapPin, FiPhone, FiMail, FiBook, FiCalendar, FiCheckCircle, FiXCircle, FiShuffle, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { PageLoader } from '@/components/LoadingSpinner';
import MutasiModal from '@/components/MutasiModal';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DetailHafizContent() {
    const params = useParams();
    const router = useRouter();
    const hafizId = params.id as string;

    const [hafizData, setHafizData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showMutasiModal, setShowMutasiModal] = useState(false);
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
                setHafizData(result.data);
            } catch (err: any) {
                console.error('Error fetching hafiz:', err);
                setError(err.message || 'Gagal memuat data hafiz');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [hafizId]);

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus data hafiz ini? Data yang dihapus tidak dapat dikembalikan.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`/api/hafiz/${hafizId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Gagal menghapus data');
            }

            alert('Data hafiz berhasil dihapus');
            router.push('/dashboard/hafiz');
        } catch (err: any) {
            console.error('Error deleting hafiz:', err);
            alert('Gagal menghapus data: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

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

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

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

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white shadow-lg">
                                    <FiUser size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-neutral-800">
                                        {hafizData.nama}
                                    </h1>
                                    <p className="text-neutral-600 mt-1">
                                        NIK: {hafizData.nik}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => router.push(`/dashboard/hafiz/${hafizId}/edit`)}
                                    className="btn btn-primary"
                                >
                                    <FiEdit />
                                    Edit
                                </button>
                                {currentUser && (currentUser.role === 'admin_provinsi' || currentUser.role === 'admin_kabko') && (
                                    <button
                                        onClick={() => setShowMutasiModal(true)}
                                        className="btn btn-warning"
                                        title="Pindahkan ke Kabupaten/Kota lain"
                                    >
                                        <FiShuffle />
                                        Mutasi
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-error"
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 />
                                            Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <span className={`badge ${hafizData.status_kelulusan === 'lulus' ? 'badge-success' : 'badge-error'}`}>
                            {hafizData.status_kelulusan === 'lulus' ? (
                                <>
                                    <FiCheckCircle />
                                    Lulus
                                </>
                            ) : (
                                <>
                                    <FiXCircle />
                                    Tidak Lulus
                                </>
                            )}
                        </span>
                        <span className={`badge ${hafizData.status_insentif === 'aktif' ? 'badge-success' : 'badge-warning'}`}>
                            Insentif: {hafizData.status_insentif === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                        <span className="badge badge-info">
                            Tahun Tes: {hafizData.tahun_tes}
                        </span>
                    </div>

                    {/* Data Pribadi */}
                    <div className="card-modern mb-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                            Data Pribadi
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Tempat Lahir" value={hafizData.tempat_lahir} />
                            <DetailItem
                                label="Tanggal Lahir"
                                value={`${new Date(hafizData.tanggal_lahir).toLocaleDateString('id-ID')} (${calculateAge(hafizData.tanggal_lahir)} tahun)`}
                            />
                            <DetailItem
                                label="Jenis Kelamin"
                                value={hafizData.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            />
                            <DetailItem label="Tahun Tes" value={hafizData.tahun_tes} />
                        </div>
                    </div>

                    {/* Alamat */}
                    <div className="card-modern mb-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                            <FiMapPin />
                            Alamat
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Alamat Lengkap" value={hafizData.alamat} className="md:col-span-2" />
                            <DetailItem label="RT" value={hafizData.rt || '-'} />
                            <DetailItem label="RW" value={hafizData.rw || '-'} />
                            <DetailItem label="Desa/Kelurahan" value={hafizData.desa_kelurahan} />
                            <DetailItem label="Kecamatan" value={hafizData.kecamatan} />
                            <DetailItem label="Kabupaten/Kota" value={hafizData.kabupaten_kota} className="md:col-span-2" />
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="card-modern mb-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                            Kontak
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem
                                label="Telepon"
                                value={hafizData.telepon || '-'}
                                icon={<FiPhone />}
                            />
                            <DetailItem
                                label="Email"
                                value={hafizData.email || '-'}
                                icon={<FiMail />}
                            />
                            <DetailItem
                                label="Nama Bank"
                                value={hafizData.nama_bank || '-'}
                            />
                            <DetailItem
                                label="Nomor Rekening"
                                value={hafizData.nomor_rekening || '-'}
                            />
                        </div>
                    </div>

                    {/* Data Tahfidz */}
                    <div className="card-modern mb-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                            <FiBook />
                            Data Tahfidz & Mengajar
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem
                                label="Sertifikat Tahfidz"
                                value={hafizData.sertifikat_tahfidz || '-'}
                            />
                            <DetailItem
                                label="Status Mengajar"
                                value={hafizData.mengajar ? 'Ya' : 'Tidak'}
                            />
                            {hafizData.mengajar && (
                                <>
                                    <DetailItem
                                        label="Tempat Mengajar (Saat Ini)"
                                        value={hafizData.tempat_mengajar || '-'}
                                    />
                                    <DetailItem
                                        label="TMT Mengajar"
                                        value={hafizData.tmt_mengajar ? new Date(hafizData.tmt_mengajar).toLocaleDateString('id-ID') : '-'}
                                        icon={<FiCalendar />}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Keterangan */}
                    {hafizData.keterangan && (
                        <div className="card-modern">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                                Keterangan
                            </h3>
                            <p className="text-neutral-700 whitespace-pre-wrap">{hafizData.keterangan}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="card-modern mt-6 bg-neutral-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
                            <div>
                                <span className="font-semibold">Dibuat:</span>{' '}
                                {hafizData.created_at ? new Date(hafizData.created_at).toLocaleString('id-ID') : '-'}
                            </div>
                            <div>
                                <span className="font-semibold">Terakhir Diupdate:</span>{' '}
                                {hafizData.updated_at ? new Date(hafizData.updated_at).toLocaleString('id-ID') : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mutasi Modal */}
            {showMutasiModal && currentUser && (
                <MutasiModal
                    isOpen={showMutasiModal}
                    onClose={() => setShowMutasiModal(false)}
                    hafiz={{
                        id: hafizData.id,
                        nik: hafizData.nik,
                        nama: hafizData.nama,
                        kabupaten_kota: hafizData.kabupaten_kota
                    }}
                    currentUserId={String(currentUser.id)}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

function DetailItem({ label, value, icon, className = '' }: { label: string; value: any; icon?: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                {label}
            </label>
            <div className="flex items-center gap-2 text-neutral-800 font-medium">
                {icon && <span className="text-primary-600">{icon}</span>}
                <span>{value}</span>
            </div>
        </div>
    );
}

export default function DetailHafizPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DetailHafizContent />
        </Suspense>
    );
}
