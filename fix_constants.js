
const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');
code = 'import Constants, { ExecutionEnvironment } from \'expo-constants\';\n' + code;
fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Added Constants import');

