
const fs = require('fs');

let sidebar = fs.readFileSync('components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/router\.navigate\('\/'\);/g, 'setIsLoggingOut(false); setTimeout(() => { while (router.canGoBack()) { router.back(); } router.replace(\'/\'); }, 100);');
fs.writeFileSync('components/Sidebar.tsx', sidebar);

let layout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
layout = layout.replace(/router\.navigate\('\/'\);/g, 'setTimeout(() => { while (router.canGoBack()) { router.back(); } router.replace(\'/\'); }, 100);');
fs.writeFileSync('app/(tabs)/_layout.tsx', layout);

console.log('Fixed navigation globally');

