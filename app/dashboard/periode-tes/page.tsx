'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiUsers } from 'react-icons/fi';

const mockPeriode = [
    { id: '1', tahun: 2024, nama: 'Periode Tes 2024', tanggal_mulai: '2024-06-01', tanggal_selesai: '2024-08-31', kuota: 1000, status: 'selesai' },
    { id: '2', tahun: 2025, nama: 'Periode Tes 2025', tanggal_mulai: '2025-06-01', tanggal_selesai: '2025-08-31', kuota: 1000, status: 'draft' },
];

function PeriodeTesContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin_provinsi';
    const [showModal, setShowModal] = useState(false);

    const userData = {
        role: role,
        nama: 'Admin Provinsi',
        email: 'admin.provinsi@lptq.jatimprov.go.id'
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Sidebar userRole={userData.role} userName={userData.nama} userEmail={userData.email} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Periode Tes</h1>
                        <p className="text-neutral-600">Kelola periode tes seleksi Huffadz</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <FiPlus /> Tambah Periode
                    </button>
                </div>

                <div className="grid gap-6">
                    {mockPeriode.map((periode) => (
                        <div key={periode.id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-neutral-800">{periode.nama}</h3>
                                        <span className={`badge ${periode.status === 'selesai' ? 'badge-success' : 'badge-warning'}`}>
                                            {periode.status}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-neutral-600">Periode:</span>
                                            <p className="font-semibold">{new Date(periode.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(periode.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-600">Kuota:</span>
                                            <p className="font-semibold">{periode.kuota} Huffadz</p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-600">Tahun:</span>
                                            <p className="font-semibold">{periode.tahun}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-secondary text-sm"><FiEdit /> Edit</button>
                                    <button className="btn btn-danger text-sm"><FiTrash2 /> Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
