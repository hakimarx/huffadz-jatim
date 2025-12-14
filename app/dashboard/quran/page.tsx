'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiSearch, FiVolume2, FiBookOpen, FiArrowLeft, FiHome } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    translation?: string;
    audio?: string;
}

export default function QuranPage() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);

    // Fetch daftar surah
    useEffect(() => {
        fetchSurahs();
    }, []);

    const fetchSurahs = async () => {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            if (data.code === 200) {
                setSurahs(data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching surahs:', error);
            setLoading(false);
        }
    };

    // Fetch ayat dari surah yang dipilih
    const fetchAyahs = async (surahNumber: number) => {
        setLoading(true);
        try {
            // Fetch Arabic text (Uthmani script - Madinah Mushaf style)
            const arabicResponse = await fetch(
                `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`
            );
            const arabicData = await arabicResponse.json();

            // Fetch Indonesian translation
            const translationResponse = await fetch(
                `https://api.alquran.cloud/v1/surah/${surahNumber}/id.indonesian`
            );
            const translationData = await translationResponse.json();

            if (arabicData.code === 200 && translationData.code === 200) {
                const combinedAyahs = arabicData.data.ayahs.map((ayah: any, index: number) => ({
                    number: ayah.number,
                    text: ayah.text,
                    numberInSurah: ayah.numberInSurah,
                    translation: translationData.data.ayahs[index]?.text || '',
                    audio: ayah.audio || '',
                }));
                setAyahs(combinedAyahs);
                setSelectedSurah(surahNumber);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ayahs:', error);
            setLoading(false);
        }
    };

    // Play audio
    const playAudio = (audioUrl: string, ayahNumber: number) => {
        if (currentAudio) {
            currentAudio.pause();
        }

        const audio = new Audio(audioUrl);
        audio.play();
        setCurrentAudio(audio);
        setPlayingAyah(ayahNumber);

        audio.onended = () => {
            setPlayingAyah(null);
        };
    };

    // Filter surah berdasarkan pencarian
    const filteredSurahs = surahs.filter(
        (surah) =>
            surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Sidebar */}
            <Sidebar userRole="hafiz" userName="User" />

            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-emerald-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                            <FiBook className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Al-Quran Digital
                            </h1>
                            <p className="text-gray-600 mt-1">Mushaf Madinah - Rasm Uthmani</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-6">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Cari surah... (nama, nomor, atau terjemahan)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-lg"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daftar Surah */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 max-h-[800px] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                                <FiBookOpen />
                                Daftar Surah
                            </h2>

                            {loading && !selectedSurah ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Memuat daftar surah...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredSurahs.map((surah) => (
                                        <button
                                            key={surah.number}
                                            onClick={() => fetchAyahs(surah.number)}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedSurah === surah.number
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${selectedSurah === surah.number
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-emerald-200 text-emerald-700'
                                                            }`}
                                                    >
                                                        {surah.number}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{surah.englishName}</p>
                                                        <p className={`text-sm ${selectedSurah === surah.number ? 'text-emerald-100' : 'text-gray-600'}`}>
                                                            {surah.englishNameTranslation}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-arabic text-2xl">{surah.name}</p>
                                                    <p className={`text-xs ${selectedSurah === surah.number ? 'text-emerald-100' : 'text-gray-500'}`}>
                                                        {surah.numberOfAyahs} ayat
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
                                        Selamat Datang di Al-Quran Digital
                                    </h3>
                                    <p className="text-gray-600 max-w-md">
                                        Pilih surah dari daftar di sebelah kiri untuk mulai membaca Al-Quran
                                        dengan terjemahan Bahasa Indonesia dan audio murattal.
                                    </p>
                                </div>
                            ) : loading ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4 text-lg">Memuat ayat-ayat...</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Header Surah */}
                                    <div className="text-center mb-8 pb-6 border-b-2 border-emerald-200">
                                        <h2 className="text-3xl font-bold text-emerald-700 mb-2">
                                            {surahs.find((s) => s.number === selectedSurah)?.englishName}
                                        </h2>
                                        <p className="text-gray-600 text-lg">
                                            {surahs.find((s) => s.number === selectedSurah)?.englishNameTranslation}
                                        </p>
                                        <p className="text-4xl font-arabic mt-4 text-emerald-800">
                                            {surahs.find((s) => s.number === selectedSurah)?.name}
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
                                        {ayahs.map((ayah) => (
                                            <div
                                                key={ayah.number}
                                                className="p-6 bg-gradient-to-br from-white to-emerald-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg"
                                            >
                                                {/* Nomor Ayat */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                            {ayah.numberInSurah}
                                                        </div>
                                                        <span className="text-gray-600 font-medium">
                                                            Ayat {ayah.numberInSurah}
                                                        </span>
                                                    </div>
                                                    {ayah.audio && (
                                                        <button
                                                            onClick={() => playAudio(ayah.audio!, ayah.number)}
                                                            className={`p-3 rounded-full transition-all duration-300 ${playingAyah === ayah.number
                                                                ? 'bg-emerald-500 text-white shadow-lg scale-110'
                                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                }`}
                                                        >
                                                            <FiVolume2 className="text-xl" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Teks Arab */}
                                                <p className="text-3xl font-arabic text-right leading-loose mb-4 text-gray-800">
                                                    {ayah.text}
                                                </p>

                                                {/* Terjemahan */}
                                                <div className="pt-4 border-t border-emerald-200">
                                                    <p className="text-gray-700 leading-relaxed text-lg">
                                                        {ayah.translation}
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
