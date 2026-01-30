'use client';

import { FiUsers, FiFileText, FiAward, FiCalendar } from 'react-icons/fi';

export default function HowItWorksSection() {
    return (
        <section className="py-20 bg-white border-t border-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2">
                        <h2 className="font-display text-3xl lg:text-5xl font-bold text-neutral-800 mb-6 leading-tight">
                            Alur Pendaftaran <br /> & Seleksi
                        </h2>
                        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                            Proses yang transparan dan mudah diikuti bagi para calon penerima insentif Huffadz Jawa Timur.
                        </p>
                        <div className="space-y-6">
                            <StepItem number="01" title="Registrasi Online" text="Buat akun dan lengkapi biodata serta dokumen administrasi." />
                            <StepItem number="02" title="Verifikasi Admin" text="Data diverifikasi oleh Admin Kab/Kota setempat." />
                            <StepItem number="03" title="Tes Kompetensi" text="Mengikuti tes hafalan dan wawasan kebangsaan." />
                            <StepItem number="04" title="Pengumuman & Insentif" text="Penerbitan SK Gubernur dan penyaluran insentif." />
                        </div>
                    </div>
                    <div className="lg:w-1/2 relative">
                        {/* Abstract Visual for Steps */}
                        <div className="relative aspect-square w-full max-w-lg mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-accent-100 rounded-[3rem] rotate-3 animate-float opacity-70"></div>
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl flex items-center justify-center p-10 ring-1 ring-neutral-100">
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-3 flex items-center justify-center text-white">
                                            <FiUsers size={20} />
                                        </div>
                                        <h4 className="font-bold text-neutral-800 text-sm mb-1">Pendaftaran</h4>
                                        <p className="text-xs text-neutral-500">Daftar online mudah</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 mt-8 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl mb-3 flex items-center justify-center text-white">
                                            <FiFileText size={20} />
                                        </div>
                                        <h4 className="font-bold text-neutral-800 text-sm mb-1">Verifikasi</h4>
                                        <p className="text-xs text-neutral-500">Periksa dokumen</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mb-3 flex items-center justify-center text-white">
                                            <FiCalendar size={20} />
                                        </div>
                                        <h4 className="font-bold text-neutral-800 text-sm mb-1">Tes Hafalan</h4>
                                        <p className="text-xs text-neutral-500">Jadwal tes teratur</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 mt-8 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-3 flex items-center justify-center text-white">
                                            <FiAward size={20} />
                                        </div>
                                        <h4 className="font-bold text-neutral-800 text-sm mb-1">Sertifikasi</h4>
                                        <p className="text-xs text-neutral-500">SK Gubernur resmi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepItem({ number, title, text }: { number: string, title: string, text: string }) {
    return (
        <div className="flex gap-6 group">
            <span className="font-display text-4xl font-bold bg-gradient-to-br from-primary-400 to-accent-500 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-accent-600 transition-all">{number}</span>
            <div>
                <h4 className="text-lg font-bold text-neutral-800 mb-1">{title}</h4>
                <p className="text-neutral-600 text-sm leading-relaxed">{text}</p>
            </div>
        </div>
    )
}
