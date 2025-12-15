'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';

// Validation Schema
const hafizSchema = z.object({
    nik: z.string()
        .min(16, 'NIK harus 16 digit')
        .max(16, 'NIK harus 16 digit')
        .regex(/^[0-9]+$/, 'NIK harus berupa angka'),
    nama: z.string().min(3, 'Nama minimal 3 karakter'),
    tempat_lahir: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
    tanggal_lahir: z.string().min(1, 'Tanggal lahir harus diisi'),
    jenis_kelamin: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin' }),
    alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
    rt: z.string().optional(),
    rw: z.string().optional(),
    desa_kelurahan: z.string().min(2, 'Desa/Kelurahan harus diisi'),
    kecamatan: z.string().min(2, 'Kecamatan harus diisi'),
    kabupaten_kota: z.string().min(2, 'Kabupaten/Kota harus diisi'),
    telepon: z.string()
        .regex(/^[0-9]{10,13}$/, 'Nomor telepon tidak valid (10-13 digit)')
        .optional()
        .or(z.literal('')),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    sertifikat_tahfidz: z.string().optional(),
    mengajar: z.boolean().default(false),
    tempat_mengajar: z.string().optional(),
    tmt_mengajar: z.string().optional(),
    tahun_tes: z.number().min(2015).max(2030),
    keterangan: z.string().optional(),
});

type HafizFormData = z.infer<typeof hafizSchema>;

interface HafizFormProps {
    initialData?: Partial<HafizFormData>;
    mode: 'create' | 'edit';
    hafizId?: string;
    ktpImageFile?: File | null;
}

