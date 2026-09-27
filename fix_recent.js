const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const start = lines.findIndex(l => l.includes('{/* Recent Moments */}'));
const end = lines.findIndex((l, idx) => idx > start && l.includes('</ScrollView>'));

if (start !== -1 && end !== -1) {
  const dynamicRecent = `              {/* Recent Moments */}
              {cardSends && cardSends.length > 0 && (
                <View className="mb-8">
                  <View className="flex-row items-center justify-between px-5 mb-4">
                    <Text className="text-white text-lg font-bold">Recent Moments</Text>
                    <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/history')}>
                      <Text className="text-[#ff2d55] text-[13px] font-bold mr-1">See all</Text>
                      <Ionicons name="chevron-forward" size={12} color="#ff2d55" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    {cardSends.slice(0, 5).map((send: any) => (
                      <View key={send.id} style={{ width: 130, height: 180, borderRadius: 24, overflow: 'hidden' }}>
                        {send.card?.image_url ? (
                          <Image source={{ uri: send.card.image_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <View style={{ width: '100%', height: '100%', backgroundColor: '#2a1a20' }} />
                        )}
                        <View className="absolute inset-0 bg-black/20" />
                        <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        <View className="absolute bottom-3 left-3 right-3">
                          <Text className="text-white font-bold text-[13px]" numberOfLines={1}>{send.card?.title || 'Challenge'}</Text>
                          <Text className="text-gray-300 text-[10px] mt-0.5">
                            {new Date(send.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}`;

  lines.splice(start, end - start + 2, dynamicRecent); // remove up to </View>
  fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
  console.log('Fixed recent moments');
} else {
  console.log('Not found');
}
