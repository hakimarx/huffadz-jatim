'use client';

import { useState, Suspense, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiUpload, FiDownload, FiFileText } from 'react-icons/fi';

const mockDokumen = [
    { id: '1', jenis: 'spj', nama: 'SPJ Periode 2024', file_url: '#', periode: '2024', uploaded_at: '2024-12-01' },
    { id: '2', jenis: 'berita_acara', nama: 'Berita Acara Kelulusan 2024', file_url: '#', periode: '2024', uploaded_at: '2024-11-15' },
    { id: '3', jenis: 'piagam', nama: 'Template Piagam Kelulusan', file_url: '#', periode: '2024', uploaded_at: '2024-10-01' },
];

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function DokumenContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Use MySQL session API instead of Supabase
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    window.location.href = '/login';
                    return;
                }
                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                console.error('Error fetching user:', err);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // TODO: Implement file upload via API
            alert(`Upload file: ${file.name}`);
            setShowUploadModal(false);
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
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Dokumen</h1>
                        <p className="text-neutral-600">Kelola dokumen SPJ, Berita Acara, dan Piagam</p>
                    </div>
                    <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                        <FiUpload /> Upload Dokumen
                    </button>
                </div>

                <div className="grid gap-6">
                    {mockDokumen.map((dok) => (
                        <div key={dok.id} className="card hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-2xl flex-shrink-0">
                                    <FiFileText />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-800">{dok.nama}</h3>
                                            <p className="text-sm text-neutral-600">Periode: {dok.periode}</p>
                                        </div>
                                        <span className="badge badge-info">{dok.jenis.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 mb-3">
                                        Diupload: {new Date(dok.uploaded_at).toLocaleDateString('id-ID')}
                                    </p>
                                    <button className="btn btn-secondary text-sm">
                                        <FiDownload /> Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Upload Dokumen</h2>

                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="form-label required">Jenis Dokumen</label>
                                    <select className="form-select">
                                        <option value="">Pilih Jenis</option>
                                        <option value="spj">SPJ</option>
                                        <option value="berita_acara">Berita Acara</option>
                                        <option value="piagam">Piagam</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Nama Dokumen</label>
                                    <input type="text" className="form-input" placeholder="Contoh: SPJ Periode 2024" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">File</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        onChange={handleUpload}
                                    />
                                    <span className="form-help">Format: PDF, Word, Excel (max 10MB)</span>
                                </div>

                                <div className="flex gap-3">
                                    <button className="btn btn-primary flex-1">
                                        <FiUpload /> Upload
                                    </button>
                                    <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function DokumenPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <DokumenContent />
        </Suspense>
    );
}
