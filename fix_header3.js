const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const start = lines.findIndex(l => l.includes('{userName} & {partnerName} 💕'));

if (start !== -1) {
  lines[start-3] = lines[start-3].replace('<View>', '<View className="flex-1 mr-4">');
  lines[start-1] = lines[start-1].replace('tracking-tight">', 'tracking-tight" numberOfLines={1} ellipsizeMode="tail">');
  lines[start+2] = lines[start+2].replace("alignItems: 'flex-end'", "alignItems: 'flex-end', flexShrink: 0");
  
  fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
  console.log('Fixed header layout');
} else {
  console.log('Could not find string');
}
