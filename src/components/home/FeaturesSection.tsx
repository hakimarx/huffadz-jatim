'use client';

import { FiUsers, FiFileText, FiAward, FiTrendingUp, FiCheckCircle, FiActivity } from 'react-icons/fi';

export default function FeaturesSection() {
    return (
        <section className="py-20 relative bg-neutral-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
                        Fitur Unggulan
                    </h2>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Teknologi modern untuk efisiensi pengelolaan data keumatan
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<FiUsers />}
                        title="Database Terpusat"
                        description="Manajemen data Huffadz lengkap dengan profil, riwayat tes, dan prestasi dalam satu platform aman."
                        color="bg-blue-500"
                    />
                    <FeatureCard
                        icon={<FiActivity />}
                        title="Laporan Real-time"
                        description="Pantau kegiatan harian (mengajar & muroja'ah) dengan sistem pelaporan digital yang mudah."
                        color="bg-emerald-500"
                    />
                    <FeatureCard
                        icon={<FiAward />}
                        title="Seleksi & Penilaian"
                        description="Sistem penilaian tes seleksi yang transparan dan akuntabel untuk menjamin kualitas Huffadz."
                        color="bg-amber-500"
                    />
                    <FeatureCard
                        icon={<FiTrendingUp />}
                        title="Monitoring Insentif"
                        description="Tracking penyaluran insentif yang transparan dan tepat sasaran berbasis kinerja."
                        color="bg-purple-500"
                    />
                    <FeatureCard
                        icon={<FiCheckCircle />}
                        title="Verifikasi Berjenjang"
                        description="Validasi data bertingkat dari Admin Kota hingga Provinsi untuk akurasi maksimal."
                        color="bg-pink-500"
                    />
                    <FeatureCard
                        icon={<FiFileText />}
                        title="Arsip Digital"
                        description="Penyimpanan dokumen penting seperti sertifikat dan SK secara digital dan mudah diakses."
                        color="bg-indigo-500"
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    return (
        <div className="card-modern group p-8 rounded-[2rem] bg-white border border-neutral-100 hover:border-primary-100 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <div className={`${color.replace('bg-', 'text-')} opacity-100`}>{icon}</div>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-3">{title}</h3>
            <p className="text-neutral-600 leading-relaxed font-light">{description}</p>
        </div>
    );
}
