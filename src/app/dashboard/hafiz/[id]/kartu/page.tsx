'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPrinter, FiArrowLeft, FiUser, FiGlobe, FiLock } from 'react-icons/fi';
import { PageLoader } from '@/components/LoadingSpinner';

export default function KartuAkunPage() {
    const params = useParams();
    const router = useRouter();
    const [hafiz, setHafiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/hafiz/${params.id}`);
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Gagal memuat data');
                setHafiz(result.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <PageLoader />;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    // Password default: 6 digit terakhir NIK (sesuai logika di API)
    const tempPassword = hafiz.nik.slice(-6);

    return (
        <div className="min-h-screen bg-neutral-100 p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        <FiArrowLeft /> Kembali
                    </button>
                    <button
                        onClick={handlePrint}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FiPrinter /> Cetak Kartu
                    </button>
                </div>

                {/* Kartu Akun */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-200 print:shadow-none print:border-neutral-300 print:rounded-none">
                    <div className="bg-primary-600 p-6 text-white flex items-center gap-4 border-b border-primary-700">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                            <img src="/logo-lptq.png" alt="LPTQ Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">KARTU AKUN HUFFADZ</h1>
                            <p className="text-primary-100 text-sm">LPTQ Provinsi Jawa Timur</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="text-center space-y-2 pb-6 border-b border-dashed border-neutral-200">
                            <h2 className="text-2xl font-bold text-neutral-800 uppercase">{hafiz.nama}</h2>
                            <p className="text-neutral-500 font-mono tracking-widest">{hafiz.nik}</p>
                            <div className="inline-block mt-2 px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full font-semibold uppercase">
                                {hafiz.kabupaten_kota}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Akses Login</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FiGlobe className="mt-1 text-primary-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500">Website</p>
                                            <p className="text-sm font-medium text-neutral-800 break-all">
                                                {typeof window !== 'undefined' ? window.location.hostname : 'hafizjatim.my.id'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiUser className="mt-1 text-primary-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500">Username (Email/NIK)</p>
                                            <p className="text-sm font-medium text-neutral-800">{hafiz.email || hafiz.nik}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiLock className="mt-1 text-primary-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500">Password Sementara</p>
                                            <p className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{tempPassword}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Langkah Selanjutnya</h3>
                                <ul className="text-xs text-neutral-600 space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Buka website di browser HP atau Laptop</li>
                                    <li>Masukkan Username dan Password di atas</li>
                                    <li>Lengkapi biodata dan upload foto profil</li>
                                    <li>Ubah password Anda segera demi keamanan</li>
                                    <li>Gunakan menu Laporan untuk input kegiatan harian</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 text-center text-[10px] text-neutral-400 border-t border-neutral-100">
                            Kartu ini dicetak otomatis dari Sistem Pendataan Huffadz Jatim.<br />
                            Dicetak pada: {new Date().toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 print:hidden">
                    <div className="text-orange-500 font-bold text-xl">!</div>
                    <p className="text-sm text-orange-700 leading-relaxed">
                        <strong>Penting:</strong> Simpan kartu ini baik-baik. Password di atas adalah password default.
                        Segera minta Hafiz untuk mengganti password setelah berhasil login pertama kali.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A5 landscape;
                        margin: 0;
                    }
                    body {
                        background: white;
                    }
                    .btn, .sidebar, nav, button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
