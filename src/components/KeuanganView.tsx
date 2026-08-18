import React, { useState, useMemo, useEffect } from 'react';
import { downloadCSV } from '../lib/exportUtils';
import { dbClearCollection } from '../lib/firebaseSync';
import { 
  Wallet, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Send, 
  Settings, 
  CheckCheck, 
  Printer, 
  Calendar, 
  User, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  DollarSign,
  AlertCircle,
  FileText,
  Sliders,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Tag,
  GraduationCap,
  Sparkles,
  Layers,
  RefreshCw,
  RotateCcw,
  MessageSquare,
  Smartphone,
  Bell
} from 'lucide-react';
import { TagihanKeuangan, TransaksiKeuangan, Siswa, KeuanganSubTab, TarifBiaya, TipeKeuangan, SchoolSettings, RombelKelas, EkstrakurikulerItem } from '../types/school';
import { sendFonnteMessage } from '../lib/fonnte';
import { INITIAL_FONNTE_CONFIG, INITIAL_TARIF_BIAYA, INITIAL_ROMBEL } from '../data/mockData';

interface KeuanganViewProps {
  tagihanList: TagihanKeuangan[];
  setTagihanList: React.Dispatch<React.SetStateAction<TagihanKeuangan[]>>;
  transaksiList: TransaksiKeuangan[];
  setTransaksiList: React.Dispatch<React.SetStateAction<TransaksiKeuangan[]>>;
  userGoogleToken: string;
  siswaList?: Siswa[];
  setSiswaList?: React.Dispatch<React.SetStateAction<Siswa[]>>;
  rombelList?: RombelKelas[];
  subTab?: KeuanganSubTab;
  setSubTab?: (subTab: KeuanganSubTab) => void;
  tarifBiayaList?: TarifBiaya[];
  setTarifBiayaList?: React.Dispatch<React.SetStateAction<TarifBiaya[]>>;
  schoolSettings?: SchoolSettings;
  setSchoolSettings?: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  ekskulList?: EkstrakurikulerItem[];
  onRefresh?: () => void;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  tagihanList,
  setTagihanList,
  transaksiList,
  setTransaksiList,
  userGoogleToken,
  siswaList = [],
  setSiswaList,
  rombelList = INITIAL_ROMBEL,
  subTab,
  setSubTab,
  tarifBiayaList: propTarifBiayaList,
  setTarifBiayaList: propSetTarifBiayaList,
  schoolSettings,
  setSchoolSettings,
  ekskulList = [],
  onRefresh
}) => {
  console.log('KeuanganView rendered with tagihanList.length:', tagihanList.length);
  // Navigation Subtab State
  const [localActiveTab, setLocalActiveTab] = useState<KeuanganSubTab>('pembayaran');
  const activeTab = subTab || localActiveTab;

  const handleTabChange = (tab: KeuanganSubTab) => {
    if (setSubTab) {
      setSubTab(tab);
    }
    setLocalActiveTab(tab);
  };

  // Internal Fee Rate State (fallback if not provided via props)
  const [internalTarifList, setInternalTarifList] = useState<TarifBiaya[]>(INITIAL_TARIF_BIAYA);
  const tarifList = propTarifBiayaList || internalTarifList;
  const setTarifList = propSetTarifBiayaList || setInternalTarifList;

  // Filter Data Pembayaran Siswa State
  const [tahunAjaran, setTahunAjaran] = useState<string>(schoolSettings?.tahunAjaran || '2026/2027');
  const [semester, setSemester] = useState<string>(schoolSettings?.semesterAktif || 'Ganjil');
  const [searchKey, setSearchKey] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (schoolSettings?.tahunAjaran) {
      setTahunAjaran(schoolSettings.tahunAjaran);
    }
    if (schoolSettings?.semesterAktif) {
      setSemester(schoolSettings.semesterAktif);
    }
  }, [schoolSettings]);

  // Search Suggestions memo
  const searchSuggestions = useMemo(() => {
    if (!searchKey.trim() || searchKey.trim().length < 1) return [];
    const q = searchKey.trim().toLowerCase();
    return siswaList.filter(s => 
      s.nama.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      (s.nisn && s.nisn.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [siswaList, searchKey]);

  // Find Selected Siswa
  const selectedSiswa = useMemo(() => {
    if (!siswaList.length) return null;
    const query = appliedSearch.trim().toLowerCase();
    if (!query) return null;

    const match = siswaList.find(
      s => s.nis.toLowerCase() === query || 
           (s.nisn && s.nisn.toLowerCase() === query) ||
           s.nis.toLowerCase().includes(query) ||
           (s.nisn && s.nisn.toLowerCase().includes(query)) ||
           s.nama.toLowerCase().includes(query) ||
           s.id.toLowerCase() === query
    );

    return match || null;
  }, [siswaList, appliedSearch]);

  const studentKey = `${selectedSiswa?.nis || 'default'}_${tahunAjaran}_${semester}`;

  // Selected Months for Bulanan SPP Payment
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Dynamic Payment Months Data State with localStorage persistence
  const [paidMonthsState, setPaidMonthsState] = useState<{ [month: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_paid_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const allMonths = [
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
  ];

  // Dynamic Monthly SPP Fee derived from Tarif Biaya settings matching student's class
  const monthlyFee = useMemo(() => {
    if (!tarifList || tarifList.length === 0) return 100000;

    const sppTarifs = tarifList.filter(t => t.tipe === 'spp' && t.status === 'Aktif');
    if (sppTarifs.length === 0) return 100000;

    if (selectedSiswa && selectedSiswa.kelas) {
      const k = selectedSiswa.kelas.toLowerCase();
      const match = sppTarifs.find(t => {
        const tk = t.tingkatKelas.toLowerCase();
        if ((k.includes('7') || k.includes('vii')) && (tk.includes('7') || tk.includes('vii'))) return true;
        if ((k.includes('8') || k.includes('viii')) && (tk.includes('8') || tk.includes('viii'))) return true;
        if ((k.includes('9') || k.includes('ix')) && (tk.includes('9') || tk.includes('ix'))) return true;
        if ((k.includes('10') || k.includes('x')) && (tk.includes('10') || tk.includes('x'))) return true;
        if ((k.includes('11') || k.includes('xi')) && (tk.includes('11') || tk.includes('xi'))) return true;
        if ((k.includes('12') || k.includes('xii')) && (tk.includes('12') || tk.includes('xii'))) return true;
        return false;
      });
      if (match) return match.nominal;
    }

    return sppTarifs[0].nominal;
  }, [tarifList, selectedSiswa]);

  const calculatedTotal = selectedMonths.length > 0 ? selectedMonths.length * monthlyFee : 0;

  const uktTarifs = useMemo(() => tarifList.filter(t => t.tipe === 'ukt' && t.status === 'Aktif'), [tarifList]);
  const ekskulTarifs = useMemo(() => tarifList.filter(t => t.tipe === 'ekskul' && t.status === 'Aktif'), [tarifList]);
  const [quickPayType, setQuickPayType] = useState<'spp' | 'ukt' | 'ekskul'>('spp');
  const [quickPayItemId, setQuickPayItemId] = useState<string>('');

  // Rekap / Daftar Tagihan Filter States (SPP, UKT, Ekskul, Kelas/Rombel)
  const [filterTipeTagihan, setFilterTipeTagihan] = useState<'all' | 'spp' | 'ukt' | 'ekskul'>('all');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [searchTagihanQuery, setSearchTagihanQuery] = useState<string>('');

  // Synthesize complete list of tagihan covering SPP, UKT, and Ekskul for all students
  const allEffectiveTagihanList = useMemo(() => {
    const combined: TagihanKeuangan[] = tagihanList.filter(t => !t.isDeleted);

    // Build map of existing tagihan and deleted markers
    const existingKeySet = new Set<string>();
    const deletedSynIds = new Set<string>();
    const deletedKeys = new Set<string>();

    tagihanList.forEach(t => {
      if (t) {
        if (t.isDeleted) {
          deletedSynIds.add(t.id);
          if (t.siswaId && t.tipe) {
            deletedKeys.add(`${t.siswaId}-${t.tipe.toLowerCase()}`);
          }
          if (t.siswaNama && t.tipe) {
            const sName = (t.siswaNama || '').trim().toLowerCase();
            const sTipe = (t.tipe || '').toLowerCase();
            deletedKeys.add(`${sName}-${sTipe}`);
            if (t.namaTagihan) {
              deletedKeys.add(`${sName}-${t.namaTagihan.toLowerCase()}`);
            }
          }
        } else if (t.siswaNama) {
          const sName = (t.siswaNama || '').trim().toLowerCase();
          const sTipe = (t.tipe || '').toLowerCase();
          existingKeySet.add(`${sName}-${sTipe}`);
          if (t.siswaId) {
            existingKeySet.add(`${t.siswaId}-${sTipe}`);
          }
        }
      }
    });

    const tipesToEnsure: Array<'spp' | 'ukt' | 'ekskul'> = ['spp', 'ukt', 'ekskul'];

    siswaList.forEach(siswa => {
      if (!siswa || !siswa.nama) return;
      const sNameNorm = (siswa.nama || '').trim().toLowerCase();

      tipesToEnsure.forEach(tipe => {
        const key = `${sNameNorm}-${tipe}`;
        const idKey = `${siswa.id}-${tipe}`;
        const synId = `syn-${tipe}-${siswa.id}`;

        if (!existingKeySet.has(key) && !existingKeySet.has(idKey) && !deletedSynIds.has(synId) && !deletedKeys.has(key) && !deletedKeys.has(idKey)) {
          // Find tariff if available (class-specific for SPP)
          const matchingTarif = tarifList.find(tr => {
            if (!tr || (tr.tipe || '').toLowerCase() !== tipe || tr.status !== 'Aktif') return false;
            if (tipe === 'spp' && siswa.kelas) {
              const k = siswa.kelas.toLowerCase();
              const tk = tr.tingkatKelas.toLowerCase();
              if ((k.includes('7') || k.includes('vii')) && (tk.includes('7') || tk.includes('vii'))) return true;
              if ((k.includes('8') || k.includes('viii')) && (tk.includes('8') || tk.includes('viii'))) return true;
              if ((k.includes('9') || k.includes('ix')) && (tk.includes('9') || tk.includes('ix'))) return true;
              if ((k.includes('10') || k.includes('x')) && (tk.includes('10') || tk.includes('x'))) return true;
              if ((k.includes('11') || k.includes('xi')) && (tk.includes('11') || tk.includes('xi'))) return true;
              if ((k.includes('12') || k.includes('xii')) && (tk.includes('12') || tk.includes('xii'))) return true;
              return false;
            }
            return true;
          });
          let defaultNominal = 350000;
          let defaultNama = 'SPP Bulanan Kelas 7 (Agustus 2026)';

          if (tipe === 'ukt') {
            defaultNominal = matchingTarif ? matchingTarif.nominal : 2500000;
            defaultNama = matchingTarif ? `${matchingTarif.namaBiaya} (T.A ${tahunAjaran})` : `Uang Gedung & Pengembangan (UKT) (T.A ${tahunAjaran})`;
          } else if (tipe === 'ekskul') {
            defaultNominal = matchingTarif ? matchingTarif.nominal : 100000;
            defaultNama = matchingTarif ? `${matchingTarif.namaBiaya} (T.A ${tahunAjaran})` : `Kegiatan Ekstrakurikuler & Pramuka (T.A ${tahunAjaran})`;
          } else if (tipe === 'spp') {
            defaultNominal = matchingTarif ? matchingTarif.nominal : 350000;
            defaultNama = matchingTarif ? `${matchingTarif.namaBiaya} (Agustus 2026)` : `SPP Bulanan Kelas 7 (Agustus 2026)`;
          }

          if (deletedKeys.has(`${sNameNorm}-${defaultNama.toLowerCase()}`)) {
            return;
          }

          // Check if there's any transaction for this student and tipe in transaksiList
          const txs = transaksiList.filter(tx => 
            tx && tx.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === sNameNorm && (tx.tipe || '').toLowerCase() === tipe
          );
          const terbayarFromTx = txs.reduce((sum, tx) => sum + (tx.nominal || 0), 0);
          const nominalFinal = terbayarFromTx > defaultNominal ? terbayarFromTx : defaultNominal;
          const isLunas = terbayarFromTx >= nominalFinal;
          const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;

          combined.push({
            id: synId,
            siswaId: siswa.id,
            siswaNama: siswa.nama,
            kelas: siswa.kelas || '',
            tipe: tipe,
            namaTagihan: (latestTx && latestTx.pembayaran) ? latestTx.pembayaran : defaultNama,
            bulanTahun: tahunAjaran,
            nominal: nominalFinal,
            terbayar: terbayarFromTx,
            status: isLunas ? 'Lunas' : (terbayarFromTx > 0 ? 'Dicicil' : 'Belum Lunas'),
            tanggalBayar: latestTx ? latestTx.tanggal : '',
            jatuhTempo: '2026-08-10'
          });
        }
      });
    });

    return combined;
  }, [tagihanList, siswaList, tarifList, transaksiList, tahunAjaran]);

  // Dynamically derive list of available classes for the dropdown
  const availableKelasList = useMemo(() => {
    const list = new Set<string>();
    siswaList.forEach(s => {
      if (s.kelas) list.add(s.kelas);
    });
    return Array.from(list).sort();
  }, [siswaList]);

  // Filtered tagihan list for the Rekap table
  const filteredGlobalTagihanList = useMemo(() => {
    return allEffectiveTagihanList.filter(t => {
      if (!t) return false;
      const tTipe = (t.tipe || '').toLowerCase();
      // 1. Tipe Tagihan Filter
      if (filterTipeTagihan !== 'all') {
        if (tTipe !== filterTipeTagihan.toLowerCase()) return false;
      }
      // 2. Kelas Filter
      if (filterKelas !== 'all') {
        if ((t.kelas || '') !== filterKelas) return false;
      }

      // Calculate status for filtering
      const isSynthesized = t.id && String(t.id).startsWith('syn-');
      const txsForTagihan = transaksiList.filter(tx => 
        tx.tagihanId === t.id || 
        (isSynthesized && tx && tx.siswaNama && t && t.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === (t.siswaNama || '').trim().toLowerCase() && (tx.tipe || '').toLowerCase() === (t.tipe || '').toLowerCase())
      );
      const totalTerbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + tx.nominal, 0);
      let totalTerbayar = Math.max(t.terbayar || 0, totalTerbayarFromTx);
      if (t.status === 'Lunas' && totalTerbayar < t.nominal) {
        totalTerbayar = t.nominal;
      }
      const isLunas = t.status === 'Lunas' || (totalTerbayar >= t.nominal && t.nominal > 0);
      const isDicicil = !isLunas && totalTerbayar > 0;

      // 4. Search Query
      if (searchTagihanQuery.trim()) {
        const q = searchTagihanQuery.toLowerCase();
        const matchSiswa = (t.siswaNama || '').toLowerCase().includes(q);
        const matchKelas = (t.kelas || '').toLowerCase().includes(q);
        const matchNama = (t.namaTagihan || '').toLowerCase().includes(q);
        const matchTipe = tTipe.includes(q);
        const statusStr = isLunas ? 'lunas' : (isDicicil ? 'dicicil cicil sebagian' : 'belum lunas');
        const matchStatus = statusStr.includes(q);
        if (!matchSiswa && !matchKelas && !matchNama && !matchTipe && !matchStatus) return false;
      }
      return true;
    });
  }, [allEffectiveTagihanList, filterTipeTagihan, filterKelas, searchTagihanQuery, transaksiList]);

  // Payment Form Input States
  const [inputTotal, setInputTotal] = useState<number>(0);
  const [inputDibayar, setInputDibayar] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMetodePembayaran, setSelectedMetodePembayaran] = useState<string>('Cash / Kasir');

  // Auto-select first item when type changes or tariffs update
  React.useEffect(() => {
    if (quickPayType === 'ukt' && uktTarifs.length > 0 && !uktTarifs.some(t => t.id === quickPayItemId)) {
      setQuickPayItemId(uktTarifs[0].id);
    } else if (quickPayType === 'ekskul' && ekskulTarifs.length > 0 && !ekskulTarifs.some(t => t.id === quickPayItemId)) {
      setQuickPayItemId(ekskulTarifs[0].id);
    }
  }, [quickPayType, uktTarifs, ekskulTarifs]);

  // Sync total when selected months, monthlyFee, or selected item change
  React.useEffect(() => {
    if (quickPayType === 'spp') {
      const tot = selectedMonths.length > 0 ? selectedMonths.length * monthlyFee : 0;
      setInputTotal(tot);
      setInputDibayar(tot);
    } else {
      const list = quickPayType === 'ukt' ? uktTarifs : ekskulTarifs;
      const found = list.find(t => t.id === quickPayItemId) || list[0];
      if (found) {
        setInputTotal(found.nominal);
        setInputDibayar(found.nominal);
      } else {
        setInputTotal(0);
        setInputDibayar(0);
      }
    }
  }, [selectedMonths, monthlyFee, quickPayType, quickPayItemId, uktTarifs, ekskulTarifs]);

  // Calculate Kembalian
  const kembalian = Math.max(0, inputDibayar - (selectedMonths.length > 0 ? calculatedTotal : inputTotal));

  // Bebas Payment Custom Amount State
  const [bebasPayInput, setBebasPayInput] = useState<{ [key: string]: number }>({});

  // Bebas Terbayar Map state for non-SPP items with localStorage persistence
  const [bebasTerbayarMap, setBebasTerbayarMap] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_bebas_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Dynamic Bebas Items derived from Pengaturan Tarif Biaya (non-SPP)
  const bebasItems = useMemo(() => {
    const nonSppTarifs = tarifList.filter(t => t.tipe !== 'spp' && t.status === 'Aktif');
    if (nonSppTarifs.length === 0) {
      return [
        { id: 'gedung', nama: 'Uang Gedung & Pengembangan (UKT)', total: 2500000, terbayar: 0 },
        { id: 'seragam', nama: 'Seragam & Atribut Sekolah', total: 750000, terbayar: 0 },
        { id: 'kegiatan', nama: 'Iuran Kegiatan / Ekstrakurikuler', total: 300000, terbayar: 0 }
      ];
    }
    return nonSppTarifs.map(t => {
      const terbayar = bebasTerbayarMap[t.id] ?? 0;
      return {
        id: t.id,
        nama: `${t.namaBiaya} (${t.tingkatKelas})`,
        total: t.nominal,
        terbayar: Math.min(t.nominal, terbayar)
      };
    });
  }, [tarifList, bebasTerbayarMap, tahunAjaran, selectedSiswa]);

  const totalSppPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'spp';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalUktPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'ukt';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalEkskulPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'ekskul';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalSemuaPembayaran = totalSppPaid + totalUktPaid + totalEkskulPaid;

  // State for deletion modal
  const [deleteTargetTagihan, setDeleteTargetTagihan] = useState<TagihanKeuangan | null>(null);

  // Student Specific Recent Transactions List with localStorage persistence
  const [deleteTargetTx, setDeleteTargetTx] = useState<{
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  } | null>(null);

  const [studentTransactions, setStudentTransactions] = useState<Array<{
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  }>>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_tx_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync state changes on studentKey change or updates, treating active transaksiList and tagihanList as primary truth
  React.useEffect(() => {
    if (!selectedSiswa) {
      setStudentTransactions([]);
      setPaidMonthsState({});
      setBebasTerbayarMap({});
      return;
    }

    try {
      const studentName = selectedSiswa.nama;
      const normName = studentName.trim().toLowerCase();

      // 1. Transactions List
      const studentTxs = transaksiList.filter(tx => 
        tx && tx.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === normName
      );

      const derivedTxs = studentTxs.map(tx => ({
        id: tx.id,
        pembayaran: tx.pembayaran || (tx.tipe === 'spp' ? `Pembayaran SPP` : `Pembayaran ${tx.tipe.toUpperCase()}`),
        tagihan: tx.nominal,
        tanggal: tx.tanggal,
        type: tx.tipe === 'spp' ? ('spp' as const) : ('bebas' as const),
        itemId: tx.tagihanId
      }));

      setStudentTransactions(derivedTxs);
      try {
        localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(derivedTxs));
      } catch (e) {}

      // 2. Paid Months State
      const derivedPaid: Record<string, string> = {};
      studentTxs.forEach(tx => {
        if (tx.tipe === 'spp') {
          allMonths.forEach(m => {
            if (tx.pembayaran && tx.pembayaran.toLowerCase().includes(m.toLowerCase())) {
              derivedPaid[m] = tx.tanggal;
            }
          });
        }
      });

      tagihanList.forEach(t => {
        if (t && !t.isDeleted && t.siswaNama && (t.siswaNama || '').trim().toLowerCase() === normName && t.tipe === 'spp' && t.status === 'Lunas') {
          allMonths.forEach(m => {
            if (t.namaTagihan && t.namaTagihan.toLowerCase().includes(m.toLowerCase())) {
              derivedPaid[m] = t.tanggalBayar || '09/08/2026';
            }
          });
        }
      });

      setPaidMonthsState(derivedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(derivedPaid));
      } catch (e) {}

      // 3. Bebas Terbayar Map
      const derivedBebas: Record<string, number> = {};
      studentTxs.forEach(tx => {
        if (tx.tipe !== 'spp' && tx.tagihanId) {
          derivedBebas[tx.tagihanId] = (derivedBebas[tx.tagihanId] || 0) + tx.nominal;
        }
      });

      setBebasTerbayarMap(derivedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(derivedBebas));
      } catch (e) {}

    } catch (e) {
      console.error('Error syncing student finance data:', e);
    }
  }, [studentKey, selectedSiswa, transaksiList, tagihanList]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(studentTransactions));
    } catch (e) {}
  }, [studentTransactions, studentKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(paidMonthsState));
    } catch (e) {}
  }, [paidMonthsState, studentKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(bebasTerbayarMap));
    } catch (e) {}
  }, [bebasTerbayarMap, studentKey]);

  // Helper helper to format dates beautifully
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('/') || dateStr.length > 10) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const mIdx = parseInt(month, 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
      }
    }
    return dateStr;
  };

  const studentBills = useMemo(() => {
    if (!selectedSiswa) return [];
    const normName = selectedSiswa.nama.trim().toLowerCase();
    return allEffectiveTagihanList.filter(t => 
      t && !t.isDeleted && (t.siswaId === selectedSiswa.id || (t.siswaNama && t.siswaNama.trim().toLowerCase() === normName))
    );
  }, [selectedSiswa, allEffectiveTagihanList]);

  // Execute Permanent Bill Deletion (Deletes bill & removes all associated transaction records)
  const handleExecuteDeleteTagihanPermanen = (t: TagihanKeuangan) => {
    if (!t) return;
    const sNameNorm = (t.siswaNama || (selectedSiswa ? selectedSiswa.nama : '') || '').trim().toLowerCase();
    const tTipe = (t.tipe || '').toLowerCase();
    const tName = (t.namaTagihan || '').toLowerCase();

    // 1. Mark bill as tombstoned in tagihanList
    const tombstone: TagihanKeuangan = {
      ...t,
      isDeleted: true
    };
    setTagihanList(prev => [
      ...prev.filter(item => item.id !== t.id),
      tombstone
    ]);

    // 2. Remove associated transactions from global transaksiList
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(tx => {
        if (!tx) return true;
        if (tx.tagihanId && tx.tagihanId === t.id) return false;
        const txStudent = (tx.siswaNama || '').trim().toLowerCase();
        if (sNameNorm && txStudent === sNameNorm) {
          const txTipe = (tx.tipe || '').toLowerCase();
          const txPay = (tx.pembayaran || '').toLowerCase();
          if (txTipe === tTipe && tName && (txPay.includes(tName) || tName.includes(txPay))) {
            return false;
          }
          if (t.id.startsWith('syn-') && txTipe === tTipe) {
            return false;
          }
        }
        return true;
      }));
    }

    // 3. Remove associated transactions from studentTransactions
    const updatedStudentTx = studentTransactions.filter(tx => {
      if (tx.itemId && tx.itemId === t.id) return false;
      const txPay = (tx.pembayaran || '').toLowerCase();
      if (tName && (txPay.includes(tName) || tName.includes(txPay))) return false;
      if (t.id.startsWith('syn-') && ((tTipe === 'spp' && tx.type === 'spp') || (tTipe !== 'spp' && tx.type === 'bebas'))) {
        return false;
      }
      return true;
    });
    setStudentTransactions(updatedStudentTx);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedStudentTx));
    } catch (e) {}

    // 4. Clean up paid SPP months if applicable
    if (tTipe === 'spp') {
      const updatedPaid = { ...paidMonthsState };
      allMonths.forEach(m => {
        if (tName.includes(m.toLowerCase())) {
          delete updatedPaid[m];
        }
      });
      setPaidMonthsState(updatedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
      } catch (e) {}
    }

    // 5. Clean up Bebas balances if applicable
    if (tTipe !== 'spp') {
      const updatedBebas = { ...bebasTerbayarMap };
      if (t.id) delete updatedBebas[t.id];
      bebasItems.forEach(b => {
        if (b.id === t.id || tName.includes(b.nama.toLowerCase()) || b.nama.toLowerCase().includes(tName)) {
          delete updatedBebas[b.id];
        }
      });
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    setDeleteTargetTagihan(null);
  };

  // Execute Payment Cancellation Only (Resets bill to Belum Lunas)
  const handleExecuteResetPaymentOnly = (t: TagihanKeuangan) => {
    if (!t) return;
    const sNameNorm = (t.siswaNama || (selectedSiswa ? selectedSiswa.nama : '') || '').trim().toLowerCase();
    const tTipe = (t.tipe || '').toLowerCase();
    const tName = (t.namaTagihan || '').toLowerCase();

    // 1. Reset bill payment status in tagihanList
    setTagihanList(prev => {
      const exists = prev.some(item => item.id === t.id);
      if (exists) {
        return prev.map(item => item.id === t.id ? {
          ...item,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        } : item);
      } else {
        const materializedId = t.id.startsWith('syn-') ? `tag-${Date.now()}` : t.id;
        const unpaidBill: TagihanKeuangan = {
          ...t,
          id: materializedId,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        };
        return [unpaidBill, ...prev.filter(item => item.id !== t.id)];
      }
    });

    // 2. Remove associated transactions from global transaksiList
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(tx => {
        if (!tx) return true;
        if (tx.tagihanId && tx.tagihanId === t.id) return false;
        const txStudent = (tx.siswaNama || '').trim().toLowerCase();
        if (sNameNorm && txStudent === sNameNorm) {
          const txTipe = (tx.tipe || '').toLowerCase();
          const txPay = (tx.pembayaran || '').toLowerCase();
          if (txTipe === tTipe && tName && (txPay.includes(tName) || tName.includes(txPay))) {
            return false;
          }
          if (t.id.startsWith('syn-') && txTipe === tTipe) {
            return false;
          }
        }
        return true;
      }));
    }

    // 3. Remove associated transactions from studentTransactions
    const updatedStudentTx = studentTransactions.filter(tx => {
      if (tx.itemId && tx.itemId === t.id) return false;
      const txPay = (tx.pembayaran || '').toLowerCase();
      if (tName && (txPay.includes(tName) || tName.includes(txPay))) return false;
      if (t.id.startsWith('syn-') && ((tTipe === 'spp' && tx.type === 'spp') || (tTipe !== 'spp' && tx.type === 'bebas'))) {
        return false;
      }
      return true;
    });
    setStudentTransactions(updatedStudentTx);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedStudentTx));
    } catch (e) {}

    // 4. Clean up paid SPP months if applicable
    if (tTipe === 'spp') {
      const updatedPaid = { ...paidMonthsState };
      allMonths.forEach(m => {
        if (tName.includes(m.toLowerCase())) {
          delete updatedPaid[m];
        }
      });
      setPaidMonthsState(updatedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
      } catch (e) {}
    }

    // 5. Clean up Bebas balances if applicable
    if (tTipe !== 'spp') {
      const updatedBebas = { ...bebasTerbayarMap };
      if (t.id) delete updatedBebas[t.id];
      bebasItems.forEach(b => {
        if (b.id === t.id || tName.includes(b.nama.toLowerCase()) || b.nama.toLowerCase().includes(tName)) {
          delete updatedBebas[b.id];
        }
      });
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    setDeleteTargetTagihan(null);
  };

  // Helper Function: Perform Transaction Deletion & State Rollback
  const performDeleteTransaction = (targetTx: {
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  }) => {
    // 1. Remove from student transactions list
    const updatedTransactions = studentTransactions.filter(t => t.id !== targetTx.id);
    setStudentTransactions(updatedTransactions);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedTransactions));
    } catch (e) {}

    const originalTx = transaksiList.find(tx => tx && tx.id === targetTx.id);
    const txTipe = originalTx ? originalTx.tipe : (targetTx.type === 'spp' ? 'spp' : 'ukt');

    const pembayaranText = targetTx.pembayaran || (originalTx ? originalTx.pembayaran : '') || '';
    const isSpp = txTipe === 'spp' || pembayaranText.toLowerCase().includes('spp');

    // 2. Restore SPP paid months if applicable
    let updatedPaid = { ...paidMonthsState };
    if (isSpp) {
      const monthMatch = pembayaranText.match(/\(([^)]+)\)/) || pembayaranText.match(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/i);
      if (monthMatch) {
        const monthNames = monthMatch[1] ? monthMatch[1].split(/[,&]/).map(m => m.trim()) : [monthMatch[0]];
        monthNames.forEach(m => {
          const foundMonth = allMonths.find(month => month.toLowerCase() === m.toLowerCase());
          if (foundMonth) {
            delete updatedPaid[foundMonth];
          }
        });
        setPaidMonthsState(updatedPaid);
        try {
          localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
        } catch (e) {}
      }
    }

    // 3. Restore Bebas payment balance if applicable
    let updatedBebas = { ...bebasTerbayarMap };
    if (txTipe !== 'spp' || targetTx.itemId) {
      const targetId = targetTx.itemId || (originalTx ? originalTx.tagihanId : undefined);
      if (targetId) {
        updatedBebas[targetId] = Math.max(0, (updatedBebas[targetId] || 0) - targetTx.tagihan);
      } else {
        const matchedBebas = bebasItems.find(item => pembayaranText.toLowerCase().includes(item.nama.toLowerCase()));
        if (matchedBebas) {
          updatedBebas[matchedBebas.id] = Math.max(0, (updatedBebas[matchedBebas.id] || 0) - targetTx.tagihan);
        }
      }
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    // 4. Remove from global transaction list if callback exists
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(t => t.id !== targetTx.id));
    }

    // 5. Update corresponding bill in global tagihanList if callback exists
    if (setTagihanList) {
      setTagihanList(prev => {
        return prev.map(t => {
          const isMatch = t.id === targetTx.itemId || (originalTx && t.id === originalTx.tagihanId) || 
            (t.siswaNama && selectedSiswa && 
             (t.siswaNama.toLowerCase() === selectedSiswa.nama.toLowerCase()) &&
             (t.tipe === txTipe));
          if (isMatch) {
            const remainingTerbayar = Math.max(0, (t.terbayar || 0) - targetTx.tagihan);
            const isLunas = remainingTerbayar >= t.nominal && t.nominal > 0;
            return {
              ...t,
              terbayar: remainingTerbayar,
              status: isLunas ? 'Lunas' : (remainingTerbayar > 0 ? 'Dicicil' : 'Belum Lunas')
            };
          }
          return t;
        });
      });
    }
  };

  // Hapus Transaksi Spesifik Handler
  const handleDeleteSingleTransaction = (txId: string) => {
    const targetTx = studentTransactions.find(t => t.id === txId);
    if (!targetTx) return;
    const cleanTx = {
      ...targetTx,
      pembayaran: targetTx.pembayaran || (targetTx.type === 'spp' ? 'Pembayaran SPP' : 'Pembayaran Tagihan')
    };
    setDeleteTargetTx(cleanTx);
  };

  // Reset Semua Transaksi Dari Awal Handler
  const handleResetAllTransactions = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset SELURUH riwayat transaksi dan status pembayaran siswa dari awal? Tindakan ini akan mengosongkan semua riwayat pembayaran dan mengembalikan status tagihan seperti semula.')) {
      setStudentTransactions([]);
      setPaidMonthsState({});
      setBebasTerbayarMap({});
      if (setTransaksiList) {
        setTransaksiList([]);
      }
      if (setTagihanList) {
        setTagihanList(prev => prev.map(t => ({
          ...t,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        })));
      }
      try {
        localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify([]));
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify({}));
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify({}));
      } catch (e) {}
      alert('Semua riwayat transaksi berhasil di-reset dari awal.');
    }
  };

  // Helper to generate automatic invoice number in 0001/C-ALFAKHIR/VIII/2026 format
  const generateInvoiceNumber = (): string => {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentRomanMonth = romanMonths[now.getMonth()];
    
    // Get counter from localStorage
    const storageKey = `invoice_seq_${currentYear}_${currentRomanMonth}`;
    let counter = Number(localStorage.getItem(storageKey) || "0");
    counter += 1;
    localStorage.setItem(storageKey, String(counter));
    
    const paddedSeq = String(counter).padStart(4, '0');
    return `${paddedSeq}/C-ALFAKHIR/${currentRomanMonth}/${currentYear}`;
  };

  // Stable invoice number generator per tagihan object
  const getStableInvoiceNumber = (t: any): string => {
    let seed = 1;
    if (t && t.id) {
      if (typeof t.id === 'number') {
        seed = t.id % 9000;
      } else {
        let hash = 0;
        const strId = String(t.id);
        for (let i = 0; i < strId.length; i++) {
          hash = (hash << 5) - hash + strId.charCodeAt(i);
          hash |= 0;
        }
        seed = Math.abs(hash) % 9000;
      }
    }
    const finalSeq = String((seed % 8999) + 1).padStart(4, '0');
    let romanMonth = "VIII";
    let year = "2026";
    if (t && t.tanggalTagihan) {
      const dateParts = String(t.tanggalTagihan).split(/[-/]/);
      if (dateParts.length >= 3) {
        const possibleYear = dateParts.find(p => p.length === 4);
        if (possibleYear) {
          year = possibleYear;
        }
        let monthNum = 8;
        if (dateParts[0].length === 4) {
          monthNum = parseInt(dateParts[1], 10) || 8;
        } else {
          monthNum = parseInt(dateParts[1], 10) || 8;
        }
        const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        if (monthNum >= 1 && monthNum <= 12) {
          romanMonth = romanMonths[monthNum - 1];
        }
      }
    }
    return `${finalSeq}/C-ALFAKHIR/${romanMonth}/${year}`;
  };

  // Printable Receipt Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printReceiptData, setPrintReceiptData] = useState<{
    noNota: string;
    tahunAjaran: string;
    nis: string;
    nama: string;
    namaIbu: string;
    kelas: string;
    items?: Array<{ id: string; uraian: string; jumlah: number }>;
    pembayaranTitle?: string;
    nominal?: number;
    dibayar: number;
    kembalian?: number;
    tanggal: string;
    penerima: string;
  } | null>(null);

  // Helper functions to manage receipt items dynamically
  const handleAddReceiptItem = () => {
    if (!printReceiptData) return;
    const currentItems = (printReceiptData.items && printReceiptData.items.length > 0)
      ? printReceiptData.items
      : [{ id: '1', uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan', jumlah: printReceiptData.nominal || 100000 }];
    
    const newItem = {
      id: `item-${Date.now()}`,
      uraian: '',
      jumlah: 0
    };
    setPrintReceiptData({
      ...printReceiptData,
      items: [...currentItems, newItem]
    });
  };

  const handleUpdateReceiptItem = (id: string, field: 'uraian' | 'jumlah', val: any) => {
    if (!printReceiptData) return;
    const currentItems = (printReceiptData.items && printReceiptData.items.length > 0)
      ? printReceiptData.items
      : [{ id: '1', uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan', jumlah: printReceiptData.nominal || 100000 }];
    
    const updated = currentItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'jumlah' ? Number(val) || 0 : val };
      }
      return item;
    });
    setPrintReceiptData({
      ...printReceiptData,
      items: updated
    });
  };

  const handleDeleteReceiptItem = (id: string) => {
    if (!printReceiptData) return;
    const currentItems = printReceiptData.items || [];
    if (currentItems.length <= 1) return;
    setPrintReceiptData({
      ...printReceiptData,
      items: currentItems.filter(item => item.id !== id)
    });
  };

  // Computed receipt items, total nominal, and kembalian
  const receiptItems = useMemo(() => {
    if (!printReceiptData) return [];
    if (printReceiptData.items && printReceiptData.items.length > 0) {
      return printReceiptData.items;
    }
    return [
      {
        id: 'default-1',
        uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan',
        jumlah: printReceiptData.nominal || 100000
      }
    ];
  }, [printReceiptData]);

  const totalReceiptNominal = useMemo(() => {
    return receiptItems.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
  }, [receiptItems]);

  const receiptKembalian = useMemo(() => {
    if (!printReceiptData) return 0;
    return Math.max(0, (printReceiptData.dibayar || 0) - totalReceiptNominal);
  }, [printReceiptData, totalReceiptNominal]);

  // Handle print receipt with fallbacks
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Standard window.print() failed, trying iframe fallback:', err);
      const printContent = document.getElementById('printable-receipt');
      if (printContent) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Kwitansi Bukti Pembayaran Resmi</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; background: #fff; }
                  .print\\:hidden { display: none !important; }
                  .print\\:inline { display: inline !important; }
                  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
                  th { background-color: #f1f5f9; font-weight: bold; }
                  .text-right { text-align: right; }
                  .text-center { text-align: center; }
                  .font-bold { font-weight: bold; }
                  .font-mono { font-family: monospace; }
                  .flex { display: flex; justify-content: space-between; }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `);
          doc.close();
          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1000);
          }, 300);
        }
      }
    }
  };

  // Handle Download Receipt as HTML/PDF file
  const handleDownloadReceipt = () => {
    try {
      const itemsHtml = receiptItems.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.uraian || '-'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">
            Rp ${(Number(item.jumlah) || 0).toLocaleString('id-ID')}
          </td>
        </tr>
      `).join('');

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwitansi ${printReceiptData.noNota} - ${printReceiptData.nama}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; display: flex; justify-content: center; }
    .card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; max-width: 550px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header h2 { margin: 0; font-size: 16px; font-weight: 800; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; }
    .title { font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-top: 8px; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
    .label { color: #64748b; }
    .value { font-weight: bold; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th { background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; font-weight: bold; }
    .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 12px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .summary-row.total { font-weight: bold; font-size: 14px; color: #047857; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 28px; font-size: 11px; text-align: center; }
    .signature-box { width: 40%; }
    .space { height: 45px; }
    .btn-print { display: block; width: 100%; text-align: center; background: #059669; color: white; padding: 10px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 16px; cursor: pointer; border: none; }
    @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>SEKOLAH MENENGAH ATAS WORKSPACE 2026</h2>
      <p>Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan • Telp: (021) 7891234</p>
      <div class="title">KWITANSI BUKTI PEMBAYARAN RESMI</div>
    </div>
    <div class="info">
      <div class="row"><span class="label">No. Nota / Kwitansi</span><span class="value">${printReceiptData.noNota}</span></div>
      <div class="row"><span class="label">Tahun Ajaran</span><span class="value">${printReceiptData.tahunAjaran}</span></div>
      <div class="row"><span class="label">NIS & Nama Siswa</span><span class="value">${printReceiptData.nis} - ${printReceiptData.nama}</span></div>
      <div class="row"><span class="label">Kelas / Nama Ibu</span><span class="value">${printReceiptData.kelas} / ${printReceiptData.namaIbu}</span></div>
      <div class="row"><span class="label">Tanggal Transaksi</span><span class="value">${printReceiptData.tanggal}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Uraian Pembayaran</th>
          <th style="text-align: right; width: 140px;">Jumlah (Rp)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-row total">
        <span>Total Tagihan:</span>
        <span>Rp ${totalReceiptNominal.toLocaleString('id-ID')}</span>
      </div>
      <div class="summary-row">
        <span>Jumlah Uang Diserahkan:</span>
        <span>Rp ${(printReceiptData.dibayar || 0).toLocaleString('id-ID')}</span>
      </div>
      <div class="summary-row" style="color: #047857; font-weight: bold;">
        <span>Uang Kembalian:</span>
        <span>Rp ${receiptKembalian.toLocaleString('id-ID')}</span>
      </div>
    </div>
    <div class="signatures">
      <div class="signature-box">
        <p>Siswa / Penyetor,</p>
        <div class="space"></div>
        <p><b>(${printReceiptData.nama})</b></p>
      </div>
      <div class="signature-box">
        <p>Kasir Keuangan,</p>
        <div class="space"></div>
        <p><b>(${printReceiptData.penerima})</b></p>
      </div>
    </div>
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF Kwitansi</button>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = printReceiptData.nama ? printReceiptData.nama.replace(/[^a-zA-Z0-9_]/g, '_') : 'Siswa';
      link.setAttribute('download', `Kwitansi_${printReceiptData.noNota}_${safeName}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download receipt error:', err);
      alert('Gagal mengunduh file kwitansi.');
    }
  };

  // Handle Download Receipt as Image (PNG)
  const handleDownloadReceiptAsImage = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 750;
      const itemsCount = receiptItems.length;
      canvas.height = 720 + (itemsCount * 32);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'extrabold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEKOLAH MENENGAH ATAS WORKSPACE 2026', canvas.width / 2, 55);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan • Telp: (021) 7891234', canvas.width / 2, 76);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('KWITANSI BUKTI PEMBAYARAN RESMI', canvas.width / 2, 102);

      // Header Line
      ctx.beginPath();
      ctx.moveTo(40, 118);
      ctx.lineTo(canvas.width - 40, 118);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Receipt details
      let y = 148;
      const drawRow = (label: string, val: string) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '13px sans-serif';
        ctx.fillText(label, 45, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(val, canvas.width - 45, y);
        y += 24;
      };

      drawRow('No. Nota / Kwitansi', printReceiptData.noNota);
      drawRow('Tahun Ajaran', printReceiptData.tahunAjaran);
      drawRow('NIS & Nama Siswa', `${printReceiptData.nis} - ${printReceiptData.nama}`);
      drawRow('Kelas / Nama Ibu', `${printReceiptData.kelas} / ${printReceiptData.namaIbu}`);
      drawRow('Tanggal Transaksi', printReceiptData.tanggal);

      y += 8;

      // Table Header
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(40, y, canvas.width - 80, 32);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, y, canvas.width - 80, 32);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Uraian Pembayaran', 55, y + 21);
      ctx.textAlign = 'right';
      ctx.fillText('Jumlah (Rp)', canvas.width - 55, y + 21);

      y += 32;

      // Items
      receiptItems.forEach(item => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, y, canvas.width - 80, 32);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(40, y, canvas.width - 80, 32);

        ctx.fillStyle = '#0f172a';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.uraian || '-', 55, y + 21);

        ctx.textAlign = 'right';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`Rp ${(Number(item.jumlah) || 0).toLocaleString('id-ID')}`, canvas.width - 55, y + 21);

        y += 32;
      });

      y += 16;

      // Summary Box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, y, canvas.width - 80, 100);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(40, y, canvas.width - 80, 100);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Total Tagihan:', 55, y + 30);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Rp ${totalReceiptNominal.toLocaleString('id-ID')}`, canvas.width - 55, y + 30);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText('Jumlah Uang Diserahkan:', 55, y + 58);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Rp ${(printReceiptData.dibayar || 0).toLocaleString('id-ID')}`, canvas.width - 55, y + 58);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Uang Kembalian:', 55, y + 84);
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Rp ${receiptKembalian.toLocaleString('id-ID')}`, canvas.width - 55, y + 84);

      y += 135;

      // Signatures
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Siswa / Penyetor,', 160, y);
      ctx.fillText('Kasir Keuangan,', canvas.width - 160, y);

      y += 55;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`(${printReceiptData.nama})`, 160, y);
      ctx.fillText(`(${printReceiptData.penerima})`, canvas.width - 160, y);

      const safeName = printReceiptData.nama ? printReceiptData.nama.replace(/[^a-zA-Z0-9_]/g, '_') : 'Siswa';
      const link = document.createElement('a');
      link.download = `Kwitansi_${printReceiptData.noNota}_${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download receipt image error:', err);
      alert('Gagal mengunduh gambar kwitansi.');
    }
  };

  // Re-open receipt modal for any previous transaction
  const handleReprintTransaction = (tx: { id: string; pembayaran: string; tagihan: number; tanggal: string }) => {
    const receipt = {
      noNota: generateInvoiceNumber(),
      tahunAjaran,
      nis: selectedSiswa ? selectedSiswa.nis : '20261001',
      nama: selectedSiswa ? selectedSiswa.nama : 'Ahmad Rizky Pratama',
      namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : 'Ibnu Al haytam / Budi Pratama',
      kelas: selectedSiswa ? selectedSiswa.kelas : 'Kelas 7',
      items: [
        {
          id: `item-${Date.now()}`,
          uraian: tx.pembayaran,
          jumlah: tx.tagihan
        }
      ],
      pembayaranTitle: tx.pembayaran,
      nominal: tx.tagihan,
      dibayar: tx.tagihan,
      kembalian: 0,
      tanggal: tx.tanggal,
      penerima: 'Bendahara Sekolah'
    };
    setPrintReceiptData(receipt);
    setShowPrintModal(true);
  };

  // Fonnte & Sheets Export States
  const [fonnteToken, setFonnteToken] = useState(schoolSettings?.fonnteToken || INITIAL_FONNTE_CONFIG.apiKey);
  const [showFonnteConfigModal, setShowFonnteConfigModal] = useState(false);
  const [waSendingStatus, setWaSendingStatus] = useState<string | null>(null);
  const [exportingSheets, setExportingSheets] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; url?: string; message?: string } | null>(null);

  const getStudentTingkatDanRombel = (siswa: Siswa | null) => {
    if (!siswa) return { tingkatKelas: '-', rombel: '-' };
    
    let tk = siswa.tingkatKelas;
    let rb = siswa.rombel || siswa.kelas || '-';

    if (!tk && rombelList && rombelList.length > 0) {
      const matchRombel = rombelList.find(r => 
        r.namaRombel.trim().toLowerCase() === (siswa.kelas || '').trim().toLowerCase() || 
        r.namaRombel.trim().toLowerCase() === (siswa.rombel || '').trim().toLowerCase()
      );
      if (matchRombel) {
        tk = matchRombel.tingkatKelas;
      }
    }

    if (!tk && siswa.kelas) {
      const k = siswa.kelas.toLowerCase();
      if (k.includes('7') || k.includes('vii')) tk = 'Kelas 7';
      else if (k.includes('8') || k.includes('viii')) tk = 'Kelas 8';
      else if (k.includes('9') || k.includes('ix')) tk = 'Kelas 9';
      else if (k.includes('10') || k.includes(' x') || k.startsWith('x-') || k.startsWith('x ')) tk = 'Kelas 10';
      else if (k.includes('11') || k.includes('xi')) tk = 'Kelas 11';
      else if (k.includes('12') || k.includes('xii')) tk = 'Kelas 12';
    }

    return {
      tingkatKelas: tk || 'Kelas 7',
      rombel: rb
    };
  };

  const [showEditSiswaModal, setShowEditSiswaModal] = useState(false);
  const [editingSiswaData, setEditingSiswaData] = useState<Partial<Siswa>>({});

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa || !setSiswaList) return;
    
    const finalRombel = editingSiswaData.rombel || editingSiswaData.kelas || selectedSiswa.kelas;
    const finalTingkat = editingSiswaData.tingkatKelas || selectedSiswa.tingkatKelas || 'Kelas 7';

    const updatedSiswa: Siswa = {
      ...selectedSiswa,
      ...editingSiswaData,
      tingkatKelas: finalTingkat,
      rombel: finalRombel,
      kelas: finalRombel
    };

    setSiswaList(prev => prev.map(s => s.id === selectedSiswa.id ? updatedSiswa : s));
    setShowEditSiswaModal(false);
    alert("Data siswa (Kelas & Rombel) berhasil diperbarui!");
  };

  const defaultReminderText = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nMenginformasikan tagihan :\n• *No. Invoice*: {NO_INVOICE}\n• *{TAGIHAN}* sebesar *Rp {NOMINAL}*\n• *Jatuh tempo pada* {JATUH_TEMPO}\n• *Status saat ini*: {STATUS}.\n\nMohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer.\n\nTerima kasih atas perhatian Bapak/Ibu.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
  
  const defaultReceiptText = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nTerima kasih, pembayaran *{NAMA_TAGIHAN}* sebesar *{NOMINAL_BAYAR}* telah *KAMI TERIMA* dengan baik pada *{TANGGAL_BAYAR}*.\n• *No. Invoice* : {NO_INVOICE}\n• *Metode*: {METODE_BAYAR}\n\n*Status Tagihan*: {STATUS}.\n• *Bendahara SMPI MODERN AL FAKHIR*`;

  const [localTemplateReminder, setLocalTemplateReminder] = useState(schoolSettings?.fonnteConfig?.templateReminder || defaultReminderText);
  const [localTemplateReceipt, setLocalTemplateReceipt] = useState(schoolSettings?.fonnteConfig?.templateReceipt || defaultReceiptText);
  const [activeRedaksiTab, setActiveRedaksiTab] = useState<'reminder' | 'receipt'>('reminder');

  React.useEffect(() => {
    if (schoolSettings?.fonnteToken) {
      setFonnteToken(schoolSettings.fonnteToken);
    }
    if (schoolSettings?.fonnteConfig?.templateReminder) {
      setLocalTemplateReminder(schoolSettings.fonnteConfig.templateReminder);
    }
    if (schoolSettings?.fonnteConfig?.templateReceipt) {
      setLocalTemplateReceipt(schoolSettings.fonnteConfig.templateReceipt);
    }
  }, [schoolSettings]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveTemplates = () => {
    if (!setSchoolSettings) {
      alert("Fasilitas simpan pengaturan tidak tersedia!");
      return;
    }
    setSchoolSettings(prev => ({
      ...prev,
      fonnteConfig: {
        ...(prev.fonnteConfig || {
          apiKey: prev.fonnteToken || '',
          senderName: '',
          enabled: true,
          autoSendAbsensi: true,
          autoSendKeuangan: true
        }),
        templateReminder: localTemplateReminder,
        templateReceipt: localTemplateReceipt
      }
    }));
    setSaveSuccessMsg("Redaksi notifikasi WhatsApp berhasil disimpan!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleResetTemplate = () => {
    if (activeRedaksiTab === 'reminder') {
      setLocalTemplateReminder(defaultReminderText);
    } else {
      setLocalTemplateReceipt(defaultReceiptText);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const elId = activeRedaksiTab === 'reminder' ? 'template_reminder_input' : 'template_receipt_input';
    const textarea = document.getElementById(elId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;

    if (activeRedaksiTab === 'reminder') {
      setLocalTemplateReminder(newText);
    } else {
      setLocalTemplateReceipt(newText);
    }

    // Restore focus and cursor selection range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Fee Rates Settings View States
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<'semua' | 'spp' | 'ukt' | 'ekskul'>('semua');
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState<string>(new Date().toLocaleString('id-ID', { month: 'long' }));
  const [generateYear, setGenerateYear] = useState<string>(new Date().getFullYear().toString());
  const [generateTypes, setGenerateTypes] = useState<TipeKeuangan[]>(['spp', 'ukt', 'ekskul']);
  const [editingTarif, setEditingTarif] = useState<TarifBiaya | null>(null);
  const [tarifForm, setTarifForm] = useState<{
    namaBiaya: string;
    tipe: TipeKeuangan;
    tingkatKelas: string;
    nominal: number;
    periode: 'Bulanan' | 'Sekali Bayar (Uang Masuk / UKT)' | 'Per Semester';
    keterangan: string;
    status: 'Aktif' | 'Nonaktif';
    ekskulId: string;
  }>({
    namaBiaya: '',
    tipe: 'spp',
    tingkatKelas: 'Kelas 7',
    nominal: 100000,
    periode: 'Bulanan',
    keterangan: '',
    status: 'Aktif',
    ekskulId: ''
  });
  
  // Effect to automatically update tagihan status and terbayar amount when transactions change
  useEffect(() => {
    setTagihanList(prevTagihanList => {
      let hasChanged = false;
      const newList = prevTagihanList.map(tagihan => {
        if (!tagihan || tagihan.isDeleted) return tagihan;
        const txsForTagihan = transaksiList.filter(tx => tx && tx.tagihanId === tagihan.id);
        if (txsForTagihan.length > 0) {
          const terbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + (tx.nominal || 0), 0);
          const sisa = tagihan.nominal - terbayarFromTx;
          const status = sisa <= 0 ? 'Lunas' : (terbayarFromTx > 0 ? 'Dicicil' : 'Belum Lunas');
          const latestTx = txsForTagihan[txsForTagihan.length - 1];
          const latestTanggalBayar = latestTx ? latestTx.tanggal : tagihan.tanggalBayar;
          
          if (tagihan.terbayar !== terbayarFromTx || tagihan.status !== status || tagihan.tanggalBayar !== latestTanggalBayar) {
            hasChanged = true;
            return { ...tagihan, terbayar: terbayarFromTx, status, tanggalBayar: latestTanggalBayar };
          }
        } else if ((tagihan.terbayar && tagihan.terbayar > 0) || tagihan.status === 'Lunas' || tagihan.status === 'Dicicil') {
          // If all transactions were deleted for this bill, revert back to Belum Lunas
          if (!tagihan.id.startsWith('syn-')) {
            hasChanged = true;
            return { ...tagihan, terbayar: 0, status: 'Belum Lunas', tanggalBayar: '' };
          }
        }
        return tagihan;
      });
      return hasChanged ? newList : prevTagihanList;
    });
  }, [transaksiList, setTagihanList]);
  
  // Modal Edit Tagihan
  const [showEditTagihanModal, setShowEditTagihanModal] = useState(false);
  const [editingTagihan, setEditingTagihan] = useState<TagihanKeuangan | null>(null);
  const [editTagihanForm, setEditTagihanForm] = useState<{
    namaTagihan: string;
    nominal: number;
    jatuhTempo: string;
    tanggalBayar: string;
    status: 'Lunas' | 'Belum Lunas' | 'Dicicil';
    terbayar?: number;
    metodePembayaran?: string;
  }>({
    namaTagihan: '',
    nominal: 0,
    jatuhTempo: '',
    tanggalBayar: '',
    status: 'Belum Lunas',
    terbayar: 0,
    metodePembayaran: 'Cash / Kasir'
  });

  // Search Submit Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchKey);
  };

  // Month Selection Toggle
  const toggleMonthSelection = (m: string) => {
    if (paidMonthsState[m]) return; // Already paid
    setSelectedMonths(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  // Helper function to update or create bill in tagihanList upon payment
  const updateOrCreateTagihanList = (
    sName: string,
    sId: string,
    sKelas: string,
    tipe: TipeKeuangan,
    title: string,
    nominal: number,
    bayar: number,
    payDate: string
  ) => {
    localStorage.removeItem('edu_tagihan_force_clear');
    localStorage.removeItem('edu_transaksi_force_clear');
    
    let targetTagihanId = `tag-${Date.now()}`;
    setTagihanList(prev => {
      const normName = sName.trim().toLowerCase();
      const existingIndex = prev.findIndex(t => {
        const isSameStudent = t.siswaId === sId || (t.siswaNama && t.siswaNama.trim().toLowerCase() === normName);
        if (!isSameStudent) return false;

        // Must match exact same type
        if (t.tipe !== tipe) return false;

        // For SPP (monthly), we should match the specific month
        if (tipe === 'spp') {
          const months = [
            'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
            'januari', 'februari', 'maret', 'april', 'mei', 'juni'
          ];
          const matchedMonthInTitle = months.find(m => title.toLowerCase().includes(m));
          const matchedMonthInTagihan = months.find(m => t.namaTagihan.toLowerCase().includes(m));
          
          if (matchedMonthInTitle && matchedMonthInTagihan) {
            return matchedMonthInTitle === matchedMonthInTagihan;
          }
        }

        // Default title matching for non-SPP or fallback
        return t.namaTagihan.toLowerCase().includes(title.toLowerCase()) || 
               title.toLowerCase().includes(t.namaTagihan.toLowerCase());
      });

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        targetTagihanId = existing.id;
        // Correct nominal if it differs from the official tariff nominal being processed
        const finalNominal = existing.nominal !== nominal ? nominal : existing.nominal;
        const newTerbayar = Math.min(finalNominal, (existing.terbayar || 0) + bayar);
        const isLunas = newTerbayar >= finalNominal;
        const updatedItem: TagihanKeuangan = {
          ...existing,
          nominal: finalNominal,
          terbayar: newTerbayar,
          status: isLunas ? 'Lunas' : (newTerbayar > 0 ? 'Dicicil' : 'Belum Lunas'),
          tanggalBayar: payDate
        };
        const newArr = [...prev];
        newArr[existingIndex] = updatedItem;
        return newArr;
      } else {
        const isLunas = bayar >= nominal;
        const newBill: TagihanKeuangan = {
          id: targetTagihanId,
          siswaId: sId || `sis-${Date.now()}`,
          siswaNama: sName || 'Siswa',
          kelas: sKelas || 'Umum',
          tipe: tipe,
          namaTagihan: title,
          bulanTahun: tahunAjaran,
          nominal: nominal,
          terbayar: Math.min(nominal, bayar),
          status: isLunas ? 'Lunas' : (bayar > 0 ? 'Dicicil' : 'Belum Lunas'),
          tanggalBayar: payDate,
          jatuhTempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        };
        return [newBill, ...prev];
      }
    });
    return targetTagihanId;
  };

  // Process Payment / Create Tagihan Submission
  const handleProcessPayment = () => {
    if (!selectedSiswa) {
      alert('Silakan cari dan pilih nama siswa terlebih dahulu!');
      return;
    }

    const studentName = selectedSiswa ? selectedSiswa.nama : '';
    const [tYear, tMonth, tDay] = (transactionDate || new Date().toISOString().split('T')[0]).split('-').map(Number);
    const dateObj = (tYear && tMonth && tDay) ? new Date(tYear, tMonth - 1, tDay) : new Date();
    const todayFormatted = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const dateShort = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    });
    const dateNumeric = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    if (quickPayType === 'spp') {
      if (selectedMonths.length === 0) {
        alert('Silakan pilih bulan SPP pada Jenis Tagihan terlebih dahulu.');
        return;
      }
      const totalToPay = selectedMonths.length * monthlyFee;
      if (totalToPay <= 0) {
        alert('Total tagihan harus lebih dari 0.');
        return;
      }

      const itemTitle = selectedMonths.length > 0 
        ? `SPP - T.A ${tahunAjaran} (${selectedMonths.join(', ')})`
        : `SPP - T.A ${tahunAjaran} (Bulanan)`;

      const tagId = updateOrCreateTagihanList(
        studentName,
        selectedSiswa ? selectedSiswa.id : '',
        selectedSiswa ? selectedSiswa.kelas : '',
        'spp',
        itemTitle,
        totalToPay,
        inputDibayar,
        transactionDate || dateNumeric
      );

      if (inputDibayar > 0) {
        if (selectedMonths.length > 0) {
          const newPaid = { ...paidMonthsState };
          selectedMonths.forEach(m => {
            newPaid[m] = dateShort;
          });
          setPaidMonthsState(newPaid);
        }

        const txUniqueId = `tx-${Date.now()}`;
        const newTx = {
          id: txUniqueId,
          pembayaran: itemTitle,
          tagihan: totalToPay,
          tanggal: todayFormatted,
          type: 'spp' as const
        };
        setStudentTransactions(prev => [newTx, ...prev]);

        if (setTransaksiList) {
          const globalTrx: TransaksiKeuangan = {
            id: txUniqueId,
            tagihanId: tagId,
            siswaNama: studentName,
            pembayaran: itemTitle,
            tipe: 'spp',
            nominal: inputDibayar,
            tanggal: dateNumeric,
            metodePembayaran: selectedMetodePembayaran,
            penerima: 'Kasir / Bendahara Sekolah'
          };
          setTransaksiList(prev => [globalTrx, ...prev]);
        }

        const receipt = {
          noNota: generateInvoiceNumber(),
          tahunAjaran,
          nis: selectedSiswa ? selectedSiswa.nis : '',
          nama: studentName,
          namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
          kelas: selectedSiswa ? selectedSiswa.kelas : '',
          items: [{ id: `item-${Date.now()}`, uraian: itemTitle, jumlah: totalToPay }],
          pembayaranTitle: itemTitle,
          nominal: totalToPay,
          dibayar: inputDibayar,
          kembalian: Math.max(0, inputDibayar - totalToPay),
          tanggal: todayFormatted,
          penerima: 'Bendahara Sekolah'
        };

        setPrintReceiptData(receipt);
        // Jangan tampilkan kuitansi secara otomatis sesuai permintaan user
        // setShowPrintModal(true);
        alert(`Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} berhasil diproses!`);

        if (selectedSiswa && selectedSiswa.teleponWali) {
          const msg = `Yth. Ibu/Bapak Wali dari ${studentName},\n\nTerima kasih! Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} telah DITERIMA oleh Kasir Sekolah pada ${todayFormatted}.\n\n_Tata Usaha & Keuangan Sekolah_`;
          sendFonnteMessage(selectedSiswa.teleponWali, msg, fonnteToken);
        }
      } else {
        alert(`Tagihan ${itemTitle} sebesar Rp ${totalToPay.toLocaleString('id-ID')} berhasil dibuat dan muncul di Rekap (Daftar Tagihan)!`);
      }

      setSelectedMonths([]);
      setInputTotal(0);
      setInputDibayar(0);
    } else {
      const targetTarif = (quickPayType === 'ukt' ? uktTarifs : ekskulTarifs).find(t => t.id === quickPayItemId) || (quickPayType === 'ukt' ? uktTarifs[0] : ekskulTarifs[0]);
      const payNominal = inputTotal > 0 ? inputTotal : (targetTarif ? targetTarif.nominal : 100000);

      if (payNominal <= 0) {
        alert('Total tagihan harus lebih dari 0.');
        return;
      }

      const itemName = targetTarif ? targetTarif.namaBiaya : (quickPayType === 'ukt' ? 'UKT / Uang Masuk' : 'Ekskul / Kegiatan');
      const itemId = targetTarif ? targetTarif.id : quickPayType;
      const itemTitle = `${itemName} (T.A ${tahunAjaran})`;

      const tagId = updateOrCreateTagihanList(
        studentName,
        selectedSiswa ? selectedSiswa.id : '',
        selectedSiswa ? selectedSiswa.kelas : '',
        quickPayType,
        itemTitle,
        payNominal,
        inputDibayar,
        transactionDate || dateNumeric
      );

      if (inputDibayar > 0) {
        setBebasTerbayarMap(prev => {
          const current = prev[itemId] || 0;
          const maxTotal = targetTarif ? targetTarif.nominal : payNominal;
          return { ...prev, [itemId]: Math.min(maxTotal, current + inputDibayar) };
        });

        const txUniqueId = `tx-${Date.now()}`;
        const newTx = {
          id: txUniqueId,
          pembayaran: itemTitle,
          tagihan: payNominal,
          tanggal: todayFormatted,
          itemId,
          type: 'bebas' as const
        };
        setStudentTransactions(prev => [newTx, ...prev]);

        if (setTransaksiList) {
          const globalTrx: TransaksiKeuangan = {
            id: txUniqueId,
            tagihanId: tagId,
            siswaNama: studentName,
            pembayaran: itemTitle,
            tipe: quickPayType,
            nominal: inputDibayar,
            tanggal: dateNumeric,
            metodePembayaran: selectedMetodePembayaran,
            penerima: 'Kasir / Bendahara Sekolah'
          };
          setTransaksiList(prev => [globalTrx, ...prev]);
        }

        const receipt = {
          noNota: generateInvoiceNumber(),
          tahunAjaran,
          nis: selectedSiswa ? selectedSiswa.nis : '',
          nama: studentName,
          namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
          kelas: selectedSiswa ? selectedSiswa.kelas : '',
          items: [{ id: `item-${Date.now()}`, uraian: itemTitle, jumlah: payNominal }],
          pembayaranTitle: itemTitle,
          nominal: payNominal,
          dibayar: inputDibayar,
          kembalian: Math.max(0, inputDibayar - payNominal),
          tanggal: todayFormatted,
          penerima: 'Bendahara Sekolah'
        };

        setPrintReceiptData(receipt);
        // Jangan tampilkan kuitansi secara otomatis sesuai permintaan user
        // setShowPrintModal(true);
        alert(`Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} berhasil diproses!`);

        if (selectedSiswa && selectedSiswa.teleponWali) {
          const msg = `Yth. Ibu/Bapak Wali dari ${studentName},\n\nTerima kasih! Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} telah DITERIMA oleh Kasir Sekolah pada ${todayFormatted}.\n\n_Tata Usaha & Keuangan Sekolah_`;
          sendFonnteMessage(selectedSiswa.teleponWali, msg, fonnteToken);
        }
      } else {
        alert(`Tagihan ${itemTitle} sebesar Rp ${payNominal.toLocaleString('id-ID')} berhasil dibuat dan muncul di Rekap (Daftar Tagihan)!`);
      }

      setInputTotal(0);
      setInputDibayar(0);
    }
  };

  // Process Bebas Payment
  const handleProcessBebasPayment = (itemId: string, namaItem: string) => {
    const payNominal = bebasPayInput[itemId] || 0;
    if (payNominal <= 0) return;

    setBebasTerbayarMap(prev => {
      const current = prev[itemId] || 0;
      const targetItem = bebasItems.find(i => i.id === itemId);
      const maxTotal = targetItem ? targetItem.total : payNominal;
      return { ...prev, [itemId]: Math.min(maxTotal, current + payNominal) };
    });

    const [tYear, tMonth, tDay] = (transactionDate || new Date().toISOString().split('T')[0]).split('-').map(Number);
    const dateObj = (tYear && tMonth && tDay) ? new Date(tYear, tMonth - 1, tDay) : new Date();
    const todayFormatted = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const dateNumeric = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const txUniqueId = `tx-${Date.now()}`;

    const newTx = {
      id: txUniqueId,
      pembayaran: `${namaItem} (T.A ${tahunAjaran})`,
      tagihan: payNominal,
      tanggal: todayFormatted,
      itemId,
      type: 'bebas' as const
    };
    setStudentTransactions(prev => [newTx, ...prev]);

    const studentName = selectedSiswa ? selectedSiswa.nama : '';
    const tagId = updateOrCreateTagihanList(
      studentName,
      selectedSiswa ? selectedSiswa.id : '',
      selectedSiswa ? selectedSiswa.kelas : '',
      'ukt',
      `${namaItem} (T.A ${tahunAjaran})`,
      payNominal,
      payNominal,
      transactionDate || dateNumeric
    );

    if (setTransaksiList) {
      const globalTrx: TransaksiKeuangan = {
        id: txUniqueId,
        tagihanId: tagId,
        siswaNama: studentName,
        pembayaran: `${namaItem} (T.A ${tahunAjaran})`,
        tipe: 'ukt',
        nominal: payNominal,
        tanggal: dateNumeric,
        metodePembayaran: selectedMetodePembayaran,
        penerima: 'Kasir / Bendahara Sekolah'
      };
      setTransaksiList(prev => [globalTrx, ...prev]);
    }
    const receipt = {
      noNota: generateInvoiceNumber(),
      tahunAjaran,
      nis: selectedSiswa ? selectedSiswa.nis : '',
      nama: studentName,
      namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
      kelas: selectedSiswa ? selectedSiswa.kelas : '',
      items: [
        {
          id: `item-${Date.now()}`,
          uraian: `${namaItem} (T.A ${tahunAjaran})`,
          jumlah: payNominal
        }
      ],
      pembayaranTitle: `${namaItem} (T.A ${tahunAjaran})`,
      nominal: payNominal,
      dibayar: payNominal,
      kembalian: 0,
      tanggal: todayFormatted,
      penerima: 'Bendahara Sekolah'
    };
    setPrintReceiptData(receipt);
    setShowPrintModal(true);
  };

  // Calculate unpaid SPP sum
  const unpaidMonthsCount = allMonths.filter(m => !paidMonthsState[m]).length;
  const totalSisaBulanan = unpaidMonthsCount * monthlyFee;

  // Fee Rates CRUD Handlers
  // Delete All Confirmation State
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const handleExecuteDeleteAll = async () => {
    try {
      localStorage.setItem('edu_tagihan_force_clear', 'true');
      localStorage.setItem('edu_transaksi_force_clear', 'true');
      localStorage.setItem('edu_tarif_force_clear', 'true');
      localStorage.setItem('edu_siswa_force_clear', 'true');
      
      setTagihanList([]);
      setTransaksiList([]);
      if (setTarifList) setTarifList([]);
      if (setSiswaList) setSiswaList([]);
      
      const clearPromises = [
        dbClearCollection('edu_tagihanList'),
        dbClearCollection('edu_transaksiList'),
        dbClearCollection('edu_tarifBiayaList'),
        dbClearCollection('edu_siswaList')
      ];
      
      await Promise.all(clearPromises);
      
      localStorage.removeItem('edu_tagihan_force_clear');
      localStorage.removeItem('edu_transaksi_force_clear');
      localStorage.removeItem('edu_tarif_force_clear');
      localStorage.removeItem('edu_siswa_force_clear');
      
      setShowDeleteAllModal(false);
      alert('Seluruh data tagihan, transaksi, tarif, dan siswa berhasil dikosongkan!');
    } catch (error) {
      console.error('Error during mass deletion:', error);
      alert('Gagal mengosongkan data. Silakan coba lagi.');
    }
  };

  const handleOpenAddTarif = () => {
    setEditingTarif(null);
    setTarifForm({
      namaBiaya: '',
      tipe: 'spp',
      tingkatKelas: 'Kelas 7',
      nominal: 100000,
      periode: 'Bulanan',
      keterangan: '',
      status: 'Aktif',
      ekskulId: ''
    });
    setShowTarifModal(true);
  };

  const handleOpenEditTarif = (tarif: TarifBiaya) => {
    setEditingTarif(tarif);
    setTarifForm({
      namaBiaya: tarif.namaBiaya,
      tipe: tarif.tipe,
      tingkatKelas: tarif.tingkatKelas,
      nominal: tarif.nominal,
      periode: tarif.periode,
      keterangan: tarif.keterangan || '',
      status: tarif.status,
      ekskulId: tarif.ekskulId || ''
    });
    setShowTarifModal(true);
  };

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifForm.namaBiaya.trim() || tarifForm.nominal <= 0) {
      alert('Mohon isi nama biaya dan nominal tarif dengan benar.');
      return;
    }

    if (editingTarif) {
      // Update
      setTarifList(prev => prev.map(t => t.id === editingTarif.id ? { ...t, ...tarifForm } : t));
    } else {
      // Create
      const newTarif: TarifBiaya = {
        id: `trf-${Date.now()}`,
        ...tarifForm
      };
      setTarifList(prev => [newTarif, ...prev]);
    }

    setShowTarifModal(false);
  };

  const handleDeleteTarif = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tarif biaya ini?')) {
      setTarifList(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleTarifStatus = (id: string) => {
    setTarifList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Aktif' ? 'Nonaktif' : 'Aktif' };
      }
      return t;
    }));
  };

  const handleGenerateTagihanMassal = () => {
    if (!siswaList || siswaList.length === 0) {
      alert('Data siswa kosong. Tidak dapat membuat tagihan.');
      return;
    }

    const activeTarifs = tarifList.filter(t => t.status === 'Aktif' && generateTypes.includes(t.tipe));
    if (activeTarifs.length === 0) {
      alert('Tidak ada tarif aktif untuk kategori yang dipilih.');
      return;
    }

    let createdCount = 0;
    const newTagihan: TagihanKeuangan[] = [];

    siswaList.forEach(siswa => {
      const { tingkatKelas } = getStudentTingkatDanRombel(siswa);
      
      const matchingTarifs = activeTarifs.filter(t => {
        if (t.tingkatKelas === 'Peserta Ekskul') {
          if (t.ekskulId) {
            const eks = ekskulList.find(e => e.id === t.ekskulId);
            return eks?.anggotaSiswaIds?.includes(siswa.id);
          }
          return false;
        }
        return t.tingkatKelas === tingkatKelas || t.tingkatKelas === 'Semua Tingkat';
      });

      matchingTarifs.forEach(tarif => {
        const bulanTahun = tarif.tipe === 'spp' ? `${generateMonth} ${generateYear}` : generateYear;
        
        // Cek apakah sudah ada tagihan yang sama untuk siswa ini
        const isExist = tagihanList.some(t => 
          t.siswaId === siswa.id && 
          t.namaTagihan === tarif.namaBiaya && 
          t.bulanTahun === bulanTahun &&
          !t.isDeleted
        );

        if (!isExist) {
          createdCount++;
          newTagihan.push({
            id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            siswaId: siswa.id,
            siswaNama: siswa.nama,
            kelas: siswa.kelas || tingkatKelas,
            tipe: tarif.tipe,
            namaTagihan: tarif.namaBiaya,
            bulanTahun: bulanTahun,
            nominal: tarif.nominal,
            terbayar: 0,
            status: 'Belum Lunas',
            jatuhTempo: `10 ${bulanTahun}`,
          });
        }
      });
    });

    if (newTagihan.length > 0) {
      setTagihanList(prev => [...newTagihan, ...prev]);
      alert(`Berhasil membuat ${createdCount} tagihan baru secara otomatis sesuai tarif & kelas masing-masing.`);
    } else {
      alert('Tidak ada tagihan baru yang dibuat. Semua tagihan untuk kriteria ini sudah ada sebelumnya.');
    }
    
    setShowGenerateModal(false);
  };

  // WhatsApp Fonnte Notification Handlers
  const formatWhatsAppMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Asterisks for bold: *text* -> <strong class="font-bold text-slate-900">text</strong>
    html = html.replace(/\*([^*]+)\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
    
    // Underscores for italics: _text_ -> <em class="italic text-slate-600">text</em>
    html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-600">$1</em>');

    return html;
  };

  const parseWaTemplate = (
    template: string,
    vars: {
      NAMA_SISWA: string;
      KELAS: string;
      NAMA_TAGIHAN: string;
      NOMINAL_TAGIHAN: string;
      SISA_TAGIHAN: string;
      NOMINAL_BAYAR: string;
      TANGGAL_BAYAR: string;
      NAMA_SEKOLAH: string;
      TAGIHAN?: string;
      NOMINAL?: string;
      JATUH_TEMPO?: string;
      STATUS?: string;
      NO_INVOICE?: string;
      METODE_BAYAR?: string;
    }
  ) => {
    let result = template;
    const fullVars = {
      ...vars,
      TAGIHAN: vars.TAGIHAN || vars.NAMA_TAGIHAN,
      NOMINAL: vars.NOMINAL || vars.NOMINAL_TAGIHAN,
      JATUH_TEMPO: vars.JATUH_TEMPO || "10 Agustus 2026",
      STATUS: vars.STATUS || "BELUM LUNAS",
      NO_INVOICE: vars.NO_INVOICE || "0001/C-ALFAKHIR/VIII/2026",
      METODE_BAYAR: vars.METODE_BAYAR || "Cash / Kasir"
    };
    Object.entries(fullVars).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{${key}}`, 'gi'), val);
    });
    return result;
  };

  const handleSendWaReminder = async (tagihan: TagihanKeuangan) => {
    const s = siswaList.find(item => item.id === tagihan.siswaId || item.nis === tagihan.siswaNama || item.nama === tagihan.siswaNama);
    const phone = s?.teleponWali || '081234567890';
    const sisa = tagihan.nominal - tagihan.terbayar;
    
    const defaultTemplate = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nMenginformasikan tagihan :\n• *No. Invoice*: {NO_INVOICE}\n• *{TAGIHAN}* sebesar *Rp {NOMINAL}*\n• *Jatuh tempo pada* {JATUH_TEMPO}\n• *Status saat ini*: {STATUS}.\n\nMohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer.\n\nTerima kasih atas perhatian Bapak/Ibu.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
    const templateToUse = schoolSettings?.fonnteConfig?.templateReminder || defaultTemplate;

    const message = parseWaTemplate(templateToUse, {
      NAMA_SISWA: tagihan.siswaNama,
      KELAS: tagihan.kelas || 'X',
      NAMA_TAGIHAN: tagihan.namaTagihan,
      NOMINAL_TAGIHAN: `Rp ${tagihan.nominal.toLocaleString('id-ID')}`,
      SISA_TAGIHAN: `Rp ${sisa.toLocaleString('id-ID')}`,
      NOMINAL_BAYAR: `Rp ${tagihan.terbayar.toLocaleString('id-ID')}`,
      TANGGAL_BAYAR: tagihan.tanggalBayar || new Date().toLocaleDateString('id-ID'),
      NAMA_SEKOLAH: schoolSettings?.namaSekolah || 'Sekolah Modern Al-Fakhir',
      TAGIHAN: tagihan.namaTagihan,
      NOMINAL: `${tagihan.nominal.toLocaleString('id-ID')}`,
      JATUH_TEMPO: tagihan.jatuhTempo || new Date().toLocaleDateString('id-ID'),
      STATUS: tagihan.status === 'Lunas' ? 'LUNAS' : tagihan.status === 'Dicicil' ? 'DICICIL' : 'BELUM LUNAS',
      NO_INVOICE: getStableInvoiceNumber(tagihan)
    });
    
    setWaSendingStatus(`Mengirim WA Tagihan ke ${tagihan.siswaNama} (${phone})...`);
    const res = await sendFonnteMessage(phone, message, fonnteToken);
    setWaSendingStatus(res.message);
    setTimeout(() => setWaSendingStatus(null), 4000);
  };

  const handleSendWaConfirmation = async (tagihan: TagihanKeuangan) => {
    const s = siswaList.find(item => item.id === tagihan.siswaId || item.nis === tagihan.siswaNama || item.nama === tagihan.siswaNama);
    const phone = s?.teleponWali || '081234567890';
    const txs = transaksiList.filter(tx => tx.tagihanId === tagihan.id);
    const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
    const tglBayar = tagihan.tanggalBayar || (latestTx ? latestTx.tanggal : new Date().toLocaleDateString('id-ID'));
    const sisa = tagihan.nominal - tagihan.terbayar;
    const bayarNominal = tagihan.terbayar > 0 ? tagihan.terbayar : tagihan.nominal;

    const defaultTemplate = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nTerima kasih, pembayaran *{NAMA_TAGIHAN}* sebesar *{NOMINAL_BAYAR}* telah *KAMI TERIMA* dengan baik pada *{TANGGAL_BAYAR}*.\n• *No. Invoice* : {NO_INVOICE}\n• *Metode*: {METODE_BAYAR}\n\n*Status Tagihan*: {STATUS}.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
    const templateToUse = schoolSettings?.fonnteConfig?.templateReceipt || defaultTemplate;

    const message = parseWaTemplate(templateToUse, {
      NAMA_SISWA: tagihan.siswaNama,
      KELAS: tagihan.kelas || 'X',
      NAMA_TAGIHAN: tagihan.namaTagihan,
      NOMINAL_TAGIHAN: `Rp ${tagihan.nominal.toLocaleString('id-ID')}`,
      SISA_TAGIHAN: `Rp ${sisa.toLocaleString('id-ID')}`,
      NOMINAL_BAYAR: `Rp ${bayarNominal.toLocaleString('id-ID')}`,
      TANGGAL_BAYAR: tglBayar,
      NAMA_SEKOLAH: schoolSettings?.namaSekolah || 'Sekolah Modern Al-Fakhir',
      TAGIHAN: tagihan.namaTagihan,
      NOMINAL: `${tagihan.nominal.toLocaleString('id-ID')}`,
      JATUH_TEMPO: tagihan.jatuhTempo || new Date().toLocaleDateString('id-ID'),
      STATUS: 'LUNAS',
      NO_INVOICE: getStableInvoiceNumber(tagihan),
      METODE_BAYAR: latestTx?.metodePembayaran || (tagihan as any).metodePembayaran || 'Cash / Kasir'
    });
    
    setWaSendingStatus(`Mengirim WA Konfirmasi Lunas ke ${tagihan.siswaNama} (${phone})...`);
    const res = await sendFonnteMessage(phone, message, fonnteToken);
    setWaSendingStatus(res.message);
    setTimeout(() => setWaSendingStatus(null), 4000);
  };

  const handleExportCSV = () => {
    const columns = [
      'ID Tagihan', 'Nama Siswa', 'Kelas', 'Tipe Keuangan', 'Nama Tagihan', 
      'Nominal Tagihan (Rp)', 'Total Terbayar (Rp)', 'Sisa Tunggakan (Rp)', 'Tanggal Pembayaran', 'Status'
    ];
    const rows = tagihanList.map(t => {
      const txs = transaksiList.filter(tx => tx.tagihanId === t.id);
      const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
      const tglBayar = t.tanggalBayar || (latestTx ? latestTx.tanggal : (t.status === 'Lunas' ? 'Lunas' : '-'));
      return [
        t.id, t.siswaNama, t.kelas, t.tipe.toUpperCase(), t.namaTagihan,
        t.nominal, t.terbayar, t.nominal - t.terbayar, tglBayar, t.status
      ];
    });
    downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportResult({
      success: true,
      message: '✅ File Rekapitulasi Keuangan berhasil diunduh dalam format CSV / Excel!'
    });
  };

  // Google Sheets Export
  const handleExportGoogleSheets = async () => {
    setExportingSheets(true);
    setExportResult(null);

    const columns = [
      'ID Tagihan', 'Nama Siswa', 'Kelas', 'Tipe Keuangan', 'Nama Tagihan', 
      'Nominal Tagihan (Rp)', 'Total Terbayar (Rp)', 'Sisa Tunggakan (Rp)', 'Tanggal Pembayaran', 'Status'
    ];
    const rows = tagihanList.map(t => {
      const txs = transaksiList.filter(tx => tx.tagihanId === t.id);
      const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
      const tglBayar = t.tanggalBayar || (latestTx ? latestTx.tanggal : (t.status === 'Lunas' ? 'Lunas' : '-'));
      return [
        t.id, t.siswaNama, t.kelas, t.tipe.toUpperCase(), t.namaTagihan,
        t.nominal, t.terbayar, t.nominal - t.terbayar, tglBayar, t.status
      ];
    });

    try {
      const res = await fetch('/api/export-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: userGoogleToken,
          title: `Laporan Keuangan Sekolah - ${new Date().toLocaleDateString('id-ID')}`,
          sheetName: 'Rekap Keuangan SPP UKT',
          columns,
          rows
        })
      });
      const data = await res.json();
      
      const isRealUrl = data.success && data.spreadsheetUrl && !data.spreadsheetUrl.includes('demo_') && data.spreadsheetUrl.startsWith('http');

      if (isRealUrl) {
        setExportResult({ success: true, url: data.spreadsheetUrl, message: 'Berhasil membuat Google Spreadsheet di Drive Anda!' });
      } else {
        // Fallback: download CSV directly so user gets a valid file immediately
        downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
        setExportResult({
          success: true,
          message: 'Laporan Keuangan berhasil diunduh secara langsung sebagai file CSV / Excel!'
        });
      }
    } catch (err) {
      downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
      setExportResult({ success: true, message: 'Laporan Keuangan berhasil diunduh secara langsung sebagai file CSV / Excel.' });
    } finally {
      setExportingSheets(false);
    }
  };

  // Filtered Tarif List
  const filteredTarifList = useMemo(() => {
    if (feeCategoryFilter === 'semua') return tarifList;
    return tarifList.filter(t => t.tipe === feeCategoryFilter);
  }, [tarifList, feeCategoryFilter]);

  return (
    <div className="space-y-6 text-slate-100">

      {/* TOP HEADER & NAVIGATION SUBTABS */}
      <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {schoolSettings?.logoUrl ? (
            <div className="w-12 h-12 rounded-xl p-1 bg-white/10 border border-slate-700 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              <img 
                src={schoolSettings.logoUrl} 
                alt="Logo Sekolah" 
                className="w-full h-full object-contain" 
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">
                {schoolSettings?.namaSekolah || 'Manajemen Keuangan Sekolah & Kasir'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                {schoolSettings?.npsn ? `NPSN: ${schoolSettings.npsn}` : 'Keuangan'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{schoolSettings?.namaSekolah ? `Dashboard Keuangan • ${schoolSettings.namaSekolah}` : 'Modul transaksi kasir SPP, iuran UKT/Uang Masuk, setting tarif biaya, kwitansi.'}</span>
              {schoolSettings?.akreditasi && <span>• Akreditasi {schoolSettings.akreditasi}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFonnteConfigModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition-colors"
            title="Pengaturan Gateway WA Fonnte"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PEMBAYARAN SISWA (MAIN KASIR SPP & BEBAS) */}
      {activeTab === 'pembayaran' && (
        <div className="space-y-6">

          {/* 1. FILTER DATA PEMBAYARAN SISWA */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
              Filter Data Pembayaran Siswa
            </h3>

            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-4 pt-1">
              <div className="w-full md:w-48 space-y-1">
                <label className="text-xs font-bold text-slate-300">Tahun Ajaran</label>
                <select
                  value={tahunAjaran}
                  onChange={e => setTahunAjaran(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>

              <div className="w-full md:w-40 space-y-1">
                <label className="text-xs font-bold text-slate-300">Semester</label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div className="flex-1 w-full space-y-1 relative">
                <label className="text-xs font-bold text-slate-300">Cari Siswa (Nama / NIS / NISN)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan Nama, NIS, atau NISN (contoh: Ahmad / 20261001)..."
                      value={searchKey}
                      onChange={e => {
                        setSearchKey(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                      className="w-full bg-[#181818] border border-slate-700/80 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#181818] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                        {searchSuggestions.map(s => (
                          <div
                            key={s.id}
                            onMouseDown={() => {
                              setSearchKey(s.nama);
                              setAppliedSearch(s.nama);
                              setShowSuggestions(false);
                            }}
                            className="px-3.5 py-2.5 hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <p className="text-white font-bold text-xs">{s.nama}</p>
                              <p className="text-[10px] text-slate-400">NIS: {s.nis} | NISN: {s.nisn || '-'}</p>
                            </div>
                            <span className="text-[10px] font-semibold bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-700/50">
                              Kelas {s.kelas}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 shrink-0"
                  >
                    Cari
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. INFORMASI SISWA */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Informasi Siswa
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!selectedSiswa}
                  onClick={() => {
                    if (!selectedSiswa) return;
                    const { tingkatKelas, rombel } = getStudentTingkatDanRombel(selectedSiswa);
                    setEditingSiswaData({ 
                      ...selectedSiswa,
                      tingkatKelas,
                      rombel: selectedSiswa.rombel || selectedSiswa.kelas || rombel,
                      kelas: selectedSiswa.kelas || rombel
                    });
                    setShowEditSiswaModal(true);
                  }}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md ${!selectedSiswa ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Siswa
                </button>

                <button
                  type="button"
                  disabled={!selectedSiswa}
                  onClick={() => {
                    if (!selectedSiswa) return;
                    const { tingkatKelas, rombel } = getStudentTingkatDanRombel(selectedSiswa);
                    setPrintReceiptData({
                      noNota: generateInvoiceNumber(),
                      tahunAjaran,
                      nis: selectedSiswa.nis,
                      nama: selectedSiswa.nama,
                      namaIbu: selectedSiswa.namaIbu || selectedSiswa.namaWali,
                      kelas: `${tingkatKelas} - ${rombel}`,
                      pembayaranTitle: `Rekap Seluruh Tagihan T.A ${tahunAjaran}`,
                      nominal: totalSisaBulanan + 650000,
                      dibayar: totalSisaBulanan + 650000,
                      kembalian: 0,
                      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
                      penerima: 'Bendahara Sekolah'
                    });
                    setShowPrintModal(true);
                  }}
                  className={`px-4 py-1.5 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md ${!selectedSiswa ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'}`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Semua Tagihan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Left Student Attributes Table */}
              <div className="md:col-span-3 space-y-2.5 text-xs text-slate-300">
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">NISN</span>
                  <span className="col-span-8 font-mono font-bold text-emerald-400">: {selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Nama Siswa</span>
                  <span className="col-span-8 font-bold text-white text-sm">: {selectedSiswa ? selectedSiswa.nama : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">No. WhatsApp</span>
                  <span className="col-span-8 font-mono font-bold text-emerald-400">: {selectedSiswa ? (selectedSiswa.teleponWali || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Nama Ibu Kandung</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Kelas</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? getStudentTingkatDanRombel(selectedSiswa).tingkatKelas : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1">
                  <span className="col-span-4 font-semibold text-slate-400">Rombel</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? getStudentTingkatDanRombel(selectedSiswa).rombel : '-'}</span>
                </div>
              </div>

              {/* Right Student Photo Avatar */}
              <div className="flex justify-center md:justify-end">
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-sky-500/10 p-1 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                  {selectedSiswa?.fotoUrl ? (
                    <img 
                      src={selectedSiswa.fotoUrl} 
                      alt={selectedSiswa.nama} 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : selectedSiswa?.nama ? (
                    <div className="w-full h-full rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-extrabold text-3xl">
                      {selectedSiswa.nama.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                      <User className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RINGKASAN TOTAL PEMBAYARAN (SPP, UKT, EKSKUL) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#121212] border border-slate-800/80 p-4 rounded-2xl shadow-lg">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total SPP Terbayar</span>
              <span className="text-sm font-mono font-extrabold text-emerald-400 mt-1">Rp {totalSppPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">{selectedSiswa ? Object.keys(paidMonthsState).length : 0} bulan lunas</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total UKT / Masuk</span>
              <span className="text-sm font-mono font-extrabold text-amber-400 mt-1">Rp {totalUktPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Uang gedung & atribut</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Ekskul / Kegiatan</span>
              <span className="text-sm font-mono font-extrabold text-sky-400 mt-1">Rp {totalEkskulPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Iuran ekstrakurikuler</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-300">Total Keseluruhan</span>
              <span className="text-base font-mono font-black text-emerald-400 mt-1">Rp {totalSemuaPembayaran.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-emerald-400/70 mt-1">Akumulasi tuntas</span>
            </div>
          </div>
               {/* 3. THREE PANELS GRID: TRANSAKSI TERAKHIR | PEMBAYARAN | CETAK BUKTI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* PANEL B: TAGIHAN (PROCESSOR CALCULATOR) */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3.5">
                <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold text-lg">$</span>
                    Tagihan
                  </span>
                  {selectedSiswa && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 font-medium truncate max-w-[150px]">
                      {selectedSiswa.nama}
                    </span>
                  )}
                </h4>

                {!selectedSiswa && (
                  <div className="bg-amber-950/60 border border-amber-600/50 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Silakan cari dan pilih <strong>Nama Siswa</strong> terlebih dahulu pada form di atas untuk menginput tagihan.</span>
                  </div>
                )}

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Tagihan</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['spp', 'ukt', 'ekskul'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQuickPayType(t as any)}
                          className={`py-1.5 rounded-lg font-bold border transition-all ${
                            quickPayType === t 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-600/20' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {quickPayType === 'spp' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Bulan SPP</label>
                      <div className="grid grid-cols-4 gap-1">
                        {allMonths.map((m) => {
                          const isPaid = paidMonthsState[m];
                          const isSelected = selectedMonths.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              disabled={!!isPaid}
                              onClick={() => toggleMonthSelection(m)}
                              className={`py-1 rounded text-[9px] font-bold border transition-all ${
                                isPaid 
                                  ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500/50 cursor-not-allowed' 
                                  : isSelected
                                    ? 'bg-sky-600 border-sky-500 text-white'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                              title={isPaid ? `Lunas: ${isPaid}` : m}
                            >
                              {m.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Item {quickPayType.toUpperCase()}</label>
                      <select
                        value={quickPayItemId}
                        onChange={(e) => setQuickPayItemId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      >
                        <option value="">-- Pilih Item --</option>
                        {(quickPayType === 'ukt' ? uktTarifs : ekskulTarifs).map(t => (
                          <option key={t.id} value={t.id}>{t.namaBiaya} - Rp {t.nominal.toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                        <input
                          type="number"
                          value={inputTotal || ''}
                          onChange={(e) => setInputTotal(Number(e.target.value))}
                          readOnly={quickPayType === 'spp'}
                          className={`w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold ${quickPayType === 'spp' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Jumlah Bayar</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">Rp</span>
                        <input
                          type="number"
                          value={inputDibayar || ''}
                          onChange={(e) => setInputDibayar(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-emerald-900/30 text-emerald-400 rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Pembayaran</label>
                    <select
                      value={selectedMetodePembayaran}
                      onChange={(e) => setSelectedMetodePembayaran(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Cash / Kasir">Cash / Kasir (Tunai)</option>
                      <option value="Transfer Bank - BRI">Transfer Bank - BRI</option>
                      <option value="Transfer Bank - BNI">Transfer Bank - BNI</option>
                      <option value="Transfer Bank - Mandiri">Transfer Bank - Mandiri</option>
                      <option value="Transfer Bank - BCA">Transfer Bank - BCA</option>
                      <option value="QRIS / E-Wallet">QRIS / E-Wallet (OVO/Dana/Gopay)</option>
                      <option value="Tabungan Siswa">Tabungan Siswa</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Kembalian</span>
                      <span className="text-sm font-mono font-black text-amber-400">Rp {kembalian.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={!selectedSiswa || (quickPayType === 'spp' && selectedMonths.length === 0) || (quickPayType !== 'spp' && !quickPayItemId && inputTotal <= 0)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Proses
                    </button>
                  </div>
                </div>
              </div>

              {/* PANEL C: CETAK BUKTI PEMBAYARAN */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    Cetak Bukti Pembayaran
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                    Gunakan fitur ini untuk mencetak ulang kwitansi pembayaran terakhir atau slip tagihan sementara untuk siswa yang bersangkutan.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={!selectedSiswa || studentTransactions.length === 0}
                    onClick={() => {
                      if (studentTransactions.length > 0) {
                        handleReprintTransaction(studentTransactions[0]);
                      }
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    Cetak Kwitansi Terakhir
                  </button>
                  <button
                    type="button"
                    disabled={!selectedSiswa}
                    onClick={() => {
                      // Slip Tagihan Logic
                      if (!selectedSiswa) return;
                      setPrintReceiptData({
                        noNota: generateInvoiceNumber(),
                        tahunAjaran,
                        nis: selectedSiswa.nis,
                        nama: selectedSiswa.nama,
                        namaIbu: selectedSiswa.namaIbu || selectedSiswa.namaWali,
                        kelas: selectedSiswa.kelas,
                        pembayaranTitle: `Informasi Tagihan Sisa T.A ${tahunAjaran}`,
                        nominal: totalSisaBulanan,
                        dibayar: 0,
                        kembalian: 0,
                        tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
                        penerima: 'Bagian Keuangan'
                      });
                      setShowPrintModal(true);
                    }}
                    className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Cetak Slip Tagihan
                  </button>
                </div>
              </div>

              {/* PANEL A: TRANSAKSI TERAKHIR (Landscape, Wide) */}
              <div className="md:col-span-3 bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-lg space-y-3">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Semua Transaksi & Riwayat Tagihan Siswa
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#181818] text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-2 py-2">Nama Tagihan / Pembayaran</th>
                        <th className="px-2 py-2">Total Tagihan</th>
                        <th className="px-2 py-2">Terbayar</th>
                        <th className="px-2 py-2">Tanggal Tagihan</th>
                        <th className="px-2 py-2">Tanggal Bayar / Realisasi</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-1 py-2 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {studentBills.map((t, idx) => {
                        const isLunas = t.status === 'Lunas';
                        const isDicicil = t.status === 'Dicicil';
                        const isBelumLunas = t.status === 'Belum Lunas';

                        return (
                          <tr key={t.id} className="hover:bg-slate-900/50">
                            <td className="px-2 py-2.5 font-semibold text-slate-200">
                              {t.namaTagihan}
                              {idx === 0 && (
                                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-bold">
                                  Terbaru
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 font-mono font-bold text-slate-300 whitespace-nowrap">
                              Rp {t.nominal.toLocaleString('id-ID')}
                            </td>
                            <td className="px-2 py-2.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                              Rp {(t.terbayar || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-2 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">
                              {formatDate(t.jatuhTempo)}
                            </td>
                            <td className="px-2 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">
                              {t.tanggalBayar ? formatDate(t.tanggalBayar) : '-'}
                            </td>
                            <td className="px-2 py-2.5 whitespace-nowrap">
                              {isLunas && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded-full font-bold">
                                  Lunas
                                </span>
                              )}
                              {isDicicil && (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] rounded-full font-bold">
                                  Dicicil
                                </span>
                              )}
                              {isBelumLunas && (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] rounded-full font-bold">
                                  Belum Lunas
                                </span>
                              )}
                            </td>
                            <td className="px-1 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={t.terbayar === 0 && !isLunas}
                                  onClick={() => {
                                    const matchingTx = studentTransactions.find(tx => 
                                      (tx.itemId && tx.itemId === t.id) || 
                                      (tx.pembayaran && t.namaTagihan && tx.pembayaran === t.namaTagihan)
                                    );
                                    if (matchingTx) {
                                      handleReprintTransaction(matchingTx);
                                    } else {
                                      handleReprintTransaction({
                                        id: t.id,
                                        pembayaran: t.namaTagihan,
                                        tagihan: t.terbayar || t.nominal,
                                        tanggal: t.tanggalBayar || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                      });
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-emerald-400 rounded transition-colors"
                                  title="Cetak ulang kwitansi"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTargetTagihan(t)}
                                  className="p-1 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 rounded transition-colors"
                                  title="Hapus atau batalkan pembayaran"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {studentBills.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500 text-[10px]">
                            Belum ada riwayat tagihan atau transaksi untuk siswa ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        )}

      {activeTab === 'pengaturan_biaya' && (
        <div className="space-y-6">

          {/* Action Header Card */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Pengaturan Tarif Biaya Sekolah (UKT, SPP & Ekskul)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Atur standar tarif nominal SPP bulanan per tingkat kelas, biaya UKT / Uang Masuk, serta iuran ekstrakurikuler & kegiatan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Generate Tagihan Otomatis
              </button>
              <button
                onClick={handleOpenAddTarif}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                Tambah Tarif Baru
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFeeCategoryFilter('semua')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'semua'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Semua Biaya ({tarifList.length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('spp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'spp'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              SPP Bulanan ({tarifList.filter(t => t.tipe === 'spp').length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('ukt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'ukt'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              UKT / Uang Masuk ({tarifList.filter(t => t.tipe === 'ukt').length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('ekskul')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'ekskul'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Ekskul & Kegiatan ({tarifList.filter(t => t.tipe === 'ekskul').length})
            </button>
          </div>

          {/* Tarif Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Rata-Rata SPP Bulanan</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                Rp {
                  (
                    tarifList
                      .filter(t => t.tipe === 'spp')
                      .reduce((acc, curr) => acc + curr.nominal, 0) /
                    (tarifList.filter(t => t.tipe === 'spp').length || 1)
                  ).toLocaleString('id-ID')
                } <span className="text-xs text-slate-500 font-normal">/ bln</span>
              </div>
              <p className="text-[11px] text-slate-500">Standar pembiayaan operasional pembelajaran bulanan siswa.</p>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Total Estimasi Paket UKT (Uang Masuk)</span>
                <GraduationCap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                Rp {
                  tarifList
                    .filter(t => t.tipe === 'ukt')
                    .reduce((acc, curr) => acc + curr.nominal, 0)
                    .toLocaleString('id-ID')
                }
              </div>
              <p className="text-[11px] text-slate-500">Gedung, Seragam, & Administrasi Daftar Ulang Siswa Baru.</p>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Total Komponen Iuran Ekskul</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {tarifList.filter(t => t.tipe === 'ekskul').length} Jenis Ekskul
              </div>
              <p className="text-[11px] text-slate-500">Pramuka, Futsal, IT Coding, Basket, & Kemah Kepemimpinan.</p>
            </div>
          </div>

          {/* Tariff Data Table */}
          <div className="bg-[#121212] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="p-4 bg-[#181818] border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Daftar Parameter Tarif Keuangan ({filteredTarifList.length})
              </h4>
              <span className="text-[11px] text-slate-400">T.A {schoolSettings?.tahunAjaran || '2026/2027'} • Kurikulum Merdeka</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#151515] text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nama Biaya & Kategori</th>
                    <th className="px-4 py-3">Tingkat / Target</th>
                    <th className="px-4 py-3">Periode Tagihan</th>
                    <th className="px-4 py-3">Nominal Tarif (Rp)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTarifList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{item.namaBiaya}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.tipe === 'spp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            item.tipe === 'ukt' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {item.tipe === 'spp' ? 'SPP Bulanan' : item.tipe === 'ukt' ? 'UKT / Uang Masuk' : 'Ekskul / Kegiatan'}
                          </span>
                          {item.ekskulId && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold uppercase">
                              {ekskulList.find(e => e.id === item.ekskulId)?.namaEkskul || 'Ekskul'}
                            </span>
                          )}
                          {item.keterangan && (
                            <span className="text-[11px] text-slate-500 italic truncate max-w-xs">{item.keterangan}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-200">
                        {item.tingkatKelas}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 font-medium">
                        {item.periode}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-400 text-sm">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleTarifStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditTarif(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Edit Tarif"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTarif(item.id)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTarifList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                        Belum ada parameter tarif biaya untuk kategori ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
    )}

      {/* SUBTAB 3: REKAP TAGIHAN & GOOGLE SHEETS / FONNTE WA */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">

          {/* Fonnte Notification Banner */}
          {waSendingStatus && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-lg">
              <Send className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{waSendingStatus}</span>
            </div>
          )}

          {/* Export Result Banner */}
          {exportResult && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex flex-wrap items-center justify-between gap-3 ${
              exportResult.success ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800' : 'bg-rose-950/90 text-rose-200 border-rose-800'
            }`}>
              <span>{exportResult.message}</span>
              <div className="flex items-center gap-2">
                {exportResult.url && !exportResult.url.includes('demo_') && (
                  <a href={exportResult.url} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md">
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Drive
                  </a>
                )}
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh CSV / Excel
                </button>
              </div>
            </div>
          )}

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md sm:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total Nominal Tagihan</span>
              <div className="text-2xl font-extrabold text-white mt-2">
                Rp {allEffectiveTagihanList.reduce((a, b) => a + b.nominal, 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-emerald-400">Total SPP</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-2">
                Rp {totalSppPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-amber-400">Total UKT</span>
              <div className="text-xl font-extrabold text-amber-400 mt-2">
                Rp {totalUktPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-purple-400">Total Ekskul</span>
              <div className="text-xl font-extrabold text-purple-400 mt-2">
                Rp {totalEkskulPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-white">Total Akumulasi</span>
              <div className="text-xl font-extrabold text-white mt-2">
                Rp {(totalSppPaid + totalUktPaid + totalEkskulPaid).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-rose-400">Total Sisa</span>
              <div className="text-xl font-extrabold text-rose-400 mt-2">
                Rp {allEffectiveTagihanList.reduce((a, b) => a + (b.nominal - (b.terbayar || 0)), 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Action Header & Tagihan Filter Control */}
          <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Daftar Tagihan Seluruh Siswa</h3>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[11px] font-mono font-bold">
                  {filteredGlobalTagihanList.length} Tagihan
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-slate-700 shadow-md cursor-pointer"
                  title="Unduh File CSV / Excel Langsung"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Unduh CSV / Excel
                </button>
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-rose-500/30 shadow-md cursor-pointer"
                  title="Hapus Semua Data Tagihan"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Filter controls bar for Tipe, Status, & Nama Tagihan */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Tipe Tagihan Selector Buttons */}
              <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" /> Tipe:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('all');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'all'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('spp');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'spp'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  SPP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('ukt');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'ukt'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  UKT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('ekskul');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'ekskul'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Ekskul
                </button>
              </div>

              {/* Pilih Kelas Dropdown */}
              <div className="md:col-span-4">

                <select
                  value={filterKelas}
                  onChange={e => setFilterKelas(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-emerald-300 font-bold rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">-- Semua Kelas / Rombel --</option>
                  {availableKelasList.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="md:col-span-2 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTagihanQuery}
                  onChange={e => setSearchTagihanQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-[#181818] border border-slate-700/80 text-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Global Tagihan Table */}
          <div className="bg-[#121212] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Siswa & Kelas</th>
                    <th className="px-4 py-3">No. Invoice</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Nama Tagihan</th>
                    <th className="px-4 py-3">Nominal Tagihan</th>
                    <th className="px-4 py-3">Terbayar</th>
                    <th className="px-4 py-3">Sisa</th>
                    <th className="px-4 py-3">Tgl Tagihan</th>
                    <th className="px-4 py-3">Tgl Bayar</th>
                    <th className="px-4 py-3">Metode Pembayaran</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                    <th className="px-4 py-3 text-center">Kirim Notif WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGlobalTagihanList.length > 0 ? (
                    filteredGlobalTagihanList.map(t => {
                      const isSynthesized = t.id && String(t.id).startsWith('syn-');
                      const txsForTagihan = transaksiList.filter(tx => 
                        tx.tagihanId === t.id || 
                        (isSynthesized && tx && tx.siswaNama && t && t.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === (t.siswaNama || '').trim().toLowerCase() && (tx.tipe || '').toLowerCase() === (t.tipe || '').toLowerCase())
                      );
                      const totalTerbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + tx.nominal, 0);
                      
                      let totalTerbayar = Math.max(t.terbayar || 0, totalTerbayarFromTx);
                      if (t.status === 'Lunas' && totalTerbayar < t.nominal) {
                        totalTerbayar = t.nominal;
                      }

                      const sisa = Math.max(0, t.nominal - totalTerbayar);
                      const isLunas = t.status === 'Lunas' || (totalTerbayar >= t.nominal && t.nominal > 0);
                      const isDicicil = !isLunas && totalTerbayar > 0;
                      const latestTx = txsForTagihan.length > 0 ? txsForTagihan[txsForTagihan.length - 1] : null;
                      const effectiveTanggalBayar = t.tanggalBayar || (latestTx ? latestTx.tanggal : (isLunas ? '2026-08-09' : ''));
                      
                      return (
                        <tr key={t.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{t.siswaNama}</div>
                            <div className="text-[10px] text-slate-400">{t.kelas}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-[10px] bg-slate-900/60 border border-slate-800 text-slate-300 px-2 py-1 rounded-md">
                              {getStableInvoiceNumber(t)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold uppercase text-slate-400">{t.tipe}</td>
                          <td className="px-4 py-3">{t.namaTagihan}</td>
                          <td className="px-4 py-3 font-mono font-bold text-white">Rp {t.nominal.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">Rp {totalTerbayar.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 font-mono text-amber-400">Rp {sisa.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {effectiveTanggalBayar ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTagihan(t);
                                  setEditTagihanForm({
                                    namaTagihan: t.namaTagihan,
                                    nominal: t.nominal,
                                    terbayar: totalTerbayar,
                                    jatuhTempo: t.jatuhTempo || '',
                                    tanggalBayar: effectiveTanggalBayar,
                                    status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                    metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                  });
                                  setShowEditTagihanModal(true);
                                }}
                                className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-100 font-mono text-[11px] font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 px-2.5 py-1 rounded-lg border border-emerald-700/60 transition-all cursor-pointer group shadow-sm"
                                title="Klik untuk ubah Tanggal Tagihan"
                              >
                                <Calendar className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span>{effectiveTanggalBayar}</span>
                                <Edit3 className="w-2.5 h-2.5 text-emerald-400/70 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTagihan(t);
                                  setEditTagihanForm({
                                    namaTagihan: t.namaTagihan,
                                    nominal: t.nominal,
                                    terbayar: totalTerbayar,
                                    jatuhTempo: t.jatuhTempo || '',
                                    tanggalBayar: new Date().toISOString().slice(0, 10),
                                    status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                    metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                  });
                                  setShowEditTagihanModal(true);
                                }}
                                className="text-slate-500 hover:text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded hover:bg-slate-800/60 transition-all flex items-center gap-1"
                                title="Set Tanggal Tagihan"
                              >
                                <span>-</span>
                                <span className="text-[9px] text-slate-400 underline decoration-dotted">+ Set Tgl</span>
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isLunas || isDicicil ? (
                              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {latestTx ? latestTx.tanggal : (t.tanggalBayar || '-')}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isLunas || isDicicil ? (
                              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-1 rounded-md inline-block border border-slate-700/60">
                                {latestTx?.metodePembayaran || t.metodePembayaran || 'Cash / Kasir'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1.5 ${
                              isLunas ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                              isDicicil ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isLunas ? 'bg-emerald-400' : isDicicil ? 'bg-sky-400' : 'bg-rose-400'}`}></span>
                              {isLunas ? 'Lunas' : (isDicicil ? 'Cicil' : 'Belum Lunas')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center relative z-50">
                              <button
                               type="button"
                               onClick={() => {
                                 setEditingTagihan(t);
                                 setEditTagihanForm({
                                   namaTagihan: t.namaTagihan,
                                   nominal: t.nominal,
                                   terbayar: totalTerbayar,
                                   jatuhTempo: t.jatuhTempo || '',
                                   tanggalBayar: effectiveTanggalBayar,
                                   status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                   metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                 });
                                 setShowEditTagihanModal(true);
                               }}
                               className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all mr-1"
                               title="Edit Tagihan"
                             >
                               <Edit3 className="w-4 h-4" />
                             </button>
                             <button
                               type="button"
                               onClick={() => setDeleteTargetTagihan(t)}
                               className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all"
                               title="Hapus Tagihan"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </td>
                          <td className="px-4 py-3 text-center">
                            {!isLunas ? (
                              <button
                                type="button"
                                onClick={() => handleSendWaReminder(t)}
                                className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                title="Kirim WhatsApp pengingat untuk segera melakukan pembayaran"
                              >
                                <Send className="w-3 h-3 text-amber-400" /> WA Tagihan
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendWaConfirmation(t)}
                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                title="Kirim WhatsApp konfirmasi bahwa pembayaran telah dilakukan & lunas"
                              >
                                <CheckCheck className="w-3 h-3 text-emerald-400" /> WA Lunas
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    siswaList.map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{s.nama}</div>
                          <div className="text-[10px] text-slate-400">{s.kelas}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold uppercase text-slate-400">-</td>
                        <td className="px-4 py-3 italic text-slate-500">Belum ada tagihan</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Belum Dibuat
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-center">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 4: EDIT REDAKSI TEMPLATE NOTIFIKASI WA */}
      {activeTab === 'redaksi' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/20 via-indigo-950/10 to-transparent border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-left">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Edit Redaksi Notifikasi WA
              </h2>
              <p className="text-xs text-slate-400">
                Kustomisasi susunan kalimat pengingat tagihan dan konfirmasi pelunasan pembayaran yang dikirim ke wali murid.
              </p>
            </div>
            
            {saveSuccessMsg && (
              <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold shrink-0 shadow-lg border-l-4 border-l-emerald-400">
                ✓ {saveSuccessMsg}
              </div>
            )}
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex border-b border-slate-800 pb-px gap-2">
            <button
              onClick={() => setActiveRedaksiTab('reminder')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeRedaksiTab === 'reminder'
                  ? 'border-indigo-500 text-indigo-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifikasi Tagihan (Pengingat)
            </button>
            <button
              onClick={() => setActiveRedaksiTab('receipt')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeRedaksiTab === 'receipt'
                  ? 'border-emerald-500 text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi Pelunasan Pembayaran
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Editor Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#121212]/90 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {activeRedaksiTab === 'reminder' ? 'Template Teks Tagihan' : 'Template Teks Pelunasan'}
                  </span>
                  <button
                    onClick={handleResetTemplate}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Kembalikan susunan kata ke setelan default"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset ke Default
                  </button>
                </div>

                {/* Variable Pills Scrollbox */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Klik variabel di bawah untuk menyisipkan ke kursor:
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#181818] rounded-xl border border-slate-800">
                    {Object.keys({
                      NAMA_SISWA: "Muhammad Rafli",
                      KELAS: "VIII-B",
                      NAMA_TAGIHAN: "SPP Juli 2026",
                      NOMINAL_TAGIHAN: "Rp 350.000",
                      SISA_TAGIHAN: "Rp 350.000",
                      NOMINAL_BAYAR: "Rp 350.000",
                      TANGGAL_BAYAR: "13 Agustus 2026",
                      TAGIHAN: "SPP Juli 2026",
                      NOMINAL: "350.000",
                      JATUH_TEMPO: "13 Agustus 2026",
                      STATUS: "BELUM LUNAS",
                      NO_INVOICE: "0001/C-ALFAKHIR/VIII/2026",
                      NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Islam Modern Al-Fakhir"
                    }).map(vKey => {
                      if (activeRedaksiTab === 'reminder' && vKey === 'NOMINAL_BAYAR') return null;
                      if (activeRedaksiTab === 'receipt' && vKey === 'SISA_TAGIHAN') return null;
                      if (activeRedaksiTab === 'receipt' && vKey === 'JATUH_TEMPO') return null;

                      return (
                        <button
                          key={vKey}
                          onClick={() => insertPlaceholder(`{${vKey}}`)}
                          className="px-2 py-1 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-500/20 rounded-lg text-[9px] font-mono font-extrabold text-indigo-300 transition-all cursor-pointer"
                        >
                          {`{${vKey}}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div>
                  <textarea
                    id={activeRedaksiTab === 'reminder' ? 'template_reminder_input' : 'template_receipt_input'}
                    value={activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt}
                    onChange={e => {
                      if (activeRedaksiTab === 'reminder') {
                        setLocalTemplateReminder(e.target.value);
                      } else {
                        setLocalTemplateReceipt(e.target.value);
                      }
                    }}
                    rows={12}
                    className="w-full bg-[#181818] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Masukkan redaksi notifikasi di sini..."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={handleSaveTemplates}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg cursor-pointer ${
                      activeRedaksiTab === 'reminder'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Simpan Perubahan Redaksi
                  </button>
                </div>
              </div>

              {/* Informative Tips Footer */}
              <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 space-y-1.5 text-left">
                <span className="font-extrabold text-slate-200 block">💡 Tips Format WhatsApp:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Gunakan tanda bintang untuk menebalkan teks, contoh: <code className="text-slate-300 font-mono">*Teks Tebal*</code></li>
                  <li>Gunakan garis bawah untuk memiringkan teks, contoh: <code className="text-slate-300 font-mono">_Teks Miring_</code></li>
                  <li>Pastikan Anda tidak mengubah ejaan variabel di dalam kurung kurawal agar sistem dapat menggantinya dengan informasi riil siswa secara otomatis.</li>
                </ul>
              </div>
            </div>

            {/* Smartphone Mockup Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 mb-3 block self-start">
                📱 Live Preview Tampilan Orang Tua / Wali:
              </span>

              {/* Phone Container */}
              <div className="w-full max-w-[340px] bg-[#111] rounded-[36px] p-3 border-[6px] border-slate-800 shadow-2xl relative overflow-hidden aspect-[9/18]">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20"></div>

                {/* WhatsApp Screen */}
                <div className="w-full h-full bg-[#efeae2] rounded-[26px] flex flex-col relative overflow-hidden">
                  {/* WhatsApp Status Bar Header */}
                  <div className="bg-[#075e54] text-white pt-5 pb-2.5 px-4 flex items-center gap-3 shadow-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200/20 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                      🏫
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[12px] leading-tight text-white">
                        {schoolSettings?.namaSekolah || 'Keuangan Sekolah'}
                      </h4>
                      <span className="text-[9px] text-emerald-300 font-semibold block leading-none">Online</span>
                    </div>
                    <div className="flex items-center gap-2.5 opacity-80">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Message Thread Body */}
                  <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-3">
                    {/* Timestamp */}
                    <div className="self-center bg-[#d6ebf1] text-sky-950 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                      HARI INI
                    </div>

                    {/* Chat Bubble */}
                    <div className="max-w-[88%] bg-[#e2f7cb] text-slate-800 rounded-lg p-2.5 shadow-md relative border border-emerald-200/30 self-start ml-2 rounded-tl-none text-left">
                      {/* Triangle tail mockup */}
                      <div className="absolute -left-1.5 top-0 w-0 h-0 border-t-[8px] border-t-[#e2f7cb] border-l-[8px] border-l-transparent"></div>
                      
                      {/* Formatted Text Content */}
                      <div 
                        className="text-[11px] leading-relaxed whitespace-pre-wrap break-words text-slate-800"
                        dangerouslySetInnerHTML={{ 
                          __html: formatWhatsAppMarkdown(
                            parseWaTemplate(
                              activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt,
                              {
                                NAMA_SISWA: "Muhammad Rafli",
                                KELAS: "VIII-B",
                                NAMA_TAGIHAN: "SPP Juli 2026",
                                NOMINAL_TAGIHAN: "Rp 350.000",
                                SISA_TAGIHAN: "Rp 350.000",
                                NOMINAL_BAYAR: "Rp 350.000",
                                TANGGAL_BAYAR: "13 Agustus 2026",
                                NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Islam Modern Al-Fakhir",
                                TAGIHAN: "SPP Juli 2026",
                                NOMINAL: "350.000",
                                JATUH_TEMPO: "13 Agustus 2026",
                                STATUS: "BELUM LUNAS",
                                NO_INVOICE: "0001/C-ALFAKHIR/VIII/2026",
                                METODE_BAYAR: "Cash / Kasir"
                              }
                            )
                          ) 
                        }}
                      />

                      {/* Bubble Info Footer */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-semibold select-none">
                        <span>10:30</span>
                        <CheckCheck className="w-3 h-3 text-sky-500" />
                      </div>
                    </div>
                  </div>

                  {/* Input Mockup Footer */}
                  <div className="p-2.5 bg-slate-100 flex items-center gap-2 border-t border-slate-200">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-slate-400 text-left border border-slate-200/80">
                      Ketik pesan...
                    </div>
                    <div className="w-7 h-7 bg-[#075e54] rounded-full flex items-center justify-center shrink-0">
                      <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {showPrintModal && printReceiptData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans border border-slate-300">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" /> Struk Kwitansi Pembayaran Resmi
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Envelope Area */}
            <div id="printable-receipt" className="space-y-4 p-2">
              {/* School Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                {schoolSettings?.logoUrl && (
                  <div className="flex justify-center mb-1">
                    <img src={schoolSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                  </div>
                )}
                <h2 className="font-extrabold text-base tracking-wide uppercase text-slate-900">
                  {schoolSettings?.namaSekolah || 'SEKOLAH MENENGAH ATAS WORKSPACE 2026'}
                </h2>
                <p className="text-[10px] text-slate-600">
                  NPSN: {schoolSettings?.npsn || '-'} • Akreditasi: {schoolSettings?.akreditasi || '-'} • {schoolSettings?.alamat || 'Jl. Pendidikan No. 45'} • Telp: {schoolSettings?.telepon || '-'}
                </p>
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest pt-1">
                  KWITANSI BUKTI PEMBAYARAN RESMI
                </div>
              </div>

              {/* Receipt Details */}
              <div className="text-xs space-y-1.5 py-1 text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">No. Nota / Kwitansi</span>
                  <span className="font-mono font-bold text-slate-900">{printReceiptData.noNota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tahun Ajaran</span>
                  <span className="font-bold">{printReceiptData.tahunAjaran}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NIS & Nama Siswa</span>
                  <span className="font-bold text-slate-900">{printReceiptData.nis} - {printReceiptData.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Kelas / Nama Ibu</span>
                  <span className="font-bold">{printReceiptData.kelas} / {printReceiptData.namaIbu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tanggal Transaksi</span>
                  <span className="font-bold">{printReceiptData.tanggal}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden my-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <tr>
                      <th className="p-2">Uraian Pembayaran</th>
                      <th className="p-2 text-right w-32">Jumlah (Rp)</th>
                      <th className="p-2 text-center w-10 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {receiptItems.map(item => (
                      <tr key={item.id}>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.uraian}
                            onChange={e => handleUpdateReceiptItem(item.id, 'uraian', e.target.value)}
                            placeholder="Ketik uraian rincian pembayaran..."
                            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none transition-all print:hidden"
                          />
                          <span className="hidden print:inline font-semibold text-slate-900 px-1">
                            {item.uraian || '-'}
                          </span>
                        </td>
                        <td className="p-1.5 text-right">
                          <input
                            type="number"
                            value={item.jumlah || ''}
                            onChange={e => handleUpdateReceiptItem(item.id, 'jumlah', e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 text-right focus:outline-none transition-all print:hidden"
                          />
                          <span className="hidden print:inline font-mono font-bold text-slate-900 px-1">
                            Rp {(Number(item.jumlah) || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="p-1.5 text-center print:hidden">
                          {receiptItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReceiptItem(item.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action: Tambah Uraian Pembayaran */}
              <div className="flex items-center justify-between print:hidden mb-2">
                <button
                  type="button"
                  onClick={handleAddReceiptItem}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  + Tambah Uraian Pembayaran
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  {receiptItems.length} Rincian Pembayaran
                </span>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-emerald-700 text-sm">Rp {totalReceiptNominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Jumlah Uang Diserahkan:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold print:inline hidden">
                      Rp {(printReceiptData.dibayar || 0).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-1 print:hidden">
                      <span className="font-mono font-bold text-slate-600">Rp</span>
                      <input
                        type="number"
                        value={printReceiptData.dibayar}
                        onChange={e => setPrintReceiptData({ ...printReceiptData, dibayar: Number(e.target.value) })}
                        className="w-28 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono font-bold text-right text-xs focus:outline-none focus:border-emerald-600 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  <span>Uang Kembalian:</span>
                  <span className="font-mono">Rp {receiptKembalian.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Signature block */}
              <div className="pt-4 flex justify-between text-[11px] text-slate-700 text-center">
                <div>
                  <p>Siswa / Penyetor,</p>
                  <div className="h-10"></div>
                  <p className="font-bold underline">({printReceiptData.nama})</p>
                </div>
                <div>
                  <p>Kasir Keuangan,</p>
                  <div className="h-10"></div>
                  <p className="font-bold underline">({printReceiptData.penerima === 'Bendahara Sekolah' ? (schoolSettings?.namaKasir || 'Bendahara Sekolah') : printReceiptData.penerima})</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 print:hidden flex-wrap">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleDownloadReceiptAsImage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                title="Download Kwitansi sebagai Gambar (PNG)"
              >
                <Download className="w-3.5 h-3.5" /> Download Gambar (PNG)
              </button>

              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                title="Download Kwitansi sebagai File HTML / PDF"
              >
                <FileText className="w-3.5 h-3.5" /> Download File (HTML)
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
    )}

      {/* FONNTE CONFIG MODAL */}
      {showFonnteConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Pengaturan Gateway Fonnte WhatsApp
              </h3>
              <button
                onClick={() => setShowFonnteConfigModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Fonnte API Token</label>
                <input
                  type="text"
                  value={fonnteToken}
                  onChange={e => setFonnteToken(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Masukkan token API Fonnte..."
                />
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>Kirimkan bukti transaksi pembayaran dan tagihan secara otomatis ke WhatsApp nomor orang tua siswa.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFonnteConfigModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
              >
                Simpan Token
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL TAMBAH / EDIT TARIF BIAYA */}
      {showTarifModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                {editingTarif ? 'Edit Tarif Biaya Keuangan' : 'Tambah Parameter Tarif Biaya Baru'}
              </h3>
              <button
                onClick={() => setShowTarifModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTarif} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Biaya / Tagihan *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: SPP Kelas 7, UKT Gedung, Seragam..."
                  value={tarifForm.namaBiaya}
                  onChange={e => setTarifForm({ ...tarifForm, namaBiaya: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Kategori Biaya</label>
                  <select
                    value={tarifForm.tipe}
                    onChange={e => setTarifForm({ ...tarifForm, tipe: e.target.value as TipeKeuangan })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="spp">SPP Bulanan</option>
                    <option value="ukt">UKT / Uang Masuk</option>
                    <option value="ekskul">Ekskul & Kegiatan</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Kelas / Tingkat</label>
                  <select
                    value={tarifForm.tingkatKelas}
                    onChange={e => setTarifForm({ ...tarifForm, tingkatKelas: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Kelas 7">Kelas 7 (Tingkat VII)</option>
                    <option value="Kelas 8">Kelas 8 (Tingkat VIII)</option>
                    <option value="Kelas 9">Kelas 9 (Tingkat IX)</option>
                    <option value="Kelas 10">Kelas 10 (Tingkat X)</option>
                    <option value="Kelas 11">Kelas 11 (Tingkat XI)</option>
                    <option value="Kelas 12">Kelas 12 (Tingkat XII)</option>
                    <option value="Peserta Ekskul">Peserta Ekskul</option>
                    <option value="Semua Tingkat">Semua Tingkat Kelas</option>
                  </select>
                </div>
              </div>

              {tarifForm.tipe === 'ekskul' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-slate-300 font-bold block mb-1">Pilih Ekstrakurikuler (Opsional)</label>
                  <select
                    value={tarifForm.ekskulId}
                    onChange={e => setTarifForm({ ...tarifForm, ekskulId: e.target.value })}
                    className="w-full bg-[#181818] border border-blue-500/50 text-blue-400 font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Semua Ekstrakurikuler --</option>
                    {ekskulList.map(eks => (
                      <option key={eks.id} value={eks.id}>
                        {eks.namaEkskul} ({eks.pembinaNama})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Pilih ekskul spesifik jika tarif ini hanya berlaku untuk ekskul tersebut.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nominal Tarif (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={tarifForm.nominal}
                    onChange={e => setTarifForm({ ...tarifForm, nominal: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-emerald-500/60 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Periode Pembayaran</label>
                  <select
                    value={tarifForm.periode}
                    onChange={e => setTarifForm({ ...tarifForm, periode: e.target.value as any })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Sekali Bayar (Uang Masuk / UKT)">Sekali Bayar (Uang Masuk / UKT)</option>
                    <option value="Per Semester">Per Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan komponen biaya..."
                  value={tarifForm.keterangan}
                  onChange={e => setTarifForm({ ...tarifForm, keterangan: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Status Keaktifan</label>
                <select
                  value={tarifForm.status}
                  onChange={e => setTarifForm({ ...tarifForm, status: e.target.value as any })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Aktif">Aktif (Berlaku)</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTarifModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GENERATE TAGIHAN OTOMATIS */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-400">
                <Sparkles className="w-4 h-4" />
                Generate Tagihan Otomatis
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-200 leading-relaxed italic">
                  Fitur ini akan membuat tagihan secara otomatis untuk seluruh siswa berdasarkan tarif biaya aktif yang sesuai dengan tingkat kelas mereka.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Bulan (Untuk SPP)</label>
                  <select
                    value={generateMonth}
                    onChange={e => setGenerateMonth(e.target.value)}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tahun</label>
                  <select
                    value={generateYear}
                    onChange={e => setGenerateYear(e.target.value)}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Kategori Tagihan yang Dibuat</label>
                <div className="flex flex-wrap gap-2">
                  {['spp', 'ukt', 'ekskul'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setGenerateTypes(prev => 
                          prev.includes(type as TipeKeuangan) 
                            ? prev.filter(t => t !== type)
                            : [...prev, type as TipeKeuangan]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        generateTypes.includes(type as TipeKeuangan)
                          ? 'bg-amber-500 border-amber-600 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerateTagihanMassal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  Generate Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT TAGIHAN */}
      {showEditTagihanModal && editingTagihan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                Edit Tagihan: {editingTagihan.namaTagihan}
              </h3>
              <button
                onClick={() => setShowEditTagihanModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  value={editTagihanForm.namaTagihan}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, namaTagihan: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={editTagihanForm.nominal}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, nominal: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Jatuh Tempo</label>
                <div className="relative w-full">
                  <input
                    type="date"
                    value={editTagihanForm.jatuhTempo}
                    onChange={e => setEditTagihanForm({ ...editTagihanForm, jatuhTempo: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs flex justify-between items-center group focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <span>
                      {editTagihanForm.jatuhTempo
                        ? editTagihanForm.jatuhTempo.split('-').reverse().join('/')
                        : <span className="text-slate-500">dd/mm/yyyy</span>}
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Status Pembayaran</label>
                <select
                  value={editTagihanForm.status}
                  onChange={e => {
                    const newStatus = e.target.value as 'Lunas' | 'Belum Lunas' | 'Dicicil';
                    setEditTagihanForm({ 
                      ...editTagihanForm, 
                      status: newStatus,
                      tanggalBayar: newStatus === 'Lunas' && !editTagihanForm.tanggalBayar ? new Date().toLocaleDateString('id-ID') : editTagihanForm.tanggalBayar
                    });
                  }}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Dicicil">Dicicil / Sebagian</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
              {editTagihanForm.status === 'Dicicil' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Jumlah Terbayar (Rp)</label>
                  <input
                    type="number"
                    value={editTagihanForm.terbayar !== undefined ? editTagihanForm.terbayar : 0}
                    onChange={e => setEditTagihanForm({ ...editTagihanForm, terbayar: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Tanggal Tagihan
                </label>
                <input
                  type="text"
                  value={editTagihanForm.tanggalBayar}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, tanggalBayar: e.target.value })}
                  placeholder="Contoh: 09/08/2026 atau 2026-08-09"
                  className="w-full bg-[#181818] border border-slate-700/80 text-emerald-300 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tanggal tagihan resmi yang tercatat di kasir / sistem.
                </span>
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Metode Pembayaran</label>
                <select
                  value={editTagihanForm.metodePembayaran}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, metodePembayaran: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cash / Kasir">Cash / Kasir (Tunai)</option>
                  <option value="Transfer Bank - BRI">Transfer Bank - BRI</option>
                  <option value="Transfer Bank - BNI">Transfer Bank - BNI</option>
                  <option value="Transfer Bank - Mandiri">Transfer Bank - Mandiri</option>
                  <option value="Transfer Bank - BCA">Transfer Bank - BCA</option>
                  <option value="QRIS / E-Wallet">QRIS / E-Wallet (OVO/Dana/Gopay)</option>
                  <option value="Tabungan Siswa">Tabungan Siswa</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowEditTagihanModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!editingTagihan) return;
                  
                  // Validasi Input
                  if (!editTagihanForm.namaTagihan.trim()) {
                    alert('Nama tagihan tidak boleh kosong!');
                    return;
                  }
                  if (isNaN(editTagihanForm.nominal) || editTagihanForm.nominal <= 0) {
                    alert('Nominal tagihan harus berupa angka dan lebih besar dari 0!');
                    return;
                  }

                  setTagihanList(prev => {
                    const exists = prev.some(t => t.id === editingTagihan.id);
                    
                    let finalStatus = editTagihanForm.status;
                    let updatedTerbayar = editingTagihan.terbayar || 0;
                    
                    if (finalStatus === 'Lunas') {
                      updatedTerbayar = editTagihanForm.nominal;
                    } else if (finalStatus === 'Belum Lunas') {
                      updatedTerbayar = 0;
                    } else if (finalStatus === 'Dicicil') {
                      updatedTerbayar = editTagihanForm.terbayar !== undefined ? editTagihanForm.terbayar : (editingTagihan.terbayar || 0);
                      if (updatedTerbayar >= editTagihanForm.nominal) {
                        // Jika jumlah bayar menyamai atau melebihi nominal, otomatis ubah status jadi Lunas
                        finalStatus = 'Lunas';
                        updatedTerbayar = editTagihanForm.nominal;
                      } else if (updatedTerbayar <= 0) {
                        // Jika dicicil tetapi nominal terbayar <= 0, ubah ke Belum Lunas
                        finalStatus = 'Belum Lunas';
                        updatedTerbayar = 0;
                      }
                    }
                    
                    let finalTanggalBayar = editTagihanForm.tanggalBayar;
                    if (finalStatus === 'Lunas' && !finalTanggalBayar) {
                      finalTanggalBayar = new Date().toLocaleDateString('id-ID');
                    }

                    const updatedItem = {
                      ...editingTagihan,
                      namaTagihan: editTagihanForm.namaTagihan,
                      nominal: editTagihanForm.nominal,
                      jatuhTempo: editTagihanForm.jatuhTempo,
                      tanggalBayar: finalTanggalBayar,
                      status: finalStatus,
                      terbayar: updatedTerbayar
                    };

                    // Sync corresponding transaction(s) in transaksiList
                    if (setTransaksiList) {
                      setTransaksiList(prevTx => {
                        // Filter out existing transactions associated with this bill
                        const isSynthesized = editingTagihan.id && String(editingTagihan.id).startsWith('syn-');
                        const baseTx = prevTx.filter(tx => {
                          const isMatch = tx.tagihanId === editingTagihan.id || 
                            (isSynthesized && tx && tx.siswaNama && editingTagihan && editingTagihan.siswaNama && 
                             (tx.siswaNama || '').trim().toLowerCase() === (editingTagihan.siswaNama || '').trim().toLowerCase() && 
                             (tx.tipe || '').toLowerCase() === (editingTagihan.tipe || '').toLowerCase());
                          return !isMatch;
                        });

                        if (finalStatus === 'Belum Lunas') {
                          // No transaction record
                          return baseTx;
                        } else {
                          // Create/update a single corresponding transaction matching the new status and payment
                          const txId = `tx-${Date.now()}`;
                          const newTx: TransaksiKeuangan = {
                            id: txId,
                            tagihanId: editingTagihan.id,
                            siswaNama: editingTagihan.siswaNama || 'Siswa',
                            pembayaran: editTagihanForm.namaTagihan,
                            tipe: editingTagihan.tipe || 'spp',
                            nominal: updatedTerbayar,
                            tanggal: finalTanggalBayar || new Date().toLocaleDateString('id-ID'),
                            metodePembayaran: editTagihanForm.metodePembayaran || 'Cash / Kasir',
                            penerima: 'Kasir / Bendahara Sekolah'
                          };
                          return [newTx, ...baseTx];
                        }
                      });
                    }

                    if (exists) {
                      return prev.map(t => t.id === editingTagihan.id ? updatedItem : t);
                    } else {
                      return [updatedItem, ...prev];
                    }
                  });

                  localStorage.removeItem('edu_tagihan_force_clear');
                  localStorage.removeItem('edu_transaksi_force_clear');
                  
                  alert('Perubahan tagihan berhasil disimpan!');
                  setShowEditTagihanModal(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS / BATALKAN TAGIHAN & PEMBAYARAN */}
      {deleteTargetTagihan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                Hapus Tagihan / Batalkan Pembayaran
              </h3>
              <button
                onClick={() => setDeleteTargetTagihan(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Siswa</span>
                  <span className="font-bold text-slate-200">{deleteTargetTagihan.siswaNama}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Item Tagihan</span>
                  <span className="font-bold text-slate-100">{deleteTargetTagihan.namaTagihan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tagihan</span>
                  <span className="font-mono font-bold text-slate-300">Rp {deleteTargetTagihan.nominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terbayar</span>
                  <span className="font-mono font-bold text-emerald-400">Rp {(deleteTargetTagihan.terbayar || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Saat Ini</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    deleteTargetTagihan.status === 'Lunas' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    deleteTargetTagihan.status === 'Dicicil' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {deleteTargetTagihan.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300">
                Silakan pilih tindakan penghapusan yang ingin Anda lakukan:
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              {((deleteTargetTagihan.terbayar && deleteTargetTagihan.terbayar > 0) || deleteTargetTagihan.status === 'Lunas' || deleteTargetTagihan.status === 'Dicicil') && (
                <button
                  type="button"
                  onClick={() => handleExecuteResetPaymentOnly(deleteTargetTagihan)}
                  className="w-full px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Batalkan Pembayaran Saja (Ubah ke Belum Lunas)
                </button>
              )}

              <button
                type="button"
                onClick={() => handleExecuteDeleteTagihanPermanen(deleteTargetTagihan)}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Tagihan Permanen dari Daftar
              </button>

              <button
                type="button"
                onClick={() => setDeleteTargetTagihan(null)}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs mt-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS TRANSAKSI */}
      {deleteTargetTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                Konfirmasi Hapus Transaksi
              </h3>
              <button
                onClick={() => setDeleteTargetTx(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2">
              <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-200">{deleteTargetTx.pembayaran}</div>
                <div className="font-mono font-bold text-emerald-400">Rp {deleteTargetTx.tagihan.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-400">{deleteTargetTx.tanggal}</div>
              </div>
              <p className="text-[11px] text-slate-400 italic">Tindakan ini akan mengembalikan status pembayaran dan saldo tagihan siswa terkait secara otomatis.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  performDeleteTransaction(deleteTargetTx);
                  setDeleteTargetTx(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT SISWA */}
      {showEditSiswaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-blue-400">
                <Edit3 className="w-4 h-4" />
                Edit Data Siswa
              </h3>
              <button
                onClick={() => setShowEditSiswaModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSiswa} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={editingSiswaData.nama || ''}
                  onChange={e => setEditingSiswaData(prev => ({ ...prev, nama: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">NISN</label>
                  <input
                    type="text"
                    value={editingSiswaData.nisn || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, nisn: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">NIS</label>
                  <input
                    type="text"
                    value={editingSiswaData.nis || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, nis: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Kelas (Tingkat)</label>
                  <select
                    value={editingSiswaData.tingkatKelas || 'Kelas 7'}
                    onChange={e => {
                      const newTingkat = e.target.value;
                      const matchingRombel = rombelList.find(r => r.tingkatKelas === newTingkat);
                      setEditingSiswaData(prev => ({
                        ...prev,
                        tingkatKelas: newTingkat,
                        ...(matchingRombel && !prev.rombel ? { rombel: matchingRombel.namaRombel, kelas: matchingRombel.namaRombel } : {})
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                    <option value="Kelas 10">Kelas 10</option>
                    <option value="Kelas 11">Kelas 11</option>
                    <option value="Kelas 12">Kelas 12</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Rombel (Rombongan Belajar)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibnu Sina, VII-A"
                    value={editingSiswaData.rombel || editingSiswaData.kelas || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, rombel: e.target.value, kelas: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={editingSiswaData.teleponWali || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, teleponWali: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    value={editingSiswaData.namaIbu || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, namaIbu: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditSiswaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA DATA */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121212] border-2 border-rose-900/50 text-white rounded-2xl max-w-md w-full p-8 shadow-[0_0_50px_-12px_rgba(225,29,72,0.5)] space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 animate-pulse">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-rose-500 tracking-tight">HAPUS SEMUA DATA?</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tindakan ini akan <span className="text-rose-400 font-bold underline decoration-rose-500/50 underline-offset-4">MENGHAPUS PERMANEN</span> seluruh data tagihan dan transaksi keuangan yang ada di sistem.
              </p>
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 w-full">
                <p className="text-[11px] text-rose-300 font-medium italic">
                  *Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda sudah melakukan pencadangan (Export CSV) jika diperlukan.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleExecuteDeleteAll}
                className="w-full px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <Trash2 className="w-5 h-5" />
                YA, HAPUS SEMUA SEKARANG
              </button>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all border border-slate-700"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
