'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';


// We can use framer-motion for smooth animations instead of CSS classes if we want "Wow" factor, 
// but sticking to existing CSS classes 'animate-float' etc is safer if framer-motion isn't installed.
// The user said "use best practices... dynamic animations".
// I'll stick to the existing CSS keyframes for now to avoid adding dependencies unless I check package.json.
// Let's check package.json first.

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Dynamic Background Elements - Enhanced for visibility */}
            <div className="absolute inset-0 pointer-events-none -z-10 bg-gradient-to-b from-primary-50/50 to-white">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-[100px] animate-float opacity-70 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent-200/30 rounded-full blur-[100px] animate-float opacity-70 mix-blend-multiply" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full shadow-sm mb-8 animate-fade-in hover:scale-105 transition-transform cursor-default ring-1 ring-neutral-100">
                    <img src="/logo-lptq.png" alt="LPTQ Logo" className="w-6 h-6 object-contain" />
                    <span className="font-semibold text-neutral-700 text-sm tracking-wide">Official Platform LPTQ Jawa Timur</span>
                </div>

                {/* Main Heading */}
                <h1 className="font-display text-5xl lg:text-7xl font-bold mb-8 animate-fade-in tracking-tight leading-[1.1] text-neutral-900" style={{ animationDelay: '0.1s' }}>
                    Pusat Data <br className="hidden lg:block" />
                    <span className="gradient-text">Huffadz Jawa Timur</span>
                </h1>

                <p className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto animate-fade-in leading-relaxed font-light" style={{ animationDelay: '0.2s' }}>
                    Platform digital terintegrasi untuk pendataan dan pelaporan kegiatan Huffadz penerima insentif Gubernur Jawa Timur.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Link href="/login" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-500/20 w-full sm:w-auto">
                        Masuk ke Sistem
                        <FiArrowRight />
                    </Link>
                    <Link href="/register" className="btn btn-outline text-lg px-8 py-4 bg-white/80 backdrop-blur-sm border border-neutral-200 hover:bg-neutral-50 w-full sm:w-auto text-neutral-700">
                        Daftar Hafiz Baru
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <StatCard value="7,000+" label="Penerima Insentif" delay="0.5s" />
                    <StatCard value="14.3K" label="Total Pendaftar" delay="0.6s" />
                    <StatCard value="38" label="Kabupaten/Kota" delay="0.7s" />
                    <StatCard value="8" label="Periode Tes" delay="0.8s" />
                </div>
            </div>
        </section>
    );
}

function StatCard({ value, label, delay }: { value: string, label: string, delay: string }) {
    return (
        <div className="glass p-6 rounded-3xl border border-neutral-200/60 bg-white/60 text-center hover:-translate-y-2 transition-transform duration-300 shadow-lg shadow-neutral-100" style={{ animationDelay: delay }}>
            <h3 className="font-display text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary-600 to-accent-600 mb-2">{value}</h3>
            <p className="text-neutral-600 font-medium text-sm lg:text-base">{label}</p>
        </div>
    );
}
