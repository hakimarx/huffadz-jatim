'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiArrowLeft, FiCalendar, FiMapPin, FiClock, FiUsers, FiCheckSquare, FiAward } from 'react-icons/fi';

interface JadwalTes {
    id: number;
    periode_tes_id: number;
    nama_periode: string;
    tahun: number;
    kabupaten_kota: string;
    tanggal_tes: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    alamat_lengkap?: string;
    kapasitas: number;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DetailJadwalContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [jadwal, setJadwal] = useState<JadwalTes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch User
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();
                if (!sessionRes.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }
                setUser(sessionData.user);

                // Fetch Jadwal Detail
                if (id) {
                    const res = await fetch(`/api/jadwal/${id}`);
                    const data = await res.json();
                    if (data.data) setJadwal(data.data);
                }
            } catch (err) {
                console.error('Error fetching detail:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) return <PageLoader />;
    if (!user || !jadwal) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" /> Kembali ke Daftar Jadwal
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-neutral-800">{jadwal.kabupaten_kota}</h1>
                                <span className="badge badge-info">{jadwal.nama_periode}</span>
                            </div>
                            <p className="text-neutral-600">
                                Detail pelaksanaan tes hafalan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-blue-50 border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <FiCalendar className="text-blue-600" size={20} />
                            <span className="text-sm font-semibold text-blue-800">Tanggal</span>
                        </div>
                        <p className="text-lg font-bold text-neutral-800">
                            {new Date(jadwal.tanggal_tes).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="card bg-purple-50 border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                            <FiClock className="text-purple-600" size={20} />
                            <span className="text-sm font-semibold text-purple-800">Waktu</span>
                        </div>
                        <p className="text-lg font-bold text-neutral-800">
                            {jadwal.waktu_mulai.slice(0, 5)} - {jadwal.waktu_selesai.slice(0, 5)} WIB
                        </p>
                    </div>

                    <div className="card bg-green-50 border-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <FiMapPin className="text-green-600" size={20} />
                            <span className="text-sm font-semibold text-green-800">Lokasi</span>
                        </div>
                        <p className="text-lg font-bold text-neutral-800 truncate" title={jadwal.lokasi}>
                            {jadwal.lokasi}
                        </p>
                    </div>

                    <div className="card bg-orange-50 border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <FiUsers className="text-orange-600" size={20} />
                            <span className="text-sm font-semibold text-orange-800">Kapasitas</span>
                        </div>
                        <p className="text-lg font-bold text-neutral-800">
                            {jadwal.kapasitas} Peserta
                        </p>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div
                        onClick={() => router.push(`/dashboard/jadwal-tes/${id}/absensi`)}
                        className="card hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary-100 text-primary-600 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <FiCheckSquare size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-800 mb-1">Absensi Peserta</h3>
                                <p className="text-neutral-600">Scan QR Code atau input manual kehadiran peserta</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push(`/dashboard/jadwal-tes/${id}/penilaian`)}
                        className="card hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-secondary-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-secondary-100 text-secondary-600 rounded-full group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                                <FiAward size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-800 mb-1">Input Penilaian</h3>
                                <p className="text-neutral-600">Input nilai tahfidz dan wawasan kebangsaan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alamat Detail */}
                {jadwal.alamat_lengkap && (
                    <div className="card mt-8">
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">Alamat Lengkap</h3>
                        <p className="text-neutral-600">{jadwal.alamat_lengkap}</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function DetailJadwalPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DetailJadwalContent />
        </Suspense>
    );
}
