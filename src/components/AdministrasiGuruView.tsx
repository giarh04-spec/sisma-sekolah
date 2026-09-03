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
  GraduationCap,
  Trash2,
  FolderOpen,
  RefreshCw,
  RotateCcw,
  Copy
} from 'lucide-react';
import { AdministrasiGuru, TipeAdministrasi, Role, Guru, MataPelajaranItem, RombelKelas, AdministrasiSubTab, Siswa, AbsensiSiswaKelas, SchoolSettings, ModulAjarContent } from '../types/school';
import { dbSaveCollection, dbDeleteItem, dbClearCollection } from '../lib/firebaseSync';
import { JadwalMengajar } from './administrasi/JadwalMengajar';
import { KalenderPendidikan } from './administrasi/KalenderPendidikan';
import { JurnalGuru } from './administrasi/JurnalGuru';
import { RekapJurnal } from './administrasi/RekapJurnal';
import { ModulAjarEditor } from './administrasi/ModulAjarEditor';

interface AdministrasiGuruViewProps {
  administrasiList: AdministrasiGuru[];
  setAdministrasiList: React.Dispatch<React.SetStateAction<AdministrasiGuru[]>>;
  currentRole?: Role;
  userEmail?: string;
  guruList?: Guru[];
  mapelList?: MataPelajaranItem[];
  rombelList?: RombelKelas[];
  siswaList?: Siswa[];
  absensiKelasList?: AbsensiSiswaKelas[];
  setAbsensiKelasList?: React.Dispatch<React.SetStateAction<AbsensiSiswaKelas[]>>;
  subTab?: AdministrasiSubTab;
  setSubTab?: (subTab: AdministrasiSubTab) => void;
  userGoogleToken?: string;
  schoolSettings?: SchoolSettings;
  absensiHarian?: any[];
  stafList?: any[];
}

