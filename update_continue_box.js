const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const startStr = '              {/* Continue Together */}\n              <View className="px-5 mb-8">';
const endStr = '              {/* Recent Moments */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const originalContinue = code.substring(startIndex + '              {/* Continue Together */}\n'.length, endIndex);
  
  const newBlock = `              {/* Continue Together / Couple Room Connect */}
              {(!activeRoom || activeRoom.status !== 'ACTIVE') ? (
                <View className="px-5 mb-8">
                  <View className="bg-[#241318] p-6 rounded-[32px] border border-rose-950/30 overflow-hidden relative">
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-rose-900/10" />
                    <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-rose-900/10" />
                    
                    <View className="flex-row items-center mb-5">
                      <View className="bg-[#381a24] w-10 h-10 rounded-full items-center justify-center mr-3">
                        <Ionicons name="people" size={20} color="#fb7185" />
                      </View>
                      <Text className="text-[#fb7185] text-[11px] font-black tracking-widest uppercase">
                        COUPLE ROOM
                      </Text>
                    </View>

                    <Text className="text-white text-[26px] font-black leading-tight tracking-tight mb-2">
                      Connect with{'\\n'}Your Partner
                    </Text>
                    <Text className="text-slate-400 text-[13px] font-medium leading-5 mb-6">
                      Create or join a private room to start playing together.
                    </Text>

                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 bg-[#e11d48] py-4 rounded-2xl flex-row items-center justify-center"
                        onPress={() => openRoomModal('create')}
                      >
                        <Ionicons name="add-circle" size={18} color="white" />
                        <Text className="text-white font-bold text-[14px] ml-1.5 tracking-wide">Create</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex-1 bg-[#0d9488] py-4 rounded-2xl flex-row items-center justify-center"
                        onPress={() => openRoomModal('join')}
                      >
                        <Ionicons name="log-in" size={18} color="white" />
                        <Text className="text-white font-bold text-[14px] ml-1.5 tracking-wide">Join</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
${originalContinue}              )}
`;
  code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
  fs.writeFileSync('app/(tabs)/index.tsx', code);
  console.log('Replaced successfully!');
} else {
  console.log('Bounds not found');
}
