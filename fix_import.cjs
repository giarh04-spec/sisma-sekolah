const fs = require('fs');
let code = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

if (!code.includes('FileSignature,')) {
  code = code.replace("MessageSquare,", "MessageSquare,\n  FileSignature,");
  fs.writeFileSync('src/components/AbsensiView.tsx', code);
}
console.log('Fixed import');