export function generateModulAjarTemplateText(
  mapel: string, 
  kelas: string, 
  topik: string,
  namaPenyusun: string = 'Aulia Safitri, S.Pd',
  namaKepalaSekolah: string = 'Deni Rahmat, S.Sos.I',
  nipKepalaSekolah: string = '19820412 200801 1 003',
  nipPenyusun: string = '19900524 201503 2 004'
) {
  const normalizedMapel = mapel ? mapel.toLowerCase() : '';
  let defaultTopik = topik;
  let kompetensiAwal = '';
  let tujuanPembelajaran = '';
  let pemahamanBermakna = '';
  let pertanyaanPemantik = '';
  let kegiatanInti = '';
  let integrasiNilai = '';

  if (normalizedMapel.includes('indonesia')) {
    defaultTopik = topik || 'Teks Deskripsi';
    kompetensiAwal = 'Peserta didik telah memahami konsep dasar paragraf dan mampu mengidentifikasi ide pokok dari sebuah bacaan sederhana. Murid juga telah terbiasa menulis kalimat sederhana secara mandiri.';
    tujuanPembelajaran = '1. Mengidentifikasi ciri-ciri dan struktur teks deskripsi secara tepat.\n2. Menganalisis perbedaan teks deskripsi dengan teks lainnya secara bernalar kritis.\n3. Menyusun teks deskripsi tertulis secara mandiri dengan adab berbahasa santun.';
    pemahamanBermakna = 'Keterampilan mendeskripsikan objek secara detail membantu kita mengomunikasikan keindahan ciptaan Allah dan menyampaikan informasi secara informatif kepada orang lain.';
    pertanyaanPemantik = '1. Pernahkah kamu menceritakan keindahan tempat liburanmu kepada temanmu hingga dia sangat ingin ke sana?\n2. Bagaimana cara terbaik menggambarkan suatu benda agar orang lain bisa langsung membayangkannya?';
    kegiatanInti = '1. Murid membaca contoh teks deskripsi keindahan lingkungan sekolah Al Fakhir.\n2. Murid berkelompok mengamati objek sekitar sekolah (taman, perpustakaan, atau masjid).\n3. Murid berdiskusi menyusun mind map/peta konsep deskripsi objek tersebut.\n4. Murid menyusun draf teks deskripsi bersama kelompok dengan ejaan yang disempurnakan.\n5. Presentasi hasil karya kelompok di depan kelas dan saling memberi umpan balik santun.';
    integrasiNilai = 'QS. Al-Hujurat (49): 13 (Saling mengenal dan menghargai keragaman serta keindahan ciptaan Allah SWT).';
  } else if (normalizedMapel.includes('matematika')) {
    defaultTopik = topik || 'Aritmetika Sosial';
    kompetensiAwal = 'Peserta didik telah memahami operasi hitung bilangan bulat, pecahan, serta konsep persen sederhana yang diperoleh dari jenjang SD.';
    tujuanPembelajaran = '1. Menentukan harga pembelian, harga penjualan, untung, atau rugi dari sebuah transaksi.\n2. Menghitung persentase untung, rugi, atau diskon secara akurat.\n3. Memecahkan masalah nyata aritmetika sosial dengan mengintegrasikan nilai kejujuran.';
    pemahamanBermakna = 'Memahami aritmetika sosial membekali kita untuk bertransaksi secara jujur, adil, serta mampu mengelola keuangan pribadi sesuai dengan syariat Islam.';
    pertanyaanPemantik = '1. Pernahkah kamu membantu orang tuamu berjualan atau membeli sesuatu dan menghitung kembaliannya?\n2. Mengapa seorang pedagang harus jujur dalam menimbang barang dagangannya?';
    kegiatanInti = '1. Murid menyimak simulasi jual-beli interaktif di kelas.\n2. Murid berkelompok menganalisis studi kasus transaksi pasar dan diskon barang.\n3. Murid berdiskusi menghitung harga beli, harga jual, untung, rugi, dan diskon wajar.\n4. Murid mengerjakan lembar kerja kolaboratif tentang persentase untung/rugi.\n5. Presentasi hasil diskusi kelompok dan evaluasi bersama guru.';
    integrasiNilai = 'QS. An-Nisa (4): 29 (Jual beli suka sama suka), QS. Al-Muthaffifin: 1-3 (Kejujuran timbangan).';
  } else if (normalizedMapel.includes('ipa') || normalizedMapel.includes('alam')) {
    defaultTopik = topik || 'Struktur Sel dan Mikroskop';
    kompetensiAwal = 'Peserta didik telah memahami konsep makhluk hidup dan benda mati, serta memiliki rasa ingin tahu tinggi terhadap fenomena alam di sekitar mereka.';
    tujuanPembelajaran = '1. Mengidentifikasi bagian-bagian mikroskop dan fungsinya secara tepat.\n2. Menjelaskan perbedaan sel hewan dan sel tumbuhan menggunakan diagram.\n3. Melakukan pengamatan preparat sel secara kolaboratif.';
    pemahamanBermakna = 'Mempelajari sel menyadarkan kita akan betapa rapi dan dahsyatnya ciptaan Allah bahkan pada tingkat mikroskopis yang paling kecil sekalipun.';
    pertanyaanPemantik = '1. Tubuh kita sangat besar, menurutmu terbuat dari apakah bagian terkecil tubuh kita?\n2. Mengapa kita memerlukan mikroskop untuk melihat kuman atau bakteri?';
    kegiatanInti = '1. Guru mendemonstrasikan bagian-bagian mikroskop dan cara fokusnya.\n2. Murid dibagi dalam kelompok praktikum untuk mengamati preparat bawang merah.\n3. Murid berdiskusi mengidentifikasi dinding sel dan inti sel.\n4. Murid menggambar hasil pengamatan mereka di lembar kerja siswa.\n5. Diskusi kelas mengenai perbedaan sel tumbuhan dan sel hewan serta fungsinya.';
    integrasiNilai = 'QS. Al-Furqan (25): 2 (Allah menciptakan segala sesuatu dengan ukuran yang rapi dan detail).';
  } else if (normalizedMapel.includes('ips') || normalizedMapel.includes('sosial')) {
    defaultTopik = topik || 'Interaksi Sosial';
    kompetensiAwal = 'Peserta didik telah memahami lingkungan sosial terdekat mereka (keluarga dan tetangga) serta bentuk-bentuk interaksi sederhana.';
    tujuanPembelajaran = '1. Menjelaskan pengertian interaksi sosial dan syarat-syarat terjadinya.\n2. Menganalisis bentuk-bentuk interaksi sosial (asosiatif & disosiatif) di masyarakat.\n3. Menyajikan laporan hasil observasi interaksi sosial di lingkungan sekolah.';
    pemahamanBermakna = 'Manusia adalah makhluk sosial yang selalu membutuhkan interaksi dengan orang lain; interaksi yang positif akan melahirkan keharmonisan dan kedamaian.';
    pertanyaanPemantik = '1. Apa yang terjadi jika kita hidup sendirian di hutan tanpa pernah bertemu manusia lain?\n2. Bagaimana cara kalian menyapa teman baru di kelas agar terjalin hubungan yang akrab?';
    kegiatanInti = '1. Murid mengamati gambar situasi interaksi sosial di kelas dan di pasar.\n2. Murid mendiskusikan syarat interaksi sosial (kontak sosial & komunikasi).\n3. Murid bermain peran (role play) situasi interaksi sosial asosiatif (gotong royong).\n4. Murid menganalisis kasus konflik sederhana sebagai bentuk disosiatif.\n5. Refleksi bersama mengenai cara berinteraksi yang santun dan menjunjung adab.';
    integrasiNilai = 'QS. Ali Imran (3): 103 (Pentingnya menjaga persatuan, silaturahmi, dan tali persaudaraan).';
  } else if (normalizedMapel.includes('inggris')) {
    defaultTopik = topik || 'Describing People';
    kompetensiAwal = 'Peserta didik telah menguasai kosakata dasar (basic adjectives and nouns) dan mampu memperkenalkan diri secara sederhana.';
    tujuanPembelajaran = '1. Identify common adjectives to describe people\'s physical appearance and character.\n2. Write simple descriptive paragraphs about a person with correct grammar.\n3. Present oral description about a family member clearly and confidently.';
    pemahamanBermakna = 'Describing others allows us to appreciate differences in physical appearances and personality, helping us to connect better globally and show respect.';
    pertanyaanPemantik = '1. Look at your friend. How would you describe his/her hair and eyes?\n2. Is physical appearance more important than personality? Why?';
    kegiatanInti = '1. Students learn physical appearance vocabulary (tall, short, curly, smart) using visual cards.\n2. In pairs, students describe each other\'s physical features in English.\n3. Students read a sample descriptive text about a famous inspiring figure.\n4. Students write a short paragraph describing their favorite teacher or parents.\n5. Peer-review session with partners and oral reading of the description.';
    integrasiNilai = 'HR. Bukhari (Berkata baik atau diam / Speak good words or keep silent).';
  } else if (normalizedMapel.includes('informatika') || normalizedMapel.includes('komputer')) {
    defaultTopik = topik || 'Berpikir Komputasional';
    kompetensiAwal = 'Peserta didik telah terbiasa menggunakan gawai untuk komunikasi dasar dan mampu mengoperasikan komputer sederhana.';
    tujuanPembelajaran = '1. Menjelaskan konsep berpikir komputasional dan empat pilar utamanya.\n2. Merancang langkah-langkah algoritma sederhana untuk menyelesaikan masalah harian.\n3. Menguji kebenaran alur algoritma secara sistematis.';
    pemahamanBermakna = 'Berpikir komputasional melatih otak kita untuk memecahkan masalah besar secara logis, terstruktur, dan efisien.';
    pertanyaanPemantik = '1. Bagaimana cara kalian merencanakan rute tercepat untuk pergi ke sekolah setiap pagi?\n2. Apakah komputer bisa menyelesaikan masalah tanpa instruksi manusia?';
    kegiatanInti = '1. Guru membagikan teka-teki logika sederhana kepada kelas.\n2. Murid berkelompok menganalisis teka-teki menggunakan prinsip dekomposisi.\n3. Murid merancang urutan langkah (algoritma) pemecahan teka-teki tersebut.\n4. Murid mempresentasikan alur pemikiran algoritma mereka.\n5. Guru memberikan penguatan konsep Berpikir Komputasional dan relevansinya.';
    integrasiNilai = 'Pentingnya memanfaatkan teknologi untuk kemaslahatan umat dan menghindari tabzir waktu (menyia-nyiakan waktu secara sia-sia).';
  } else if (normalizedMapel.includes('agama') || normalizedMapel.includes('pai')) {
    defaultTopik = topik || 'Adab Bergaul dan Toleransi';
    kompetensiAwal = 'Peserta didik telah memahami rukun Islam dan rukun Iman serta terbiasa melakukan ibadah wajib secara mandiri.';
    tujuanPembelajaran = '1. Menjelaskan pentingnya adab bergaul dan toleransi dalam Islam.\n2. Menganalisis dalil-dalil Al-Qur\'an terkait toleransi secara mendalam.\n3. Mensimulasikan sikap saling menghargai perbedaan di lingkungan sekolah.';
    pemahamanBermakna = 'Penerapan adab bergaul yang Islami menciptakan ukhuwah islamiyah dan lingkungan yang damai, harmonis, serta mendapat berkah Allah SWT.';
    pertanyaanPemantik = '1. Bagaimana perasaanmu ketika ada orang yang tidak mendengarkan pendapatmu?\n2. Mengapa Rasulullah SAW sangat dihormati bahkan oleh orang-orang yang berbeda keyakinan?';
    kegiatanInti = '1. Murid menyimak kisah keteladanan toleransi Rasulullah SAW di Madinah.\n2. Murid berkelompok mendiskusikan QS. Al-Hujurat ayat 10 dan adab bergaul.\n3. Murid berdiskusi merancang simulasi penyelesaian konflik pertemanan di sekolah.\n4. Kelompok mensimulasikan adab bergaul yang santun di depan kelas.\n5. Guru memberikan kesimpulan akhlakul karimah dan doa ukhuwah.';
    integrasiNilai = 'QS. Al-Kafirun ayat 1-6 (Toleransi beragama), QS. Al-Hujurat ayat 10 (Persaudaraan sesama muslim).';
  } else if (normalizedMapel.includes('pancasila') || normalizedMapel.includes('pkn')) {
    defaultTopik = topik || 'Penerapan Nilai-Nilai Pancasila';
    kompetensiAwal = 'Peserta didik telah mengenal dasar negara Pancasila dan terbiasa melaksanakan musyawarah sederhana di keluarga.';
    tujuanPembelajaran = '1. Menjelaskan nilai-nilai yang terkandung dalam setiap sila Pancasila.\n2. Menganalisis contoh penerapan nilai Pancasila dalam kehidupan sehari-hari.\n3. Berpartisipasi aktif dalam pengambilan keputusan kelas melalui musyawarah.';
    pemahamanBermakna = 'Pancasila bukan sekadar hafalan, melainkan panduan moral kita untuk bersikap adil, rukun, menghargai sesama, dan toleran dalam bermasyarakat.';
    pertanyaanPemantik = '1. Mengapa di kelas kita perlu membuat kesepakatan bersama?\n2. Bagaimana sikapmu jika keputusan rapat kelas berbeda dengan pendapat pribadimu?';
    kegiatanInti = '1. Murid mengamati video penerapan nilai Pancasila dalam keseharian.\n2. Murid berdiskusi kelompok mengidentifikasi adab musyawarah yang baik.\n3. Murid merumuskan contoh penerapan sila Pancasila dalam bentuk poster.\n4. Presentasi poster hasil karya kelompok di depan kelas.\n5. Penyusunan kesepakatan adab kelas bersama-sama.';
    integrasiNilai = 'Prinsip Syura (Musyawarah) dalam Islam sesuai tuntunan QS. Asy-Syura (42): 38.';
  } else if (normalizedMapel.includes('seni') || normalizedMapel.includes('budaya')) {
    defaultTopik = topik || 'Ragam Hias Geometris';
    kompetensiAwal = 'Peserta didik menyukai aktivitas seni visual dan mampu mengenali berbagai bentuk geometris sederhana.';
    tujuanPembelajaran = '1. Menjelaskan pengertian dan jenis-jenis ragam hias geometris.\n2. Merancang pola gambar ragam hias geometris pada kertas gambar secara presisi.\n3. Mewarnai karya ragam hias dengan kombinasi warna yang estetis.';
    pemahamanBermakna = 'Seni menggambar mengekspresikan rasa syukur kita atas keindahan alam ciptaan Allah serta melatih kepekaan estetika diri.';
    pertanyaanPemantik = '1. Pernahkah kamu melihat motif batik di bajumu? Bentuk geometri apa saja yang ada di sana?\n2. Bagaimana warna bisa mengubah perasaan seseorang yang melihat sebuah lukisan?';
    kegiatanInti = '1. Guru menampilkan berbagai contoh pola ragam hias geometris nusantara.\n2. Murid menggambar sketsa pola geometris dasar menggunakan penggaris dan jangka.\n3. Murid berdiskusi menentukan skema kombinasi warna kontras dan harmonis.\n4. Murid mewarnai sketsa secara teliti, rapi, dan sabar.\n5. Gallery Walk: memajang karya di dinding kelas dan saling memberi penilaian positif.';
    integrasiNilai = 'Keindahan adalah bagian dari ciptaan Allah SWT (HR. Muslim: "Sesungguhnya Allah itu indah dan menyukai keindahan").';
  } else if (normalizedMapel.includes('jasmani') || normalizedMapel.includes('pjok') || normalizedMapel.includes('olahraga')) {
    defaultTopik = topik || 'Kebugaran Jasmani';
    kompetensiAwal = 'Peserta didik memiliki energi fisik yang baik dan menyukai aktivitas olahraga, serta memahami cara menjaga kesehatan secara umum.';
    tujuanPembelajaran = '1. Menjelaskan konsep dan komponen kebugaran jasmani terkait kesehatan jantung.\n2. Melakukan rangkaian latihan fisik untuk melatih kekuatan dan daya tahan tubuh.\n3. Menunjukkan sikap sportivitas, disiplin, dan gotong royong selama aktivitas fisik.';
    pemahamanBermakna = 'Menjaga kebugaran jasmani adalah bentuk rasa syukur atas amanah fisik yang diberikan Allah agar kita senantiasa kuat beribadah dan berkarya.';
    pertanyaanPemantik = '1. Mengapa tubuh kita terasa segar setelah berolahraga secara teratur?\n2. Apa perbedaan antara lelah biasa dengan sesak napas saat beraktivitas fisik?';
    kegiatanInti = '1. Murid melakukan pemanasan dinamis yang dipimpin oleh ketua kelas.\n2. Guru mencontohkan teknik pengukuran denyut nadi sebelum latihan fisik.\n3. Murid melakukan latihan sirkuit (circuit training: push up, sit up, shuttle run).\n4. Murid berpasangan mengukur kembali denyut nadi pasca-latihan sirkuit.\n5. Pendinginan dan evaluasi teknik menjaga daya tahan jantung serta paru.';
    integrasiNilai = 'HR. Muslim: "Mukmin yang kuat lebih dicintai Allah SWT daripada mukmin yang lemah".';
  } else {
    defaultTopik = topik || 'Konsep Dasar & Pembelajaran';
    kompetensiAwal = 'Peserta didik memiliki pengetahuan dasar tentang materi pokok yang akan dibahas dan siap mengembangkan kompetensi barunya.';
    tujuanPembelajaran = '1. Memahami konsep utama dari materi pokok secara mendalam.\n2. Mengaplikasikan kompetensi dasar untuk menyelesaikan masalah sederhana.\n3. Merancang produk kreatif atau hasil karya terkait materi pembelajaran.';
    pemahamanBermakna = 'Penguasaan konsep ini memampukan kita menghadapi tantangan nyata sehari-hari dengan bijak dan bersikap solutif.';
    pertanyaanPemantik = '1. Pernahkah Anda menjumpai masalah yang berhubungan dengan materi ini dalam kehidupan sehari-hari?\n2. Mengapa penting bagi kita untuk mempelajari konsep ini sekarang?';
    kegiatanInti = '1. Murid mengamati materi pemicu yang disajikan oleh guru.\n2. Murid berkelompok mendiskusikan solusi pemecahan masalah nyata.\n3. Murid merancang draf laporan atau karya kolaboratif terkait materi.\n4. Presentasi hasil karya kelompok di hadapan kelas untuk didiskusikan.\n5. Penilaian sejawat dan umpan balik konstruktif dari guru.';
    integrasiNilai = 'Menggunakan ilmu pengetahuan untuk memberikan manfaat nyata bagi sesama (Rahmatan lil \'Alamin).';
  }

  return `MODUL AJAR (RPP PLUS)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

A. INFORMASI UMUM
Nama Penyusun      : ${namaPenyusun}
Nama Sekolah       : SMP Islam Modern Al Fakhir
Mata Pelajaran     : ${mapel}
Fase/Kelas         : D / ${kelas || 'VII'}
Semester           : I (Ganjil)
Tahun Ajaran       : 2026/2027
Alokasi Waktu      : 2 x 40 Menit (2 Pertemuan)
Materi Pokok       : ${defaultTopik}

B. KOMPETENSI AWAL
${kompetensiAwal}

C. PROFIL PELAJAR PANCASILA (YANG DITUJU)
1. Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia (menerapkan kejujuran dan adab Islami selama pembelajaran)
2. Bernalar Kritis (menganalisis masalah dan merancang solusi secara logis)
3. Mandiri (bertanggung jawab atas proses dan hasil belajarnya)
4. Gotong Royong (berkolaborasi aktif dalam kelompok diskusi)

D. SARANA DAN PRASARANA
1. Sarana: Laptop, LCD Proyektor, Jaringan Internet, Buku Paket Pendukung, Media Gambar Kontekstual.
2. Prasarana: Ruang Kelas, Lingkungan Sekolah, Perpustakaan, atau Laboratorium Terkait.

E. TARGET PESERSA DIDIK
Reguler (Siswa umum tanpa kesulitan belajar khusus / 28 Siswa)

F. MODEL PEMBELAJARAN
Problem Based Learning (PBL) secara tatap muka (luring)

G. TUJUAN PEMBELAJARAN
${tujuanPembelajaran}

H. PEMAHAMAN BERMAKNA
${pemahamanBermakna}

I. PERTANYAAN PEMANTIK
${pertanyaanPemantik}

J. KEGIATAN PEMBELAJARAN
1. Pendahuluan (10 Menit):
Salam, berdoa bersama dipimpin murid secara bergantian, presensi kelas, apersepsi mengaitkan materi dengan kehidupan nyata atau kisah adab Islami, penyampaian tujuan pembelajaran, serta melontarkan pertanyaan pemantik.

2. Kegiatan Inti (60 Menit):
${kegiatanInti}

3. Penutup (10 Menit):
Refleksi bersama "Apa yang paling berkesan hari ini?", merumuskan kesimpulan materi secara kolaboratif, pengumuman tindak lanjut (tugas mandiri/bacaan), doa penutup majelis, dan salam.

K. ASESMEN
1. Asesmen Diagnostik (Non-Kognitif): Kuesioner minat belajar siswa dan kesiapan awal.
2. Asesmen Formatif: Observasi keaktifan diskusi, kualitas kerjasama tim, dan ketepatan pengisian LKPD kelompok.
3. Asesmen Sumatif: Penilaian produk/laporan hasil karya mandiri berlandaskan rubrik penilaian baku.
Teknik Asesmen: Observasi dan Tes Tertulis/Performa
Instrumen Asesmen: Lembar Pengamatan & Soal Esai Evaluatif

L. DIFERENSIASI PEMBELAJARAN
1. Diferensiasi Konten: Menyediakan bahan bacaan pendukung dengan tingkat kerumitan bervariasi (termasuk media visual/kartu gambar untuk siswa pendampingan khusus).
2. Diferensiasi Proses: Menyediakan bimbingan terfokus (scaffolding) untuk kelompok murid yang membutuhkan bantuan lebih, serta tutor sebaya untuk kelompok cakap.
3. Diferensiasi Produk: Membebaskan siswa memilih format penyajian hasil karya (tulisan, infografis/poster, atau presentasi lisan).

M. REMEDIAL
Pembelajaran ulang konsep inti secara interaktif, pendampingan khusus guru, penyederhanaan latihan soal cerita, dan bantuan tutor sebaya.

N. PENGAYAAN
Pemberian studi kasus kontekstual berskala lebih luas, tugas analisis kritis mandiri, atau penugasan memimpin diskusi kelompok sebaya.

O. REFLEKSI GURU
1. Apakah 100% siswa mencapai target tujuan pembelajaran?
2. Apa kendala utama yang dijumpai selama pembelajaran hari ini?
3. Langkah inovatif apa yang dapat diterapkan pada pertemuan selanjutnya untuk hasil yang lebih baik?

P. REFLEKSI PESERTA DIDIK
1. Bagian pembelajaran mana yang paling membuatmu tertarik hari ini? Mengapa?
2. Apakah ada konsep atau penjelasan yang masih membingungkanmu?
3. Sikap baik/adab apa yang berhasil kamu latih dan terapkan hari ini selama berkolaborasi?

Q. LAMPIRAN
1. Lembar Kerja Peserta Didik (LKPD) mandiri & kelompok.
2. Rubrik Penilaian Portofolio/Performa Hasil Karya.
3. Bahan Bacaan Guru & Peserta Didik terkait materi pokok.
4. Integrasi Nilai Islami: ${integrasiNilai}
5. Daftar Pustaka Pendukung Kurikulum Merdeka.

Sawangan, ...................... 2027
Mengetahui,

Kepala Sekolah                               Guru Mata Pelajaran


${namaKepalaSekolah.padEnd(45, ' ')}${namaPenyusun}
NIP: ${nipKepalaSekolah.padEnd(40, ' ')}NIP: ${nipPenyusun}`;
}

