const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const startStr = '              ) : (\nState, useEffect,';
const endStr = '              {/* Recent Moments */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `              ) : (
              {/* Continue Together */}
              <View className="px-5 mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-bold">Continue Together</Text>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-[#ff2d55] text-[13px] font-bold mr-1">See all</Text>
                    <Ionicons name="chevron-forward" size={12} color="#ff2d55" />
                  </TouchableOpacity>
                </View>
                
                <View className="bg-[#180d12] p-4 rounded-3xl flex-row items-center border border-rose-950/30">
                  <Image source={require('@/assets/images/couple_cafe_morning.jpg')} style={{ width: 60, height: 60, borderRadius: 16 }} />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-white font-bold text-[14px] mb-1" numberOfLines={1}>30-Day Connection Jour...</Text>
                    <Text className="text-gray-400 text-[11px] mb-2">Day 12 of 30</Text>
                    <View className="flex-row items-center w-full">
                      <View className="flex-1 h-1.5 bg-[#2a1720] rounded-full overflow-hidden flex-row">
                        <View className="h-full bg-[#ff2d55] w-[40%]" />
                      </View>
                      <Text className="text-gray-400 text-[10px] ml-2">40%</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-[#3b1723] px-4 py-2.5 rounded-full flex-row items-center ml-2">
                    <Text className="text-white font-bold text-[12px] mr-1.5">Continue</Text>
                    <Ionicons name="arrow-forward" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              )}
`;
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('app/(tabs)/index.tsx', code);
  console.log('Fixed syntax error!');
} else {
  console.log('Could not find bounds to fix syntax error');
}
