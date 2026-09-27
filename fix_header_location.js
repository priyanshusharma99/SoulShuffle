const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const unifiedHeaderStart = '        {/* ── 1. Top Header (Unified/Sticky) ── */}';
const unifiedHeaderEnd = '        </View>';

// Find exactly the unified header block
const lines = code.split('\n');
const headerStartIdx = lines.findIndex(l => l.includes('{/* ── 1. Top Header (Unified/Sticky) ── */}'));

// Find end of header by counting <View> </View>
let headerEndIdx = -1;
let count = 0;
for (let i = headerStartIdx + 1; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('<View')) count += (l.match(/<View/g) || []).length;
  if (l.includes('</View>')) count -= (l.match(/<\/View>/g) || []).length;
  if (count === 0 && l.includes('</View>')) {
    headerEndIdx = i;
    break;
  }
}

if (headerStartIdx !== -1 && headerEndIdx !== -1) {
  const headerBlock = lines.slice(headerStartIdx, headerEndIdx + 1).join('\n');
  
  // Remove it from its current position
  lines.splice(headerStartIdx, headerEndIdx - headerStartIdx + 1);
  
  // Find the MAIN ScrollView, which comes after </Modal>
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
  console.log('Could not find unified header');
}
