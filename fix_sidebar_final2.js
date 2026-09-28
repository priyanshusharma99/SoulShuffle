const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const regex = /console\.log\('\[LOGOUT\] Step 4[\s\S]*?console\.log\('\[LOGOUT\] Step 5: Done\.'\);/;
const replacement = `console.log('[LOGOUT] Step 4: Emitting app:logout...');
                DeviceEventEmitter.emit('app:logout');
                console.log('[LOGOUT] Step 5: Done.');`;

code = code.replace(regex, replacement);
fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Fixed Sidebar to just emit');
