import Link from 'next/link';
import { FiUsers, FiFileText, FiAward, FiTrendingUp, FiCheckCircle, FiCalendar, FiArrowRight, FiActivity } from 'react-icons/fi';
import './globals.css';

export const metadata = {
  title: 'Sistem Pendataan Huffadz Jawa Timur | LPTQ Jawa Timur',
  description: 'Aplikasi pendataan dan pelaporan Huffadz penerima insentif Gubernur Jawa Timur',
};

export default function Home() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-primary-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-200/40 rounded-full blur-[120px] animate-float opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent-200/40 rounded-full blur-[120px] animate-float opacity-60 mix-blend-multiply" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-secondary-200/30 rounded-full blur-[100px] animate-float opacity-50 mix-blend-multiply" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full shadow-sm mb-8 animate-fade-in hover:scale-105 transition-transform cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-neutral-600 text-sm tracking-wide">Official Platform LPTQ Jawa Timur</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl lg:text-7xl font-bold mb-8 animate-fade-in tracking-tight leading-[1.1]" style={{ animationDelay: '0.1s' }}>
            Pusat Data <br className="hidden lg:block" />
            <span className="gradient-text">Huffadz Jawa Timur</span>
          </h1>

          <p className="text-xl text-neutral-500 mb-10 max-w-3xl mx-auto animate-fade-in leading-relaxed font-light" style={{ animationDelay: '0.2s' }}>
            Platform digital terintegrasi untuk pendataan dan pelaporan kegiatan Huffadz penerima insentif Gubernur Jawa Timur.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/login" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-500/20 w-full sm:w-auto">
              Masuk ke Sistem
              <FiArrowRight />
            </Link>
            <Link href="/register" className="btn btn-outline text-lg px-8 py-4 bg-white/50 backdrop-blur-sm w-full sm:w-auto">
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

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-light">
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

      {/* How It Works Section - Modern Steps */}
      <section className="py-24 bg-white/50 backdrop-blur-sm border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="font-display text-3xl lg:text-5xl font-bold text-neutral-800 mb-6 leading-tight">
                Alur Pendaftaran <br /> & Seleksi
              </h2>
              <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
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
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-accent-100 rounded-[3rem] rotate-3 animate-float"></div>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl flex items-center justify-center p-12">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 animate-pulse">
                      <div className="w-8 h-8 bg-primary-100 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-neutral-50 rounded w-full"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mt-8">
                      <div className="w-8 h-8 bg-accent-100 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-neutral-50 rounded w-full"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-neutral-50 rounded w-full"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mt-8 animate-pulse" style={{ animationDelay: '1s' }}>
                      <div className="w-8 h-8 bg-emerald-100 rounded-full mb-3"></div>
                      <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-neutral-50 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 -z-10"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] -z-10"></div>

        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-4xl lg:text-6xl font-bold mb-8 tracking-tight">
            Siap Menjadi Bagian dari <br /> Huffadz Jawa Timur?
          </h2>
          <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-light">
            Bergabunglah dengan ribuan penghafal Al-Qur'an lainnya dan dapatkan manfaat dari program pemerintah provinsi Jawa Timur.
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

      {/* Modern Footer */}
      <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
                <span className="font-display font-bold text-2xl text-neutral-800">LPTQ Jawa Timur</span>
              </div>
              <p className="text-neutral-500 leading-relaxed max-w-sm mb-6">
                Lembaga Pengembangan Tilawatil Quran Provinsi Jawa Timur. Berdedikasi untuk memuliakan Al-Qur'an dan memberdayakan para penghafalnya.
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
    </div>
  );
}

function StatCard({ value, label, delay }: { value: string, label: string, delay: string }) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/50 text-center hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: delay }}>
      <h3 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary-600 to-accent-600 mb-2">{value}</h3>
      <p className="text-neutral-500 font-medium text-sm lg:text-base">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="card-modern group p-8 rounded-[2rem]">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <div className={`${color.replace('bg-', 'text-')} opacity-100`}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-3">{title}</h3>
      <p className="text-neutral-500 leading-relaxed font-light">{description}</p>
    </div>
  );
}

function StepItem({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="flex gap-6 group">
      <span className="font-display text-4xl font-bold text-neutral-200 group-hover:text-primary-200 transition-colors">{number}</span>
      <div>
        <h4 className="text-lg font-bold text-neutral-800 mb-1">{title}</h4>
        <p className="text-neutral-500 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
