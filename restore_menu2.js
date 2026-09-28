const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const menuItemCode = `
const MenuItem = ({ icon, label, onPress, isActive = false, isLogout = false }: { icon: any, label: string, onPress: () => void, isActive?: boolean, isLogout?: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: isActive || isLogout ? '#3c101c' : 'transparent',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: isActive || isLogout ? 'transparent' : '#2d141d',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon} size={18} color={isLogout ? '#ef4444' : isActive ? '#f43f5e' : '#fbcfe8'} />
      </View>
      <Text style={{
        color: isLogout ? '#ef4444' : isActive ? '#fff' : '#fbcfe8',
        fontSize: 16,
        fontWeight: isActive ? '700' : '500',
      }}>
        {label}
      </Text>
    </View>
    {isActive && (
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#f43f5e' }} />
    )}
  </TouchableOpacity>
);
`;

if (!code.includes('const MenuItem =')) {
  code = code.replace('export default function Sidebar() {', menuItemCode + '\nexport default function Sidebar() {');
  fs.writeFileSync('components/Sidebar.tsx', code);
  console.log('Restored MenuItem');
} else {
  console.log('MenuItem already exists');
}
