
const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

code = code.replace(
  /setIsLoggingOut\(false\);\s*DeviceEventEmitter\.emit\('app:logout'\);/,
  'setIsLoggingOut(false);\n                setTimeout(() => {\n                  if (router.canDismiss()) router.dismissAll();\n                  router.replace(\'/\');\n                }, 100);'
);

fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Fixed Sidebar routing');

