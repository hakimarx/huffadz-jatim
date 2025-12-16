'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import {
    FiPlus,
    FiFilter,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiEye,
    FiEdit,
    FiTrash2
} from 'react-icons/fi';

// Mock data
const mockLaporan = [
    {
        id: '1',
        tanggal: '2025-12-10',
        jenis_kegiatan: 'mengajar',
        deskripsi: 'Mengajar tahfidz Juz 30 untuk anak-anak di TPQ Al-Ikhlas',
        lokasi: 'TPQ Al-Ikhlas, Surabaya',
        durasi_menit: 120,
        status_verifikasi: 'disetujui',
        verified_at: '2025-12-10 14:30',
        foto: '/placeholder.jpg'
    },
    {
        id: '2',
        tanggal: '2025-12-09',
        jenis_kegiatan: 'murojah',
        deskripsi: 'Muroja\'ah Juz 1-5 bersama kelompok tahfidz',
        lokasi: 'Masjid Al-Akbar Surabaya',
        durasi_menit: 90,
        status_verifikasi: 'pending',
        foto: '/placeholder.jpg'
    },
    {
        id: '3',
        tanggal: '2025-12-08',
        jenis_kegiatan: 'khataman',
        deskripsi: 'Khataman Al-Quran 30 Juz dalam acara pengajian rutin',
        lokasi: 'Pondok Pesantren Darul Ulum',
        durasi_menit: 180,
        status_verifikasi: 'ditolak',
        verified_at: '2025-12-09 10:00',
        catatan_verifikasi: 'Foto kurang jelas, mohon upload ulang'
    }
];

interface UserData {
    id: string;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function LaporanHarianContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [hafizId, setHafizId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('semua');
    const supabase = createClient();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    console.error('No session found:', sessionError);
                    window.location.href = '/login';
                    return;
                }

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, email, nama, role, kabupaten_kota, foto_profil')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (userError) {
                    console.error('Error fetching user data:', userError);
                    setUser({
                        id: session.user.id,
                        role: 'hafiz',
                        nama: session.user.email?.split('@')[0] || 'User',
                        email: session.user.email || '',
                        kabupaten_kota: undefined
                    });
                } else if (userData) {
                    setUser(userData as UserData);

                    // If user is hafiz, fetch their hafiz record ID
                    // Try multiple methods to find the hafiz record
                    if (userData.role === 'hafiz') {
                        let foundHafizId: string | null = null;

                        // Method 1: Search by user_id
                        const { data: hafizByUserId } = await supabase
                            .from('hafiz')
                            .select('id')
                            .eq('user_id', session.user.id)
                            .maybeSingle();

                        if (hafizByUserId) {
                            foundHafizId = hafizByUserId.id;
                        }

                        // Method 2: Search by email
                        if (!foundHafizId && session.user.email) {
                            const { data: hafizByEmail } = await supabase
                                .from('hafiz')
                                .select('id')
                                .eq('email', session.user.email)
                                .maybeSingle();

                            if (hafizByEmail) {
                                foundHafizId = hafizByEmail.id;
                                // Update the hafiz record to link user_id
                                await supabase
                                    .from('hafiz')
                                    .update({ user_id: session.user.id })
                                    .eq('id', hafizByEmail.id);
                            }
                        }

                        // Method 3: Search by NIK (extract from email if format is nik@hafiz.jatim.go.id)
                        if (!foundHafizId && session.user.email) {
                            const emailParts = session.user.email.split('@');
                            const potentialNik = emailParts[0];

                            // Check if it looks like an NIK (16 digits) or username-based NIK
                            if (/^\d{16}$/.test(potentialNik) || emailParts[1] === 'hafiz.jatim.go.id') {
                                const { data: hafizByNik } = await supabase
                                    .from('hafiz')
                                    .select('id')
                                    .eq('nik', potentialNik)
                                    .maybeSingle();

                                if (hafizByNik) {
                                    foundHafizId = hafizByNik.id;
                                    // Update the hafiz record to link user_id
                                    await supabase
                                        .from('hafiz')
                                        .update({ user_id: session.user.id })
                                        .eq('id', hafizByNik.id);
                                }
                            }
                        }

                        if (foundHafizId) {
                            setHafizId(foundHafizId);
                        }
                    }
                } else {
                    setUser({
                        id: session.user.id,
                        role: 'hafiz',
                        nama: session.user.email?.split('@')[0] || 'User',
                        email: session.user.email || '',
                        kabupaten_kota: undefined
                    });
                }
            } catch (err) {
                console.error('Unexpected error fetching user:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (loading) {
        return <PageLoader />;
    }

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

    const isHafiz = user.role === 'hafiz';

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                            Laporan Harian
                        </h1>
                        <p className="text-neutral-600">
                            {isHafiz ? 'Kelola laporan kegiatan harian Anda' : 'Verifikasi laporan kegiatan Huffadz'}
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 lg:mt-0">
                        {isHafiz && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn btn-primary"
                            >
                                <FiPlus />
                                Tambah Laporan
                            </button>
                        )}
                        <button className="btn btn-secondary">
                            <FiDownload />
                            Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-neutral-500" />
                            <span className="font-semibold text-neutral-700">Filter:</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('semua')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'semua'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'pending'
                                    ? 'bg-accent-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('disetujui')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'disetujui'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Disetujui
                            </button>
                            <button
                                onClick={() => setFilter('ditolak')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ditolak'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Ditolak
                            </button>
                        </div>
                    </div>
                </div>

                {/* Laporan List */}
                <div className="grid gap-6">
                    {mockLaporan.map((laporan) => (
                        <LaporanCard
                            key={laporan.id}
                            laporan={laporan}
                            isHafiz={isHafiz}
                            userRole={user.role}
                        />
                    ))}
                </div>

                {/* Add Laporan Modal */}
                {showModal && (
                    <AddLaporanModal onClose={() => setShowModal(false)} hafizId={hafizId || undefined} />
                )}
            </main>
        </div>
    );
}

