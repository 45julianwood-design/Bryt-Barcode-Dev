
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ScanResult } from '../types';
import { parseAamva } from '../services/aamvaParser';

interface ScannerProps {
  onResult: (result: ScanResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onResult }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 300, height: 200 },
      aspectRatio: 1.777778,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.PDF_417,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
      ],
    };

    const scanner = new Html5QrcodeScanner('reader', config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText, decodedResult) => {
        const format = decodedResult.result.format?.formatName || 'UNKNOWN';
        const isAamva = decodedText.startsWith('@') || decodedText.includes('ANSI');
        
        onResult({
          format,
          raw: decodedText,
          parsed: isAamva ? parseAamva(decodedText) : undefined,
        });
        
        // Brief pause or clear if needed, but usually scanner remains active
      },
      (errorMessage) => {
        // Quietly handle errors as it scans frames constantly
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onResult]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white"></div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p><i className="fas fa-info-circle mr-2"></i>Align the barcode within the window to scan.</p>
        <p>Supports PDF417, Code128, Code39, and more.</p>
      </div>
    </div>
  );
};

export default Scanner;
