
const fs = require('fs');
let code = fs.readFileSync('components/PendingDaresCarousel.tsx', 'utf8');
code = code.replace(/return \\\\h \\\\m \\\\s\\\\;/, 'return \\${hours}h m s\\;');
fs.writeFileSync('components/PendingDaresCarousel.tsx', code);
console.log('Fixed time format');