interface LaporanCardProps {
    laporan: any;
    isHafiz: boolean;
    userRole: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

function LaporanCard({ laporan, isHafiz, userRole, onApprove, onReject }: LaporanCardProps) {
    const statusConfig = {
        pending: {
            badge: 'badge-warning',
            icon: <FiClock />,
            text: 'Menunggu Verifikasi'
        },
        disetujui: {
            badge: 'badge-success',
            icon: <FiCheckCircle />,
            text: 'Disetujui'
        },
        ditolak: {
            badge: 'badge-error',
            icon: <FiXCircle />,
            text: 'Ditolak'
        }
    };

    const status = statusConfig[laporan.status_verifikasi as keyof typeof statusConfig];

    const jenisKegiatanLabel = {
        mengajar: '👨‍🏫 Mengajar',
        murojah: '📖 Muroja\'ah',
        khataman: '🎓 Khataman',
        lainnya: '📝 Lainnya'
    };

    return (
        <div className="card hover:shadow-xl transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                <div className="lg:w-48 h-48 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        📷 Foto Kegiatan
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge badge-info">
                                    {jenisKegiatanLabel[laporan.jenis_kegiatan as keyof typeof jenisKegiatanLabel]}
                                </span>
                                <span className={`badge ${status.badge} flex items-center gap-1`}>
                                    {status.icon}
                                    {status.text}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-800 mb-1">
                                {laporan.deskripsi}
                            </h3>
                            <p className="text-sm text-neutral-600">
                                📅 {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <p className="text-neutral-700">
                            <span className="font-semibold">📍 Lokasi:</span> {laporan.lokasi}
                        </p>
                        <p className="text-neutral-700">
                            <span className="font-semibold">⏱️ Durasi:</span> {laporan.durasi_menit} menit
                        </p>
                    </div>

                    {laporan.catatan_verifikasi && (
                        <div className="alert alert-warning mb-4">
                            <span className="font-semibold">Catatan:</span> {laporan.catatan_verifikasi}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button className="btn btn-secondary text-sm">
                            <FiEye />
                            Detail
                        </button>
                        {isHafiz && laporan.status_verifikasi === 'pending' && (
                            <>
                                <button className="btn btn-secondary text-sm">
                                    <FiEdit />
                                    Edit
                                </button>
                                <button className="btn btn-danger text-sm">
                                    <FiTrash2 />
                                    Hapus
                                </button>
                            </>
                        )}
                        {/* Admin Kab/Ko can approve/reject laporan */}
                        {userRole === 'admin_kabko' && laporan.status_verifikasi === 'pending' && (
                            <>
                                <button
                                    onClick={() => onApprove?.(laporan.id)}
                                    className="btn btn-primary text-sm"
                                >
                                    <FiCheckCircle />
                                    Setujui
                                </button>
                                <button
                                    onClick={() => onReject?.(laporan.id)}
                                    className="btn btn-danger text-sm"
                                >
                                    <FiXCircle />
                                    Tolak
                                </button>
                            </>
                        )}
                        {/* Admin Provinsi only sees view-only mode */}
                        {userRole === 'admin_provinsi' && (
                            <span className="text-sm text-neutral-500 italic">
                                (Lihat saja - verifikasi oleh Admin Kab/Ko)
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddLaporanModal({ onClose, hafizId }: { onClose: () => void, hafizId?: string }) {
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        jenis_kegiatan: 'mengajar',
        deskripsi: '',
        lokasi: '',
        durasi_menit: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hafizId) {
            setError('Profil Hafiz Anda belum terhubung dengan akun ini. Silakan hubungi Admin Kab/Ko Anda untuk menghubungkan NIK Anda dengan akun login ini, atau pastikan email/NIK yang digunakan saat login sama dengan data di sistem.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const supabase = (await import('@/lib/supabase/client')).createClient();

            let foto_url = null;

            // Upload photo if exists
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${hafizId}-${Date.now()}.${fileExt}`;
                const filePath = `activity-photos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, photoFile, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Continue without photo if upload fails
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(filePath);
                    foto_url = publicUrl;
                }
            }

            // Save laporan to database
            const { error: insertError } = await supabase
                .from('laporan_harian')
                .insert([{
                    hafiz_id: hafizId,
                    tanggal: formData.tanggal,
                    jenis_kegiatan: formData.jenis_kegiatan,
                    deskripsi: formData.deskripsi,
                    lokasi: formData.lokasi,
                    durasi_menit: parseInt(formData.durasi_menit) || 0,
                    foto_url: foto_url,
                    status_verifikasi: 'pending'
                }]);

            if (insertError) {
                console.error('Insert error:', insertError);
                setError('Gagal menyimpan laporan: ' + insertError.message);
                return;
            }

            alert('✅ Laporan berhasil disimpan!');
            onClose();
        } catch (err: any) {
            console.error('Error:', err);
            setError('Terjadi kesalahan: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-bold text-neutral-800">Tambah Laporan Harian</h2>
                </div>

                {error && (
                    <div className="mx-6 mt-4 alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="form-group">
                        <label className="form-label required">Tanggal</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.tanggal}
                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Jenis Kegiatan</label>
                        <select
                            className="form-select"
                            value={formData.jenis_kegiatan}
                            onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                            required
                        >
                            <option value="mengajar">Mengajar</option>
                            <option value="murojah">Muroja'ah</option>
                            <option value="khataman">Khataman</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Deskripsi Kegiatan</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Jelaskan kegiatan yang dilakukan..."
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Lokasi</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Contoh: TPQ Al-Ikhlas, Surabaya"
                            value={formData.lokasi}
                            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Durasi (menit)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="120"
                            value={formData.durasi_menit}
                            onChange={(e) => setFormData({ ...formData, durasi_menit: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Foto Kegiatan</label>
                        <input
                            type="file"
                            className="form-input"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        />
                        <span className="form-help">Upload foto kegiatan (opsional, max 5MB)</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Laporan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={saving}
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LaporanHarianPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <LaporanHarianContent />
        </Suspense>
    );
}
