const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

// 1. Inject calculation logic before the main return
const mainReturnStr = '  return (\n    <SafeAreaView';
const calcLogic = `
  // ── Dynamic calculations for Continue Together ──
  const roomDuration = activeRoom?.expiry_type === '30_DAYS' ? 30 : 7;
  const roomCreatedMs = activeRoom?.created_at ? new Date(activeRoom.created_at).getTime() : Date.now();
  const daysElapsed = Math.floor((Date.now() - roomCreatedMs) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(roomDuration, daysElapsed));
  const progressPercent = Math.max(2, Math.min(100, Math.round((currentDay / roomDuration) * 100))); // At least 2% so the red bar shows slightly

  return (
    <SafeAreaView`;

code = code.replace(mainReturnStr, calcLogic);

// 2. Replace static Continue Together UI with dynamic UI
const oldContinueStr = `              <View className="px-5 mb-8">
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
              </View>`;

const newContinueStr = `              <View className="px-5 mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-bold">Continue Together</Text>
                  <TouchableOpacity className="flex-row items-center" onPress={() => navigateTo("/(tabs)/dares")}>
                    <Text className="text-[#ff2d55] text-[13px] font-bold mr-1">See all</Text>
                    <Ionicons name="chevron-forward" size={12} color="#ff2d55" />
                  </TouchableOpacity>
                </View>
                
                <View className="bg-[#180d12] p-4 rounded-3xl flex-row items-center border border-rose-950/30">
                  <Image source={require('@/assets/images/couple_cafe_morning.jpg')} style={{ width: 60, height: 60, borderRadius: 16 }} />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-white font-bold text-[14px] mb-1" numberOfLines={1}>{roomDuration}-Day Connection Journey</Text>
                    <Text className="text-gray-400 text-[11px] mb-2">Day {currentDay} of {roomDuration}</Text>
                    <View className="flex-row items-center w-full">
                      <View className="flex-1 h-1.5 bg-[#2a1720] rounded-full overflow-hidden flex-row">
                        <View className="h-full bg-[#ff2d55]" style={{ width: \`\${progressPercent}%\` }} />
                      </View>
                      <Text className="text-gray-400 text-[10px] ml-2">{progressPercent}%</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => navigateTo("/(tabs)/dares")} className="bg-[#3b1723] px-4 py-2.5 rounded-full flex-row items-center ml-2">
                    <Text className="text-white font-bold text-[12px] mr-1.5">Continue</Text>
                    <Ionicons name="arrow-forward" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>`;

if (code.includes(oldContinueStr.trim().substring(0, 50))) {
    // Find the exact block
    const startIndex = code.indexOf('<Text className="text-white text-lg font-bold">Continue Together</Text>');
    if(startIndex !== -1) {
       // Since formatting might differ slightly, just replace the whole section safely:
       const sectionStart = code.lastIndexOf('<View className="px-5 mb-8">', startIndex);
       const sectionEndStr = '              </View>\n              )}\n';
       const sectionEnd = code.indexOf('              </View>', code.indexOf('</View>', startIndex + 500)) + '              </View>'.length;
       
       code = code.substring(0, sectionStart) + newContinueStr + code.substring(sectionEnd);
       fs.writeFileSync('app/(tabs)/index.tsx', code);
       console.log('Replaced successfully!');
    }
} else {
    // Let's use a regex or string fallback
    console.log('Could not strictly match old string. Looking for partials...');
}
