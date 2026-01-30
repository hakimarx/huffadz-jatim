import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import './globals.css';

// Dynamic Imports for Code Splitting (Below the fold content)
const FeaturesSection = dynamic(() => import('@/components/home/FeaturesSection'), {
  loading: () => <div className="h-96 flex items-center justify-center text-neutral-400">Loading Features...</div>
});
const HowItWorksSection = dynamic(() => import('@/components/home/HowItWorksSection'));
const CTASection = dynamic(() => import('@/components/home/CTASection'));
const HomeFooter = dynamic(() => import('@/components/home/HomeFooter'));

export const metadata = {
  title: 'Sistem Pendataan Huffadz Jawa Timur | LPTQ Jawa Timur',
  description: 'Aplikasi resmi pendataan dan pelaporan Huffadz penerima insentif Gubernur Jawa Timur. Kelola data hafalan, tes, dan insentif secara terintegrasi.',
  keywords: ['huffadz', 'jawa timur', 'lptq', 'hafiz', 'quran', 'insentif gubernur'],
  openGraph: {
    title: 'Sistem Pendataan Huffadz Jawa Timur',
    description: 'Platform digital terintegrasi untuk Huffadz Jawa Timur.',
    url: 'https://huffadz.jatimprov.go.id',
    siteName: 'Huffadz Jatim',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistem Pendataan Huffadz Jawa Timur',
    description: 'Aplikasi resmi pendataan Huffadz Jawa Timur.',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-primary-500 selection:text-white bg-neutral-50">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <HomeFooter />
    </div>
  );
}
