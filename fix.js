const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const startStr = '                  <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "800" }}>Late Night Talk</Text>';
const endStr = '          ) : (';
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = startStr + '\n' +
    '                  <Text style={{ color: "#cbd5e1", fontSize: 10, fontWeight: "500", marginTop: 1 }}>\n' +
    '                    1 week ago\n' +
    '                  </Text>\n' +
    '                </View>\n' +
    '              </View>\n' +
    '            </ScrollView>\n' +
    '          </View>\n' +
    '        </>\n' +
    '        ';
  const newCode = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
  fs.writeFileSync('app/(tabs)/index.tsx', newCode);
  console.log('Fixed block');
} else {
  console.log('Could not find block');
}
