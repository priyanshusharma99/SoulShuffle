const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
code = code.replace(/\x0Clex-1 py-3\.5 rounded-lg items-center /g, '`flex-1 py-3.5 rounded-lg items-center`');
code = code.replace(/\x0Cont-bold text-\[13px\] /g, '`font-bold text-[13px]`');
code = code.replace(/\x0Clex-1 bg-\[#ff2d55\] py-3\.5 rounded-lg items-center /g, '`flex-1 bg-[#ff2d55] py-3.5 rounded-lg items-center`');
code = code.replace(/\x0Cont-bold text-white text-\[13px\] /g, '`font-bold text-white text-[13px]`');
fs.writeFileSync('app/(tabs)/index.tsx', code);
