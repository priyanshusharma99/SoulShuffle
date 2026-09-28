
const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

code = code.replace(
  /description,\s*isPaid: false\s*\};/g,
  'description,\\n      isPaid: false,\\n      categoryImage\\n    };'
);

fs.writeFileSync('app/(tabs)/dares.tsx', code);
console.log('Fixed mapper to return categoryImage');

