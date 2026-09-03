const fs = require('fs');
let code = fs.readFileSync('src/components/PerizinanView.tsx', 'utf-8');

const oldLine = `{formTipe === 'Siswa' && selectedRombel !== '' && filteredSiswaList.length === 0 && (`;
const newLine = `{formTipe === 'Siswa' && selectedRombel === '' && (
                    <option value="" disabled>-- Pilih Kelas Terlebih Dahulu --</option>
                  )}
                  {formTipe === 'Siswa' && selectedRombel !== '' && filteredSiswaList.length === 0 && (`;

if (code.includes(oldLine)) {
    code = code.replace(oldLine, newLine);
}

fs.writeFileSync('src/components/PerizinanView.tsx', code);
console.log("Patched PerizinanView 2");
