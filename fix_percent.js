const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const targetStr = `
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const currentDay = Math.min(roomDuration, cardSends ? cardSends.length : 0);
  const progressPercent = Math.max(2, Math.min(100, Math.round((currentDay / roomDuration) * 100)));
`;

const replaceStr = `
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const currentDay = Math.min(roomDuration, cardSends ? cardSends.length : 0);
  const actualPercent = Math.min(100, Math.round((currentDay / roomDuration) * 100));
  const progressPercent = Math.max(2, actualPercent); // so the bar is visible
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  
  // Also replace {progressPercent}% with {actualPercent}% in the text, but keep width: \`\${progressPercent}%\`
  code = code.replace(
    '<Text className="text-gray-400 text-[10px] ml-2">{progressPercent}%</Text>',
    '<Text className="text-gray-400 text-[10px] ml-2">{actualPercent}%</Text>'
  );

  fs.writeFileSync('app/(tabs)/index.tsx', code);
  console.log('Fixed percent variables');
} else {
  console.log('Not found');
}