export const AdministrasiGuruView: React.FC<AdministrasiGuruViewProps> = ({
  administrasiList,
  setAdministrasiList,
  currentRole = 'admin',
  userEmail = '',
  guruList = [],
  mapelList = [],
  rombelList = [],
  siswaList = [],
  absensiKelasList = [],
  setAbsensiKelasList = () => {},
  subTab,
  setSubTab,
  userGoogleToken,
  schoolSettings,
  absensiHarian = [],
  stafList = []
}) => {
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [localSubTab, setLocalSubTab] = useState<AdministrasiSubTab>('perangkat' as any);
  
  const activeSubTab = subTab || localSubTab;
  const setActiveSubTab = (t: AdministrasiSubTab) => {
    if (setSubTab) setSubTab(t);
    setLocalSubTab(t);
  };

  const availableMapelList = React.useMemo(() => {
    const set = new Set<string>();
    mapelList.forEach(m => {
      const name = m.namaMapel || (m as any).nama;
      if (name && typeof name === 'string' && name.trim()) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [mapelList]);

  // Find active teacher based on email or default
  const activeTeacher = guruList.find(g => g.email.toLowerCase() === userEmail.toLowerCase());
  const fallbackMapel = availableMapelList.length > 0 ? availableMapelList[0] : 'Umum';
  const initialMapel = activeTeacher?.mataPelajaran || (userEmail.includes('guru.ahmad') ? fallbackMapel : currentRole === 'guru' ? fallbackMapel : 'Semua');

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
      nama: teacher ? teacher.nama : '',
      nip: teacher ? (teacher.nip || '') : ''
    };
  };

  useEffect(() => {
    if (currentRole === 'guru' && selectedMapelFilter === 'Semua') {
      setSelectedMapelFilter(initialMapel);
    }
  }, [currentRole, userEmail]);

  // AI Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isModulEditorOpen, setIsModulEditorOpen] = useState(false);
  const [aiTipe, setAiTipe] = useState<TipeAdministrasi>('modul_ajar');
  const [aiMapel, setAiMapel] = useState(selectedMapelFilter !== 'Semua' ? selectedMapelFilter : fallbackMapel);
  const [aiKelas, setAiKelas] = useState('VII');
  const [aiTopik, setAiTopik] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (selectedMapelFilter !== 'Semua') {
      setAiMapel(selectedMapelFilter);
    }
  }, [selectedMapelFilter]);

  // Workspace States
  const [workspaceMapel, setWorkspaceMapel] = useState<string>(selectedMapelFilter !== 'Semua' ? selectedMapelFilter : (availableMapelList[0] || 'Bahasa Indonesia'));
  const [workspaceTipe, setWorkspaceTipe] = useState<TipeAdministrasi>(
    ['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab as any) 
      ? (activeSubTab as TipeAdministrasi) 
      : 'modul_ajar'
  );
  const [workspaceKelas, setWorkspaceKelas] = useState<string>('Kelas VII (SMP)');
  const [workspaceFase, setWorkspaceFase] = useState<string>('Fase D (Kelas 7-9 SMP)');
  const [workspaceText, setWorkspaceText] = useState<string>('');
  const [activeWorkspaceDocId, setActiveWorkspaceDocId] = useState<string | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>('');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState<boolean>(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [customDocTitle, setCustomDocTitle] = useState<string>('');
  const [isSaveAsNew, setIsSaveAsNew] = useState<boolean>(false);

  // Auto-dismiss save notification after 3.5s
  useEffect(() => {
    if (saveSuccessNotification) {
      const timer = setTimeout(() => {
        setSaveSuccessNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccessNotification]);

  // Sync workspaceMapel with selectedMapelFilter when it changes and is not 'Semua'
  useEffect(() => {
    if (selectedMapelFilter !== 'Semua') {
      setWorkspaceMapel(selectedMapelFilter);
    }
  }, [selectedMapelFilter]);

  // Sync workspaceTipe with activeSubTab
  useEffect(() => {
    if (['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab as any)) {
      setWorkspaceTipe(activeSubTab as TipeAdministrasi);
    }
  }, [activeSubTab]);

  const getWorkspaceTemplateText = (
    tipe: TipeAdministrasi,
    mapel: string,
    kelas: string,
    fase: string
  ) => {
    const teacherInfo = getTemplateTeacherInfo(mapel);
    const teacherName = teacherInfo.nama || activeTeacher?.nama || 'Aulia Safitri, S.Pd';
    const principalNameVal = principalName;
    const principalNipVal = principalNip;
    const teacherNip = teacherInfo.nip || '19900524 201503 2 004';

    if (tipe === 'modul_ajar') {
      const normalizedMapel = mapel ? mapel.toLowerCase() : '';
      let defaultTopic = 'Aritmetika Sosial';
      if (normalizedMapel.includes('indonesia')) defaultTopic = 'Teks Deskripsi';
      else if (normalizedMapel.includes('ipa') || normalizedMapel.includes('alam')) defaultTopic = 'Struktur Sel dan Mikroskop';
      else if (normalizedMapel.includes('ips') || normalizedMapel.includes('sosial')) defaultTopic = 'Interaksi Sosial';
      else if (normalizedMapel.includes('inggris')) defaultTopic = 'Describing People';
      else if (normalizedMapel.includes('informatika') || normalizedMapel.includes('komputer')) defaultTopic = 'Berpikir Komputasional';
      else if (normalizedMapel.includes('agama') || normalizedMapel.includes('pai')) defaultTopic = 'Adab Bergaul dan Toleransi';
      else if (normalizedMapel.includes('pancasila') || normalizedMapel.includes('pkn')) defaultTopic = 'Penerapan Nilai-Nilai Pancasila';
      else if (normalizedMapel.includes('seni') || normalizedMapel.includes('budaya')) defaultTopic = 'Ragam Hias Geometris';
      else if (normalizedMapel.includes('jasmani') || normalizedMapel.includes('pjok') || normalizedMapel.includes('olahraga')) defaultTopic = 'Kebugaran Jasmani';

      return generateModulAjarTemplateText(mapel, kelas, defaultTopic, teacherName, principalNameVal, principalNipVal, teacherNip);
    } else if (tipe === 'atp') {
      return `ALUR TUJUAN PEMBELAJARAN (ATP)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

Mata Pelajaran : ${mapel}
Kelas          : ${kelas}
Fase           : ${fase || 'Fase D'}
Penyusun       : ${teacherName}

A. CAPAIAN PEMBELAJARAN (CP)
Peserta didik mampu menganalisis, mengevaluasi, dan menyelesaikan permasalahan nyata terkait bidang studi ${mapel} secara kolaboratif, kreatif, dan mandiri, selaras dengan penumbuhan karakter Profil Pelajar Pancasila dan pembiasaan adab Islami.

B. ALUR DAN TUJUAN PEMBELAJARAN (ATP) SEMESTER I
1. TP 1.1: Memahami dan menjelaskan konsep fundamental serta ruang lingkup utama ${mapel} dalam kehidupan sehari-hari.
2. TP 1.2: Menganalisis studi kasus nyata berbasis pemecahan masalah (Problem-Solving) yang mengintegrasikan nilai kejujuran dan kebermanfaatan sosial.
3. TP 1.3: Merancang proyek kelompok kolaboratif berskala kecil untuk mengimplementasikan kompetensi dasar yang diperoleh.

C. DISTRIBUSI ALOKASI WAKTU
- Bab I: Fondasi dan Prinsip Utama ${mapel} (12 JP)
- Bab II: Eksplorasi Kontekstual & Studi Kasus Berkelompok (16 JP)
- Bab III: Final Project & Refleksi Akhir Pembelajaran (12 JP)

Mengetahui,
Kepala Sekolah                            Guru Mata Pelajaran

${principalNameVal.padEnd(42, ' ')}${teacherName}
NIP: ${principalNipVal.padEnd(37, ' ')}NIP: ${teacherNip}`;
    } else if (tipe === 'cp') {
      return `CAPAIAN PEMBELAJARAN (CP)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

Mata Pelajaran : ${mapel}
Kelas          : ${kelas}
Fase           : ${fase || 'Fase D'}
Penyusun       : ${teacherName}

A. RASIONAL MATA PELAJARAN
Mata pelajaran ${mapel} memegang peranan krusial dalam membentuk kemampuan berpikir logis, analitis, kritis, dan inovatif bagi seluruh peserta didik. Penguasaan konsep ini memampukan murid menghadapi tantangan era digital dengan bijak dan bersikap solutif.

B. TUJUAN PEMBELAJARAN UMUM
1. Menumbuhkan kecakapan bernalar kritis melalui analisis data dan pengambilan keputusan yang tepat.
2. Membentuk pribadi yang jujur, kolaboratif, amanah, dan menghormati hak orang lain selaras dengan tuntunan Islam.
3. Melatih keterampilan komunikasi teknis dan penyusunan portofolio karya kreatif berbasis proyek nyata.

Mengetahui,
Kepala Sekolah                            Guru Mata Pelajaran

${principalNameVal.padEnd(42, ' ')}${teacherName}
NIP: ${principalNipVal.padEnd(37, ' ')}NIP: ${teacherNip}`;
    } else if (tipe === 'kktp') {
      return `KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

Mata Pelajaran : ${mapel}
Kelas          : ${kelas}
Fase           : ${fase || 'Fase D'}
Penyusun       : ${teacherName}

A. KRITERIA KETUNTASAN UNTUK TIAP LEVEL (SOLO TAXONOMY)
1. Level Belum Berkembang (< 60):
   Peserta didik hanya mampu mengingat definisi literal atau mengidentifikasi satu komponen dasar ${mapel} tanpa bisa menjelaskannya secara mandiri.
2. Level Layak (60 - 75):
   Peserta didik mampu mendeskripsikan konsep utama ${mapel} dan memberikan contoh sederhana yang relevan dengan kehidupan sehari-hari.
3. Level Cakap (76 - 88):
   Peserta didik mampu menganalisis hubungan antar-konsep, memecahkan soal cerita/kasus terapan secara mandiri, dan berkolaborasi secara aktif.
4. Level Mahir (89 - 100):
   Peserta didik mampu merancang solusi alternatif, mengkritisi keganjilan dalam studi kasus, serta menciptakan proyek integratif yang orisinal.

B. KEPUTUSAN KETUNTASAN
- Siswa dinyatakan tuntas (mencapai tujuan pembelajaran) minimal jika memperoleh predikat "CAKAP" pada aspek asesmen formatif utama.

Mengetahui,
Kepala Sekolah                            Guru Mata Pelajaran

${principalNameVal.padEnd(42, ' ')}${teacherName}
NIP: ${principalNipVal.padEnd(37, ' ')}NIP: ${teacherNip}`;
    } else if (tipe === 'prota') {
      return `PROGRAM TAHUNAN (PROTA)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

Mata Pelajaran : ${mapel}
Kelas          : ${kelas}
Fase           : ${fase || 'Fase D'}
Penyusun       : ${teacherName}

Semester | No | Alur Tujuan Pembelajaran (ATP)                   | Alokasi Waktu
---------|----|---------------------------------------------------|--------------
I        | 1  | Pengenalan Konsep Dasar & Terminologi ${mapel}   | 16 JP
I        | 2  | Studi Kasus Mandiri & Diskusi Kelompok           | 18 JP
II       | 3  | Desain Proyek Kelompok & Implementasi Lapangan  | 20 JP
II       | 4  | Ujian Sumatif Akhir, Remedial, & Refleksi Kelas  | 10 JP
---------|----|---------------------------------------------------|--------------
TOTAL    |    |                                                   | 64 JP

Mengetahui,
Kepala Sekolah                            Guru Mata Pelajaran

${principalNameVal.padEnd(42, ' ')}${teacherName}
NIP: ${principalNipVal.padEnd(37, ' ')}NIP: ${teacherNip}`;
    } else if (tipe === 'prosem') {
      return `PROGRAM SEMESTER (PROSEM)
SMP ISLAM MODERN AL FAKHIR
TAHUN AJARAN 2026 / 2027

Mata Pelajaran : ${mapel}
Kelas          : ${kelas}
Fase           : ${fase || 'Fase D'}
Penyusun       : ${teacherName}

No | Materi / ATP | Alokasi | Jul | Agt | Sep | Okt | Nov | Des
---|--------------|---------|-----|-----|-----|-----|-----|-----
1  | Pengenalan   | 12 JP   | x x |     |     |     |     |
2  | Studi Kasus  | 16 JP   |     | x x | x   |     |     |
3  | Proyek Kelas | 16 JP   |     |     | x   | x x |     |
4  | Asesmen Akhir| 8 JP    |     |     |     |     | x x | x
---|--------------|---------|-----|-----|-----|-----|-----|-----

Mengetahui,
Kepala Sekolah                            Guru Mata Pelajaran

${principalNameVal.padEnd(42, ' ')}${teacherName}
NIP: ${principalNipVal.padEnd(37, ' ')}NIP: ${teacherNip}`;
    }
    return `DOKUMEN: ${mapel} Kelas ${kelas}`;
  };

  // Helper to find matching document in archive
  const findMatchingArchivedDoc = (tipe: TipeAdministrasi, mapel: string, kelasStr: string) => {
    const rawClass = kelasStr.includes('VII') ? 'VII' : kelasStr.includes('VIII') ? 'VIII' : 'IX';
    const normMapel = mapel.toLowerCase().trim();
    return administrasiList.find(d => {
      const dMapel = d.mataPelajaran.toLowerCase().trim();
      const matchTipe = d.tipe === tipe;
      const matchMapel = dMapel === normMapel || dMapel.includes(normMapel) || normMapel.includes(dMapel);
      const matchClass = d.kelas.includes(rawClass) || rawClass.includes(d.kelas);
      return matchTipe && matchMapel && matchClass;
    });
  };

  const loadStandardWorkspaceText = () => {
    const rawClass = workspaceKelas.includes('VII') ? 'VII' : workspaceKelas.includes('VIII') ? 'VIII' : 'IX';
    const existingDoc = findMatchingArchivedDoc(workspaceTipe, workspaceMapel, workspaceKelas);

    if (existingDoc && (existingDoc.content || existingDoc.deskripsi)) {
      const docContent = existingDoc.content || existingDoc.deskripsi;
      setWorkspaceText(docContent);
      setActiveWorkspaceDocId(existingDoc.id);
      setLastSavedText(docContent);
    } else {
      const txt = getWorkspaceTemplateText(workspaceTipe, workspaceMapel, rawClass, workspaceFase);
      setWorkspaceText(txt);
      setActiveWorkspaceDocId(null);
      setLastSavedText(txt);
    }
  };

  // Auto-sync workspace text when user changes selection filters
  useEffect(() => {
    loadStandardWorkspaceText();
  }, [workspaceMapel, workspaceTipe, workspaceKelas, workspaceFase]);

  // Check if workspace has unsaved changes relative to last saved state
  const hasUnsavedChanges = workspaceText !== lastSavedText && workspaceText.trim().length > 0;

  const handleDownloadWorkspaceDoc = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${workspaceTipe.toUpperCase()} - ${workspaceMapel}</title>
        <style>
          @page { margin: 2cm; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.4; color: #000; }
          pre { font-family: 'Arial', sans-serif; font-size: 10pt; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 14pt; font-weight: bold; text-transform: uppercase;">${workspaceTipe.replace('_', ' ')}</div>
          <div style="font-size: 12pt; font-weight: bold;">SMP ISLAM MODERN AL FAKHIR</div>
          <div style="font-size: 11pt; font-weight: bold;">TAHUN AJARAN 2026 / 2027</div>
        </div>
        <pre>${workspaceText}</pre>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspaceTipe}_${workspaceMapel.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
    a.click();
  };

  const handleDownloadWorkspaceTxt = () => {
    const blob = new Blob([workspaceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspaceTipe}_${workspaceMapel.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    a.click();
  };

  const handlePrintWorkspace = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak ${workspaceTipe.toUpperCase()} - ${workspaceMapel}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
          .kop-surat { text-align: center; border-bottom: 4px double #059669; padding-bottom: 12px; margin-bottom: 25px; }
          .kop-sekolah { font-size: 16pt; font-weight: 900; color: #065f46; letter-spacing: 0.05em; }
          .kop-sub { font-size: 9pt; color: #475569; margin-top: 2px; }
          pre { font-family: 'Arial', sans-serif; font-size: 11pt; white-space: pre-wrap; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="kop-surat">
          <div class="kop-sekolah">SMP ISLAM MODERN AL FAKHIR</div>
          <div class="kop-sub">NPSN: 69978521 • Terakreditasi A • Jl. Raya Sawangan No. 45, Depok</div>
          <div class="kop-sub">Email: info@alfakhir.sch.id • Telp: (021) 77889922</div>
        </div>
        <pre>\${workspaceText}</pre>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveWorkspaceToArsip = async (overrideTitle?: string, forceNew: boolean = false) => {
    setIsSavingWorkspace(true);
    try {
      const rawClass = workspaceKelas.includes('VII') ? 'VII' : workspaceKelas.includes('VIII') ? 'VIII' : 'IX';
      const teacherInfo = getTemplateTeacherInfo(workspaceMapel);
      const teacherName = teacherInfo.nama || activeTeacher?.nama || 'Guru Pengampu Mapel';
      const defaultDocTitle = `${workspaceTipe.toUpperCase().replace('_', ' ')}: ${workspaceMapel} - Kelas ${rawClass}`;
      const docTitle = (overrideTitle && overrideTitle.trim()) ? overrideTitle.trim() : defaultDocTitle;

      let kontenJsonObj: any = undefined;
      if (workspaceTipe === 'modul_ajar') {
        try {
          // Parse the raw text to structured JSON to maintain compatibility with "Buat Manual" view & edit flows
          const sections: { [key: string]: string } = {};
          const lines = workspaceText.split('\n');
          let currentLetter = '';
          let currentLines: string[] = [];
          
          for (const line of lines) {
            const match = line.match(/^([A-Q])\.\s+(.+)$/);
            if (match) {
              if (currentLetter) {
                sections[currentLetter] = currentLines.join('\n').trim();
              }
              currentLetter = match[1];
              currentLines = [];
            } else {
              currentLines.push(line);
            }
          }
          if (currentLetter) {
            sections[currentLetter] = currentLines.join('\n').trim();
          }

          const parseLines = (secText: string) => secText ? secText.split('\n').map(l => l.trim()).filter(Boolean) : [];
          const infoText = sections['A'] || '';
          const getInfoField = (label: string, fallback: string = '') => {
            const match = infoText.match(new RegExp(`${label}\\s*:\\s*(.+)`, 'i'));
            return match ? match[1].trim() : fallback;
          };

          const informasiUmum = {
            namaPenyusun: getInfoField('Nama Penyusun', teacherName),
            namaSekolah: getInfoField('Nama Sekolah', 'SMP Islam Modern Al Fakhir'),
            mataPelajaran: getInfoField('Mata Pelajaran', workspaceMapel),
            fase: getInfoField('Fase/Kelas', 'D / ' + rawClass).split('/')[0]?.trim() || 'D',
            kelas: getInfoField('Fase/Kelas', 'D / ' + rawClass).split('/')[1]?.trim() || rawClass,
            semester: getInfoField('Semester', 'I (Ganjil)'),
            tahunAjaran: getInfoField('Tahun Ajaran', '2026/2027'),
            alokasiWaktu: getInfoField('Alokasi Waktu', '2 x 40 Menit'),
            materi: getInfoField('Materi Pokok', docTitle),
          };

          const getKegiatanSection = (prefix: string) => {
            const regex = new RegExp(`(?:\\d+)\\.\\s*(${prefix}[^\\n]*)\\n([\\s\\S]*?)(?=(?:\\d+)\\.\\s*|$)`, 'i');
            const match = (sections['J'] || '').match(regex);
            if (match) {
              const fullMatch = match[0];
              const durMatch = fullMatch.match(/\((\d+)\s*Menit\)/i);
              const duration = durMatch ? `${durMatch[1]} Menit` : '10 Menit';
              const desc = match[2].trim();
              return { deskripsi: desc, durasi: duration };
            }
            return { deskripsi: '', durasi: '10 Menit' };
          };

          const lampiranText = sections['Q'] || '';
          const getLampiranField = (num: string, fallback: string = '') => {
            const regex = new RegExp(`(?:${num})\\.\\s*([^\\n]+)`, 'i');
            const match = lampiranText.match(regex);
            return match ? match[1].trim() : fallback;
          };

          kontenJsonObj = {
            informasiUmum,
            kompetensiAwal: sections['B'] || '',
            profilPelajarPancasila: parseLines(sections['C']),
            saranaPrasarana: parseLines(sections['D']),
            targetPesertaDidik: 'Reguler',
            modelPembelajaran: sections['F'] || 'Problem Based Learning (PBL)',
            tujuanPembelajaran: parseLines(sections['G']),
            pemahamanBermakna: sections['H'] || '',
            pertanyaanPemantik: parseLines(sections['I']),
            kegiatanPembelajaran: {
              pendahuluan: getKegiatanSection('Pendahuluan'),
              inti: getKegiatanSection('Inti'),
              penutup: getKegiatanSection('Penutup')
            },
            asesmen: {
              diagnostik: 'Kuesioner kesiapan awal',
              formatif: 'Observasi keaktifan diskusi',
              sumatif: 'Penilaian produk hasil karya',
              teknik: 'Observasi dan Tes Tertulis',
              instrumen: 'Lembar Pengamatan & Soal Esai Evaluatif',
              rubrik: sections['K'] || 'Kriteria Penilaian Baku',
              kriteriaPenilaian: 'Ketepatan & Nilai Islami'
            },
            diferensiasi: {
              konten: 'Bahan bacaan tingkat kerumitan bervariasi',
              proses: 'Scaffolding dan tutor sebaya',
              produk: 'Penyajian karya dalam tulisan, poster, atau presentasi'
            },
            remedial: sections['M'] || '',
            pengayaan: sections['N'] || '',
            refleksiGuru: sections['O'] || '',
            refleksiPesertaDidik: sections['P'] || '',
            lampiran: {
              lkpd: getLampiranField('1', 'Lembar Kerja Peserta Didik (LKPD) mandiri & kelompok.'),
              bahanBacaan: getLampiranField('3', 'Bahan Bacaan Guru & Peserta Didik terkait materi pokok.'),
              rubrik: getLampiranField('2', 'Rubrik Penilaian Portofolio/Performa Hasil Karya.'),
              instrumenAsesmen: getLampiranField('4', 'Integrasi Nilai Islami'),
              daftarPustaka: getLampiranField('5', 'Daftar Pustaka Pendikulum Merdeka.')
            }
          };
        } catch (parseErr) {
          console.error('Failed to parse workspace text to JSON structured content:', parseErr);
        }
      }

      // Find existing document in archive if updating
      const existingDoc = (!forceNew && activeWorkspaceDocId)
        ? administrasiList.find(d => d.id === activeWorkspaceDocId)
        : (!forceNew ? findMatchingArchivedDoc(workspaceTipe, workspaceMapel, workspaceKelas) : null);

      if (existingDoc) {
        // Update existing document in archive
        const updatedDoc: AdministrasiGuru = {
          ...existingDoc,
          judul: overrideTitle ? docTitle : (existingDoc.judul || docTitle),
          deskripsi: workspaceText.length > 150 ? workspaceText.substring(0, 150) + '...' : workspaceText,
          content: workspaceText,
          kontenJson: kontenJsonObj || existingDoc.kontenJson,
          tanggalInput: new Date().toISOString().split('T')[0],
          status: 'Final'
        };

        const updatedList = administrasiList.map(d => d.id === existingDoc.id ? updatedDoc : d);
        setAdministrasiList(updatedList);
        await dbSaveCollection('edu_administrasiList', updatedList);
        setActiveWorkspaceDocId(existingDoc.id);
        setLastSavedText(workspaceText);
        setSaveSuccessNotification(`Perubahan dokumen "${updatedDoc.judul}" berhasil disimpan ke Arsip!`);
      } else {
        // Create new document in archive
        const newDoc: AdministrasiGuru = {
          id: `adm-${Date.now()}`,
          tipe: workspaceTipe,
          guruNama: teacherName,
          mataPelajaran: workspaceMapel,
          kelas: rawClass,
          tahunAjaran: '2026/2027',
          semester: 'Ganjil',
          judul: docTitle,
          deskripsi: workspaceText.length > 150 ? workspaceText.substring(0, 150) + '...' : workspaceText,
          content: workspaceText,
          kontenJson: kontenJsonObj,
          tanggalInput: new Date().toISOString().split('T')[0],
          status: 'Final'
        };

        const newList = [newDoc, ...administrasiList];
        setAdministrasiList(newList);
        await dbSaveCollection('edu_administrasiList', newList);
        setActiveWorkspaceDocId(newDoc.id);
        setLastSavedText(workspaceText);
        setSaveSuccessNotification(`Dokumen "${newDoc.judul}" berhasil disimpan ke Arsip Sekolah!`);
      }
    } catch (err) {
      console.error('Error saving workspace to archive:', err);
      alert('Gagal menyimpan dokumen ke arsip. Silakan coba lagi.');
    } finally {
      setIsSavingWorkspace(false);
      setShowSaveModal(false);
    }
  };

  // View Document Modal State
  const [activeDoc, setActiveDoc] = useState<AdministrasiGuru | null>(null);
  const [isEditingActiveDoc, setIsEditingActiveDoc] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string | 'all'; judul: string } | null>(null);

  const openDocModal = (doc: AdministrasiGuru) => {
    setActiveDoc(doc);
    setEditedContent(doc.content || doc.deskripsi);
    setIsEditingActiveDoc(false);
  };

  const handleSaveActiveDoc = async () => {
    if (!activeDoc) return;
    const updatedDoc: AdministrasiGuru = {
      ...activeDoc,
      content: editedContent,
      deskripsi: editedContent.length > 180 ? editedContent.substring(0, 180) + '...' : editedContent,
      tanggalInput: new Date().toISOString().split('T')[0]
    };

    const updatedList = administrasiList.map(d => d.id === activeDoc.id ? updatedDoc : d);
    setAdministrasiList(updatedList);
    await dbSaveCollection('edu_administrasiList', updatedList);

    setActiveDoc(updatedDoc);

    // If currently editing the same document in workspace, sync it
    if (activeWorkspaceDocId === activeDoc.id) {
      setWorkspaceText(editedContent);
      setLastSavedText(editedContent);
    }

    setIsEditingActiveDoc(false);
    setSaveSuccessNotification(`Perubahan dokumen "${updatedDoc.judul}" berhasil disimpan ke Arsip!`);
  };

  const handleDownloadDocx = () => {
    if (!activeDoc) return;
    const text = activeDoc.content || activeDoc.deskripsi;
    
    // Find teacher of active document in guruList to get their actual NIP / NUPTK
    const docGuru = guruList?.find(g => g.nama.toLowerCase() === activeDoc.guruNama.toLowerCase());
    const docGuruNip = docGuru ? (docGuru.nip || '-') : '-';

    let finalHtmlContent = '';

    if (activeDoc.kontenJson) {
      const q = activeDoc.kontenJson;
      finalHtmlContent = `
        <div class="section-header">A. INFORMASI UMUM</div>
        <table>
          <tr><td class="label-cell">Nama Penyusun</td><td class="val-cell">${q.informasiUmum.namaPenyusun || activeDoc.guruNama}</td></tr>
          <tr><td class="label-cell">Nama Sekolah</td><td class="val-cell">${q.informasiUmum.namaSekolah}</td></tr>
          <tr><td class="label-cell">Mata Pelajaran</td><td class="val-cell">${q.informasiUmum.mataPelajaran}</td></tr>
          <tr><td class="label-cell">Fase / Kelas</td><td class="val-cell">Fase ${q.informasiUmum.fase} / Kelas ${q.informasiUmum.kelas}</td></tr>
          <tr><td class="label-cell">Semester</td><td class="val-cell">${q.informasiUmum.semester}</td></tr>
          <tr><td class="label-cell">Tahun Ajaran</td><td class="val-cell">${q.informasiUmum.tahunAjaran}</td></tr>
          <tr><td class="label-cell">Alokasi Waktu</td><td class="val-cell">${q.informasiUmum.alokasiWaktu}</td></tr>
          <tr><td class="label-cell">Materi Pokok</td><td class="val-cell"><b>${q.informasiUmum.materi}</b></td></tr>
        </table>

        <div class="section-header">B. KOMPETENSI AWAL</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.kompetensiAwal || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">C. PROFIL PELAJAR PANCASILA</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <ul>
            ${(q.profilPelajarPancasila || []).map((p: string) => `<li>${p}</li>`).join('') || '<li>-</li>'}
          </ul>
        </div>

        <div class="section-header">D. SARANA DAN PRASARANA</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <ul>
            ${(q.saranaPrasarana || []).map((s: string) => `<li>${s}</li>`).join('') || '<li>-</li>'}
          </ul>
        </div>

        <div class="section-header">E. TARGET PESERTA DIDIK</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">Target: <b>${q.targetPesertaDidik || 'Reguler'}</b></div>

        <div class="section-header">F. MODEL PEMBELAJARAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">Model: <b>${q.modelPembelajaran || 'Problem Based Learning'}</b></div>

        <div class="section-header">G. TUJUAN PEMBELAJARAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <ol>
            ${(q.tujuanPembelajaran || []).map((tp: string) => `<li>${tp}</li>`).join('') || '<li>-</li>'}
          </ol>
        </div>

        <div class="section-header">H. PEMAHAMAN BERMAKNA</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.pemahamanBermakna || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">I. PERTANYAAN PEMANTIK</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <ul>
            ${(q.pertanyaanPemantik || []).map((pp: string) => `<li>${pp}</li>`).join('') || '<li>-</li>'}
          </ul>
        </div>

        <div class="section-header">J. KEGIATAN PEMBELAJARAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <p><b>1. Pendahuluan (${q.kegiatanPembelajaran.pendahuluan.durasi || '10 Menit'}):</b></p>
          <p>${(q.kegiatanPembelajaran.pendahuluan.deskripsi || '-').replace(/\n/g, '<br/>')}</p>
          
          <p><b>2. Kegiatan Inti (${q.kegiatanPembelajaran.inti.durasi || '60 Menit'}):</b></p>
          <p>${(q.kegiatanPembelajaran.inti.deskripsi || '-').replace(/\n/g, '<br/>')}</p>

          <p><b>3. Penutup (${q.kegiatanPembelajaran.penutup.durasi || '10 Menit'}):</b></p>
          <p>${(q.kegiatanPembelajaran.penutup.deskripsi || '-').replace(/\n/g, '<br/>')}</p>
        </div>

        <div class="section-header">K. ASESMEN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <p><b>Asesmen Diagnostik:</b> ${(q.asesmen.diagnostik || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Asesmen Formatif:</b> ${(q.asesmen.formatif || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Asesmen Sumatif:</b> ${(q.asesmen.sumatif || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Teknik Asesmen:</b> ${q.asesmen.teknik || '-'}</p>
          <p><b>Instrumen:</b> ${q.asesmen.instrumen || '-'}</p>
          <p><b>Rubrik Penilaian:</b> ${(q.asesmen.rubrik || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Kriteria Penilaian:</b> ${(q.asesmen.kriteriaPenilaian || '-').replace(/\n/g, '<br/>')}</p>
        </div>

        <div class="section-header">L. DIFERENSIASI PEMBELAJARAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <p><b>Diferensiasi Konten:</b> ${(q.diferensiasi.konten || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Diferensiasi Proses:</b> ${(q.diferensiasi.proses || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Diferensiasi Produk:</b> ${(q.diferensiasi.produk || '-').replace(/\n/g, '<br/>')}</p>
        </div>

        <div class="section-header">M. REMEDIAL</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.remedial || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">N. PENGAYAAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.pengayaan || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">O. REFLEKSI GURU</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.refleksiGuru || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">P. REFLEKSI PESERTA DIDIK</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">${(q.refleksiPesertaDidik || '-').replace(/\n/g, '<br/>')}</div>

        <div class="section-header">Q. LAMPIRAN</div>
        <div style="padding: 10px; border: 1px solid #000; margin-bottom: 10px;">
          <p><b>LKPD:</b> ${(q.lampiran.lkpd || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Bahan Bacaan Guru & Peserta Didik:</b> ${(q.lampiran.bahanBacaan || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Rubrik Penilaian:</b> ${(q.lampiran.rubrik || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Instrumen Asesmen:</b> ${(q.lampiran.instrumenAsesmen || '-').replace(/\n/g, '<br/>')}</p>
          <p><b>Daftar Pustaka:</b> ${(q.lampiran.daftarPustaka || '-').replace(/\n/g, '<br/>')}</p>
        </div>
      `;
    } else {
      // Process content: Replace section headers with styled divs
      let processedContent = text;
      const sectionList = [
        'A. IDENTITAS', 
        'B. IDENTIFIKASI', 
        'C. DESAIN PEMBELAJARAN', 
        'D. PENGALAMAN BELAJAR', 
        'E. ASESMEN', 
        'F. RENCANA REMEDIAL DAN PENGAYAAN', 
        'G. PENYESUAIAN ASESMEN UNTUK PESERTA DIDIK INKLUSI', 
        'I. REFLEKSI'
      ];

      sectionList.forEach(s => {
        processedContent = processedContent.replace(new RegExp(`^${s.replace('.', '\\.')}`, 'gm'), `|||SECTION|||${s}|||`);
      });

      // Helper to format tables in the text
      const formatTables = (content: string) => {
        return content.replace(/^(.+?\|.+?)\n[|\s-]+\n((?:.*\|.*\n?)*)/gm, (match, header, body) => {
          const rows = body.trim().split('\n');
          const headerCols = header.split('|').map(c => `<td class="inklusi-header">${c.trim()}</td>`).join('');
          const bodyRows = rows.map(r => `<tr>${r.split('|').map(c => `<td>${c.trim()}</td>`).join('')}</tr>`).join('');
          return `<table style="width:100%; border-collapse:collapse; border:1px solid #000; margin:10px 0;"><thead><tr>${headerCols}</tr></thead><tbody>${bodyRows}</tbody></table>`;
        });
      };

      const sections = processedContent.split('|||SECTION|||');

      sections.forEach(section => {
        if (!section.trim()) return;
        if (section.startsWith('A. IDENTITAS') || section.startsWith('B. IDENTIFIKASI') || section.startsWith('C. DESAIN PEMBELAJARAN') || section.startsWith('D. PENGALAMAN BELAJAR') || section.startsWith('E. ASESMEN') || section.startsWith('F. RENCANA REMEDIAL DAN PENGAYAAN') || section.startsWith('G. PENYESUAIAN ASESMEN UNTUK PESERTA DIDIK INKLUSI') || section.startsWith('I. REFLEKSI')) {
          const [title, ...contentLines] = section.split('|||');
          const content = contentLines.join('|||').trim();
          finalHtmlContent += `<div class="section-header">${title}</div>`;
          
          if (title.includes('A. IDENTITAS')) {
            // Format Identitas as a specific table
            const lines = content.split('\n');
            let tableHtml = '<table>';
            lines.forEach(line => {
              if (line.includes(':')) {
                const [label, val] = line.split(':');
                tableHtml += `<tr><td class="label-cell">${label.trim()}</td><td class="val-cell">${val.trim()}</td></tr>`;
              }
            });
            tableHtml += '</table>';
            finalHtmlContent += tableHtml;
          } else {
            finalHtmlContent += `<div style="margin-bottom:15px; padding-left:5px;">${formatTables(content).replace(/\n/g, '<br/>')}</div>`;
          }
        } else {
          finalHtmlContent += `<div>${formatTables(section).replace(/\n/g, '<br/>')}</div>`;
        }
      });
    }

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${activeDoc.judul}</title>
        <style>
          @page { margin: 2cm; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.4; color: #000; }
          .header-table { width: 100%; border: none; margin-bottom: 20px; }
          .header-table td { border: none !important; padding: 0 !important; }
          .section-header { 
            background-color: #92D050; 
            font-weight: bold; 
            padding: 5px 10px; 
            border: 1px solid #000;
            margin-top: 15px;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-size: 11pt;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          table, th, td { border: 1px solid #000; }
          td { padding: 5px 8px; vertical-align: top; font-size: 9pt; }
          .label-cell { background-color: #FFFF00; font-weight: bold; width: 30%; }
          .val-cell { width: 70%; }
          .inklusi-header { background-color: #B4C6E7; font-weight: bold; text-align: center; }
          .footer-table { border: none !important; margin-top: 40px; }
          .footer-table td { border: none !important; text-align: center; font-size: 10pt; padding: 10px !important; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 14pt; font-weight: bold;">MODUL AJAR</div>
          <div style="font-size: 12pt; font-weight: bold;">SMP ISLAM MODERN AL FAKHIR</div>
          <div style="font-size: 11pt; font-weight: bold;">TAHUN AJARAN 2026 / 2027</div>
        </div>

        ${finalHtmlContent}

        <table class="footer-table" style="width: 100%;">
          <tr>
            <td style="width: 50%;">
              <p>Mengetahui,</p>
              <p><b>Kepala Sekolah</b></p>
              <br /><br /><br /><br />
              <p><u>${principalName}</u></p>
              <p>NIP. ${principalNip}</p>
            </td>
            <td style="width: 50%;">
              <p>Sawangan, ${new Date(activeDoc.tanggalInput).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><b>Guru Mata Pelajaran</b></p>
              <br /><br /><br /><br />
              <p><u>${activeDoc.guruNama}</u></p>
              <p>NIP. ${docGuruNip}</p>
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
        
        ${activeDoc.kontenJson ? `
          <div class="content-title">A. INFORMASI UMUM</div>
          <div class="content-box">
            <table class="table-info" style="margin-bottom: 0;">
              <tr><td class="label" style="width: 30%;">Nama Penyusun</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.namaPenyusun || activeDoc.guruNama}</td></tr>
              <tr><td class="label">Nama Sekolah</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.namaSekolah}</td></tr>
              <tr><td class="label">Mata Pelajaran</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.mataPelajaran}</td></tr>
              <tr><td class="label">Fase / Kelas</td><td class="colon">:</td><td class="val">Fase ${activeDoc.kontenJson.informasiUmum.fase} / Kelas ${activeDoc.kontenJson.informasiUmum.kelas}</td></tr>
              <tr><td class="label">Semester</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.semester}</td></tr>
              <tr><td class="label">Tahun Ajaran</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.tahunAjaran}</td></tr>
              <tr><td class="label">Alokasi Waktu</td><td class="colon">:</td><td class="val">${activeDoc.kontenJson.informasiUmum.alokasiWaktu}</td></tr>
              <tr><td class="label">Materi Pokok</td><td class="colon">:</td><td class="val"><b>${activeDoc.kontenJson.informasiUmum.materi}</b></td></tr>
            </table>
          </div>

          <div class="content-title">B. KOMPETENSI AWAL</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.kompetensiAwal || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">C. PROFIL PELAJAR PANCASILA (YANG DITUJU)</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <ul style="margin: 0; padding-left: 20px;">
              ${(activeDoc.kontenJson.profilPelajarPancasila || []).map((p: string) => `<li>${p}</li>`).join('') || '<li>-</li>'}
            </ul>
          </div>

          <div class="content-title">D. SARANA DAN PRASARANA</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <ul style="margin: 0; padding-left: 20px;">
              ${(activeDoc.kontenJson.saranaPrasarana || []).map((s: string) => `<li>${s}</li>`).join('') || '<li>-</li>'}
            </ul>
          </div>

          <div class="content-title">E. TARGET PESERTA DIDIK</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">Target: <b>${activeDoc.kontenJson.targetPesertaDidik || 'Reguler'}</b></div>

          <div class="content-title">F. MODEL PEMBELAJARAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">Model: <b>${activeDoc.kontenJson.modelPembelajaran || 'Problem Based Learning'}</b></div>

          <div class="content-title">G. TUJUAN PEMBELAJARAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <ol style="margin: 0; padding-left: 20px;">
              ${(activeDoc.kontenJson.tujuanPembelajaran || []).map((tp: string) => `<li>${tp}</li>`).join('') || '<li>-</li>'}
            </ol>
          </div>

          <div class="content-title">H. PEMAHAMAN BERMAKNA</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.pemahamanBermakna || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">I. PERTANYAAN PEMANTIK</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <ul style="margin: 0; padding-left: 20px;">
              ${(activeDoc.kontenJson.pertanyaanPemantik || []).map((pp: string) => `<li>${pp}</li>`).join('') || '<li>-</li>'}
            </ul>
          </div>

          <div class="content-title">J. KEGIATAN PEMBELAJARAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <p><b>1. Pendahuluan (${activeDoc.kontenJson.kegiatanPembelajaran.pendahuluan.durasi || '10 Menit'}):</b></p>
            <div style="margin-left: 15px; margin-bottom: 15px;">${(activeDoc.kontenJson.kegiatanPembelajaran.pendahuluan.deskripsi || '-').replace(/\n/g, '<br/>')}</div>
            
            <p><b>2. Kegiatan Inti (${activeDoc.kontenJson.kegiatanPembelajaran.inti.durasi || '60 Menit'}):</b></p>
            <div style="margin-left: 15px; margin-bottom: 15px;">${(activeDoc.kontenJson.kegiatanPembelajaran.inti.deskripsi || '-').replace(/\n/g, '<br/>')}</div>

            <p><b>3. Penutup (${activeDoc.kontenJson.kegiatanPembelajaran.penutup.durasi || '10 Menit'}):</b></p>
            <div style="margin-left: 15px;">${(activeDoc.kontenJson.kegiatanPembelajaran.penutup.deskripsi || '-').replace(/\n/g, '<br/>')}</div>
          </div>

          <div class="content-title">K. ASESMEN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <p><b>Asesmen Diagnostik:</b> ${(activeDoc.kontenJson.asesmen.diagnostik || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Asesmen Formatif:</b> ${(activeDoc.kontenJson.asesmen.formatif || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Asesmen Sumatif:</b> ${(activeDoc.kontenJson.asesmen.sumatif || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Teknik Asesmen:</b> ${activeDoc.kontenJson.asesmen.teknik || '-'}</p>
            <p><b>Instrumen:</b> ${activeDoc.kontenJson.asesmen.instrumen || '-'}</p>
            <p><b>Rubrik Penilaian:</b> ${(activeDoc.kontenJson.asesmen.rubrik || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Kriteria Penilaian:</b> ${(activeDoc.kontenJson.asesmen.kriteriaPenilaian || '-').replace(/\n/g, '<br/>')}</p>
          </div>

          <div class="content-title">L. DIFERENSIASI PEMBELAJARAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <p><b>Diferensiasi Konten:</b> ${(activeDoc.kontenJson.diferensiasi.konten || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Diferensiasi Proses:</b> ${(activeDoc.kontenJson.diferensiasi.proses || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Diferensiasi Produk:</b> ${(activeDoc.kontenJson.diferensiasi.produk || '-').replace(/\n/g, '<br/>')}</p>
          </div>

          <div class="content-title">M. REMEDIAL</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.remedial || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">N. PENGAYAAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.pengayaan || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">O. REFLEKSI GURU</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.refleksiGuru || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">P. REFLEKSI PESERTA DIDIK</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">${(activeDoc.kontenJson.refleksiPesertaDidik || '-').replace(/\n/g, '<br/>')}</div>

          <div class="content-title">Q. LAMPIRAN</div>
          <div class="content-box" style="font-family: inherit; font-size: 10pt;">
            <p><b>LKPD:</b> ${(activeDoc.kontenJson.lampiran.lkpd || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Bahan Bacaan Guru & Peserta Didik:</b> ${(activeDoc.kontenJson.lampiran.bahanBacaan || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Rubrik Penilaian:</b> ${(activeDoc.kontenJson.lampiran.rubrik || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Instrumen Asesmen:</b> ${(activeDoc.kontenJson.lampiran.instrumenAsesmen || '-').replace(/\n/g, '<br/>')}</p>
            <p><b>Daftar Pustaka:</b> ${(activeDoc.kontenJson.lampiran.daftarPustaka || '-').replace(/\n/g, '<br/>')}</p>
          </div>
        ` : `
          <div class="content-title">Isi / Uraian Dokumen Administrasi</div>
          <div class="content-box">${text}</div>
        `}
        
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
  const kemendikdasmenMapelList = availableMapelList.length > 0 ? availableMapelList : [
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

  const handleSaveModulAjar = async (data: ModulAjarContent) => {
    const teacherName = activeTeacher?.nama || data.informasiUmum.namaPenyusun || 'Guru Pengampu Mapel';
    
    // Convert structured data to a readable string for the 'content' field as fallback
    const readableContent = `
MODUL AJAR: ${data.informasiUmum.materi}
Penyusun: ${teacherName}
Sekolah: ${data.informasiUmum.namaSekolah}
Mapel: ${data.informasiUmum.mataPelajaran}
Kelas: ${data.informasiUmum.kelas}

TUJUAN PEMBELAJARAN:
${data.tujuanPembelajaran.map((tp, i) => `${i+1}. ${tp}`).join('\n')}

KEGIATAN INTI:
${data.kegiatanPembelajaran.inti.deskripsi}
    `.trim();

    const newDoc: AdministrasiGuru = {
      id: `adm-${Date.now()}`,
      tipe: 'modul_ajar',
      guruNama: teacherName,
      mataPelajaran: data.informasiUmum.mataPelajaran,
      kelas: data.informasiUmum.kelas,
      tahunAjaran: data.informasiUmum.tahunAjaran,
      semester: data.informasiUmum.semester as any,
      judul: `MODUL AJAR: ${data.informasiUmum.materi}`,
      deskripsi: `Modul ajar lengkap Kurikulum Merdeka untuk materi ${data.informasiUmum.materi}`,
      content: readableContent,
      kontenJson: data,
      tanggalInput: new Date().toISOString().split('T')[0],
      status: 'Final'
    };

    const newList = [newDoc, ...administrasiList];
    setAdministrasiList(newList);
    await dbSaveCollection('edu_administrasiList', newList);
    setIsModulEditorOpen(false);
    alert('Modul Ajar lengkap berhasil disimpan!');
  };

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
        let fullContent = '';
        let kontenJsonObj: any = undefined;
        let titleDoc = `${aiTipe.toUpperCase().replace('_', ' ')}: ${aiMapel} - ${aiTopik}`;
        let descDoc = `Draf administrasi pembelajaran ${aiTipe.toUpperCase().replace('_', ' ')} Kurikulum Merdeka.`;

        if (aiTipe === 'modul_ajar' && data.isJson) {
          kontenJsonObj = data.data;
          // Set penyusun name correctly
          if (kontenJsonObj.informasiUmum) {
            kontenJsonObj.informasiUmum.namaPenyusun = teacherName;
            kontenJsonObj.informasiUmum.mataPelajaran = aiMapel;
            kontenJsonObj.informasiUmum.kelas = aiKelas;
            
            titleDoc = `MODUL AJAR: ${kontenJsonObj.informasiUmum.materi || aiTopik}`;
            descDoc = `Modul ajar lengkap Kurikulum Merdeka untuk materi ${kontenJsonObj.informasiUmum.materi || aiTopik}`;
            
            const tps = Array.isArray(kontenJsonObj.tujuanPembelajaran) ? kontenJsonObj.tujuanPembelajaran : [];
            const intiDeskripsi = kontenJsonObj.kegiatanPembelajaran?.inti?.deskripsi || '-';
            
            fullContent = `
MODUL AJAR: ${kontenJsonObj.informasiUmum.materi || aiTopik}
Penyusun: ${teacherName}
Sekolah: ${kontenJsonObj.informasiUmum.namaSekolah || 'SMP Islam Modern Al Fakhir'}
Mapel: ${aiMapel}
Kelas: ${aiKelas}

TUJUAN PEMBELAJARAN:
${tps.map((tp: string, i: number) => `${i+1}. ${tp}`).join('\n')}

KEGIATAN INTI:
${intiDeskripsi}
            `.trim();
          } else {
            fullContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.data, null, 2);
          }
        } else {
          fullContent = data.content;
          descDoc = fullContent.length > 200 ? fullContent.substring(0, 200) + '...' : fullContent;
        }

        const newDoc: AdministrasiGuru = {
          id: `adm-${Date.now()}`,
          tipe: aiTipe,
          guruNama: teacherName,
          mataPelajaran: aiMapel,
          kelas: aiKelas,
          tahunAjaran: '2026/2027',
          semester: 'Ganjil',
          judul: titleDoc,
          deskripsi: descDoc,
          content: fullContent,
          kontenJson: kontenJsonObj,
          tanggalInput: new Date().toISOString().split('T')[0],
          status: 'Final'
        };

        const newList = [newDoc, ...administrasiList];
        setAdministrasiList(newList);
        dbSaveCollection('edu_administrasiList', newList);
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
            {activeSubTab === 'jurnal_guru' && <BookOpen className="w-5 h-5 text-emerald-600" />}
            {['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab || '') && <FolderOpen className="w-5 h-5 text-blue-600" />}
            {activeSubTab === 'jurnal_guru' ? 'Jurnal Guru & Kehadiran Siswa' :
             activeSubTab === 'jadwal' ? 'Jadwal Mengajar Guru' :
             activeSubTab === 'kalender' ? 'Kalender Pendidikan' : 
             activeSubTab === 'modul_ajar' ? 'Modul Ajar (RPP Plus)' :
             activeSubTab === 'cp' ? 'Capaian Pembelajaran (CP)' :
             activeSubTab === 'atp' ? 'Alur Tujuan Pembelajaran (ATP)' :
             activeSubTab === 'kktp' ? 'KKTP / Kriteria Ketercapaian' :
             activeSubTab === 'prota' ? 'Program Tahunan (Prota)' :
             activeSubTab === 'prosem' ? 'Program Semester (Prosem)' :
             'Perangkat Administrasi Guru'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeSubTab === 'jurnal_guru' ? 'Manajemen jurnal harian dan presensi siswa per mata pelajaran' :
             ['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab || '') ? 'Dokumen Administrasi Perangkat Pembelajaran Kurikulum Merdeka' :
             activeSubTab === 'jadwal' ? 'Jadwal Mengajar Guru SMP Islam Modern Al Fakhir' :
             'Kalender Pendidikan dan Agenda Akademik Sekolah'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab || '') && (
            <div className="flex items-center gap-2">
              {administrasiList.length > 0 && (
                <button 
                  onClick={() => setConfirmDelete({ id: 'all', judul: 'SEMUA dokumen perangkat guru' })}
                  className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 font-bold rounded-xl text-xs transition-all flex items-center gap-2 hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
              )}
              {activeSubTab === 'modul_ajar' && (
                <button
                  onClick={() => setIsModulEditorOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" /> Buat Manual (A-Q)
                </button>
              )}
              <button
                onClick={() => {
                  setAiTipe(activeSubTab as TipeAdministrasi);
                  setIsAiModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" /> Generate {activeSubTab?.toUpperCase()} AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'jadwal' && (
        <JadwalMengajar guruList={guruList} mapelList={mapelList} rombelList={rombelList} currentRole={currentRole} />
      )}

      {activeSubTab === 'kalender' && (
        <KalenderPendidikan />
      )}

      {activeSubTab === 'jurnal_guru' && (
        <JurnalGuru 
          siswaList={siswaList}
          guruList={guruList}
          rombelList={rombelList}
          mapelList={mapelList}
          absensiKelasList={absensiKelasList}
          setAbsensiKelasList={setAbsensiKelasList}
          userGoogleToken={userGoogleToken}
          schoolSettings={schoolSettings}
          absensiHarian={absensiHarian}
          stafList={stafList}
        />
      )}

      {activeSubTab === 'rekap_jurnal' as any && (
        <RekapJurnal 
          absensiKelasList={absensiKelasList}
          siswaList={siswaList}
          guruList={guruList}
          rombelList={rombelList}
          mapelList={mapelList}
        />
      )}

      {['modul_ajar', 'cp', 'atp', 'kktp', 'prota', 'prosem'].includes(activeSubTab || '') && (
        <div className="space-y-6">
          {/* Sisma Sekolah Workspace Selectors (Pilih Mata Pelajaran, Jenis Dokumen, Kelas, Fase) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            {/* PILIH MATA PELAJARAN */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pilih Mata Pelajaran</label>
              <select
                value={workspaceMapel}
                onChange={e => {
                  setWorkspaceMapel(e.target.value);
                  if (e.target.value !== 'Semua') {
                    setSelectedMapelFilter(e.target.value);
                  }
                }}
                className="w-full p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-100 outline-none transition-all cursor-pointer"
              >
                {availableMapelList.map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">{m}</option>
                ))}
              </select>
            </div>

            {/* PILIH JENIS DOKUMEN */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pilih Jenis Dokumen</label>
              <select
                value={workspaceTipe}
                onChange={e => {
                  const val = e.target.value as TipeAdministrasi;
                  setWorkspaceTipe(val);
                  setActiveSubTab(val as AdministrasiSubTab);
                }}
                className="w-full p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-100 outline-none transition-all cursor-pointer"
              >
                <option value="modul_ajar" className="bg-slate-900 text-slate-100">Modul Ajar Berdiferensiasi (RPP Plus)</option>
                <option value="atp" className="bg-slate-900 text-slate-100">Alur Tujuan Pembelajaran (ATP)</option>
                <option value="cp" className="bg-slate-900 text-slate-100">Capaian Pembelajaran (CP)</option>
                <option value="kktp" className="bg-slate-900 text-slate-100">KKTP / Kriteria Ketercapaian</option>
                <option value="prota" className="bg-slate-900 text-slate-100">Program Tahunan (Prota)</option>
                <option value="prosem" className="bg-slate-900 text-slate-100">Program Semester (Prosem)</option>
              </select>
            </div>

            {/* PILIH KELAS */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pilih Kelas</label>
              <select
                value={workspaceKelas}
                onChange={e => setWorkspaceKelas(e.target.value)}
                className="w-full p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-100 outline-none transition-all cursor-pointer"
              >
                <option value="Kelas VII (SMP)" className="bg-slate-900 text-slate-100">Kelas VII (SMP)</option>
                <option value="Kelas VIII (SMP)" className="bg-slate-900 text-slate-100">Kelas VIII (SMP)</option>
                <option value="Kelas IX (SMP)" className="bg-slate-900 text-slate-100">Kelas IX (SMP)</option>
              </select>
            </div>

            {/* PILIH FASE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pilih Fase</label>
              <select
                value={workspaceFase}
                onChange={e => setWorkspaceFase(e.target.value)}
                className="w-full p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-100 outline-none transition-all cursor-pointer"
              >
                <option value="Fase D (Kelas 7-9 SMP)" className="bg-slate-900 text-slate-100">Fase D (Kelas 7-9 SMP)</option>
              </select>
            </div>
          </div>

          {/* Workspace Editor Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Workspace Header */}
            <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mt-1">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">
                      Workspace Editor & Kustomisasi Sekolah
                    </h3>
                    {hasUnsavedChanges ? (
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Ada Perubahan Belum Disimpan
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Tersimpan di Arsip
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeWorkspaceDocId ? (
                      <span>Mengedit dokumen arsip terkait: <strong className="text-emerald-400 font-medium">{administrasiList.find(d => d.id === activeWorkspaceDocId)?.judul || `${workspaceTipe.toUpperCase()} ${workspaceMapel}`}</strong>. Setiap perubahan dapat langsung disimpan ke arsip sekolah.</span>
                    ) : (
                      <span>Sesuaikan draf di bawah dengan kop surat, tujuan pembelajaran, atau format khusus sekolah Anda sebelum disimpan ke arsip.</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-lg border border-slate-700">
                  {workspaceText.length} Karakter
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-lg border border-slate-700">
                  {workspaceText.trim().split(/\s+/).filter(Boolean).length} Kata
                </span>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menyetel ulang draf ke draf standar?')) {
                      const rawClass = workspaceKelas.includes('VII') ? 'VII' : workspaceKelas.includes('VIII') ? 'VIII' : 'IX';
                      const txt = getWorkspaceTemplateText(workspaceTipe, workspaceMapel, rawClass, workspaceFase);
                      setWorkspaceText(txt);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-all border border-slate-700 flex items-center gap-1.5"
                  title="Kembalikan ke format baku kurikulum merdeka"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Standar
                </button>
              </div>
            </div>

            {/* Dark Workspace Editor Content Area */}
            <div className="relative">
              <textarea
                value={workspaceText}
                onChange={e => setWorkspaceText(e.target.value)}
                className="w-full h-[450px] p-6 bg-slate-950 font-mono text-slate-200 text-xs focus:outline-none focus:ring-0 leading-relaxed resize-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                style={{ fontFamily: "Consolas, Monaco, 'Courier New', Courier, monospace" }}
                spellCheck={false}
                placeholder="Tulis atau edit konten administrasi di sini..."
              />
            </div>

            {/* Workspace Footer Actions */}
            <div className="bg-slate-950/80 p-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSaveWorkspaceToArsip()}
                  disabled={isSavingWorkspace}
                  className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg ${
                    hasUnsavedChanges
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
                  }`}
                >
                  {isSavingWorkspace ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan Perubahan...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {hasUnsavedChanges ? 'Simpan Perubahan ke Arsip' : 'Simpan ke Arsip'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const rawClass = workspaceKelas.includes('VII') ? 'VII' : workspaceKelas.includes('VIII') ? 'VIII' : 'IX';
                    setCustomDocTitle(`${workspaceTipe.toUpperCase().replace('_', ' ')}: ${workspaceMapel} - Kelas ${rawClass} (Revisi)`);
                    setIsSaveAsNew(true);
                    setShowSaveModal(true);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                  title="Simpan sebagai dokumen baru di arsip tanpa menimpa yang sudah ada"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  Simpan Draf Baru
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadWorkspaceDoc}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" /> Word (.DOC)
                </button>
                <button
                  onClick={handleDownloadWorkspaceTxt}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Teks (.TXT)
                </button>
                <button
                  onClick={handlePrintWorkspace}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-900" /> Cetak Sekarang
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
                placeholder="Cari judul dokumen atau mata pelajaran..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Menampilkan {activeSubTab?.toUpperCase().replace('_', ' ')}</span>
            </div>
          </div>

          {/* Document Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.filter(d => d.tipe === activeSubTab).length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <FolderOpen className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">Belum ada dokumen {activeSubTab?.toUpperCase().replace('_', ' ')}</p>
                <p className="text-xs mt-1">Gunakan tombol Generate AI untuk membuat draf otomatis</p>
              </div>
            ) : (
              filteredDocs
                .filter(d => d.tipe === activeSubTab)
                .map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] uppercase border border-blue-200">
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ id: doc.id, judul: doc.judul });
                          }}
                          disabled={deletingId === doc.id}
                          className={`p-2 rounded-xl transition-all border shadow-sm ${
                            deletingId === doc.id 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-100 hover:border-rose-200'
                          }`}
                          title="Hapus Dokumen"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === doc.id ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={() => openDocModal(doc)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> Lihat / Cetak
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Modul Ajar Editor Modal */}
      {isModulEditorOpen && (
        <ModulAjarEditor 
          onClose={() => setIsModulEditorOpen(false)}
          onSave={handleSaveModulAjar}
          schoolSettings={schoolSettings}
          guruList={guruList}
          mapelList={mapelList}
          defaultMapel={selectedMapelFilter !== 'Semua' ? selectedMapelFilter : undefined}
        />
      )}

      {/* AI GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> AI Perangkat Pembelajaran
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Tipe Dokumen</label>
                <select
                  value={aiTipe}
                  onChange={e => setAiTipe(e.target.value as TipeAdministrasi)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="modul_ajar">Modul Ajar</option>
                  <option value="atp">Alur Tujuan Pembelajaran (ATP)</option>
                  <option value="cp">Capaian Pembelajaran (CP)</option>
                  <option value="kktp">KKTP</option>
                  <option value="prota">Program Tahunan (Prota)</option>
                  <option value="prosem">Program Semester (Prosem)</option>
                  <option value="jurnal">Jurnal Mengajar Harian</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Mata Pelajaran</label>
                  <select
                    value={aiMapel}
                    onChange={e => setAiMapel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {availableMapelList.length > 0 ? (
                      availableMapelList.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))
                    ) : (
                      <option value="Umum">Umum</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Kelas / Fase</label>
                  <input
                    type="text"
                    value={aiKelas}
                    onChange={e => setAiKelas(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Topik / Elemen Pembelajaran</label>
                <textarea
                  rows={2}
                  value={aiTopik}
                  onChange={e => setAiTopik(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
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
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
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
                  className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" /> .DOC
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> .TXT
                </button>
                <button
                  onClick={handlePrintDoc}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pt-2 bg-slate-50/50 rounded-xl">
              {activeDoc.kontenJson && !isEditingActiveDoc ? (
                <div className="p-8 space-y-10 bg-white min-h-full">
                  {/* A. INFORMASI UMUM */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-slate-900 border-b-2 border-emerald-500 pb-1 inline-block">A. INFORMASI UMUM</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Penyusun:</span> {activeDoc.kontenJson.informasiUmum.namaPenyusun || activeDoc.guruNama}</p>
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Sekolah:</span> {activeDoc.kontenJson.informasiUmum.namaSekolah}</p>
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Mapel:</span> {activeDoc.kontenJson.informasiUmum.mataPelajaran}</p>
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Kelas/Fase:</span> {activeDoc.kontenJson.informasiUmum.kelas} / {activeDoc.kontenJson.informasiUmum.fase}</p>
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Materi:</span> {activeDoc.kontenJson.informasiUmum.materi}</p>
                      <p><span className="font-bold text-slate-500 uppercase tracking-tighter">Waktu:</span> {activeDoc.kontenJson.informasiUmum.alokasiWaktu}</p>
                    </div>
                  </div>

                  {/* B. KOMPETENSI AWAL */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-blue-500 pl-3">B. KOMPETENSI AWAL</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.kompetensiAwal || '-'}</p>
                  </div>

                  {/* C. PROFIL PELAJAR PANCASILA */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">C. PROFIL PELAJAR PANCASILA</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeDoc.kontenJson.profilPelajarPancasila?.map((p: string) => (
                        <span key={p} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">{p}</span>
                      )) || <span className="text-xs text-slate-500 italic">Tidak ada</span>}
                    </div>
                  </div>

                  {/* D. SARANA DAN PRASARANA */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-indigo-500 pl-3">D. SARANA DAN PRASARANA</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeDoc.kontenJson.saranaPrasarana?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100">{s}</span>
                      )) || <span className="text-xs text-slate-500 italic">Tidak ada</span>}
                    </div>
                  </div>

                  {/* E. TARGET PESERTA DIDIK */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-rose-500 pl-3">E. TARGET PESERTA DIDIK</h4>
                    <p className="text-xs text-slate-700 font-medium">Target: <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-100">{activeDoc.kontenJson.targetPesertaDidik || 'Reguler'}</span></p>
                  </div>

                  {/* F. MODEL PEMBELAJARAN */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-cyan-500 pl-3">F. MODEL PEMBELAJARAN</h4>
                    <p className="text-xs text-slate-700 font-medium">Model: <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-[10px] border border-cyan-100">{activeDoc.kontenJson.modelPembelajaran || 'Problem Based Learning'}</span></p>
                  </div>

                  {/* G. TUJUAN PEMBELAJARAN */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-purple-500 pl-3">G. TUJUAN PEMBELAJARAN</h4>
                    <ul className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                      {activeDoc.kontenJson.tujuanPembelajaran?.map((tp: string, i: number) => (
                        <li key={i}>{tp}</li>
                      )) || <li className="italic text-slate-400">Tidak ada</li>}
                    </ul>
                  </div>

                  {/* H. PEMAHAMAN BERMAKNA */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-violet-500 pl-3">H. PEMAHAMAN BERMAKNA</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.pemahamanBermakna || '-'}</p>
                  </div>

                  {/* I. PERTANYAAN PEMANTIK */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-teal-500 pl-3">I. PERTANYAAN PEMANTIK</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {activeDoc.kontenJson.pertanyaanPemantik?.map((pp: string, i: number) => (
                        <li key={i}>{pp}</li>
                      )) || <li className="italic text-slate-400">Tidak ada</li>}
                    </ul>
                  </div>

                  {/* J. KEGIATAN PEMBELAJARAN */}
                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-amber-500 pl-3">J. KEGIATAN PEMBELAJARAN</h4>
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 mb-1">Pendahuluan ({activeDoc.kontenJson.kegiatanPembelajaran.pendahuluan.durasi})</p>
                        <p className="text-slate-600 whitespace-pre-wrap">{activeDoc.kontenJson.kegiatanPembelajaran.pendahuluan.deskripsi}</p>
                      </div>
                      <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                        <p className="font-bold text-slate-800 mb-1 text-emerald-700">Kegiatan Inti ({activeDoc.kontenJson.kegiatanPembelajaran.inti.durasi})</p>
                        <p className="text-slate-600 whitespace-pre-wrap">{activeDoc.kontenJson.kegiatanPembelajaran.inti.deskripsi}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 mb-1">Penutup ({activeDoc.kontenJson.kegiatanPembelajaran.penutup.durasi})</p>
                        <p className="text-slate-600 whitespace-pre-wrap">{activeDoc.kontenJson.kegiatanPembelajaran.penutup.deskripsi}</p>
                      </div>
                    </div>
                  </div>

                  {/* K. ASESMEN */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-red-500 pl-3">K. ASESMEN (DIAGNOSTIK, FORMATIF, SUMATIF)</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-3">
                      <p><span className="font-bold text-slate-700">Asesmen Diagnostik:</span> {activeDoc.kontenJson.asesmen.diagnostik || '-'}</p>
                      <p><span className="font-bold text-slate-700">Asesmen Formatif:</span> {activeDoc.kontenJson.asesmen.formatif || '-'}</p>
                      <p><span className="font-bold text-slate-700">Asesmen Sumatif:</span> {activeDoc.kontenJson.asesmen.sumatif || '-'}</p>
                      <p><span className="font-bold text-slate-700">Teknik:</span> {activeDoc.kontenJson.asesmen.teknik || '-'}</p>
                      <p><span className="font-bold text-slate-700">Instrumen:</span> {activeDoc.kontenJson.asesmen.instrumen || '-'}</p>
                      <p><span className="font-bold text-slate-700">Rubrik:</span> {activeDoc.kontenJson.asesmen.rubrik || '-'}</p>
                      <p><span className="font-bold text-slate-700">Kriteria Penilaian:</span> {activeDoc.kontenJson.asesmen.kriteriaPenilaian || '-'}</p>
                    </div>
                  </div>

                  {/* L. DIFERENSIASI PEMBELAJARAN */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-orange-500 pl-3">L. DIFERENSIASI PEMBELAJARAN</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <p><span className="font-bold text-slate-700">Diferensiasi Konten:</span> {activeDoc.kontenJson.diferensiasi.konten || '-'}</p>
                      <p><span className="font-bold text-slate-700">Diferensiasi Proses:</span> {activeDoc.kontenJson.diferensiasi.proses || '-'}</p>
                      <p><span className="font-bold text-slate-700">Diferensiasi Produk:</span> {activeDoc.kontenJson.diferensiasi.produk || '-'}</p>
                    </div>
                  </div>

                  {/* M. REMEDIAL */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-amber-600 pl-3">M. REMEDIAL</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.remedial || '-'}</p>
                  </div>

                  {/* N. PENGAYAAN */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-green-600 pl-3">N. PENGAYAAN</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.pengayaan || '-'}</p>
                  </div>

                  {/* O. REFLEKSI GURU */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-fuchsia-600 pl-3">O. REFLEKSI GURU</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.refleksiGuru || '-'}</p>
                  </div>

                  {/* P. REFLEKSI PESERTA DIDIK */}
                  <div className="space-y-3">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">P. REFLEKSI PESERTA DIDIK</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeDoc.kontenJson.refleksiPesertaDidik || '-'}</p>
                  </div>

                  {/* Q. LAMPIRAN */}
                  <div className="space-y-3 pb-8">
                    <h4 className="text-md font-bold text-slate-900 border-l-4 border-slate-600 pl-3">Q. LAMPIRAN</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-3">
                      <p><span className="font-bold text-slate-700">LKPD (Lembar Kerja Peserta Didik):</span> {activeDoc.kontenJson.lampiran.lkpd || '-'}</p>
                      <p><span className="font-bold text-slate-700">Bahan Bacaan Guru & Peserta Didik:</span> {activeDoc.kontenJson.lampiran.bahanBacaan || '-'}</p>
                      <p><span className="font-bold text-slate-700">Rubrik Penilaian Lampiran:</span> {activeDoc.kontenJson.lampiran.rubrik || '-'}</p>
                      <p><span className="font-bold text-slate-700">Instrumen Asesmen Lampiran:</span> {activeDoc.kontenJson.lampiran.instrumenAsesmen || '-'}</p>
                      <p><span className="font-bold text-slate-700">Daftar Pustaka:</span> {activeDoc.kontenJson.lampiran.daftarPustaka || '-'}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic text-center pt-4">--- Akhir Modul Ajar Lengkap (Standar Kurikulum Merdeka) ---</p>
                </div>
              ) : isEditingActiveDoc ? (
                <textarea
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                  className="w-full h-full min-h-[400px] p-5 bg-slate-50 border border-amber-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                />
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

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {confirmDelete.id === 'all' ? 'Hapus Semua Dokumen?' : 'Hapus Dokumen?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">{confirmDelete.id === 'all' ? confirmDelete.judul : `"${confirmDelete.judul}"`}</span> secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const targetId = confirmDelete.id;
                  setConfirmDelete(null);
                  if (targetId === 'all') {
                    setAdministrasiList([]);
                    await dbClearCollection('edu_administrasiList');
                  } else {
                    setDeletingId(targetId);
                    try {
                      const newList = administrasiList.filter(d => d.id !== targetId);
                      setAdministrasiList(newList);
                      await dbDeleteItem('edu_administrasiList', targetId);
                    } catch (err) {
                      console.error('Error deleting document:', err);
                      alert('Gagal menghapus dokumen dari server. Silakan coba lagi.');
                    } finally {
                      setDeletingId(null);
                    }
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/10"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOM SAVE MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isSaveAsNew ? 'Simpan sebagai Dokumen Baru' : 'Simpan Perubahan ke Arsip'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isSaveAsNew 
                    ? 'Buat salinan baru di arsip administrasi sekolah' 
                    : 'Perbarui dokumen arsip dengan konten draf workspace terkini'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Judul Dokumen di Arsip</label>
              <input
                type="text"
                value={customDocTitle}
                onChange={e => setCustomDocTitle(e.target.value)}
                placeholder="Contoh: Modul Ajar: Matematika - Kelas VII (Revisi)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveWorkspaceToArsip(customDocTitle, isSaveAsNew)}
                disabled={isSavingWorkspace || !customDocTitle.trim()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
              >
                {isSavingWorkspace ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSavingWorkspace ? 'Menyimpan...' : 'Simpan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {saveSuccessNotification && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100">Berhasil Disimpan</p>
              <p className="text-[11px] text-slate-300 truncate">{saveSuccessNotification}</p>
            </div>
            <button
              onClick={() => setSaveSuccessNotification(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
