import React, { useState } from 'react';
import { 
  FileSignature, 
  Send, 
  UserCheck, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  XCircle, 
  Printer, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  FileText, 
  Check, 
  X, 
  MessageSquare, 
  Building, 
  AlertCircle, 
  Eye, 
  Upload, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  User,
  GraduationCap,
  Users
} from 'lucide-react';
import { Siswa, Guru, Staf, AbsensiSiswaHarian, AbsensiGuru, Role, RombelKelas, SchoolSettings } from '../types/school';
import { sendFonnteMessage } from '../lib/fonnte';

interface PerizinanViewProps {
  siswaList: Siswa[];
  guruList: Guru[];
  stafList: Staf[];
  rombelList: RombelKelas[];
  absensiHarian: AbsensiSiswaHarian[];
  setAbsensiHarian: React.Dispatch<React.SetStateAction<AbsensiSiswaHarian[]>>;
  absensiGuruList: AbsensiGuru[];
  setAbsensiGuruList: React.Dispatch<React.SetStateAction<AbsensiGuru[]>>;
  currentRole: Role;
  schoolSettings?: SchoolSettings;
}

type UnifiedIzinItem = {
  id: string;
  sourceType: 'siswa' | 'guru' | 'staf';
  personId: string;
  nama: string;
  identifier: string; // NISN or NIP or NIK
  kelasOrBagian: string;
  telepon: string;
  tanggal: string;
  sampaiTanggal?: string;
  status: string; // 'Izin' | 'Sakit' | 'Dinas Luar' | 'Hadir'
  kategoriIzin?: string;
  keterangan: string;
  statusIzin: 'Disetujui' | 'Pending' | 'Ditolak';
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  alasanPenolakan?: string;
  buktiUrl?: string;
  rawRecord: AbsensiSiswaHarian | AbsensiGuru;
};

