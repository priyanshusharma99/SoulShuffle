const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const startTag = "{activeRoom && activeRoom.status === 'ACTIVE' ? (";
const endTag = ") : (";

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newUI = `
              <>
              {/* Header / Greeting */}
              <View className="px-5 mt-6 mb-4 flex-row justify-between items-end">
                <View>
                  <Text className="text-gray-400 text-sm font-medium mb-1">
                    Good evening,
                  </Text>
                  <Text className="text-white text-2xl font-black tracking-tight">
                    {userName} & {partnerName} 💕
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 13, fontStyle: 'italic' }}>Same team</Text>
                  <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 11, fontStyle: 'italic' }}>Always ♡</Text>
                </View>
              </View>

              {/* Today's Dare (Hero) */}
              <View className="px-5 mb-8">
                <View className="w-full h-64 rounded-[32px] overflow-hidden relative bg-[#1a0c10]">
                  <Image source={require('@/assets/images/couple_beach_sunset.jpg')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/40" />
                  
                  <View className="absolute top-5 left-5 bg-black/50 px-3 py-1.5 rounded-full flex-row items-center">
                    <Text className="text-[#facc15] text-xs mr-1">⚡</Text>
                    <Text className="text-white text-xs font-bold tracking-widest">TODAY'S DARE</Text>
                  </View>
                  
                  <View className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="heart-outline" size={16} color="white" />
                  </View>

                  <View className="absolute top-1/2 -mt-4 left-5">
                    <Text className="text-white text-3xl font-black leading-tight">
                      A new side{'\\n'}of you
                    </Text>
                    <Ionicons name="heart-outline" size={14} color="#fbcfe8" style={{ position: 'absolute', right: -20, top: '40%' }} />
                  </View>

                  <View className="absolute bottom-5 left-5 right-5 flex-row justify-between items-end">
                    <TouchableOpacity className="bg-[#ff2d55] px-5 py-3 rounded-full flex-row items-center" onPress={() => router.push('/dares')}>
                      <Text className="text-white font-bold text-[14px] mr-2">Start Dare</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 14, fontStyle: 'italic' }}>Small dares</Text>
                      <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 11, fontStyle: 'italic' }}>Big connections ♡</Text>
                    </View>
                  </View>
                </View>
              </View>

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

              {/* Recent Moments */}
              <View className="mb-8">
                <View className="flex-row items-center justify-between px-5 mb-4">
                  <Text className="text-white text-lg font-bold">Recent Moments</Text>
                  <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/history')}>
                    <Text className="text-[#ff2d55] text-[13px] font-bold mr-1">See all</Text>
                    <Ionicons name="chevron-forward" size={12} color="#ff2d55" />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                  <View style={{ width: 130, height: 180, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_beach_sunset.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/20" />
                    <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <Ionicons name="heart-outline" size={16} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-3 left-3 right-3">
                      <Text className="text-white font-bold text-[13px]">Sunset Walk</Text>
                      <Text className="text-gray-300 text-[10px] mt-0.5">2 days ago</Text>
                    </View>
                  </View>
                  <View style={{ width: 130, height: 180, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_cafe_morning.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/20" />
                    <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <Ionicons name="heart-outline" size={16} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-3 left-3 right-3">
                      <Text className="text-white font-bold text-[13px]">Coffee Date</Text>
                      <Text className="text-gray-300 text-[10px] mt-0.5">4 days ago</Text>
                    </View>
                  </View>
                  <View style={{ width: 130, height: 180, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_cooking_dinner.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/20" />
                    <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <Ionicons name="heart-outline" size={16} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-3 left-3 right-3">
                      <Text className="text-white font-bold text-[13px]">Late Night Talk</Text>
                      <Text className="text-gray-300 text-[10px] mt-0.5">1 week ago</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* Picked for You 💕 */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between px-5 mb-4">
                  <Text className="text-white text-lg font-bold">Picked for You 💕</Text>
                  <TouchableOpacity className="flex-row items-center">
                    <Text className="text-[#ff2d55] text-[13px] font-bold mr-1">See all</Text>
                    <Ionicons name="chevron-forward" size={12} color="#ff2d55" />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                  <View style={{ width: 160, height: 220, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_beach_sunset.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/30" />
                    <View className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <View className="absolute top-3 left-3 bg-[#ff2d55] px-2 py-1 rounded-md">
                      <Text className="text-white font-bold text-[9px] tracking-wider">ROMANCE</Text>
                    </View>
                    <Ionicons name="heart-outline" size={18} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-4 left-4 right-4">
                      <Text className="text-white font-bold text-[15px] leading-tight">Handwritten Compliments</Text>
                    </View>
                  </View>
                  <View style={{ width: 160, height: 220, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_stargazing.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/30" />
                    <View className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <View className="absolute top-3 left-3 bg-[#2563eb] px-2 py-1 rounded-md">
                      <Text className="text-white font-bold text-[9px] tracking-wider">DEEP</Text>
                    </View>
                    <Ionicons name="heart-outline" size={18} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-4 left-4 right-4">
                      <Text className="text-white font-bold text-[15px] leading-tight">Our Dream Someday</Text>
                    </View>
                  </View>
                  <View style={{ width: 160, height: 220, borderRadius: 24, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/couple_cooking_dinner.jpg')} style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 bg-black/30" />
                    <View className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <View className="absolute top-3 left-3 bg-[#9333ea] px-2 py-1 rounded-md">
                      <Text className="text-white font-bold text-[9px] tracking-wider">FUN</Text>
                    </View>
                    <Ionicons name="heart-outline" size={18} color="white" style={{ position: 'absolute', top: 12, right: 12 }} />
                    <View className="absolute bottom-4 left-4 right-4">
                      <Text className="text-white font-bold text-[15px] leading-tight">Yes or No</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
              </>
`;
  code = code.substring(0, startIndex + startTag.length) + newUI + code.substring(endIndex);
  fs.writeFileSync('app/(tabs)/index.tsx', code);
  console.log('UI Replaced successfully!');
} else {
  console.log('Could not find start/end tags.');
}
