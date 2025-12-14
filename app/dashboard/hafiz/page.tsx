'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
    FiEye
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

function DataHafizContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'admin_provinsi';

    const [hafizData, setHafizData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    const userData = {
        role: role,
        nama: role === 'admin_provinsi' ? 'Admin Provinsi' : 'Admin Kab/Ko',
        email: `${role}@lptq.jatimprov.go.id`,
        kabupaten_kota: role === 'admin_kabko' ? 'Kota Surabaya' : ''
    };

    // Fetch data from Supabase
    const fetchHafizData = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            let query = supabase
                .from('hafiz')
                .select('*', { count: 'exact' });

            // Filter by kabupaten for admin_kabko
            if (role === 'admin_kabko' && userData.kabupaten_kota) {
                query = query.eq('kabupaten_kota', userData.kabupaten_kota);
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
        fetchHafizData();
    }, [searchQuery, filterStatus, currentPage, role]);

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

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar
                userRole={userData.role}
                userName={userData.nama}
            />

            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                                Data Hafiz {role === 'admin_kabko' && `- ${userData.kabupaten_kota}`}
                            </h1>
                            <p className="text-neutral-600">
                                Kelola data Huffadz dan status insentif
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
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {hafizData.map((hafiz, index) => (
                                            <tr key={hafiz.id} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-neutral-800">
                                                    {hafiz.nik}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/hafiz/${hafiz.id}`)}
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
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${hafiz.status_insentif === 'aktif'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {hafiz.status_insentif === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/hafiz/${hafiz.id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/dashboard/hafiz/${hafiz.id}/edit`)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit size={16} />
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
