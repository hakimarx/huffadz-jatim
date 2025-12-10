'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
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
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// Helper to parse DD/MM/YYYY dates
const parseDate = (dateStr: any) => {
    if (!dateStr) return null;
    const s = String(dateStr).trim();
    if (!s || s === '#REF!') return null;

    // Try DD/MM/YYYY
    const parts = s.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }

    // Check if mostly YYYY-MM-DD
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
                const { data: periods } = await supabase.from('periode_tes').select('id, tahun');
                const periodMap = new Map(periods?.map((p: any) => [p.tahun, p.id]));

                let successCount = 0;
                let failCount = 0;
                const batchSize = 50;
                const chunks = [];

                // MAP DATA
                const preparedRows = rawData.map((row: any, index: number) => {
                    // Helper to get value ignoring case/trim
                    const getVal = (keys: string[]) => {
                        for (const key of keys) {
                            if (row[key] !== undefined) return row[key];
                            // Try upper case
                            const upperKey = key.toUpperCase();
                            if (row[upperKey] !== undefined) return row[upperKey];

                            // Try finding key in row keys loosely
                            const actualKeys = Object.keys(row);
                            const found = actualKeys.find(k => k.toUpperCase().trim() === upperKey.trim());
                            if (found) return row[found];
                        }
                        return null;
                    };

                    const nik = getVal(['NIK', 'Nik'])?.toString().replace(/['"`]/g, '').trim();
                    if (!nik) {
                        console.warn(`Row ${index + 1}: No NIK found`);
                        return null;
                    }

                    const tahun = parseInt(getVal(['TAHUN SELEKSI', 'Tahun Seleksi']) || '0');
                    const periodeId = periodMap.get(tahun);

                    // Mapping based on user request
                    return {
                        nik: nik,
                        nama: getVal(['NAMA', 'NAMA.', 'Nama']),
                        tempat_lahir: getVal(['TEMPAT LAHIR', 'Tempat Lahir']),
                        tanggal_lahir: parseDate(getVal(['TANGGAL LAHIR', 'TANGGAL LAHIR NIK', 'Tanggal Lahir'])),
                        jenis_kelamin: (getVal(['SEX', 'JK', 'Gender']) === 'P' || getVal(['SEX', 'JK', 'Gender']) === 'Perempuan') ? 'P' : 'L',
                        alamat: getVal(['ALAMAT', 'Alamat']),
                        rt: String(getVal(['RT']) || '').replace(/\D/g, ''),
                        rw: String(getVal(['RW']) || '').replace(/\D/g, ''),
                        desa_kelurahan: getVal(['DESA/KELURAHAN', 'Desa/Kelurahan']),
                        kecamatan: getVal(['KECAMATAN', 'Kecamatan']),
                        kabupaten_kota: getVal(['DAERAH', 'Daerah', 'KABUPATEN/KOTA']) || 'Jawa Timur',
                        telepon: getVal(['TELEPON', 'Telepon'])?.toString(),
                        sertifikat_tahfidz: getVal(['SERTIFIKAT TAHFIDZ', 'Sertifikat']),
                        mengajar: getVal(['MENGAJAR']) && getVal(['MENGAJAR']) !== '-' && getVal(['MENGAJAR']) !== 'TIDAK',
                        tempat_mengajar: (getVal(['MENGAJAR']) !== '-' && getVal(['MENGAJAR']) !== 'TIDAK') ? getVal(['MENGAJAR']) : null,
                        tmt_mengajar: parseDate(getVal(['TMT MENGAJAR', 'TMT'])),
                        tahun_tes: tahun,
                        periode_tes_id: periodeId,
                        keterangan: getVal(['KETERANGAN']),
                        status_kelulusan: (getVal(['LULUS']) || getVal(['LULUS']) === 'YA') ? 'lulus' : 'pending',
                        tanggal_lulus: getVal(['LULUS']) && String(getVal(['LULUS'])).match(/^\d{4}$/) ? `${getVal(['LULUS'])}-01-01` : null,
                        updated_at: new Date().toISOString()
                    };
                }).filter(r => r !== null);

                setUploadLog(prev => [...prev, `⏳ Memproses ${preparedRows.length} data valid...`]);

                // CHUNK UPLOAD
                for (let i = 0; i < preparedRows.length; i += batchSize) {
                    chunks.push(preparedRows.slice(i, i + batchSize));
                }

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    setUploadLog(prev => {
                        const newLog = [...prev];
                        if (newLog.length > 5) newLog.shift(); // Keep list short
                        return [...newLog, `Sending batch ${i + 1}/${chunks.length}...`];
                    });

                    const { error } = await supabase.from('hafiz').upsert(chunk, {
                        onConflict: 'nik',
                        ignoreDuplicates: false
                    });

                    if (error) {
                        console.error('Error inserting chunk:', error);
                        failCount += chunk.length;
                        setUploadLog(prev => [...prev, `❌ Batch ${i + 1} gagal: ${error.message}`]);
                    } else {
                        successCount += chunk.length;
                    }
                }

                setUploadLog(prev => [...prev, '✅ Selesai!']);
                alert(`✅ Upload Selesai!\nSukses: ${successCount}\nGagal: ${failCount}`);
                setShowUploadModal(false);
                setUploadLog([]);

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

    const handleMutasi = (status: string, keterangan?: string) => {
        // TODO: Update to Supabase
        console.log('Mutasi hafiz:', selectedHafiz.id, status, keterangan);
        alert(`✅ Status hafiz berhasil diubah menjadi: ${status}`);
        setShowMutasiModal(false);
        setSelectedHafiz(null);
    };

    const downloadTemplate = () => {
        const template = [
            {
                NIK: '3578012345670001',
                NAMA: 'Muhammad Ahmad',
                TEMPAT_LAHIR: 'Surabaya',
                TANGGAL_LAHIR: '1995-05-15',
                JENIS_KELAMIN: 'L',
                ALAMAT: 'Jl. Raya Darmo No. 123',
                RT: '001',
                RW: '002',
                DESA_KELURAHAN: 'Darmo',
                KECAMATAN: 'Wonokromo',
                KABUPATEN_KOTA: 'Kota Surabaya',
                TELEPON: '081234567890',
                EMAIL: 'ahmad@example.com',
                SERTIFIKAT_TAHFIDZ: '30 Juz',
                MENGAJAR: 'Ya',
                TMT_MENGAJAR: '2020-01-01',
                TAHUN_TES: 2024
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Data Hafiz');
        XLSX.writeFile(wb, 'Template_Data_Hafiz.xlsx');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={userData.role}
                userName={userData.nama}
                userEmail={userData.email}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
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

                {/* Upload Excel Modal */}
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
                                            <li>1. Pastikan header sesuai: TAHUN SELEKSI, DAERAH, NIK, NAMA, dll.</li>
                                            <li>2. Tanggal format: DD/MM/YYYY atau YYYY-MM-DD</li>
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
    const [status, setStatus] = useState(hafiz.status_insentif);
    const [keterangan, setKeterangan] = useState(hafiz.keterangan || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(status, keterangan);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                    Mutasi Status Hafiz
                </h2>

                <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">NIK: {hafiz.nik}</p>
                    <p className="font-bold text-lg">{hafiz.nama}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label required">Status Insentif</label>
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
                            <label className="form-label required">Alasan Tidak Aktif</label>
                            <select
                                className="form-select"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                required
                            >
                                <option value="">Pilih Alasan</option>
                                <option value="Meninggal dunia">Meninggal dunia</option>
                                <option value="Pindah domisili">Pindah domisili</option>
                                <option value="Mengundurkan diri">Mengundurkan diri</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    )}

                    {status === 'suspend' && (
                        <div className="form-group">
                            <label className="form-label">Keterangan Suspend</label>
                            <textarea
                                className="form-textarea"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Alasan suspend..."
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="submit" className="btn btn-primary flex-1">
                            <FiCheckCircle />
                            Simpan Mutasi
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
