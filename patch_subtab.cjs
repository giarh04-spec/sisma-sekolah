const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

code = code.replace(
  "type SubTabAbsensi = 'scan_barcode' | 'harian_siswa' | 'absensi_guru' | 'redaksi' | 'jurnal_guru';",
  "type SubTabAbsensi = 'scan_barcode' | 'harian_siswa' | 'absensi_guru' | 'redaksi' | 'jurnal_guru' | 'perizinan';"
);

code = code.replace(
  "{subTab === 'redaksi' && <><MessageSquare className=\"w-3.5 h-3.5\" /> Redaksi Notifikasi WA</>}",
  "{subTab === 'redaksi' && <><MessageSquare className=\"w-3.5 h-3.5\" /> Redaksi Notifikasi WA</>}\n            {subTab === 'perizinan' && <><FileSignature className=\"w-3.5 h-3.5\" /> Pengajuan Izin / Cuti</>}"
);

// add icon
if (!code.includes('FileSignature')) {
  code = code.replace("MessageSquare,", "MessageSquare,\n  FileSignature,");
}

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('SubTabAbsensi patched');
