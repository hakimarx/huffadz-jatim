// @ts-ignore
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (error: any) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanError, setScanError] = useState<string>('');

    useEffect(() => {
        // Initialize scanner
        // Use a unique ID for the element
        const elementId = 'reader';

        // Prevent multiple initializations
        if (scannerRef.current) {
            return;
        }

        try {
            const scanner = new Html5QrcodeScanner(
                elementId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText: string) => {
                    onScan(decodedText);
                    // Optional: Pause or clear after success if needed
                    // scanner.clear(); 
                },
                (errorMessage: string) => {
                    // Ignore parse errors, they happen frequently when no QR is in view
                    if (onError) onError(errorMessage);
                }
            );

            scannerRef.current = scanner;
        } catch (err: any) {
            console.error('Scanner init error:', err);
            setScanError(err.message);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [onScan, onError]);

    return (
        <div className="w-full max-w-md mx-auto">
            {scanError && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    Error: {scanError}
                </div>
            )}
            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden"></div>
            <p className="text-center text-sm text-neutral-500 mt-2">
                Arahkan kamera ke QR Code peserta
            </p>
        </div>
    );
}
