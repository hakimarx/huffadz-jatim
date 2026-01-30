'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function CTASection() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 -z-10"></div>
            {/* Pattern overlay - using SVG/CSS pattern instead of image to reduce requests */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:20px_20px] -z-10"></div>

            <div className="max-w-4xl mx-auto px-4 text-center text-white">
                <h2 className="font-display text-4xl lg:text-6xl font-bold mb-8 tracking-tight">
                    Siap Menjadi Bagian dari <br /> Huffadz Jawa Timur?
                </h2>
                <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                    Bergabunglah dengan ribuan penghafal Al-Qur&apos;an lainnya dan dapatkan manfaat dari program pemerintah provinsi Jawa Timur.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <Link href="/register" className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg flex items-center justify-center gap-2">
                        Daftar Sekarang
                        <FiArrowRight />
                    </Link>
                    <Link href="/download" className="px-8 py-4 bg-primary-700/50 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-primary-700/70 transition-all text-lg">
                        Download Aplikasi Mobile
                    </Link>
                </div>
            </div>
        </section>
    );
}
