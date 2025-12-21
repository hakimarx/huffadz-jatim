'use client';

import { useState, useRef, useCallback } from 'react';
import { FiUpload, FiImage, FiX, FiLoader, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { compressImage, formatFileSize, isImageFile } from '@/lib/utils/imageCompression';

interface ImageUploaderProps {
    onFileSelect: (file: File) => void;
    maxSizeKB?: number;
    accept?: string;
    label?: string;
    helpText?: string;
    currentImageUrl?: string;
    disabled?: boolean;
    preview?: boolean;
}

export default function ImageUploader({
    onFileSelect,
    maxSizeKB = 500,
    accept = 'image/*',
    label = 'Upload Foto',
    helpText,
    currentImageUrl,
    disabled = false,
    preview = true
}: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [compressing, setCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<{
        original: number;
        compressed: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setError(null);
        setCompressionInfo(null);

        // Check if it's an image
        if (!isImageFile(selectedFile)) {
            setError('File harus berupa gambar');
            return;
        }

        const originalSize = selectedFile.size;
        const maxSizeBytes = maxSizeKB * 1024;

        // If file is already under the limit, use it directly
        if (originalSize <= maxSizeBytes) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            onFileSelect(selectedFile);
            return;
        }

        // Compress the image
        setCompressing(true);
        try {
            const compressedFile = await compressImage(selectedFile, { maxSizeKB });
            setFile(compressedFile);
            setPreviewUrl(URL.createObjectURL(compressedFile));
            setCompressionInfo({
                original: originalSize,
                compressed: compressedFile.size
            });
            onFileSelect(compressedFile);
        } catch (err: any) {
            console.error('Compression error:', err);
            setError('Gagal mengkompres gambar: ' + err.message);
        } finally {
            setCompressing(false);
        }
    }, [maxSizeKB, onFileSelect]);

    const handleRemove = useCallback(() => {
        setFile(null);
        setPreviewUrl(currentImageUrl || null);
        setCompressionInfo(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [currentImageUrl]);

    return (
        <div className="space-y-3">
            {/* Label */}
            {label && (
                <label className="form-label">{label}</label>
            )}

            {/* Upload Area */}
            <div className="relative">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || compressing}
                />

                {preview && previewUrl ? (
                    <div className="relative bg-neutral-100 rounded-lg overflow-hidden">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-48 object-contain"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || compressing}
                        className="w-full border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {compressing ? (
                            <div className="flex flex-col items-center gap-2 text-primary-600">
                                <FiLoader className="animate-spin" size={32} />
                                <span className="text-sm font-medium">Mengkompres gambar...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-neutral-500">
                                <FiImage size={32} />
                                <span className="text-sm font-medium">
                                    Klik untuk upload atau drag & drop
                                </span>
                            </div>
                        )}
                    </button>
                )}
            </div>

            {/* Change Button */}
            {preview && previewUrl && !disabled && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                    className="btn btn-secondary text-sm w-full"
                >
                    <FiUpload />
                    Ganti Foto
                </button>
            )}

            {/* Compression Info */}
            {compressionInfo && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    <FiCheckCircle />
                    <span>
                        Dikompres dari {formatFileSize(compressionInfo.original)} → {formatFileSize(compressionInfo.compressed)}
                    </span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <FiAlertTriangle />
                    <span>{error}</span>
                </div>
            )}

            {/* Help Text */}
            {helpText && (
                <span className="form-help">{helpText}</span>
            )}
            {!helpText && (
                <span className="form-help">
                    Maksimal {maxSizeKB}KB. File yang lebih besar akan dikompres secara otomatis.
                </span>
            )}
        </div>
    );
}
