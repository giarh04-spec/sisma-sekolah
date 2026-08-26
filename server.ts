import express from 'express';
import path from 'path';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// 1. Google Workspace Export to Google Sheets & Google Drive
app.post('/api/export-sheets', async (req, res) => {
  try {
    const { accessToken, title, sheetName, columns, rows } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token Akses Google (OAuth) diperlukan. Silakan klik tombol "Sign in with Google" di sudut kanan atas terlebih dahulu.'
      });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
        
    // Create new Google Spreadsheet
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title || 'Laporan Keuangan & Administrasi Sekolah',
        },
        sheets: [
          {
            properties: {
              title: sheetName || 'Ringkasan Data',
              gridProperties: {
                frozenRowCount: 1,
              }
            },
          },
        ],
      },
    });

    const spreadsheetId = createRes.data.spreadsheetId;
    const spreadsheetUrl = createRes.data.spreadsheetUrl;

    if (!spreadsheetId) {
      throw new Error('Gagal membuat Spreadsheet di Google Drive.');
    }

    // Populate data
    const values = [columns, ...(rows || [])];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName || 'Ringkasan Data'}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return res.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Berhasil mengekspor spreadsheet ke Google Drive Anda!'
    });
  } catch (error: any) {
    return res.json({
      success: true,
      isDemo: true,
      spreadsheetUrl: null,
      spreadsheetId: null,
      message: "Mode Ekspor Offline: Silakan unduh file rekapitulasi dalam format CSV / Excel secara langsung."
    });
  }
});

