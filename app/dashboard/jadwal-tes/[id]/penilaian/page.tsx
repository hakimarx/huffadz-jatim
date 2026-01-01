'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiArrowLeft, FiEdit2, FiSave, FiX } from 'react-icons/fi';

interface Participant {
    hafiz_id: string;
    nik: string;
    nama: string;
    kabupaten_kota: string;
    nilai_tahfidz: number | null;
    nilai_wawasan: number | null;
    status_kelulusan: string;
    hadir: boolean;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function PenilaianContent() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [user, setUser] = useState<UserData | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Grading Modal
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [gradeForm, setGradeForm] = useState({ nilai_tahfidz: '', nilai_wawasan: '' });
    const [saving, setSaving] = useState(false);

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
                const res = await fetch(`/api/jadwal/${id}/penilaian`);
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

    const openGradeModal = (p: Participant) => {
        setSelectedParticipant(p);
        setGradeForm({
            nilai_tahfidz: p.nilai_tahfidz?.toString() || '',
            nilai_wawasan: p.nilai_wawasan?.toString() || ''
        });
    };

    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParticipant) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/jadwal/${id}/penilaian`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hafiz_id: selectedParticipant.hafiz_id,
                    nilai_tahfidz: gradeForm.nilai_tahfidz,
                    nilai_wawasan: gradeForm.nilai_wawasan
                })
            });

            if (!res.ok) throw new Error('Gagal menyimpan nilai');

            // Update local state
            setParticipants(prev => prev.map(p =>
                p.hafiz_id === selectedParticipant.hafiz_id
                    ? {
                        ...p,
                        nilai_tahfidz: parseFloat(gradeForm.nilai_tahfidz) || 0,
                        nilai_wawasan: parseFloat(gradeForm.nilai_wawasan) || 0
                    }
                    : p
            ));

            setSelectedParticipant(null);
            alert('✅ Nilai berhasil disimpan');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredList = participants.filter(p =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nik.includes(searchQuery)
    );

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

                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">Input Penilaian</h1>
                    <p className="text-neutral-600">
                        Masukkan nilai Tahfidz dan Wawasan Kebangsaan
                    </p>
                </div>

                {/* Search */}
                <div className="card mb-6">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Cari Nama atau NIK..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Nama</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Kehadiran</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Nilai Tahfidz</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Nilai Wawasan</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredList.map((p, index) => (
                                    <tr key={p.hafiz_id}>
                                        <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                                            {p.nama}
                                            <div className="text-xs text-neutral-500 font-mono">{p.nik}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.hadir ? (
                                                <span className="badge badge-success">Hadir</span>
                                            ) : (
                                                <span className="badge badge-neutral">Belum</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-primary-700">
                                            {p.nilai_tahfidz ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-secondary-700">
                                            {p.nilai_wawasan ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openGradeModal(p)}
                                                className="btn btn-sm btn-secondary"
                                                disabled={!p.hadir} // Disable if not present? Maybe allow override
                                                title={!p.hadir ? 'Peserta belum absen' : 'Input Nilai'}
                                            >
                                                <FiEdit2 /> Input Nilai
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grading Modal */}
                {selectedParticipant && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-neutral-800">Input Nilai</h2>
                                <button onClick={() => setSelectedParticipant(null)} className="text-neutral-500 hover:text-neutral-800">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedParticipant.nama}</h3>
                                    <p className="text-neutral-500 text-sm">{selectedParticipant.nik}</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Nilai Tahfidz (0-100)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={gradeForm.nilai_tahfidz}
                                        onChange={e => setGradeForm({ ...gradeForm, nilai_tahfidz: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Nilai Wawasan Kebangsaan (0-100)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={gradeForm.nilai_wawasan}
                                        onChange={e => setGradeForm({ ...gradeForm, nilai_wawasan: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedParticipant(null)}
                                        className="btn btn-secondary"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function PenilaianPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <PenilaianContent />
        </Suspense>
    );
}
