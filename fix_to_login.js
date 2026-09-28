const fs = require('fs');

let sidebar = fs.readFileSync('components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/router\.replace\('\/'\)/g, "router.replace('/login')");
fs.writeFileSync('components/Sidebar.tsx', sidebar);

let layout = fs.readFileSync('app/_layout.tsx', 'utf8');
layout = layout.replace(/router\.replace\('\/'\)/g, "router.replace('/login')");
if (!layout.includes('<Stack.Screen name="login"')) {
  layout = layout.replace(
    '<Stack.Screen name="index"',
    '<Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false, animation: "fade" }} />\n              <Stack.Screen name="index"'
  );
}
fs.writeFileSync('app/_layout.tsx', layout);

console.log('Fixed navigation to explicitly use /login');
