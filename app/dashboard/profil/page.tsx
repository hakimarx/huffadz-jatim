'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiCamera, FiSave, FiUpload, FiCheckCircle } from 'react-icons/fi';

function ProfilContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'hafiz';
    const [isEditing, setIsEditing] = useState(false);
    const [ocrProcessing, setOcrProcessing] = useState(false);

    const [formData, setFormData] = useState({
        nik: '3578012345670001',
        nama: 'Muhammad Ahmad',
        tempat_lahir: 'Surabaya',
        tanggal_lahir: '1995-05-15',
        jenis_kelamin: 'L',
        alamat: 'Jl. Raya Darmo No. 123',
        rt: '001',
        rw: '002',
        desa_kelurahan: 'Darmo',
        kecamatan: 'Wonokromo',
        kabupaten_kota: 'Kota Surabaya',
        telepon: '081234567890',
        email: 'ahmad@example.com',
        sertifikat_tahfidz: '30 Juz',
        mengajar: true,
        tmt_mengajar: '2020-01-01'
    });

    const userData = {
        role: role,
        nama: role === 'admin_provinsi' ? 'Admin Provinsi' : role === 'admin_kabko' ? 'Admin Kab/Ko' : 'Muhammad Ahmad',
        email: `${role}@example.com`
    };

    const handleKTPUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOcrProcessing(true);

        // Simulasi OCR processing
        setTimeout(() => {
            // Mock OCR result - dalam implementasi nyata, gunakan API OCR
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Save to Supabase
        console.log('Save profil:', formData);
        setIsEditing(false);
        alert('✅ Profil berhasil diperbarui!');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={userData.role}
                userName={userData.nama}
                userEmail={userData.email}
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
                    {role === 'hafiz' && (
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
