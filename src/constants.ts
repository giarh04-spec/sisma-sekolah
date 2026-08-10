export interface Subject {
  id: string;
  name: string;
  icon: string;
  defaultTopics: string[];
}

export interface LearningModel {
  id: string;
  name: string;
  description: string;
}

export interface ProfilPancasila {
  id: string;
  name: string;
  description: string;
}

export const SUBJECTS: Subject[] = [
  {
    id: 'ipa',
    name: 'Ilmu Pengetahuan Alam (IPA)',
    icon: 'Atom',
    defaultTopics: [
      'Sel Hewan dan Tumbuhan',
      'Sistem Pencernaan Manusia',
      'Usaha, Energi, dan Pesawat Sederhana',
      'Unsur, Senyawa, dan Campuran',
      'Getaran, Gelombang, dan Cahaya'
    ]
  },
  {
    id: 'matematika',
    name: 'Matematika',
    icon: 'Binary',
    defaultTopics: [
      'Sistem Persamaan Linear Dua Variabel (SPLDV)',
      'Teorema Pythagoras',
      'Persamaan Kuadrat',
      'Statistika & Peluang Dasar',
      'Transformasi Geometri'
    ]
  },
  {
    id: 'indonesia',
    name: 'Bahasa Indonesia',
    icon: 'BookOpen',
    defaultTopics: [
      'Teks Deskripsi',
      'Teks Laporan Hasil Observasi (LHO)',
      'Menulis Puisi & Prosa',
      'Teks Prosedur',
      'Teks Eksplanasi'
    ]
  },
  {
    id: 'inggris',
    name: 'Bahasa Inggris',
    icon: 'Languages',
    defaultTopics: [
      'Descriptive Text (People & Places)',
      'Procedure Text (Recipes & Manuals)',
      'Simple Past Tense & Recount Text',
      'Greeting Cards & Invitation Letters',
      'Giving Opinions & Asking for Help'
    ]
  },
  {
    id: 'ips',
    name: 'Ilmu Pengetahuan Sosial (IPS)',
    icon: 'Globe',
    defaultTopics: [
      'Interaksi Sosial dan Lembaga Sosial',
      'Kondisi Geografis Indonesia',
      'Masa Praaksara hingga Kerajaan Hindu-Buddha',
      'Kegiatan Ekonomi & Pelaku Ekonomi',
      'Pluralitas Masyarakat Indonesia'
    ]
  },
  {
    id: 'informatika',
    name: 'Infinformatika / Komputer',
    icon: 'Cpu',
    defaultTopics: [
      'Algoritma Pemrograman Visual (Scratch)',
      'Berpikir Komputasional (Dekomposisi & Pola)',
      'Dampak Sosial Informatika',
      'Jaringan Komputer dan Internet',
      'Analisis Data Menggunakan Spreadsheet'
    ]
  },
  {
    id: 'ppkn',
    name: 'Pendidikan Pancasila (PPKn)',
    icon: 'Shield',
    defaultTopics: [
      'Proses Perumusan Pancasila sebagai Dasar Negara',
      'Norma-norma yang Berlaku dalam Masyarakat',
      'UUD NRI Tahun 1945',
      'Keberagaman Suku, Agama, Ras di Indonesia',
      'Menjaga Keutuhan NKRI'
    ]
  }
];

export const LEARNING_MODELS: LearningModel[] = [
  {
    id: 'pbl',
    name: 'Problem-Based Learning (PBL)',
    description: 'Fokus pada penyelesaian masalah nyata secara kolaboratif untuk membangun bernalar kritis.'
  },
  {
    id: 'pjbl',
    name: 'Project-Based Learning (PjBL)',
    description: 'Menghasilkan produk nyata melalui investigasi terstruktur dalam jangka waktu tertentu.'
  },
  {
    id: 'discovery',
    name: 'Discovery/Inquiry Learning',
    description: 'Menemukan konsep secara mandiri melalui eksperimen, observasi, dan penalaran ilmiah.'
  },
  {
    id: 'cooperative',
    name: 'Cooperative Learning (STAD/Jigsaw)',
    description: 'Bekerja dalam kelompok kecil heterogen untuk saling membantu menguasai materi.'
  },
  {
    id: 'direct',
    name: 'Direct Instruction (Pembelajaran Langsung)',
    description: 'Penjelasan konsep secara bertahap diikuti latihan terbimbing dan mandiri.'
  }
];

