
const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

code = code.replace(
  /DeviceEventEmitter\.emit\('app:logout'\);/g,
  'setIsLoggingOut(false);\n                DeviceEventEmitter.emit(\'app:logout\');'
);

fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Fixed Sidebar.tsx part 3');

