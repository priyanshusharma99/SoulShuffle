const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const target = `<View className="flex-1 mr-4">
                  <Text className="text-gray-400 text-sm font-medium mb-1">
                    Good evening,
                  </Text>
                  <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1} ellipsizeMode="tail">
                    {userName} & {partnerName} 💕
                  </Text>
                </View>`;

const targetWin = `<View className="flex-1 mr-4">\r
                  <Text className="text-gray-400 text-sm font-medium mb-1">\r
                    Good evening,\r
                  </Text>\r
                  <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1} ellipsizeMode="tail">\r
                    {userName} & {partnerName} 💕\r
                  </Text>\r
                </View>`;

const replace = `<View style={{ flex: 1, marginRight: 16, overflow: 'hidden' }}>
                  <Text className="text-gray-400 text-sm font-medium mb-1">
                    Good evening,
                  </Text>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }} numberOfLines={1} ellipsizeMode="tail">
                    {userName} & {partnerName} 💕
                  </Text>
                </View>`;

const replaceWin = `<View style={{ flex: 1, marginRight: 16, overflow: 'hidden' }}>\r
                  <Text className="text-gray-400 text-sm font-medium mb-1">\r
                    Good evening,\r
                  </Text>\r
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }} numberOfLines={1} ellipsizeMode="tail">\r
                    {userName} & {partnerName} 💕\r
                  </Text>\r
                </View>`;

if (code.includes(target)) {
  code = code.replace(target, replace);
} else if (code.includes(targetWin)) {
  code = code.replace(targetWin, replaceWin);
} else {
  console.log("Could not find string");
}

fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Fixed inline style for truncation');
