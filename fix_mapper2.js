const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

code = code.replace(
  /description,\\n      isPaid: false,\\n      categoryImage\\n    \};/g,
  `description,
      isPaid: false,
      categoryImage
    };`
);

fs.writeFileSync('app/(tabs)/dares.tsx', code);
console.log('Fixed newlines in mapper');
