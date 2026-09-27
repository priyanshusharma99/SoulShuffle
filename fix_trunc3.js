const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const start = lines.findIndex(l => l.includes('{userName} & {partnerName} 💕'));

if (start !== -1) {
  lines[start-3] = lines[start-3].replace('<View className="flex-1 mr-4">', '<View style={{ flex: 1, marginRight: 16, overflow: "hidden" }}>');
  
  lines[start-1] = lines[start-1].replace('<Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1} ellipsizeMode="tail">', '<Text style={{ color: "white", fontSize: 24, fontWeight: "900", letterSpacing: -0.5 }} numberOfLines={1} ellipsizeMode="tail">');
  
  lines[start-5] = lines[start-5].replace('<View className="px-5 mt-6 mb-4 flex-row justify-between items-end">', '<View className="px-5 mt-6 mb-4 flex-row justify-between items-end" style={{ width: "100%", overflow: "hidden" }}>');
  
  fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
  console.log('Fixed header layout completely');
} else {
  console.log('Could not find string');
}
