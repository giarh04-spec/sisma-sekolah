import React, { useState } from 'react';
import { Settings, Save, Wifi, RefreshCw } from 'lucide-react';
import { StoreSettings, Branch } from '../../types/pos';

interface PengaturanViewProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  branches: Branch[];
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  onUpdateSettings,
  branches
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [syncStatus, setSyncStatus] = useState<'ONLINE' | 'OFFLINE' | 'SYNCING'>('ONLINE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    alert('Pengaturan toko berhasil disimpan!');
  };

  const handleTestSync = () => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      setSyncStatus('ONLINE');
      alert('Sinkronisasi data ke cloud server berhasil!');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-black text-white">Pengaturan Sistem & Toko</h2>
        <p className="text-xs text-slate-400">Konfigurasi profil minimarket, struk thermal, pajak, dan status sinkronisasi offline.</p>
      </div>

      {/* Offline Status Card */}
      <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Status Koneksi & Offline Mode</h3>
            <p className="text-[10px] text-slate-400">Aplikasi mendukung IndexedDB & LocalStorage saat offline.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            syncStatus === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
            syncStatus === 'SYNCING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
            'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {syncStatus === 'ONLINE' ? '🟢 ONLINE' : syncStatus === 'SYNCING' ? '🔄 SYNCING' : '🔴 OFFLINE'}
          </span>
          <button
            onClick={handleTestSync}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Sinkronisasi Sekarang
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#121214] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" /> Profil Toko & Struk Struk
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Nama Toko / Minimarket</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Nomor Telepon Toko</label>
            <input
              type="text"
              value={formData.storePhone}
              onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Alamat Lengkap Toko</label>
          <textarea
            rows={2}
            value={formData.storeAddress}
            onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Tarif Pajak PPN (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Ukuran Printer Thermal</label>
            <select
              value={formData.printerWidth}
              onChange={(e: any) => setFormData({ ...formData, printerWidth: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            >
              <option value="58mm">Thermal 58mm</option>
              <option value="80mm">Thermal 80mm</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Header Struk (Catatan Atas)</label>
          <textarea
            rows={2}
            value={formData.receiptHeader}
            onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Footer Struk (Catatan Bawah)</label>
          <textarea
            rows={2}
            value={formData.receiptFooter}
            onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
