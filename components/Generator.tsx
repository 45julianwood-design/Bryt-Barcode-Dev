
import React, { useState, useEffect, useRef } from 'react';
import bwipjs from 'bwip-js';
import { AamvaData, DEFAULT_AAMVA_DATA, BarcodeType } from '../types';
import { buildAamvaString } from '../services/aamvaParser';

const Generator: React.FC = () => {
  const [data, setData] = useState<AamvaData>(DEFAULT_AAMVA_DATA);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('PDF417');
  const [linearContent, setLinearContent] = useState('123456789');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateBarcode = () => {
    if (!canvasRef.current) return;

    const content = barcodeType === 'PDF417' ? buildAamvaString(data) : linearContent;

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: barcodeType.toLowerCase(),
        text: content,
        scale: 2,
        height: barcodeType === 'PDF417' ? 15 : 10,
        includetext: barcodeType !== 'PDF417',
        textxalign: 'center',
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generateBarcode();
  }, [data, barcodeType, linearContent]);

  const handleChange = (field: keyof AamvaData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `barcode-${barcodeType}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Configuration Section */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700">Type Selection</h3>
          <div className="grid grid-cols-2 gap-4">
            {(['PDF417', 'CODE128', 'CODE39', 'EAN13'] as BarcodeType[]).map(type => (
              <button
                key={type}
                onClick={() => setBarcodeType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  barcodeType === type
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {barcodeType === 'PDF417' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">AAMVA Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(DEFAULT_AAMVA_DATA).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={(data as any)[key]}
                    onChange={(e) => handleChange(key as keyof AamvaData, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Linear Content</h3>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data String</label>
            <input
              type="text"
              value={linearContent}
              onChange={(e) => setLinearContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="lg:w-1/3 space-y-6">
        <div className="sticky top-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 self-start">Barcode Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-center min-h-[200px] w-full mb-6">
              <canvas ref={canvasRef}></canvas>
            </div>
            <button
              onClick={downloadBarcode}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              Download Image
            </button>
          </div>

          <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">Technical Summary</h4>
            <p className="text-xs text-indigo-600 leading-relaxed">
              Format: <span className="font-mono">{barcodeType}</span><br/>
              Characters: {barcodeType === 'PDF417' ? buildAamvaString(data).length : linearContent.length}<br/>
              Standard: {barcodeType === 'PDF417' ? 'AAMVA DL/ID 2020' : 'ISO/IEC Standard'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
