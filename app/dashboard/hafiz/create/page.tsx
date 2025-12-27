'use client';

import { Suspense, useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HafizForm from '../components/HafizForm';
import KtpOcrUploader from '@/components/KtpOcrUploader';
import { FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { PageLoader } from '@/components/LoadingSpinner';

interface KtpData {
    nik: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
}

interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string;
    foto_profil?: string;
}

function CreateHafizContent() {
    const [step, setStep] = useState<'upload' | 'form'>('upload');
    const [initialData, setInitialData] = useState<Partial<KtpData>>({});
    const [ktpImageFile, setKtpImageFile] = useState<File | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleKtpDataExtracted = (data: KtpData, imageFile: File) => {
        setInitialData(data);
        setKtpImageFile(imageFile);
        setStep('form');
    };

    const handleSkip = () => {
        setStep('form');
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            <Sidebar
                userRole={userData?.role || 'admin_kabko'}
                userName={userData?.nama || 'Admin'}
                userPhoto={userData?.foto_profil}
            />

            <main className="flex-1 p-6 lg:ml-64">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/hafiz"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors text-sm font-medium"
                    >
                        <FiArrowLeft />
                        <span>← Kembali ke Data Hafiz</span>
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
                                {step === 'upload'
                                    ? 'Upload foto KTP untuk mengisi data otomatis'
                                    : 'Lengkapi formulir data hafiz'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8 max-w-3xl">
                    <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-600 font-semibold' : 'text-neutral-400'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'upload' ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}>1</span>
                        <span>Upload KTP</span>
                    </div>
                    <div className="flex-1 h-1 bg-neutral-200">
                        <div className={`h-1 bg-primary-600 transition-all ${step === 'form' ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className={`flex items-center gap-2 ${step === 'form' ? 'text-primary-600 font-semibold' : 'text-neutral-400'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'form' ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}>2</span>
                        <span>Isi Data</span>
                    </div>
                </div>

                {step === 'upload' ? (
                    <div className="max-w-3xl">
                        {/* Info Alert */}
                        <div className="alert alert-info mb-8">
                            <div>
                                <p className="font-semibold">Petunjuk Upload KTP:</p>
                                <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                                    <li>Pastikan foto KTP jelas, tidak blur, dan tidak terpotong</li>
                                    <li>Foto dapat diambil langsung dari kamera atau upload file</li>
                                    <li>Data akan diekstrak otomatis menggunakan teknologi OCR</li>
                                    <li>Anda dapat melewati langkah ini dan mengisi data secara manual</li>
                                </ul>
                            </div>
                        </div>

                        {/* KTP OCR Uploader */}
                        <KtpOcrUploader
                            onDataExtracted={handleKtpDataExtracted}
                            onSkip={handleSkip}
                        />
                    </div>
                ) : (
                    <div className="max-w-4xl">
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

                        {/* Back to upload button */}
                        <div className="mb-4">
                            <button
                                onClick={() => setStep('upload')}
                                className="btn btn-secondary text-sm"
                            >
                                <FiArrowLeft /> Kembali ke Upload KTP
                            </button>
                        </div>

                        {/* Form with initial data from OCR */}
                        <HafizForm
                            mode="create"
                            initialData={{
                                nik: initialData.nik || '',
                                nama: initialData.nama || '',
                                tempat_lahir: initialData.tempat_lahir || '',
                                tanggal_lahir: initialData.tanggal_lahir || '',
                                jenis_kelamin: (initialData.jenis_kelamin === 'L' || initialData.jenis_kelamin === 'P')
                                    ? initialData.jenis_kelamin
                                    : undefined,
                                alamat: initialData.alamat || '',
                                rt: initialData.rt || '',
                                rw: initialData.rw || '',
                                desa_kelurahan: initialData.desa_kelurahan || '',
                                kecamatan: initialData.kecamatan || '',
                                kabupaten_kota: initialData.kabupaten_kota || ''
                            }}
                            ktpImageFile={ktpImageFile}
                        />
                    </div>
                )}
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