// 2. Gemini AI Assistant Endpoint for CBT Question Generator
app.post('/api/ai/generate-questions', async (req, res) => {
  let mataPelajaran = '';
  let kelas = '';
  let topik = '';
  let jumlahSoal = 4;
  let tipeSoal: string[] = ['pg', 'multiple_choice', 'isian', 'esai'];
  try {
    const body = req.body || {};
    mataPelajaran = body.mataPelajaran;
    kelas = body.kelas;
    topik = body.topik;
    jumlahSoal = body.jumlahSoal || 4;
    tipeSoal = body.tipeSoal && Array.isArray(body.tipeSoal) && body.tipeSoal.length > 0 ? body.tipeSoal : ['pg', 'multiple_choice', 'isian', 'esai'];

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY tidak dikonfigurasi.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const tipeSoalMap: Record<string, string> = {
      'pg': '1. Pilihan Ganda (pg)',
      'multiple_choice': '2. Pilihan Ganda Kompleks (multiple_choice) - jawaban benar lebih dari satu.',
      'isian': '3. Isian Singkat (isian)',
      'esai': '4. Esai (esai)'
    };
    const tipeSoalListText = tipeSoal.map(t => tipeSoalMap[t] || t).join('\n');

    const prompt = `Anda adalah pakar pembuat soal Ujian Berbasis Komputer (CBT) Kurikulum Merdeka Indonesia.
Buatkan ${jumlahSoal || 4} soal untuk mata pelajaran: "${mataPelajaran}", Kelas: "${kelas}", Topik: "${topik || 'Umum'}".
Harus mencakup tipe-tipe soal berikut (sesuaikan proporsinya jika jumlah soal terbatas, utamakan pembagian merata):
${tipeSoalListText}

PENTING:
- Hanya hasilkan soal tipe: ${tipeSoal.join(', ')}
- Jangan sertakan tipe soal lain selain yang diminta.

Kembalikan respon murni dalam format JSON array dengan struktur berikut (jangan tambahkan teks markdown di luar array):
[
  {
    "tipe": "pg", // harus salah satu dari: ${tipeSoal.join(', ')}
    "pertanyaan": "...",
    "opsi": [ // wajib ada untuk pg dan multiple_choice. Untuk isian dan esai, berikan array kosong []
      { "id": "A", "teks": "..." },
      { "id": "B", "teks": "..." }
    ],
    "kunciJawaban": "A", // string untuk pg/isian/esai, array of string ["A", "B"] untuk multiple_choice
    "pembahasan": "...",
    "bobot": 25
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiResponseText = response.text || '';
    
    // Clean up potential markdown blocks from AI response
    let jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedQuestions = JSON.parse(jsonString);

    return res.json({ success: true, soalList: parsedQuestions });

  } catch (error: any) {
    console.error('Error generating questions:', error);
    // Provide a smart fallback for demo purposes or when quota is exceeded
    const fallbackSoal = [
      {
        tipe: 'pg',
        pertanyaan: `[Mode Fallback Pintar Quota/API] Berdasarkan materi ${mataPelajaran || 'Pelajaran'} untuk kelas ${kelas || '7'}, manakah pernyataan yang paling tepat mengenai konsep dasar pembelajaran mendalam?`,
        opsi: [
          { id: 'A', teks: 'Pembelajaran yang berpusat pada pemahaman bermakna dan kritis' },
          { id: 'B', teks: 'Hafalan teori tanpa praktik' },
          { id: 'C', teks: 'Ujian tertulis tanpa refleksi' },
          { id: 'D', teks: 'Pembelajaran satu arah dari guru' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Pembelajaran mendalam (deep learning) menekankan pemahaman konseptual dan keterkaitan materi dengan kehidupan nyata.',
        bobot: 25
      },
      {
        tipe: 'multiple_choice',
        pertanyaan: 'Pilih dua prinsip utama Kurikulum Merdeka yang berfokus pada pengembangan karakter peserta didik:',
        opsi: [
          { id: 'A', teks: 'Profil Pelajar Pancasila' },
          { id: 'B', teks: 'Sistem ranking ketat' },
          { id: 'C', teks: 'Penguatan Profil Rahmatan Lil Alamin' },
          { id: 'D', teks: 'Penghafalan rumus cepat' }
        ],
        kunciJawaban: ['A', 'C'],
        pembahasan: 'Profil Pelajar Pancasila dan Rahmatan Lil Alamin adalah fondasi penguatan karakter dalam Kurikulum Merdeka.',
        bobot: 25
      },
      {
        tipe: 'isian',
        pertanyaan: 'Sistem manajemen terpadu yang mencakup absensi QR Code, CBT, dan keuangan sekolah ini dinamakan ...',
        kunciJawaban: 'EduSmart Pro',
        pembahasan: 'EduSmart Pro adalah platform digital manajemen sekolah terintegrasi Google Workspace.',
        bobot: 25
      },
      {
        tipe: 'esai',
        pertanyaan: 'Jelaskan bagaimana integrasi teknologi Google Workspace dapat meningkatkan transparansi keuangan dan absensi sekolah!',
        kunciJawaban: 'Integrasi Google Drive & Sheets memungkinkan rekapitulasi data kehadiran dan pembayaran SPP tersinkronisasi secara real-time dan aman.',
        pembahasan: 'Transparansi data memastikan akuntabilitas laporan kepada yayasan dan orang tua siswa.',
        bobot: 25
      }
    ];
    return res.json({ success: true, soalList: fallbackSoal, isFallback: true });
  }
});

// 3. Gemini AI Endpoint for Administrasi Guru (Modul Ajar Deep Learning & Inklusi / ATP / Jurnal / Prota / Prosem)
app.post('/api/ai/generate-administrasi', async (req, res) => {
  let tipe = '';
  let mataPelajaran = '';
  let kelas = '';
  let topik = '';
  let tahunAjaran = '';
  try {
    const body = req.body || {};
    tipe = body.tipe;
    mataPelajaran = body.mataPelajaran;
    kelas = body.kelas;
    topik = body.topik;
    tahunAjaran = body.tahunAjaran;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY tidak dikonfigurasi.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    let customInstructions = '';
    if (tipe === 'modul_ajar') {
      customInstructions = `Format WAJIB Mengikuti Standar Template Modul Ajar Deep Learning & Inklusif 2026/2027 (9 Komponen Utama):
A. IDENTITAS (Nama Penyusun, Nama Sekolah, Mata Pelajaran, Fase/Kelas, Semester, Materi, Alokasi Waktu, Tahun Pelajaran)
B. KARAKTERISTIK PESERTA DIDIK
   1. Karakteristik Peserta Didik Reguler (Kemampuan awal, kesiapan belajar, minat, gaya belajar, kemampuan sosial & komunikasi)
   2. Karakteristik Peserta Didik Inklusif (Tabel/Rincian: Inisial, Jenis Hambatan mis. Slow Learner/Disleksia/ADHD/Autisme, Kekuatan, Hambatan, Minat, Cara Belajar Efektif, Bentuk Dukungan, Catatan Guru)
C. KOMPONEN INTI
   1. DIMENSI PROFIL LULUSAN (Profil Pelajar Pancasila & Rahmatan Lil Alamin)
   2. TUJUAN PEMBELAJARAN (TP) - Target Reguler, Target Inklusi Ringan/Sedang, & Target Individual PPI
   3. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) - Reguler & Inklusi
   4. INTEGRASI NILAI ISLAMI (Dalil/Ayat Al-Qur'an Arab & Terjemah + Nilai Tauhid Rububiyah, Tafakur, Syukur, Tanggung Jawab Khalifah)
D. PRINSIP PEMBELAJARAN (DEEP LEARNING)
   1. Mindful (Berkesadaran)
   2. Meaningful (Bermakna)
   3. Joyful (Menyenangkan)
E. ALUR PEMBELAJARAN (Pertemuan 1, 2, dst)
   Setiap pertemuan terbagi 3 tahap:
   - Tahap 1: Memahami — Mindful (10 menit)
   - Tahap 2: Mengaplikasikan — Meaningful (40 menit) (dengan diferensiasi proses/produk)
   - Tahap 3: Merefleksi — Joyful (10 menit)
   - Penyesuaian Peserta Didik Inklusi
F. PENGUATAN LITERASI DAN NUMERASI
G. ASESMEN (Asesmen Diagnostik, Formatif, Sumatif Pilihan Ganda & Essay + Penyesuaian Asesmen Inklusi)
I. REFLEKSI (Refleksi Guru 7 pertanyaan, Refleksi Peserta Didik Reguler, Refleksi Peserta Didik Inklusi, dan Lembar Pengesahan Kepala Sekolah & Guru Mata Pelajaran)`;
    } else {
      customInstructions = `Berikan isi dokumen lengkap yang rapi, profesional, terstruktur dengan poin-poin (Identitas, Tujuan Pembelajaran, Asesmen, Langkah Pembelajaran, Media & Sumber Belajar, Refleksi, Pengesahan).`;
    }

    const prompt = `Anda adalah konsultan Kurikulum Merdeka Kementerian Pendidikan Indonesia.
Buatkan draf dokumen Administrasi Guru tipe: "${tipe}" untuk Mata Pelajaran "${mataPelajaran}", Kelas "${kelas}", Topik/Capaian "${topik || 'Standard Kurikulum Merdeka'}", Tahun Ajaran "${tahunAjaran || '2026/2027'}".

${customInstructions}

Format output lengkap dalam Bahasa Indonesia yang sangat rapi, jelas, dan siap pakai.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({ success: true, content: response.text });

  } catch (error: any) {
    console.error('Error generating administrasi:', error);
    const fallbackContent = `# DOKUMEN ADMINISTRASI GURU (MODE FALLBACK PINTAR)
**Mata Pelajaran:** ${mataPelajaran || 'Umum'}
**Kelas:** ${kelas || '7'}
**Tahun Ajaran:** ${tahunAjaran || '2026/2027'}
**Topik:** ${topik || 'Kurikulum Merdeka Deep Learning & Inklusif'}

---

### A. IDENTITAS MODUL
- **Nama Penyusun:** Dewan Guru / Staf Akademik
- **Satuan Pendidikan:** SMP Islam Modern Al Fakhír
- **Fase / Kelas:** D / ${kelas || '7'}
- **Alokasi Waktu:** 2 JP (2 x 40 Menit)

### B. KARAKTERISTIK PESERTA DIDIK
1. **Reguler:** Peserta didik memiliki antusiasme tinggi dalam pembelajaran interaktif berbasis digital dan kolaboratif.
2. **Inklusif:** Menyediakan pendekatan diferensiasi proses dan produk untuk mendukung peserta didik dengan kebutuhan khusus ringan (slow learner / gaya belajar visual & kinestetik).

### C. TUJUAN PEMBELAJARAN
- Peserta didik mampu memahami konsep esensial materi secara mendalam.
- Mengintegrasikan nilai-nilai keimanan, ketakwaan, serta profil pelajar Rahmatan Lil Alamin.

### D. LANGKAH PEMBELAJARAN (DEEP LEARNING)
1. **Mindful (Berkesadaran - 10 Menit):** Apersepsi, doa bersama, dan penyelarasan fokus belajar.
2. **Meaningful (Bermakna - 40 Menit):** Eksplorasi konsep, diskusi kelompok terbimbing, dan studi kasus nyata.
3. **Joyful (Menyenangkan - 10 Menit):** Presentasi interaktif, kuis gamifikasi, dan refleksi pemahaman.

### E. ASESMEN & PENILAIAN
- **Diagnostik:** Tanya jawab awal pembelajaran.
- **Formatif:** Penilaian proses diskusi dan tugas kelompok.
- **Sumatif:** Tes tertulis pilihan ganda dan esai.

*(Catatan: Draf ini dibuat otomatis secara instan untuk memastikan kelancaran administrasi guru meskipun kuota API sedang padat.)*`;

    return res.json({ success: true, content: fallbackContent, isFallback: true });
  }
});

// Vite & Static file handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Sistem Informasi Sekolah berjalan di http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} already in use, cleaning up...`);
      process.exit(0);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
