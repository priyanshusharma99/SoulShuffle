const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const returnStr = `    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 16 }}>Logging out...</Text>
      </View>
    );`;

const idx = code.indexOf(returnStr);
const beforeReturn = code.substring(0, idx + returnStr.length + 5);

const newReturn = `
  const MenuItem = ({ icon, label, path, isActive = false, isLogout = false }: { icon: any, label: string, path?: string, isActive?: boolean, isLogout?: boolean }) => (
    <TouchableOpacity
      onPress={() => isLogout ? handleLogout() : navigateTo(path!)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: isActive || isLogout ? '#3c101c' : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: isActive || isLogout ? 'transparent' : '#2d141d',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name={icon} size={20} color={isLogout ? "#e55f75" : isActive ? "white" : "#ffb3c6"} />
        </View>
        <Text style={{
          color: isLogout ? "#e55f75" : "white",
          fontWeight: '700',
          fontSize: 16,
          marginLeft: 16,
        }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={isLogout ? "#e55f75" : "white"} />
    </TouchableOpacity>
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Backdrop Overlay */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => !isLoggingOut && closeSidebar()}
        />

        {/* Menu Panel */}
        <View style={{ width: '82%', height: '100%', backgroundColor: '#130508', borderTopRightRadius: 40, borderBottomRightRadius: 40, paddingTop: 60, zIndex: 1001 }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: 24, flex: 1 }}>

            {/* Avatar Section */}
            <View style={{ width: 84, height: 84, marginBottom: 16, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ff2d55' }}>
              <Image
                source={{ uri: userAvatar }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ fontSize: 26, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              {partnerName ? \`\${userName} & \${partnerName}\` : userName}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#888', marginTop: 4, marginBottom: 24 }}>
              Same team, Always ♡
            </Text>
            
            <View style={{ height: 1, backgroundColor: '#2a141a', marginBottom: 24 }} />

            {/* Menu Links */}
            <View style={{ flex: 1 }}>
              <MenuItem icon="home" label="Home" path="/" isActive={true} />
              <MenuItem icon="trophy" label="Challenges" path="/dares" />
              <MenuItem icon="time" label="History" path="/history" />
              <MenuItem icon="cart" label="Store" path="/store" />
              <MenuItem icon="pricetag" label="Coin Toss" path="/coin-toss" />
            </View>

            {/* Bottom Menu Items */}
            <View style={{ marginTop: 'auto' }}>
              <View style={{ height: 1, backgroundColor: '#2a141a', marginBottom: 24 }} />
              <MenuItem icon="settings" label="Settings" path="/profile" />
              <MenuItem icon="log-out-outline" label="Log Out" isLogout={true} />
            </View>
          </View>

          {/* Footer */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: '#666' }}>SOUL SHUFFLE</Text>
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#555', marginTop: 4 }}>v 1.1.1</Text>
          </View>
        </View>
      </View>

      {/* FULL-SCREEN LOADING SPINNER */}
      {isLoggingOut && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(19,5,8,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#1e1e1e', padding: 32, borderRadius: 16, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 24, fontSize: 18 }}>Signing Out...</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 8 }}>Securing your session</Text>
          </View>
        </View>
      )}
    </View>
  );
}
`;

fs.writeFileSync('components/Sidebar.tsx', beforeReturn + newReturn);
console.log('Sidebar replaced!');
