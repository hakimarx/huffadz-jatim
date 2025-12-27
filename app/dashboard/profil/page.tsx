'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';
import { FiCamera, FiSave, FiUpload, FiCheckCircle, FiUser, FiLoader } from 'react-icons/fi';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function ProfilContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

                // For hafiz role, also fetch hafiz profile via API
                if (userData.role === 'hafiz') {
                    try {
                        const hafizResponse = await fetch(`/api/hafiz/${userData.id}`);
                        const hafizData = await hafizResponse.json();

                        if (hafizResponse.ok && hafizData.data) {
                            const hd = hafizData.data;
                            setFormData({
                                nik: hd.nik || '',
                                nama: hd.nama || '',
                                tempat_lahir: hd.tempat_lahir || '',
                                tanggal_lahir: hd.tanggal_lahir || '',
                                jenis_kelamin: hd.jenis_kelamin || 'L',
                                alamat: hd.alamat || '',
                                rt: hd.rt || '',
                                rw: hd.rw || '',
                                desa_kelurahan: hd.desa_kelurahan || '',
                                kecamatan: hd.kecamatan || '',
                                kabupaten_kota: hd.kabupaten_kota || '',
                                telepon: hd.telepon || '',
                                email: hd.email || '',
                                sertifikat_tahfidz: hd.sertifikat_tahfidz || '',
                                mengajar: hd.mengajar || false,
                                tmt_mengajar: hd.tmt_mengajar || '',
                                foto_profil: hd.foto_profil || ''
                            });
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

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingPhoto(true);
        try {
            // Compress image if larger than 500KB
            let processedFile = file;
            const maxSizeKB = 500;
            if (file.size > maxSizeKB * 1024) {
                try {
                    processedFile = await compressImage(file, { maxSizeKB });
                    console.log(`Foto dikompres dari ${formatFileSize(file.size)} ke ${formatFileSize(processedFile.size)}`);
                } catch (compErr) {
                    console.error('Compression error:', compErr);
                    // Continue with original file if compression fails
                }
            }

            // Create FormData for file upload
            const uploadData = new FormData();
            uploadData.append('file', processedFile);
            uploadData.append('type', 'profile-photo');

            // Upload via API - For now, show message that this feature needs API implementation
            // TODO: Implement /api/upload endpoint for file uploads
            alert('Fitur upload foto sedang dalam pengembangan. Silakan hubungi administrator.');
            console.log('Photo upload needs /api/upload endpoint implementation');

        } catch (err) {
            console.error('Unexpected error uploading photo:', err);
            alert('Terjadi kesalahan saat upload foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleKTPUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOcrProcessing(true);

        // Simulasi OCR processing - dalam implementasi nyata, gunakan API OCR
        setTimeout(() => {
            setFormData({
                ...formData,
                nik: '3578012345670001',
                nama: 'MUHAMMAD AHMAD',
                tempat_lahir: 'SURABAYA',
                tanggal_lahir: '1995-05-15',
                alamat: 'JL. RAYA DARMO NO. 123',
                rt: '001',
                rw: '002',
                desa_kelurahan: 'DARMO',
                kecamatan: 'WONOKROMO',
                kabupaten_kota: 'KOTA SURABAYA'
            });
            setOcrProcessing(false);
            alert('✅ Data KTP berhasil dibaca! Silakan periksa dan lengkapi data yang masih kosong.');
        }, 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            // Update hafiz table via API
            const response = await fetch(`/api/hafiz/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.nama,
                    tempat_lahir: formData.tempat_lahir,
                    tanggal_lahir: formData.tanggal_lahir,
                    jenis_kelamin: formData.jenis_kelamin,
                    alamat: formData.alamat,
                    rt: formData.rt,
                    rw: formData.rw,
                    desa_kelurahan: formData.desa_kelurahan,
                    kecamatan: formData.kecamatan,
                    kabupaten_kota: formData.kabupaten_kota,
                    telepon: formData.telepon,
                    email: formData.email,
                    sertifikat_tahfidz: formData.sertifikat_tahfidz,
                    mengajar: formData.mengajar,
                    tmt_mengajar: formData.tmt_mengajar || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating profile:', errorData);
                alert('Gagal menyimpan profil: ' + (errorData.error || 'Unknown error'));
                return;
            }

            setIsEditing(false);
            alert('✅ Profil berhasil diperbarui!');
        } catch (err) {
            console.error('Unexpected error saving profile:', err);
            alert('Terjadi kesalahan saat menyimpan profil');
        } finally {
            setSaving(false);
        }
    };

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

                    {/* Upload KTP Section */}
                    {user.role === 'hafiz' && (
                        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl flex-shrink-0">
                                    <FiCamera />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-neutral-800 mb-2">
                                        Upload KTP untuk Auto-Fill Data
                                    </h3>
                                    <p className="text-sm text-neutral-600 mb-4">
                                        Upload foto KTP Anda, sistem akan otomatis membaca dan mengisi data profil
                                    </p>
                                    <label className="btn btn-accent cursor-pointer">
                                        <FiUpload />
                                        {ocrProcessing ? 'Memproses OCR...' : 'Upload Foto KTP'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleKTPUpload}
                                            disabled={ocrProcessing}
                                        />
                                    </label>
                                    {ocrProcessing && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-accent-700">
                                            <div className="spinner w-4 h-4 border-2"></div>
                                            <span>Membaca data KTP dengan OCR...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
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
                                        className="form-select"
                                        value={formData.kabupaten_kota}
                                        onChange={(e) => setFormData({ ...formData, kabupaten_kota: e.target.value })}
                                        disabled={!isEditing}
                                        required
                                    >
                                        <option value="">Pilih Kabupaten/Kota</option>
                                        <option value="Kota Surabaya">Kota Surabaya</option>
                                        <option value="Kota Malang">Kota Malang</option>
                                        <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo</option>
                                        <option value="Kabupaten Gresik">Kabupaten Gresik</option>
                                        {/* Add all 38 kab/ko */}
                                    </select>
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
                                    <button type="submit" className="btn btn-primary">
                                        <FiSave />
                                        Simpan Perubahan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-secondary"
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
