
const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
code = code.replace(
  'if (router.canDismiss()) { router.dismissAll(); }\\n        setTimeout(() => router.replace(\\'/\\'), 100);',
  'router.navigate(\\'/\\');'
);
fs.writeFileSync('app/(tabs)/_layout.tsx', code);
console.log('Fixed router in _layout.tsx');

