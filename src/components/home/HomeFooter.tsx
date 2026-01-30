'use client';

import Link from 'next/link';

export default function HomeFooter() {
    return (
        <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-neutral-100 p-1 overflow-hidden">
                                <img src="/logo-lptq.png" alt="LPTQ Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-display font-bold text-2xl text-neutral-800">LPTQ Jawa Timur</span>
                        </div>
                        <p className="text-neutral-500 leading-relaxed max-w-sm mb-6">
                            Lembaga Pengembangan Tilawatil Quran Provinsi Jawa Timur. Berdedikasi untuk memuliakan Al-Qur&apos;an dan memberdayakan para penghafalnya.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons would go here */}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-800 mb-6">Navigasi</h4>
                        <ul className="space-y-3 text-neutral-500">
                            <li><Link href="/" className="hover:text-primary-600 transition-colors">Beranda</Link></li>
                            <li><Link href="/login" className="hover:text-primary-600 transition-colors">Login Admin</Link></li>
                            <li><Link href="/register" className="hover:text-primary-600 transition-colors">Daftar Hafiz</Link></li>
                            <li><Link href="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-800 mb-6">Kontak</h4>
                        <ul className="space-y-3 text-neutral-500 text-sm">
                            <li>Jl. Dukuh Kupang, No. 122 - 124, Dukuh Pakis, Surabaya, Jawa Timur 60225</li>
                            <li>info@lptq.jatimprov.go.id</li>
                            <li>(031) 8292233</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-400 text-sm">© 2026 LPTQ Jawa Timur. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-neutral-400">
                        <Link href="#" className="hover:text-neutral-600">Privacy Policy</Link>
                        <Link href="#" className="hover:text-neutral-600">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
