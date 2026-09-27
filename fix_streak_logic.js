const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const targetStr = "const currentDay = Math.min(roomDuration, cardSends ? cardSends.length : 0);";
const replaceStr = "const currentDay = Math.min(roomDuration, calculateStreak(cardSends));";

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('app/(tabs)/index.tsx', code);
  console.log('Fixed streak logic!');
} else {
  console.log('Target string not found');
}
