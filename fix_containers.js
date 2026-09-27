const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const start = lines.findIndex(l => l.includes('{userName} & {partnerName} 💕'));

if (start !== -1) {
  if (lines[start - 5].includes('<View>')) {
    lines[start - 5] = lines[start - 5].replace('<View>', '<View style={{ flex: 1, marginRight: 16, overflow: "hidden" }}>');
  }

  if (lines[start + 3].includes("flex-end")) {
    lines[start + 3] = lines[start + 3].replace("<View style={{ alignItems: 'flex-end' }}>", "<View style={{ alignItems: 'flex-end', flexShrink: 0 }}>");
  }

  fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
  console.log('Fixed container styles!');
} else {
  console.log('Could not find string');
}
