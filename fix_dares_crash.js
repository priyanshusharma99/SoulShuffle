const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

const targetStr = `    const frontCard = data[currentIndex];
    const frontPosition = getPosition(frontCard.id);`;

const replaceStr = `    if (!data || data.length === 0) return null;
    const frontCard = data[currentIndex];
    if (!frontCard) return null;
    const frontPosition = getPosition(frontCard.id);`;

const targetStrWin = `    const frontCard = data[currentIndex];\r\n    const frontPosition = getPosition(frontCard.id);`;
const replaceStrWin = `    if (!data || data.length === 0) return null;\r\n    const frontCard = data[currentIndex];\r\n    if (!frontCard) return null;\r\n    const frontPosition = getPosition(frontCard.id);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('app/(tabs)/dares.tsx', code);
  console.log('Fixed Dares crash');
} else if (code.includes(targetStrWin)) {
  code = code.replace(targetStrWin, replaceStrWin);
  fs.writeFileSync('app/(tabs)/dares.tsx', code);
  console.log('Fixed Dares crash');
}
