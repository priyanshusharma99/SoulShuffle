
const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

// Remove closeSidebar() from handleLogout
code = code.replace(/setIsLoggingOut\(true\);\s*closeSidebar\(\);/, 'setIsLoggingOut(true);');

// Replace the end of handleLogout
code = code.replace(
  /setIsLoggingOut\(false\);\s*setTimeout\(\(\) => \{[\s\S]*?\}, 100\);/g,
  'router.replace(\'/\');'
);

fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Fixed Sidebar forever');

