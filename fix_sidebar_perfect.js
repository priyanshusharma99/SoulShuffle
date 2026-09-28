const fs = require('fs');

let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');
const regex = /console\.log\('\[LOGOUT\] Step 4[\s\S]*?console\.log\('\[LOGOUT\] Step 5: Done\.'\);/;
const replacement = `console.log('[LOGOUT] Step 4: Navigating...');
                setIsLoggingOut(false);
                setTimeout(() => {
                   while (router.canGoBack()) { router.back(); }
                   router.replace('/');
                }, 100);
                console.log('[LOGOUT] Step 5: Done.');`;
code = code.replace(regex, replacement);
fs.writeFileSync('components/Sidebar.tsx', code);

let layout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
const layoutRegex = /console\.log\('\[TABS LAYOUT\] app:logout[\s\S]*?\}\);/;
const layoutReplacement = `console.log('[TABS LAYOUT] app:logout resetting root stack to index');
        setTimeout(() => {
           while (router.canGoBack()) { router.back(); }
           router.replace('/');
        }, 100);
      });`;
layout = layout.replace(layoutRegex, layoutReplacement);
fs.writeFileSync('app/(tabs)/_layout.tsx', layout);

console.log('Done perfect fix');
