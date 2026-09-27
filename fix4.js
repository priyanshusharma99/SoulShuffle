const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
code = code.replace(/className=\{([^}]+)\}/g, (match, p1) => {
  // If there are no backticks and no quotes, and it's a tailwind string, wrap it.
  if (p1.includes('flex-') || p1.includes('font-') || p1.includes('text-')) {
    if (!p1.includes('`') && !p1.includes("'") && !p1.includes('"')) {
      return 'className={`' + p1.trim() + '`}';
    }
  }
  return match;
});
fs.writeFileSync('app/(tabs)/index.tsx', code);
