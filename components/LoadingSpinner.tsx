'use client';

export default function LoadingSpinner() {
    return (
        <div className="loading-overlay">
            <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-neutral-600 font-medium">Memuat data...</p>
            </div>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-neutral-600 font-medium">Memuat halaman...</p>
            </div>
        </div>
    );
}

export function InlineLoader() {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
        </div>
    );
}
