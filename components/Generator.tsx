
import React, { useState, useEffect, useRef } from 'react';
import bwipjs from 'bwip-js';
import { GoogleGenAI } from "@google/genai";
import { BarcodeType } from '../types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const AAMVA_TEMPLATE = `@\nANSI 636015090002DL00410268ZT03090007\nDLDACHenry\nDCSMiller\nDBA12312030\nDBB01011990\nDBC1\nDAU070 in\nDAW180`;
const HUMAN_TEMPLATE = `First Name: HENRY\nLast Name: MILLER\nDOB: 01/01/1990\nSEX: MALE\nHT: 5-10\nWT: 180 lb`;

const Generator: React.FC = () => {
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('PDF417');
  const [rawTextInput, setRawTextInput] = useState('');
  const [encodedContent, setEncodedContent] = useState(AAMVA_TEMPLATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateBarcode = () => {
    if (!canvasRef.current || !encodedContent) return;

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: barcodeType.toLowerCase(),
        text: encodedContent,
        scale: 2,
        height: barcodeType === 'PDF417' ? 12 : 10,
        includetext: barcodeType !== 'PDF417',
        textxalign: 'center',
        backgroundcolor: 'FFFFFF',
        barcolor: '000000',
        paddingwidth: 10,
        paddingheight: 10,
      });
    } catch (e) {
      console.error("Barcode generation error:", e);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#FEE2E2";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#991B1B";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("DATA ERROR: CHECK INPUT", canvasRef.current.width / 2, 40);
      }
    }
  };

  useEffect(() => {
    generateBarcode();
  }, [encodedContent, barcodeType]);

  const handleAiFormat = async () => {
    if (!rawTextInput.trim()) return;
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Convert the following human details into a raw, valid AAMVA driver's license barcode string (starting with @ and ANSI 636...).
        If details are missing, use plausible standard defaults for the AAMVA v2020 format.
        Details: "${rawTextInput}".
        Output ONLY the resulting raw string, no explanation.`,
      });

      const result = response.text?.trim() || '';
      if (result) {
        setEncodedContent(result);
        setBarcodeType('PDF417');
      }
    } catch (error: any) {
      console.error("AI processing failed:", error);
      if (error.message?.includes("403") || error.message?.includes("entity was not found")) {
        window.aistudio?.openSelectKey();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encodedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `barcode-${barcodeType}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Editor Surface */}
      <div className="flex-1 space-y-6">
        
        {/* Encoding Terminal */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-xl">
                  <i className="fas fa-keyboard text-white text-xs"></i>
               </div>
               <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Exact Data Terminal</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">1:1 Byte Encoding Engine</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={() => setEncodedContent(AAMVA_TEMPLATE)}
                className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
               >
                AAMVA Template
               </button>
               <button 
                onClick={() => setEncodedContent(HUMAN_TEMPLATE)}
                className="text-[9px] font-black text-purple-600 hover:text-purple-800 uppercase px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
               >
                Human Template
               </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="relative group">
               <textarea
                value={encodedContent}
                onChange={(e) => setEncodedContent(e.target.value)}
                className="w-full h-96 p-6 font-mono text-sm bg-gray-950 text-emerald-400 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none shadow-2xl leading-relaxed custom-scrollbar border-2 border-gray-900 focus:border-indigo-500 transition-all placeholder:text-gray-700"
                placeholder="Paste raw string or type details here..."
              />
              <div className="absolute top-4 right-4 flex gap-2">
                 <button 
                  onClick={() => setEncodedContent('')}
                  className="bg-gray-800/50 backdrop-blur hover:bg-red-900 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors border border-white/5"
                 >
                  Wipe Data
                 </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
               <p className="text-[11px] text-gray-400 italic">
                 Note: Every newline and space typed in the box above will be encoded exactly into the barcode.
               </p>
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Live Buffer Ready</span>
               </div>
            </div>
          </div>
        </div>

        {/* AI Formatting Assistant */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
              <i className="fas fa-id-card text-9xl"></i>
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                   <i className="fas fa-wand-magic-sparkles text-xl"></i>
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-widest">AAMVA Detail Assistant</h3>
                   <p className="text-xs text-indigo-100 font-medium">Auto-format human readable details into raw barcode blobs</p>
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1 relative">
                    <input
                      type="text"
                      value={rawTextInput}
                      onChange={(e) => setRawTextInput(e.target.value)}
                      placeholder="e.g. John Smith, DOB 05/12/1985, Male, Texas..."
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-indigo-200"
                    />
                 </div>
                 <button
                   onClick={handleAiFormat}
                   disabled={isProcessing || !rawTextInput}
                   className="px-8 bg-white text-indigo-600 rounded-2xl text-xs font-black hover:bg-indigo-50 disabled:bg-white/30 disabled:text-white/50 transition-all shadow-xl uppercase tracking-widest flex items-center gap-3 active:scale-95"
                 >
                   {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles"></i>}
                   Format
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Output & Diagnostics */}
      <div className="lg:w-96 space-y-6">
        <div className="sticky top-24">
          
          {/* Symbology Choice */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Target Symbology</h4>
            <div className="grid grid-cols-2 gap-2">
              {(['PDF417', 'CODE128', 'CODE39', 'EAN13'] as BarcodeType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setBarcodeType(type)}
                  className={`px-3 py-3 rounded-xl text-[10px] font-black transition-all border-2 ${
                    barcodeType === type
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xl'
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-indigo-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Barcode Output Preview */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mt-6 flex flex-col items-center">
            <div className="flex justify-between w-full mb-6 items-center">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Generator Result</h4>
               <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span className="text-[9px] font-black text-indigo-600 uppercase">{barcodeType}</span>
               </div>
            </div>
            
            <div className="bg-white p-10 rounded-3xl border-2 border-gray-50 w-full flex items-center justify-center min-h-[240px] shadow-inner mb-6 overflow-hidden">
              <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-2xl"></canvas>
            </div>

            <button
              onClick={downloadBarcode}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <i className="fas fa-file-arrow-down"></i>
              Export Scannable PNG
            </button>
          </div>

          {/* Diagnostic Feed */}
          <div className="mt-6 bg-gray-900 p-6 rounded-3xl shadow-2xl shadow-indigo-200/20">
             <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Buffer Diagnostics</span>
                <button 
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  {copied ? 'Copied' : 'Copy Content'}
                </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Payload Size</p>
                   <p className="text-xl font-black text-white font-mono">{encodedContent.length} <span className="text-[10px] text-gray-500">B</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Symbology</p>
                   <p className="text-xl font-black text-indigo-400 font-mono">{barcodeType.replace(/\d+/g, '')}</p>
                </div>
             </div>
             <div className="mt-4 p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20 text-[9px] font-medium text-indigo-300/60 leading-tight">
                This engine uses high-precision BWIP-JS rendering to ensure 100% data fidelity for AAMVA and high-density PDF417 modules.
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Generator;
