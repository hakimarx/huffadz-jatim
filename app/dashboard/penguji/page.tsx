'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiUserCheck } from 'react-icons/fi';

const mockPenguji = [
    { id: '1', nama: 'Prof. Dr. H. Ahmad Syaifuddin, M.Ag', gelar: 'Profesor', institusi: 'UIN Sunan Ampel', telepon: '081234567890', is_active: true },
    { id: '2', nama: 'Dr. H. Muhammad Hasan, M.Pd.I', gelar: 'Doktor', institusi: 'IAIN Jember', telepon: '081234567891', is_active: true },
];

function PengujiContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin_provinsi';

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
                        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Data Penguji</h1>
                        <p className="text-neutral-600">Kelola data penguji tes seleksi Huffadz</p>
                    </div>
                    <button className="btn btn-primary">
                        <FiPlus /> Tambah Penguji
                    </button>
                </div>

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
                            {mockPenguji.map((penguji) => (
                                <tr key={penguji.id}>
                                    <td className="font-semibold">{penguji.nama}</td>
                                    <td>{penguji.gelar}</td>
                                    <td>{penguji.institusi}</td>
                                    <td>{penguji.telepon}</td>
                                    <td>
                                        <span className={`badge ${penguji.is_active ? 'badge-success' : 'badge-neutral'}`}>
                                            {penguji.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-secondary text-sm"><FiEdit /> Edit</button>
                                            <button className="btn btn-danger text-sm"><FiTrash2 /> Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
