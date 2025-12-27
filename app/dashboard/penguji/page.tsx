'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

interface Penguji {
    id: number;
    nama: string;
    gelar: string;
    institusi: string;
    telepon: string;
    email?: string;
    lokasi_tes?: string;
    periode_tes?: string;
    is_active: boolean;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function PengujiContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPenguji, setEditingPenguji] = useState<Penguji | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        gelar: '',
        institusi: '',
        telepon: '',
        email: '',
        lokasi_tes: '',
        periode_tes: '',
        is_active: true
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Use MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }

                setUser(sessionData.user as UserData);
                await refreshPengujiList();

            } catch (err) {
                console.error('Error fetching data:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const refreshPengujiList = async () => {
        try {
            const response = await fetch('/api/penguji');
            const data = await response.json();
            if (data.data) {
                setPengujiList(data.data);
            }
        } catch (err) {
            console.error('Error fetching penguji:', err);
        }
    };

    const openAddModal = () => {
        setEditingPenguji(null);
        setFormData({ nama: '', gelar: '', institusi: '', telepon: '', email: '', lokasi_tes: '', periode_tes: '', is_active: true });
        setShowModal(true);
    };

    const openEditModal = (penguji: Penguji) => {
        setEditingPenguji(penguji);
        setFormData({
            nama: penguji.nama || '',
            gelar: penguji.gelar || '',
            institusi: penguji.institusi || '',
            telepon: penguji.telepon || '',
            email: penguji.email || '',
            lokasi_tes: penguji.lokasi_tes || '',
            periode_tes: penguji.periode_tes || '',
            is_active: penguji.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingPenguji) {
                // Update via MySQL API
                const response = await fetch('/api/penguji', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, id: editingPenguji.id })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Gagal mengupdate penguji');
                }

                alert('✅ Penguji berhasil diupdate!');
            } else {
                // Insert via MySQL API
                const response = await fetch('/api/penguji', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Gagal menambahkan penguji');
                }

                alert('✅ Penguji berhasil ditambahkan!');
            }

            setShowModal(false);
            await refreshPengujiList();

        } catch (err: any) {
            console.error('Error:', err);
            alert('Gagal: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus penguji ini?')) return;

        try {
            const response = await fetch(`/api/penguji?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Gagal menghapus penguji');
            }

            setPengujiList(pengujiList.filter(p => p.id !== id));
            alert('✅ Penguji berhasil dihapus!');
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        }
    };

    const toggleActive = async (penguji: Penguji) => {
        try {
            const response = await fetch('/api/penguji', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: penguji.id,
                    nama: penguji.nama,
                    gelar: penguji.gelar,
                    institusi: penguji.institusi,
                    telepon: penguji.telepon,
                    email: penguji.email,
                    lokasi_tes: penguji.lokasi_tes,
                    periode_tes: penguji.periode_tes,
                    is_active: !penguji.is_active
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            await refreshPengujiList();
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
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Data Penguji</h1>
                        <p className="text-neutral-600">Kelola data penguji tes seleksi Huffadz ({pengujiList.length} penguji)</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <FiPlus /> Tambah Penguji
                    </button>
                </div>

                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Gelar</th>
                                    <th>Institusi</th>
                                    <th>Telepon</th>
                                    <th>Lokasi Tes</th>
                                    <th>Periode Tes</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengujiList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-neutral-500">
                                            Belum ada data penguji. Klik "Tambah Penguji" untuk menambahkan.
                                        </td>
                                    </tr>
                                ) : (
                                    pengujiList.map((penguji) => (
                                        <tr key={penguji.id}>
                                            <td className="font-semibold">{penguji.nama}</td>
                                            <td>{penguji.gelar || '-'}</td>
                                            <td>{penguji.institusi || '-'}</td>
                                            <td>{penguji.telepon || '-'}</td>
                                            <td>{penguji.lokasi_tes || '-'}</td>
                                            <td>{penguji.periode_tes || '-'}</td>
                                            <td>
                                                <button
                                                    onClick={() => toggleActive(penguji)}
                                                    className={`badge cursor-pointer ${penguji.is_active ? 'badge-success' : 'badge-neutral'}`}
                                                >
                                                    {penguji.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(penguji)}
                                                        className="btn btn-secondary text-sm"
                                                    >
                                                        <FiEdit /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(penguji.id)}
                                                        className="btn btn-danger text-sm"
                                                    >
                                                        <FiTrash2 /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Penguji Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full">
                            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-neutral-800">
                                    {editingPenguji ? 'Edit Penguji' : 'Tambah Penguji'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="form-group">
                                    <label className="form-label required">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Prof. Dr. H. Ahmad Syaifuddin, M.Ag"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gelar Akademik</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Profesor / Doktor / Magister"
                                        value={formData.gelar}
                                        onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Institusi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="UIN Sunan Ampel Surabaya"
                                        value={formData.institusi}
                                        onChange={(e) => setFormData({ ...formData, institusi: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Telepon</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="081234567890"
                                        value={formData.telepon}
                                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lokasi Tes</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Gedung Grahadi Surabaya"
                                        value={formData.lokasi_tes}
                                        onChange={(e) => setFormData({ ...formData, lokasi_tes: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Periode Tes</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="2024 Semester 1"
                                        value={formData.periode_tes}
                                        onChange={(e) => setFormData({ ...formData, periode_tes: e.target.value })}
                                    />
                                </div>

                                {editingPenguji && (
                                    <div className="form-group">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <span>Penguji Aktif</span>
                                        </label>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                        {saving ? 'Menyimpan...' : (editingPenguji ? 'Update' : 'Simpan')}
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

export default function PengujiPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <PengujiContent />
        </Suspense>
    );
}
