const fs = require('fs');

let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

// It's literally a newline character inside a double quoted string!
// Let's replace the raw newline with \n
code = code.replace(
  'console.log("\n=== EXACT BACKEND RESPONSE (FIRST CARD) ===");',
  'console.log("\\n=== EXACT BACKEND RESPONSE (FIRST CARD) ===");'
);

code = code.replace(
  'console.log("=========================================\n");',
  'console.log("=========================================\\n");'
);

fs.writeFileSync('app/(tabs)/dares.tsx', code);
console.log('Fixed multiline string in dares.tsx');
