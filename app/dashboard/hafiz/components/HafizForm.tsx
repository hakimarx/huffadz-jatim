'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiAlertCircle, FiLoader, FiPlus, FiTrash2 } from 'react-icons/fi';
import SignatureCanvas from 'react-signature-canvas';

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
    is_aktif: z.boolean().optional(),
    nomor_rekening: z.string().optional(),
    nama_bank: z.string().optional(),
    tanda_tangan: z.string().optional(),
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

    const sigPad = useRef<SignatureCanvas>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(initialData?.tanda_tangan || null);

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
            is_aktif: initialData?.is_aktif ?? true,
            ...initialData,
        },
    });

    const mengajar = watch('mengajar');

    const clearSignature = () => {
        sigPad.current?.clear();
        setSignatureUrl(null);
        setValue('tanda_tangan', '');
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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'signatures');

        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await uploadRes.json();
            if (uploadRes.ok) {
                setSignatureUrl(result.url);
                setValue('tanda_tangan', result.url);
                alert('Tanda tangan berhasil disimpan');
            } else {
                alert('Gagal mengupload tanda tangan');
            }
        } catch (e) {
            console.error(e);
            alert('Error uploading signature');
        }
    };

    const onSubmit = async (data: HafizFormData) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
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
                nomor_rekening: data.nomor_rekening?.trim() || null,
                nama_bank: data.nama_bank?.trim() || null,
                tanda_tangan: data.tanda_tangan || null,
                status_kelulusan: 'pending',
            };

            if (mode === 'create') {
                // Create new hafiz via MySQL API
                const response = await fetch('/api/hafiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(hafizData),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Gagal menyimpan data');
                }

                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/hafiz');
                }, 1500);
            } else {
                // Update existing hafiz via MySQL API
                const response = await fetch(`/api/hafiz/${hafizId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...hafizData, is_aktif: data.is_aktif }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Gagal mengupdate data');
                }

                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/hafiz');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Form submission error:', err);
            setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
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

                    {/* Nama Bank */}
                    <div className="form-group">
                        <label className="form-label">Nama Bank</label>
                        <select
                            className="form-select"
                            {...register('nama_bank')}
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

                    {/* Nomor Rekening */}
                    <div className="form-group">
                        <label className="form-label">Nomor Rekening</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="1234567890"
                            {...register('nomor_rekening')}
                        />
                        <span className="form-help">Untuk pencairan insentif</span>
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
                    {/* Lembaga Pemberi Ijazah Tahfidz */}
                    <div className="form-group md:col-span-2">
                        <label className="form-label">Lembaga Pemberi Ijazah Tahfidz</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nama Pesantren / Lembaga"
                            {...register('sertifikat_tahfidz')}
                        />
                        <span className="form-help">Nama lembaga yang mengeluarkan sertifikat/ijazah tahfidz</span>
                    </div>

                    {/* Lembaga Mengajar & TMT */}
                    <div className="form-group">
                        <label className="form-label">Lembaga Mengajar</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nama Lembaga / Pesantren"
                            {...register('tempat_mengajar')}
                            onChange={(e) => {
                                setValue('tempat_mengajar', e.target.value);
                                setValue('mengajar', !!e.target.value);
                            }}
                        />
                        <span className="form-help">Isi jika sedang mengajar</span>
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

                    {/* Status Aktif - Hanya tampil pada mode edit */}
                    {mode === 'edit' && (
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Status Hafiz</label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-600"
                                        value="true"
                                        {...register('is_aktif')}
                                        checked={watch('is_aktif') === true}
                                        onChange={() => setValue('is_aktif', true)}
                                    />
                                    <span className="font-medium text-green-700">✓ Aktif</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-red-600"
                                        value="false"
                                        {...register('is_aktif')}
                                        checked={watch('is_aktif') === false}
                                        onChange={() => setValue('is_aktif', false)}
                                    />
                                    <span className="font-medium text-red-700">✗ Tidak Aktif</span>
                                </label>
                            </div>
                            <span className="form-help">Hafiz yang tidak aktif tidak akan menerima insentif</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tanda Tangan */}
            <div className="card-modern">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                    Tanda Tangan Digital
                </h3>

                <div className="form-group">
                    <label className="form-label">Tanda Tangan (Sekali Saja)</label>
                    <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white">
                        {signatureUrl ? (
                            <div className="relative p-4 flex justify-center bg-white">
                                <img src={signatureUrl} alt="Tanda Tangan" className="h-32 object-contain" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Hapus tanda tangan dan buat baru?')) {
                                            setSignatureUrl(null);
                                            setValue('tanda_tangan', '');
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ) : (
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
                        )}
                    </div>
                    <span className="form-help">Silakan tanda tangan di area kotak di atas, lalu klik Simpan.</span>
                </div>
            </div>

            {/* Riwayat Mengajar Section (Edit Mode Only) */}
            {mode === 'edit' && hafizId && (
                <HistorySection hafizId={hafizId} initialHistory={(initialData as any)?.riwayat_mengajar || []} />
            )}

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

export function HistorySection({ hafizId, initialHistory }: { hafizId: string, initialHistory: any[] }) {
    const [history, setHistory] = useState<any[]>(initialHistory);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({
        tempat_mengajar: '',
        tmt_mulai: '',
        tmt_selesai: '',
        keterangan: ''
    });

    const handleAdd = async () => {
        if (!newItem.tempat_mengajar) return alert('Tempat mengajar wajib diisi');

        setLoading(true);
        try {
            const res = await fetch('/api/hafiz/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, hafiz_id: hafizId })
            });
            if (!res.ok) throw new Error('Gagal menambah riwayat');

            const result = await res.json();

            setHistory([{ ...newItem, id: result.id, tmt_mulai: newItem.tmt_mulai || null, tmt_selesai: newItem.tmt_selesai || null }, ...history]);
            setNewItem({ tempat_mengajar: '', tmt_mulai: '', tmt_selesai: '', keterangan: '' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus riwayat ini?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/hafiz/history?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus');
            setHistory(history.filter(h => h.id !== id));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-modern mt-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                Riwayat / Lembaga Mengajar Lainnya
            </h3>

            <div className="bg-neutral-50 p-4 rounded-xl mb-6">
                <h4 className="font-semibold mb-3">Tambah Riwayat Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        className="form-input"
                        placeholder="Tempat Mengajar"
                        value={newItem.tempat_mengajar}
                        onChange={e => setNewItem({ ...newItem, tempat_mengajar: e.target.value })}
                    />
                    <input
                        type="date"
                        className="form-input"
                        placeholder="TMT Mulai"
                        data-placeholder="TMT Mulai"
                        value={newItem.tmt_mulai}
                        onChange={e => setNewItem({ ...newItem, tmt_mulai: e.target.value })}
                        title="TMT Mulai"
                    />
                    <input
                        type="date"
                        className="form-input"
                        placeholder="TMT Selesai"
                        value={newItem.tmt_selesai}
                        onChange={e => setNewItem({ ...newItem, tmt_selesai: e.target.value })}
                        title="TMT Selesai"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? <FiLoader className="animate-spin" /> : <FiPlus />} Tambah
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Tempat Mengajar</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">TMT Mulai</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">TMT Selesai</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {history.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-neutral-500">Belum ada riwayat</td></tr>
                        ) : (
                            history.map(h => (
                                <tr key={h.id}>
                                    <td className="px-4 py-2">{h.tempat_mengajar}</td>
                                    <td className="px-4 py-2">
                                        {h.tmt_mulai ? new Date(h.tmt_mulai).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {h.tmt_selesai ? new Date(h.tmt_selesai).toLocaleDateString() : 'Sekarang'}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(h.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
