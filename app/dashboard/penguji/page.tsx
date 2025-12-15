'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiTrash2, FiUserCheck, FiX } from 'react-icons/fi';

interface Penguji {
    id: string;
    nama: string;
    gelar: string;
    institusi: string;
    telepon: string;
    email?: string;
    is_active: boolean;
}

interface UserData {
    id: string;
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
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        gelar: '',
        institusi: '',
        telepon: '',
        email: ''
    });
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    window.location.href = '/login';
                    return;
                }

                const { data: userData } = await supabase
                    .from('users')
                    .select('id, email, nama, role, kabupaten_kota, foto_profil')
                    .eq('id', session.user.id)
                    .maybeSingle();

                setUser(userData as UserData || {
                    id: session.user.id,
                    role: 'hafiz',
                    nama: session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                });

                // Fetch penguji list
                const { data: pengujiData, error: pengujiError } = await supabase
                    .from('penguji')
                    .select('*')
                    .order('nama');

                if (!pengujiError && pengujiData) {
                    setPengujiList(pengujiData);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAddPenguji = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('penguji')
                .insert([{
                    nama: formData.nama,
                    gelar: formData.gelar,
                    institusi: formData.institusi,
                    telepon: formData.telepon,
                    email: formData.email || null,
                    is_active: true
                }]);

            if (error) {
                console.error('Error adding penguji:', error);
                alert('Gagal menambahkan penguji: ' + error.message);
                return;
            }

            alert('✅ Penguji berhasil ditambahkan!');
            setShowModal(false);
            setFormData({ nama: '', gelar: '', institusi: '', telepon: '', email: '' });

            // Refresh list
            const { data } = await supabase.from('penguji').select('*').order('nama');
            if (data) setPengujiList(data);

        } catch (err: any) {
            console.error('Error:', err);
            alert('Terjadi kesalahan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePenguji = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus penguji ini?')) return;

        try {
            const { error } = await supabase
                .from('penguji')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Gagal menghapus: ' + error.message);
                return;
            }

            setPengujiList(pengujiList.filter(p => p.id !== id));
            alert('✅ Penguji berhasil dihapus!');
        } catch (err: any) {
            alert('Error: ' + err.message);
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
                        <p className="text-neutral-600">Kelola data penguji tes seleksi Huffadz</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
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
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengujiList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-neutral-500">
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
                                            <td>
                                                <span className={`badge ${penguji.is_active ? 'badge-success' : 'badge-neutral'}`}>
                                                    {penguji.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-secondary text-sm"><FiEdit /> Edit</button>
                                                    <button
                                                        onClick={() => handleDeletePenguji(penguji.id)}
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

                {/* Add Penguji Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full">
                            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-neutral-800">Tambah Penguji</h2>
                                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddPenguji} className="p-6 space-y-4">
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

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                        {saving ? 'Menyimpan...' : 'Simpan Penguji'}
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
