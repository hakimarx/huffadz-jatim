'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiX } from 'react-icons/fi';

interface PeriodeTes {
    id: number;
    tahun: number;
    nama_periode: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    kuota_total: number;
    status: string;
    deskripsi?: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function PeriodeTesContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [periodeList, setPeriodeList] = useState<PeriodeTes[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPeriode, setEditingPeriode] = useState<PeriodeTes | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        tahun: new Date().getFullYear(),
        nama_periode: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        kuota_total: 1000,
        status: 'draft',
        deskripsi: ''
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user from MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }

                setUser(sessionData.user as UserData);

                // Fetch periode list from MySQL API
                const periodeResponse = await fetch('/api/periode');
                const periodeData = await periodeResponse.json();

                if (periodeData.data) {
                    setPeriodeList(periodeData.data);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const refreshPeriodeList = async () => {
        try {
            const response = await fetch('/api/periode');
            const data = await response.json();
            if (data.data) {
                setPeriodeList(data.data);
            }
        } catch (err) {
            console.error('Error refreshing periode list:', err);
        }
    };

    const openAddModal = () => {
        setEditingPeriode(null);
        setFormData({
            tahun: new Date().getFullYear(),
            nama_periode: `Periode Tes ${new Date().getFullYear()}`,
            tanggal_mulai: '',
            tanggal_selesai: '',
            kuota_total: 1000,
            status: 'draft',
            deskripsi: ''
        });
        setShowModal(true);
    };

    const openEditModal = (periode: PeriodeTes) => {
        setEditingPeriode(periode);
        setFormData({
            tahun: periode.tahun,
            nama_periode: periode.nama_periode,
            tanggal_mulai: periode.tanggal_mulai,
            tanggal_selesai: periode.tanggal_selesai,
            kuota_total: periode.kuota_total,
            status: periode.status,
            deskripsi: periode.deskripsi || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingPeriode) {
                // Update via MySQL API
                const response = await fetch(`/api/periode/${editingPeriode.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Gagal mengupdate periode');
                }

                alert('✅ Periode berhasil diupdate!');
            } else {
                // Insert via MySQL API
                const response = await fetch('/api/periode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Gagal menambahkan periode');
                }

                alert('✅ Periode berhasil ditambahkan!');
            }

            setShowModal(false);
            await refreshPeriodeList();

        } catch (err: any) {
            console.error('Error:', err);
            alert('Gagal: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus periode ini?')) return;

        try {
            const response = await fetch(`/api/periode/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Gagal menghapus periode');
            }

            setPeriodeList(periodeList.filter(p => p.id !== id));
            alert('✅ Periode berhasil dihapus!');
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        }
    };

    if (loading) return <PageLoader />;

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

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Periode Tes</h1>
                        <p className="text-neutral-600">Kelola periode tes seleksi Huffadz</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <FiPlus /> Tambah Periode
                    </button>
                </div>

                <div className="grid gap-6">
                    {periodeList.length === 0 ? (
                        <div className="card text-center py-12 text-neutral-500">
                            Belum ada periode tes. Klik "Tambah Periode" untuk menambahkan.
                        </div>
                    ) : (
                        periodeList.map((periode) => (
                            <div key={periode.id} className="card">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-neutral-800">{periode.nama_periode}</h3>
                                            <span className={`badge ${periode.status === 'selesai' ? 'badge-success' :
                                                periode.status === 'tes' ? 'badge-info' :
                                                    periode.status === 'pendaftaran' ? 'badge-warning' : 'badge-neutral'
                                                }`}>
                                                {periode.status}
                                            </span>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-neutral-600">Periode:</span>
                                                <p className="font-semibold">
                                                    {new Date(periode.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(periode.tanggal_selesai).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-600">Kuota:</span>
                                                <p className="font-semibold">{periode.kuota_total.toLocaleString()} Huffadz</p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-600">Tahun:</span>
                                                <p className="font-semibold">{periode.tahun}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(periode)} className="btn btn-secondary text-sm">
                                            <FiEdit /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(periode.id)} className="btn btn-danger text-sm">
                                            <FiTrash2 /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Add/Edit */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-neutral-800">
                                    {editingPeriode ? 'Edit Periode' : 'Tambah Periode'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="form-group">
                                    <label className="form-label required">Nama Periode</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.nama_periode}
                                        onChange={(e) => setFormData({ ...formData, nama_periode: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label required">Tahun</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.tahun}
                                            onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Kuota Total</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.kuota_total}
                                            onChange={(e) => setFormData({ ...formData, kuota_total: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label required">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.tanggal_mulai}
                                            onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Tanggal Selesai</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.tanggal_selesai}
                                            onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pendaftaran">Pendaftaran</option>
                                        <option value="tes">Tes</option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                        {saving ? 'Menyimpan...' : (editingPeriode ? 'Update' : 'Simpan')}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                                        Batal
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

export default function PeriodeTesPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <PeriodeTesContent />
        </Suspense>
    );
}
