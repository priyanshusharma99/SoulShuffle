import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the entire return block for Explore Categories
    start_str = "return (\n                <View style={{ paddingHorizontal: 24, marginTop: 16 }}>"
    end_str = "              );\n            })()}\n          </View>"

    if start_str in content and end_str in content:
        start_idx = content.find(start_str)
        # End idx is the end of end_str
        end_idx = content.find(end_str) + len(end_str)

        new_block = '''return (
                <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: textColor }}>Explore Categories</Text>
                    {selectedCategory !== 'ALL' && (
                      <TouchableOpacity onPress={() => setSelectedCategory('ALL')}>
                        <Text style={{ color: '#FF296D', fontWeight: '700', fontSize: 14 }}>View all deck</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {dynamicCategories.map((cat: any) => (
                      <TouchableOpacity 
                        key={cat.id} 
                        activeOpacity={0.9} 
                        onPress={() => setSelectedCategory(cat.id)} 
                        style={{
                          width: 124,
                          height: 145,
                          backgroundColor: selectedCategory === cat.id ? cat.color : (isDark ? '#1C1721' : '#FFFFFF'),
                          borderRadius: 24,
                          overflow: 'hidden',
                          marginRight: 14,
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: selectedCategory === cat.id ? cat.color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                          shadowColor: cat.color,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedCategory === cat.id ? 0.4 : (isDark ? 0.3 : 0.05),
                          shadowRadius: 10,
                          elevation: 3
                        }}
                      >
                        <View style={{ width: '100%', height: '65%', position: 'relative' }}>
                          <Image source={cat.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 3, minWidth: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>{cat.count}</Text>
                          </View>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 8 }}>
                          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontSize: 14, fontWeight: '800', color: selectedCategory === cat.id ? '#FFF' : cat.color, textAlign: 'center', width: '100%' }}>
                            {cat.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })()}
          </View>'''

        content = content[:start_idx] + new_block + content[end_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replaced Explore Categories block entirely.")
    else:
        print("Could not find start or end bounds.")

if __name__ == '__main__':
    main()
