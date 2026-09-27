const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
code = code.replace(
  "        </>\n                  ) : (\n              {activeRoom?.status === 'WAITING' ? (",
  "        </>\n                  ) : (\n            <View className=\"px-5 mt-8 pb-10\">\n              {activeRoom?.status === 'WAITING' ? ("
);
fs.writeFileSync('app/(tabs)/index.tsx', code);
