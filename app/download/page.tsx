'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiDownload, FiSmartphone, FiArrowLeft, FiCheck } from 'react-icons/fi';

import { Suspense } from 'react';

function DownloadContent() {
    const searchParams = useSearchParams();
    const os = searchParams.get('os'); // 'android' or 'ios'

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="container py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-700 font-semibold hover:text-emerald-600">
                        <FiArrowLeft /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">L</span>
                        <span className="font-bold">LPTQ Mobile</span>
                    </div>
                </div>
            </header>

            <main className="container py-12 lg:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left: App Preview */}
                        <div className="order-2 md:order-1 relative">
                            <div className="relative z-10 bg-slate-900 rounded-[2.5rem] border-8 border-slate-900 overflow-hidden shadow-2xl mx-auto w-64 h-[500px]">
                                {/* Mockup Screen */}
                                <div className="bg-emerald-600 h-full w-full flex flex-col pt-12 items-center text-white p-4 text-center">
                                    <h2 className="font-bold text-xl mb-2">LPTQ Jawa Timur</h2>
                                    <p className="text-sm opacity-80 mb-8">Sistem Informasi Huffadz</p>
                                    <div className="bg-white/10 w-full p-4 rounded-xl mb-4 backdrop-blur-sm">
                                        <div className="h-2 w-12 bg-white/20 rounded mb-2 mx-auto"></div>
                                        <div className="h-20 bg-white/10 rounded-lg"></div>
                                    </div>
                                    <div className="bg-white text-emerald-800 font-bold px-6 py-2 rounded-full mt-auto mb-8 shadow-lg">
                                        Buka Aplikasi
                                    </div>
                                </div>
                                {/* Notch */}
                                <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl w-32 mx-auto"></div>
                            </div>
                            {/* Decorative Blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl -z-10"></div>
                        </div>

                        {/* Right: Content */}
                        <div className="order-1 md:order-2">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                Mobile App v1.0
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Aplikasi LPTQ <br />
                                <span className="text-emerald-600">di Genggaman Anda</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Nikmati kemudahan akses pendataan hafiz, laporan harian, dan informasi terbaru langsung dari smartphone Anda. Lebih cepat, lebih ringan, dan hemat kuota.
                            </p>

                            <div className="space-y-4 mb-10">
                                <FeatureItem text="Notifikasi Real-time untuk Pengumuman" />
                                <FeatureItem text="Upload Laporan Harian lebih mudah" />
                                <FeatureItem text="Akses Offline Mode" />
                            </div>

                            {/* Download Buttons Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FiDownload />
                                    Pilih Cara Instalasi
                                </h3>

                                <div className="space-y-3">
                                    {/* Android PWA Install Guide */}
                                    <details className="group border border-slate-200 rounded-xl overflow-hidden" open={os !== 'ios'}>
                                        <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 text-xl">📱</span>
                                                Untuk Android
                                            </div>
                                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="p-4 bg-white text-sm text-slate-600 space-y-2">
                                            <p className="font-medium text-slate-900 mb-2">Instal via Google Chrome:</p>
                                            <ol className="list-decimal pl-5 space-y-2">
                                                <li>Buka website ini di Google Chrome Android</li>
                                                <li>Ketuk ikon menu (titik tiga) di pojok kanan atas</li>
                                                <li>Pilih opsi <span className="font-bold text-emerald-600">"Install App"</span> atau <span className="font-bold text-emerald-600">"Tambahkan ke Layar Utama"</span></li>
                                                <li>Aplikasi akan terinstall seperti aplikasi native!</li>
                                            </ol>
                                        </div>
                                    </details>

                                    {/* iOS PWA Install Guide */}
                                    <details className="group border border-slate-200 rounded-xl overflow-hidden" open={os === 'ios'}>
                                        <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-800 text-xl">🍎</span>
                                                Untuk iPhone (iOS)
                                            </div>
                                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="p-4 bg-white text-sm text-slate-600 space-y-2">
                                            <p className="font-medium text-slate-900 mb-2">Instal via Safari:</p>
                                            <ol className="list-decimal pl-5 space-y-2">
                                                <li>Buka website ini di Safari</li>
                                                <li>Ketuk tombol <span className="font-bold text-blue-600">Share</span> (ikon kotak dengan panah ke atas)</li>
                                                <li>Geser ke bawah dan pilih <span className="font-bold text-slate-900">"Add to Home Screen"</span> (Tambah ke Layar Utama)</li>
                                                <li>Ketuk "Add" di pojok kanan atas</li>
                                            </ol>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>}>
            <DownloadContent />
        </Suspense>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs">
                <FiCheck />
            </div>
            <span className="text-slate-700 font-medium">{text}</span>
        </div>
    );
}
