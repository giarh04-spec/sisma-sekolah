const fs = require('fs');

let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

// Insert import if not exists
if (!code.includes('PerizinanView')) {
  code = code.replace("import { LocationWithMapLink } from './LocationWithMapLink';", "import { LocationWithMapLink } from './LocationWithMapLink';\nimport { PerizinanView } from './PerizinanView';");
}

const perizinanTabCode = `
      {/* SUBTAB 5: PERIZINAN */}
      {subTab === 'perizinan' && (
        <PerizinanView
          siswaList={siswaList}
          guruList={guruList}
          stafList={stafList}
          rombelList={rombelList}
          absensiHarian={absensiHarian}
          setAbsensiHarian={setAbsensiHarian}
          absensiGuruList={absensiGuruList}
          setAbsensiGuruList={setAbsensiGuruList}
          currentRole={currentRole}
        />
      )}

`;

code = code.replace("{/* SUBTAB 4: EDIT REDAKSI TEMPLATE NOTIFIKASI WA PRESENSI */}", perizinanTabCode + "{/* SUBTAB 4: EDIT REDAKSI TEMPLATE NOTIFIKASI WA PRESENSI */}");

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('AbsensiView patched with PerizinanView.');
