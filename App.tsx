
import React, { useState } from 'react';
import Scanner from './components/Scanner';
import Generator from './components/Generator';
import { ScanResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <i className="fas fa-barcode text-white text-xl"></i>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                AAMVA Barcode Master
              </h1>
            </div>
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'scan'
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-qrcode mr-2"></i>Scanner
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-magic mr-2"></i>Generator
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Barcode Scanner</h2>
                <Scanner onResult={(res) => setLastScan(res)} />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Scan Result</h2>
                {lastScan ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                        {lastScan.format}
                      </span>
                      <span className="text-xs text-gray-400">Scanned at {new Date().toLocaleTimeString()}</span>
                    </div>

                    {lastScan.parsed ? (
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2">Human Readable Format</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {Object.entries(lastScan.parsed).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-2 rounded">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                              <div className="text-sm font-medium text-gray-800 truncate">{String(value)}</div>
                            </div>
                          ))}
                        </div>

                        <h3 className="text-sm font-bold text-gray-500 uppercase mt-6 mb-3 border-b pb-2">Raw AAMVA Format</h3>
                        <pre className="text-[10px] bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap leading-tight">
                          {lastScan.raw}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2">Raw Content</h3>
                        <p className="p-4 bg-gray-50 rounded-lg text-sm break-all font-mono">
                          {lastScan.raw}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                    <i className="fas fa-camera text-4xl mb-4 opacity-20"></i>
                    <p>No barcode scanned yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Barcode Generator</h2>
              <p className="text-gray-500 mt-2">Generate PDF417 AAMVA and high-precision linear barcodes.</p>
            </div>
            <Generator />
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          AAMVA Standard DL/ID Barcode Tool &bull; Secure Browser-based Processing
        </div>
      </footer>
    </div>
  );
};

export default App;
