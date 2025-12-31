'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiCamera, FiSearch } from 'react-icons/fi';
import QRScanner from '@/components/QRScanner';

interface Participant {
    hafiz_id: string;
    nik: string;
    nama: string;
    kabupaten_kota: string;
    foto_profil?: string;
    hadir: boolean;
    waktu_absen?: string;
    catatan?: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function AbsensiContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean, message: string } | null>(null);

    const fetchData = async () => {
        try {
            // Fetch User
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            if (!sessionRes.ok || !sessionData.user) {
                window.location.href = '/login';
                return;
            }
            setUser(sessionData.user);

            // Fetch Participants
            if (id) {
                const res = await fetch(`/api/jadwal/${id}/absensi`);
                const data = await res.json();
                if (data.data) setParticipants(data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCheckIn = async (hafizId: string, nik?: string) => {
        try {
            const res = await fetch(`/api/jadwal/${id}/absensi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hafiz_id: hafizId, nik })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Gagal melakukan absensi');
            }

            // Update local state
            setParticipants(prev => prev.map(p =>
                p.hafiz_id === hafizId || p.nik === nik
                    ? { ...p, hadir: true, waktu_absen: new Date().toISOString() }
                    : p
            ));

            return { success: true, message: `✅ Berhasil check-in` };
        } catch (err: any) {
            return { success: false, message: `❌ Gagal: ${err.message}` };
        }
    };

    const handleScan = async (decodedText: string) => {
        // Assume QR contains NIK or ID
        // Format could be just NIK, or JSON
        let nik = decodedText;

        // Try to parse if JSON
        try {
            const obj = JSON.parse(decodedText);
            if (obj.nik) nik = obj.nik;
        } catch (e) {
            // Not JSON, assume raw string
        }

        const result = await handleCheckIn('', nik);
        setScanResult(result);

        // Auto hide result after 3s
        setTimeout(() => setScanResult(null), 3000);
    };

    const filteredList = participants.filter(p =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nik.includes(searchQuery)
    );

    const stats = {
        total: participants.length,
        hadir: participants.filter(p => p.hadir).length,
        belum: participants.filter(p => !p.hadir).length
    };

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" /> Kembali ke Detail Jadwal
                    </button>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Absensi Peserta</h1>
                            <p className="text-neutral-600">
                                Total: {stats.total} | Hadir: {stats.hadir} | Belum: {stats.belum}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowScanner(true)}
                            className="btn btn-primary"
                        >
                            <FiCamera className="mr-2" /> Scan QR Code
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="card mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Cari Nama atau NIK..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">NIK</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nama</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Waktu Absen</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredList.map((p, index) => (
                                    <tr key={p.hafiz_id} className={p.hadir ? 'bg-green-50' : ''}>
                                        <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-neutral-800">{p.nik}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-800">{p.nama}</td>
                                        <td className="px-4 py-3 text-center">
                                            {p.hadir ? (
                                                <span className="badge badge-success">Hadir</span>
                                            ) : (
                                                <span className="badge badge-neutral">Belum</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {p.waktu_absen ? new Date(p.waktu_absen).toLocaleTimeString('id-ID') : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!p.hadir && (
                                                <button
                                                    onClick={() => handleCheckIn(p.hafiz_id)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Check-in
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Scanner Modal */}
                {showScanner && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
                            <button
                                onClick={() => setShowScanner(false)}
                                className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800"
                            >
                                <FiXCircle size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-center mb-6">Scan QR Code</h2>

                            <QRScanner onScan={handleScan} />

                            {scanResult && (
                                <div className={`mt-4 p-4 rounded text-center font-bold ${scanResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {scanResult.message}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AbsensiPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <AbsensiContent />
        </Suspense>
    );
}