export const PROFIL_PANCASILA: ProfilPancasila[] = [
  {
    id: 'iman',
    name: 'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
    description: 'Memahami ajaran agama serta menerapkannya dalam akhlak pribadi, sosial, dan alam.'
  },
  {
    id: 'kritis',
    name: 'Bernalar Kritis',
    description: 'Mampu menyaring, menganalisis, mengevaluasi informasi, dan merefleksikan pemikiran.'
  },
  {
    id: 'kreatif',
    name: 'Kreatif',
    description: 'Menghasilkan gagasan, karya, dan tindakan yang orisinal serta bernilai guna.'
  },
  {
    id: 'gotong_royong',
    name: 'Gotong Royong',
    description: 'Kemampuan melakukan kolaborasi secara sukarela demi kemaslahatan bersama.'
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    description: 'Bertanggung jawab atas proses dan hasil belajarnya sendiri dengan kesadaran diri.'
  },
  {
    id: 'kebinekaan',
    name: 'Berkebinekaan Global',
    description: 'Mempertahankan budaya luhur, lokalitas, sekaligus berpikiran terbuka dengan budaya lain.'
  }
];

export interface SampleTemplate {
  subject: string;
  topic: string;
  classLevel: string;
  model: string;
  profil: string[];
  duration: string;
  modulAjar: string;
  quiz: string;
  activities: string;
  differentiation: string;
}