export default function HafizForm({ initialData, mode, hafizId, ktpImageFile }: HafizFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(hafizSchema) as any,
        defaultValues: {
            jenis_kelamin: 'L' as const,
            mengajar: false,
            tahun_tes: new Date().getFullYear(),
            ...initialData,
        },
    });

    const mengajar = watch('mengajar');

    const onSubmit = async (data: HafizFormData) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const supabase = createClient();

            // Prepare data with proper defaults
            const hafizData: any = {
                nik: data.nik.trim(),
                nama: data.nama.toUpperCase().trim(),
                tempat_lahir: data.tempat_lahir.trim(),
                tanggal_lahir: data.tanggal_lahir,
                jenis_kelamin: data.jenis_kelamin,
                alamat: data.alamat.trim(),
                rt: data.rt?.trim() || null,
                rw: data.rw?.trim() || null,
                desa_kelurahan: data.desa_kelurahan.trim(),
                kecamatan: data.kecamatan.trim(),
                kabupaten_kota: data.kabupaten_kota,
                telepon: data.telepon?.trim() || null,
                email: data.email?.trim() || null,
                sertifikat_tahfidz: data.sertifikat_tahfidz?.trim() || null,
                mengajar: data.mengajar || false,
                tempat_mengajar: data.mengajar && data.tempat_mengajar ? data.tempat_mengajar.trim() : null,
                tmt_mengajar: data.mengajar && data.tmt_mengajar ? data.tmt_mengajar : null,
                tahun_tes: data.tahun_tes,
                keterangan: data.keterangan?.trim() || null,
                status_insentif: 'tidak_aktif', // Default status
                status_kelulusan: 'pending', // Default status
            };

            // Only add updated_at for updates, created_at will be auto-generated
            if (mode === 'edit') {
                hafizData.updated_at = new Date().toISOString();
            }

            if (mode === 'create') {
                // Create new hafiz
                console.log('Attempting to create hafiz with data:', hafizData);

                const { data: newHafiz, error: createError } = await supabase
                    .from('hafiz')
                    .insert([hafizData])
                    .select()
                    .single();

                if (createError) {
                    console.error('Supabase create error:', createError);
                    console.error('Error details:', JSON.stringify(createError, null, 2));
                    console.error('Error code:', createError.code);
                    console.error('Error message:', createError.message);
                    console.error('Error hint:', createError.hint);
                    console.error('Error details:', createError.details);
                    throw createError;
                }

                console.log('Hafiz created successfully:', newHafiz);
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/hafiz');
                }, 1500);
            } else {
                // Update existing hafiz
                console.log('Attempting to update hafiz with data:', hafizData);

                const { error: updateError } = await supabase
                    .from('hafiz')
                    .update(hafizData)
                    .eq('id', hafizId);

                if (updateError) {
                    console.error('Supabase update error:', updateError);
                    console.error('Error details:', JSON.stringify(updateError, null, 2));
                    throw updateError;
                }

                console.log('Hafiz updated successfully');
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/hafiz');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Form submission error:', err);
            console.error('Full error object:', JSON.stringify(err, null, 2));

            // Better error handling
            let errorMessage = 'Terjadi kesalahan saat menyimpan data.';

            if (err.code === '23505') {
                errorMessage = 'NIK sudah terdaftar dalam sistem';
            } else if (err.code === '23502') {
                errorMessage = 'Ada field required yang belum diisi';
            } else if (err.code === '42P01') {
                errorMessage = 'Tabel hafiz belum ada di database. Silakan jalankan migration script terlebih dahulu.';
            } else if (err.code === '42703') {
                errorMessage = 'Ada kolom yang tidak ditemukan di database. Silakan jalankan migration script.';
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.hint) {
                errorMessage = err.hint;
            } else if (err.details) {
                errorMessage = err.details;
            }

            // Add technical details for debugging
            if (err.code) {
                errorMessage += ` (Error code: ${err.code})`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const kabupatenKotaList = [
        'Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Blitar', 'Kota Mojokerto',
        'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu',
        'Kabupaten Gresik', 'Kabupaten Sidoarjo', 'Kabupaten Mojokerto', 'Kabupaten Jombang',
        'Kabupaten Bojonegoro', 'Kabupaten Tuban', 'Kabupaten Lamongan', 'Kabupaten Madiun',
        'Kabupaten Magetan', 'Kabupaten Ngawi', 'Kabupaten Ponorogo', 'Kabupaten Pacitan',
        'Kabupaten Kediri', 'Kabupaten Nganjuk', 'Kabupaten Blitar', 'Kabupaten Tulungagung',
        'Kabupaten Trenggalek', 'Kabupaten Malang', 'Kabupaten Pasuruan', 'Kabupaten Probolinggo',
        'Kabupaten Lumajang', 'Kabupaten Jember', 'Kabupaten Bondowoso', 'Kabupaten Situbondo',
        'Kabupaten Banyuwangi', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep',
        'Kabupaten Bangkalan'
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            {/* Error Alert */}
            {error && (
                <div className="alert alert-error animate-fade-in">
                    <FiAlertCircle />
                    <p>{error}</p>
                </div>
            )}

            {/* Success Alert */}
            {success && (
                <div className="alert alert-success animate-fade-in">
                    <FiAlertCircle />
                    <p>Data berhasil disimpan! Mengalihkan...</p>
                </div>
            )}

            {/* Data Pribadi */}
            <div className="card-modern">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    Data Pribadi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NIK */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label required">NIK</label>
                        <input
                            type="text"
                            className={`form-input ${errors.nik ? 'border-red-500' : ''}`}
                            placeholder="3578012345670001"
                            maxLength={16}
                            {...register('nik')}
                            disabled={mode === 'edit'} // NIK tidak bisa diubah
                        />
                        {errors.nik && (
                            <span className="form-error">{errors.nik.message}</span>
                        )}
                        <span className="form-help">16 digit angka</span>
                    </div>

                    {/* Nama */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label required">Nama Lengkap</label>
                        <input
                            type="text"
                            className={`form-input ${errors.nama ? 'border-red-500' : ''}`}
                            placeholder="MUHAMMAD AHMAD"
                            {...register('nama')}
                        />
                        {errors.nama && (
                            <span className="form-error">{errors.nama.message}</span>
                        )}
                    </div>

                    {/* Tempat Lahir */}
                    <div className="form-group">
                        <label className="form-label required">Tempat Lahir</label>
                        <input
                            type="text"
                            className={`form-input ${errors.tempat_lahir ? 'border-red-500' : ''}`}
                            placeholder="Surabaya"
                            {...register('tempat_lahir')}
                        />
                        {errors.tempat_lahir && (
                            <span className="form-error">{errors.tempat_lahir.message}</span>
                        )}
                    </div>

                    {/* Tanggal Lahir */}
                    <div className="form-group">
                        <label className="form-label required">Tanggal Lahir</label>
                        <input
                            type="date"
                            className={`form-input ${errors.tanggal_lahir ? 'border-red-500' : ''}`}
                            {...register('tanggal_lahir')}
                        />
                        {errors.tanggal_lahir && (
                            <span className="form-error">{errors.tanggal_lahir.message}</span>
                        )}
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="form-group">
                        <label className="form-label required">Jenis Kelamin</label>
                        <select
                            className={`form-select ${errors.jenis_kelamin ? 'border-red-500' : ''}`}
                            {...register('jenis_kelamin')}
                        >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                        {errors.jenis_kelamin && (
                            <span className="form-error">{errors.jenis_kelamin.message}</span>
                        )}
                    </div>

                    {/* Tahun Tes */}
                    <div className="form-group">
                        <label className="form-label required">Tahun Tes</label>
                        <input
                            type="number"
                            className={`form-input ${errors.tahun_tes ? 'border-red-500' : ''}`}
                            min="2015"
                            max="2030"
                            {...register('tahun_tes', { valueAsNumber: true })}
                        />
                        {errors.tahun_tes && (
                            <span className="form-error">{errors.tahun_tes.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Alamat */}
            <div className="card-modern">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    Alamat
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alamat */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label required">Alamat Lengkap</label>
                        <textarea
                            className={`form-textarea ${errors.alamat ? 'border-red-500' : ''}`}
                            rows={3}
                            placeholder="Jl. Contoh No. 123"
                            {...register('alamat')}
                        />
                        {errors.alamat && (
                            <span className="form-error">{errors.alamat.message}</span>
                        )}
                    </div>

                    {/* RT */}
                    <div className="form-group">
                        <label className="form-label">RT</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="001"
                            maxLength={3}
                            {...register('rt')}
                        />
                    </div>

                    {/* RW */}
                    <div className="form-group">
                        <label className="form-label">RW</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="002"
                            maxLength={3}
                            {...register('rw')}
                        />
                    </div>

                    {/* Desa/Kelurahan */}
                    <div className="form-group">
                        <label className="form-label required">Desa/Kelurahan</label>
                        <input
                            type="text"
                            className={`form-input ${errors.desa_kelurahan ? 'border-red-500' : ''}`}
                            placeholder="Gubeng"
                            {...register('desa_kelurahan')}
                        />
                        {errors.desa_kelurahan && (
                            <span className="form-error">{errors.desa_kelurahan.message}</span>
                        )}
                    </div>

                    {/* Kecamatan */}
                    <div className="form-group">
                        <label className="form-label required">Kecamatan</label>
                        <input
                            type="text"
                            className={`form-input ${errors.kecamatan ? 'border-red-500' : ''}`}
                            placeholder="Gubeng"
                            {...register('kecamatan')}
                        />
                        {errors.kecamatan && (
                            <span className="form-error">{errors.kecamatan.message}</span>
                        )}
                    </div>

                    {/* Kabupaten/Kota */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label required">Kabupaten/Kota</label>
                        <select
                            className={`form-select ${errors.kabupaten_kota ? 'border-red-500' : ''}`}
                            {...register('kabupaten_kota')}
                        >
                            <option value="">Pilih Kabupaten/Kota</option>
                            {kabupatenKotaList.map((kabko) => (
                                <option key={kabko} value={kabko}>
                                    {kabko}
                                </option>
                            ))}
                        </select>
                        {errors.kabupaten_kota && (
                            <span className="form-error">{errors.kabupaten_kota.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Kontak */}
            <div className="card-modern">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    Kontak
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Telepon */}
                    <div className="form-group">
                        <label className="form-label">Nomor Telepon/HP</label>
                        <input
                            type="tel"
                            className={`form-input ${errors.telepon ? 'border-red-500' : ''}`}
                            placeholder="081234567890"
                            {...register('telepon')}
                        />
                        {errors.telepon && (
                            <span className="form-error">{errors.telepon.message}</span>
                        )}
                        <span className="form-help">Format: 081234567890 (10-13 digit)</span>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="email@example.com"
                            {...register('email')}
                        />
                        {errors.email && (
                            <span className="form-error">{errors.email.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Tahfidz */}
            <div className="card-modern">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    Data Tahfidz & Mengajar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sertifikat Tahfidz */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label">Sertifikat Tahfidz</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Juz 30, Juz 29-30, 30 Juz, dll"
                            {...register('sertifikat_tahfidz')}
                        />
                        <span className="form-help">Contoh: Juz 30, Juz 29-30, 30 Juz</span>
                    </div>

                    {/* Mengajar */}
                    <div className="form-group md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                {...register('mengajar')}
                            />
                            <span className="font-medium">Sedang Mengajar</span>
                        </label>
                    </div>

                    {/* Tempat Mengajar (conditional) */}
                    {mengajar && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Tempat Mengajar</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Pondok Pesantren ABC"
                                    {...register('tempat_mengajar')}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">TMT Mengajar</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    {...register('tmt_mengajar')}
                                />
                                <span className="form-help">Tanggal Mulai Tugas</span>
                            </div>
                        </>
                    )}

                    {/* Keterangan */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label">Keterangan</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="Catatan tambahan (opsional)"
                            {...register('keterangan')}
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    <FiX />
                    Batal
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <FiLoader className="animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <FiSave />
                            {mode === 'create' ? 'Simpan Data' : 'Update Data'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
