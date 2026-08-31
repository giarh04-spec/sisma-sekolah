import express from 'express';
import path from 'path';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to safely call Gemini generateContent with fallback models in case of high demand (503/429/etc.)
async function generateContentWithFallback(options: { model: string; contents: string; config?: any }) {
  const models = [options.model, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const uniqueModels = Array.from(new Set(models.filter(Boolean)));
  
  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      console.log(`[Gemini API] Attempting generation with model: ${model}`);
      const res = await ai.models.generateContent({
        ...options,
        model: model,
      });
      console.log(`[Gemini API] Success using model: ${model}`);
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Model ${model} failed with error:`, err.message || err);
      // Wait 500ms before trying next model
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

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

    const response = await generateContentWithFallback({
      model: 'gemini-3.7-flash',
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

    if (tipe === 'modul_ajar') {
      const prompt = `Anda adalah konsultan Kurikulum Merdeka Kementerian Pendidikan Indonesia.
Buatkan Modul Ajar lengkap Kurikulum Merdeka yang sangat detail, profesional, berlandaskan prinsip deep learning (Mindful, Meaningful, Joyful) dan ramah inklusi dalam format JSON terstruktur yang valid.

Mata Pelajaran: "${mataPelajaran}"
Kelas: "${kelas}"
Topik/Materi: "${topik || 'Standard Kurikulum Merdeka'}"
Tahun Ajaran: "${tahunAjaran || '2026/2027'}"

Format output HARUS berupa JSON object valid yang memiliki struktur berikut (jangan gunakan pembungkus markdown, langsung kembalikan raw JSON):
{
  "informasiUmum": {
    "namaPenyusun": "[Nama Penyusun Guru]",
    "namaSekolah": "SMP Islam Modern Al Fakhir",
    "mataPelajaran": "${mataPelajaran}",
    "fase": "D",
    "kelas": "${kelas}",
    "semester": "Ganjil",
    "tahunAjaran": "${tahunAjaran || '2026/2027'}",
    "alokasiWaktu": "2 JP (2 x 40 Menit)",
    "materi": "${topik}"
  },
  "kompetensiAwal": "Deskripsi detail tentang kompetensi awal murid sebelum memulai materi ini.",
  "profilPelajarPancasila": ["Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia", "Bernalar Kritis", "Kreatif", "Gotong Royong"],
  "saranaPrasarana": ["Laptop/Chromebook", "Koneksi Internet", "Proyektor LCD", "Slide Presentasi Interaktif", "Buku Paket Pendamping"],
  "targetPesertaDidik": "Reguler",
  "modelPembelajaran": "Problem Based Learning (PBL) / Project Based Learning",
  "tujuanPembelajaran": [
    "Menjelaskan konsep dasar dari ${topik} dengan tepat.",
    "Menganalisis penerapan ${topik} dalam kehidupan nyata.",
    "Menunjukkan karakter bernalar kritis dan kreatif melalui penugasan mandiri maupun kelompok."
  ],
  "pemahamanBermakna": "Penjelasan mengapa materi ${topik} ini bermakna bagi kehidupan siswa di masa depan.",
  "pertanyaanPemantik": [
    "Apa yang pertama kali terlintas di pikiran kalian saat mendengar tentang ${topik}?",
    "Bagaimana jika konsep ${topik} ini tidak pernah diterapkan dalam kehidupan sehari-hari?"
  ],
  "kegiatanPembelajaran": {
    "pendahuluan": { "deskripsi": "1. Guru mengucapkan salam dan berdoa bersama.\\n2. Guru memeriksa kehadiran siswa.\\n3. Apersepsi: Mengaitkan materi dengan kehidupan sehari-hari.\\n4. Guru menyampaikan tujuan pembelajaran.", "durasi": "15 Menit" },
    "inti": { "deskripsi": "Tahap 1: Orientasi Masalah\\n- Siswa menyimak tayangan presentasi tentang kasus nyata ${topik}.\\n\\nTahap 2: Mengorganisasikan Siswa\\n- Siswa dibagi kelompok 4-5 orang secara inklusif.\\n\\nTahap 3: Membimbing Penyelidikan\\n- Guru membimbing penyelidikan kelompok dengan diferensiasi proses bagi murid yang membutuhkan bantuan lebih.\\n\\nTahap 4: Mengembangkan & Menyajikan Hasil Karya\\n- Perwakilan kelompok mempresentasikan hasil diskusi.", "durasi": "50 Menit" },
    "penutup": { "deskripsi": "1. Siswa bersama guru menyimpulkan pembelajaran hari ini.\\n2. Refleksi bersama mengenai apa yang sudah dipelajari.\\n3. Guru memberikan apresiasi dan informasi materi pertemuan selanjutnya.\\n4. Doa penutup dan salam.", "durasi": "15 Menit" }
  },
  "asesmen": {
    "diagnostik": "Tanya jawab non-kognitif sebelum pembelajaran dimulai untuk mengukur kesiapan belajar.",
    "formatif": "Observasi sikap saat diskusi kelompok dan rubrik performa presentasi.",
    "sumatif": "Tes tertulis berupa soal pemecahan masalah atau proyek sederhana di akhir bab.",
    "teknik": "Tertulis & Performa Kelompok",
    "instrumen": "Lembar Kerja Siswa (LKPD) & Rubrik Penilaian Presentasi",
    "rubrik": "Skor 4: Sangat Baik (Memahami seluruh konsep dan aktif)\\nSkor 3: Baik (Memahami konsep dasar dan berpartisipasi)\\nSkor 2: Cukup (Kurang memahami konsep dasar, pasif)\\nSkor 1: Perlu Bimbingan (Tidak memahami konsep)",
    "kriteriaPenilaian": "Siswa dinyatakan tuntas jika mencapai minimal skor 3 (Baik) pada seluruh kriteria penilaian asesmen formatif."
  },
  "diferensiasi": {
    "konten": "Menyediakan bahan bacaan dalam bentuk teks, infografis, maupun video penjelasan tambahan untuk siswa visual/auditori.",
    "proses": "Memberikan pendampingan lebih intensif bagi siswa kelompok slow learner dan tantangan mandiri bagi kelompok fast learner.",
    "produk": "Siswa bebas memilih menyajikan hasil laporan kelompok dalam bentuk poster, infografis, file presentasi PPT, atau tulisan tangan."
  },
  "remedial": "Bimbingan individu atau pengerjaan ulang soal-soal asesmen formatif dengan penyederhanaan instruksi untuk siswa yang belum tuntas.",
  "pengayaan": "Pemberian tugas eksploratif mandiri berupa analisis studi kasus lanjutan yang lebih kompleks bagi siswa yang mencapai nilai di atas rata-rata.",
  "refleksiGuru": "Apakah tujuan pembelajaran telah tercapai secara efektif?\\nKendala apa yang paling dirasakan oleh siswa saat berdiskusi?\\nBagaimana keefektifan akomodasi inklusif yang disiapkan?",
  "refleksiPesertaDidik": "Bagian mana dari materi ini yang paling kalian senangi?\\nApakah kalian merasa terbantu dengan metode belajar kelompok ini?\\nApa tantangan terbesar yang kalian hadapi hari ini?",
  "lampiran": {
    "lkpd": "Lembar Kerja Peserta Didik berisi petunjuk pengerjaan studi kasus ${topik} secara berkelompok beserta lembar jawaban diskusi.",
    "bahanBacaan": "Artikel ringkas pengantar ${topik}, glosarium istilah-istilah penting, dan rangkuman poin-poin pembelajaran utama.",
    "rubrik": "Rubrik Penilaian Sikap (Gotong Royong, Bernalar Kritis) dan Rubrik Penilaian Produk Presentasi Kelompok.",
    "instrumenAsesmen": "3 Butir soal formatif pilihan ganda kompleks dan 2 butir soal esai studi kasus.",
    "daftarPustaka": "Buku Paket Informatika Kelas VII Kemendikbudristek 2022, artikel ilmiah, dan sumber digital terpercaya."
  }
}

Pastikan isi Modul Ajar sangat lengkap, kontekstual, mendalam, dan menggunakan Bahasa Indonesia yang profesional. Jangan tambahkan komentar teks apapun di luar JSON tersebut agar JSON dapat diparse langsung.`;

      const response = await generateContentWithFallback({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsedData = JSON.parse(response.text);
      return res.json({ success: true, isJson: true, data: parsedData });
    }

    let customInstructions = '';
    if (tipe === 'modul_ajar') {
      // Fallback for non-JSON or other logic paths
      customInstructions = `Format WAJIB Mengikuti Standar Template Modul Ajar Deep Learning & Inklusif 2026/2027 (Format Profesional PDF):
Gunakan elemen Markdown secara maksimal (Header #, ##, ###, Tabel, List, Horizontal Rule ---) untuk mensimulasikan tata letak dokumen PDF resmi.`;
    }
 else {
      customInstructions = `Berikan isi dokumen lengkap yang rapi, profesional, terstruktur dengan poin-poin (Identitas, Tujuan Pembelajaran, Asesmen, Langkah Pembelajaran, Media & Sumber Belajar, Refleksi, Pengesahan).`;
    }

    const prompt = `Anda adalah konsultan Kurikulum Merdeka Kementerian Pendidikan Indonesia.
Buatkan draf dokumen Administrasi Guru tipe: "${tipe}" untuk Mata Pelajaran "${mataPelajaran}", Kelas "${kelas}", Topik/Capaian "${topik || 'Standard Kurikulum Merdeka'}", Tahun Ajaran "${tahunAjaran || '2026/2027'}".

${customInstructions}

Format output lengkap dalam Bahasa Indonesia yang sangat rapi, jelas, dan siap pakai.`;

    const response = await generateContentWithFallback({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    return res.json({ success: true, content: response.text });

  } catch (error: any) {
    console.error('Error generating administrasi:', error);
    
    if (tipe === 'modul_ajar') {
      const fallbackData = {
        informasiUmum: {
          namaPenyusun: "Guru Pengampu Mapel",
          namaSekolah: "SMP Islam Modern Al Fakhir",
          mataPelajaran: mataPelajaran || "Umum",
          fase: "D",
          kelas: kelas || "7",
          semester: "Ganjil",
          tahunAjaran: "2026/2027",
          alokasiWaktu: "2 JP (2 x 40 Menit)",
          materi: topik || "Materi Pokok"
        },
        kompetensiAwal: "Siswa telah mengetahui pengenalan dasar mata pelajaran.",
        profilPelajarPancasila: ["Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia", "Bernalar Kritis", "Kreatif"],
        saranaPrasarana: ["Laptop/Chromebook", "Koneksi Internet", "Proyektor LCD"],
        targetPesertaDidik: "Reguler",
        modelPembelajaran: "Problem Based Learning",
        tujuanPembelajaran: [`Siswa dapat menganalisis materi ${topik || "pembelajaran"} dengan baik.`],
        pemahamanBermakna: "Pembelajaran ini memberikan pemahaman mendalam tentang konsep kehidupan nyata.",
        pertanyaanPemantik: ["Mengapa konsep ini penting bagi masa depan kalian?"],
        kegiatanPembelajaran: {
          pendahuluan: { deskripsi: "1. Doa dan salam.\n2. Absensi dan apersepsi.", durasi: "10 Menit" },
          inti: { deskripsi: "1. Orientasi masalah siswa.\n2. Diskusi kelompok terdiferensiasi.\n3. Presentasi karya kelompok.", durasi: "60 Menit" },
          penutup: { deskripsi: "1. Kesimpulan pembelajaran.\n2. Refleksi dan penutup.", durasi: "10 Menit" }
        },
        asesmen: {
          diagnostik: "Tanya jawab non-kognitif awal belajar.",
          formatif: "Observasi diskusi kelompok.",
          sumatif: "Tes tertulis di akhir pertemuan.",
          teknik: "Tertulis & Observasi",
          instrumen: "Lembar Observasi & Lembar Soal",
          rubrik: "Skor 4 (Sangat Baik), Skor 3 (Baik), Skor 2 (Cukup), Skor 1 (Kurang)",
          kriteriaPenilaian: "Ketuntasan minimal jika mencapai predikat Baik."
        },
        diferensiasi: {
          konten: "Menyediakan bacaan visual dan penugasan audio.",
          proses: "Pendampingan khusus bagi yang membutuhkan.",
          produk: "Laporan dibebaskan berupa slide, tulisan, atau gambar."
        },
        remedial: "Penjelasan ulang materi esensial dan latihan soal sederhana.",
        pengayaan: "Pemberian materi tambahan tingkat lanjut.",
        refleksiGuru: "Apakah seluruh siswa aktif berpartisipasi?",
        refleksiPesertaDidik: "Apa bagian paling berkesan hari ini?",
        lampiran: {
          lkpd: "Lembar Kerja berisi langkah eksperimen mandiri.",
          bahanBacaan: "Modul ringkas materi pelajaran.",
          rubrik: "Rubrik penilaian keaktifan kerja sama.",
          instrumenAsesmen: "Soal uraian pendek sebanyak 3 butir.",
          daftarPustaka: "Buku Panduan Guru Kurikulum Merdeka 2022."
        }
      };
      return res.json({ success: true, isJson: true, data: fallbackData, isFallback: true });
    }

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
