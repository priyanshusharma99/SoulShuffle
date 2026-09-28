
const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
code = code.replace(/if \(router\.canDismiss\(\)\) \{ router\.dismissAll\(\); \}\s*setTimeout\(\(\) => router\.replace\('\/'\), 100\);/g, 'router.replace(\\'/\\');');
fs.writeFileSync('app/(tabs)/_layout.tsx', code);
console.log('Done _layout.tsx');

