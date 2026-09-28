
const fs = require('fs');
let layout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
layout = layout.replace(/router\.replace\('\/'\)/g, 'router.navigate(\'/\')');
fs.writeFileSync('app/(tabs)/_layout.tsx', layout);

let sidebar = fs.readFileSync('components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/router\.replace\('\/'\)/g, 'router.navigate(\'/\')');
fs.writeFileSync('components/Sidebar.tsx', sidebar);
console.log('Switched to router.navigate');

