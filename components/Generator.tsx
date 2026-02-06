
import React, { useState, useEffect, useRef } from 'react';
import bwipjs from 'bwip-js';
import { GoogleGenAI, Type } from "@google/genai";
import { AamvaData, DEFAULT_AAMVA_DATA, BarcodeType } from '../types';
import { buildAamvaString } from '../services/aamvaParser';

const Generator: React.FC = () => {
  const [data, setData] = useState<AamvaData>(DEFAULT_AAMVA_DATA);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('PDF417');
  const [linearContent, setLinearContent] = useState('123456789');
  const [rawTextInput, setRawTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
        backgroundcolor: 'ffffff', // White background
        barcolor: '000000',        // Black bars
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

  const handleAiFill = async () => {
    if (!rawTextInput.trim()) return;
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract driver's license details from this text: "${rawTextInput}". 
        Ensure dates are in MMDDYYYY format. Sex should be "male", "female", or the value provided. 
        Height should be like "070 in". Weight should be numeric string.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vehicleClass: { type: Type.STRING },
              restrictionCode: { type: Type.STRING },
              endorsementsCode: { type: Type.STRING },
              expirationDate: { type: Type.STRING, description: "Format: MMDDYYYY" },
              lastName: { type: Type.STRING },
              familyNameTruncation: { type: Type.STRING },
              firstName: { type: Type.STRING },
              firstNameTruncation: { type: Type.STRING },
              middleName: { type: Type.STRING },
              middleNameTruncation: { type: Type.STRING },
              issuedDate: { type: Type.STRING, description: "Format: MMDDYYYY" },
              birthDate: { type: Type.STRING, description: "Format: MMDDYYYY" },
              sex: { type: Type.STRING },
              eyeColor: { type: Type.STRING },
              height: { type: Type.STRING },
              street_1: { type: Type.STRING },
              city: { type: Type.STRING },
              jurisdictionCode: { type: Type.STRING },
              postalCode: { type: Type.STRING },
              licenseNumber: { type: Type.STRING },
              documentDiscriminator: { type: Type.STRING },
              issuingCountry: { type: Type.STRING },
              hairColor: { type: Type.STRING },
              inventoryControlNumber: { type: Type.STRING },
              race: { type: Type.STRING },
              complianceType: { type: Type.STRING },
              cardRevisionDate: { type: Type.STRING, description: "Format: MMDDYYYY" },
              weightInPounds: { type: Type.STRING },
              organDonor: { type: Type.STRING, description: "Y or N" },
            }
          }
        },
      });

      const result = JSON.parse(response.text || '{}');
      // Merge with default data to handle missing fields
      setData(prev => ({
        ...prev,
        ...result
      }));
      setBarcodeType('PDF417');
    } catch (error) {
      console.error("AI processing failed:", error);
      alert("Failed to parse text. Please check your input or try again.");
    } finally {
      setIsProcessing(false);
    }
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
        {/* AI Quick Fill Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
              <i className="fas fa-magic"></i> AI Quick Fill
            </h3>
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Paste raw human details (name, DOB, address, etc.) to automatically populate fields.</p>
          <textarea
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            placeholder="e.g. John Smith, born Jan 1st 1990, lives at 742 Evergreen Terrace, Springfield..."
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all"
          />
          <button
            onClick={handleAiFill}
            disabled={isProcessing || !rawTextInput.trim()}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
              isProcessing || !rawTextInput.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Analyzing Details...
              </>
            ) : (
              <>
                <i className="fas fa-wand-sparkles"></i>
                Parse & Generate
              </>
            )}
          </button>
        </div>

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
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="lg:w-1/3 space-y-6">
        <div className="sticky top-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 self-start">Barcode Preview</h3>
            <div className="bg-white p-4 rounded-lg border flex items-center justify-center min-h-[200px] w-full mb-6 shadow-inner overflow-hidden">
              <canvas ref={canvasRef}></canvas>
            </div>
            <button
              onClick={downloadBarcode}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
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
            {barcodeType === 'PDF417' && (
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Generated AAMVA String</label>
                <div className="bg-white p-2 rounded border border-indigo-100 text-[10px] font-mono break-all line-clamp-3 select-all">
                  {buildAamvaString(data)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
