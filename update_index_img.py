import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target_import = "import { SafeAreaView } from \"react-native-safe-area-context\";"
    replacement_import = "import { SafeAreaView } from \"react-native-safe-area-context\";\nimport { getCardImage } from '@/utils/cardUtils';"
    
    if "import { getCardImage }" not in content:
        content = content.replace(target_import, replacement_import)

    # In Recent Moments:
    target_img = "source={{ uri: send.card.image_url }}"
    replacement_img = "source={getCardImage(send.card)}"
    content = content.replace(target_img, replacement_img)
    
    # Wait, the code in index.tsx was:
    # {send.card?.image_url ? ( <Image source={{ uri: send.card.image_url }} ... /> ) : ( <Image source={require('@/assets/images/bundle_spicy.jpg')} ... /> )}
    # I need to replace that whole block!
    
    import re
    # We find the Recent Moments image rendering part
    pattern = r'\{send\.card\?\.image_url \? \(\s*<Image source=\{\{ uri: send\.card\.image_url \}\} style=\{\{ width: \'100%\', height: \'100%\' \}\} />\s*\) : \(\s*<Image source=\{require\(\'@/assets/images/bundle_spicy\.jpg\'\)\} style=\{\{ width: \'100%\', height: \'100%\' \}\} />\s*\)\}'
    
    new_img = "<Image source={getCardImage(send.card)} style={{ width: '100%', height: '100%' }} />"
    content = re.sub(pattern, new_img, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated index.tsx")

if __name__ == '__main__':
    main()
