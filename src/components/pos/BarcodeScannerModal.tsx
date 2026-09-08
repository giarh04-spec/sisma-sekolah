import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Upload, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { Product } from '../../types/pos';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  products
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scanningStatus, setScanningStatus] = useState<string>('Menyalakan kamera...');
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio beep on success
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // ignore audio context restrictions
    }
  };

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && (args[0].includes('non-ReaderException') || args[0].includes('NotFoundException') || args[0].includes('play video') || args[0].includes('playing'))) {
        return;
      }
      originalWarn(...args);
    };
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && (args[0].includes('non-ReaderException') || args[0].includes('NotFoundException') || args[0].includes('play video') || args[0].includes('playing'))) {
        return;
      }
      originalError(...args);
    };

    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, [isOpen, useFrontCamera]);

  const startCamera = async () => {
    try {
      setScanningStatus('Meminta izin kamera...');
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      // Select device based on front/back preference if multiple devices exist
      let selectedDeviceId = videoInputDevices[0]?.deviceId;
      if (videoInputDevices.length > 1) {
        const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang') || d.label.toLowerCase().includes('environment'));
        const frontCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('depan') || d.label.toLowerCase().includes('user'));
        selectedDeviceId = useFrontCamera ? (frontCamera?.deviceId || videoInputDevices[0]?.deviceId) : (backCamera?.deviceId || videoInputDevices[1]?.deviceId || videoInputDevices[0]?.deviceId);
      }

      if (videoRef.current) {
        codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText();
              if (text) {
                playBeep();
                onScanSuccess(text);
                stopCamera();
                onClose();
              }
            }
          }
        );
        setScanningStatus('Kamera aktif. Arahkan barcode ke dalam kotak merah.');
      }
    } catch (err) {
      setScanningStatus('Kamera tidak tersedia / diblokir. Gunakan simulasi instan atau upload foto barcode.');
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    try {
      setScanningStatus('Membaca barcode dari file gambar...');
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      const result = await codeReaderRef.current.decodeFromImageUrl(imageUrl);
      if (result) {
        const text = result.getText();
        if (text) {
          playBeep();
          onScanSuccess(text);
          stopCamera();
          onClose();
          return;
        }
      }
    } catch (err) {
      setScanningStatus('Gagal membaca otomatis dari gambar. Silakan pilih produk di bawah.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playBeep();
    onScanSuccess(manualCode.trim());
    setManualCode('');
    stopCamera();
    onClose();
  };

  const simulateScan = (prod: Product) => {
    playBeep();
    onScanSuccess(prod.barcode);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121214]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="text-white font-bold text-base">Scanner Barcode Kasir</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseFrontCamera(!useFrontCamera)}
              title="Ganti Kamera Depan/Belakang"
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold px-3"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Kamera
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Camera Viewport */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-red-500/70 m-12 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 animate-pulse absolute shadow-[0_0_10px_#ef4444]"></div>
            </div>

            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Scanner
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg text-center flex items-center justify-between">
              <p className="text-xs text-slate-200 font-medium truncate flex-1 text-left">{scanningStatus}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all shadow-md"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Barcode
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Quick simulator / shortcut */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Simulasi Scan Instan / Produk Cepat:
              </label>
              <span className="text-[10px] text-blue-400 font-medium">Klik produk untuk langsung masukkan ke kasir</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {products.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => simulateScan(prod)}
                  className="flex items-center justify-between px-3 py-2 bg-slate-900/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={prod.photo} alt={prod.name} className="w-8 h-8 rounded-lg object-cover bg-slate-800" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Barcode: {prod.barcode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-400">Rp {prod.sellingPrice.toLocaleString('id-ID')}</span>
                    <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Barcode Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-400">Atau Ketik / Masukkan Barcode / SKU Manual:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: 8996001332211 atau IND-GOR-01..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Proses
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
