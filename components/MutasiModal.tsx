'use client';

import { useState } from 'react';
import { FiX, FiMapPin, FiLoader, FiAlertTriangle } from 'react-icons/fi';

// Daftar Kabupaten/Kota di Jawa Timur
export const KABUPATEN_KOTA_JATIM = [
    'Kota Surabaya',
    'Kota Malang',
    'Kota Kediri',
    'Kota Blitar',
    'Kota Mojokerto',
    'Kota Madiun',
    'Kota Pasuruan',
    'Kota Probolinggo',
    'Kota Batu',
    'Kabupaten Gresik',
    'Kabupaten Sidoarjo',
    'Kabupaten Mojokerto',
    'Kabupaten Jombang',
    'Kabupaten Bojonegoro',
    'Kabupaten Tuban',
    'Kabupaten Lamongan',
    'Kabupaten Madiun',
    'Kabupaten Magetan',
    'Kabupaten Ngawi',
    'Kabupaten Ponorogo',
    'Kabupaten Pacitan',
    'Kabupaten Kediri',
    'Kabupaten Nganjuk',
    'Kabupaten Blitar',
    'Kabupaten Tulungagung',
    'Kabupaten Trenggalek',
    'Kabupaten Malang',
    'Kabupaten Pasuruan',
    'Kabupaten Probolinggo',
    'Kabupaten Lumajang',
    'Kabupaten Jember',
    'Kabupaten Bondowoso',
    'Kabupaten Situbondo',
    'Kabupaten Banyuwangi',
    'Kabupaten Sampang',
    'Kabupaten Pamekasan',
    'Kabupaten Sumenep',
    'Kabupaten Bangkalan'
];

interface MutasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    hafiz: {
        id: string;
        nik: string;
        nama: string;
        kabupaten_kota: string;
    };
    currentUserId: string;
    onSuccess: () => void;
}

export default function MutasiModal({ isOpen, onClose, hafiz, currentUserId, onSuccess }: MutasiModalProps) {
    const [kabupatenTujuan, setKabupatenTujuan] = useState('');
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMutasi = async () => {
        if (!kabupatenTujuan) {
            setError('Pilih kabupaten/kota tujuan');
            return;
        }

        if (kabupatenTujuan === hafiz.kabupaten_kota) {
            setError('Kabupaten/kota tujuan tidak boleh sama dengan asal');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Update hafiz's kabupaten_kota using MySQL API
            const response = await fetch(`/api/hafiz/${hafiz.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kabupaten_kota: kabupatenTujuan,
                    keterangan: `[MUTASI ${new Date().toLocaleDateString('id-ID')}] Dari ${hafiz.kabupaten_kota} ke ${kabupatenTujuan}. Alasan: ${alasan || '-'}`
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal memproses mutasi');
            }

            alert(`✅ Mutasi berhasil!\n\n${hafiz.nama} telah dipindahkan dari ${hafiz.kabupaten_kota} ke ${kabupatenTujuan}`);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Error processing mutation:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Gagal memproses mutasi: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter out current kabupaten from the list
    const availableKabupaten = KABUPATEN_KOTA_JATIM.filter(k => k !== hafiz.kabupaten_kota);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <FiMapPin className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-800">Mutasi Hafiz</h2>
                            <p className="text-sm text-neutral-600">Pindahkan ke Kabupaten/Kota lain</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Hafiz Info */}
                    <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-sm text-neutral-500 mb-1">Data Hafiz</div>
                        <div className="font-bold text-neutral-800">{hafiz.nama}</div>
                        <div className="text-sm text-neutral-600">NIK: {hafiz.nik}</div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                                📍 {hafiz.kabupaten_kota}
                            </span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <FiAlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-amber-800">
                            <strong>Perhatian:</strong> Mutasi akan memindahkan hafiz ke kabupaten/kota baru.
                            Hafiz akan muncul di daftar Admin Kab/Ko tujuan.
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Kabupaten Tujuan */}
                    <div className="form-group">
                        <label className="form-label required">
                            Kabupaten/Kota Tujuan
                        </label>
                        <select
                            className="form-select"
                            value={kabupatenTujuan}
                            onChange={(e) => setKabupatenTujuan(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Pilih Kabupaten/Kota --</option>
                            {availableKabupaten.map(kab => (
                                <option key={kab} value={kab}>{kab}</option>
                            ))}
                        </select>
                    </div>

                    {/* Alasan */}
                    <div className="form-group">
                        <label className="form-label">
                            Alasan Mutasi (Opsional)
                        </label>
                        <textarea
                            className="form-textarea"
                            placeholder="Contoh: Pindah domisili, koreksi data, dll..."
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {/* Preview */}
                    {kabupatenTujuan && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="text-sm text-green-800">
                                <strong>Preview Mutasi:</strong>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                                        {hafiz.kabupaten_kota}
                                    </span>
                                    <span className="text-green-600">→</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                                        {kabupatenTujuan}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 flex gap-3">
                    <button
                        onClick={handleMutasi}
                        className="btn btn-primary flex-1"
                        disabled={loading || !kabupatenTujuan}
                    >
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <FiMapPin />
                                Proses Mutasi
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
