'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden bg-neutral-900">

            {/* Decorative Gradient Overlay - Dark theme for contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-900 z-0"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-700 via-transparent to-transparent"></div>

            <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
                <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
                    Siap Menjadi Bagian dari <br /> <span className="text-primary-300">Huffadz Jawa Timur?</span>
                </h2>

                <p className="text-lg text-neutral-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                    Bergabunglah dengan ribuan penghafal Al-Qur&apos;an lainnya dan dapatkan manfaat dari program pemerintah provinsi Jawa Timur.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-600/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        Daftar Sekarang
                        <FiArrowRight />
                    </Link>
                    <Link href="/download" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center">
                        Download Aplikasi Mobile
                    </Link>
                </div>
            </div>
        </section>
    );
}
