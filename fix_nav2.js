
const fs = require('fs');
let layout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
layout = layout.replace(/router\.navigate\('\/'\);/g, 'setTimeout(() => { if (router.canDismiss()) router.dismissAll(); router.replace(\'/\'); }, 100);');
fs.writeFileSync('app/(tabs)/_layout.tsx', layout);

let sidebar = fs.readFileSync('components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/router\.navigate\('\/'\);/g, 'setTimeout(() => { if (router.canDismiss()) router.dismissAll(); router.replace(\'/\'); }, 100);');
fs.writeFileSync('components/Sidebar.tsx', sidebar);
console.log('Fixed navigation');

