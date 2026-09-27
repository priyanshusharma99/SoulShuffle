const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const replacement = `
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const roomCreatedMs = activeRoom?.created_at ? new Date(activeRoom.created_at).getTime() : Date.now();
  const daysElapsed = Math.floor((Date.now() - roomCreatedMs) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(roomDuration, daysElapsed));
  const progressPercent = Math.max(2, Math.min(100, Math.round((currentDay / roomDuration) * 100)));
`;

code = code.replace(
  "  const roomDuration = (activeRoom as any)?.duration === '30_DAYS' ? 30 : 7;\r\n  const currentDay = 1; // Replace with actual logic later\r\n  const progressPercent = 0; // Replace with actual logic later", 
  replacement
);
code = code.replace(
  "  const roomDuration = (activeRoom as any)?.duration === '30_DAYS' ? 30 : 7;\n  const currentDay = 1; // Replace with actual logic later\n  const progressPercent = 0; // Replace with actual logic later", 
  replacement
);

fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Injected variables!');
