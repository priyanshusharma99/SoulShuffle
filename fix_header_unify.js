const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const oldHeaderStart = '          {/* ── 1. Top Header ── */}';
const oldHeaderEnd = '              {/* Header / Greeting */}';

const startIndex = code.indexOf(oldHeaderStart);
const endIndex = code.indexOf(oldHeaderEnd);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to extract this block, delete it, and insert the new unified header BEFORE the ScrollView.
  
  // First, find the ScrollView tag that's just before the Top Header.
  const scrollViewTag = '<ScrollView\\n          showsVerticalScrollIndicator={false}\\n          contentContainerStyle={{ paddingBottom: 110 }}\\n          style={{ flex: 1, backgroundColor: "#0e0609" }}\\n        >';
  const scrollViewTagWin = '<ScrollView\\r\\n          showsVerticalScrollIndicator={false}\\r\\n          contentContainerStyle={{ paddingBottom: 110 }}\\r\\n          style={{ flex: 1, backgroundColor: "#0e0609" }}\\r\\n        >';
  
  let targetScrollView = '';
  if (code.includes(scrollViewTag)) targetScrollView = scrollViewTag;
  else if (code.includes(scrollViewTagWin)) targetScrollView = scrollViewTagWin;
  
  if (targetScrollView) {
    const unifiedHeader = `        {/* ── 1. Top Header (Unified/Sticky) ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, backgroundColor: '#0e0609', zIndex: 10 }}>
          <TouchableOpacity onPress={openSidebar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="menu-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, right: 0, zIndex: -1 }} pointerEvents="none">
            <Ionicons name="infinite" size={24} color="#ff2d55" style={{ transform: [{ rotate: '-15deg' }] }} />
            <Text style={{ color: '#ff2d55', fontWeight: '900', fontSize: 20, letterSpacing: -0.5, marginLeft: 4 }}>SoulShuffle</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => navigateTo("/notifications")} style={{ position: "relative" }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              {unreadCount > 0 && (
                <View style={{ position: "absolute", top: 0, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff2d55", borderWidth: 1.5, borderColor: "#0e0609" }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (activeRoom && activeRoom.status === "ACTIVE") { navigateTo("/profile"); } else { openRoomModal("create"); } }}>
              <Image
                source={{ uri: (activeRoom?.status === "ACTIVE" && partnerAvatar) || userAvatar || ANIMATED_AVATARS[0].url }}
                style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: "#ff2d55" }}
              />
            </TouchableOpacity>
          </View>
        </View>

${targetScrollView}`;

    // Remove the old header inside the ScrollView
    const stringToRemove = code.substring(startIndex, endIndex);
    code = code.replace(stringToRemove, '');
    
    // Replace the opening ScrollView tag with the unified header + the ScrollView tag
    code = code.replace(targetScrollView, unifiedHeader);
    
    fs.writeFileSync('app/(tabs)/index.tsx', code);
    console.log('Successfully unified header!');
  } else {
    console.log('Could not find ScrollView tag');
  }
} else {
  console.log('Could not find Top Header bounds');
}
