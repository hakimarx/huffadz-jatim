'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiCamera, FiX, FiLoader, FiCheck, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import ImageEditor from './ImageEditor';
import Tesseract from 'tesseract.js';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';

interface KtpData {
    nik: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
}

interface KtpOcrUploaderProps {
    onDataExtracted: (data: KtpData, imageFile: File) => void;
    onSkip?: () => void;
}

export default function KtpOcrUploader({ onDataExtracted, onSkip }: KtpOcrUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<KtpData | null>(null);
    const [rawText, setRawText] = useState<string>('');
    const [showEditor, setShowEditor] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const maxSizeKB = 500;
            const maxSizeBytes = maxSizeKB * 1024;

            let processedFile = selectedFile;
            setCompressionInfo(null);

            // Compress if larger than 500KB
            if (selectedFile.size > maxSizeBytes) {
                setCompressing(true);
                try {
                    processedFile = await compressImage(selectedFile, { maxSizeKB });
                    setCompressionInfo({
                        original: selectedFile.size,
                        compressed: processedFile.size
                    });
                } catch (compErr) {
                    console.error('Compression error:', compErr);
                    // Continue with original file if compression fails
                } finally {
                    setCompressing(false);
                }
            }

            setFile(processedFile);
            setPreviewUrl(URL.createObjectURL(processedFile));
            setError(null);
            setExtractedData(null);
            setRawText('');
            setProgress(0);
        }
    };

    const handleEditedImage = (editedFile: File) => {
        setFile(editedFile);
        setPreviewUrl(URL.createObjectURL(editedFile));
        setShowEditor(false);
    };

    const processKtp = async () => {
        if (!file) {
            setError('Pilih file KTP terlebih dahulu');
            return;
        }

        setProcessing(true);
        setError(null);
        setProgress(0);

        try {
            // Use Tesseract.js for OCR
            const result = await Tesseract.recognize(
                file,
                'ind+eng', // Indonesian + English language pack
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            setRawText(text);

            // Parse the OCR text to extract KTP data
            const parsedData = parseKtpText(text);
            setExtractedData(parsedData);

            // Check if any useful data was extracted
            const hasData = parsedData.nik || parsedData.nama;
            if (!hasData) {
                setError('Tidak dapat membaca data dari foto. Coba foto yang lebih jelas atau isi data secara manual.');
            }

        } catch (err: any) {
            console.error('OCR Error:', err);
            setError('Gagal membaca KTP. Pastikan foto jelas dan tidak blur. Error: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const parseKtpText = (text: string): KtpData => {
        // Normalize text
        const normalizedText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .toUpperCase();

        const lines = normalizedText.split('\n').map(l => l.trim()).filter(l => l);

        // Extract NIK (16 digits)
        let nik = '';
        const nikPatterns = [
            /\b(\d{16})\b/,  // Plain 16 digits
            /NIK\s*[:\s]\s*(\d{16})/i,
            /NIK\s*(\d{16})/i,
            /(\d{4}[\s.-]?\d{4}[\s.-]?\d{4}[\s.-]?\d{4})/  // Formatted NIK
        ];

        for (const pattern of nikPatterns) {
            const match = normalizedText.match(pattern);
            if (match) {
                nik = match[1].replace(/[\s.-]/g, '');
                if (nik.length === 16) break;
            }
        }

        // Helper function to find value after a label
        const findValue = (patterns: string[]): string => {
            for (const line of lines) {
                for (const pattern of patterns) {
                    const regex = new RegExp(pattern + '\\s*[:\\s]\\s*(.+)', 'i');
                    const match = line.match(regex);
                    if (match && match[1]) {
                        return match[1].trim();
                    }
                }
            }
            return '';
        };

        // Extract name
        let nama = findValue(['NAMA']);
        if (!nama) {
            // Try to find line after NIK or before TEMPAT
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('NAMA') && lines[i + 1]) {
                    nama = lines[i + 1].replace(/[^A-Z\s']/g, '').trim();
                    break;
                }
            }
        }

        // Extract tempat/tanggal lahir
        let tempatTanggal = findValue(['TEMPAT', 'TTL', 'LAHIR']);
        let tempat_lahir = '';
        let tanggal_lahir = '';

        if (tempatTanggal) {
            // Format: "SURABAYA, 01-01-1990" or "SURABAYA 01-01-1990"
            const ttlMatch = tempatTanggal.match(/([A-Z\s]+)[,\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
            if (ttlMatch) {
                tempat_lahir = ttlMatch[1].trim();
                tanggal_lahir = ttlMatch[2];
            } else {
                // Just city name
                tempat_lahir = tempatTanggal.replace(/[\d\-\/]/g, '').trim();
            }
        }

        // Extract jenis kelamin
        let jenis_kelamin = '';
        if (normalizedText.includes('PEREMPUAN') || normalizedText.includes('WANITA')) {
            jenis_kelamin = 'P';
        } else if (normalizedText.includes('LAKI-LAKI') || normalizedText.includes('LAKI')) {
            jenis_kelamin = 'L';
        }

        // Extract alamat
        let alamat = findValue(['ALAMAT']);

        // Extract RT/RW
        let rt = '';
        let rw = '';
        const rtRwMatch = normalizedText.match(/RT\s*[\/:]?\s*(\d+)\s*[\/:]?\s*RW\s*[\/:]?\s*(\d+)/i);
        if (rtRwMatch) {
            rt = rtRwMatch[1];
            rw = rtRwMatch[2];
        }

        // Extract Kel/Desa
        let desa_kelurahan = findValue(['KEL', 'DESA', 'KELURAHAN']);

        // Extract Kecamatan
        let kecamatan = findValue(['KEC', 'KECAMATAN']);

        // Extract Kabupaten/Kota from province line
        let kabupaten_kota = '';
        for (const line of lines) {
            if (line.includes('PROVINSI') || line.includes('JAWA TIMUR') ||
                line.includes('KABUPATEN') || line.includes('KOTA')) {
                // Extract city/regency name
                const kotaMatch = line.match(/(KOTA|KABUPATEN)\s+([A-Z\s]+)/);
                if (kotaMatch) {
                    kabupaten_kota = kotaMatch[0].trim();
                }
            }
        }

        return {
            nik,
            nama: nama.replace(/[^A-Z\s']/g, '').trim(),
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            alamat,
            rt,
            rw,
            desa_kelurahan: desa_kelurahan.replace(/[^A-Z\s]/g, '').trim(),
            kecamatan: kecamatan.replace(/[^A-Z\s]/g, '').trim(),
            kabupaten_kota
        };
    };

    const handleUseData = () => {
        if (extractedData && file) {
            onDataExtracted(extractedData, file);
        }
    };

    const handleManualEntry = () => {
        if (file) {
            onDataExtracted({
                nik: '',
                nama: '',
                tempat_lahir: '',
                tanggal_lahir: '',
                jenis_kelamin: '',
                alamat: '',
                rt: '',
                rw: '',
                desa_kelurahan: '',
                kecamatan: '',
                kabupaten_kota: ''
            }, file);
        } else if (onSkip) {
            onSkip();
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300">
                <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                        {compressing ? (
                            <FiLoader className="text-blue-600 animate-spin" size={32} />
                        ) : (
                            <FiCamera className="text-blue-600" size={32} />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">
                        {compressing ? 'Mengkompres Foto...' : 'Upload Foto KTP'}
                    </h3>
                    <p className="text-neutral-600 mb-4 max-w-md mx-auto">
                        {compressing
                            ? 'Mohon tunggu, foto sedang dikompres...'
                            : 'Upload foto KTP untuk mengisi data secara otomatis menggunakan teknologi OCR'}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={compressing}
                    />

                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-primary"
                            disabled={compressing}
                        >
                            <FiUpload /> Pilih Foto KTP
                        </button>
                        {onSkip && (
                            <button onClick={onSkip} className="btn btn-secondary" disabled={compressing}>
                                Lewati, Isi Manual
                            </button>
                        )}
                    </div>

                    {/* Compression Info */}
                    {compressionInfo && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg mt-4 max-w-md mx-auto">
                            <FiCheck />
                            <span>
                                Foto dikompres dari {formatFileSize(compressionInfo.original)} → {formatFileSize(compressionInfo.compressed)}
                            </span>
                        </div>
                    )}

                    <p className="text-xs text-neutral-500 mt-4">
                        Maks 500KB - file lebih besar akan dikompres otomatis
                    </p>
                </div>
            </div>

            {/* Preview Section */}
            {previewUrl && (
                <div className="card">
                    <h4 className="font-semibold text-neutral-800 mb-4">Preview KTP</h4>

                    <div className="relative bg-neutral-100 rounded-lg overflow-hidden mb-4">
                        <img
                            src={previewUrl}
                            alt="Preview KTP"
                            className="w-full max-h-80 object-contain"
                        />
                        <button
                            onClick={() => setShowEditor(true)}
                            className="absolute top-2 right-2 btn btn-secondary text-sm"
                        >
                            <FiEdit2 /> Edit Gambar
                        </button>
                    </div>

                    {/* Progress bar */}
                    {processing && (
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Memproses OCR...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-warning mb-4">
                            <FiAlertCircle /> {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={processKtp}
                            className="btn btn-primary flex-1"
                            disabled={processing}
                        >
                            {processing ? (
                                <><FiLoader className="animate-spin" /> Memproses...</>
                            ) : (
                                'Proses OCR & Baca Data'
                            )}
                        </button>
                        <button
                            onClick={handleManualEntry}
                            className="btn btn-secondary"
                            disabled={processing}
                        >
                            Isi Manual
                        </button>
                    </div>
                </div>
            )}

            {/* Extracted Data Preview */}
            {extractedData && (
                <div className="card border-2 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                        <FiCheck className="text-green-600" />
                        Data Berhasil Terbaca
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm text-neutral-500">NIK</label>
                            <p className="font-semibold font-mono">{extractedData.nik || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Nama</label>
                            <p className="font-semibold">{extractedData.nama || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Tempat Lahir</label>
                            <p className="font-semibold">{extractedData.tempat_lahir || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Tanggal Lahir</label>
                            <p className="font-semibold">{extractedData.tanggal_lahir || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Jenis Kelamin</label>
                            <p className="font-semibold">
                                {extractedData.jenis_kelamin === 'L' ? 'Laki-laki' :
                                    extractedData.jenis_kelamin === 'P' ? 'Perempuan' :
                                        <span className="text-orange-500">(tidak terbaca)</span>}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Alamat</label>
                            <p className="font-semibold">{extractedData.alamat || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">RT/RW</label>
                            <p className="font-semibold">
                                {(extractedData.rt || extractedData.rw)
                                    ? `${extractedData.rt || '-'}/${extractedData.rw || '-'}`
                                    : <span className="text-orange-500">(tidak terbaca)</span>}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Kel/Desa</label>
                            <p className="font-semibold">{extractedData.desa_kelurahan || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Kecamatan</label>
                            <p className="font-semibold">{extractedData.kecamatan || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-500">Kabupaten/Kota</label>
                            <p className="font-semibold">{extractedData.kabupaten_kota || <span className="text-orange-500">(tidak terbaca)</span>}</p>
                        </div>
                    </div>

                    <div className="alert alert-info mb-4">
                        <small>Data yang tidak terbaca (berwarna oranye) dapat diisi/dikoreksi manual di form selanjutnya</small>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleUseData} className="btn btn-primary flex-1">
                            <FiCheck /> Gunakan Data Ini & Lanjutkan
                        </button>
                        <button onClick={processKtp} className="btn btn-secondary">
                            Proses Ulang
                        </button>
                    </div>

                    {/* Debug: Show raw OCR text (collapsible) */}
                    {rawText && (
                        <details className="mt-4">
                            <summary className="text-sm text-neutral-500 cursor-pointer">
                                Lihat hasil OCR mentah (untuk debugging)
                            </summary>
                            <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                                {rawText}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {/* Image Editor Modal */}
            {showEditor && file && (
                <ImageEditor
                    file={file}
                    onSave={handleEditedImage}
                    onCancel={() => setShowEditor(false)}
                />
            )}
        </div>
    );
}
