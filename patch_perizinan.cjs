const fs = require('fs');
let code = fs.readFileSync('src/components/PerizinanView.tsx', 'utf-8');

const oldSiswaOptions = `{formTipe === 'Siswa' && filteredSiswaList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>
                  ))}`;

const newSiswaOptions = `{formTipe === 'Siswa' && filteredSiswaList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>
                  ))}
                  {formTipe === 'Siswa' && selectedRombel !== '' && filteredSiswaList.length === 0 && (
                    <option value="" disabled>-- Tidak ada siswa di kelas ini --</option>
                  )}`;

if (code.includes(oldSiswaOptions)) {
    code = code.replace(oldSiswaOptions, newSiswaOptions);
}

const oldGuruOptions = `{formTipe === 'Guru' && guruList.map(g => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}`;
                  
const newGuruOptions = `{formTipe === 'Guru' && guruList.map(g => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                  {formTipe === 'Guru' && guruList.length === 0 && (
                    <option value="" disabled>-- Data Guru Kosong --</option>
                  )}`;
                  
if (code.includes(oldGuruOptions)) {
    code = code.replace(oldGuruOptions, newGuruOptions);
}

const oldStafOptions = `{formTipe === 'Staf' && stafList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.bagian})</option>
                  ))}`;
                  
const newStafOptions = `{formTipe === 'Staf' && stafList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.bagian})</option>
                  ))}
                  {formTipe === 'Staf' && stafList.length === 0 && (
                    <option value="" disabled>-- Data Staf Kosong --</option>
                  )}`;

if (code.includes(oldStafOptions)) {
    code = code.replace(oldStafOptions, newStafOptions);
}

fs.writeFileSync('src/components/PerizinanView.tsx', code);
console.log("Patched PerizinanView");
