'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Import data dari file JSON eksternal
import kabupatenKotaData from '@/data/kabupaten-kota.json';

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

interface ManagedUser {
    id: number;
    email: string;
    nama: string;
    role: string;
    kabupaten_kota?: string;
    telepon?: string;
    is_active: boolean;
    created_at: string;
}

// Daftar Kabupaten/Kota Jawa Timur (dari file JSON)
const KABUPATEN_KOTA: string[] = kabupatenKotaData;

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
        role: 'admin_kabko' as 'admin_provinsi' | 'admin_kabko' | 'hafiz',
        kabupaten_kota: '',
        telepon: '',
        nik: ''
    });

    const fetchManagedUsers = useCallback(async () => {
        if (!user) return;

        setLoadingUsers(true);
        try {
            // For admin_provinsi, fetch all users (no role filter to get all managed users)
            // For admin_kabko, only fetch hafiz
            const roleParam = user.role === 'admin_kabko' ? 'hafiz' : '';
            const url = roleParam ? `/api/users?role=${roleParam}` : '/api/users';
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                console.error('Error fetching users:', data.error);
            } else {
                setManagedUsers(data.data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoadingUsers(false);
        }
    }, [user]);

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                if (!sessionResponse.ok || !sessionData.user) {
                    window.location.href = '/login';
                    return;
                }

                const userData = sessionData.user as UserData;

                // Only admin_provinsi and admin_kabko can access this page
                if (userData.role === 'hafiz') {
                    window.location.href = '/dashboard';
                    return;
                }

                setUser(userData);
            } catch (err) {
                console.error('Error:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

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
            role: user?.role === 'admin_provinsi' ? 'admin_kabko' : 'hafiz',
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
            role: (managedUser.role as 'admin_provinsi' | 'admin_kabko' | 'hafiz') || 'hafiz',
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

    // Email validation function
    const validateEmail = (email: string): boolean => {
        // RFC 5322 compliant email regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        // Also check minimum length and proper domain format
        if (!emailRegex.test(email)) return false;

        const parts = email.split('@');
        if (parts.length !== 2) return false;

        const [localPart, domain] = parts;

        // Local part should be at least 1 character
        if (localPart.length < 1) return false;

        // Domain should have at least one dot and a valid TLD
        if (!domain.includes('.')) return false;

        const domainParts = domain.split('.');
        const tld = domainParts[domainParts.length - 1];

        // TLD should be at least 2 characters
        if (tld.length < 2) return false;

        return true;
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

                // Validate email format
                if (!validateEmail(formData.email)) {
                    throw new Error('Format email tidak valid. Pastikan email memiliki format yang benar (contoh: nama@domain.com)');
                }

                // Validate kabupaten_kota only if role is admin_kabko or hafiz
                if (user?.role === 'admin_provinsi' && formData.role !== 'admin_provinsi' && !formData.kabupaten_kota) {
                    throw new Error('Kabupaten/Kota wajib dipilih');
                }

                // Create new user via MySQL API
                const newRole = user?.role === 'admin_provinsi' ? formData.role : 'hafiz';
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        nama: formData.nama,
                        role: newRole,
                        kabupaten_kota: formData.kabupaten_kota || user?.kabupaten_kota,
                        telepon: formData.telepon,
                        nik: formData.nik || undefined
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Gagal menambahkan user');
                }

                alert('User berhasil ditambahkan!');
            } else {
                // Edit existing user
                if (!selectedUser) return;

                const response = await fetch('/api/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedUser.id,
                        nama: formData.nama,
                        kabupaten_kota: formData.kabupaten_kota,
                        telepon: formData.telepon
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Gagal memperbarui user');
                }

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
            // Delete via MySQL API
            const response = await fetch(`/api/users?id=${userToDelete.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal menghapus user');
            }

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

    const [activeTab, setActiveTab] = useState<'users' | 'app'>('users');
    const [appSettings, setAppSettings] = useState({
        app_name: '',
        app_address: '',
        app_logo: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        if (activeTab === 'app' && user?.role === 'admin_provinsi') {
            fetchAppSettings();
        }
    }, [activeTab, user]);

    const fetchAppSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.data) {
                setAppSettings({
                    app_name: data.data.app_name || '',
                    app_address: data.data.app_address || '',
                    app_logo: data.data.app_logo || ''
                });
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) { // 500KB limit
            alert('Ukuran file logo maksimal 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setAppSettings(prev => ({ ...prev, app_logo: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const saveAppSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appSettings)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Pengaturan aplikasi berhasil disimpan');
        } catch (err: any) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setSavingSettings(false);
        }
    };

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

    const targetRole = user.role === 'admin_provinsi' ? 'User' : 'Hafiz';

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
                                    Kelola Pengaturan & User
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    {user.role === 'admin_provinsi' && (
                        <div className="flex gap-4 border-b border-neutral-300 mb-6">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`pb-3 px-1 font-medium transition-colors border-b-2 ${activeTab === 'users'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('app')}
                                className={`pb-3 px-1 font-medium transition-colors border-b-2 ${activeTab === 'app'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                Aplikasi & Logo
                            </button>
                        </div>
                    )}

                    {activeTab === 'users' ? (
                        <>
                            {/* Action Bar */}
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-300 p-4 mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Search */}
                                    <div className="relative flex-1 max-w-md">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder={`Cari ${targetRole}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Add Button */}
                                    <button
                                        onClick={handleOpenAddModal}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-neutral-900 rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-sm"
                                    >
                                        <FiPlus className="text-neutral-900" />
                                        <span className="text-neutral-900">Tambah {targetRole}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-300 overflow-hidden">
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
                                            <thead className="bg-neutral-50 border-b border-neutral-300">
                                                <tr>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                        Nama
                                                    </th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    {user.role === 'admin_provinsi' && (
                                                        <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                            Kabupaten/Kota
                                                        </th>
                                                    )}
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
                                                        <td className="px-6 py-4 text-neutral-600 capitalize">
                                                            {managedUser.role.replace('_', ' ')}
                                                        </td>
                                                        {user.role === 'admin_provinsi' && (
                                                            <td className="px-6 py-4 text-neutral-600">
                                                                {managedUser.kabupaten_kota || '-'}
                                                            </td>
                                                        )}
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
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-300 p-6 max-w-2xl">
                            <h2 className="text-xl font-bold text-neutral-800 mb-6">Pengaturan Aplikasi</h2>
                            <form onSubmit={saveAppSettings} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nama Aplikasi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={appSettings.app_name}
                                        onChange={(e) => setAppSettings(prev => ({ ...prev, app_name: e.target.value }))}
                                        placeholder="LPTQ Jawa Timur"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Alamat Instansi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={appSettings.app_address}
                                        onChange={(e) => setAppSettings(prev => ({ ...prev, app_address: e.target.value }))}
                                        placeholder="Jl. Pahlawan No. 110"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Logo Aplikasi</label>
                                    <div className="flex items-center gap-4 p-4 border border-neutral-300 rounded-xl bg-neutral-50">
                                        {appSettings.app_logo && (
                                            <div className="w-16 h-16 rounded-lg border border-neutral-300 p-1 bg-white">
                                                <img src={appSettings.app_logo} alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-neutral-900 hover:file:bg-primary-600 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">Maksimal 500KB. Format PNG/JPG.</p>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        className="btn btn-primary"
                                    >
                                        {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Stats */}
                    {activeTab === 'users' && (
                        <div className="mt-4 text-sm text-neutral-500">
                            Total: {filteredUsers.length} {targetRole}
                        </div>
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-300">
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
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
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Nama lengkap"
                                    />
                                </div>
                            </div>

                            {/* NIK (only for Hafiz) */}
                            {(user?.role === 'admin_kabko' || (user?.role === 'admin_provinsi' && formData.role === 'hafiz')) && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        NIK <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            name="nik"
                                            value={formData.nik}
                                            onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                            maxLength={16}
                                            required={formData.role === 'hafiz'}
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="16 digit NIK"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Role/Hak Akses (for Admin Provinsi) */}
                            {user?.role === 'admin_provinsi' && modalMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Role / Hak Akses <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                        >
                                            <option value="admin_provinsi">Admin Provinsi</option>
                                            <option value="admin_kabko">Admin Kab/Ko</option>
                                            <option value="hafiz">Hafiz</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Kabupaten/Kota (for Admin Provinsi adding Admin Kab/Ko or Hafiz) */}
                            {user?.role === 'admin_provinsi' && formData.role !== 'admin_provinsi' && (
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
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            <span className="text-white">Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span className="text-white font-semibold">{modalMode === 'add' ? 'Tambah' : 'Simpan'}</span>
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