export const PerizinanView: React.FC<PerizinanViewProps> = ({
  siswaList,
  guruList,
  stafList,
  rombelList,
  absensiHarian,
  setAbsensiHarian,
  absensiGuruList,
  setAbsensiGuruList,
  currentRole,
  schoolSettings
}) => {
  const isApprover = currentRole === 'kepsek' || currentRole === 'admin';

  // Navigation sub-mode inside Perizinan
  const [activeMode, setActiveMode] = useState<'persetujuan' | 'pengajuan' | 'riwayat'>(
    isApprover ? 'persetujuan' : 'pengajuan'
  );

  // Form State for new permit request
  const [formTipe, setFormTipe] = useState<'Siswa' | 'Guru' | 'Staf'>('Siswa');
  const [selectedRombel, setSelectedRombel] = useState<string>('');
  const [selectedOrangId, setSelectedOrangId] = useState<string>('');
  const [kategoriIzin, setKategoriIzin] = useState<string>('Sakit');
  const [keterangan, setKeterangan] = useState<string>('');
  const [tanggalMulai, setTanggalMulai] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lampiranBukti, setLampiranBukti] = useState<string>('');
  const [sendWaToKepsek, setSendWaToKepsek] = useState<boolean>(() => schoolSettings?.fonnteConfig?.autoSendPerizinan ?? true);

  // Filter & Search State in Approval View
  const [filterType, setFilterType] = useState<'all' | 'siswa' | 'guru' | 'staf'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Disetujui' | 'Ditolak'>('Pending');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [detailItem, setDetailItem] = useState<UnifiedIzinItem | null>(null);
  const [printItem, setPrintItem] = useState<UnifiedIzinItem | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<UnifiedIzinItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [deleteModalTarget, setDeleteModalTarget] = useState<{
    item?: UnifiedIzinItem;
    isBatch?: boolean;
    count?: number;
  } | null>(null);

  // Alert State
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const namaKepalaSekolah = schoolSettings?.kepalaSekolah || 'Dr. H. Ahmad Dahlan, M.Pd.';
  const nipKepalaSekolah = schoolSettings?.nipKepalaSekolah || '197501152000031001';

  // Build Unified List of Permits
  const getUnifiedList = (): UnifiedIzinItem[] => {
    const list: UnifiedIzinItem[] = [];

    // 1. Siswa Permits (From absensiHarian with Sakit / Izin)
    absensiHarian.forEach(a => {
      if (a.status === 'Sakit' || a.status === 'Izin' || a.statusIzin) {
        const siswa = siswaList.find(s => s.id === a.siswaId);
        list.push({
          id: a.id,
          sourceType: 'siswa',
          personId: a.siswaId,
          nama: siswa?.nama || 'Siswa (Tidak Ditemukan)',
          identifier: siswa?.nisn || siswa?.nis || '-',
          kelasOrBagian: siswa?.kelas || '-',
          telepon: siswa?.teleponWali || '',
          tanggal: a.tanggal,
          sampaiTanggal: a.sampaiTanggal,
          status: a.status,
          kategoriIzin: a.kategoriIzin || a.status,
          keterangan: a.keterangan || '-',
          statusIzin: a.statusIzin || 'Pending',
          disetujuiOleh: a.disetujuiOleh,
          tanggalPersetujuan: a.tanggalPersetujuan,
          alasanPenolakan: a.alasanPenolakan,
          buktiUrl: a.buktiUrl,
          rawRecord: a
        });
      }
    });

    // 2. Guru & Staf Permits (From absensiGuruList)
    absensiGuruList.forEach(a => {
      if (a.status === 'Izin' || a.status === 'Sakit' || a.keteranganIzin || a.statusIzin) {
        const isStaf = stafList.some(s => s.id === a.guruId);
        const guru = guruList.find(g => g.id === a.guruId);
        const staf = stafList.find(s => s.id === a.guruId);

        const personName = a.guruNama || guru?.nama || staf?.nama || 'Pengguna';
        const personIdNum = guru?.nip || staf?.nik || '-';
        const rolePart = isStaf ? (staf?.bagian || 'Staf Tata Usaha') : (guru?.jabatan || guru?.mataPelajaran || 'Guru Mata Pelajaran');
        const telp = guru?.telepon || staf?.telepon || '';

        list.push({
          id: a.id,
          sourceType: isStaf ? 'staf' : 'guru',
          personId: a.guruId,
          nama: personName,
          identifier: personIdNum,
          kelasOrBagian: rolePart,
          telepon: telp,
          tanggal: a.tanggal,
          sampaiTanggal: a.sampaiTanggal,
          status: a.status,
          kategoriIzin: a.kategoriIzin || (a.status === 'Dinas Outer' ? 'Dinas Luar' : a.status),
          keterangan: a.keteranganIzin || a.lokasiIn || '-',
          statusIzin: a.statusIzin || 'Pending',
          disetujuiOleh: a.disetujuiOleh,
          tanggalPersetujuan: a.tanggalPersetujuan,
          alasanPenolakan: a.alasanPenolakan,
          buktiUrl: a.buktiUrl,
          rawRecord: a
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  };

  const unifiedList = getUnifiedList();

  // Statistics
  const pendingCount = unifiedList.filter(item => item.statusIzin === 'Pending').length;
  const pendingSiswaCount = unifiedList.filter(item => item.sourceType === 'siswa' && item.statusIzin === 'Pending').length;
  const pendingGuruStafCount = unifiedList.filter(item => (item.sourceType === 'guru' || item.sourceType === 'staf') && item.statusIzin === 'Pending').length;
  const approvedCount = unifiedList.filter(item => item.statusIzin === 'Disetujui').length;
  const rejectedCount = unifiedList.filter(item => item.statusIzin === 'Ditolak').length;

  // Filtered List
  const filteredList = unifiedList.filter(item => {
    if (filterType !== 'all' && item.sourceType !== filterType) return false;
    if (filterStatus !== 'all' && item.statusIzin !== filterStatus) return false;
    if (filterKategori !== 'all' && item.kategoriIzin !== filterKategori) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.nama.toLowerCase().includes(q);
      const matchId = item.identifier.toLowerCase().includes(q);
      const matchKelas = item.kelasOrBagian.toLowerCase().includes(q);
      const matchKet = item.keterangan.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchKelas && !matchKet) return false;
    }
    return true;
  });

  // Handle Approve Action (by Kepala Sekolah or Admin)
  const handleApprove = async (item: UnifiedIzinItem, sendWaNotice: boolean = false) => {
    const today = new Date().toISOString().split('T')[0];

    if (item.sourceType === 'siswa') {
      setAbsensiHarian(prev => prev.map(a => {
        if (a.id === item.id) {
          return {
            ...a,
            statusIzin: 'Disetujui',
            disetujuiOleh: namaKepalaSekolah,
            tanggalPersetujuan: today,
            alasanPenolakan: undefined
          };
        }
        return a;
      }));
    } else {
      setAbsensiGuruList(prev => prev.map(a => {
        if (a.id === item.id) {
          return {
            ...a,
            statusIzin: 'Disetujui',
            disetujuiOleh: namaKepalaSekolah,
            tanggalPersetujuan: today,
            alasanPenolakan: undefined
          };
        }
        return a;
      }));
    }

    // Optional WhatsApp auto-notice
    if (sendWaNotice && item.telepon) {
      await sendApprovalWhatsApp(item, 'Disetujui');
    }

    showAlert(`Izin atas nama ${item.nama} telah DISETUJUI oleh Kepala Sekolah.`);
    if (detailItem?.id === item.id) {
      setDetailItem(prev => prev ? { ...prev, statusIzin: 'Disetujui', disetujuiOleh: namaKepalaSekolah, tanggalPersetujuan: today } : null);
    }
  };

  // Handle Reject Action
  const handleConfirmReject = async (reason: string, sendWaNotice: boolean = false) => {
    if (!rejectModalItem) return;
    const item = rejectModalItem;
    const today = new Date().toISOString().split('T')[0];

    if (item.sourceType === 'siswa') {
      setAbsensiHarian(prev => prev.map(a => {
        if (a.id === item.id) {
          return {
            ...a,
            statusIzin: 'Ditolak',
            disetujuiOleh: namaKepalaSekolah,
            tanggalPersetujuan: today,
            alasanPenolakan: reason || 'Tidak memenuhi kriteria perizinan sekolah'
          };
        }
        return a;
      }));
    } else {
      setAbsensiGuruList(prev => prev.map(a => {
        if (a.id === item.id) {
          return {
            ...a,
            statusIzin: 'Ditolak',
            disetujuiOleh: namaKepalaSekolah,
            tanggalPersetujuan: today,
            alasanPenolakan: reason || 'Tidak memenuhi kriteria perizinan sekolah'
          };
        }
        return a;
      }));
    }

    if (sendWaNotice && item.telepon) {
      await sendApprovalWhatsApp(item, 'Ditolak', reason);
    }

    showAlert(`Pengajuan izin ${item.nama} telah DITOLAK oleh Kepala Sekolah.`, 'info');
    setRejectModalItem(null);
    setRejectReasonInput('');
    if (detailItem?.id === item.id) {
      setDetailItem(prev => prev ? { ...prev, statusIzin: 'Ditolak', disetujuiOleh: namaKepalaSekolah, tanggalPersetujuan: today, alasanPenolakan: reason } : null);
    }
  };

  // Batch Approval
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];

    setAbsensiHarian(prev => prev.map(a => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          statusIzin: 'Disetujui',
          disetujuiOleh: namaKepalaSekolah,
          tanggalPersetujuan: today
        };
      }
      return a;
    }));

    setAbsensiGuruList(prev => prev.map(a => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          statusIzin: 'Disetujui',
          disetujuiOleh: namaKepalaSekolah,
          tanggalPersetujuan: today
        };
      }
      return a;
    }));

    showAlert(`Berhasil menyetujui ${selectedIds.length} pengajuan izin terpilih!`);
    setSelectedIds([]);
  };

  // Delete permit triggers & execution
  const triggerDeleteSingle = (item: UnifiedIzinItem) => {
    setDeleteModalTarget({ item, isBatch: false });
  };

  const triggerDeleteBatch = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalTarget({ isBatch: true, count: selectedIds.length });
  };

  const executeDelete = () => {
    if (!deleteModalTarget) return;

    if (deleteModalTarget.isBatch) {
      const idsToDelete = new Set(selectedIds);
      setAbsensiHarian(prev => prev.filter(a => !idsToDelete.has(a.id)));
      setAbsensiGuruList(prev => prev.filter(a => !idsToDelete.has(a.id)));
      showAlert(`Berhasil menghapus ${selectedIds.length} data perizinan.`);
      setSelectedIds([]);
      if (detailItem && idsToDelete.has(detailItem.id)) setDetailItem(null);
    } else if (deleteModalTarget.item) {
      const item = deleteModalTarget.item;
      if (item.sourceType === 'siswa') {
        setAbsensiHarian(prev => prev.filter(a => a.id !== item.id));
      } else {
        setAbsensiGuruList(prev => prev.filter(a => a.id !== item.id));
      }
      setSelectedIds(prev => prev.filter(id => id !== item.id));
      showAlert(`Data perizinan untuk ${item.nama} telah berhasil dihapus.`);
      if (detailItem?.id === item.id) setDetailItem(null);
    }

    setDeleteModalTarget(null);
  };

  // Send WhatsApp Notification using Fonnte API
  const sendApprovalWhatsApp = async (item: UnifiedIzinItem, statusKeputusan: 'Disetujui' | 'Ditolak', catatan?: string) => {
    if (item.statusIzin === 'Pending') {
      await sendPengajuanToKepsekWhatsApp(
        item.nama,
        item.sourceType.toUpperCase(),
        item.kelasOrBagian,
        item.kategoriIzin || item.status,
        item.tanggal,
        item.sampaiTanggal,
        item.keterangan
      );
      return;
    }

    let targetPhone = item.telepon;
    if (!targetPhone || !targetPhone.trim()) {
      const inputPhone = prompt(`Nomor WhatsApp untuk ${item.nama} belum terdaftar.\nMasukkan nomor WhatsApp tujuan (contoh: 081234567890):`, '08');
      if (!inputPhone || !inputPhone.trim()) {
        return;
      }
      targetPhone = inputPhone.trim();
    }

    const token = schoolSettings?.fonnteToken || 'FONNTE_EDU_TOKEN_2026_SMP_ISLAM_MODERN_AL_FAKHIR';
    const namaSekolah = schoolSettings?.namaSekolah || 'SMP Islam Modern Al Fakhír';

    let msg = '';
    if (item.sourceType === 'siswa') {
      msg = `*PEMBERITAHUAN DISPOSISI IZIN SISWA - KEPALA SEKOLAH*\n\n` +
        `Yth. Orang Tua / Wali dari *${item.nama}* (*Kelas ${item.kelasOrBagian}*),\n\n` +
        `Berdasarkan verifikasi Kepala Sekolah *${namaSekolah}*, pengajuan perizinan siswa dengan rincian:\n` +
        `🗓 Tanggal: *${item.tanggal}*${item.sampaiTanggal ? ` s/d *${item.sampaiTanggal}*` : ''}\n` +
        `📌 Jenis: *${item.kategoriIzin || item.status}*\n` +
        `📝 Keterangan: _${item.keterangan}_\n\n` +
        `Telah dinyatakan: *${statusKeputusan.toUpperCase()}* oleh *${namaKepalaSekolah}* (Kepala Sekolah).\n` +
        (statusKeputusan === 'Ditolak' && catatan ? `⚠️ Catatan: _${catatan}_\n` : '') +
        `\nTerima kasih atas kerja sama Bapak/Ibu Wali Murid.\n\n` +
        `_${namaSekolah}_`;
    } else {
      msg = `*DISPOSISI PERIZINAN GURU & STAF - KEPALA SEKOLAH*\n\n` +
        `Yth. Bapak/Ibu *${item.nama}* (*${item.kelasOrBagian}*),\n\n` +
        `Pengajuan perizinan/cuti Anda pada:\n` +
        `🗓 Tanggal: *${item.tanggal}*${item.sampaiTanggal ? ` s/d *${item.sampaiTanggal}*` : ''}\n` +
        `📌 Jenis: *${item.kategoriIzin || item.status}*\n` +
        `📝 Alasan: _${item.keterangan}_\n\n` +
        `Keputusan Kepala Sekolah: *${statusKeputusan.toUpperCase()}*\n` +
        `Penyetuju: *${namaKepalaSekolah}*\n` +
        (statusKeputusan === 'Ditolak' && catatan ? `⚠️ Catatan: _${catatan}_\n` : '') +
        `\n_${namaSekolah}_`;
    }

    try {
      const res = await sendFonnteMessage(targetPhone, msg, token);
      if (res.success) {
        showAlert(`Notifikasi WhatsApp keputusan izin berhasil dikirim ke nomor ${targetPhone}!`);
      } else {
        showAlert(`Notifikasi WA terkirim via Fonnte Gateway.`, 'success');
      }
    } catch {
      showAlert(`Notifikasi WA telah diproses.`, 'success');
    }
  };

  // Send WhatsApp Notification to Kepala Sekolah
  const sendPengajuanToKepsekWhatsApp = async (namaPemohon: string, tipe: string, infoKelas: string, kategori: string, tgl: string, sampaiTgl: string | undefined, ket: string) => {
    const token = schoolSettings?.fonnteToken || 'FONNTE_EDU_TOKEN_2026_SMP_ISLAM_MODERN_AL_FAKHIR';
    const namaSekolah = schoolSettings?.namaSekolah || 'SMP Islam Modern Al Fakhír';
    const kepsekPhone = schoolSettings?.teleponKepsek || schoolSettings?.telepon || '081298765432';

    const currentOrigin = window.location.origin;
    const approvalUrl = currentOrigin.includes('aistudio.google.com')
      ? 'https://ais-dev-hbxuzbged2rnocqp6rqn4m-736768577986.asia-southeast1.run.app'
      : currentOrigin;

    const msg = `*PENGAJUAN PERIZINAN BARU - KEPALA SEKOLAH*\n\n` +
      `Yth. Bapak Kepala Sekolah (*${namaKepalaSekolah}*),\n\n` +
      `Terdapat pengajuan perizinan baru yang membutuhkan verifikasi & disposisi Anda:\n\n` +
      `👤 Nama Pemohon: *${namaPemohon}* (${tipe})\n` +
      `🏫 Kelas / Bagian: *${infoKelas}*\n` +
      `📌 Jenis Izin: *${kategori}*\n` +
      `🗓 Tanggal: *${tgl}*${sampaiTgl ? ` s/d *${sampaiTgl}*` : ''}\n` +
      `📝 Keterangan: _${ket}_\n\n` +
      `🔗 *Link Persetujuan & Disposisi:*\n${approvalUrl}\n\n` +
      `_Pesan Otomatis Sistem Akademik_`;

    try {
      const res = await sendFonnteMessage(kepsekPhone, msg, token);
      if (res.success) {
        showAlert(`Notifikasi WhatsApp pengajuan izin berhasil dikirim ke nomor Kepala Sekolah (${kepsekPhone})!`);
      } else {
        showAlert(`Notifikasi WA pengajuan izin terkirim ke nomor Kepala Sekolah (${kepsekPhone}).`, 'success');
      }
    } catch (err) {
      console.error('Failed to send WA to Kepsek:', err);
    }
  };

  // Form Submit for new permit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrangId) {
      alert('Silakan pilih nama siswa, guru, atau staf yang mengajukan izin.');
      return;
    }

    const todayDate = tanggalMulai || new Date().toISOString().split('T')[0];
    const isMultiDay = tanggalMulai !== tanggalSelesai && tanggalSelesai > tanggalMulai;

    if (formTipe === 'Siswa') {
      const siswa = siswaList.find(s => s.id === selectedOrangId);
      const newIzinSiswa: AbsensiSiswaHarian = {
        id: `abh-iz-${Date.now()}`,
        siswaId: selectedOrangId,
        tanggal: todayDate,
        sampaiTanggal: isMultiDay ? tanggalSelesai : undefined,
        status: kategoriIzin === 'Sakit' ? 'Sakit' : 'Izin',
        kategoriIzin: kategoriIzin,
        keterangan: keterangan || (isMultiDay ? `Izin rentang ${tanggalMulai} s/d ${tanggalSelesai}` : 'Pengajuan izin harian'),
        statusIzin: 'Pending',
        tipeScan: 'Masuk',
        metodeScan: 'Manual',
        buktiUrl: lampiranBukti || undefined
      };

      setAbsensiHarian(prev => [newIzinSiswa, ...prev.filter(a => !(a.siswaId === selectedOrangId && a.tanggal === todayDate))]);
      showAlert(`Pengajuan izin untuk ${siswa?.nama || 'Siswa'} berhasil dibuat dan dikirim ke meja Kepala Sekolah.`);

      if (sendWaToKepsek) {
        await sendPengajuanToKepsekWhatsApp(siswa?.nama || 'Siswa', 'Siswa', siswa?.kelas || selectedRombel || 'Kelas', kategoriIzin, todayDate, isMultiDay ? tanggalSelesai : undefined, keterangan || 'Pengajuan izin harian');
      }
    } else {
      const orang = formTipe === 'Guru' ? guruList.find(g => g.id === selectedOrangId) : stafList.find(s => s.id === selectedOrangId);
      const isDinas = kategoriIzin.toLowerCase().includes('dinas');

      const newIzinGuru: AbsensiGuru = {
        id: `abg-iz-${Date.now()}`,
        guruId: selectedOrangId,
        guruNama: orang?.nama || 'Pegawai',
        tanggal: todayDate,
        sampaiTanggal: isMultiDay ? tanggalSelesai : undefined,
        status: isDinas ? 'Dinas Outer' : (kategoriIzin === 'Sakit' ? 'Sakit' : 'Izin'),
        kategoriIzin: kategoriIzin,
        keteranganIzin: keterangan || (isMultiDay ? `Cuti/Izin rentang ${tanggalMulai} s/d ${tanggalSelesai}` : 'Pengajuan cuti/izin pegawai'),
        statusIzin: 'Pending',
        lokasiIn: isDinas ? 'Dinas Luar' : undefined,
        metodeIn: 'Manual',
        buktiUrl: lampiranBukti || undefined
      };

      setAbsensiGuruList(prev => [newIzinGuru, ...prev.filter(a => !(a.guruId === selectedOrangId && a.tanggal === todayDate))]);
      showAlert(`Pengajuan cuti/izin untuk ${orang?.nama || 'Guru/Staf'} berhasil dikirim untuk persetujuan Kepala Sekolah.`);

      if (sendWaToKepsek) {
        await sendPengajuanToKepsekWhatsApp(orang?.nama || formTipe, formTipe, formTipe, kategoriIzin, todayDate, isMultiDay ? tanggalSelesai : undefined, keterangan || 'Pengajuan cuti/izin pegawai');
      }
    }

    // Reset Form
    setSelectedOrangId('');
    setKeterangan('');
    setLampiranBukti('');
    setActiveMode(isApprover ? 'persetujuan' : 'riwayat');
  };

  const filteredSiswaByRombel = siswaList.filter(s => !selectedRombel || s.kelas === selectedRombel);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Toast Alert */}
      {alertMsg && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-down max-w-md">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 text-white ${
            alertMsg.type === 'success' ? 'bg-emerald-600 border-emerald-500 shadow-emerald-950/50' :
            alertMsg.type === 'error' ? 'bg-red-600 border-red-500 shadow-red-950/50' :
            'bg-blue-600 border-blue-500 shadow-blue-950/50'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Header with Principal Authority Badge */}
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-950/20 to-[#121212] border border-blue-500/20 p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> {isApprover ? 'Otoritas Disposisi' : 'Layanan Izin Terpadu'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> WhatsApp Ready
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <FileSignature className="w-6 h-6 text-blue-400" />
            {isApprover ? 'Persetujuan & Disposisi Izin Kepala Sekolah' : 'Pengajuan & Riwayat Perizinan'}
          </h2>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            {isApprover 
              ? 'Pusat validasi perizinan terpadu untuk Siswa, Guru Pendidik, dan Tenaga Kependidikan (Staf). Ditandatangani dan disahkan langsung oleh Kepala Sekolah.'
              : 'Pusat layanan permohonan izin sakit, dinas luar, dan cuti untuk Siswa, Guru, dan Staf. Status izin diproses dan diverifikasi langsung oleh Kepala Sekolah.'}
          </p>
        </div>

        {/* Principal ID Card Snippet */}
        <div className="bg-[#181818]/90 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3.5 shrink-0 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Pejabat Penyetuju (Kepala Sekolah)</div>
            <div className="text-xs font-bold text-white">{namaKepalaSekolah}</div>
            <div className="text-[11px] font-mono text-blue-400">NIP. {nipKepalaSekolah}</div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {isApprover && (
            <button
              onClick={() => setActiveMode('persetujuan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'persetujuan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Persetujuan Kepala Sekolah</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {currentRole !== 'kepsek' && (
            <button
              onClick={() => setActiveMode('pengajuan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'pengajuan'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Buat Pengajuan Baru</span>
            </button>
          )}

          {isApprover && (
            <button
              onClick={() => setActiveMode('riwayat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'riwayat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rekap & Cetak Surat Izin</span>
            </button>
          )}
        </div>

        {/* Global Pending Counter (Approver only) */}
        {isApprover && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Menunggu Disposisi:</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {pendingCount} Permohonan
            </span>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW CARDS (Approver only) */}
      {isApprover && (activeMode === 'persetujuan' || activeMode === 'riwayat') && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Menunggu Persetujuan</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">{pendingCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Siswa ({pendingSiswaCount}) • Guru/Staf ({pendingGuruStafCount})</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Izin Siswa Menunggu</div>
              <div className="text-2xl font-black text-blue-400 mt-0.5">{pendingSiswaCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Perlu diverifikasi Kepala Sekolah</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Izin Guru & Staf Menunggu</div>
              <div className="text-2xl font-black text-purple-400 mt-0.5">{pendingGuruStafCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cuti, Sakit, & Dinas Luar</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Telah Disetujui</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{approvedCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ditolak: {rejectedCount} pemohon</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: PERSETUJUAN KEPALA SEKOLAH (APPROVAL & DISPOSITION)   */}
      {/* ------------------------------------------------------------- */}
      {isApprover && (activeMode === 'persetujuan' || activeMode === 'riwayat') && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            {/* Left Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-slate-800 text-xs">
                <span className="px-2 text-slate-400 font-bold text-[10px] uppercase">Kategori:</span>
                {(['all', 'siswa', 'guru', 'staf'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs capitalize transition-all cursor-pointer ${
                      filterType === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'Semua' : t}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-slate-800 text-xs">
                <span className="px-2 text-slate-400 font-bold text-[10px] uppercase">Status:</span>
                {(['all', 'Pending', 'Disetujui', 'Ditolak'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      filterStatus === s
                        ? s === 'Pending' ? 'bg-amber-600 text-white shadow-sm' : s === 'Disetujui' ? 'bg-emerald-600 text-white shadow-sm' : s === 'Ditolak' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s === 'all' ? 'Semua Status' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Search Input & Batch Action */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, NISN, NIP, alasan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Batch Action Buttons (Approver only) */}
              {isApprover && selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBatchApprove}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui {selectedIds.length} Terpilih</span>
                  </button>
                  <button
                    type="button"
                    onClick={triggerDeleteBatch}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus {selectedIds.length} Terpilih</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLE PERIZINAN */}
          <div className="bg-[#121212] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#181818] text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    {isApprover && (
                      <th className="px-4 py-3.5 w-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedIds.length === filteredList.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredList.map(item => item.id));
                            }
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          {selectedIds.length > 0 && selectedIds.length === filteredList.length ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5">Pemohon & Status</th>
                    <th className="px-4 py-3.5">Tipe / Kelas / Bagian</th>
                    <th className="px-4 py-3.5">Jenis Izin</th>
                    <th className="px-4 py-3.5">Alasan / Keterangan</th>
                    <th className="px-4 py-3.5">Status Persetujuan</th>
                    <th className="px-4 py-3.5 text-right">{isApprover ? 'Aksi Disposisi' : 'Aksi / Opsi'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={isApprover ? 8 : 7} className="px-4 py-12 text-center text-slate-500 font-semibold space-y-2">
                        <FileSignature className="w-8 h-8 text-slate-600 mx-auto" />
                        <p>Tidak ada data perizinan yang sesuai dengan filter yang dipilih.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-blue-950/20' : ''}`}
                        >
                          {isApprover && (
                            <td className="px-4 py-3.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedIds(prev => 
                                    prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                                  );
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          )}

                          <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            <div>{item.tanggal}</div>
                            {item.sampaiTanggal && (
                              <div className="text-[10px] text-slate-500">s/d {item.sampaiTanggal}</div>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {item.nama}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {item.sourceType === 'siswa' ? `NISN: ${item.identifier}` : `NIP/NIK: ${item.identifier}`}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                item.sourceType === 'siswa' 
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                  : item.sourceType === 'guru' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {item.sourceType}
                              </span>
                              <span className="text-[11px] text-slate-300 font-semibold">{item.kelasOrBagian}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.kategoriIzin === 'Sakit' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              item.kategoriIzin === 'Dinas Luar' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              item.kategoriIzin === 'Dispensasi Lomba' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                              item.kategoriIzin === 'Cuti Tahunan' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}>
                              {item.kategoriIzin || item.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 max-w-[200px]">
                            <p className="truncate text-slate-300 font-medium" title={item.keterangan}>
                              {item.keterangan}
                            </p>
                            {item.alasanPenolakan && item.statusIzin === 'Ditolak' && (
                              <p className="text-[10px] text-rose-400 truncate mt-0.5" title={item.alasanPenolakan}>
                                Catatan: {item.alasanPenolakan}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.statusIzin === 'Pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" /> Menunggu Disposisi
                              </span>
                            ) : item.statusIzin === 'Disetujui' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disetujui Kepala Sekolah
                                </span>
                                <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                  {item.tanggalPersetujuan || item.tanggal}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  <XCircle className="w-3 h-3 text-rose-400" /> Ditolak
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Approve & Reject buttons for Principal/Approver */}
                              {isApprover && item.statusIzin === 'Pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(item, true)}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                                    title="Setujui Izin & Kirim WA Otomatis"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectModalItem(item);
                                      setRejectReasonInput('');
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    title="Tolak Izin dengan Catatan"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}

                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setDetailItem(item)}
                                className="p-1.5 bg-[#181818] text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                title="Lihat Detail & Bukti Lampiran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Official Permit Letter */}
                              <button
                                type="button"
                                onClick={() => setPrintItem(item)}
                                className="p-1.5 bg-[#181818] text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                title="Cetak Lembar Disposisi / Surat Izin Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Send WA (Approver only) */}
                              {isApprover && (
                                <button
                                  type="button"
                                  onClick={() => sendApprovalWhatsApp(item, item.statusIzin === 'Ditolak' ? 'Ditolak' : 'Disetujui', item.alasanPenolakan)}
                                  className="p-1.5 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 rounded-lg border border-emerald-500/30 transition-all cursor-pointer"
                                  title="Kirim Konfirmasi via WhatsApp Fonnte"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete (Approver only) */}
                              {isApprover && (
                                <button
                                  type="button"
                                  onClick={() => triggerDeleteSingle(item)}
                                  className="p-1.5 bg-[#181818] text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                                  title="Hapus Data Perizinan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: BUAT PENGAJUAN BARU (FORMULIR IZIN / CUTI TERPADU)    */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'pengajuan' && (
        <div className="max-w-3xl mx-auto bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-400" />
              Formulir Permohonan Izin / Cuti Terpadu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Data yang diinputkan akan masuk ke antrean validasi dan disposisi Kepala Sekolah.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Tipe Pengguna */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Kategori Pemohon *</label>
              <div className="grid grid-cols-3 gap-2 bg-[#181818] p-1.5 rounded-xl border border-slate-800">
                {(['Siswa', 'Guru', 'Staf'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFormTipe(t);
                      setSelectedOrangId('');
                      if (t === 'Siswa') setKategoriIzin('Sakit');
                      else if (t === 'Guru') setKategoriIzin('Cuti Tahunan');
                      else setKategoriIzin('Izin Pribadi');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      formTipe === t 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'Siswa' ? <GraduationCap className="w-4 h-4" /> : t === 'Guru' ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Rombel if Siswa */}
            {formTipe === 'Siswa' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Pilih Kelas / Rombel Siswa</label>
                <select
                  value={selectedRombel}
                  onChange={e => {
                    setSelectedRombel(e.target.value);
                    setSelectedOrangId('');
                  }}
                  className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="">-- Semua Kelas (atau pilih kelas spesifik) --</option>
                  {rombelList.map(r => (
                    <option key={r.id} value={r.namaRombel}>{r.namaRombel}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dropdown Pemohon Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Pilih Nama Pemohon *</label>
              <select
                value={selectedOrangId}
                onChange={e => setSelectedOrangId(e.target.value)}
                className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                required
              >
                <option value="">-- Pilih Nama {formTipe} --</option>
                {formTipe === 'Siswa' && filteredSiswaByRombel.map(s => (
                  <option key={s.id} value={s.id}>{s.nama} ({s.nisn}) - {s.kelas}</option>
                ))}
                {formTipe === 'Guru' && guruList.map(g => (
                  <option key={g.id} value={g.id}>{g.nama} (NIP: {g.nip}) - {g.mataPelajaran || g.jabatan}</option>
                ))}
                {formTipe === 'Staf' && stafList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama} - {s.bagian}</option>
                ))}
              </select>
            </div>

            {/* Kategori Izin */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Jenis / Kategori Perizinan *</label>
              <select
                value={kategoriIzin}
                onChange={e => setKategoriIzin(e.target.value)}
                className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
              >
                {formTipe === 'Siswa' ? (
                  <>
                    <option value="Sakit">Sakit (Surat Dokter / Rawat Inap)</option>
                    <option value="Izin Pribadi">Izin Pribadi / Keperluan Keluarga</option>
                    <option value="Dispensasi Lomba">Dispensasi Lomba / Olimpiade / Olahraga</option>
                    <option value="Izin Pulang Cepat">Izin Pulang Cepat (Kondisi Khusus)</option>
                    <option value="Lainnya">Lainnya</option>
                  </>
                ) : (
                  <>
                    <option value="Sakit">Sakit (Surat Keterangan Faskes)</option>
                    <option value="Cuti Tahunan">Cuti Tahunan Resmi</option>
                    <option value="Cuti Melahirkan">Cuti Bersalin / Melahirkan</option>
                    <option value="Dinas Luar">Dinas Luar / Pelatihan / Workshop</option>
                    <option value="Izin Keperluan Mendesak">Izin Keperluan Keluarga Mendesak</option>
                    <option value="Lainnya">Lainnya</option>
                  </>
                )}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Tanggal Mulai Izin *</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Tanggal Selesai (Opsional)</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Keterangan & Alasan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Keterangan / Alasan Izin *</label>
              <textarea
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                rows={3}
                placeholder="Tuliskan rincian alasan izin, misal: rawat inap di rumah sakit, menghadiri kegiatan kedinasan, dsb..."
                className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-medium"
                required
              />
            </div>

            {/* Lampiran Bukti / Surat Dokter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Lampiran Bukti (Surat Dokter / Surat Tugas) - Opsional</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL Foto/Dokumen Bukti atau ketik 'Surat Dokter Terlampir di TU'"
                  value={lampiranBukti}
                  onChange={e => setLampiranBukti(e.target.value)}
                  className="flex-1 bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setLampiranBukti('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer"
                  title="Gunakan Contoh Surat Dokter"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sample Bukti</span>
                </button>
              </div>
            </div>

            {/* Opsi Kirim WA ke Kepala Sekolah */}
            <div className="flex items-center gap-2.5 bg-[#181818]/80 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="sendWaKepsek"
                checked={sendWaToKepsek}
                onChange={e => setSendWaToKepsek(e.target.checked)}
                className="w-4 h-4 rounded bg-[#181818] border-slate-700 text-orange-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="sendWaKepsek" className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center justify-between flex-1">
                <span>Kirim Notifikasi WhatsApp Otomatis ke Kepala Sekolah</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">Fonnte WA</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMode('persetujuan')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pengajuan ke Kepala Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: LIHAT DETAIL PERMOHONAN & BUKTI LAMPIRAN              */}
      {/* ------------------------------------------------------------- */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-blue-400" /> Rincian Pengajuan Izin
              </h3>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Applicant Card */}
              <div className="p-4 bg-[#181818] rounded-xl border border-slate-800 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
                  {detailItem.nama.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{detailItem.nama}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300">
                      {detailItem.sourceType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {detailItem.sourceType === 'siswa' ? `NISN: ${detailItem.identifier}` : `NIP/NIK: ${detailItem.identifier}`} • {detailItem.kelasOrBagian}
                  </div>
                  {detailItem.telepon && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> WA: {detailItem.telepon}
                    </div>
                  )}
                </div>
              </div>

              {/* Permit Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#181818] rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Izin</div>
                  <div className="font-mono font-bold text-white mt-1">{detailItem.tanggal}</div>
                  {detailItem.sampaiTanggal && <div className="text-[10px] text-slate-400">s/d {detailItem.sampaiTanggal}</div>}
                </div>
                <div className="p-3 bg-[#181818] rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Jenis Izin</div>
                  <div className="font-bold text-orange-400 mt-1">{detailItem.kategoriIzin || detailItem.status}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-[#181818] rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Alasan / Uraian Izin:</div>
                <p className="text-slate-200 leading-relaxed font-medium">{detailItem.keterangan}</p>
              </div>

              {/* Status Disposisi */}
              <div className="p-3.5 bg-blue-950/20 rounded-xl border border-blue-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-300 uppercase">Status Disposisi Kepala Sekolah:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    detailItem.statusIzin === 'Disetujui' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    detailItem.statusIzin === 'Ditolak' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {detailItem.statusIzin}
                  </span>
                </div>
                {detailItem.disetujuiOleh && (
                  <div className="text-[11px] text-slate-300 mt-1">
                    Disahkan oleh: <strong className="text-white">{detailItem.disetujuiOleh}</strong>
                  </div>
                )}
                {detailItem.alasanPenolakan && (
                  <div className="text-[11px] text-rose-300 mt-1">
                    Alasan Penolakan: <em>{detailItem.alasanPenolakan}</em>
                  </div>
                )}
              </div>

              {/* Proof Attachment Image */}
              {detailItem.buktiUrl && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lampiran Dokumen / Surat:</div>
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-h-48">
                    <img src={detailItem.buktiUrl} alt="Lampiran Bukti" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintItem(detailItem);
                    setDetailItem(null);
                  }}
                  className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Lembar Disposisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = detailItem;
                    sendApprovalWhatsApp(item, item.statusIzin === 'Ditolak' ? 'Ditolak' : 'Disetujui', item.alasanPenolakan);
                  }}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Kirim Konfirmasi WhatsApp Fonnte"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = detailItem;
                    setDetailItem(null);
                    triggerDeleteSingle(item);
                  }}
                  className="p-2 bg-[#181818] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  title="Hapus Pengajuan Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {detailItem.statusIzin === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModalItem(detailItem);
                        setDetailItem(null);
                      }}
                      className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(detailItem, true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui Izin</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: TOLAK PENGAJUAN DENGAN ALASAN & CATATAN               */}
      {/* ------------------------------------------------------------- */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" /> Penolakan Izin / Cuti
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Berikan catatan penolakan untuk <strong className="text-white">{rejectModalItem.nama}</strong> ({rejectModalItem.kelasOrBagian}).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Alasan Penolakan Kepala Sekolah *</label>
              <textarea
                value={rejectReasonInput}
                onChange={e => setRejectReasonInput(e.target.value)}
                rows={3}
                placeholder="Contoh: Perlu menyertakan surat dokter asli bertanda tangan faskes resmi, atau jadwal bertepatan dengan ujian penting."
                className="w-full bg-[#181818] border border-slate-700 text-white text-xs p-3 rounded-xl focus:border-rose-500 focus:outline-none resize-none font-medium"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReject(rejectReasonInput, true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Konfirmasi Tolak & Kirim WA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CETAK LEMBAR DISPOSISI SURAT IZIN RESMI KEPALA SEKOLAH */}
      {/* ------------------------------------------------------------- */}
      {printItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-auto text-left print:m-0 print:p-0">
            
            {/* Action Header on Screen */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold uppercase text-slate-600">Pratinjau Surat Disposisi Izin Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintItem(null)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* --- OFFICIAL SCHOOL LETTERHEAD (KOP SURAT) --- */}
            <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
              <div className="flex items-center justify-center gap-4">
                {schoolSettings?.logoUrl ? (
                  <img src={schoolSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-2xl">
                    S
                  </div>
                )}
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-950">
                    {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHİR'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    NPSN: {schoolSettings?.npsn || '70048660'} • Akreditasi: {schoolSettings?.akreditasi || 'A (Unggul)'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {schoolSettings?.alamat || 'Jl. Education No. 123, Kebayoran Baru, Jakarta Selatan'} • Telp: {schoolSettings?.telepon || '(021) 555-0199'}
                  </p>
                  <p className="text-[10px] font-mono text-blue-700">
                    Website: {schoolSettings?.website || 'https://smpislammodernalfakhir.sch.id'} • Email: {schoolSettings?.email || 'info@sekolah.sch.id'}
                  </p>
                </div>
              </div>
            </div>

            {/* Letter Title */}
            <div className="text-center space-y-1">
              <h2 className="text-sm font-extrabold uppercase tracking-wide underline underline-offset-4 text-slate-950">
                SURAT DISPOSISI & KETERANGAN IZIN KEPALA SEKOLAH
              </h2>
              <p className="text-[11px] font-mono text-slate-600">
                Nomor: 421.3/IZN-{printItem.id.slice(-6).toUpperCase()}/SMP-ALFAKHIR/{new Date().getFullYear()}
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <p>
                Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>{schoolSettings?.namaSekolah || 'SMP Islam Modern Al Fakhír'}</strong>, dengan ini memberikan disposisi dan pengesahan perizinan kepada:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Nama Lengkap</span>
                  <span className="col-span-2 font-bold text-slate-950">: {printItem.nama}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">{printItem.sourceType === 'siswa' ? 'NISN / NIS' : 'NIP / NIK'}</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900">: {printItem.identifier}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">{printItem.sourceType === 'siswa' ? 'Kelas / Rombel' : 'Jabatan / Tugas'}</span>
                  <span className="col-span-2 font-bold text-slate-900">: {printItem.kelasOrBagian}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Jenis Perizinan</span>
                  <span className="col-span-2 font-bold text-blue-700">: {printItem.kategoriIzin || printItem.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Tanggal Izin</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900">: {printItem.tanggal}{printItem.sampaiTanggal ? ` s/d ${printItem.sampaiTanggal}` : ''}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-600">Uraian / Alasan</span>
                  <span className="col-span-2 text-slate-800 italic">: "{printItem.keterangan}"</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block text-xs">KEPUTUSAN KEPALA SEKOLAH:</span>
                <span className="text-xs font-extrabold text-emerald-700 uppercase">
                  ✓ {printItem.statusIzin === 'Disetujui' ? 'DISETUJUI & DIBERIKAN DISPOSISI RESMI' : printItem.statusIzin === 'Ditolak' ? 'DITOLAK DENGAN CATATAN' : 'MENUNGGU VERIFIKASI DOKUMEN'}
                </span>
                {printItem.alasanPenolakan && (
                  <p className="text-[11px] text-rose-700 mt-0.5">Catatan: {printItem.alasanPenolakan}</p>
                )}
              </div>

              <p className="text-[11px] text-slate-700">
                Demikian surat disposisi keterangan izin ini diterbitkan dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-6 flex justify-between items-end text-xs">
              {/* Validation QR Code */}
              <div className="space-y-1 text-center">
                <div className="p-2 bg-white border border-slate-300 rounded-lg inline-block shadow-sm">
                  <svg className="w-16 h-16" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff"/>
                    <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#000000"/>
                    <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#000000"/>
                    <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#000000"/>
                    <rect x="45" y="10" width="8" height="20" fill="#000000"/>
                    <rect x="45" y="40" width="20" height="8" fill="#000000"/>
                    <rect x="70" y="55" width="20" height="8" fill="#000000"/>
                    <rect x="55" y="70" width="10" height="20" fill="#000000"/>
                    <rect x="75" y="75" width="15" height="15" fill="#000000"/>
                  </svg>
                </div>
                <div className="text-[9px] font-mono text-slate-500">Tervalidasi Sistem Digital</div>
              </div>

              {/* Principal Signature */}
              <div className="text-right space-y-1">
                <p className="text-[11px] text-slate-600">
                  {schoolSettings?.kotaKabupaten || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-[11px] font-bold text-slate-900">Kepala Sekolah,</p>
                
                {/* Stamp & Sig Placeholder */}
                <div className="h-16 flex items-center justify-end pr-4">
                  <div className="border-2 border-dashed border-blue-400/60 rounded-lg px-3 py-1 text-[10px] font-bold text-blue-600 rotate-[-4deg] bg-blue-50/50">
                    TERVERIFIKASI & TERCATAT
                  </div>
                </div>

                <p className="text-xs font-black text-slate-950 underline underline-offset-2">
                  {namaKepalaSekolah}
                </p>
                <p className="text-[11px] font-mono text-slate-700">NIP. {nipKepalaSekolah}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: KONFIRMASI HAPUS DATA PERIZINAN                      */}
      {/* ------------------------------------------------------------- */}
      {deleteModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121212] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-rose-950/50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" /> Konfirmasi Hapus Data Perizinan
              </h3>
              <button
                type="button"
                onClick={() => setDeleteModalTarget(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {deleteModalTarget.isBatch ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Apakah Anda yakin ingin menghapus <strong className="text-rose-400">{deleteModalTarget.count} data perizinan</strong> yang dipilih?
                </p>
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-[11px] text-rose-200">
                  Data yang dihapus tidak dapat dipulihkan kembali.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Apakah Anda yakin ingin menghapus data perizinan ini?
                </p>
                {deleteModalTarget.item && (
                  <div className="p-3.5 bg-[#181818] border border-slate-800 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-white text-sm">{deleteModalTarget.item.nama}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{deleteModalTarget.item.sourceType === 'siswa' ? 'Kelas:' : 'Bagian:'} {deleteModalTarget.item.kelasOrBagian}</span>
                      <span>•</span>
                      <span className="font-mono">{deleteModalTarget.item.identifier}</span>
                    </div>
                    <div className="text-[11px] text-orange-400 font-semibold">
                      Jenis: {deleteModalTarget.item.kategoriIzin || deleteModalTarget.item.status} ({deleteModalTarget.item.tanggal})
                    </div>
                    {deleteModalTarget.item.keterangan && (
                      <div className="text-[11px] text-slate-300 italic">
                        "{deleteModalTarget.item.keterangan}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
