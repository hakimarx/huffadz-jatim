'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HafizForm from '../components/HafizForm';
import { FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { PageLoader } from '@/components/LoadingSpinner';

function CreateHafizContent() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar userRole="admin_provinsi" userName="Admin" />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/hafiz"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
                    >
                        <FiArrowLeft />
                        <span>Kembali ke Data Hafiz</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white shadow-lg">
                            <FiUserPlus size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-800">
                                Tambah Data Hafiz Baru
                            </h1>
                            <p className="text-neutral-600 mt-1">
                                Isi formulir di bawah ini untuk menambahkan data hafiz baru
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="alert alert-info mb-8">
                    <div>
                        <p className="font-semibold">Petunjuk Pengisian:</p>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                            <li>Field dengan tanda (*) wajib diisi</li>
                            <li>NIK harus 16 digit dan unik (tidak boleh duplikat)</li>
                            <li>Pastikan data yang diisi sudah benar sebelum menyimpan</li>
                            <li>Gunakan huruf kapital untuk nama</li>
                        </ul>
                    </div>
                </div>

                {/* Form */}
                <HafizForm mode="create" />
            </main>
        </div>
    );
}

export default function CreateHafizPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <CreateHafizContent />
        </Suspense>
    );
}
