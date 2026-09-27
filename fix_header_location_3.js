const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const startIdx = lines.findIndex(l => l.includes('1. Top Header (Unified/Sticky)'));
if (startIdx !== -1) {
  const headerBlock = lines.slice(startIdx, startIdx + 23).join('\n');
  
  // Remove it from its current position
  lines.splice(startIdx, 23);
  
  // Find the MAIN ScrollView, which is the one just after `</Modal>`
  const modalEndIdx = lines.findIndex(l => l.includes('</Modal>'));
  const mainScrollIdx = lines.findIndex((l, idx) => idx > modalEndIdx && l.includes('<ScrollView'));
  
  if (mainScrollIdx !== -1) {
    // Insert header right before main ScrollView
    lines.splice(mainScrollIdx, 0, headerBlock);
    fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
    console.log('Successfully moved header to the right place!');
  } else {
    console.log('Could not find main ScrollView');
  }
} else {
  console.log('Could not find header');
}
