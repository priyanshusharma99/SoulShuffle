const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');

const regex = /\/\/.*?Logout handler.*?useEffect\(\(\) => \{\s*const sub = DeviceEventEmitter\.addListener\('app:logout'[\s\S]*?\}\, \[router\]\);/g;
code = code.replace(regex, '');

fs.writeFileSync('app/(tabs)/_layout.tsx', code);
console.log('Removed duplicate logout listener from tabs');
