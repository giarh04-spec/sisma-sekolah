const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const oldButtonStart = `              <button
                onClick={() => setShowFormIzin(!showFormIzin)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Pengajuan Izin / Cuti
              </button>`;

const newButton = `              <button
                onClick={() => setSubTab('perizinan')}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <FileSignature className="w-4 h-4" /> Pengajuan Izin / Cuti Terpadu
              </button>`;

code = code.replace(oldButtonStart, newButton);

// We can remove the modal for Guru Izin
const modalStart = `{/* Form Modal Izin Guru */}`;
const modalEnd = `          {/* Table Rekap */}`;

const startIndex = code.indexOf(modalStart);
const endIndex = code.indexOf(modalEnd);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.slice(0, startIndex) + modalEnd + code.slice(endIndex + modalEnd.length);
}

fs.writeFileSync('src/components/AbsensiView.tsx', code);
console.log('Routed button and removed old modal.');
