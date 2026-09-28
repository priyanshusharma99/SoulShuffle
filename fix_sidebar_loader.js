
const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

// Remove setIsLoggingOut(false) from the try block so it stays spinning
code = code.replace(
  /setIsLoggingOut\(false\);\s*setTimeout\(\(\) => \{/g,
  '// loader stays until unmount\n                setTimeout(() => {'
);

fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Fixed loader in Sidebar');

