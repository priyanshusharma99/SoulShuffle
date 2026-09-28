const fs = require('fs');

let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

const regex = /console\.log\("[\r\n]+=== EXACT BACKEND RESPONSE \(FIRST CARD\) ==="\);[\s\S]*?console\.log\("=========================================\r?\n"\);/g;

code = code.replace(regex, '');

fs.writeFileSync('app/(tabs)/dares.tsx', code);
console.log('Removed broken debug logs from dares.tsx');
