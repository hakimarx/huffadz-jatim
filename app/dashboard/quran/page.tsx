'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiSearch, FiVolume2, FiBookOpen, FiArrowLeft, FiHome, FiLoader, FiInfo, FiX } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// API Configuration - Using local proxy to avoid CORS
const API_PROXY_URL = '/api/quran';

interface SurahKemenag {
    id: number;
    nama_surah: string;
    jumlah_ayat: number;
    nomor_surah: number;
    arti: string;
    nama_latin: string;
    tempat_turun: string;
}

interface AyatKemenag {
    id: number;
    id_surah: number;
    nomor_ayat: number;
    teks_arab: string;
    teks_latin: string;
    terjemahan: string;
    no_urut: number;
}

interface TafsirKemenag {
    id: number;
    id_ayat: number;
    tafsir: string;
}

interface UserData {
    id: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    foto_profil?: string;
}

export default function QuranPage() {
    const [surahs, setSurahs] = useState<SurahKemenag[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
    const [selectedSurahData, setSelectedSurahData] = useState<SurahKemenag | null>(null);
    const [ayahs, setAyahs] = useState<AyatKemenag[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAyahs, setLoadingAyahs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Tafsir modal state
    const [showTafsir, setShowTafsir] = useState(false);
    const [tafsirData, setTafsirData] = useState<string | null>(null);
    const [tafsirAyat, setTafsirAyat] = useState<number | null>(null);
    const [loadingTafsir, setLoadingTafsir] = useState(false);

    // User state
    const [user, setUser] = useState<UserData | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    const supabase = createClient();

    // Fetch user data
    useEffect(() => {
        async function fetchUserData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('id, nama, role, foto_profil')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (userData) {
                        setUser(userData as UserData);
                    } else {
                        // Fallback for users without profile
                        setUser({
                            id: session.user.id,
                            nama: session.user.email?.split('@')[0] || 'User',
                            role: 'hafiz'
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setUserLoading(false);
            }
        }

        fetchUserData();
    }, [supabase]);

    // Fetch daftar surah dari API Kemenag via proxy
    useEffect(() => {
        fetchSurahs();
    }, []);

    const fetchSurahs = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all 114 surahs via local proxy
            const response = await fetch(`${API_PROXY_URL}?endpoint=surah/local/1/114`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data && Array.isArray(data)) {
                setSurahs(data);
            } else if (data.data && Array.isArray(data.data)) {
                setSurahs(data.data);
            } else {
                throw new Error('Invalid response format');
            }

            setLoading(false);
        } catch (error: any) {
            console.error('Error fetching surahs:', error);
            setError('Gagal memuat daftar surah. ' + (error.message || 'Silakan coba lagi.'));
            setLoading(false);
        }
    };

    // Fetch ayat dari surah yang dipilih
    const fetchAyahs = async (noSurah: number) => {
        setLoadingAyahs(true);
        setError(null);
        try {
            // Fetch ayat via local proxy
            const response = await fetch(`${API_PROXY_URL}?endpoint=ayat/local/${noSurah}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data && Array.isArray(data)) {
                setAyahs(data);
            } else if (data.data && Array.isArray(data.data)) {
                setAyahs(data.data);
            } else {
                throw new Error('Invalid response format');
            }

            // Find and set selected surah data
            const surahData = surahs.find(s => s.nomor_surah === noSurah);
            setSelectedSurahData(surahData || null);
            setSelectedSurah(noSurah);
            setLoadingAyahs(false);
        } catch (error: any) {
            console.error('Error fetching ayahs:', error);
            setError('Gagal memuat ayat. ' + (error.message || 'Silakan coba lagi.'));
            setLoadingAyahs(false);
        }
    };

    // Fetch tafsir dari Kemenag API via proxy
    const fetchTafsir = async (noUrutAyat: number, nomorAyat: number) => {
        setLoadingTafsir(true);
        setTafsirAyat(nomorAyat);
        setShowTafsir(true);
        setTafsirData(null);

        try {
            // Fetch tafsir via local proxy
            const response = await fetch(`${API_PROXY_URL}?endpoint=ayat/local/tafsir/${noUrutAyat}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data && data.tafsir) {
                setTafsirData(data.tafsir);
            } else if (data.data && data.data.tafsir) {
                setTafsirData(data.data.tafsir);
            } else if (typeof data === 'string') {
                setTafsirData(data);
            } else if (Array.isArray(data) && data[0]?.tafsir) {
                setTafsirData(data[0].tafsir);
            } else {
                setTafsirData('Tafsir tidak tersedia untuk ayat ini.');
            }

            setLoadingTafsir(false);
        } catch (error: any) {
            console.error('Error fetching tafsir:', error);
            setTafsirData('Gagal memuat tafsir. ' + (error.message || 'Silakan coba lagi.'));
            setLoadingTafsir(false);
        }
    };

    // Filter surah berdasarkan pencarian
    const filteredSurahs = surahs.filter(
        (surah) =>
            surah.nama_surah?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.nama_latin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.arti?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.nomor_surah?.toString().includes(searchQuery)
    );

    // Show loading while fetching user
    if (userLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Sidebar */}
            <Sidebar
                userRole={user?.role || 'hafiz'}
                userName={user?.nama || 'User'}
                userPhoto={user?.foto_profil}
            />

            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-emerald-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                            <FiBook className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Mushaf Indonesia
                            </h1>
                            <p className="text-gray-600 mt-1">Al-Quran Digital - Kementerian Agama RI</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-6">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Cari surah... (nama, nomor, atau arti)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-lg"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                            <button
                                onClick={() => {
                                    if (!selectedSurah) fetchSurahs();
                                    else fetchAyahs(selectedSurah);
                                }}
                                className="ml-4 text-red-600 underline hover:text-red-800"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daftar Surah */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 max-h-[800px] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                                <FiBookOpen />
                                Daftar Surah
                            </h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Memuat daftar surah...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredSurahs.map((surah) => (
                                        <button
                                            key={surah.nomor_surah}
                                            onClick={() => fetchAyahs(surah.nomor_surah)}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedSurah === surah.nomor_surah
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${selectedSurah === surah.nomor_surah
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-emerald-200 text-emerald-700'
                                                            }`}
                                                    >
                                                        {surah.nomor_surah}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{surah.nama_latin}</p>
                                                        <p className={`text-sm ${selectedSurah === surah.nomor_surah ? 'text-emerald-100' : 'text-gray-600'}`}>
                                                            {surah.arti}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-arabic text-2xl">{surah.nama_surah}</p>
                                                    <p className={`text-xs ${selectedSurah === surah.nomor_surah ? 'text-emerald-100' : 'text-gray-500'}`}>
                                                        {surah.jumlah_ayat} ayat • {surah.tempat_turun}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tampilan Ayat */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100 min-h-[800px]">
                            {!selectedSurah ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                                        <FiBook className="text-6xl text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Selamat Datang di Mushaf Indonesia
                                    </h3>
                                    <p className="text-gray-600 max-w-md">
                                        Pilih surah dari daftar di sebelah kiri untuk mulai membaca Al-Quran
                                        dengan terjemahan resmi Kementerian Agama Republik Indonesia.
                                    </p>
                                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                                        <p className="font-semibold">Fitur:</p>
                                        <ul className="mt-2 text-left list-disc list-inside">
                                            <li>Teks Arab dengan Rasm Uthmani</li>
                                            <li>Transliterasi Latin</li>
                                            <li>Terjemahan Kemenag RI</li>
                                            <li>Tafsir Kemenag</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : loadingAyahs ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4 text-lg">Memuat ayat-ayat...</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Header Surah */}
                                    <div className="text-center mb-8 pb-6 border-b-2 border-emerald-200">
                                        <h2 className="text-3xl font-bold text-emerald-700 mb-2">
                                            {selectedSurahData?.nama_latin}
                                        </h2>
                                        <p className="text-gray-600 text-lg">
                                            {selectedSurahData?.arti}
                                        </p>
                                        <p className="text-4xl font-arabic mt-4 text-emerald-800">
                                            {selectedSurahData?.nama_surah}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {selectedSurahData?.jumlah_ayat} ayat • {selectedSurahData?.tempat_turun}
                                        </p>
                                    </div>

                                    {/* Bismillah (kecuali At-Taubah) */}
                                    {selectedSurah !== 9 && selectedSurah !== 1 && (
                                        <div className="text-center mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                                            <p className="text-4xl font-arabic text-emerald-800">
                                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                            </p>
                                        </div>
                                    )}

                                    {/* Ayat-ayat */}
                                    <div className="space-y-6">
                                        {ayahs.map((ayat) => (
                                            <div
                                                key={ayat.id || ayat.nomor_ayat}
                                                className="p-6 bg-gradient-to-br from-white to-emerald-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-400 hover:border-[3px] hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-200/50 hover:scale-[1.01] cursor-pointer group"
                                            >
                                                {/* Nomor Ayat */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                            {ayat.nomor_ayat}
                                                        </div>
                                                        <span className="text-gray-600 font-medium">
                                                            Ayat {ayat.nomor_ayat}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => fetchTafsir(ayat.no_urut || ayat.id, ayat.nomor_ayat)}
                                                        className="p-3 rounded-full transition-all duration-300 bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-2"
                                                        title="Lihat Tafsir"
                                                    >
                                                        <FiInfo className="text-xl" />
                                                        <span className="text-sm font-medium hidden sm:inline">Tafsir</span>
                                                    </button>
                                                </div>

                                                {/* Teks Arab */}
                                                <p className="text-3xl font-arabic text-right leading-loose mb-4 text-gray-800">
                                                    {ayat.teks_arab}
                                                </p>

                                                {/* Transliterasi Latin */}
                                                {ayat.teks_latin && (
                                                    <p className="text-lg text-emerald-600 italic mb-4 leading-relaxed">
                                                        {ayat.teks_latin}
                                                    </p>
                                                )}

                                                {/* Terjemahan */}
                                                <div className="pt-4 border-t border-emerald-200">
                                                    <p className="text-gray-700 leading-relaxed text-lg">
                                                        {ayat.terjemahan}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tafsir Modal */}
            {showTafsir && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">Tafsir Kemenag</h3>
                                <p className="text-amber-100 text-sm">
                                    {selectedSurahData?.nama_latin} Ayat {tafsirAyat}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTafsir(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {loadingTafsir ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Memuat tafsir...</p>
                                </div>
                            ) : (
                                <div className="prose prose-emerald max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {tafsirData}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap');
                
                .font-arabic {
                    font-family: 'Amiri Quran', 'Traditional Arabic', serif;
                    direction: rtl;
                }
            `}</style>
        </div>
    );
}
