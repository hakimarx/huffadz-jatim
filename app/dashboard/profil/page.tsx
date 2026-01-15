'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiSave, FiLoader, FiTrash2 } from 'react-icons/fi';
import KtpOcrUploader from '@/components/KtpOcrUploader';
import SignatureCanvas from 'react-signature-canvas';


interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    telepon?: string;
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
    tempat_mengajar: string;
    tmt_mengajar: string;
    foto_profil: string;
    nama_bank: string;
    nomor_rekening: string;
    tanda_tangan: string;
    riwayat_mengajar: any[];
}

function ProfilContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [kabupatenList, setKabupatenList] = useState<{ id: string, nama: string }[]>([]);
    const [hafizId, setHafizId] = useState<number | null>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);

    // Signature refs
    const sigPad = useRef<SignatureCanvas>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

    // History state
    const [isAddingHistory, setIsAddingHistory] = useState(false);
    const [newHistoryItem, setNewHistoryItem] = useState({ tempat: '', tmt: '' });

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
        tempat_mengajar: '',
        tmt_mengajar: '',
        foto_profil: '',
        nama_bank: '',
        nomor_rekening: '',
        tanda_tangan: ''
    });

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                // Fetch Kabupaten List
                try {
                    const kabRes = await fetch('/api/kabupaten');
                    if (kabRes.ok) {
                        const kabData = await kabRes.json();
                        setKabupatenList(kabData.data || []);
                    }
                } catch (kErr) {
                    console.error('Error fetching kabupaten list:', kErr);
                }

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

                            // Fetch detailed data including history
                            const detailRes = await fetch(`/api/hafiz/${hd.id}`);
                            const detailData = await detailRes.json();
                            const fullData = detailData.data || hd;

                            setHistoryData(fullData.riwayat_mengajar || []);
                            setSignatureUrl(fullData.tanda_tangan || null);

                            setFormData({
                                nik: fullData.nik || '',
                                nama: fullData.nama || userData.nama,
                                tempat_lahir: fullData.tempat_lahir || '',
                                tanggal_lahir: fullData.tanggal_lahir || '',
                                jenis_kelamin: fullData.jenis_kelamin || 'L',
                                alamat: fullData.alamat || '',
                                rt: fullData.rt || '',
                                rw: fullData.rw || '',
                                desa_kelurahan: fullData.desa_kelurahan || '',
                                kecamatan: fullData.kecamatan || '',
                                kabupaten_kota: fullData.kabupaten_kota || userData.kabupaten_kota || '',
                                telepon: fullData.telepon || '',
                                email: fullData.email || userData.email,
                                sertifikat_tahfidz: fullData.sertifikat_tahfidz || '',
                                mengajar: !!fullData.mengajar,
                                tempat_mengajar: fullData.tempat_mengajar || '',
                                tmt_mengajar: fullData.tmt_mengajar ? new Date(fullData.tmt_mengajar).toISOString().split('T')[0] : '',
                                foto_profil: fullData.foto_profil || '',
                                nama_bank: fullData.nama_bank || '',
                                nomor_rekening: fullData.nomor_rekening || '',
                                tanda_tangan: fullData.tanda_tangan || ''
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

            // Upload via API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!response.ok) {
                throw new Error('Gagal upload foto');
            }

            const result = await response.json();

            // Update state
            setFormData(prev => ({ ...prev, foto_profil: result.url }));

            // Show location as requested by user
            alert(`✅ Foto berhasil diupload!\n\nLokasi File: ${result.debug_path}\nURL Public: ${result.url}`);

        } catch (err) {
            console.error('Unexpected error uploading photo:', err);
            alert('Terjadi kesalahan saat upload foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

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

    const saveSignature = async () => {
        if (sigPad.current?.isEmpty()) {
            alert('Tanda tangan masih kosong');
            return;
        }

        const dataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
        if (!dataUrl) return;

        // Convert base64 to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'signature.png', { type: 'image/png' });

        // Upload
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('type', 'signatures');

        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            });
            const result = await uploadRes.json();
            if (uploadRes.ok) {
                setSignatureUrl(result.url);
                setFormData(prev => ({ ...prev, tanda_tangan: result.url }));
                alert('Tanda tangan berhasil disimpan');
            } else {
                alert('Gagal mengupload tanda tangan');
            }
        } catch (e) {
            console.error(e);
            alert('Error uploading signature');
        }
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
                mengajar: formData.mengajar ? 1 : 0,
                tanda_tangan: signatureUrl // Ensure signature is included
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
                                        {kabupatenList.length > 0 ? (
                                            kabupatenList.map((kab) => (
                                                <option key={kab.id} value={kab.nama}>
                                                    {kab.nama}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Kota Surabaya">Kota Surabaya</option>
                                                <option value="Kota Malang">Kota Malang</option>
                                                <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo</option>
                                                <option value="Kabupaten Gresik">Kabupaten Gresik</option>
                                                <option value="Kota Kediri">Kota Kediri</option>
                                                <option value="Kota Blitar">Kota Blitar</option>
                                                <option value="Kota Mojokerto">Kota Mojokerto</option>
                                                <option value="Kota Madiun">Kota Madiun</option>
                                                <option value="Kota Pasuruan">Kota Pasuruan</option>
                                                <option value="Kota Probolinggo">Kota Probolinggo</option>
                                                <option value="Kota Batu">Kota Batu</option>
                                                <option value="Kabupaten Mojokerto">Kabupaten Mojokerto</option>
                                                <option value="Kabupaten Jombang">Kabupaten Jombang</option>
                                                <option value="Kabupaten Bojonegoro">Kabupaten Bojonegoro</option>
                                                <option value="Kabupaten Tuban">Kabupaten Tuban</option>
                                                <option value="Kabupaten Lamongan">Kabupaten Lamongan</option>
                                                <option value="Kabupaten Madiun">Kabupaten Madiun</option>
                                                <option value="Kabupaten Magetan">Kabupaten Magetan</option>
                                                <option value="Kabupaten Ngawi">Kabupaten Ngawi</option>
                                                <option value="Kabupaten Ponorogo">Kabupaten Ponorogo</option>
                                                <option value="Kabupaten Pacitan">Kabupaten Pacitan</option>
                                                <option value="Kabupaten Kediri">Kabupaten Kediri</option>
                                                <option value="Kabupaten Nganjuk">Kabupaten Nganjuk</option>
                                                <option value="Kabupaten Blitar">Kabupaten Blitar</option>
                                                <option value="Kabupaten Tulungagung">Kabupaten Tulungagung</option>
                                                <option value="Kabupaten Trenggalek">Kabupaten Trenggalek</option>
                                                <option value="Kabupaten Malang">Kabupaten Malang</option>
                                                <option value="Kabupaten Pasuruan">Kabupaten Pasuruan</option>
                                                <option value="Kabupaten Probolinggo">Kabupaten Probolinggo</option>
                                                <option value="Kabupaten Lumajang">Kabupaten Lumajang</option>
                                                <option value="Kabupaten Jember">Kabupaten Jember</option>
                                                <option value="Kabupaten Bondowoso">Kabupaten Bondowoso</option>
                                                <option value="Kabupaten Situbondo">Kabupaten Situbondo</option>
                                                <option value="Kabupaten Banyuwangi">Kabupaten Banyuwangi</option>
                                                <option value="Kabupaten Sampang">Kabupaten Sampang</option>
                                                <option value="Kabupaten Pamekasan">Kabupaten Pamekasan</option>
                                                <option value="Kabupaten Sumenep">Kabupaten Sumenep</option>
                                                <option value="Kabupaten Bangkalan">Kabupaten Bangkalan</option>
                                            </>
                                        )}
                                    </select>
                                    {user.kabupaten_kota && (
                                        <p className="text-xs text-neutral-500 mt-1">Wilayah ditentukan oleh Admin</p>
                                    )}
                                </div>

                                {/* Sertifikat Tahfidz */}
                                <div className="form-group md:col-span-2">
                                    <label className="form-label required">Lembaga Pemberi Ijazah Tahfidz</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.sertifikat_tahfidz}
                                        onChange={(e) => setFormData({ ...formData, sertifikat_tahfidz: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="Nama Pesantren / Lembaga"
                                        required
                                    />
                                    <span className="form-help">Nama lembaga yang mengeluarkan sertifikat/ijazah tahfidz</span>
                                </div>

                                {/* Tempat & TMT Mengajar (Main) */}
                                <div className="form-group">
                                    <label className="form-label">Lembaga Mengajar</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.tempat_mengajar}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            tempat_mengajar: e.target.value,
                                            mengajar: !!e.target.value
                                        })}
                                        disabled={!isEditing}
                                        placeholder="Nama Lembaga / Pesantren (Utama)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">TMT Mengajar</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.tmt_mengajar}
                                        onChange={(e) => setFormData({ ...formData, tmt_mengajar: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Additional History Items */}
                                {historyData.map((item) => (
                                    <div key={item.id} className="contents">
                                        <div className="form-group">
                                            <label className="form-label">Lembaga Mengajar (Lainnya)</label>
                                            <input
                                                type="text"
                                                className="form-input bg-neutral-50"
                                                value={item.tempat_mengajar}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-group relative">
                                            <label className="form-label">TMT Mengajar</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    className="form-input bg-neutral-50"
                                                    value={item.tmt_mulai ? new Date(item.tmt_mulai).toISOString().split('T')[0] : ''}
                                                    readOnly
                                                />
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!confirm('Hapus riwayat ini?')) return;
                                                            try {
                                                                const res = await fetch(`/api/hafiz/history?id=${item.id}`, { method: 'DELETE' });
                                                                if (res.ok) {
                                                                    setHistoryData(prev => prev.filter(h => h.id !== item.id));
                                                                } else {
                                                                    alert('Gagal menghapus riwayat');
                                                                }
                                                            } catch (e) {
                                                                alert('Error deleting history');
                                                            }
                                                        }}
                                                        className="btn btn-danger p-2"
                                                        title="Hapus"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New History Row */}
                                {isEditing && hafizId && (
                                    <div className="contents">
                                        {isAddingHistory ? (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label">Lembaga Mengajar Baru</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={newHistoryItem.tempat}
                                                        onChange={(e) => setNewHistoryItem({ ...newHistoryItem, tempat: e.target.value })}
                                                        placeholder="Nama Lembaga"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">TMT Mengajar</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="date"
                                                            className="form-input"
                                                            value={newHistoryItem.tmt}
                                                            onChange={(e) => setNewHistoryItem({ ...newHistoryItem, tmt: e.target.value })}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!newHistoryItem.tempat) return alert('Nama lembaga wajib diisi');
                                                                setSaving(true);
                                                                try {
                                                                    const res = await fetch('/api/hafiz/history', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            hafiz_id: hafizId,
                                                                            tempat_mengajar: newHistoryItem.tempat,
                                                                            tmt_mulai: newHistoryItem.tmt
                                                                        })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (res.ok) {
                                                                        setHistoryData(prev => [...prev, {
                                                                            id: data.id,
                                                                            tempat_mengajar: newHistoryItem.tempat,
                                                                            tmt_mulai: newHistoryItem.tmt
                                                                        }]);
                                                                        setNewHistoryItem({ tempat: '', tmt: '' });
                                                                        setIsAddingHistory(false);
                                                                    } else {
                                                                        alert(data.error || 'Gagal menambah riwayat');
                                                                    }
                                                                } catch (e) {
                                                                    alert('Error adding history');
                                                                } finally {
                                                                    setSaving(false);
                                                                }
                                                            }}
                                                            className="btn btn-primary whitespace-nowrap"
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingHistory(false)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="md:col-span-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingHistory(true)}
                                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                                                >
                                                    + Tambah Lembaga Mengajar Lainnya
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rekening Bank */}
                                <div className="form-group">
                                    <label className="form-label">Nama Bank</label>
                                    <select
                                        className="form-select"
                                        value={formData.nama_bank}
                                        onChange={(e) => setFormData({ ...formData, nama_bank: e.target.value })}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Pilih Bank</option>
                                        <option value="BRI">BRI</option>
                                        <option value="BNI">BNI</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="BCA">BCA</option>
                                        <option value="CIMB Niaga">CIMB Niaga</option>
                                        <option value="BTN">BTN</option>
                                        <option value="Bank Jatim">Bank Jatim</option>
                                        <option value="Bank Syariah Indonesia">Bank Syariah Indonesia (BSI)</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Nomor Rekening</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.nomor_rekening}
                                        onChange={(e) => setFormData({ ...formData, nomor_rekening: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            {/* Tanda Tangan */}
                            <div className="mt-6 border-t border-neutral-200 pt-6">
                                <h3 className="text-lg font-bold mb-4">Tanda Tangan Digital</h3>
                                <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white max-w-md">
                                    {signatureUrl ? (
                                        <div className="relative p-4 flex justify-center bg-white">
                                            <img src={signatureUrl} alt="Tanda Tangan" className="h-32 object-contain" />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Hapus tanda tangan dan buat baru?')) {
                                                            setSignatureUrl(null);
                                                            setFormData(prev => ({ ...prev, tanda_tangan: '' }));
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ) : isEditing ? (
                                        <>
                                            <SignatureCanvas
                                                ref={sigPad}
                                                penColor="black"
                                                canvasProps={{ className: 'w-full h-40 bg-white cursor-crosshair' }}
                                            />
                                            <div className="flex justify-end gap-2 p-2 border-t border-neutral-200 bg-neutral-50">
                                                <button type="button" onClick={() => sigPad.current?.clear()} className="btn btn-sm btn-secondary">
                                                    Bersihkan
                                                </button>
                                                <button type="button" onClick={saveSignature} className="btn btn-sm btn-primary">
                                                    Simpan Tanda Tangan
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-8 text-center text-neutral-500">
                                            Belum ada tanda tangan
                                        </div>
                                    )}
                                </div>
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
