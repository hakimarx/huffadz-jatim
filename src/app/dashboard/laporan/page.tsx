'use client';

import { useState, Suspense, useEffect, useMemo } from 'react';
import EXIF from 'exif-js';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';
import {
    FiPlus,
    FiFilter,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiEye,
    FiEdit,
    FiTrash2,
    FiLoader,
    FiImage,
    FiX,
    FiCalendar,
    FiMapPin,
    FiBarChart2,
    FiPieChart,
    FiRefreshCw,
    FiSearch,
    FiAlertCircle
} from 'react-icons/fi';

// ... (Interfaces remain the same)
interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

interface LaporanData {
    id: number;
    hafiz_id: number;
    tanggal: string;
    jam?: string;
    jenis_kegiatan: string;
    deskripsi: string;
    lokasi?: string;
    foto_url?: string;
    status_verifikasi: 'pending' | 'disetujui' | 'ditolak';
    verified_at?: string;
    catatan_verifikasi?: string;
    hafiz?: {
        nama: string;
        nik: string;
        kabupaten_kota: string;
    };
    nama_hafiz?: string;
    kabupaten_kota?: string;
}

interface KabKoStats {
    kabupaten_kota: string;
    total_hafiz: number;
    hafiz_sudah_lapor: number;
    total_laporan: number;
    laporan_disetujui: number;
    laporan_pending: number;
    laporan_ditolak: number;
    persentase_lapor: number;
}

interface AbsensiData {
    id: number;
    hafiz_id: number;
    tanggal: string;
    waktu: string;
    status: 'hadir' | 'tidak_hadir' | 'izin';
    keterangan: string;
    nama: string;
    nik: string;
    kabupaten_kota: string;
}

function LaporanHarianContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [hafizId, setHafizId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [laporanToEdit, setLaporanToEdit] = useState<LaporanData | undefined>(undefined);
    const [laporanToView, setLaporanToView] = useState<LaporanData | null>(null);
    const [filter, setFilter] = useState('semua');
    const [laporanList, setLaporanList] = useState<LaporanData[]>([]);
    const [kabKoStats, setKabKoStats] = useState<KabKoStats[]>([]);
    const [kabKoList, setKabKoList] = useState<string[]>([]);
    const [selectedKabKo, setSelectedKabKo] = useState<string>('semua');
    const [selectedTahun, setSelectedTahun] = useState<number>(new Date().getFullYear());
    const [selectedBulan, setSelectedBulan] = useState<number>(0); // 0 = Semua, 1 = Jan, etc.
    const [exporting, setExporting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'stats'>('stats');
    const [activeTab, setActiveTab] = useState<'laporan'>('laporan');

    // Available years for filter
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 2015; i--) {
            years.push(i);
        }
        return years;
    }, []);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchLaporanData();
        }
    }, [user, selectedKabKo, selectedTahun, selectedBulan, filter, hafizId]);

    async function fetchUserData() {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();

            if (!response.ok || !data.user) {
                console.error('No session found:', data);
                window.location.href = '/login';
                return;
            }

            setUser(data.user as UserData);

            if (data.user.role === 'admin_provinsi') {
                try {
                    const kabResponse = await fetch('/api/kabupaten');
                    const kabData = await kabResponse.json();
                    if (kabData.data) {
                        setKabKoList(kabData.data.map((k: any) => k.nama));
                    }
                } catch (err) {
                    console.error('Error fetching kabupaten:', err);
                }
            }

            if (data.user.role === 'hafiz') {
                try {
                    const hafizResponse = await fetch(`/api/hafiz?limit=1`);
                    const hafizData = await hafizResponse.json();
                    if (hafizData.data && hafizData.data.length > 0) {
                        setHafizId(hafizData.data[0].id);
                    }
                } catch (err) {
                    console.error('Error fetching hafiz ID:', err);
                }
            }
        } catch (err) {
            console.error('Unexpected error fetching user:', err);
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }

    async function fetchLaporanData() {
        if (!user) return;
        setRefreshing(true);

        try {
            const params = new URLSearchParams();

            if (filter !== 'semua') {
                params.set('status', filter);
            }

            if (hafizId && user.role === 'hafiz') {
                params.set('hafiz_id', hafizId.toString());
            }

            const response = await fetch(`/api/laporan?${params.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching laporan:', result.error);
                return;
            }

            let laporanData = result.data || [];

            const transformedData: LaporanData[] = laporanData.map((item: any) => ({
                id: item.id,
                hafiz_id: item.hafiz_id,
                tanggal: item.tanggal ? (typeof item.tanggal === 'string' ? item.tanggal : new Date(item.tanggal).toISOString().split('T')[0]) : '',
                jam: item.jam,
                jenis_kegiatan: item.jenis_kegiatan,
                deskripsi: item.deskripsi,
                lokasi: item.lokasi,
                foto_url: item.foto_url,
                status_verifikasi: item.status_verifikasi,
                verified_at: item.verified_at,
                catatan_verifikasi: item.catatan_verifikasi,
                nama_hafiz: item.nama_hafiz,
                kabupaten_kota: item.kabupaten_kota,
                hafiz: {
                    nama: item.nama_hafiz || '',
                    nik: '',
                    kabupaten_kota: item.kabupaten_kota || ''
                }
            }));

            let filteredData = transformedData.filter(l => {
                if (!l.tanggal) return false;
                const parts = l.tanggal.split('-'); // YYYY-MM-DD
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                
                const yearMatch = year === selectedTahun;
                const monthMatch = selectedBulan === 0 || month === selectedBulan;
                
                return yearMatch && monthMatch;
            });

            if (user.role === 'admin_provinsi' && selectedKabKo !== 'semua') {
                filteredData = filteredData.filter(l =>
                    l.kabupaten_kota === selectedKabKo
                );
            } else if (user.role === 'admin_kabko') {
                filteredData = filteredData.filter(l =>
                    l.kabupaten_kota === user.kabupaten_kota
                );
            }

            setLaporanList(filteredData);

            if (user.role === 'admin_provinsi') {
                await fetchKabKoStats();
            }

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setRefreshing(false);
        }
    }

    async function fetchKabKoStats() {
        try {
            const response = await fetch(`/api/statistics?type=kabko&year=${selectedTahun}`);
            if (response.ok) {
                const stats = await response.json();
                setKabKoStats(stats);
            } else {
                console.error('Failed to fetch kabko stats');
            }
        } catch (err) {
            console.error('Error fetching kabko stats:', err);
        }
    }

    // ... (Export functions remain the same)
    async function handleExportExcel() {
        setExporting(true);
        try {
            // Prepare data for export
            const exportData = laporanList.map(l => ({
                'Tanggal': l.tanggal,
                'Jam': l.jam || '-',
                'Nama Hafiz': l.hafiz?.nama || '-',
                'NIK': l.hafiz?.nik || '-',
                'Kab/Kota': l.hafiz?.kabupaten_kota || '-',
                'Jenis Kegiatan': l.jenis_kegiatan,
                'Deskripsi': l.deskripsi,
                'Lokasi': l.lokasi || '-',
                'Status': l.status_verifikasi,
                'Diverifikasi': l.verified_at ? new Date(l.verified_at).toLocaleString('id-ID') : '-',
                'Catatan': l.catatan_verifikasi || '-'
            }));

            // Generate CSV content
            if (exportData.length === 0) {
                alert('Tidak ada data untuk diekspor');
                return;
            }

            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(','),
                ...exportData.map(row =>
                    headers.map(h => {
                        const value = row[h as keyof typeof row] || '';
                        // Escape commas and quotes
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    }).join(',')
                )
            ].join('\n');

            // Add BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const fileName = `Laporan_Harian_${selectedTahun}${selectedKabKo !== 'semua' ? '_' + selectedKabKo.replace(/\s/g, '_') : ''}_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✅ Export berhasil! File CSV dapat dibuka di Excel.');

        } catch (err) {
            console.error('Export error:', err);
            alert('Gagal mengekspor data');
        } finally {
            setExporting(false);
        }
    }

    async function handleExportStatsExcel() {
        setExporting(true);
        try {
            const exportData = kabKoStats.map(s => ({
                'Kabupaten/Kota': s.kabupaten_kota,
                'Total Hafiz': s.total_hafiz,
                'Hafiz Sudah Lapor': s.hafiz_sudah_lapor,
                'Persentase Lapor (%)': s.persentase_lapor,
                'Total Laporan': s.total_laporan,
                'Disetujui': s.laporan_disetujui,
                'Pending': s.laporan_pending,
                'Ditolak': s.laporan_ditolak
            }));

            if (exportData.length === 0) {
                alert('Tidak ada data statistik untuk diekspor');
                return;
            }

            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(','),
                ...exportData.map(row =>
                    headers.map(h => row[h as keyof typeof row] || '').join(',')
                )
            ].join('\n');

            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Statistik_Laporan_Per_KabKo_${selectedTahun}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✅ Export statistik berhasil!');

        } catch (err) {
            console.error('Export error:', err);
            alert('Gagal mengekspor statistik');
        } finally {
            setExporting(false);
        }
    }

    async function handleApprove(laporanId: number) {
        if (!confirm('Yakin ingin menyetujui laporan ini?')) return;

        try {
            const response = await fetch(`/api/laporan/${laporanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status_verifikasi: 'disetujui',
                    verified_by: user?.id,
                    verified_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to approve');
            }

            alert('✅ Laporan berhasil disetujui');
            fetchLaporanData();
        } catch (err) {
            console.error('Error:', err);
            alert('Gagal menyetujui laporan');
        }
    }

    async function handleReject(laporanId: number) {
        const catatan = prompt('Masukkan catatan penolakan:');
        if (catatan === null) return;

        try {
            const response = await fetch(`/api/laporan/${laporanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status_verifikasi: 'ditolak',
                    verified_by: user?.id,
                    verified_at: new Date().toISOString(),
                    catatan_verifikasi: catatan
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reject');
            }

            alert('Laporan berhasil ditolak');
            fetchLaporanData();
        } catch (err) {
            console.error('Error:', err);
            alert('Gagal menolak laporan');
        }
    }

    function handleEdit(laporan: LaporanData) {
        setLaporanToEdit(laporan);
        setShowModal(true);
    }

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
    const isAdminProvinsi = user.role === 'admin_provinsi';
    const isAdminKabko = user.role === 'admin_kabko';

    // Calculate summary stats
    const totalLaporan = laporanList.length;
    const totalDisetujui = laporanList.filter(l => l.status_verifikasi === 'disetujui').length;
    const totalPending = laporanList.filter(l => l.status_verifikasi === 'pending').length;
    const totalDitolak = laporanList.filter(l => l.status_verifikasi === 'ditolak').length;

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
                    <div className="flex gap-3 mt-4 lg:mt-0 flex-wrap">
                        {isHafiz && (
                            <button
                                onClick={() => {
                                    setLaporanToEdit(undefined);
                                    setShowModal(true);
                                }}
                                className="btn btn-primary"
                            >
                                <FiPlus />
                                Tambah Laporan
                            </button>
                        )}
                        {true && (
                            <>
                                <button
                                    onClick={handleExportExcel}
                                    className="btn btn-secondary"
                                    disabled={exporting || laporanList.length === 0}
                                >
                                    {exporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
                                    Export Excel
                                </button>
                                <button
                                    onClick={() => fetchLaporanData()}
                                    className="btn btn-secondary"
                                    disabled={refreshing}
                                >
                                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                                </button>
                            </>
                        )}
                    </div>
                </div>



                {/* Content based on active tab */}
                <>
                    {/* Filters for All Users (Tahun & Bulan) + Admin Specific (KabKo) */}
                     <div className="card mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Year Filter */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    <FiCalendar className="inline mr-1" /> Tahun
                                </label>
                                <select
                                    value={selectedTahun}
                                    onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
                                    className="form-select w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Filter - NEW */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    <FiCalendar className="inline mr-1" /> Bulan
                                </label>
                                <select
                                    value={selectedBulan}
                                    onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
                                    className="form-select w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value={0}>Semua Bulan</option>
                                    <option value={1}>Januari</option>
                                    <option value={2}>Februari</option>
                                    <option value={3}>Maret</option>
                                    <option value={4}>April</option>
                                    <option value={5}>Mei</option>
                                    <option value={6}>Juni</option>
                                    <option value={7}>Juli</option>
                                    <option value={8}>Agustus</option>
                                    <option value={9}>September</option>
                                    <option value={10}>Oktober</option>
                                    <option value={11}>November</option>
                                    <option value={12}>Desember</option>
                                </select>
                            </div>

                            {/* Kab/Ko Filter - Admin Provinsi Only */}
                            {isAdminProvinsi && (
                                <div className="flex-1 min-w-[250px]">
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        <FiMapPin className="inline mr-1" /> Kabupaten/Kota
                                    </label>
                                    <select
                                        value={selectedKabKo}
                                        onChange={(e) => setSelectedKabKo(e.target.value)}
                                        className="form-select w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="semua">Semua Kabupaten/Kota</option>
                                        {kabKoList.map(kab => (
                                            <option key={kab} value={kab}>{kab}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                             {/* View Mode Toggle - Admin Only */}
                            {isAdminProvinsi && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('stats')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'stats'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        <FiPieChart /> Statistik
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        <FiBarChart2 /> Daftar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Overview for Admin Provinsi */}
                    {isAdminProvinsi && viewMode === 'stats' && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <div className="text-3xl font-bold">{totalLaporan}</div>
                                    <div className="text-sm opacity-90">Total Laporan</div>
                                </div>
                                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                    <div className="text-3xl font-bold">{totalDisetujui}</div>
                                    <div className="text-sm opacity-90">Disetujui</div>
                                </div>
                                <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                                    <div className="text-3xl font-bold">{totalPending}</div>
                                    <div className="text-sm opacity-90">Pending</div>
                                </div>
                                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                                    <div className="text-3xl font-bold">{totalDitolak}</div>
                                    <div className="text-sm opacity-90">Ditolak</div>
                                </div>
                            </div>

                            {/* Statistik per Kab/Ko */}
                            <div className="card mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-neutral-800">
                                        <FiPieChart className="inline mr-2" />
                                        Statistik Laporan Harian per Kab/Kota - Tahun {selectedTahun}
                                    </h2>
                                    <button
                                        onClick={handleExportStatsExcel}
                                        className="btn btn-secondary text-sm"
                                        disabled={exporting || kabKoStats.length === 0}
                                    >
                                        {exporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
                                        Export Statistik
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-neutral-100">
                                                <th className="text-left p-3 rounded-tl-lg">Kabupaten/Kota</th>
                                                <th className="text-center p-3">Total Hafiz</th>
                                                <th className="text-center p-3">Sudah Lapor</th>
                                                <th className="text-center p-3">% Lapor</th>
                                                <th className="text-center p-3">Total Laporan</th>
                                                <th className="text-center p-3">Disetujui</th>
                                                <th className="text-center p-3">Pending</th>
                                                <th className="text-center p-3 rounded-tr-lg">Ditolak</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kabKoStats.map((stat, idx) => (
                                                <tr
                                                    key={stat.kabupaten_kota}
                                                    className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-25'
                                                        }`}
                                                >
                                                    <td className="p-3 font-medium">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedKabKo(stat.kabupaten_kota);
                                                                setViewMode('list');
                                                            }}
                                                            className="text-primary-600 hover:text-primary-800 hover:underline text-left"
                                                        >
                                                            {stat.kabupaten_kota}
                                                        </button>
                                                    </td>
                                                    <td className="text-center p-3">{stat.total_hafiz}</td>
                                                    <td className="text-center p-3">{stat.hafiz_sudah_lapor}</td>
                                                    <td className="text-center p-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-24 bg-neutral-200 rounded-full h-2.5">
                                                                <div
                                                                    className={`h-2.5 rounded-full transition-all ${stat.persentase_lapor >= 75 ? 'bg-green-500' :
                                                                        stat.persentase_lapor >= 50 ? 'bg-yellow-500' :
                                                                            stat.persentase_lapor >= 25 ? 'bg-orange-500' :
                                                                                'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${stat.persentase_lapor}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-semibold min-w-[3rem]">{stat.persentase_lapor}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center p-3 font-semibold">{stat.total_laporan}</td>
                                                    <td className="text-center p-3 text-green-600">{stat.laporan_disetujui}</td>
                                                    <td className="text-center p-3 text-yellow-600">{stat.laporan_pending}</td>
                                                    <td className="text-center p-3 text-red-600">{stat.laporan_ditolak}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-neutral-100 font-bold">
                                                <td className="p-3">TOTAL</td>
                                                <td className="text-center p-3">
                                                    {kabKoStats.reduce((a, b) => a + b.total_hafiz, 0)}
                                                </td>
                                                <td className="text-center p-3">
                                                    {kabKoStats.reduce((a, b) => a + b.hafiz_sudah_lapor, 0)}
                                                </td>
                                                <td className="text-center p-3">
                                                    {kabKoStats.reduce((a, b) => a + b.total_hafiz, 0) > 0
                                                        ? Math.round((kabKoStats.reduce((a, b) => a + b.hafiz_sudah_lapor, 0) /
                                                            kabKoStats.reduce((a, b) => a + b.total_hafiz, 0)) * 100)
                                                        : 0}%
                                                </td>
                                                <td className="text-center p-3">
                                                    {kabKoStats.reduce((a, b) => a + b.total_laporan, 0)}
                                                </td>
                                                <td className="text-center p-3 text-green-600">
                                                    {kabKoStats.reduce((a, b) => a + b.laporan_disetujui, 0)}
                                                </td>
                                                <td className="text-center p-3 text-yellow-600">
                                                    {kabKoStats.reduce((a, b) => a + b.laporan_pending, 0)}
                                                </td>
                                                <td className="text-center p-3 text-red-600">
                                                    {kabKoStats.reduce((a, b) => a + b.laporan_ditolak, 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Status Filters */}
                    {(viewMode === 'list' || !isAdminProvinsi) && (
                        <div className="card mb-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <FiFilter className="text-neutral-500" />
                                    <span className="font-semibold text-neutral-700">Filter Status:</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => setFilter('semua')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'semua'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        Semua ({totalLaporan})
                                    </button>
                                    <button
                                        onClick={() => setFilter('pending')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'pending'
                                            ? 'bg-accent-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        Pending ({totalPending})
                                    </button>
                                    <button
                                        onClick={() => setFilter('disetujui')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'disetujui'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        Disetujui ({totalDisetujui})
                                    </button>
                                    <button
                                        onClick={() => setFilter('ditolak')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ditolak'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        Ditolak ({totalDitolak})
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Laporan List */}
                    {(viewMode === 'list' || !isAdminProvinsi) && (
                        <div className="grid gap-6">
                            {refreshing ? (
                                <div className="card text-center py-12">
                                    <FiLoader className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
                                    <p className="text-neutral-600">Memuat data...</p>
                                </div>
                            ) : laporanList.length === 0 ? (
                                <div className="card text-center py-12">
                                    <FiBarChart2 className="text-4xl text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600">Belum ada data laporan{selectedKabKo !== 'semua' ? ` untuk ${selectedKabKo}` : ''} di tahun {selectedTahun}</p>
                                </div>
                            ) : (
                                laporanList.map((laporan) => (
                                    <LaporanCard
                                        key={laporan.id}
                                        laporan={laporan}
                                        isHafiz={isHafiz}
                                        userRole={user.role}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onEdit={handleEdit}
                                        onView={(l) => setLaporanToView(l)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </>

                {/* Add/Edit Laporan Modal */}
                {showModal && (
                    <AddLaporanModal
                        onClose={() => setShowModal(false)}
                        hafizId={hafizId ? String(hafizId) : undefined}
                        onSuccess={() => fetchLaporanData()}
                        laporanToEdit={laporanToEdit}
                    />
                )}

                {/* Detail Laporan Modal */}
                {laporanToView && (
                    <DetailLaporanModal
                        laporan={laporanToView}
                        onClose={() => setLaporanToView(null)}
                    />
                )}
            </main>
        </div>
    );
}

interface LaporanCardProps {
    laporan: LaporanData;
    isHafiz: boolean;
    userRole: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    onEdit?: (laporan: LaporanData) => void;
    onView?: (laporan: LaporanData) => void;
}

function LaporanCard({ laporan, isHafiz, userRole, onApprove, onReject, onEdit, onView }: LaporanCardProps) {
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
                    {laporan.foto_url ? (
                        <img
                            src={laporan.foto_url}
                            alt="Foto Kegiatan"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(laporan.foto_url, '_blank')}
                            title="Klik untuk melihat gambar penuh"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            📷 Foto Kegiatan
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="badge badge-info">
                                    {jenisKegiatanLabel[laporan.jenis_kegiatan as keyof typeof jenisKegiatanLabel]}
                                </span>
                                <span className={`badge ${status.badge} flex items-center gap-1`}>
                                    {status.icon}
                                    {status.text}
                                </span>
                            </div>
                            {/* Show Hafiz name for admin */}
                            {(userRole === 'admin_provinsi' || userRole === 'admin_kabko') && laporan.hafiz && (
                                <div className="text-sm text-neutral-600 mb-1">
                                    <span className="font-semibold">👤 {laporan.hafiz.nama}</span>
                                    <span className="mx-2">|</span>
                                    <span>{laporan.hafiz.kabupaten_kota}</span>
                                </div>
                            )}
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
                                {laporan.jam && <span className="ml-2">🕐 {laporan.jam} WIB</span>}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <p className="text-neutral-700">
                            <span className="font-semibold">📍 Lokasi:</span> {laporan.lokasi || '-'}
                        </p>
                    </div>

                    {laporan.catatan_verifikasi && (
                        <div className="alert alert-warning mb-4">
                            <span className="font-semibold">Catatan:</span> {laporan.catatan_verifikasi}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            className="btn btn-secondary text-sm"
                            onClick={() => onView?.(laporan)}
                        >
                            <FiEye />
                            Detail
                        </button>
                        {isHafiz && (laporan.status_verifikasi === 'pending' || laporan.status_verifikasi === 'ditolak') && (
                            <>
                                <button
                                    className="btn btn-secondary text-sm"
                                    onClick={() => onEdit?.(laporan)}
                                >
                                    <FiEdit />
                                    Edit
                                </button>
                                {laporan.status_verifikasi === 'pending' && (
                                    <button className="btn btn-danger text-sm">
                                        <FiTrash2 />
                                        Hapus
                                    </button>
                                )}
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

function AddLaporanModal({ onClose, hafizId, onSuccess, laporanToEdit }: { onClose: () => void, hafizId?: string, onSuccess?: () => void, laporanToEdit?: LaporanData }) {
    const [formData, setFormData] = useState({
        tanggal: laporanToEdit ? laporanToEdit.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
        jam: laporanToEdit?.jam || '',
        jenis_kegiatan: laporanToEdit?.jenis_kegiatan || 'mengajar',
        deskripsi: laporanToEdit?.deskripsi || '',
        lokasi: laporanToEdit?.lokasi || ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(laporanToEdit?.foto_url || null);
    const [compressing, setCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hafizId && !laporanToEdit) {
            setError('Profil Hafiz Anda belum terhubung dengan akun ini.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            let foto_url = laporanToEdit?.foto_url || null;

            // Upload photo if exists using local API
            if (photoFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', photoFile);
                uploadFormData.append('type', 'activity-photos');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                const uploadResult = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    console.error('Upload error:', uploadResult.error);
                } else {
                    foto_url = uploadResult.url;
                }
            }

            const url = laporanToEdit ? `/api/laporan/${laporanToEdit.id}` : '/api/laporan';
            const method = laporanToEdit ? 'PUT' : 'POST';

            const body: any = {
                tanggal: formData.tanggal,
                jam: formData.jam || null,
                jenis_kegiatan: formData.jenis_kegiatan,
                deskripsi: formData.deskripsi,
                lokasi: formData.lokasi,
                foto_url: foto_url,
                status_verifikasi: 'pending' // Reset status to pending on edit
            };

            if (!laporanToEdit) {
                body.hafiz_id = hafizId;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Save error:', result.error);
                setError('Gagal menyimpan laporan: ' + result.error);
                return;
            }

            alert('✅ Laporan berhasil disimpan!');
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            console.error('Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Terjadi kesalahan: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-bold text-neutral-800">{laporanToEdit ? 'Edit Laporan' : 'Tambah Laporan Harian'}</h2>
                </div>

                {error && (
                    <div className="mx-6 mt-4 alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Photo Upload Section - Moved to Top */}
                    <div className="form-group">
                        <label className="form-label">Foto Kegiatan</label>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex gap-3 items-start">
                            <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Penting:</p>
                                <p>Pastikan foto yang diupload memiliki data lokasi (GPS). Gunakan aplikasi kamera seperti <strong>Open Camera</strong> atau <strong>Timestamp Camera</strong> dan aktifkan fitur GPS/Lokasi agar lokasi terisi otomatis.</p>
                            </div>
                        </div>

                        {/* Photo Preview */}
                        {photoPreview && (
                            <div className="relative bg-neutral-100 rounded-lg overflow-hidden mb-3">
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full max-h-48 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhotoFile(null);
                                        setPhotoPreview(null);
                                        setCompressionInfo(null);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        )}

                        {/* Upload Button */}
                        {!photoPreview && (
                            <label className={`w-full border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer block ${compressing ? 'opacity-50 cursor-wait' : ''}`}>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    disabled={compressing}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Read EXIF data
                                        EXIF.getData(file as any, function (this: any) {
                                            const lat = EXIF.getTag(this, 'GPSLatitude');
                                            const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                                            const lon = EXIF.getTag(this, 'GPSLongitude');
                                            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
                                            const dateTime = EXIF.getTag(this, 'DateTimeOriginal') || EXIF.getTag(this, 'DateTime');

                                            if (!lat || !lon) {
                                                alert('Foto wajib memiliki geotag (lokasi GPS). Mohon aktifkan GPS saat mengambil foto.');
                                                setPhotoFile(null);
                                                setPhotoPreview(null);
                                                setCompressionInfo(null);
                                                return;
                                            }

                                            // Convert GPS to decimal
                                            const convertDMSToDD = (dms: number[], ref: string) => {
                                                let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
                                                if (ref === 'S' || ref === 'W') {
                                                    dd = dd * -1;
                                                }
                                                return dd;
                                            };

                                            const latitude = convertDMSToDD(lat, latRef);
                                            const longitude = convertDMSToDD(lon, lonRef);

                                            // Set location
                                            setFormData(prev => ({
                                                ...prev,
                                                lokasi: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                                            }));

                                            // Set date and time if available
                                            if (dateTime) {
                                                // Format: "2023:10:25 14:30:00"
                                                const [datePart, timePart] = dateTime.split(' ');
                                                const [year, month, day] = datePart.split(':');
                                                const [hour, minute] = timePart.split(':');

                                                setFormData(prev => ({
                                                    ...prev,
                                                    tanggal: `${year}-${month}-${day}`,
                                                    jam: `${hour}:${minute}`
                                                }));
                                            }
                                        });

                                        const maxSizeKB = 500;
                                        const maxSizeBytes = maxSizeKB * 1024;

                                        // If file is already under limit, use it directly
                                        if (file.size <= maxSizeBytes) {
                                            setPhotoFile(file);
                                            setPhotoPreview(URL.createObjectURL(file));
                                            setCompressionInfo(null);
                                            return;
                                        }

                                        // Compress the image
                                        setCompressing(true);
                                        try {
                                            const compressedFile = await compressImage(file, { maxSizeKB });
                                            setPhotoFile(compressedFile);
                                            setPhotoPreview(URL.createObjectURL(compressedFile));
                                            setCompressionInfo({
                                                original: file.size,
                                                compressed: compressedFile.size
                                            });
                                        } catch (err) {
                                            console.error('Compression error:', err);
                                            alert('Gagal mengkompres gambar. Silakan coba file lain.');
                                        } finally {
                                            setCompressing(false);
                                        }
                                    }}
                                />
                                {compressing ? (
                                    <div className="flex flex-col items-center gap-2 text-primary-600">
                                        <FiLoader className="animate-spin" size={32} />
                                        <span className="text-sm font-medium">Mengkompres gambar...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                                        <FiImage size={32} />
                                        <span className="text-sm font-medium">
                                            Klik untuk upload foto
                                        </span>
                                    </div>
                                )}
                            </label>
                        )}

                        {/* Compression Info */}
                        {compressionInfo && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg mt-2">
                                <FiCheckCircle />
                                <span>
                                    Dikompres dari {formatFileSize(compressionInfo.original)} → {formatFileSize(compressionInfo.compressed)}
                                </span>
                            </div>
                        )}

                        <span className="form-help">Upload foto kegiatan (opsional). Maks 500KB - file lebih besar akan dikompres otomatis.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label required">Tanggal</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.tanggal}
                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                min={(() => {
                                    const now = new Date();
                                    const currentDay = now.getDate();
                                    // If today is <= 15, allow back to 1st of previous month
                                    // If today > 15, allow back to 1st of current month
                                    const minDate = new Date(now);
                                    if (currentDay <= 15) {
                                        minDate.setMonth(minDate.getMonth() - 1);
                                    }
                                    minDate.setDate(1);
                                    return minDate.toISOString().split('T')[0];
                                })()}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Batas entri laporan bulan lalu adalah tanggal 15 bulan ini.
                            </p>
                        </div>
                        <div className="form-group">
                            <label className="form-label required">Jam</label>
                            <input
                                type="time"
                                className="form-input"
                                value={formData.jam}
                                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                                required
                            />
                            <span className="form-help">Jam kegiatan dilakukan</span>
                        </div>
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

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : (laporanToEdit ? 'Update Laporan' : 'Simpan Laporan')}
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

function DetailLaporanModal({ laporan, onClose }: { laporan: LaporanData, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-neutral-800">Detail Laporan</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {laporan.foto_url && (
                        <div className="rounded-lg overflow-hidden">
                            <img src={laporan.foto_url} alt="Foto Kegiatan" className="w-full h-auto" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-neutral-700">Deskripsi</h3>
                        <p className="text-neutral-600">{laporan.deskripsi}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-neutral-700">Tanggal</h3>
                            <p className="text-neutral-600">{new Date(laporan.tanggal).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-700">Jam</h3>
                            <p className="text-neutral-600">{laporan.jam || '-'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-700">Jenis Kegiatan</h3>
                            <p className="text-neutral-600 capitalize">{laporan.jenis_kegiatan}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-700">Lokasi</h3>
                            <p className="text-neutral-600">{laporan.lokasi || '-'}</p>
                        </div>
                    </div>
                    {laporan.catatan_verifikasi && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800">Catatan Verifikasi</h3>
                            <p className="text-yellow-700">{laporan.catatan_verifikasi}</p>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-neutral-200 flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">Tutup</button>
                </div>
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
