const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/dares.tsx', 'utf8');

const badStr = `                        elevation: 3\n                        }}\n                      >\n                        <View style={{ width: '100%', height: '65%', position: 'relative' }}>`;
const newStr = `                        elevation: 3\n                      }}\n                    >\n                      <View style={{ width: '100%', height: '65%', position: 'relative' }}>`;

code = code.replace(badStr, newStr);

const badStrWin = `                        elevation: 3\r\n                        }}\r\n                      >\r\n                        <View style={{ width: '100%', height: '65%', position: 'relative' }}>`;
const newStrWin = `                        elevation: 3\r\n                      }}\r\n                    >\r\n                      <View style={{ width: '100%', height: '65%', position: 'relative' }}>`;

code = code.replace(badStrWin, newStrWin);

fs.writeFileSync('app/(tabs)/dares.tsx', code);
console.log('Fixed line 835 of dares.tsx');
