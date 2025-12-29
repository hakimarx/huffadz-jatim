'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import * as XLSX from 'xlsx';
import {
    FiFilter,
    FiPrinter,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiSearch
} from 'react-icons/fi';

// Import data dari file JSON eksternal
import kabupatenKotaData from '@/data/kabupaten-kota.json';
import bulanData from '@/data/bulan.json';

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
    tanggal: string;
    jam?: string;
    jenis_kegiatan: string;
    deskripsi: string;
    lokasi: string;
    status_verifikasi: string;
    hafiz_nama?: string;
    hafiz_kabupaten_kota?: string;
    hafiz: {
        nama: string;
        kabupaten_kota: string;
    };
}

// List daftar Kabupaten/Kota di Jawa Timur (dari file JSON)
const KABUPATEN_KOTA_LIST: string[] = kabupatenKotaData;

// Daftar bulan (dari file JSON)
const BULAN_LIST: { value: number; label: string }[] = bulanData;

function CetakLaporanContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [laporanList, setLaporanList] = useState<LaporanData[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Filter states
    const [selectedKabKo, setSelectedKabKo] = useState('');
    const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1);
    const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        disetujui: 0,
        pending: 0,
        ditolak: 0
    });

    // Generate year list (2020 - current year)
    const tahunList = Array.from(
        { length: new Date().getFullYear() - 2019 },
        (_, i) => 2020 + i
    ).reverse();

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }

                const userData = sessionData.user as UserData;

                // Redirect if not admin
                if (userData.role === 'hafiz') {
                    window.location.href = '/dashboard';
                    return;
                }

                setUser(userData);

                // Set default kabko for admin_kabko
                if (userData.role === 'admin_kabko' && userData.kabupaten_kota) {
                    setSelectedKabKo(userData.kabupaten_kota);
                }
            } catch (err) {
                console.error('Error:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    const fetchLaporan = async () => {
        if (!user) return;

        setLoadingData(true);
        try {
            // Build date range for the selected month/year
            const startDate = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-01`;
            const endDate = new Date(selectedTahun, selectedBulan, 0).toISOString().split('T')[0];

            // Build query params
            const params = new URLSearchParams({
                startDate,
                endDate,
                ...(selectedKabKo ? { kabupaten_kota: selectedKabKo } : {})
            });

            const response = await fetch(`/api/laporan?${params}`);
            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching laporan:', result.error);
                return;
            }

            // Transform data to match expected format
            const filteredData = (result.data || []).map((item: any) => ({
                ...item,
                hafiz: {
                    nama: item.hafiz_nama || 'Unknown',
                    kabupaten_kota: item.hafiz_kabupaten_kota || 'Unknown'
                }
            }));

            setLaporanList(filteredData);

            // Calculate stats
            const statsData = {
                total: filteredData.length,
                disetujui: filteredData.filter((l: LaporanData) => l.status_verifikasi === 'disetujui').length,
                pending: filteredData.filter((l: LaporanData) => l.status_verifikasi === 'pending').length,
                ditolak: filteredData.filter((l: LaporanData) => l.status_verifikasi === 'ditolak').length
            };
            setStats(statsData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (laporanList.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        const excelData = laporanList.map((item, index) => ({
            'No': index + 1,
            'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
            'Jam': item.jam || '-',
            'Nama Hafiz': item.hafiz.nama,
            'Kabupaten/Kota': item.hafiz.kabupaten_kota,
            'Jenis Kegiatan': item.jenis_kegiatan,
            'Deskripsi': item.deskripsi,
            'Lokasi': item.lokasi || '-',
            'Status': item.status_verifikasi
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Harian');

        const bulanLabel = BULAN_LIST.find(b => b.value === selectedBulan)?.label || selectedBulan;
        const filename = `Laporan_Harian_${selectedKabKo || 'Semua'}_${bulanLabel}_${selectedTahun}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'disetujui':
                return <span className="badge badge-success flex items-center gap-1"><FiCheckCircle /> Disetujui</span>;
            case 'pending':
                return <span className="badge badge-warning flex items-center gap-1"><FiClock /> Pending</span>;
            case 'ditolak':
                return <span className="badge badge-error flex items-center gap-1"><FiXCircle /> Ditolak</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getJenisLabel = (jenis: string) => {
        const labels: Record<string, string> = {
            mengajar: '👨‍🏫 Mengajar',
            murojah: '📖 Muroja\'ah',
            khataman: '🎓 Khataman',
            lainnya: '📝 Lainnya'
        };
        return labels[jenis] || jenis;
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return null;
    }

    const isAdminProv = user.role === 'admin_provinsi';

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                            Cetak Laporan Harian
                        </h1>
                        <p className="text-neutral-600">
                            Cetak dan export laporan kegiatan Huffadz per Kabupaten/Kota per periode
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6 print:hidden">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-neutral-500" />
                            <span className="font-semibold text-neutral-700">Filter:</span>
                        </div>

                        {/* Kabupaten/Kota Filter */}
                        <div className="form-group mb-0">
                            <label className="form-label text-sm">Kabupaten/Kota</label>
                            <select
                                className="form-select min-w-[200px]"
                                value={selectedKabKo}
                                onChange={(e) => setSelectedKabKo(e.target.value)}
                                disabled={!isAdminProv}
                            >
                                {isAdminProv && <option value="">-- Semua Kab/Ko --</option>}
                                {isAdminProv ? (
                                    KABUPATEN_KOTA_LIST.map((kk) => (
                                        <option key={kk} value={kk}>{kk}</option>
                                    ))
                                ) : (
                                    <option value={user.kabupaten_kota}>{user.kabupaten_kota}</option>
                                )}
                            </select>
                        </div>

                        {/* Bulan Filter */}
                        <div className="form-group mb-0">
                            <label className="form-label text-sm">Bulan</label>
                            <select
                                className="form-select min-w-[150px]"
                                value={selectedBulan}
                                onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
                            >
                                {BULAN_LIST.map((bulan) => (
                                    <option key={bulan.value} value={bulan.value}>{bulan.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tahun Filter */}
                        <div className="form-group mb-0">
                            <label className="form-label text-sm">Tahun</label>
                            <select
                                className="form-select min-w-[100px]"
                                value={selectedTahun}
                                onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
                            >
                                {tahunList.map((tahun) => (
                                    <option key={tahun} value={tahun}>{tahun}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={fetchLaporan}
                            className="btn btn-primary"
                            disabled={loadingData}
                        >
                            <FiSearch />
                            {loadingData ? 'Mencari...' : 'Tampilkan'}
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                {laporanList.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <p className="text-sm opacity-80">Total Laporan</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <p className="text-sm opacity-80">Disetujui</p>
                            <p className="text-3xl font-bold">{stats.disetujui}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                            <p className="text-sm opacity-80">Pending</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                            <p className="text-sm opacity-80">Ditolak</p>
                            <p className="text-3xl font-bold">{stats.ditolak}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {laporanList.length > 0 && (
                    <div className="flex gap-3 mb-6 print:hidden">
                        <button onClick={handlePrint} className="btn btn-secondary">
                            <FiPrinter />
                            Cetak PDF
                        </button>
                        <button onClick={handleExportExcel} className="btn btn-secondary">
                            <FiDownload />
                            Export Excel
                        </button>
                    </div>
                )}

                {/* Print Header (only visible when printing) */}
                <div className="hidden print:block mb-6">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        LAPORAN KEGIATAN HARIAN HUFFADZ
                    </h1>
                    <p className="text-center text-sm">
                        {selectedKabKo || 'Semua Kab/Ko'} - {BULAN_LIST.find(b => b.value === selectedBulan)?.label} {selectedTahun}
                    </p>
                    <p className="text-center text-xs text-neutral-500 mt-1">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </p>
                </div>

                {/* Data Table */}
                {loadingData ? (
                    <div className="card text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-neutral-600">Memuat data laporan...</p>
                    </div>
                ) : laporanList.length > 0 ? (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">No</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Jam</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Nama Hafiz</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Kab/Ko</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Kegiatan</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Deskripsi</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Lokasi</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 print:hidden">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {laporanList.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-neutral-600">{index + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600">{item.jam || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-neutral-800">{item.hafiz.nama}</td>
                                            <td className="px-4 py-3 text-neutral-600">{item.hafiz.kabupaten_kota}</td>
                                            <td className="px-4 py-3 text-neutral-600">{getJenisLabel(item.jenis_kegiatan)}</td>
                                            <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate" title={item.deskripsi}>
                                                {item.deskripsi}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600">{item.lokasi || '-'}</td>
                                            <td className="px-4 py-3 print:hidden">{getStatusBadge(item.status_verifikasi)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <p className="text-neutral-500 mb-2">
                            Klik tombol "Tampilkan" untuk menampilkan data laporan
                        </p>
                        <p className="text-sm text-neutral-400">
                            Pilih filter Kabupaten/Kota, Bulan, dan Tahun terlebih dahulu
                        </p>
                    </div>
                )}

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-sm">
                    <div className="flex justify-between border-t pt-4">
                        <div>
                            <p>Total Laporan: {stats.total}</p>
                            <p>Disetujui: {stats.disetujui} | Pending: {stats.pending} | Ditolak: {stats.ditolak}</p>
                        </div>
                        <div className="text-right">
                            <p className="mb-12">Mengetahui,</p>
                            <p className="font-bold">_________________________</p>
                            <p>Admin {selectedKabKo || 'Provinsi'}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CetakLaporanPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <CetakLaporanContent />
        </Suspense>
    );
}
