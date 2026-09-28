
const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');

// Change tab bar background
code = code.replace(/backgroundColor: isDark \? '#261216' : '#14080B'/, \ackgroundColor: isDark ? '#261216' : '#FFFFFF'\);
code = code.replace(/borderColor: isDark \? '#4A232A' : '#221115'/, \orderColor: isDark ? '#4A232A' : '#F1E8EC'\);

// Let's check active/inactive tint colors
code = code.replace(/const activeColor = '#FF296D';/, \const activeColor = '#FF296D';\);
code = code.replace(/const inactiveColor = isDark \? '#888' : '#777';/, \const inactiveColor = isDark ? '#888' : '#A19AA0';\);
code = code.replace(/const activeBg = isDark \? 'rgba\\(255,41,109,0\.15\\)' : 'rgba\\(255,41,109,0\.2\\)';/, \const activeBg = isDark ? 'rgba(255,41,109,0.15)' : 'rgba(255,41,109,0.1)';\);

fs.writeFileSync('app/(tabs)/_layout.tsx', code);

