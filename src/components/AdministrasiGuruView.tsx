import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar, 
  X,
  Upload,
  FileSpreadsheet,
  FileCode,
  FolderDown,
  Award,
  Edit3,
  Save,
  Check,
  FileDown,
  GraduationCap
} from 'lucide-react';
import { AdministrasiGuru, TipeAdministrasi, Role, Guru } from '../types/school';

interface AdministrasiGuruViewProps {
  administrasiList: AdministrasiGuru[];
  setAdministrasiList: React.Dispatch<React.SetStateAction<AdministrasiGuru[]>>;
  currentRole?: Role;
  userEmail?: string;
  guruList?: Guru[];
}

export function generateModulAjarTemplateText(
  mapel: string, 
  kelas: string, 
  topik: string,
  namaPenyusun: string = 'Mutiara Indah Pratiwi, S.Pd',
  namaKepalaSekolah: string = 'Deni Rahmat, S.Sos.I',
  nipKepalaSekolah: string = '19820412 200801 1 003',
  nipPenyusun: string = '19900524 201503 2 004'
) {
  return `MODUL AJAR
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

A. IDENTITAS
Nama Penyusun      : ${namaPenyusun}
Nama Sekolah       : SMP Islam Modern Al Fakhir
Mata Pelajaran     : ${mapel}
Fase/Kelas         : D/${kelas || 'VII'}
Semester           : I (Ganjil)
Materi             : ${topik || 'Bab I – Al-Qur’an dan Sunnah Sebagai Pedoman Hidup'}
Alokasi Waktu      : 2 x 40 menit
Tahun Pelajaran    : 2026-2027

B. KARAKTERISTIK PESERTA DIDIK
1. Karakteristik Peserta Didik Reguler
   • Kemampuan awal: Rata-rata peserta didik telah mengenal konsep dasar dan pemahaman awal materi ${mapel}.
   • Kesiapan belajar: Berada pada tahap operasional konkret menuju formal (usia 12–13 tahun), mampu berpikir hipotetis sederhana namun membutuhkan contoh konkret dan visual.
   • Minat: Menyukai kegiatan visual, diskusi kelompok, eksplorasi lingkungan, dan presentasi kreatif (poster, infografis, video pendek).
   • Gaya belajar: Bervariasi – visual (gambar/video), auditori (penjelasan & bacaan), dan kinestetik (praktik/observasi langsung).
   • Kemampuan sosial & komunikasi: Bekerja sama dalam kelompok kecil, menyampaikan pendapat secara lisan & tulisan sederhana.

2. Karakteristik Peserta Didik Inklusif
   - A.B (Slow Learner): Tekun & ramah. Butuh langkah kecil & repetisi. Pendampingan terstruktur, evaluasi lisan bertahap.
   - G.A (Disleksia ringan): Daya ingat visual baik, aktif berbicara. Kesulitan membaca teks panjang & ayat. Teks diperbesar, dibacakan, kartu bergambar, waktu tambahan.
   - M.A (ADHD): Energik, cepat tanggap bila diberi tugas gerak. Sulit fokus > 10 menit. Instruksi singkat bertahap, jeda gerak, tempat duduk depan.
   - Inklusi C (Autisme ringan): Teliti & konsisten. Sulit dengan perubahan mendadak. Jadwal visual, instruksi tertulis + gambar, buddy system.

C. KOMPONEN INTI
1. DIMENSI PROFIL LULUSAN
   a. Keimanan dan Ketakwaan terhadap Tuhan YME
   b. Mandiri dan Bertanggung Jawab
   c. Bernalar Kritis dan Kreatif

2. TUJUAN PEMBELAJARAN (TP)
   • Target Peserta Didik Reguler:
     a. Menjelaskan makna dan konsep utama ${topik || 'materi'} berdasarkan rujukan resmi dan dalil relevan;
     b. Mengidentifikasi minimal 3 fenomena/penerapan di lingkungan sekitar dengan teliti;
     c. Menunjukkan sikap syukur, penuh tanggung jawab, dan integritas dalam kehidupan sehari-hari;
     d. Menyajikan hasil pengamatan/analisis dalam bentuk karya kreatif.
   • Target Peserta Didik Inklusi:
     - Target Inklusi Ringan: Menjelaskan secara sederhana dengan bantuan gambar/teks diperbesar; mengidentifikasi 2 contoh dengan buddy system.
     - Target Inklusi Sedang: Mengenali konsep utama melalui media visual; mengikuti kegiatan dengan instruksi bertahap.
     - Target Individual (PPI): Menunjuk gambar/simbol ciptaan; duduk mengikuti kegiatan minimal 10 menit dengan jeda gerak.

3. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
   • Peserta Didik Reguler: Mampu mendaftarkan minimal 3 contoh penerapan hasil observasi beserta kaitannya dengan konsep ${mapel}.
   • Peserta Didik Inklusi Ringan: Mampu menyebutkan minimal 2 contoh di lingkungan sekitar dengan bantuan gambar.
   • Peserta Didik Inklusi Sedang: Mampu menyebutkan 1-2 contoh dan menunjukkan sikap positif sederhana.

4. INTEGRASI NILAI ISLAMI
   Q.S. Al-A'rāf/7:54 & Q.S. Al-Anbiyā'/21:30
   Nilai Karakter Islami: Tauhid Rubūbiyah, Tafakur, Syukur, Tanggung Jawab Khalifah fil Ardh.

D. PRINSIP PEMBELAJARAN (DEEP LEARNING)
1. Mindful (Berkesadaran): Pembelajaran diawali dengan momen tadabbur/latihan pernapasan singkat & fungsional.
2. Meaningful (Bermakna): Konsep dikaitkan langsung dengan fenomena nyata keseharian siswa.
3. Joyful (Menyenangkan): Eksplorasi interaktif, kerja kelompok, presentasi karya, & positive reinforcement.

E. ALUR PEMBELAJARAN (3 PERTEMUAN)
● Pertemuan 1 — Mengamati dan Merenungkan (2 JP)
  - Tahap 1: Memahami — Mindful (10 menit)
  - Tahap 2: Mengaplikasikan — Meaningful (40 menit) (Diferensiasi proses & produk)
  - Tahap 3: Merefleksi — Joyful (10 menit)
  - Penyesuaian Inklusi: Pendampingan buddy system & instruksi bertahap.
● Pertemuan 2 — Analisis & Diskusi Mendalam (2 JP)
● Pertemuan 3 — Aplikasi & Aksi Nyata Kehidupan Sehari-hari (2 JP)

F. PENGUATAN LITERASI DAN NUMERASI
1. Literasi: Membaca teks, analisis sumber, & menyusun laporan tertulis.
2. Numerasi: Pencatatan data, kalkulasi sederhana, & pemetaan frekuensi fenomena.

G. ASESMEN
1. Asesmen Diagnostik: Observasi awal, wawancara singkat, kuesioner pra-tes.
2. Asesmen Formatif: Catatan observasi, penilaian diskusi & presentasi kelompok.
3. Asesmen Sumatif: Soal Pilihan Ganda & Essay + Penyesuaian Asesmen Inklusi (soal disederhanakan, jumlah dikurangi, jawaban lisan/gambar, tambahan waktu 10-15 menit).

H. REFLEKSI
1. Refleksi Guru (Evaluasi 7 Poin Kinerja)
2. Refleksi Peserta Didik Reguler (5 Poin Pertanyaan)
3. Refleksi Peserta Didik Inklusi (4 Poin Pertanyaan Visual/Lisan)

Sawangan, 15 Juli 2026
Mengetahui,
Kepala Sekolah                                  Guru Mata Pelajaran

${namaKepalaSekolah.padEnd(48, ' ')}${namaPenyusun}
NUPTK: ${nipKepalaSekolah.padEnd(41, ' ')}NUPTK: ${nipPenyusun}`;
}

