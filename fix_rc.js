
const fs = require('fs');
let code = fs.readFileSync('services/revenueCatService.ts', 'utf8');

if (!code.includes('expo-constants')) {
  code = 'import Constants, { ExecutionEnvironment } from \'expo-constants\';\n' + code;
}

code = code.replace(
  'const apiKey = Platform.OS === \'ios\'',
  'const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;\n      if (isExpoGo) {\n        console.log(\'[RevenueCatService] Skipping init in Expo Go.\');\n        return;\n      }\n      const apiKey = Platform.OS === \'ios\''
);

fs.writeFileSync('services/revenueCatService.ts', code);
console.log('Fixed RevenueCat');

