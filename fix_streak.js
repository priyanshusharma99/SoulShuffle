const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const targetStr = `
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const roomCreatedMs = activeRoom?.created_at ? new Date(activeRoom.created_at).getTime() : Date.now();
  const daysElapsed = Math.floor((Date.now() - roomCreatedMs) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(roomDuration, daysElapsed));
  const progressPercent = Math.max(2, Math.min(100, Math.round((currentDay / roomDuration) * 100)));
`;

const replaceStr = `
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const currentDay = Math.min(roomDuration, cardSends ? cardSends.length : 0);
  const progressPercent = Math.max(2, Math.min(100, Math.round((currentDay / roomDuration) * 100)));
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
} else {
  // try regex or split
  const lines = code.split('\n');
  const s = lines.findIndex(l => l.includes('const roomDuration = activeRoom'));
  if (s !== -1) {
    lines.splice(s, 5, replaceStr);
    code = lines.join('\n');
  }
}

fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Fixed dynamic streak calculations');