export const AdministrasiGuruView: React.FC<AdministrasiGuruViewProps> = ({
  administrasiList,
  setAdministrasiList,
  currentRole = 'admin',
  userEmail = '',
  guruList = []
}) => {
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const [search, setSearch] = useState('');

  // Find active teacher based on email or default
  const activeTeacher = guruList.find(g => g.email.toLowerCase() === userEmail.toLowerCase());
  const initialMapel = activeTeacher?.mataPelajaran || (userEmail.includes('guru.ahmad') ? 'Pendidikan Agama Islam' : currentRole === 'guru' ? 'Pendidikan Agama Islam' : 'Semua');

  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>(initialMapel);

  // Find headmaster/principal from guruList
  const principal = guruList?.find(g => 
    g.jabatan.toLowerCase().includes('kepala sekolah') || 
    g.jabatan.toLowerCase() === 'kepala sekolah'
  );
  const principalName = principal ? principal.nama : 'Deni Rahmat, S.Sos.I';
  const principalNip = principal ? (principal.nip || '19820412 200801 1 003') : '19820412 200801 1 003';

  // Find teacher for the currently selected template subject
  const getTemplateTeacherInfo = (mapelName: string) => {
    const teacher = guruList?.find(g => 
      g.mataPelajaran.toLowerCase().includes(mapelName.toLowerCase()) || 
      mapelName.toLowerCase().includes(g.mataPelajaran.toLowerCase())
    ) || activeTeacher || guruList?.[0];

    return {
      nama: teacher ? teacher.nama : 'Mutiara Indah Pratiwi, S.Pd',
      nip: teacher ? (teacher.nip || '19900524 201503 2 004') : '19900524 201503 2 004'
    };
  };

  useEffect(() => {
    if (currentRole === 'guru' && selectedMapelFilter === 'Semua') {
      setSelectedMapelFilter(initialMapel);
    }
  }, [currentRole, userEmail]);

  // AI Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTipe, setAiTipe] = useState<TipeAdministrasi>('modul_ajar');
  const [aiMapel, setAiMapel] = useState(selectedMapelFilter !== 'Semua' ? selectedMapelFilter : 'Pendidikan Agama Islam');
  const [aiKelas, setAiKelas] = useState('VII');
  const [aiTopik, setAiTopik] = useState('Bab I – Al-Qur’an dan Sunnah Sebagai Pedoman Hidup');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (selectedMapelFilter !== 'Semua') {
      setAiMapel(selectedMapelFilter);
    }
  }, [selectedMapelFilter]);

  // File Upload Custom Template State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // View Document Modal State
  const [activeDoc, setActiveDoc] = useState<AdministrasiGuru | null>(null);
  const [isEditingActiveDoc, setIsEditingActiveDoc] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const openDocModal = (doc: AdministrasiGuru) => {
    setActiveDoc(doc);
    setEditedContent(doc.content || doc.deskripsi);
    setIsEditingActiveDoc(false);
  };

  const handleSaveActiveDoc = () => {
    if (!activeDoc) return;
    setAdministrasiList(prev => prev.map(d => {
      if (d.id === activeDoc.id) {
        return {
          ...d,
          content: editedContent,
          deskripsi: editedContent.length > 180 ? editedContent.substring(0, 180) + '...' : editedContent
        };
      }
      return d;
    }));

    setActiveDoc(prev => prev ? {
      ...prev,
      content: editedContent,
      deskripsi: editedContent.length > 180 ? editedContent.substring(0, 180) + '...' : editedContent
    } : null);

    setIsEditingActiveDoc(false);
    alert('Perubahan dokumen Modul Ajar berhasil disimpan!');
  };

  const handleDownloadDocx = () => {
    if (!activeDoc) return;
    const text = activeDoc.content || activeDoc.deskripsi;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${activeDoc.judul}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
        h1, h2, h3 { color: #0f172a; }
        pre { font-family: Courier New, monospace; white-space: pre-wrap; font-size: 10pt; background: #f8fafc; padding: 10px; }
      </style>
      </head>
      <body>
        <h2 style="text-align:center;">${activeDoc.judul}</h2>
        <p><b>Guru Penyusun:</b> ${activeDoc.guruNama} | <b>Mata Pelajaran:</b> ${activeDoc.mataPelajaran} | <b>Kelas:</b> ${activeDoc.kelas} | <b>T.A.:</b> ${activeDoc.tahunAjaran}</p>
        <hr />
        <pre>${text}</pre>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.judul.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
    a.click();
  };

  const handleDownloadTxt = () => {
    if (!activeDoc) return;
    const text = activeDoc.content || activeDoc.deskripsi;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.judul.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    a.click();
  };

  const writePrintContent = (doc: Document, text: string) => {
    if (!activeDoc) return;

    // Find teacher of active document in guruList to get their actual NIP / NUPTK
    const docGuru = guruList?.find(g => g.nama.toLowerCase() === activeDoc.guruNama.toLowerCase());
    const docGuruNip = docGuru ? (docGuru.nip || '-') : '-';

    doc.write(`
      <html>
      <head>
        <title>${activeDoc.judul}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Arial', 'Helvetica Neue', sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .kop-surat {
            text-align: center;
            border-bottom: 4px double #059669;
            padding-bottom: 12px;
            margin-bottom: 25px;
          }
          .kop-surat h1 {
            font-size: 16pt;
            margin: 0;
            color: #059669;
            text-transform: uppercase;
            font-weight: bold;
          }
          .kop-surat h2 {
            font-size: 11pt;
            margin: 4px 0 0 0;
            color: #475569;
            font-weight: normal;
            letter-spacing: 0.5px;
          }
          .document-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            color: #0f172a;
            margin: 10px 0 20px 0;
            text-transform: uppercase;
          }
          .table-info {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 10pt;
          }
          .table-info td {
            padding: 6px 4px;
            vertical-align: top;
          }
          .table-info td.label {
            font-weight: bold;
            width: 25%;
            color: #334155;
          }
          .table-info td.colon {
            width: 3%;
            text-align: center;
            color: #64748b;
          }
          .table-info td.val {
            color: #0f172a;
          }
          .content-title {
            font-size: 12pt;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 2px solid #10b981;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .content-box {
            font-family: 'Consolas', 'Courier New', monospace;
            white-space: pre-wrap;
            font-size: 9.5pt;
            background: #fafafa;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            line-height: 1.6;
            color: #1e293b;
          }
          .signatures {
            width: 100%;
            margin-top: 50px;
            border: none;
            page-break-inside: avoid;
          }
          .signatures td {
            width: 50%;
            text-align: center;
            font-size: 10pt;
            color: #1e293b;
          }
          .signatures p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="kop-surat">
          <h1>SMP ISLAM MODERN AL FAKHIR</h1>
          <h2>PERANGKAT ADMINISTRASI GURU • STANDAR KURIKULUM MERDEKA</h2>
        </div>
        
        <div class="document-title">
          ${activeDoc.judul}
        </div>
        
        <table class="table-info">
          <tr>
            <td class="label">Mata Pelajaran</td>
            <td class="colon">:</td>
            <td class="val" style="font-weight: bold; color: #059669;">${activeDoc.mataPelajaran}</td>
          </tr>
          <tr>
            <td class="label">Kelas / Rombel</td>
            <td class="colon">:</td>
            <td class="val">Kelas ${activeDoc.kelas}</td>
          </tr>
          <tr>
            <td class="label">Jenis Perangkat</td>
            <td class="colon">:</td>
            <td class="val" style="text-transform: uppercase;">${activeDoc.tipe.replace('_', ' ')}</td>
          </tr>
          <tr>
            <td class="label">Tahun Ajaran</td>
            <td class="colon">:</td>
            <td class="val">${activeDoc.tahunAjaran} (${activeDoc.semester})</td>
          </tr>
          <tr>
            <td class="label">Guru Penyusun</td>
            <td class="colon">:</td>
            <td class="val" style="font-weight: bold;">${activeDoc.guruNama}</td>
          </tr>
          <tr>
            <td class="label">Status Pengesahan</td>
            <td class="colon">:</td>
            <td class="val" style="font-weight: bold; color: #15803d;">${activeDoc.status}</td>
          </tr>
        </table>
        
        <div class="content-title">Isi / Uraian Dokumen Administrasi</div>
        <div class="content-box">${text}</div>
        
        <table class="signatures">
          <tr>
            <td>
              <p>Mengetahui,</p>
              <p><b>Kepala Sekolah SMP Islam Modern Al Fakhir</b></p>
              <br /><br /><br /><br />
              <p><u>${principalName}</u></p>
              <p>NUPTK / NIP. ${principalNip}</p>
            </td>
            <td>
              <p>Jakarta, ${new Date(activeDoc.tanggalInput).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><b>Guru Pengampu Mata Pelajaran</b></p>
              <br /><br /><br /><br />
              <p><u>${activeDoc.guruNama}</u></p>
              <p>NUPTK / NIP. ${docGuruNip}</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `);
  };

  const handlePrintDoc = () => {
    if (!activeDoc) return;
    const text = activeDoc.content || activeDoc.deskripsi;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // In case popup is blocked (which is highly likely in iframes), use the hidden iframe approach
      const iframe = document.createElement('iframe');
      iframe.name = 'print_iframe';
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0px';
      iframe.style.top = '-1000px';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        writePrintContent(doc, text);
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }, 500);
      } else {
        alert('Gagal membuka jendela cetak. Silakan periksa izin browser Anda.');
      }
      return;
    }

    writePrintContent(printWindow.document, text);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Sample official Kemendikdasmen 2026 subjects list
  const kemendikdasmenMapelList = [
    'Pendidikan Agama Islam',
    'Fisika & Informatika',
    'Bahasa Indonesia Fase E/F',
    'Matematika Tingkat Lanjut',
    'Kimia Praktikum',
    'Biologi & Lingkungan',
    'Bahasa Inggris Komunikasi',
    'Ekonomi & Bisnis',
    'Sosiologi & Sejarah',
    'PPKn & Pancasila'
  ];

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const teacherName = activeTeacher?.nama || (currentRole === 'guru' ? 'Guru Pengampu Mapel' : 'Siti Rahmawati, S.Si., M.Sc.');
    const mapelName = selectedMapelFilter !== 'Semua' ? selectedMapelFilter : 'Fisika & Informatika';

    setUploadedFileName(file.name);
    const newDoc: AdministrasiGuru = {
      id: `adm-upload-${Date.now()}`,
      tipe: 'modul_ajar',
      guruNama: teacherName,
      mataPelajaran: mapelName,
      kelas: 'X-IPA-1',
      tahunAjaran: '2026/2027',
      semester: 'Ganjil',
      judul: `Dokumen Upload: ${file.name}`,
      deskripsi: `File template mandiri guru berformat (${file.name.split('.').pop()?.toUpperCase()}) berhasil diunggah ke cloud repository sekolah untuk Mapel ${mapelName}. Ukuran file: ${(file.size / 1024).toFixed(1)} KB.`,
      tanggalInput: new Date().toISOString().split('T')[0],
      status: 'Final'
    };

    setAdministrasiList(prev => [newDoc, ...prev]);
    alert(`File template "${file.name}" berhasil diunggah dan disimpan untuk Mapel ${mapelName}!`);
  };

  const [templateSelectedMapel, setTemplateSelectedMapel] = useState<string>('Pendidikan Agama Islam');
  const [templateSelectedTipe, setTemplateSelectedTipe] = useState<string>('modul_ajar');
  const [templateSelectedKelas, setTemplateSelectedKelas] = useState<string>('VII');
  const [templateSelectedFase, setTemplateSelectedFase] = useState<string>('Fase D');
  const [editedTemplateText, setEditedTemplateText] = useState<string>('');

  const getTemplateTextContent = (mapel: string, tipe: string, kelas: string, fase: string): string => {
    let textContent = '';
    const teacherInfo = getTemplateTeacherInfo(mapel);
    if (tipe === 'modul_ajar') {
      textContent = generateModulAjarTemplateText(
        mapel, 
        `${kelas} (${fase})`, 
        `Bab I - ${mapel} Kurikulum Merdeka 2026/2027`,
        teacherInfo.nama,
        principalName,
        principalNip,
        teacherInfo.nip
      );
    } else if (tipe === 'atp_cp') {
      textContent = `=== TEMPLATE RESMI KEMENDIKDASMEN 2026 ===
Mata Pelajaran: ${mapel}
Kelas / Fase: Kelas ${kelas} / ${fase}
Jenis Dokumen: ATP & CP (Alur Tujuan Pembelajaran & Capaian Pembelajaran)
Tahun Ajaran: 2026/2027 (Kurikulum Merdeka Edisi Terbaru)

1. CAPAIAN PEMBELAJARAN (CP):
- Peserta didik mampu menganalisis fenomena dan merumuskan solusi matematis/ilmiah secara kreatif dan bernalar kritis pada ${fase}.
- Peserta didik memahami materi pokok dan hubungan interdisipliner dalam lingkup pembelajaran ${mapel} Kelas ${kelas}.

2. ALUR TUJUAN PEMBELAJARAN (ATP):
- TP 1.1: Memahami konsep dasar dan esensi dari topik pembelajaran ${mapel}.
- TP 1.2: Mengaplikasikan rumus, teori, dan metode pemecahan masalah dalam studi kasus nyata di lingkungan sekolah.
- TP 1.3: Menyusun laporan proyek kolaboratif berbasis kebinekaan global dan kemandirian.

3. MODUL AJAR BERDIFERENSIASI (DEEP LEARNING & INKLUSI):
- Pemetaan Kebutuhan Belajar: Auditori, Visual, Kinestetik.
- Penyesuaian Inklusi: Slow Learner, ADHD, Disleksia, Autisme dengan pendampingan individual/buddy system.
- Kegiatan Inti: Orientasi masalah, diskusi kelompok terdiferensiasi, presentasi interaktif, asesmen formatif berkala, dan refleksi sumatif.`;
    } else if (tipe === 'prota') {
      textContent = `=== PROGRAM TAHUNAN (PROTA) KEMENDIKDASMEN 2026 ===
Mata Pelajaran: ${mapel}
Satuan Pendidikan: SMP Islam Modern Al Fakhir
Kelas / Fase: Kelas ${kelas} / ${fase}
Tahun Pelajaran: 2026/2027

A. Alokasi Waktu Efektif:
- Semester 1: 18 Minggu Efektif (72 JP)
- Semester 2: 16 Minggu Efektif (64 JP)
Total Jam Pelajaran Efektif Setahun: 136 JP

B. Distribusi Kompetensi Dasar & Topik Pembelajaran:
1. Bab I: Pengenalan Konsep Dasar & Pemetaan Masalah - 16 JP
2. Bab II: Eksplorasi Teori & Analisis Tematik Terbimbing - 24 JP
3. Bab III: Aplikasi Praktis & Asesmen Formatif Akhir Bab - 32 JP
4. Bab IV: Proyek Penguatan Profil Pelajar Pancasila (P5) Terintegrasi - 32 JP
5. Bab V: Evaluasi Akhir & Asesmen Sumatif Akhir Tahun - 32 JP`;
    } else if (tipe === 'prosem') {
      textContent = `=== PROGRAM SEMESTER (PROSEM) KEMENDIKDASMEN 2026 ===
Mata Pelajaran: ${mapel}
Satuan Pendidikan: SMP Islam Modern Al Fakhir
Kelas / Fase: Kelas ${kelas} / ${fase}
Semester: Ganjil (I)
Tahun Pelajaran: 2026/2027

Distribusi Alokasi JP per Bulan (Juli - Desember):
1. Bab I (Pengenalan Konsep) - 16 JP (Juli: 8 JP, Agustus: 8 JP)
2. Bab II (Eksplorasi Teori) - 24 JP (Agustus: 12 JP, September: 12 JP)
3. Sumatif Tengah Semester (STS) - 4 JP (September)
4. Bab III (Aplikasi Praktis) - 24 JP (Oktober: 12 JP, November: 12 JP)
5. Sumatif Akhir Semester (SAS) - 4 JP (Desember)
6. Penyerahan Rapor & Libur Semester - (Desember)`;
    } else {
      textContent = `=== KALENDER PENDIDIKAN (KALDIK) RESMI 2026/2027 ===
Dinas Pendidikan & Kebudayaan RI - Integrasi Kurikulum Merdeka
Target Sasaran: ${fase} / Kelas ${kelas}

A. Hari Pertama Masuk Sekolah: 13 Juli 2026
B. Libur Umum / Keagamaan Semester Ganjil:
- 17 Juli 2026: Libur Tahun Baru Islam 1448 H
- 17 Agustus 2026: Hari Kemerdekaan RI ke-81
- 5 September 2026: Maulid Nabi Muhammad SAW
C. Prakiraan Jeda Tengah Semester: 21 - 26 September 2026
D. Penilaian Sumatif Akhir Semester (SAS): 1 - 12 Desember 2026
E. Pembagian Rapor Semester I: 18 Desember 2026
F. Libur Akhir Semester Ganjil: 21 Desember 2026 - 2 Januari 2027`;
    }
    return textContent;
  };

  useEffect(() => {
    const text = getTemplateTextContent(templateSelectedMapel, templateSelectedTipe, templateSelectedKelas, templateSelectedFase);
    setEditedTemplateText(text);
  }, [templateSelectedMapel, templateSelectedTipe, templateSelectedKelas, templateSelectedFase]);

  const handleDownloadOfficialTemplate = (mapel: string, tipe: string, format: 'doc' | 'txt' = 'doc') => {
    const textContent = editedTemplateText;
    const title = `${tipe.toUpperCase()} - ${mapel.toUpperCase()} (Kelas ${templateSelectedKelas} - ${templateSelectedFase})`;
    const teacherInfo = getTemplateTeacherInfo(mapel);

    if (format === 'doc') {
      const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>${title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; padding: 20px; }
          h1, h2, h3, h4 { color: #0f172a; font-family: 'Arial Black', sans-serif; }
          h2 { border-bottom: 2px solid #10b981; padding-bottom: 5px; margin-top: 20px; font-size: 14pt; }
          p { margin: 6px 0; }
          pre { font-family: 'Consolas', 'Courier New', monospace; white-space: pre-wrap; font-size: 10pt; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { padding: 4px; vertical-align: top; }
        </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 18pt; margin: 0; color: #059669;">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h1>
            <h3 style="font-size: 12pt; margin: 5px 0 20px 0; color: #475569; letter-spacing: 1px;">TEMPLATE STANDAR RESMI KURIKULUM MERDEKA 2026</h3>
            <div style="border-top: 3px double #059669; margin: 10px auto; width: 90%;"></div>
          </div>
          
          <table class="header-table">
            <tr>
              <td style="width: 25%; font-weight: bold;">Mata Pelajaran</td>
              <td style="width: 5%;">:</td>
              <td style="color: #059669; font-weight: bold;">${mapel}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Kelas & Fase</td>
              <td>:</td>
              <td>Kelas ${templateSelectedKelas} (${templateSelectedFase})</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Jenis Dokumen</td>
              <td>:</td>
              <td>${tipe.replace('_', ' ').toUpperCase()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Tahun Ajaran</td>
              <td>:</td>
              <td>2026/2027 (Edisi Pembaharuan Kemendikdasmen 2026)</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Status File</td>
              <td>:</td>
              <td>Dokumen Resmi Master Template (.DOC) - Kustomisasi Sekolah</td>
            </tr>
          </table>
          
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          
          <h2>ISI / KONTEN UTAMA DOKUMEN</h2>
          <pre>${textContent}</pre>
          
          <br /><br />
          <table style="width: 100%; margin-top: 40px; border: none;">
            <tr>
              <td style="width: 50%; text-align: center;">
                <p>Mengetahui,</p>
                <p><b>Kepala Sekolah</b></p>
                <br /><br /><br />
                <p><u>${principalName}</u></p>
                <p>NUPTK / NIP. ${principalNip}</p>
              </td>
              <td style="width: 50%; text-align: center;">
                <p>Jakarta, 2 Agustus 2026</p>
                <p><b>Guru Mata Pelajaran</b></p>
                <br /><br /><br />
                <p><u>${teacherInfo.nama}</u></p>
                <p>NUPTK / NIP. ${teacherInfo.nip}</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Master_Template_2026_${mapel.replace(/[^a-zA-Z0-9_-]/g, '_')}_${tipe}.doc`;
      a.click();
    } else {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Master_Template_2026_${mapel.replace(/[^a-zA-Z0-9_-]/g, '_')}_${tipe}.txt`;
      a.click();
    }
  };

  const filteredDocs = administrasiList.filter(d => {
    const matchTipe = filterTipe === 'Semua' || d.tipe === filterTipe;
    const matchSearch = d.judul.toLowerCase().includes(search.toLowerCase()) || 
                        d.guruNama.toLowerCase().includes(search.toLowerCase()) || 
                        d.mataPelajaran.toLowerCase().includes(search.toLowerCase());
    
    let matchMapel = true;
    if (selectedMapelFilter !== 'Semua') {
      const target = selectedMapelFilter.toLowerCase();
      const docMap = d.mataPelajaran.toLowerCase();
      matchMapel = docMap.includes(target) || target.includes(docMap) ||
        (target.includes('agama') && docMap.includes('agama')) ||
        (target.includes('fisika') && docMap.includes('fisika')) ||
        (target.includes('indonesia') && docMap.includes('indonesia'));
    }

    return matchTipe && matchSearch && matchMapel;
  });

  const handleGenerateAiDoc = async () => {
    setLoadingAi(true);
    try {
      const teacherName = activeTeacher?.nama || 'Guru Pengampu Mapel';
      const res = await fetch('/api/ai/generate-administrasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe: aiTipe,
          mataPelajaran: aiMapel,
          kelas: aiKelas,
          topik: aiTopik
        })
      });
      const data = await res.json();
      if (data.success) {
        const fullContent = data.content;
        const shortDesc = fullContent.length > 200 ? fullContent.substring(0, 200) + '...' : fullContent;

        const newDoc: AdministrasiGuru = {
          id: `adm-${Date.now()}`,
          tipe: aiTipe,
          guruNama: teacherName,
          mataPelajaran: aiMapel,
          kelas: aiKelas,
          tahunAjaran: '2026/2027',
          semester: 'Ganjil',
          judul: `${aiTipe.toUpperCase().replace('_', ' ')}: ${aiMapel} - ${aiTopik}`,
          deskripsi: shortDesc,
          content: fullContent,
          tanggalInput: new Date().toISOString().split('T')[0],
          status: 'Final'
        };

        setAdministrasiList(prev => [newDoc, ...prev]);
        setIsAiModalOpen(false);
        openDocModal(newDoc);
        alert(`Dokumen Administrasi (${aiTipe.toUpperCase()}) untuk Mapel ${aiMapel} berhasil di-generate!`);
      } else {
        alert('Gagal membuat dokumen AI.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan sistem saat generate dokumen.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Perangkat Administrasi Guru
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modul Ajar, ATP, CP, Jurnal Mengajar, Prota, Prosem, Kaldik, & Jadwal Mengajar Kurikulum Merdeka
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Custom File Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomFileUpload}
            accept=".xlsx,.xls,.docx,.doc,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-slate-300"
          >
            <Upload className="w-4 h-4 text-slate-600" /> Upload Template Excel/Word
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" /> Generate Dokumen AI
          </button>
        </div>
      </div>

      {/* Guru Subject Active Filter Banner */}
      <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-200 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-300 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> Administrasi Disesuaikan Dengan Mata Pelajaran
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Filter Mapel Guru: <span className="text-purple-300 underline underline-offset-2 font-black">{selectedMapelFilter}</span>
              {currentRole === 'guru' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-bold border border-purple-500/40">
                  Guru Pengampu Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-purple-300/80 mt-0.5">
              Sistem menampilkan draf Modul Ajar, ATP, CP, Jurnal, Prota, dan Prosem yang sesuai dengan mata pelajaran yang Anda ampu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <label className="text-xs font-semibold text-purple-300 shrink-0">Pilih Mapel:</label>
          <select
            value={selectedMapelFilter}
            onChange={e => {
              setSelectedMapelFilter(e.target.value);
              if (e.target.value !== 'Semua') {
                setAiMapel(e.target.value);
              }
            }}
            className="bg-[#121212] border border-purple-700/60 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
          >
            <option value="Semua">-- Semua Mapel Sekolah --</option>
            <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
            <option value="Fisika & Informatika">Fisika & Informatika</option>
            <option value="Bahasa Indonesia & Sastra">Bahasa Indonesia & Sastra</option>
            <option value="Matematika Tingkat Lanjut">Matematika Tingkat Lanjut</option>
            <option value="Biologi & Lingkungan">Biologi & Lingkungan</option>
            <option value="Kimia Praktikum">Kimia Praktikum</option>
            <option value="Bahasa Inggris Komunikasi">Bahasa Inggris Komunikasi</option>
            <option value="Ekonomi & Bisnis">Ekonomi & Bisnis</option>
            <option value="Sosiologi & Sejarah">Sosiologi & Sejarah</option>
            <option value="PPKn & Pancasila">PPKn & Pancasila</option>
          </select>
        </div>
      </div>

      {/* 2026 Kemendikdasmen Official Standard Templates Banner */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              UPDATE KURIKULUM MERDEKA 2026
            </span>
            <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Template Resmi Kemendikdasmen 2026 Semua Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unduh draf resmi Modul Ajar, ATP, CP, Prota, Prosem, dan Kaldik standar kementerian terintegrasi 2026.
            </p>
          </div>
        </div>

        {/* Dropdown Selector Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end bg-[#181818] p-4 rounded-xl border border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Mata Pelajaran</label>
            <select
              value={templateSelectedMapel}
              onChange={e => setTemplateSelectedMapel(e.target.value)}
              className="w-full bg-[#121212] border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              {kemendikdasmenMapelList.map((mapel, idx) => (
                <option key={idx} value={mapel} className="bg-[#181818]">{mapel}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Jenis Dokumen</label>
            <select
              value={templateSelectedTipe}
              onChange={e => setTemplateSelectedTipe(e.target.value)}
              className="w-full bg-[#121212] border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <option value="modul_ajar" className="bg-[#181818]">Modul Ajar Berdiferensiasi (RPP+)</option>
              <option value="atp_cp" className="bg-[#181818]">ATP & CP (Alur & Capaian Pembelajaran)</option>
              <option value="prota" className="bg-[#181818]">Program Tahunan (Prota)</option>
              <option value="prosem" className="bg-[#181818]">Program Semester (Prosem)</option>
              <option value="kaldik" className="bg-[#181818]">Kalender Pendidikan (Kaldik)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Kelas</label>
            <select
              value={templateSelectedKelas}
              onChange={e => setTemplateSelectedKelas(e.target.value)}
              className="w-full bg-[#121212] border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <option value="VII" className="bg-[#181818]">Kelas VII (SMP)</option>
              <option value="VIII" className="bg-[#181818]">Kelas VIII (SMP)</option>
              <option value="IX" className="bg-[#181818]">Kelas IX (SMP)</option>
              <option value="X" className="bg-[#181818]">Kelas X (SMA)</option>
              <option value="XI" className="bg-[#181818]">Kelas XI (SMA)</option>
              <option value="XII" className="bg-[#181818]">Kelas XII (SMA)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Fase</label>
            <select
              value={templateSelectedFase}
              onChange={e => setTemplateSelectedFase(e.target.value)}
              className="w-full bg-[#121212] border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <option value="Fase A" className="bg-[#181818]">Fase A (Kelas 1-2 SD)</option>
              <option value="Fase B" className="bg-[#181818]">Fase B (Kelas 3-4 SD)</option>
              <option value="Fase C" className="bg-[#181818]">Fase C (Kelas 5-6 SD)</option>
              <option value="Fase D" className="bg-[#181818]">Fase D (Kelas 7-9 SMP)</option>
              <option value="Fase E" className="bg-[#181818]">Fase E (Kelas 10 SMA)</option>
              <option value="Fase F" className="bg-[#181818]">Fase F (Kelas 11-12 SMA)</option>
            </select>
          </div>
        </div>

        {/* Live Template Editor Workspace */}
        <div className="bg-[#181818] rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-200">Workspace Editor & Kustomisasi Sekolah</h4>
                <p className="text-[10px] text-slate-500">Sesuaikan draf di bawah dengan kop surat, visi misi, atau format khusus sekolah Anda sebelum diunduh.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-[#121212] px-2 py-1 rounded border border-slate-800">
                {editedTemplateText.length} Karakter
              </span>
              <span className="text-[10px] text-slate-500 bg-[#121212] px-2 py-1 rounded border border-slate-800">
                {editedTemplateText.split(/\s+/).filter(Boolean).length} Kata
              </span>
              <button
                type="button"
                onClick={() => {
                  const text = getTemplateTextContent(templateSelectedMapel, templateSelectedTipe, templateSelectedKelas, templateSelectedFase);
                  setEditedTemplateText(text);
                }}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                title="Reset draf kembali ke standar kementerian"
              >
                Reset Standar
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={editedTemplateText}
              onChange={e => setEditedTemplateText(e.target.value)}
              className="w-full h-80 bg-[#121212] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y shadow-inner"
              placeholder="Ketik atau edit draf template di sini sesuai dengan kebutuhan kurikulum sekolah Anda..."
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#181818]/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[9px] font-semibold text-slate-400 border border-slate-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live-Editing Active
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDownloadOfficialTemplate(templateSelectedMapel, templateSelectedTipe, 'doc')}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
            >
              <FolderDown className="w-4 h-4 text-slate-950" /> Unduh Dokumen Hasil Edit (.DOC)
            </button>
            <button
              type="button"
              onClick={() => handleDownloadOfficialTemplate(templateSelectedMapel, templateSelectedTipe, 'txt')}
              className="px-4 py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              title="Unduh draf hasil edit sebagai file teks"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Unduh .TXT
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul dokumen, nama guru, atau mata pelajaran..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Tipe Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterTipe}
            onChange={e => setFilterTipe(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="Semua">Semua Jenis Dokumen</option>
            <option value="modul_ajar">Modul Ajar</option>
            <option value="atp">ATP (Alur Tujuan Pembelajaran)</option>
            <option value="cp">CP (Capaian Pembelajaran)</option>
            <option value="jurnal">Jurnal Mengajar</option>
            <option value="prota">Prota (Program Tahunan)</option>
            <option value="prosem">Prosem (Program Semester)</option>
            <option value="kaldik">Kaldik (Kalender Pendidikan)</option>
            <option value="jadwal">Jadwal Mengajar</option>
          </select>
        </div>
      </div>

      {/* Document Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-[10px] uppercase border border-purple-200">
                  {doc.tipe.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  doc.status === 'Disetujui Kepala Sekolah'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {doc.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mt-3 leading-snug">{doc.judul}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{doc.deskripsi}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <div className="font-semibold text-slate-800">{doc.guruNama}</div>
                <div>{doc.mataPelajaran} • Kelas {doc.kelas}</div>
              </div>

              <button
                onClick={() => openDocModal(doc)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1"
              >
                Lihat / Cetak
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> AI Perangkat Ajar Kurikulum Merdeka
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Tipe Dokumen Administrasi</label>
                <select
                  value={aiTipe}
                  onChange={e => setAiTipe(e.target.value as TipeAdministrasi)}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                >
                  <option value="modul_ajar">Modul Ajar Berdiferensiasi & Inklusi</option>
                  <option value="atp">Alur Tujuan Pembelajaran (ATP)</option>
                  <option value="cp">Capaian Pembelajaran (CP)</option>
                  <option value="jurnal">Jurnal Mengajar Harian</option>
                  <option value="prota">Program Tahunan (Prota)</option>
                  <option value="prosem">Program Semester (Prosem)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={aiMapel}
                    onChange={e => setAiMapel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Kelas / Fase</label>
                  <input
                    type="text"
                    value={aiKelas}
                    onChange={e => setAiKelas(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Topik / Elemen Pembelajaran</label>
                <textarea
                  rows={2}
                  value={aiTopik}
                  onChange={e => setAiTopik(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                />
              </div>

              <button
                onClick={handleGenerateAiDoc}
                disabled={loadingAi}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {loadingAi ? 'Membuat Draf Dokumen AI...' : 'Generate Dokumen Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW / EDIT / PRINT DOKUMEN MODAL */}
      {activeDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                    {activeDoc.tipe.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    T.A. {activeDoc.tahunAjaran} ({activeDoc.semester})
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{activeDoc.judul}</h3>
                <p className="text-xs text-slate-500">Penyusun: <span className="font-semibold text-slate-800">{activeDoc.guruNama}</span> • Mapel: <span className="font-semibold text-slate-800">{activeDoc.mataPelajaran}</span> ({activeDoc.kelas})</p>
              </div>
              
              <button onClick={() => setActiveDoc(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingActiveDoc(!isEditingActiveDoc)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    isEditingActiveDoc
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingActiveDoc ? 'Batal Edit' : 'Edit Teks Dokumen'}
                </button>

                {isEditingActiveDoc && (
                  <button
                    onClick={handleSaveActiveDoc}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDocx}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Unduh format MS Word (.doc)"
                >
                  <FileDown className="w-3.5 h-3.5" /> Unduh .DOCX (Word)
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Unduh Teks Polos"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh .TXT
                </button>

                <button
                  onClick={handlePrintDoc}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                </button>
              </div>
            </div>

            {/* Document Content View / Textarea Editor */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isEditingActiveDoc ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Edit Isi Modul Ajar (Format Teks Terstruktur):</label>
                  <textarea
                    rows={18}
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap shadow-inner selection:bg-emerald-100">
                  {activeDoc.content || activeDoc.deskripsi}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t flex items-center justify-between text-xs text-slate-500">
              <div>Status: <span className="font-bold text-emerald-700">{activeDoc.status}</span> • Terakhir diinput: {activeDoc.tanggalInput}</div>
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
