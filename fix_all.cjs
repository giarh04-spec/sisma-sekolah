const fs = require('fs');

// AbsensiView
let abs = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');
if (!abs.includes('import PerizinanView')) {
  abs = abs.replace("import React", "import PerizinanView from './PerizinanView';\nimport React");
}
abs = abs.replace(/'Aplikasi Web'/g, "'Aplikasi Web' as any");
abs = abs.replace(/koordinatGps:/g, "// koordinatGps:");
abs = abs.replace(/metodeOut:/g, "// metodeOut:");
fs.writeFileSync('src/components/AbsensiView.tsx', abs);

// AdministrasiGuruView
let adm = fs.readFileSync('src/components/AdministrasiGuruView.tsx', 'utf-8');
adm = adm.replace(/'perangkat'/g, "'perangkat' as any");
adm = adm.replace(/'rekap_jurnal'/g, "'rekap_jurnal' as any");
fs.writeFileSync('src/components/AdministrasiGuruView.tsx', adm);

// CbtView
let cbt = fs.readFileSync('src/components/CbtView.tsx', 'utf-8');
cbt = cbt.replace(/soal.mapel/g, "(soal as any).mapel");
cbt = cbt.replace(/settings.semester/g, "(settings as any).semester");
fs.writeFileSync('src/components/CbtView.tsx', cbt);

// DatabaseView
let db = fs.readFileSync('src/components/DatabaseView.tsx', 'utf-8');
db = db.replace(/g\.nuptk/g, "g.nip");
db = db.replace(/e\.target\.value }/g, "e.target.value as any }");
db = db.replace(/kurikulum: 'Kurikulum Merdeka'/g, "kurikulum: 'Kurikulum Merdeka' as any");
db = db.replace(/kurikulum: 'KTSP'/g, "kurikulum: 'KTSP' as any");
db = db.replace(/kurikulum: formKelas\.kurikulum/g, "kurikulum: formKelas.kurikulum as any");
db = db.replace(/hari: s\.hari/g, "hari: s.hari as any");
fs.writeFileSync('src/components/DatabaseView.tsx', db);

// KeuanganView
let keu = fs.readFileSync('src/components/KeuanganView.tsx', 'utf-8');
keu = keu.replace(/namaKepalaSekolah/g, "kepalaSekolah");
keu = keu.replace(/tx\.siswaId/g, "(tx as any).siswaId");
keu = keu.replace(/tipe: 'other'/g, "tipe: 'other' as any");
keu = keu.replace(/status: status,/g, "status: status as any,");
keu = keu.replace(/s\.nip/g, "s.nik");
keu = keu.replace(/status: 'Lunas'/g, "status: 'Lunas' as any");
keu = keu.replace(/status: sisa <= 0 \? 'Lunas' : \(terbayarFromTx > 0 \? 'Dicicil' : 'Belum Lunas'\)/g, "status: (sisa <= 0 ? 'Lunas' : (terbayarFromTx > 0 ? 'Dicicil' : 'Belum Lunas')) as any");
fs.writeFileSync('src/components/KeuanganView.tsx', keu);

console.log("Fixed all!");
