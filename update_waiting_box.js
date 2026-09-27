const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const startStr = '              {/* Continue Together / Couple Room Connect */}';
const endStr = '              {/* Recent Moments */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  // Extract everything from the end of the Couple Room box to the start of Recent Moments
  // We need the original Continue Together block.
  const continueTogetherStr = '              ) : (\n              {/* Continue Together */}';
  const continueStartIndex = code.indexOf(continueTogetherStr, startIndex);
  let originalContinue = code.substring(continueStartIndex + '              ) : (\n'.length, endIndex);
  
  // Remove the trailing `              )}` from originalContinue
  originalContinue = originalContinue.replace(/\s*}\)\s*$/, '');

  const newBlock = `              {/* Continue Together / Couple Room Connect */}
              {!activeRoom ? (
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
              ) : activeRoom.status === 'WAITING' ? (
                <View className="px-5 mb-8">
                  <View className="bg-[#1a0c10] rounded-[32px] p-6 border border-rose-950/40 relative overflow-hidden">
                    <View className="absolute -top-4 -right-4 opacity-10">
                      <Ionicons name="time" size={100} color="#f43f5e" />
                    </View>
                    <Text className="text-xl font-black text-white tracking-tight mb-2">
                      Waiting for Partner...
                    </Text>
                    <Text className="text-sm font-medium text-slate-400 mb-6 leading-5">
                      Share the room code below with your partner so they can join your Love Room.
                    </Text>

                    <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1.5">
                      Room Code
                    </Text>
                    <View className="flex-row items-center justify-between mb-6 bg-[#200e14] p-4 rounded-xl border border-rose-950/20">
                      <Text className="text-2xl font-black text-rose-400 tracking-widest">{activeRoom.code}</Text>
                      <TouchableOpacity onPress={async () => {
                        if (activeRoom?.code) {
                          await Clipboard.setStringAsync(activeRoom.code);
                          Alert.alert("Copied!", "Room code copied to clipboard.");
                        }
                      }} className="bg-rose-900/40 px-4 py-2 rounded-full flex-row items-center">
                        <Ionicons name="copy-outline" size={16} color="#fda4af" />
                        <Text className="text-sm font-bold text-rose-300 ml-1.5">Copy</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLeaveRoom} className="py-4 flex-row items-center justify-center border-2 border-red-900/30 rounded-xl bg-red-950/10">
                      <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                      <Text className="text-sm font-bold text-red-500 ml-2">Cancel / Leave Room</Text>
                    </TouchableOpacity>
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
