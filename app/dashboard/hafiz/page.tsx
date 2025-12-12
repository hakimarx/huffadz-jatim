'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/LoadingSpinner';
import {
    FiPlus,
    FiUpload,
    FiDownload,
    FiEdit,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiFilter,
    FiSearch,
    FiFileText,
    FiAlertCircle
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

// Helper to parse DD/MM/YYYY dates
const parseDate = (dateStr: any) => {
    if (!dateStr) return null;

    // Handle Excel serial date (number)
    if (typeof dateStr === 'number' && dateStr > 20000) {
        // Excel base date is Dec 30 1899
        const date = new Date((dateStr - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    const s = String(dateStr).trim();
    if (!s || s === '#REF!') return null;

    // Try DD/MM/YYYY (common in Indonesia)
    const parts = s.split(/[\/-]/); // split by / or -
    if (parts.length === 3) {
        // Assume DD/MM/YYYY if first part is <= 31 and last part is > 31 (year)
        if (parts[0].length <= 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        // Assume YYYY-MM-DD if first part is 4 digits
        if (parts[0].length === 4) {
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
    }

    // Fallback normal check
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s;

    return null;
};

// Mock data
const mockHafiz = [
    {
        id: '1',
        nik: '3578012345670001',
        nama: 'Muhammad Ahmad',
        kabupaten_kota: 'Kota Surabaya',
        tahun_tes: 2024,
        status_kelulusan: 'lulus',
        status_insentif: 'aktif',
        telepon: '081234567890'
    },
    {
        id: '2',
        nik: '3578012345670002',
        nama: 'Fatimah Zahra',
        kabupaten_kota: 'Kota Surabaya',
        tahun_tes: 2023,
        status_kelulusan: 'lulus',
        status_insentif: 'tidak_aktif',
        keterangan: 'Meninggal dunia',
        telepon: '081234567891'
    }
];

function DataHafizContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin_provinsi';
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMutasiModal, setShowMutasiModal] = useState(false);
    const [selectedHafiz, setSelectedHafiz] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadLog, setUploadLog] = useState<string[]>([]);

    const userData = {
        role: role,
        nama: role === 'admin_provinsi' ? 'Admin Provinsi' : 'Admin Kab/Ko',
        email: `${role}@lptq.jatimprov.go.id`,
        kabupaten_kota: role === 'admin_kabko' ? 'Kota Surabaya' : ''
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadLog([]);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                setUploadLog(['⏳ Membaca file...']);
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Get raw data
                const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                console.log('Raw Excel Data:', rawData.slice(0, 2)); // Debugging
                setUploadLog(prev => [...prev, `✅ Berhasil membaca ${rawData.length} baris data.`]);

                // Fetch periods
                const supabase = createClient();
                const { data: periods } = await supabase.from('periode_tes').select('id, tahun');
                const periodMap = new Map((periods || []).map((p: any) => [p.tahun, p.id]));

                let successCount = 0;
                let failCount = 0;
                const batchSize = 50;
                const chunks = [];

                // MAP DATA
                const preparedRows = rawData.map((row: any, index: number) => {
                    // Helper to get value ignoring case/trim
                    const getVal = (keys: string[]) => {
                        for (const key of keys) {
                            if (row[key] !== undefined && row[key] !== null) return row[key];

                            // Try upper case
                            const upperKey = key.toUpperCase();
                            if (row[upperKey] !== undefined && row[upperKey] !== null) return row[upperKey];

                            // Try finding key in row keys loosely
                            const actualKeys = Object.keys(row);
                            const found = actualKeys.find(k => k.toUpperCase().trim() === upperKey.trim());
                            if (found) return row[found];
                        }
                        return null;
                    };

                    const nikRaw = getVal(['NIK', 'Nik', 'nik']);
                    const nik = nikRaw ? String(nikRaw).replace(/['"`\s]/g, '') : '';

                    if (!nik || nik.length < 10) { // Basic NIK validation
                        console.warn(`Row ${index + 1}: Invalid or missing NIK`);
                        return null;
                    }

                    const tahunStr = getVal(['TAHUN SELEKSI', 'Tahun Seleksi', 'TAHUN_SELEKSI']);
                    const tahun = parseInt(String(tahunStr || '0'), 10) || 0;

                    // If period doesn't exist, we might want to default or skip. For now, try to find closest or leave null.
                    const periodeId = periodMap.get(tahun) || null;

                    const jenisKelaminRaw = getVal(['JK', 'JEKEL', 'SEX', 'Gender']);
                    const jenisKelamin = (jenisKelaminRaw === 'P' || String(jenisKelaminRaw).toLowerCase() === 'perempuan') ? 'P' : 'L';

                    // Logic for Status Kelulusan & Tanggal Lulus
                    const lulusRaw = getVal(['LULUS', 'Status Lulus', 'Lulus']);
                    let statusKelulusan = 'pending';
                    let tanggalLulus = null;

                    if (lulusRaw && String(lulusRaw).match(/^20\d{2}$/)) {
                        statusKelulusan = 'lulus';
                        tanggalLulus = `${lulusRaw}-01-01`;
                    } else if (['LULUS', 'YA', 'SUCCESS'].includes(String(lulusRaw).toUpperCase())) {
                        statusKelulusan = 'lulus';
                        tanggalLulus = (tahun > 0) ? `${tahun}-01-01` : new Date().toISOString().split('T')[0];
                    }

                    // Logic for Mengajar
                    const mengajarRaw = getVal(['MENGAJAR', 'Mengajar', 'Tempat Mengajar']);
                    const mengajarStr = String(mengajarRaw).toUpperCase();
                    const isMengajar = !!(mengajarRaw && mengajarStr.length > 3 && !['TIDAK', 'NA', '-', '0'].includes(mengajarStr));

                    // Build object
                    return {
                        nik: nik,
                        nama: String(getVal(['NAMA', 'Nama', 'Nama Lengkap']) || '').toUpperCase(),
                        tempat_lahir: getVal(['TEMPAT LAHIR', 'Tempat Lahir']),
                        tanggal_lahir: parseDate(getVal(['TANGGAL LAHIR', 'Tanggal Lahir', 'TANGGAL LAHIR NIK'])) || '1990-01-01', // Fallback
                        jenis_kelamin: jenisKelamin,
                        alamat: getVal(['ALAMAT', 'Alamat']),
                        rt: String(getVal(['RT']) || '').replace(/\D/g, '').substring(0, 5),
                        rw: String(getVal(['RW']) || '').replace(/\D/g, '').substring(0, 5),
                        desa_kelurahan: getVal(['DESA/KELURAHAN', 'Desa/Kelurahan', 'KELURAHAN', 'Desa']),
                        kecamatan: getVal(['KECAMATAN', 'Kecamatan']),
                        kabupaten_kota: getVal(['DAERAH', 'Daerah', 'KABUPATEN/KOTA', 'Kabupaten/Kota']) || 'Jawa Timur',
                        telepon: String(getVal(['TELEPON', 'Telepon', 'HP', 'No HP']) || '').replace(/\D/g, ''),
                        sertifikat_tahfidz: getVal(['SERTIFIKAT TAHFIDZ', 'Sertifikat Tahfidz', 'Sertifikat']),

                        mengajar: isMengajar,
                        tempat_mengajar: isMengajar ? String(mengajarRaw) : null,
                        tmt_mengajar: parseDate(getVal(['TMT MENGAJAR', 'TMT Mengajar', 'TMT'])),

                        keterangan: getVal(['KETERANGAN', 'Keterangan']),
                        tahun_tes: tahun,
                        periode_tes_id: periodeId,

                        status_kelulusan: statusKelulusan,
                        tanggal_lulus: tanggalLulus,

                        updated_at: new Date().toISOString()
                    };
                }).filter(r => r !== null);

                if (preparedRows.length === 0) {
                    throw new Error("Tidak ada data valid yang ditemukan dalam file Excel. Periksa nama kolom header.");
                }

                setUploadLog(prev => [...prev, `⏳ Memproses ${preparedRows.length} data valid...`]);

                // CHUNK UPLOAD
                for (let i = 0; i < preparedRows.length; i += batchSize) {
                    chunks.push(preparedRows.slice(i, i + batchSize));
                }

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    setUploadLog(prev => {
                        const newLog = [...prev];
                        if (newLog.length > 4) newLog.shift();
                        return [...newLog, `Sending batch ${i + 1} / ${chunks.length}...`];
                    });

                    const { error } = await supabase.from('hafiz').upsert(chunk, {
                        onConflict: 'nik',
                        ignoreDuplicates: false
                    });

                    if (error) {
                        console.error('Error inserting chunk:', error);
                        // If policy recursion error, it's CRITICAL.
                        if (error.message.includes('recursion')) {
                            throw new Error("Critical RLS Error: Infinite Recursion. Please contact admin.");
                        }
                        failCount += chunk.length;
                        setUploadLog(prev => [...prev, `❌ Batch ${i + 1} gagal: ${error.message}`]);
                    } else {
                        successCount += chunk.length;
                    }
                }

                setUploadLog(prev => [...prev, '✅ Proses selesai!']);
                alert(`✅ Upload Selesai!\nSukses: ${successCount}\nGagal: ${failCount}`);
                if (successCount > 0) {
                    setTimeout(() => setShowUploadModal(false), 1500);
                }

            } catch (err: any) {
                console.error('Upload Error:', err);
                alert('❌ Terjadi kesalahan: ' + err.message);
                setUploadLog(prev => [...prev, `❌ Error: ${err.message}`]);
            } finally {
                setIsUploading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMutasi = async (type: 'status' | 'wilayah', data: any) => {
        try {
            const supabase = createClient();
            if (type === 'status') {
                const { status, keterangan } = data;
                // Update status in Supabase
                const { error } = await supabase
                    .from('hafiz')
                    .update({
                        status_insentif: status,
                        keterangan: keterangan,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedHafiz.id);

                if (error) throw error;
                alert(`✅ Status berhasil diubah menjadi: ${status}`);
            } else if (type === 'wilayah') {
                const { kabupaten_kota, keterangan } = data;
                // Update wilayah in Supabase
                const { error } = await supabase
                    .from('hafiz')
                    .update({
                        kabupaten_kota: kabupaten_kota,
                        keterangan: keterangan ? `${selectedHafiz.keterangan || ''}; Mutasi ke ${kabupaten_kota} (${keterangan})` : undefined,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedHafiz.id);

                if (error) throw error;
                alert(`✅ Berhasil mutasi wilayah ke: ${kabupaten_kota}`);
            }

            // Refresh data (Reload page for simplicity or refetch)
            window.location.reload();

        } catch (err: any) {
            console.error('Mutasi Error:', err);
            alert('❌ Gagal melakukan mutasi: ' + err.message);
        } finally {
            setShowMutasiModal(false);
            setSelectedHafiz(null);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'NIK', 'NAMA', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'JK',
            'ALAMAT', 'RT', 'RW', 'DESA/KELURAHAN', 'KECAMATAN',
            'DAERAH', 'TELEPON', 'SERTIFIKAT TAHFIDZ',
            'MENGAJAR', 'TMT MENGAJAR', 'KETERANGAN',
            'TAHUN SELEKSI', 'LULUS'
        ];
        const sample = [
            '357801...', 'Fulan', 'Surabaya', '01/01/2000', 'L',
            'Jl. Mawar', '01', '02', 'Gubeng', 'Gubeng',
            'Kota Surabaya', '081234567890', 'Juz 30',
            'Ponpes A', '01/01/2020', '-',
            '2024', 'LULUS'
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Hafiz.xlsx");
    };

    // ... (rest of component) ...

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
            {/* ... (Navbar and Main content remain same) ... */}
            <Navbar
                userRole={userData.role}
                userName={userData.nama}
            />

            <main className="flex-1 p-4 lg:p-8 overflow-auto max-w-7xl mx-auto w-full">
                {/* ... (Header, Search, Table remain same) ... */}

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                            Data Hafiz {role === 'admin_kabko' && `- ${userData.kabupaten_kota}`}
                        </h1>
                        <p className="text-neutral-600">
                            Kelola data Huffadz dan status insentif
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 lg:mt-0">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn btn-accent"
                        >
                            <FiUpload />
                            Upload Excel
                        </button>
                        <button
                            onClick={downloadTemplate}
                            className="btn btn-secondary"
                        >
                            <FiDownload />
                            Template
                        </button>
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('semua')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'semua'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterStatus('aktif')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'aktif'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Aktif
                            </button>
                            <button
                                onClick={() => setFilterStatus('tidak_aktif')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'tidak_aktif'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                Tidak Aktif
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Kab/Kota</th>
                                <th>Tahun Tes</th>
                                <th>Status Kelulusan</th>
                                <th>Status Insentif</th>
                                <th>Telepon</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockHafiz.map((hafiz) => (
                                <tr key={hafiz.id}>
                                    <td className="font-mono text-sm">{hafiz.nik}</td>
                                    <td className="font-semibold">{hafiz.nama}</td>
                                    <td>{hafiz.kabupaten_kota}</td>
                                    <td>{hafiz.tahun_tes}</td>
                                    <td>
                                        <span className={`badge ${hafiz.status_kelulusan === 'lulus' ? 'badge-success' : 'badge-error'
                                            }`}>
                                            {hafiz.status_kelulusan === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${hafiz.status_insentif === 'aktif' ? 'badge-success' : 'badge-error'
                                            }`}>
                                            {hafiz.status_insentif === 'aktif' ? '✓ Aktif' : '✗ Tidak Aktif'}
                                        </span>
                                        {hafiz.keterangan && (
                                            <div className="text-xs text-neutral-500 mt-1">
                                                {hafiz.keterangan}
                                            </div>
                                        )}
                                    </td>
                                    <td>{hafiz.telepon}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary text-sm py-1 px-2"
                                                onClick={() => {
                                                    setSelectedHafiz(hafiz);
                                                    setShowMutasiModal(true);
                                                }}
                                            >
                                                <FiEdit size={14} />
                                                Mutasi
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Upload Excel Modal (Keep as is) */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                                Upload Data Hafiz dari Excel
                            </h2>

                            <div className="space-y-4">
                                <div className="alert alert-info">
                                    <FiFileText />
                                    <div>
                                        <p className="font-semibold">Panduan Upload:</p>
                                        <ul className="text-sm mt-1 space-y-1">
                                            <li>1. Pastikan header sesuai template (TAHUN SELEKSI, DAERAH, NIK, dll)</li>
                                            <li>2. Tanggal format: DD/MM/YYYY (contoh: 31/12/2024)</li>
                                            <li>3. NIK harus unik</li>
                                        </ul>
                                    </div>
                                </div>
                                {uploadLog.length > 0 && (
                                    <div className="bg-neutral-900 text-green-400 p-3 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
                                        {uploadLog.map((log, i) => (
                                            <div key={i}>{log}</div>
                                        ))}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">File Excel</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="form-input"
                                        onChange={handleExcelUpload}
                                        disabled={isUploading}
                                    />
                                    <span className="form-help">
                                        Format: .xlsx atau .xls (max 10MB)
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={downloadTemplate}
                                        className="btn btn-secondary flex-1"
                                    >
                                        <FiDownload />
                                        {isUploading ? 'Sedang Memproses...' : 'Download Template'}
                                    </button>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="btn btn-secondary"
                                        disabled={isUploading}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mutasi Modal */}
                {showMutasiModal && selectedHafiz && (
                    <MutasiModal
                        hafiz={selectedHafiz}
                        onClose={() => {
                            setShowMutasiModal(false);
                            setSelectedHafiz(null);
                        }}
                        onSubmit={handleMutasi}
                    />
                )}
            </main>
        </div>
    );
}

function MutasiModal({ hafiz, onClose, onSubmit }: any) {
    const [mutasiType, setMutasiType] = useState<'status' | 'wilayah'>('status');
    const [status, setStatus] = useState(hafiz.status_insentif);
    const [keterangan, setKeterangan] = useState(hafiz.keterangan || '');
    const [targetWilayah, setTargetWilayah] = useState('');

    const kabKoList = [
        'Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Blitar', 'Kota Mojokerto', 'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu',
        'Kabupaten Gresik', 'Kabupaten Sidoarjo', 'Kabupaten Mojokerto', 'Kabupaten Jombang', 'Kabupaten Bojonegoro', 'Kabupaten Tuban', 'Kabupaten Lamongan',
        'Kabupaten Madiun', 'Kabupaten Magetan', 'Kabupaten Ngawi', 'Kabupaten Ponorogo', 'Kabupaten Pacitan', 'Kabupaten Kediri', 'Kabupaten Nganjuk',
        'Kabupaten Blitar', 'Kabupaten Tulungagung', 'Kabupaten Trenggalek', 'Kabupaten Malang', 'Kabupaten Pasuruan', 'Kabupaten Probolinggo', 'Kabupaten Lumajang',
        'Kabupaten Jember', 'Kabupaten Bondowoso', 'Kabupaten Situbondo', 'Kabupaten Banyuwangi', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep', 'Kabupaten Bangkalan'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mutasiType === 'status') {
            onSubmit('status', { status, keterangan });
        } else {
            onSubmit('wilayah', { kabupaten_kota: targetWilayah, keterangan });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                    Mutasi Data Hafiz
                </h2>

                <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Profil Hafiz</p>
                    <p className="font-bold text-lg text-primary-700">{hafiz.nama}</p>
                    <p className="text-sm text-neutral-600 font-mono">{hafiz.nik}</p>
                    <p className="text-sm text-neutral-600 mt-1 flex items-center gap-1">
                        📍 {hafiz.kabupaten_kota}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Jenis Mutasi</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setMutasiType('status')}
                                className={`py-2 px-4 rounded-lg text-sm font-medium border ${mutasiType === 'status' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-neutral-300 text-neutral-600'}`}
                            >
                                Status Insentif
                            </button>
                            <button
                                type="button"
                                onClick={() => setMutasiType('wilayah')}
                                className={`py-2 px-4 rounded-lg text-sm font-medium border ${mutasiType === 'wilayah' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-neutral-300 text-neutral-600'}`}
                            >
                                Pindah Wilayah
                            </button>
                        </div>
                    </div>

                    {mutasiType === 'status' ? (
                        <>
                            <div className="form-group">
                                <label className="form-label required">Status Baru</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required
                                >
                                    <option value="aktif">✓ Aktif</option>
                                    <option value="tidak_aktif">✗ Tidak Aktif</option>
                                    <option value="suspend">⏸ Suspend</option>
                                </select>
                            </div>

                            {status === 'tidak_aktif' && (
                                <div className="form-group">
                                    <label className="form-label required">Alasan</label>
                                    <select
                                        className="form-select"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Alasan</option>
                                        <option value="Meninggal dunia">Meninggal dunia</option>
                                        <option value="Pindah domisili">Pindah domisili (Keluar Jatim)</option>
                                        <option value="Mengundurkan diri">Mengundurkan diri</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                            )}

                            {status === 'suspend' && (
                                <div className="form-group">
                                    <label className="form-label required">Keterangan Suspend</label>
                                    <textarea
                                        className="form-textarea"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Alasan suspend..."
                                        rows={2}
                                        required
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label required">Pindah Ke Kabupaten/Kota</label>
                                <select
                                    className="form-select"
                                    value={targetWilayah}
                                    onChange={(e) => setTargetWilayah(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Tujuan Mutasi --</option>
                                    {kabKoList.filter(k => k !== hafiz.kabupaten_kota).map(kota => (
                                        <option key={kota} value={kota}>
                                            {kota}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Data akan dipindahkan ke admin Kab/Ko tujuan.
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Alasan Pindah</label>
                                <textarea
                                    className="form-textarea"
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Contoh: Mengikuti suami/istri, Pindah tugas, dll."
                                    rows={2}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn btn-primary flex-1">
                            <FiCheckCircle />
                            Simpan Perubahan
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
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
