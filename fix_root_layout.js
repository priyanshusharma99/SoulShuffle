
const fs = require('fs');
let code = fs.readFileSync('app/_layout.tsx', 'utf8');

if (!code.includes('rootKey')) {
  code = code.replace(
    'import { useEffect } from \\'react\\';',
    'import { useEffect, useState } from \\'react\\';\\nimport { DeviceEventEmitter } from \\'react-native\\';\\nimport { router } from \\'expo-router\\';'
  );

  const newHook = \
  const [rootKey, setRootKey] = useState(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('app:logout', () => {
      console.log('[ROOT LAYOUT] Received app:logout! NUKING STACK.');
      setRootKey(k => k + 1);
      setTimeout(() => {
        router.replace('/');
      }, 50);
    });
    return () => sub.remove();
  }, []);
\;

  code = code.replace(
    'const colorScheme = useColorScheme();',
    'const colorScheme = useColorScheme();\\n' + newHook
  );

  code = code.replace('<Stack>', '<Stack key={rootKey}>');

  fs.writeFileSync('app/_layout.tsx', code);
  console.log('Fixed root layout');
}

