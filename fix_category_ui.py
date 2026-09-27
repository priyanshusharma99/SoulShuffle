import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the block we need to replace
    old_block = '''                      >
                        <View style={{ width: '100%', height: '52%' }}>
                          <Image source={cat.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 8, paddingBottom: 2 }}>
                          <Text 
                            numberOfLines={1} 
                            adjustsFontSizeToFit 
                            minimumFontScale={0.85}
                            style={{ fontSize: 14, fontWeight: '800', color: selectedCategory === cat.id ? '#FFF' : cat.color, textAlign: 'center', width: '100%' }}
                          >
                            {cat.label}
                          </Text>
                          <Text 
                            numberOfLines={1}
                            style={{ fontSize: 12, fontWeight: '700', color: selectedCategory === cat.id ? 'rgba(255,255,255,0.9)' : subTextColor, marginTop: 3, textAlign: 'center' }}
                          >
                            {cat.count} {cat.count === 1 ? 'Card' : 'Cards'}
                          </Text>
                        </View>
                      </TouchableOpacity>'''

    new_block = '''                      >
                        <View style={{ width: '100%', height: '65%', position: 'relative' }}>
                          <Image source={cat.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          
                          {/* Top Right Card Count Badge */}
                          <View style={{ 
                            position: 'absolute', 
                            top: 6, 
                            right: 6, 
                            backgroundColor: 'rgba(0,0,0,0.6)', 
                            borderRadius: 12, 
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                            minWidth: 24, 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)'
                          }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>{cat.count}</Text>
                          </View>
                        </View>
                        
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 8 }}>
                          <Text 
                            numberOfLines={1} 
                            adjustsFontSizeToFit 
                            minimumFontScale={0.8}
                            style={{ 
                              fontSize: 14, 
                              fontWeight: '800', 
                              color: selectedCategory === cat.id ? '#FFF' : cat.color, 
                              textAlign: 'center', 
                              width: '100%' 
                            }}
                          >
                            {cat.label}
                          </Text>
                        </View>
                      </TouchableOpacity>'''

    # Because whitespace can vary, we will use regex to replace it
    import re
    pattern = r">\s*<View style={{ width: '100%', height: '52%' }}>[\s\S]*?{cat\.count === 1 \? 'Card' : 'Cards'}[\s\S]*?</View>\s*</TouchableOpacity>"
    
    # Check if we can find it
    if re.search(pattern, content):
        content = re.sub(pattern, new_block.lstrip(' >'), content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success! UI Patched.")
    else:
        print("Could not find block to replace.")

if __name__ == '__main__':
    main()
