import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Zap, 
  ZapOff, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ScanLine, 
  QrCode, 
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface CameraScannerProps {
  onScanSuccess: (code: string) => void;
  scanTargetType: 'siswa' | 'guru';
  isAutoReset?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScanSuccess,
  scanTargetType,
  isAutoReset = true
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isBeepEnabled, setIsBeepEnabled] = useState<boolean>(true);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Mencari Barcode / QR Code...');
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5-qrcode-reader-element';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScanTimestampRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');

  // Audio Beep Generator
  const playBeep = () => {
    if (!isBeepEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1200 Hz pitch
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // Audio context policy fallback
    }
  };

  // Vibrate Device if supported
  const triggerVibrate = () => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    } catch {
      // ignore
    }
  };

  // Get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(cameras => {
        if (cameras && cameras.length > 0) {
          const formatted = cameras.map((c, index) => ({
            id: c.id,
            label: c.label || `Kamera ${index + 1}`
          }));
          setAvailableCameras(formatted);
          // Prefer back camera if available
          const backCam = formatted.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('belakang') || c.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : formatted[0].id);
        } else {
          setCameraError('Tidak ada kamera terdeteksi pada perangkat ini.');
        }
      })
      .catch(err => {
        console.warn('Get cameras error:', err);
        setCameraError('Izin akses kamera belum diberikan atau tidak didukung browser.');
      });
  }, []);

  // Initialize and start scanner when camera selection or tab changes
  useEffect(() => {
    if (scanMode !== 'camera' || !isCameraActive) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        setScanStatusMessage('Mengaktifkan lensa kamera...');

        // Clean up any existing scanner
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch {
            // ignore
          }
          scannerRef.current = null;
        }

        const html5Qrcode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ],
          verbose: false
        });

        scannerRef.current = html5Qrcode;

        const cameraConfig = selectedCameraId 
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment' };

        await html5Qrcode.start(
          cameraConfig,
          {
            fps: 15,
            aspectRatio: 1.333333
          },
          (decodedText) => {
            if (!isMounted) return;
            handleScannedCode(decodedText);
          },
          () => {
            // Error parsing frame (normal when no code in view)
          }
        );

        if (isMounted) {
          setScanStatusMessage('Arahkan Barcode / QR Code ke dalam kotak scanner');
          // Check torch capability
          try {
            const capabilities = html5Qrcode.getRunningTrackCapabilities();
            if (capabilities && (capabilities as unknown as { torch?: boolean }).torch) {
              setHasTorch(true);
            }
          } catch {
            setHasTorch(false);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to start scanner:', err);
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('notallowed')) {
            setCameraError('Izin akses kamera ditolak. Silakan berikan izin kamera pada browser Anda.');
          } else if (errMsg.toLowerCase().includes('notfound') || errMsg.toLowerCase().includes('readable')) {
            setCameraError('Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.');
          } else {
            setCameraError(`Gagal membuka kamera: ${errMsg}`);
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [selectedCameraId, isCameraActive, scanMode]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
  };

  const handleScannedCode = (decodedText: string) => {
    const cleanCode = decodedText.trim();
    if (!cleanCode) return;

    const now = Date.now();
    // Throttle duplicate scan of exact same code within 2.5s
    if (cleanCode === lastScannedCodeRef.current && (now - lastScanTimestampRef.current) < 2500) {
      return;
    }

    lastScanTimestampRef.current = now;
    lastScannedCodeRef.current = cleanCode;

    playBeep();
    triggerVibrate();
    setLastScannedText(cleanCode);
    setScanStatusMessage(`Berhasil memindai: ${cleanCode}`);

    onScanSuccess(cleanCode);

    if (isAutoReset) {
      setTimeout(() => {
        setLastScannedText(null);
        setScanStatusMessage('Arahkan Barcode / QR Code ke dalam kotak scanner');
      }, 2000);
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }] as unknown as MediaTrackConstraintSet[]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Failed to toggle torch:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanStatusMessage('Memproses foto barcode / QR...');
      
      // Temporary instance to scan file
      const html5Qrcode = new Html5Qrcode('file-scanner-temp-element');
      const decodedResult = await html5Qrcode.scanFile(file, true);
      
      if (decodedResult) {
        handleScannedCode(decodedResult);
      } else {
        alert('Tidak ada barcode atau QR code yang dapat terdeteksi pada gambar ini.');
      }
      html5Qrcode.clear();
    } catch (err) {
      console.error('File scan error:', err);
      alert('Gagal memindai file gambar. Pastikan gambar jelas dan memiliki Barcode / QR code.');
      setScanStatusMessage('Gagal membaca barcode dari foto. Silakan coba file lain.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="bg-[#121212] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Hidden container for file scanning */}
      <div id="file-scanner-temp-element" className="hidden" />

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${
            scanTargetType === 'siswa' 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          }`}>
            <ScanLine className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              Camera Live Scanner ({scanTargetType === 'siswa' ? 'Siswa' : 'Guru'})
            </h3>
            <p className="text-[11px] text-slate-400">
              Integrasi langsung kamera HP / Laptop untuk membaca ID Barcode & QR Code
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#181818] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setScanMode('camera')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'camera' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Kamera
            </button>
            <button
              type="button"
              onClick={() => setScanMode('file')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>

          {/* Beep Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsBeepEnabled(!isBeepEnabled)}
            title={isBeepEnabled ? 'Suara Beep Aktif' : 'Suara Beep Mute'}
            className={`p-2 rounded-xl border transition-all ${
              isBeepEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {isBeepEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      {scanMode === 'camera' ? (
        <div className="space-y-3">
          {/* Camera Selector Dropdown */}
          {availableCameras.length > 1 && (
            <div className="flex items-center gap-2 bg-[#181818] p-2 rounded-xl border border-slate-800 text-xs">
              <SwitchCamera className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-semibold shrink-0">Pilih Lensa:</span>
              <select
                value={selectedCameraId}
                onChange={e => setSelectedCameraId(e.target.value)}
                className="bg-[#121212] border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none flex-1"
              >
                {availableCameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Viewport Box */}
          <div className="relative w-full max-w-xl mx-auto h-[280px] sm:h-[320px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
            {/* HTML5 QR Code Video Target */}
            <div 
              id={readerElementId} 
              className={`w-full h-full text-white [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-xl [&_img]:hidden [&_canvas]:hidden [&_a]:hidden [&_button]:hidden [&_span]:hidden [&_div]:!border-none ${
                !isCameraActive || cameraError ? 'hidden' : 'block'
              }`}
            />

            {/* Custom Scanning Laser Overlay (Shown when active) */}
            {isCameraActive && !cameraError && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                {/* Frame Guide Box */}
                <div className="relative w-64 sm:w-72 h-36 sm:h-40 border border-blue-400/60 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.25)] bg-blue-500/5 flex items-center justify-center overflow-hidden">
                  {/* Laser Beam Animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_10px_#60a5fa] top-1/2 -translate-y-1/2" />

                  {/* Corner Markers */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-blue-400 rounded-tl-sm" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-blue-400 rounded-tr-sm" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-blue-400 rounded-bl-sm" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-blue-400 rounded-br-sm" />

                  <span className="text-[10px] font-bold text-blue-200 bg-slate-950/80 px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-md shadow-md">
                    Posisikan Barcode / QR di Sini
                  </span>
                </div>

                {/* Torch Flashlight Toggle button overlay */}
                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`pointer-events-auto absolute bottom-3 right-3 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                      isTorchOn 
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50' 
                        : 'bg-slate-900/80 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
                    }`}
                  >
                    {isTorchOn ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    {isTorchOn ? 'Senter ON' : 'Senter OFF'}
                  </button>
                )}
              </div>
            )}

            {/* Inactive Camera Placeholder */}
            {!isCameraActive && !cameraError && (
              <div className="p-6 text-center space-y-3">
                <div className="p-3 bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 inline-block shadow-inner">
                  <CameraOff className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white">Kamera Nonaktif</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Klik tombol di bawah untuk mengaktifkan kembali lensa kamera.</p>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" /> Nyalakan Kamera
                </button>
              </div>
            )}

            {/* Success Scan Flash overlay */}
            {lastScannedText && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40 mb-2 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-white">Scan Berhasil!</h4>
                <p className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-500/40 my-2">
                  {lastScannedText}
                </p>
                <p className="text-[11px] text-emerald-200">
                  Sistem presensi telah mencatat otomatis.
                </p>
              </div>
            )}

            {/* Camera Error / Permission Blocked Message */}
            {cameraError && (
              <div className="p-6 text-center space-y-3 max-w-md">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30 inline-block">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white">Akses Kamera Terkendala</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cameraError}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraActive(false);
                      setTimeout(() => setIsCameraActive(true), 300);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('file')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-slate-700"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload File Foto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs bg-[#181818] px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Status: <span className="text-blue-400 font-bold">{scanStatusMessage}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  isCameraActive 
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isCameraActive ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {isCameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* File Upload Mode */
        <div className="bg-[#181818] p-6 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Upload Foto Kartu / Barcode</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Pilih file gambar (JPG, PNG) yang berisi Barcode atau QR Code Kartu ID Siswa / Guru untuk dipindai otomatis.
            </p>
          </div>

          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Pilih File Gambar Barcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
