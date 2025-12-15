'use client';

import { useState, useRef, useEffect } from 'react';
import { FiRotateCw, FiRotateCcw, FiSun, FiZoomIn, FiZoomOut, FiCheck, FiX, FiImage } from 'react-icons/fi';

interface ImageEditorProps {
    file: File | null;
    onSave: (editedFile: File) => void;
    onCancel: () => void;
}

export default function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [zoom, setZoom] = useState(100);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            setImage(img);
            drawImage(img, rotation, brightness, contrast, zoom);
        };
        img.src = URL.createObjectURL(file);

        return () => {
            URL.revokeObjectURL(img.src);
        };
    }, [file]);

    useEffect(() => {
        if (image) {
            drawImage(image, rotation, brightness, contrast, zoom);
        }
    }, [rotation, brightness, contrast, zoom, image]);

    const drawImage = (img: HTMLImageElement, rot: number, bright: number, cont: number, zoomLevel: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions based on rotation
        const rad = (rot * Math.PI) / 180;
        const isRotated90or270 = rot === 90 || rot === 270;

        const scaledWidth = (img.width * zoomLevel) / 100;
        const scaledHeight = (img.height * zoomLevel) / 100;

        const canvasWidth = isRotated90or270 ? scaledHeight : scaledWidth;
        const canvasHeight = isRotated90or270 ? scaledWidth : scaledHeight;

        // Limit canvas size for performance
        const maxSize = 800;
        const scale = Math.min(1, maxSize / Math.max(canvasWidth, canvasHeight));

        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply filters
        ctx.filter = `brightness(${bright}%) contrast(${cont}%)`;

        // Save context state
        ctx.save();

        // Move to center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotate
        ctx.rotate(rad);

        // Draw image centered
        const drawWidth = scaledWidth * scale;
        const drawHeight = scaledHeight * scale;
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        // Restore context
        ctx.restore();
    };

    const rotateLeft = () => {
        setRotation((prev) => (prev - 90 + 360) % 360);
    };

    const rotateRight = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleSave = async () => {
        if (!canvasRef.current || !file) return;

        setSaving(true);

        try {
            const canvas = canvasRef.current;

            // Convert to blob with compression
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    (b) => resolve(b),
                    'image/jpeg',
                    0.85 // 85% quality for compression
                );
            });

            if (!blob) {
                alert('Gagal memproses gambar');
                return;
            }

            // Create new file with edited content
            const editedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            onSave(editedFile);
        } catch (err) {
            console.error('Error saving image:', err);
            alert('Gagal menyimpan gambar');
        } finally {
            setSaving(false);
        }
    };

    const resetEdits = () => {
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setZoom(100);
    };

    if (!file) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                        <FiImage /> Edit Gambar
                    </h2>
                    <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-700">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Canvas Preview */}
                <div className="flex-1 bg-neutral-900 flex items-center justify-center p-4 overflow-auto">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full rounded-lg shadow-lg"
                        style={{ background: '#000' }}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-4">
                    {/* Rotation */}
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={rotateLeft} className="btn btn-secondary" title="Putar Kiri">
                            <FiRotateCcw /> Putar Kiri
                        </button>
                        <button onClick={rotateRight} className="btn btn-secondary" title="Putar Kanan">
                            <FiRotateCw /> Putar Kanan
                        </button>
                    </div>

                    {/* Sliders */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Brightness */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-sm font-medium text-neutral-700">
                                <span className="flex items-center gap-1"><FiSun /> Kecerahan</span>
                                <span>{brightness}%</span>
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="200"
                                value={brightness}
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-sm font-medium text-neutral-700">
                                <span>Kontras</span>
                                <span>{contrast}%</span>
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="200"
                                value={contrast}
                                onChange={(e) => setContrast(parseInt(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                        </div>

                        {/* Zoom */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-sm font-medium text-neutral-700">
                                <span className="flex items-center gap-1"><FiZoomIn /> Zoom</span>
                                <span>{zoom}%</span>
                            </label>
                            <input
                                type="range"
                                min="25"
                                max="200"
                                value={zoom}
                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={resetEdits} className="btn btn-secondary flex-1">
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary flex-1"
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : <><FiCheck /> Simpan & Gunakan</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
