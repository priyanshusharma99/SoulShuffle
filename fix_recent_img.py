import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = '''                          {send.card?.image_url ? (
                            <Image source={getCardImage(send.card)} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <View style={{ width: '100%', height: '100%', backgroundColor: '#2a1a20' }} />
                          )}'''
                          
    replacement = '''                          <Image source={getCardImage(send.card)} style={{ width: '100%', height: '100%' }} />'''
    
    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed Recent Moments image rendering")
    else:
        print("Target not found")

if __name__ == '__main__':
    main()
