declare module 'html5-qrcode' {
    export class Html5QrcodeScanner {
        constructor(
            elementId: string,
            config: {
                fps: number;
                qrbox: { width: number; height: number } | number;
                aspectRatio?: number;
                disableFlip?: boolean;
            },
            verbose?: boolean
        );
        render(
            onScanSuccess: (decodedText: string, decodedResult: any) => void,
            onScanFailure?: (errorMessage: string) => void
        ): void;
        clear(): Promise<void>;
    }
}
