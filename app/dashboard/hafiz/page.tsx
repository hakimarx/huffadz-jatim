'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiPlus,
    FiUpload,
    FiDownload,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiEye,
    FiShuffle
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';
import MutasiModal from '@/components/MutasiModal';

interface UserData {
    id: string;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DataHafizContent() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<UserData | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    const [hafizData, setHafizData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    // Upload Excel states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ success: 0, failed: 0, total: 0 });
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);

    // Mutasi states
    const [showMutasiModal, setShowMutasiModal] = useState(false);
    const [selectedHafizForMutasi, setSelectedHafizForMutasi] = useState<any>(null);

    // Fetch user data from session
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
                    });
                } else if (userData) {
                    setUser(userData as UserData);
                } else {
                    setUser({
                        id: session.user.id,
                        role: 'hafiz',
                        nama: session.user.email?.split('@')[0] || 'User',
                        email: session.user.email || '',
                    });
                }
            } catch (err) {
                console.error('Unexpected error fetching user:', err);
            } finally {
                setUserLoading(false);
            }
        }

        fetchUserData();
    }, []);

    // Fetch data from Supabase
    const fetchHafizData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            let query = supabase
                .from('hafiz')
                .select('*', { count: 'exact' });

            // Filter by kabupaten for admin_kabko
            if (user.role === 'admin_kabko' && user.kabupaten_kota) {
                query = query.eq('kabupaten_kota', user.kabupaten_kota);
            }

            // Search filter
            if (searchQuery) {
                query = query.or(`nik.ilike.%${searchQuery}%,nama.ilike.%${searchQuery}%,telepon.ilike.%${searchQuery}%`);
            }

            // Status filter
            if (filterStatus !== 'semua') {
                query = query.eq('status_insentif', filterStatus);
            }

            // Pagination
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);

            // Order by
            query = query.order('created_at', { ascending: false });

            const { data, error: fetchError, count } = await query;

            if (fetchError) throw fetchError;

            setHafizData(data || []);
            setTotalCount(count || 0);
            setError('');
        } catch (err: any) {
            console.error('Error fetching hafiz:', err);
            setError(err.message || 'Gagal memuat data hafiz');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchHafizData();
        }
    }, [user, searchQuery, filterStatus, currentPage]);

    // Download template
    const downloadTemplate = () => {
        const headers = [
            'NIK', 'NAMA', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'JK',
            'ALAMAT', 'RT', 'RW', 'DESA/KELURAHAN', 'KECAMATAN',
            'KABUPATEN/KOTA', 'TELEPON', 'SERTIFIKAT TAHFIDZ',
            'MENGAJAR', 'TMT MENGAJAR', 'KETERANGAN', 'TAHUN TES'
        ];
        const sample = [
            '3578012345670001', 'AHMAD FULAN', 'Surabaya', '01/01/2000', 'L',
            'Jl. Mawar No. 1', '01', '02', 'Gubeng', 'Gubeng',
            'Kota Surabaya', '081234567890', 'Juz 30',
            'Ya', '01/01/2020', '-', '2024'
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Hafiz.xlsx");
    };

    // Handle Excel Upload
    const handleUploadExcel = async () => {
        if (!uploadFile) {
            alert('Pilih file Excel terlebih dahulu');
            return;
        }

        setUploading(true);
        setUploadErrors([]);
        setUploadProgress({ success: 0, failed: 0, total: 0 });

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                    // Skip header row
                    const rows = jsonData.slice(1).filter(row => row.length > 0 && row[0]);
                    setUploadProgress(prev => ({ ...prev, total: rows.length }));

                    const errors: string[] = [];
                    let successCount = 0;
                    let failedCount = 0;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        try {
                            // Parse date
                            let tanggalLahir = null;
                            if (row[3]) {
                                const dateStr = String(row[3]);
                                if (dateStr.includes('/')) {
                                    const parts = dateStr.split('/');
                                    tanggalLahir = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                } else {
                                    tanggalLahir = dateStr;
                                }
                            }

                            let tmtMengajar = null;
                            if (row[14] && row[14] !== '-') {
                                const dateStr = String(row[14]);
                                if (dateStr.includes('/')) {
                                    const parts = dateStr.split('/');
                                    tmtMengajar = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                }
                            }

                            const hafizRecord = {
                                nik: String(row[0]).trim(),
                                nama: String(row[1] || '').toUpperCase().trim(),
                                tempat_lahir: String(row[2] || '').trim(),
                                tanggal_lahir: tanggalLahir,
                                jenis_kelamin: String(row[4] || 'L').toUpperCase().trim(),
                                alamat: String(row[5] || '').trim(),
                                rt: String(row[6] || '').trim(),
                                rw: String(row[7] || '').trim(),
                                desa_kelurahan: String(row[8] || '').trim(),
                                kecamatan: String(row[9] || '').trim(),
                                kabupaten_kota: String(row[10] || '').trim(),
                                telepon: String(row[11] || '').trim(),
                                sertifikat_tahfidz: String(row[12] || '').trim(),
                                mengajar: String(row[13] || '').toLowerCase() === 'ya',
                                tmt_mengajar: tmtMengajar,
                                keterangan: String(row[15] || '').trim(),
                                tahun_tes: parseInt(String(row[16])) || new Date().getFullYear(),
                                status_insentif: 'tidak_aktif'
                            };

                            const { error: insertError } = await supabase
                                .from('hafiz')
                                .upsert([hafizRecord], { onConflict: 'nik' });

                            if (insertError) {
                                errors.push(`Baris ${i + 2}: ${insertError.message}`);
                                failedCount++;
                            } else {
                                successCount++;
                            }

                            setUploadProgress({ success: successCount, failed: failedCount, total: rows.length });
                        } catch (rowErr: any) {
                            errors.push(`Baris ${i + 2}: ${rowErr.message}`);
                            failedCount++;
                        }
                    }

                    setUploadErrors(errors);

                    if (successCount > 0) {
                        alert(`✅ Import selesai!\n\nBerhasil: ${successCount}\nGagal: ${failedCount}`);
                        // Refresh data
                        fetchHafizData();
                    }

                    if (failedCount > 0 && successCount === 0) {
                        alert('❌ Import gagal. Periksa format data.');
                    }

                } catch (parseErr: any) {
                    console.error('Parse error:', parseErr);
                    alert('Gagal membaca file Excel: ' + parseErr.message);
                }

                setUploading(false);
            };

            reader.readAsArrayBuffer(uploadFile);
        } catch (err: any) {
            console.error('Upload error:', err);
            alert('Gagal upload: ' + err.message);
            setUploading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    if (userLoading) {
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
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                                Data Hafiz {user.role === 'admin_kabko' && `- ${user.kabupaten_kota}`}
                            </h1>
                            <p className="text-neutral-600">
                                Kelola data Huffadz Jawa Timur
                            </p>
                            {totalCount > 0 && (
                                <p className="text-sm text-neutral-500 mt-1">
                                    Total: <span className="font-bold text-primary-600">{totalCount.toLocaleString()}</span> Huffadz
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => router.push('/dashboard/hafiz/create')}
                                className="btn btn-primary flex-shrink-0"
                            >
                                <FiPlus />
                                <span className="hidden sm:inline">Tambah Hafiz</span>
                                <span className="sm:hidden">Tambah</span>
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary flex-shrink-0"
                            >
                                <FiUpload />
                                <span className="hidden sm:inline">Upload Excel</span>
                                <span className="sm:hidden">Upload</span>
                            </button>
                            <button
                                onClick={downloadTemplate}
                                className="btn btn-secondary flex-shrink-0"
                            >
                                <FiDownload />
                                <span className="hidden sm:inline">Template</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="card mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                className="form-input pl-10"
                                placeholder="Cari berdasarkan NIK, nama, atau telepon..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="semua">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="tidak_aktif">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            <p className="text-neutral-600">Memuat data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button onClick={fetchHafizData} className="btn btn-primary">
                                Coba Lagi
                            </button>
                        </div>
                    ) : hafizData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-600 mb-4">Belum ada data Hafiz</p>
                            <button
                                onClick={() => router.push('/dashboard/hafiz/create')}
                                className="btn btn-primary"
                            >
                                <FiPlus />
                                Tambah Hafiz Pertama
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 border-b border-neutral-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">NIK</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nama</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Kabupaten/Kota</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Telepon</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {hafizData.map((hafiz, index) => (
                                            <tr key={hafiz.id || hafiz.nik} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-neutral-800">
                                                    {hafiz.nik}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/hafiz/${hafiz.id || hafiz.nik}`)}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                                                    >
                                                        {hafiz.nama}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {hafiz.kabupaten_kota}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {hafiz.telepon || '-'}
                                                </td>
                                                {/* Status Column - Clickable toggle for admin */}
                                                <td className="px-4 py-3 text-center">
                                                    {user && (user.role === 'admin_provinsi' || user.role === 'admin_kabko') ? (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const newStatus = hafiz.is_aktif === true ? false : true;
                                                                    const { error } = await supabase
                                                                        .from('hafiz')
                                                                        .update({ is_aktif: newStatus })
                                                                        .eq('id', hafiz.id);
                                                                    if (error) throw error;
                                                                    fetchHafizData();
                                                                } catch (err) {
                                                                    console.error('Error updating aktif status:', err);
                                                                }
                                                            }}
                                                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${hafiz.is_aktif === true
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                                }`}
                                                            title="Klik untuk mengubah status"
                                                        >
                                                            {hafiz.is_aktif === true ? '✓ Aktif' : '✗ Tidak Aktif'}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${hafiz.is_aktif === true
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {hafiz.is_aktif === true ? '✓ Aktif' : '✗ Tidak Aktif'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/hafiz/${hafiz.id || hafiz.nik}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/dashboard/hafiz/${hafiz.id || hafiz.nik}/edit`)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        {/* Tombol Mutasi - untuk admin_provinsi dan admin_kabko */}
                                                        {user && (user.role === 'admin_provinsi' || user.role === 'admin_kabko') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedHafizForMutasi(hafiz);
                                                                    setShowMutasiModal(true);
                                                                }}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Mutasi ke Kabupaten/Kota lain"
                                                            >
                                                                <FiShuffle size={16} />
                                                            </button>
                                                        )}
                                                        {/* Tombol Delete */}
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Apakah Anda yakin ingin menghapus data hafiz "${hafiz.nama}"? Data yang dihapus tidak dapat dikembalikan.`)) {
                                                                    return;
                                                                }
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('hafiz')
                                                                        .delete()
                                                                        .eq('id', hafiz.id);
                                                                    if (error) throw error;
                                                                    alert('Data hafiz berhasil dihapus');
                                                                    fetchHafizData();
                                                                } catch (err: any) {
                                                                    console.error('Error deleting hafiz:', err);
                                                                    alert('Gagal menghapus data: ' + err.message);
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-4 py-4 border-t border-neutral-200 flex items-center justify-between">
                                    <div className="text-sm text-neutral-600">
                                        Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} dari {totalCount} data
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Sebelumnya
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Upload Excel Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full">
                            <div className="p-6 border-b border-neutral-200">
                                <h2 className="text-2xl font-bold text-neutral-800">Upload Data Hafiz dari Excel</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="alert alert-info">
                                    <div>
                                        <p className="font-semibold">Petunjuk:</p>
                                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                                            <li>Download template terlebih dahulu</li>
                                            <li>Isi data sesuai format template</li>
                                            <li>NIK harus unik (16 digit)</li>
                                            <li>Format tanggal: DD/MM/YYYY</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Pilih File Excel</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <span className="form-help">Format: .xlsx atau .xls</span>
                                </div>

                                {uploadProgress.total > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress: {uploadProgress.success + uploadProgress.failed} / {uploadProgress.total}</span>
                                            <span className="text-green-600">✓ {uploadProgress.success}</span>
                                            {uploadProgress.failed > 0 && (
                                                <span className="text-red-600">✗ {uploadProgress.failed}</span>
                                            )}
                                        </div>
                                        <div className="w-full bg-neutral-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all"
                                                style={{ width: `${((uploadProgress.success + uploadProgress.failed) / uploadProgress.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {uploadErrors.length > 0 && (
                                    <div className="alert alert-error max-h-32 overflow-y-auto">
                                        <div>
                                            <p className="font-semibold">Error ({uploadErrors.length}):</p>
                                            <ul className="text-sm mt-1 space-y-1">
                                                {uploadErrors.slice(0, 5).map((err, i) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                                {uploadErrors.length > 5 && (
                                                    <li>...dan {uploadErrors.length - 5} error lainnya</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleUploadExcel}
                                        className="btn btn-primary flex-1"
                                        disabled={uploading || !uploadFile}
                                    >
                                        {uploading ? 'Mengimport...' : 'Import Data'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setUploadFile(null);
                                            setUploadProgress({ success: 0, failed: 0, total: 0 });
                                            setUploadErrors([]);
                                        }}
                                        className="btn btn-secondary"
                                        disabled={uploading}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mutasi Modal */}
                {showMutasiModal && selectedHafizForMutasi && user && (
                    <MutasiModal
                        isOpen={showMutasiModal}
                        onClose={() => {
                            setShowMutasiModal(false);
                            setSelectedHafizForMutasi(null);
                        }}
                        hafiz={{
                            id: selectedHafizForMutasi.id,
                            nik: selectedHafizForMutasi.nik,
                            nama: selectedHafizForMutasi.nama,
                            kabupaten_kota: selectedHafizForMutasi.kabupaten_kota
                        }}
                        currentUserId={user.id}
                        onSuccess={() => {
                            fetchHafizData();
                            setSelectedHafizForMutasi(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}

export default function DataHafizPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DataHafizContent />
        </Suspense>
    );
}
