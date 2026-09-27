import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the component
    component_code = '''
const PendingDaresCarousel = ({ pendingChallenges, currentUserId }: any) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { width } = useWindowDimensions();

  if (!pendingChallenges || pendingChallenges.length === 0) return null;

  const handleNext = () => setCurrentIndex(prev => (prev < pendingChallenges.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : pendingChallenges.length - 1));

  const frontCard = pendingChallenges[currentIndex];
  const backCard = pendingChallenges.length > 1 ? pendingChallenges[(currentIndex + 1) % pendingChallenges.length] : null;

  const renderCard = (send: any, isBack: boolean) => {
    if (!send) return null;
    const isSentByMe = send.sender_id === currentUserId;
    const btnText = isSentByMe ? "WAITING FOR PARTNER..." : "YOUR TURN TO RESPOND";

    return (
      <View style={{
        width: width * 0.75,
        height: 240,
        backgroundColor: '#261217',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...(isBack ? {
          position: 'absolute',
          top: 30,
          transform: [{ scale: 0.9 }],
          zIndex: 1,
          opacity: 0.8
        } : {
          zIndex: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 10
        })
      }}>
        {/* Top Image */}
        <View style={{ width: '100%', height: '45%' }}>
          <Image source={send.card?.image_url ? { uri: send.card.image_url } : require('@/assets/images/bundle_spicy.jpg')} style={{ width: '100%', height: '100%' }} />
          {/* Sent Badge */}
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#0f2926', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="paper-plane" size={10} color="#2dd4bf" />
            <Text style={{ color: '#2dd4bf', fontSize: 9, fontWeight: '800', marginLeft: 4, letterSpacing: 1 }}>SENT</Text>
          </View>
        </View>

        {/* Bottom Content */}
        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#e55f75', fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }} numberOfLines={1}>
              {send.card?.category || send.card?.card_categories?.name || 'MYSTERY DARE'}
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{send.card?.title || 'Unknown Card'}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#3b111b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="timer-outline" size={12} color="#e55f75" />
              <Text style={{ color: '#e55f75', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>23h 59m 48s</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={{ backgroundColor: '#1a0a0f', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ color: '#d1d5db', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{btnText}</Text>
            <Ionicons name="chevron-forward" size={14} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 24, marginTop: 10 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <View>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>Pending Dares</Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>Cards sent by others</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(180, 100, 20, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people" size={14} color="#fbbf24" />
          <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '800', marginLeft: 6, letterSpacing: 1 }}>{pendingChallenges.length} WAITING</Text>
        </View>
      </View>

      {/* Carousel */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={handlePrev} style={{ padding: 10, zIndex: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e0c12', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', justifyContent: 'center', width: width * 0.75, height: 260 }}>
          {backCard && renderCard(backCard, true)}
          {frontCard && renderCard(frontCard, false)}
        </View>

        <TouchableOpacity onPress={handleNext} style={{ padding: 10, zIndex: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e0c12', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Pagination Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
        {pendingChallenges.map((_: any, idx: number) => (
          <View key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: idx === currentIndex ? '#f43f5e' : '#4b5563', marginHorizontal: 4 }} />
        ))}
      </View>
    </View>
  );
};
'''

    if 'const PendingDaresCarousel =' not in content:
        content = content.replace('export default function Dashboard() {', component_code + '\nexport default function Dashboard() {')

    # Insert usage after Header/Greeting
    # The header block ends with </View> right before <View className="px-5 mb-8"> (Continue Together)
    # Actually, we can inject it right after the header:
    # "Same team</Text>\n                    <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 11, fontStyle: 'italic' }}>Always T</Text>\n                  </View>\n                </View>"
    header_end = "Always T</Text>\n                  </View>\n                </View>"
    usage_code = "\n                <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />\n"
    
    if '<PendingDaresCarousel' not in content:
        content = content.replace(header_end, header_end + usage_code)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Injected PendingDaresCarousel successfully!")

if __name__ == '__main__':
    main()