export const SAMPLE_TEMPLATES: Record<string, SampleTemplate> = {
  ipa_sel: {
    subject: 'ipa',
    topic: 'Sel Hewan dan Tumbuhan',
    classLevel: 'Kelas 8 - Fase D',
    model: 'pbl',
    profil: ['kritis', 'kreatif', 'gotong_royong'],
    duration: '2 JP (2 x 40 Menit)',
    modulAjar: `### MODUL AJAR: SEL HEWAN & TUMBUHAN (KURIKULUM MERDEKA)

#### I. INFORMASI UMUM
* **Nama Penyusun:** Giar Hermawan, S.Pd.
* **Institusi:** SMP Belajar Merdeka
* **Jenjang/Kelas:** SMP / Kelas VIII (Fase D)
* **Mata Pelajaran:** Ilmu Pengetahuan Alam (IPA)
* **Alokasi Waktu:** 2 JP (2 x 40 Menit)
* **Materi Pokok:** Struktur dan Fungsi Sel (Sel Hewan vs Sel Tumbuhan)
* **Model Pembelajaran:** Problem-Based Learning (PBL)
* **Profil Pelajar Pancasila:**
  - **Bernalar Kritis:** Menganalisis perbedaan organel sel hewan dan sel tumbuhan serta dampaknya bagi kehidupan organisme.
  - **Gotong Royong:** Bekerja sama dalam kelompok melakukan pengamatan mikroskop/diskusi gambar literasi.
  - **Kreatif:** Membuat model sel 3D sederhana menggunakan bahan daur ulang/plastisin.

---

#### II. KOMPONEN INTI

##### A. Tujuan Pembelajaran
1. Peserta didik dapat mengidentifikasi struktur sel hewan dan sel tumbuhan melalui kegiatan diskusi dan analisis gambar dengan benar.
2. Peserta didik mampu menjelaskan fungsi organel-organel sel (inti sel, mitokondria, kloroplas, dinding sel, vakuola) melalui presentasi kelompok.
3. Peserta didik dapat membandingkan perbedaan utama antara sel hewan dan sel tumbuhan menggunakan diagram Venn dengan tepat.

##### B. Pemahaman Bermakna
* Sel adalah unit terkecil kehidupan yang sangat kompleks. Memahami struktur sel membantu kita menyadari keagungan Tuhan atas keteraturan sistem metabolisme dalam tubuh mahluk hidup. Perbedaan sel tumbuhan dan hewan menjelaskan mengapa tumbuhan kaku dan berdiri tegak (dinding sel), sedangkan hewan fleksibel dan dapat bergerak aktif.

##### C. Pertanyaan Pemantik
1. "Pernahkah kalian melihat pohon besar yang berdiri kokoh tertiup angin kencang tapi tidak jatuh? Mengapa tubuh kita tidak sekaku batang pohon tersebut?"
2. "Apa yang terjadi jika organel di dalam sel kita mogok bekerja?"

##### D. Kegiatan Pembelajaran

###### 1. Pendahuluan (10 Menit)
* Guru mengucapkan salam, menyapa peserta didik, dan memeriksa kehadiran kelas.
* Guru memberikan apersepsi dengan memajang foto selembar daun dan kulit manusia. "Sama-sama mahluk hidup, mengapa teksturnya sangat berbeda?"
* Guru menyampaikan tujuan pembelajaran, cakupan materi, serta Profil Pelajar Pancasila yang akan dinilai.

###### 2. Kegiatan Inti (60 Menit)
* **Fase 1: Orientasi Siswa pada Masalah**
  - Guru memutarkan video pendek mengenai fenomena tumbuhan yang layu saat kekeringan tetapi bisa segar kembali setelah disiram (turgor sel).
  - Siswa dirangsang untuk bertanya: *Mengapa tumbuhan membutuhkan banyak air di dalam selnya dibanding kita? Organel apa yang menampung air tersebut?*
* **Fase 2: Mengorganisasi Siswa untuk Belajar**
  - Guru membagi siswa menjadi kelompok heterogen (4-5 orang).
  - Guru membagikan LKPD (Lembar Kerja Peserta Didik) tentang analisis organel sel hewan dan tumbuhan.
* **Fase 3: Membimbing Penyelidikan Mandiri/Kelompok**
  - Kelompok membaca buku paket IPA Kelas 8 bab Sel dan mencermati infografis organel sel.
  - Siswa berdiskusi mengisi tabel organel sel serta menggambar draf sel tumbuhan dan hewan.
* **Fase 4: Mengembangkan dan Menyajikan Hasil Karya**
  - Setiap kelompok melengkapi Diagram Venn perbedaan sel hewan dan tumbuhan pada kertas karton/canva digital.
  - Perwakilan 2 kelompok melakukan presentasi singkat di depan kelas, kelompok lain menanggapi.
* **Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah**
  - Guru memberikan penguatan konsep mengenai fungsi dinding sel dan kloroplas yang hanya ada pada tumbuhan, serta sentriol pada hewan.
  - Siswa memperbaiki LKPD mereka berdasarkan umpan balik guru.

###### 3. Penutup (10 Menit)
* Siswa bersama guru menyimpulkan pembelajaran hari ini.
* Guru memberikan refleksi: "Apa bagian yang paling menarik dari materi sel hari ini? Bagian mana yang masih membingungkan?"
* Guru memberikan tugas baca mandiri tentang spesialisasi sel untuk pertemuan berikutnya.
* Kelas ditutup dengan doa bersama.

---

#### III. ASESMEN & REFLEKSI

##### A. Asesmen
1. **Asesmen Diagnostik (Non-Kognitif):** Menanyakan kesiapan belajar siswa melalui emotikon kepuasan di awal pembelajaran.
2. **Asesmen Formatif:** Observasi keaktifan diskusi kelompok dan pengerjaan LKPD.
3. **Asesmen Sumatif:** Tes tertulis singkat 5 soal pilihan ganda di akhir sesi (kuis formatif).

##### B. Refleksi Guru
* Apakah alokasi waktu 2 JP mencukupi untuk diskusi detail sel?
* Bagaimana tingkat partisipasi siswa yang awalnya pasif dalam kerja kelompok? Langkah perbaikan apa yang perlu diambil?`,
    quiz: `### INSTRUMEN EVALUASI & KUIS INTERAKTIF
**Topik:** Sel Hewan dan Sel Tumbuhan (IPA Kelas 8)

#### SOAL PILIHAN GANDA (LATIHAN MANDIRI)

**Soal 1 (Konseptual)**
Organel sel tumbuhan yang bertanggung jawab untuk menangkap energi matahari dan mengubahnya menjadi energi kimia dalam bentuk glukosa melalui proses fotosintesis adalah...
A. Mitokondria
B. Kloroplas
C. Badan Golgi
D. Vakuola
* **Kunci Jawaban:** B
* **Pembahasan:** Kloroplas mengandung pigmen klorofil yang berfungsi menyerap cahaya matahari untuk fotosintesis. Mitokondria berfungsi sebagai pusat respirasi sel, vakuola menyimpan cadangan makanan, dan Badan Golgi berperan dalam sekresi zat.

**Soal 2 (Analisis Perbandingan)**
Sekelompok siswa mengamati sel menggunakan mikroskop dan menemukan sel dengan dinding sel yang tebal, sitoplasma, dan vakuola berukuran besar. Sel tersebut dapat dipastikan merupakan...
A. Sel saraf kucing
B. Sel mukosa pipi manusia
C. Sel epidermis daun mangga
D. Sel darah merah katak
* **Kunci Jawaban:** C
* **Pembahasan:** Keberadaan dinding sel yang tebal dan vakuola yang sangat besar merupakan ciri khas utama sel tumbuhan. Daun mangga adalah bagian dari tumbuhan, sedangkan pilihan lainnya adalah sel hewan yang tidak memiliki dinding sel.

**Soal 3 (Evaluasi Fungsi)**
Apa yang akan terjadi pada sel hewan apabila organel mitokondrianya mengalami kerusakan total atau disfungsi?
A. Sel akan membelah diri lebih cepat
B. Sel akan kehilangan kemampuannya menghasilkan energi (ATP) dan perlahan mati
C. Sel akan membentuk dinding sel baru untuk pelindung
D. Sel akan memproduksi protein dalam jumlah berlebih
* **Kunci Jawaban:** B
* **Pembahasan:** Mitokondria adalah "The Powerhouse of Cell" yang bertugas melakukan respirasi seluler untuk menghasilkan energi (ATP). Jika mitokondria rusak, sel tidak dapat beraktivitas karena kekurangan energi, menyebabkan kematian sel.

---

#### SOAL MODEL AKM (ASESMEN KOMPETENSI MINIMUM)

**Stimulus Informasi:**
> **Dinding Sel: Sang Pelindung yang Kaku**
> Sel tumbuhan memiliki struktur luar tambahan berupa dinding sel yang terbuat dari selulosa tebal. Struktur ini memberikan kekakuan mekanis, mempertahankan bentuk sel, dan mencegah penyerapan air yang berlebihan hingga sel pecah (lisis). Ketika sel tumbuhan ditempatkan dalam air murni, air masuk ke dalam sel (osmosis), mendesak membran sel ke dinding sel. Tekanan ini disebut tekanan turgor, yang membuat tumbuhan berdiri tegak dan segar. Sebaliknya, sel hewan yang ditempatkan pada air murni akan menyerap air terus-menerus hingga mengembang dan akhirnya pecah (lisis), karena sel hewan hanya dibatasi oleh membran sel yang tipis dan fleksibel.

**Pertanyaan AKM (Benar/Salah Terbimbing):**
Berdasarkan stimulus di atas, tentukan kebenaran dari pernyataan berikut:
1. *Pernyataan A:* Sel hewan akan pecah jika direndam dalam air murni karena ketiadaan dinding sel penahan tekanan air. (**BENAR**)
2. *Pernyataan B:* Tekanan turgor terjadi ketika vakuola sel tumbuhan mengkerut akibat kekurangan air. (**SALAH** - Tekanan turgor terjadi saat sel terisi air penuh).
3. *Pernyataan C:* Tumbuhan herba (tak berkayu) mengandalkan tekanan turgor sel untuk dapat tegak berdiri kokoh. (**BENAR**)`,
    activities: `### AKTIVITAS PEMBELAJARAN KREATIF & ICEBREAKER
**Topik:** Sel Hewan dan Tumbuhan (IPA Kelas 8)

#### 1. Aktivitas "Sel Raksasa Interaktif" (Aktivitas Kinestetik Kelas)
* **Tujuan:** Memahami tata letak dan peran organel sel secara visual dan motorik.
* **Durasi:** 25 Menit
* **Langkah-langkah:**
  1. Guru menggambar lingkaran besar di lantai halaman sekolah dengan kapur tulis (mewakili Membran Sel hewan) dan persegi besar (mewakili Dinding Sel tumbuhan).
  2. Siswa diberikan "kartu nama organel" (seperti: "Inti Sel", "Mitokondria", "Kloroplas", "Dinding Sel").
  3. Saat guru meniup peluit dan berteriak "SEL HEWAN!", siswa yang memegang kartu organel yang ada di sel hewan harus segera berlari dan berdiri di dalam lingkaran kapur pada posisi yang logis. Siswa pemegang "Kloroplas" dan "Dinding Sel" harus tetap di luar.
  4. Ketika guru berteriak "FOTOSINTESIS!", siswa pemegang kartu "Kloroplas" harus memperagakan gaya menangkap sinar matahari, sedangkan pemegang "Mitokondria" melakukan push-up (menunjukkan produksi energi).
  5. Aktivitas ini sangat menyenangkan, memecah kantuk siang hari, sekaligus melekatkan ingatan visual tentang perbedaan organel.

#### 2. Icebreaker "Tebak Siapa Aku: Organel Edition"
* **Durasi:** 7 Menit
* **Cara Bermain:**
  - Guru menempelkan satu kertas berperekat di dahi perwakilan siswa tanpa memberi tahu tulisan di kertas tersebut (contoh tulisan: *Mitokondria*).
  - Siswa tersebut harus menebak kata di dahinya dengan mengajukan pertanyaan Ya/Tidak kepada teman-temannya.
  - *Contoh pertanyaan:* "Apakah aku ada di sel hewan?" (Ya), "Apakah aku berwarna hijau?" (Tidak), "Apakah tugasku membuat energi?" (Ya! "Kamu Mitokondria!").
  - Berikan reward kecil (seperti stiker atau poin keaktifan) bagi siswa yang berhasil menebak di bawah 5 pertanyaan.`,
    differentiation: `### MATERI AJAR TERDIFERENSIASI (KURIKULUM MERDEKA)
**Mata Pelajaran:** IPA Kelas 8
**Topik:** Perbedaan Sel Hewan dan Sel Tumbuhan

Dalam Kurikulum Merdeka, guru melayani keberagaman pemahaman peserta didik. Berikut adalah 3 tingkat materi ajar terdiferensiasi berdasarkan kesiapan belajar siswa:

---

#### Kelompok A: BELUM PAHAM (Butuh Pendampingan Khusus)
* **Fokus Utama:** Mengenali perbedaan visual dasar dan organel yang paling mencolok.
* **Pendekatan:** Menggunakan analogi rumah tangga sederhana.
* **Materi Ringkas:**
  - Bayangkan sel seperti sebuah rumah.
  - **Sel Tumbuhan:** Memiliki pagar tembok luar yang tebal (disebut **Dinding Sel**) sehingga bentuknya kotak kaku. Tumbuhan juga memiliki panel surya di atapnya (**Kloroplas**) untuk memasak makanannya sendiri menggunakan matahari.
  - **Sel Hewan:** Hanya seperti tenda pramuka, tidak punya tembok padat (hanya memiliki **Membran Sel** yang lentur), sehingga bentuknya bisa berubah-ubah bulat bebas. Hewan tidak punya panel surya, jadi harus mencari makanan dari luar.
* **Tugas Sederhana:** Warnai gambar sel hewan (bulat) dan sel tumbuhan (kotak), lalu lingkari bagian yang hanya ada di sel tumbuhan (Dinding Sel dan Kloroplas).

---

#### Kelompok B: PAHAM SEBAGIAN (Sesuai Target Pembelajaran)
* **Fokus Utama:** Mengetahui fungsi spesifik 5 organel utama dan membandingkannya menggunakan tabel terstruktur.
* **Pendekatan:** Analogi pabrik industri.
* **Materi Ringkas:**
  - Sel bekerja seperti pabrik yang sangat teratur:
    1. **Nukleus (Inti Sel):** Kantor Direktur Utama, berisi blueprint (DNA) untuk mengatur semua aktivitas pabrik.
    2. **Mitokondria:** Generator Listrik Pabrik, mengubah bahan bakar makanan menjadi energi listrik seluler.
    3. **Membran Sel:** Satpam Gerbang, menyaring keluar masuknya zat dan bahan baku.
    4. **Dinding Sel (Tumbuhan):** Tembok Beton Kokoh di sekeliling pabrik agar aman dari badai luar.
    5. **Kloroplas (Tumbuhan):** Dapur Katering internal yang memasak makanan menggunakan kompor bertenaga surya.
    6. **Vakuola:** Gudang penyimpanan cadangan air dan sisa produksi. Pada tumbuhan vakuolanya sangat besar karena tumbuhan tidak bisa berjalan untuk mencari air saat kekeringan.
* **Tugas Standar:** Lengkapilah diagram Venn perbandingan sel hewan dan tumbuhan, serta pasangkan nama organel dengan fungsi analogi pabriknya dengan benar.

---

#### Kelompok C: PAHAM UTUH (Pengayaan & Bernalar Tinggi)
* **Fokus Utama:** Menganalisis implikasi biologis dari perbedaan organel terhadap eksistensi organisme secara ekologis dan evolusioner.
* **Pendekatan:** Studi kasus ilmiah dan logika sains tingkat lanjut.
* **Materi Ringkas:**
  - **Efek Tekanan Osmotik:** Sel tumbuhan memiliki **Tekanan Turgor** yang dihasilkan oleh vakuola sentral yang menekan dinding sel selulosa. Tekanan ini menjaga tumbuhan tetap tegak (non-kayu). Jika tumbuhan diletakkan di larutan hipertonis (air garam), air keluar dari vakuola, menyebabkan membran sel lepas dari dinding sel (peristiwa **Plasmolisis**).
  - **Ketiadaan Lisosom pada Mayoritas Tumbuhan:** Mengapa tumbuhan jarang memiliki lisosom? Karena vakuola sentral yang besar pada sel tumbuhan juga bertindak sebagai organel hidrolitik yang mendegradasi makromolekul, mirip dengan fungsi lisosom pada hewan.
  - **Sitoskeleton dan Mobilitas:** Hewan memerlukan koordinasi sel saraf dan otot yang fleksibel untuk mobilitas tinggi, sehingga memerlukan membran sel yang dinamis. Tumbuhan adalah organisme sesil (menetap), kelangsungan hidupnya didukung oleh turgor sel untuk menantang gravitasi demi menjangkau fotosintesis.
* **Tugas Pengayaan:** Buatlah analisis singkat: *Mengapa keberadaan dinding sel selulosa pada tumbuhan menghalangi sel-sel tumbuhan untuk membentuk sistem saraf dan otot yang aktif bergerak seperti pada hewan? Jelaskan dari sudut pandang efisiensi energi!*`
  },
  matematika_spldv: {
    subject: 'matematika',
    topic: 'Sistem Persamaan Linear Dua Variabel (SPLDV)',
    classLevel: 'Kelas 8 - Fase D',
    model: 'discovery',
    profil: ['kritis', 'mandiri'],
    duration: '2 JP (2 x 40 Menit)',
    modulAjar: `### MODUL AJAR: SISTEM PERSAMAAN LINEAR DUA VARIABEL (SPLDV)

#### I. INFORMASI UMUM
* **Nama Penyusun:** Giar Hermawan, S.Pd.
* **Institusi:** SMP Belajar Merdeka
* **Jenjang/Kelas:** SMP / Kelas VIII (Fase D)
* **Mata Pelajaran:** Matematika
* **Alokasi Waktu:** 2 JP (2 x 40 Menit)
* **Materi Pokok:** Metode Eliminasi dan Substitusi pada SPLDV
* **Model Pembelajaran:** Discovery Learning
* **Profil Pelajar Pancasila:**
  - **Bernalar Kritis:** Mengidentifikasi hubungan variabel matematika dari cerita sehari-hari dan memecahkan sistem persamaan tersebut.
  - **Mandiri:** Melatih kepercayaan diri dalam menyelesaikan perhitungan aljabar secara runtut dan bertanggung jawab.

---

#### II. KOMPONEN INTI

##### A. Tujuan Pembelajaran
1. Peserta didik dapat memodelkan masalah kontekstual sehari-hari ke dalam bentuk Sistem Persamaan Linear Dua Variabel (SPLDV) dengan benar.
2. Peserta didik mampu menyelesaikan masalah SPLDV dengan metode eliminasi dan substitusi secara runtut.
3. Peserta didik dapat menafsirkan arti nilai variabel x dan y yang diperoleh dalam konteks masalah asli.

##### B. Pemahaman Bermakna
* SPLDV adalah alat bantu kuantitatif luar biasa yang digunakan dalam bisnis, perdagangan, dan teknik. Memahami SPLDV membantu kita menghitung harga satuan barang belanjaan tanpa label harga, atau mengoptimalkan anggaran belanja secara rasional.

##### C. Pertanyaan Pemantik
1. "Kemarin Andi membeli 2 buku dan 1 pulpen seharga Rp 10.000. Budi membeli 1 buku dan 1 pulpen seharga Rp 7.000 di toko yang sama. Berapa harga masing-masing buku dan pulpen? Bisakah kita mengetahuinya tanpa bertanya ke kasir?"
2. "Bagaimana cara memisahkan dua nilai misterius yang bercampur dalam satu struk belanja?"

##### D. Kegiatan Pembelajaran

###### 1. Pendahuluan (10 Menit)
* Guru membuka kelas, berdoa, dan memotivasi siswa dengan simulasi tebak-tebakan harga belanjaan sederhana.
* Guru mengaitkan SPLDV dengan materi prasyarat: Persamaan Linear Satu Variabel (PLSV) dan koordinat Kartesius.
* Guru menjelaskan skenario pembelajaran "Discovery Learning" yang akan ditempuh.

###### 2. Kegiatan Inti (60 Menit)
* **Fase 1: Pemberian Rangsangan (Stimulation)**
  - Guru menampilkan gambar dua paket makanan di kantin sekolah:
    - Paket Hemat A: 2 Donat + 1 Gelas Teh = Rp 12.000
    - Paket Hemat B: 1 Donat + 1 Gelas Teh = Rp 8.000
* **Fase 2: Identifikasi Masalah (Problem Statement)**
  - Siswa didorong mengajukan hipotesis harga donat dan es teh.
  - "Bagaimana persamaan matematikanya jika Donat kita sebut x dan Teh kita sebut y?"
  - Formula: 2x + y = 12.000 dan x + y = 8.000.
* **Fase 3: Pengumpulan Data (Data Collection)**
  - Siswa dalam kelompok kecil (2-3 orang) mencoba mencari harga satu donat dengan membandingkan kedua paket tersebut secara intuitif.
  - Siswa mencatat proses pengurangan paket A dengan paket B.
* **Fase 4: Pengolahan Data (Data Processing)**
  - Guru membimbing siswa menyadari bahwa mengurangkan Paket A dengan Paket B secara matematis mengeliminasi variabel y (es teh).
  - (2x + y) - (x + y) = 12.000 - 8.000 => x = 4.000 (Harga Donat).
  - Siswa mengganti nilai x ke persamaan terkecil untuk mendapatkan y (substitusi).
  - 4.000 + y = 8.000 => y = 4.000 (Harga Teh).
* **Fase 5: Pembuktian (Verification)**
  - Kelompok menguji harga tersebut pada persamaan pertama: 2(4.000) + 4.000 = 12.000 (Terbukti Cocok!).
  - Siswa mencoba menyelesaikan soal baru di LKPD dengan angka yang tidak bulat mudah ditebak.
* **Fase 6: Menarik Kesimpulan (Generalization)**
  - Siswa merumuskan langkah baku metode eliminasi (menyamakan koefisien lalu mengurangkan/menambahkan) dan metode substitusi.

###### 3. Penutup (10 Menit)
* Guru bersama siswa merangkum langkah-langkah penyelesaian SPLDV.
* Siswa melakukan evaluasi mandiri (kuis keluar tiket).
* Doa penutup kelas.

---

#### III. ASESMEN & REFLEKSI
* **Formatif:** Keaktifan diskusi kelompok saat memanipulasi variabel aljabar di LKPD.
* **Sumatif:** Pengerjaan tes uraian 2 soal cerita SPLDV di akhir sub-bab.`,
    quiz: `### INSTRUMEN EVALUASI & KUIS INTERAKTIF
**Topik:** SPLDV (Matematika Kelas 8)

#### SOAL ESSAY & KUNCI JAWABAN

**Soal 1 (Kontekstual - Harga Tiket)**
Di sebuah bioskop mini, harga tiket masuk untuk 3 orang dewasa dan 2 anak-anak adalah Rp 165.000. Sedangkan harga tiket untuk 2 orang dewasa dan 4 anak-anak adalah Rp 170.000.
A. Buatlah model matematika (SPLDV) dari masalah tersebut!
B. Tentukan harga tiket satu orang dewasa dan satu anak-anak!

**Kunci Jawaban & Pembahasan:**
* **Langkah A: Model Matematika**
  - Misalkan harga tiket dewasa = $x$ rupiah, dan harga tiket anak-anak = $y$ rupiah.
  - Persamaan 1: $3x + 2y = 165.000$
  - Persamaan 2: $2x + 4y = 170.000$ (bisa disederhanakan menjadi $x + 2y = 85.000$)

* **Langkah B: Penyelesaian Sistem Persamaan**
  Menggunakan metode substitusi dari persamaan 2 disederhanakan:
  - $x = 85.000 - 2y$
  
  Substitusikan nilai $x$ ini ke Persamaan 1:
  - $3(85.000 - 2y) + 2y = 165.000$
  - $255.000 - 6y + 2y = 165.000$
  - $255.000 - 4y = 165.000$
  - $4y = 255.000 - 165.000$
  - $4y = 90.000 \Rightarrow y = 22.500$
  
  Cari nilai $x$ dengan mensubstitusi kembali nilai $y$:
  - $x = 85.000 - 2(22.500)$
  - $x = 85.000 - 45.000 \Rightarrow x = 40.000$
  
* **Kesimpulan:**
  - Harga tiket dewasa ($x$) adalah **Rp 40.000** per orang.
  - Harga tiket anak-anak ($y$) adalah **Rp 22.500** per anak.`,
    activities: `### AKTIVITAS PEMBELAJARAN KREATIF & ICEBREAKER
**Topik:** SPLDV (Matematika Kelas 8)

#### 1. Aktivitas "Pasar Kaget Aljabar" (Simulasi Belanja Nyata)
* **Durasi:** 30 Menit
* **Peralatan:** Plastisin, buah mainan, kantong kertas, pulpen kertas.
* **Langkah-langkah:**
  1. Guru mendirikan dua toko mini di dalam kelas yang dikelola oleh asisten guru (atau siswa perwakilan).
  2. Di Toko A, siswa hanya bisa membeli dalam paket: "Paket Apel Jeruk" (3 Apel + 2 Jeruk seharga Rp 21.000).
  3. Di Toko B, ada "Paket Jus Segar" (1 Apel + 2 Jeruk seharga Rp 11.000).
  4. Setiap kelompok siswa berperan sebagai "Detektif Ekonomi" yang dilarang bertanya harga eceran. Tugas mereka adalah menghitung harga eceran 1 buah Apel dan 1 buah Jeruk menggunakan manipulasi "aljabar fisik" (membandingkan isi kantong belanjaan secara fisik).
  5. Kelompok yang berhasil menebak dengan hitungan aljabar tertulis yang runtut paling cepat berhak mendapatkan gelar "Ahli Analisis Pasar" dan snack ringan.
  6. Aktivitas ini mengubah matematika abstrak yang ditakuti menjadi permainan taktil-visual yang kontekstual.`,
    differentiation: `### MATERI AJAR TERDIFERENSIASI (KURIKULUM MERDEKA)
**Mata Pelajaran:** Matematika Kelas 8
**Topik:** SPLDV (Metode Eliminasi)

---

#### Kelompok A: BELUM PAHAM (Butuh Pendampingan Khusus)
* **Fokus Utama:** Menyelesaikan SPLDV yang salah satu variabelnya sudah memiliki koefisien sama (tinggal tambah atau kurang).
* **Materi:**
  - Jika kamu punya persamaan:
    1. $x + y = 10$
    2. $x - y = 4$
  - Perhatikan huruf $y$ pada persamaan 1 bermuatan positif ($+y$), sedangkan pada persamaan 2 bernuatan negatif ($-y$).
  - Jika kita menjumlahkan kedua persamaan ini, huruf $y$ akan saling menghilangkan (habis):
    - $(x + x) + (y - y) = 10 + 4$
    - $2x = 14 \Rightarrow x = 7$.
  - Sekarang masukkan angka $x=7$ ke persamaan pertama:
    - $7 + y = 10 \Rightarrow y = 3$.
* **Latihan:** Selesaikan $2x + y = 8$ dan $x - y = 1$. (Perhatikan $+y$ dan $-y$ dapat dicoret langsung jika dijumlahkan).

---

#### Kelompok B: PAHAM SEBAGIAN (Sesuai Target Pembelajaran)
* **Fokus Utama:** Menyelesaikan SPLDV yang koefisien variabelnya berbeda, sehingga harus dikalikan silang dahulu untuk menyamakannya.
* **Materi:**
  - Persamaan:
    1. $2x + y = 8$ (Persamaan 1)
    2. $x + 2y = 7$ (Persamaan 2)
  - Kita ingin menghilangkan $x$. Kalikan persamaan 1 dengan 1, kalikan persamaan 2 dengan 2 agar koefisien $x$ sama-sama menjadi 2:
    - Persamaan 1 (x1): $2x + y = 8$
    - Persamaan 2 (x2): $2x + 4y = 14$
  - Kurangkan kedua hasil di atas:
    - $(2x - 2x) + (y - 4y) = 8 - 14$
    - $-3y = -6 \Rightarrow y = 2$.
  - Substitusi $y = 2$ ke $x + 2(2) = 7 \Rightarrow x = 3$.
* **Latihan:** Selesaikan $3x + 2y = 12$ dan $x + y = 5$.

---

#### Kelompok C: PAHAM UTUH (Pengayaan)
* **Fokus Utama:** Memecahkan SPLDV berkoefisien pecahan, desimal, atau memecahkan sistem persamaan non-linear yang dapat ditransformasikan ke SPLDV.
* **Materi Kasus:**
  - Selesaikan sistem persamaan berikut:
    - $\frac{2}{x} + \frac{3}{y} = 12$
    - $\frac{1}{x} - \frac{2}{y} = -1$
  - **Petunjuk Pengayaan:** Lakukan permisalan variabel baru. Misalkan $a = \frac{1}{x}$ dan $b = \frac{1}{y}$.
  - Maka sistem berubah menjadi SPLDV linear murni:
    - $2a + 3b = 12$
    - $a - 2b = -1$
  - Selesaikan untuk menemukan $a$ dan $b$, kemudian balikkan nilai pecahan untuk mendapatkan nilai $x$ dan $y$.
* **Latihan:** Tuntaskan persamaan di atas hingga mendapatkan koordinat $(x,y)$ yang presisi!`
  }
};
