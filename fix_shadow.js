
const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
code = code.replace(
  ontSize: 14, fontStyle: 'italic' }}>Small dares</Text>,
  ontSize: 14, fontStyle: 'italic', textShadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Small dares</Text>
);
code = code.replace(
  ontSize: 11, fontStyle: 'italic' }}>Big connections,
  ontSize: 11, fontStyle: 'italic', textShadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Big connections
);
fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Done');

