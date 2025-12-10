import Link from 'next/link';
import { FiUsers, FiFileText, FiAward, FiTrendingUp, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import './globals.css';

export const metadata = {
  title: 'Sistem Pendataan Huffadz Jawa Timur | LPTQ Jawa Timur',
  description: 'Aplikasi pendataan dan pelaporan Huffadz penerima insentif Gubernur Jawa Timur',
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-8 animate-fadeIn">
              <span className="text-2xl">📖</span>
              <span className="font-semibold text-primary-700">LPTQ Jawa Timur</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fadeIn">
              <span className="gradient-text">Sistem Pendataan Huffadz</span>
              <br />
              <span className="text-neutral-800">Jawa Timur</span>
            </h1>

            <p className="text-lg lg:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto animate-fadeIn">
              Platform digital untuk pendataan, seleksi, dan pelaporan kegiatan Huffadz
              penerima insentif Gubernur Jawa Timur melalui dana hibah LPTQ Provinsi Jawa Timur
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slideInRight">
              <Link href="/login" className="btn btn-primary text-lg px-8 py-4">
                Masuk ke Sistem
              </Link>
              <Link href="/register" className="btn btn-secondary text-lg px-8 py-4">
                Daftar Sebagai Hafiz
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="card-glass text-center">
                <div className="text-3xl font-bold gradient-text mb-1">7000+</div>
                <div className="text-sm text-neutral-600">Penerima Insentif</div>
              </div>
              <div className="card-glass text-center">
                <div className="text-3xl font-bold gradient-text mb-1">14,349</div>
                <div className="text-sm text-neutral-600">Total Pendaftar</div>
              </div>
              <div className="card-glass text-center">
                <div className="text-3xl font-bold gradient-text mb-1">38</div>
                <div className="text-sm text-neutral-600">Kab/Kota</div>
              </div>
              <div className="card-glass text-center">
                <div className="text-3xl font-bold gradient-text mb-1">8</div>
                <div className="text-sm text-neutral-600">Periode Tes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Sistem terintegrasi untuk memudahkan pengelolaan data Huffadz se-Jawa Timur
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiUsers />}
              title="Pendataan Huffadz"
              description="Sistem pendataan lengkap dengan data pribadi, hasil tes tahfidz dan wawasan kebangsaan"
              color="primary"
            />
            <FeatureCard
              icon={<FiFileText />}
              title="Laporan Harian"
              description="Pelaporan kegiatan harian Huffadz (mengajar, muroja'ah, khataman) dengan foto dan verifikasi"
              color="accent"
            />
            <FeatureCard
              icon={<FiCalendar />}
              title="Manajemen Tes"
              description="Penjadwalan tes, absensi peserta, dan penugasan penguji secara digital"
              color="success"
            />
            <FeatureCard
              icon={<FiAward />}
              title="Kuota & Seleksi"
              description="Sistem kuota per kabupaten/kota dengan alokasi maksimal 1000 Huffadz per tahun"
              color="warning"
            />
            <FeatureCard
              icon={<FiCheckCircle />}
              title="Verifikasi Multi-Level"
              description="Verifikasi oleh Admin Kab/Ko dan Admin Provinsi untuk akurasi data"
              color="info"
            />
            <FeatureCard
              icon={<FiTrendingUp />}
              title="Statistik & Laporan"
              description="Dashboard statistik real-time dan export laporan untuk SPJ"
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              Alur Sistem
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Proses pendaftaran hingga penerimaan insentif
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <StepCard
                number="1"
                title="Pendaftaran"
                description="Hafiz mendaftar melalui koordinator Kab/Ko atau langsung via website dengan upload KTP dan sertifikat tahfidz"
              />
              <StepCard
                number="2"
                title="Verifikasi Data"
                description="Admin Kab/Ko memverifikasi kelengkapan data dan kesesuaian dengan kuota daerah"
              />
              <StepCard
                number="3"
                title="Tes Seleksi"
                description="Peserta mengikuti tes tahfidz dan wawasan kebangsaan sesuai jadwal yang ditentukan"
              />
              <StepCard
                number="4"
                title="Pengumuman Hasil"
                description="Admin Provinsi mengumumkan hasil kelulusan dan menerbitkan piagam"
              />
              <StepCard
                number="5"
                title="Pelaporan Harian"
                description="Huffadz yang lulus wajib mengisi laporan harian kegiatan sebagai syarat pencairan insentif"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Siap Bergabung?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Daftarkan diri Anda sebagai Huffadz atau login untuk mengakses sistem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn bg-white text-primary-700 hover:bg-neutral-100 text-lg px-8 py-4">
              Daftar Sekarang
            </Link>
            <Link href="/login" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">LPTQ Jawa Timur</h3>
              <p className="text-neutral-400 text-sm">
                Lembaga Pengembangan Tilawatil Quran Provinsi Jawa Timur
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="text-neutral-400 text-sm space-y-2">
                <p>Email: info@lptq.jatimprov.go.id</p>
                <p>Website: lptq.jatimprov.go.id</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Informasi</h4>
              <div className="text-neutral-400 text-sm space-y-2">
                <p>Insentif: Rp 250.000/bulan</p>
                <p>Kuota: 1000 Huffadz/tahun</p>
                <p>Periode: 2015 - Sekarang</p>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400 text-sm">
            <p>© 2026 LPTQ Provinsi Jawa Timur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-orange-500 to-orange-600',
    info: 'from-blue-500 to-blue-600'
  };

  return (
    <div className="card group cursor-pointer">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
        flex items-center justify-center text-white text-2xl mb-4 
        group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary 
        flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {number}
      </div>
      <div className="flex-1 card">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">{title}</h3>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  );
}
