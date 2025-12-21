'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/Sidebar';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiX,
    FiLoader,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiKey,
    FiUsers,
    FiShield,
    FiAlertCircle
} from 'react-icons/fi';

interface UserData {
    id: string;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

interface ManagedUser {
    id: string;
    email: string;
    nama: string;
    role: string;
    kabupaten_kota?: string;
    telepon?: string;
    is_active: boolean;
    created_at: string;
}

// Daftar Kabupaten/Kota Jawa Timur
const KABUPATEN_KOTA = [
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

function PengaturanContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nama: '',
        kabupaten_kota: '',
        telepon: '',
        nik: ''
    });

    const supabase = createClient();

    const fetchManagedUsers = useCallback(async () => {
        if (!user) return;

        setLoadingUsers(true);
        try {
            let query = supabase
                .from('users')
                .select('id, email, nama, role, kabupaten_kota, telepon, is_active, created_at')
                .order('nama');

            if (user.role === 'admin_provinsi') {
                // Admin Provinsi manages Admin Kab/Ko
                query = query.eq('role', 'admin_kabko');
            } else if (user.role === 'admin_kabko') {
                // Admin Kab/Ko manages Hafiz in their region
                query = query
                    .eq('role', 'hafiz')
                    .eq('kabupaten_kota', user.kabupaten_kota);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setManagedUsers(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoadingUsers(false);
        }
    }, [user, supabase]);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    window.location.href = '/login';
                    return;
                }

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, email, nama, role, kabupaten_kota, foto_profil')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (userError || !userData) {
                    console.error('Error fetching user data:', userError);
                    window.location.href = '/login';
                    return;
                }

                // Only admin_provinsi and admin_kabko can access this page
                if (userData.role === 'hafiz') {
                    window.location.href = '/dashboard';
                    return;
                }

                setUser(userData as UserData);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [supabase]);

    useEffect(() => {
        if (user) {
            fetchManagedUsers();
        }
    }, [user, fetchManagedUsers]);

    const handleOpenAddModal = () => {
        setFormData({
            email: '',
            password: '',
            nama: '',
            kabupaten_kota: user?.role === 'admin_kabko' ? (user.kabupaten_kota || '') : '',
            telepon: '',
            nik: ''
        });
        setSelectedUser(null);
        setModalMode('add');
        setError('');
        setShowModal(true);
    };

    const handleOpenEditModal = (managedUser: ManagedUser) => {
        setFormData({
            email: managedUser.email,
            password: '',
            nama: managedUser.nama,
            kabupaten_kota: managedUser.kabupaten_kota || '',
            telepon: managedUser.telepon || '',
            nik: ''
        });
        setSelectedUser(managedUser);
        setModalMode('edit');
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setError('');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (modalMode === 'add') {
                // Validate required fields
                if (!formData.email || !formData.password || !formData.nama) {
                    throw new Error('Email, password, dan nama wajib diisi');
                }

                if (user?.role === 'admin_provinsi' && !formData.kabupaten_kota) {
                    throw new Error('Kabupaten/Kota wajib dipilih');
                }

                // Create new user via Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.nama
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Insert to public.users
                    const newRole = user?.role === 'admin_provinsi' ? 'admin_kabko' : 'hafiz';
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email: formData.email,
                            role: newRole,
                            nama: formData.nama,
                            kabupaten_kota: formData.kabupaten_kota || user?.kabupaten_kota,
                            telepon: formData.telepon,
                            is_active: true
                        });

                    if (insertError) throw insertError;

                    // If creating Hafiz, also create hafiz record if NIK provided
                    if (newRole === 'hafiz' && formData.nik) {
                        const { error: hafizError } = await supabase
                            .from('hafiz')
                            .insert({
                                user_id: authData.user.id,
                                nik: formData.nik,
                                nama: formData.nama,
                                kabupaten_kota: formData.kabupaten_kota || user?.kabupaten_kota,
                                telepon: formData.telepon,
                                email: formData.email,
                                tanggal_lahir: new Date('2000-01-01'), // Placeholder
                                tahun_tes: new Date().getFullYear()
                            });

                        if (hafizError) {
                            console.error('Error creating hafiz record:', hafizError);
                        }
                    }
                }

                alert('User berhasil ditambahkan! Email konfirmasi akan dikirim ke alamat email tersebut.');
            } else {
                // Edit existing user
                if (!selectedUser) return;

                const updateData: Record<string, string | boolean> = {
                    nama: formData.nama,
                    kabupaten_kota: formData.kabupaten_kota,
                    telepon: formData.telepon
                };

                const { error: updateError } = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('id', selectedUser.id);

                if (updateError) throw updateError;

                alert('User berhasil diperbarui!');
            }

            handleCloseModal();
            fetchManagedUsers();
        } catch (err: unknown) {
            console.error('Error saving user:', err);
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (managedUser: ManagedUser) => {
        setUserToDelete(managedUser);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        try {
            // Delete from public.users (this will cascade to related tables)
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userToDelete.id);

            if (error) throw error;

            alert('User berhasil dihapus!');
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            fetchManagedUsers();
        } catch (err: unknown) {
            console.error('Error deleting user:', err);
            const message = err instanceof Error ? err.message : 'Gagal menghapus user';
            alert(message);
        } finally {
            setDeleting(false);
        }
    };

    const filteredUsers = managedUsers.filter(u =>
        u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.kabupaten_kota && u.kabupaten_kota.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
                    <p className="text-neutral-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const targetRole = user.role === 'admin_provinsi' ? 'Admin Kab/Ko' : 'Hafiz';

    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar
                userRole={user.role}
                userName={user.nama}
                userPhoto={user.foto_profil}
            />

            <main className="lg:pl-64 min-h-screen">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-primary-100 rounded-xl">
                                <FiShield className="text-2xl text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-display font-bold text-neutral-800">
                                    Pengaturan
                                </h1>
                                <p className="text-neutral-500">
                                    Kelola User {targetRole}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder={`Cari ${targetRole}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleOpenAddModal}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
                            >
                                <FiPlus />
                                <span>Tambah {targetRole}</span>
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                        {loadingUsers ? (
                            <div className="p-12 text-center">
                                <FiLoader className="animate-spin text-3xl text-primary-500 mx-auto mb-3" />
                                <p className="text-neutral-500">Memuat data user...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <FiUsers className="text-5xl text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500 mb-2">
                                    {searchTerm ? 'Tidak ada hasil pencarian' : `Belum ada ${targetRole}`}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={handleOpenAddModal}
                                        className="text-primary-500 hover:text-primary-600 font-medium"
                                    >
                                        + Tambah {targetRole} pertama
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 border-b border-neutral-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Nama
                                            </th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            {user.role === 'admin_provinsi' && (
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                    Kabupaten/Kota
                                                </th>
                                            )}
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Telepon
                                            </th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {filteredUsers.map((managedUser) => (
                                            <tr key={managedUser.id} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                                                            {managedUser.nama.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-neutral-800">
                                                            {managedUser.nama}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-600">
                                                    {managedUser.email}
                                                </td>
                                                {user.role === 'admin_provinsi' && (
                                                    <td className="px-6 py-4 text-neutral-600">
                                                        {managedUser.kabupaten_kota || '-'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-neutral-600">
                                                    {managedUser.telepon || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${managedUser.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {managedUser.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditModal(managedUser)}
                                                            className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(managedUser)}
                                                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 text-sm text-neutral-500">
                        Total: {filteredUsers.length} {targetRole}
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                            <h2 className="text-xl font-bold text-neutral-800">
                                {modalMode === 'add' ? `Tambah ${targetRole}` : `Edit ${targetRole}`}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                                    <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        disabled={modalMode === 'edit'}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password (only for add mode) */}
                            {modalMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Minimal 6 karakter"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Nama lengkap"
                                    />
                                </div>
                            </div>

                            {/* NIK (only for Hafiz) */}
                            {user?.role === 'admin_kabko' && modalMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        NIK
                                    </label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            name="nik"
                                            value={formData.nik}
                                            onChange={handleFormChange}
                                            maxLength={16}
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="16 digit NIK (opsional)"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Kabupaten/Kota (for Admin Provinsi adding Admin Kab/Ko) */}
                            {user?.role === 'admin_provinsi' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Kabupaten/Kota <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <select
                                            name="kabupaten_kota"
                                            value={formData.kabupaten_kota}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                        >
                                            <option value="">Pilih Kabupaten/Kota</option>
                                            {KABUPATEN_KOTA.map(kk => (
                                                <option key={kk} value={kk}>{kk}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Telepon */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Telepon
                                </label>
                                <div className="relative">
                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="tel"
                                        name="telepon"
                                        value={formData.telepon}
                                        onChange={handleFormChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>{modalMode === 'add' ? 'Tambah' : 'Simpan'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="text-3xl text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-800 mb-2">
                                Hapus User?
                            </h3>
                            <p className="text-neutral-500">
                                Anda yakin ingin menghapus <span className="font-semibold text-neutral-700">{userToDelete.nama}</span>?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setUserToDelete(null);
                                }}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <span>Hapus</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PengaturanPage() {
    return <PengaturanContent />;
}
