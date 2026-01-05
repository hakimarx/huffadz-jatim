'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';
import { FiSave, FiUpload, FiCheckCircle, FiUser, FiLoader } from 'react-icons/fi';
import KtpOcrUploader from '@/components/KtpOcrUploader';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

interface HafizData {
    id: number;
    nik: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
    telepon: string;
    email: string;
    sertifikat_tahfidz: string;
    mengajar: boolean;
    tmt_mengajar: string;
    foto_profil: string;
}

function ProfilContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hafizId, setHafizId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        nik: '',
        nama: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        alamat: '',
        rt: '',
        rw: '',
        desa_kelurahan: '',
        kecamatan: '',
        kabupaten_kota: '',
        telepon: '',
        email: '',
        sertifikat_tahfidz: '',
        mengajar: false,
        tmt_mengajar: '',
        foto_profil: ''
    });

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.user) {
                    console.error('No session found');
                    window.location.href = '/login';
                    return;
                }

                const userData = sessionData.user as UserData;
                setUser(userData);

                // Initialize form with user data
                setFormData(prev => ({
                    ...prev,
                    nama: userData.nama,
                    email: userData.email,
                    kabupaten_kota: userData.kabupaten_kota || ''
                }));

                // For hafiz role, fetch hafiz profile
                if (userData.role === 'hafiz') {
                    try {
                        // GET /api/hafiz filters by user_id for hafiz role automatically
                        const hafizResponse = await fetch('/api/hafiz?limit=1');
                        const hafizResult = await hafizResponse.json();

                        if (hafizResponse.ok && hafizResult.data && hafizResult.data.length > 0) {
                            const hd = hafizResult.data[0];
                            setHafizId(hd.id);
                            setFormData({
                                nik: hd.nik || '',
                                nama: hd.nama || userData.nama,
                                tempat_lahir: hd.tempat_lahir || '',
                                tanggal_lahir: hd.tanggal_lahir || '',
                                jenis_kelamin: hd.jenis_kelamin || 'L',
                                alamat: hd.alamat || '',
                                rt: hd.rt || '',
                                rw: hd.rw || '',
                                desa_kelurahan: hd.desa_kelurahan || '',
                                kecamatan: hd.kecamatan || '',
                                kabupaten_kota: hd.kabupaten_kota || userData.kabupaten_kota || '',
                                telepon: hd.telepon || '',
                                email: hd.email || userData.email,
                                sertifikat_tahfidz: hd.sertifikat_tahfidz || '',
                                mengajar: !!hd.mengajar,
                                tmt_mengajar: hd.tmt_mengajar ? new Date(hd.tmt_mengajar).toISOString().split('T')[0] : '',
                                foto_profil: hd.foto_profil || ''
                            });
                        } else {
                            // No profile yet, open edit mode to force completion
                            setIsEditing(true);
                        }
                    } catch (err) {
                        console.error('Error fetching hafiz profile:', err);
                    }
                }
            } catch (err) {
                console.error('Unexpected error fetching user:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    const handleKtpDataExtracted = (data: any, file: File) => {
        setFormData(prev => ({
            ...prev,
            nik: data.nik || prev.nik,
            nama: data.nama || prev.nama,
            tempat_lahir: data.tempat_lahir || prev.tempat_lahir,
            tanggal_lahir: data.tanggal_lahir || prev.tanggal_lahir,
            jenis_kelamin: data.jenis_kelamin || prev.jenis_kelamin,
            alamat: data.alamat || prev.alamat,
            rt: data.rt || prev.rt,
            rw: data.rw || prev.rw,
            desa_kelurahan: data.desa_kelurahan || prev.desa_kelurahan,
            kecamatan: data.kecamatan || prev.kecamatan,
            kabupaten_kota: data.kabupaten_kota || prev.kabupaten_kota
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const url = hafizId ? `/api/hafiz/${hafizId}` : '/api/hafiz';
            const method = hafizId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                tahun_tes: new Date().getFullYear(), // Default to current year for new profiles
                mengajar: formData.mengajar ? 1 : 0
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal menyimpan profil');
            }

            if (!hafizId && result.id) {
                setHafizId(result.id);
            }

            setIsEditing(false);
            alert('✅ Profil berhasil diperbarui!');

            // Reload page to refresh data/state properly
            window.location.reload();
        } catch (err: any) {
            console.error('Error saving profile:', err);
            alert('Gagal menyimpan profil: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                                Profil Saya
                            </h1>
                            <p className="text-neutral-600">
                                Kelola informasi profil dan data pribadi Anda
                            </p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary"
                            >
                                Edit Profil
                            </button>
                        )}
                    </div>

                    {/* OCR Section */}
                    {user.role === 'hafiz' && isEditing && (
                        <div className="mb-8">
                            <KtpOcrUploader
                                onDataExtracted={handleKtpDataExtracted}
                            />
                        </div>
                    )}

                    {/* Form Profil */}
                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* NIK */}
                                <div className="form-group">
                                    <label className="form-label required">NIK</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.nik}
                                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                        maxLength={16}
                                    />
                                </div>

                                {/* Nama Lengkap */}
                                <div className="form-group">
                                    <label className="form-label required">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Tempat Lahir */}
                                <div className="form-group">
                                    <label className="form-label required">Tempat Lahir</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.tempat_lahir}
                                        onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Tanggal Lahir */}
                                <div className="form-group">
                                    <label className="form-label required">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.tanggal_lahir}
                                        onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Jenis Kelamin */}
                                <div className="form-group">
                                    <label className="form-label required">Jenis Kelamin</label>
                                    <select
                                        className="form-select"
                                        value={formData.jenis_kelamin}
                                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>

                                {/* Telepon */}
                                <div className="form-group">
                                    <label className="form-label required">Telepon</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.telepon}
                                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="form-group md:col-span-2">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input bg-neutral-100"
                                        value={formData.email}
                                        disabled={true} // Always disabled as it comes from account
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Email diambil dari akun pengguna</p>
                                </div>

                                {/* Alamat */}
                                <div className="form-group md:col-span-2">
                                    <label className="form-label required">Alamat</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                        rows={3}
                                    />
                                </div>

                                {/* RT */}
                                <div className="form-group">
                                    <label className="form-label required">RT</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.rt}
                                        onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                        maxLength={3}
                                    />
                                </div>

                                {/* RW */}
                                <div className="form-group">
                                    <label className="form-label required">RW</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.rw}
                                        onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                        maxLength={3}
                                    />
                                </div>

                                {/* Desa/Kelurahan */}
                                <div className="form-group">
                                    <label className="form-label required">Desa/Kelurahan</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.desa_kelurahan}
                                        onChange={(e) => setFormData({ ...formData, desa_kelurahan: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Kecamatan */}
                                <div className="form-group">
                                    <label className="form-label required">Kecamatan</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.kecamatan}
                                        onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Kabupaten/Kota */}
                                <div className="form-group md:col-span-2">
                                    <label className="form-label required">Kabupaten/Kota</label>
                                    <select
                                        className={`form-select ${user.kabupaten_kota ? 'bg-neutral-100' : ''}`}
                                        value={formData.kabupaten_kota}
                                        onChange={(e) => setFormData({ ...formData, kabupaten_kota: e.target.value })}
                                        disabled={!isEditing || !!user.kabupaten_kota} // Disable if set by admin
                                        required
                                    >
                                        <option value="">Pilih Kabupaten/Kota</option>
                                        <option value="Kota Surabaya">Kota Surabaya</option>
                                        <option value="Kota Malang">Kota Malang</option>
                                        <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo</option>
                                        <option value="Kabupaten Gresik">Kabupaten Gresik</option>
                                        {/* Add all 38 kab/ko */}
                                    </select>
                                    {user.kabupaten_kota && (
                                        <p className="text-xs text-neutral-500 mt-1">Wilayah ditentukan oleh Admin</p>
                                    )}
                                </div>

                                {/* Sertifikat Tahfidz */}
                                <div className="form-group">
                                    <label className="form-label required">Sertifikat Tahfidz</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.sertifikat_tahfidz}
                                        onChange={(e) => setFormData({ ...formData, sertifikat_tahfidz: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="Contoh: 30 Juz"
                                        required
                                    />
                                </div>

                                {/* Mengajar */}
                                <div className="form-group">
                                    <label className="form-label">Status Mengajar</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mengajar"
                                                checked={formData.mengajar}
                                                onChange={() => setFormData({ ...formData, mengajar: true })}
                                                disabled={!isEditing}
                                            />
                                            <span>Ya, Mengajar</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mengajar"
                                                checked={!formData.mengajar}
                                                onChange={() => setFormData({ ...formData, mengajar: false })}
                                                disabled={!isEditing}
                                            />
                                            <span>Tidak Mengajar</span>
                                        </label>
                                    </div>
                                </div>

                                {/* TMT Mengajar */}
                                {formData.mengajar && (
                                    <div className="form-group md:col-span-2">
                                        <label className="form-label">TMT Mengajar</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.tmt_mengajar}
                                            onChange={(e) => setFormData({ ...formData, tmt_mengajar: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <FiLoader className="animate-spin" /> Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave /> Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-secondary"
                                        disabled={saving}
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ProfilContent />
        </Suspense>
    );
}
