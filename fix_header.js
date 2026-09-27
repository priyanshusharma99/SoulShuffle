const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

code = code.replace(
  '<View>\n                  <Text className="text-gray-400 text-sm font-medium mb-1">\n                    Good evening,\n                  </Text>\n                  <Text className="text-white text-2xl font-black tracking-tight">\n                    {userName} & {partnerName} 💕\n                  </Text>\n                </View>\n                <View style={{ alignItems: \\'flex-end\\' }}>',
  '<View className="flex-1 mr-4">\n                  <Text className="text-gray-400 text-sm font-medium mb-1">\n                    Good evening,\n                  </Text>\n                  <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1} ellipsizeMode="tail">\n                    {userName} & {partnerName} 💕\n                  </Text>\n                </View>\n                <View style={{ alignItems: \\'flex-end\\', flexShrink: 0 }}>'
);
code = code.replace(
  '<View>\r\n                  <Text className="text-gray-400 text-sm font-medium mb-1">\r\n                    Good evening,\r\n                  </Text>\r\n                  <Text className="text-white text-2xl font-black tracking-tight">\r\n                    {userName} & {partnerName} 💕\r\n                  </Text>\r\n                </View>\r\n                <View style={{ alignItems: \\'flex-end\\' }}>',
  '<View className="flex-1 mr-4">\r\n                  <Text className="text-gray-400 text-sm font-medium mb-1">\r\n                    Good evening,\r\n                  </Text>\r\n                  <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1} ellipsizeMode="tail">\r\n                    {userName} & {partnerName} 💕\r\n                  </Text>\r\n                </View>\r\n                <View style={{ alignItems: \\'flex-end\\', flexShrink: 0 }}>'
);

fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Fixed header layout');
