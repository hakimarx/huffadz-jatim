'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiCamera, FiX, FiLoader, FiCheck, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import ImageEditor from './ImageEditor';
import Tesseract from 'tesseract.js';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';
import { preprocessImageForOCR } from '@/lib/utils/ocrPreprocessing';

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
            // Preprocess image for better OCR results
            const preprocessedBlob = await preprocessImageForOCR(file);
            const preprocessedFile = new File([preprocessedBlob], 'processed.jpg', { type: 'image/jpeg' });

            // Use Tesseract.js for OCR
            const result = await Tesseract.recognize(
                preprocessedFile,
                'ind', // Focus on Indonesian only for better accuracy on KTP
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    },
                    // Add whitelist for common KTP characters to reduce noise
                    // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-:., ' 
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
                setError('Data kurang jelas terbaca. Mohon pastikan foto KTP terang dan fokus, atau isi manual.');
            }

        } catch (err: any) {
            console.error('OCR Error:', err);
            setError('Gagal membaca KTP. Pastikan foto jelas dan tidak blur. Error: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const parseKtpText = (text: string): KtpData => {
        // Normalize text: remove special chars that are unlikely to be in fields (keep alphanumeric, space, punctuation)
        let normalizedText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .toUpperCase();

        // Fix common OCR substitutions
        normalizedText = normalizedText
            .replace(/\|/g, 'I') // Pipe to I
            .replace(/1/g, 'I')  // 1 to I (context dependent generally, but useful for text)
            .replace(/0/g, 'O'); // 0 to O (will revert for numbers)

        const lines = normalizedText.split('\n').map(l => l.trim()).filter(l => l);

        // Helper to correct numbers (O->0, I->1, B->8, S->5 usually for NIK/Dates)
        const correctNumbers = (str: string) => {
            return str
                .replace(/O/g, '0')
                .replace(/D/g, '0')
                .replace(/I/g, '1')
                .replace(/L/g, '1')
                .replace(/B/g, '8')
                .replace(/S/g, '5')
                .replace(/\?/g, '7') // Common questionable 7
                .replace(/Z/g, '2');
        };

        // Extract NIK (16 digits)
        let nik = '';
        const nikPatterns = [
            /(?:NIK|N1K)\s*[:]?\s*([0-9\sOIlLBDSZ?]{16,20})\b/i, // Relaxed matching
            /\b(\d{16})\b/,
        ];

        for (const pattern of nikPatterns) {
            const match = text.toUpperCase().match(pattern); // Use original text for initial NIK search to avoid over-correction
            if (match) {
                let candidate = correctNumbers(match[1]).replace(/\D/g, ''); // Remove non-digits
                if (candidate.length >= 16) {
                    nik = candidate.substring(0, 16);
                    break;
                }
            }
        }

        // Helper function to find value after a label
        const findValue = (patterns: string[]): string => {
            for (const line of lines) {
                for (const pattern of patterns) {
                    const regex = new RegExp(pattern + '\\s*[:\\s]\\s*(.+)', 'i');
                    const match = line.match(regex);
                    if (match && match[1]) {
                        // Cleanup value
                        return match[1].replace(/[:]/g, '').trim();
                    }
                }
            }
            return '';
        };

        // Extract name
        let nama = findValue(['NAMA']);
        if (!nama) {
            // Fallback: Line after NIK line, or line containing typical name structure if not found
            // Simple heuristic: Look for a line with only letters that is fully uppercase
            for (let i = 0; i < lines.length; i++) {
                if ((lines[i].includes('NAMA') || lines[i].includes('Nama')) && lines[i + 1]) {
                    nama = lines[i + 1].replace(/[^A-Z\s.,']/g, '').trim();
                }
            }
        }

        // Extract tempat/tanggal lahir
        let tempatTanggal = findValue(['TEMPAT', 'TTL', 'LAHIR', 'TGI']);
        let tempat_lahir = '';
        let tanggal_lahir = '';

        if (tempatTanggal) {
            // Try to split by date pattern
            const dateMatch = tempatTanggal.match(/(\d{2}[-\s/]\d{2}[-\s/]\d{4})/);
            if (dateMatch) {
                tanggal_lahir = correctNumbers(dateMatch[1]).replace(/[\s]/g, '-').replace(/\//g, '-');
                // Place is everything before the date
                const placePart = tempatTanggal.substring(0, dateMatch.index).replace(/[^A-Z\s]/g, '').trim();
                tempat_lahir = placePart;
            } else {
                // Heuristic: Last word is year?
                tempat_lahir = tempatTanggal.replace(/[:]/g, '').trim();
            }
        }

        // Re-format date to YYYY-MM-DD for input[type=date]
        if (tanggal_lahir) {
            const parts = tanggal_lahir.split('-');
            if (parts.length === 3) {
                // Assuming DD-MM-YYYY
                tanggal_lahir = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        // Extract jenis kelamin
        let jenis_kelamin = '';
        if (normalizedText.includes('LAKI') || normalizedText.includes('LAK1')) jenis_kelamin = 'L';
        else if (normalizedText.includes('PEREMPUAN') || normalizedText.includes('WANITA')) jenis_kelamin = 'P';

        // Extract alamat
        let alamat = findValue(['ALAMAT']);

        // Extract RT/RW
        let rt = '';
        let rw = '';
        const rtLine = lines.find(l => l.includes('RT') || l.includes('RW'));
        if (rtLine) {
            const rtRwNums = correctNumbers(rtLine).match(/\d+/g);
            if (rtRwNums && rtRwNums.length >= 2) {
                rt = rtRwNums[0].padStart(3, '0');
                rw = rtRwNums[1].padStart(3, '0');
            }
        }

        // Extract Kel/Desa
        let desa_kelurahan = findValue(['KEL', 'DESA']);

        // Extract Kecamatan
        let kecamatan = findValue(['KEC', 'KECAMATAN']);

        // Extract Kabupaten/Kota
        let kabupaten_kota = '';
        for (const line of lines) {
            if (line.includes('KOTA') || line.includes('KABUPATEN')) {
                const cityMatch = line.match(/(?:KOTA|KABUPATEN)\s+([A-Z\s]+)/);
                if (cityMatch) {
                    kabupaten_kota = (line.includes('KOTA') ? 'Kota ' : 'Kabupaten ') + cityMatch[1].trim();
                }
                break; // Prioritize the header
            }
        }

        return {
            nik,
            nama: nama.replace(/[^A-Z\s.,']/g, '').trim(),
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            alamat: alamat.replace(/[:]/g, '').trim(),
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
