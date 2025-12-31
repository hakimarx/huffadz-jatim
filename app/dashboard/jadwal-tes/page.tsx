'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiPlus, FiCalendar, FiMapPin, FiClock, FiUsers, FiTrash2, FiEdit, FiEye } from 'react-icons/fi';

interface JadwalTes {
    id: number;
    periode_tes_id: number;
    nama_periode: string;
    kabupaten_kota: string;
    tanggal_tes: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    alamat_lengkap?: string;
    kapasitas: number;
}

interface PeriodeTes {
    id: number;
    nama_periode: string;
    status: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function JadwalTesContent() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [jadwalList, setJadwalList] = useState<JadwalTes[]>([]);
    const [periodeList, setPeriodeList] = useState<PeriodeTes[]>([]);
    const [selectedPeriode, setSelectedPeriode] = useState<string>('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        periode_tes_id: '',
        kabupaten_kota: '',
        tanggal_tes: '',
        waktu_mulai: '08:00',
        waktu_selesai: '16:00',
        lokasi: '',
        alamat_lengkap: '',
        kapasitas: 100
    });

    const kabupatenKotaList = [
        'Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Blitar', 'Kota Mojokerto',
        'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu',
        'Kabupaten Gresik', 'Kabupaten Sidoarjo', 'Kabupaten Mojokerto', 'Kabupaten Jombang',
        'Kabupaten Bojonegoro', 'Kabupaten Tuban', 'Kabupaten Lamongan', 'Kabupaten Madiun',
        'Kabupaten Magetan', 'Kabupaten Ngawi', 'Kabupaten Ponorogo', 'Kabupaten Pacitan',
        'Kabupaten Kediri', 'Kabupaten Nganjuk', 'Kabupaten Blitar', 'Kabupaten Tulungagung',
        'Kabupaten Trenggalek', 'Kabupaten Malang', 'Kabupaten Pasuruan', 'Kabupaten Probolinggo',
        'Kabupaten Lumajang', 'Kabupaten Jember', 'Kabupaten Bondowoso', 'Kabupaten Situbondo',
        'Kabupaten Banyuwangi', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep',
        'Kabupaten Bangkalan'
    ];

    useEffect(() => {
        async function initData() {
            try {
                // Fetch User
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();
                if (!sessionRes.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }
                setUser(sessionData.user);

                // Fetch Periode
                const periodeRes = await fetch('/api/periode');
                const periodeData = await periodeRes.json();
                if (periodeData.data) {
                    setPeriodeList(periodeData.data);
                    // Default select active periode if any
                    const active = periodeData.data.find((p: any) => p.status === 'tes' || p.status === 'pendaftaran');
                    if (active) setSelectedPeriode(String(active.id));
                }

                // Fetch Jadwal
                fetchJadwal(active ? String(active.id) : '');

            } catch (err) {
                console.error('Init error:', err);
            } finally {
                setLoading(false);
            }
        }
        initData();
    }, []);

    const fetchJadwal = async (periodeId: string) => {
        try {
            let url = '/api/jadwal';
            if (periodeId) url += `?periode_id=${periodeId}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.data) setJadwalList(data.data);
        } catch (err) {
            console.error('Fetch jadwal error:', err);
        }
    };

    useEffect(() => {
        if (selectedPeriode) {
            fetchJadwal(selectedPeriode);
        }
    }, [selectedPeriode]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/jadwal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Gagal membuat jadwal');

            alert('✅ Jadwal berhasil dibuat');
            setShowModal(false);
            fetchJadwal(selectedPeriode);

            // Reset form
            setFormData({
                periode_tes_id: '',
                kabupaten_kota: '',
                tanggal_tes: '',
                waktu_mulai: '08:00',
                waktu_selesai: '16:00',
                lokasi: '',
                alamat_lengkap: '',
                kapasitas: 100
            });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus jadwal ini?')) return;
        try {
            const res = await fetch(`/api/jadwal/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus');
            fetchJadwal(selectedPeriode);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Jadwal Tes</h1>
                        <p className="text-neutral-600">Kelola jadwal dan lokasi tes hafalan</p>
                    </div>

                    {user.role === 'admin_provinsi' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary"
                        >
                            <FiPlus /> Buat Jadwal Baru
                        </button>
                    )}
                </div>

                {/* Filter Periode */}
                <div className="card mb-6">
                    <div className="form-group mb-0">
                        <label className="form-label">Pilih Periode Tes</label>
                        <select
                            className="form-select"
                            value={selectedPeriode}
                            onChange={(e) => setSelectedPeriode(e.target.value)}
                        >
                            <option value="">-- Semua Periode --</option>
                            {periodeList.map(p => (
                                <option key={p.id} value={p.id}>{p.nama_periode} ({p.status})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Jadwal List */}
                <div className="grid gap-6">
                    {jadwalList.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            Belum ada jadwal tes untuk periode ini.
                        </div>
                    ) : (
                        jadwalList.map(jadwal => (
                            <div key={jadwal.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-neutral-800">{jadwal.kabupaten_kota}</h3>
                                            <span className="badge badge-info">{jadwal.nama_periode}</span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <FiCalendar className="text-primary-600" />
                                                <span className="font-medium text-neutral-800">
                                                    {new Date(jadwal.tanggal_tes).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <FiClock className="text-primary-600" />
                                                <span>{jadwal.waktu_mulai.slice(0, 5)} - {jadwal.waktu_selesai.slice(0, 5)} WIB</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <FiMapPin className="text-primary-600" />
                                                <span>{jadwal.lokasi}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <FiUsers className="text-primary-600" />
                                                <span>Kapasitas: {jadwal.kapasitas} peserta</span>
                                            </div>
                                        </div>

                                        {jadwal.alamat_lengkap && (
                                            <p className="text-sm text-neutral-500 mt-2 ml-6">
                                                {jadwal.alamat_lengkap}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-2 justify-center">
                                        <button
                                            onClick={() => router.push(`/dashboard/jadwal-tes/${jadwal.id}`)}
                                            className="btn btn-secondary text-sm"
                                        >
                                            <FiEye /> Detail
                                        </button>
                                        {user.role === 'admin_provinsi' && (
                                            <button
                                                onClick={() => handleDelete(jadwal.id)}
                                                className="btn btn-danger text-sm"
                                            >
                                                <FiTrash2 /> Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-neutral-200">
                                <h2 className="text-2xl font-bold text-neutral-800">Buat Jadwal Tes Baru</h2>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label required">Periode Tes</label>
                                        <select
                                            className="form-select"
                                            value={formData.periode_tes_id}
                                            onChange={e => setFormData({ ...formData, periode_tes_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Pilih Periode</option>
                                            {periodeList.map(p => (
                                                <option key={p.id} value={p.id}>{p.nama_periode}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Kabupaten/Kota</label>
                                        <select
                                            className="form-select"
                                            value={formData.kabupaten_kota}
                                            onChange={e => setFormData({ ...formData, kabupaten_kota: e.target.value })}
                                            required
                                        >
                                            <option value="">Pilih Wilayah</option>
                                            {kabupatenKotaList.map(k => (
                                                <option key={k} value={k}>{k}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Tanggal Tes</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.tanggal_tes}
                                            onChange={e => setFormData({ ...formData, tanggal_tes: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Kapasitas</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.kapasitas}
                                            onChange={e => setFormData({ ...formData, kapasitas: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Waktu Mulai</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={formData.waktu_mulai}
                                            onChange={e => setFormData({ ...formData, waktu_mulai: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Waktu Selesai</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={formData.waktu_selesai}
                                            onChange={e => setFormData({ ...formData, waktu_selesai: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Lokasi (Nama Gedung/Tempat)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Contoh: Masjid Agung Surabaya"
                                        value={formData.lokasi}
                                        onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Alamat Lengkap</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        value={formData.alamat_lengkap}
                                        onChange={e => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn btn-secondary"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
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

export default function JadwalTesPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <JadwalTesContent />
        </Suspense>
    );
}
