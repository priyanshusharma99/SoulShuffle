import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = r'\{send\.card\?\.image_url \? \(\s*<Image source=\{getCardImage\(send\.card\)\} style=\{\{ width: \'100%\', height: \'100%\' \}\} />\s*\) : \(\s*<View style=\{\{ width: \'100%\', height: \'100%\', backgroundColor: \'#2a1a20\' \}\} />\s*\)\}'
    
    replacement = "<Image source={getCardImage(send.card)} style={{ width: '100%', height: '100%' }} />"
    
    content, count = re.subn(pattern, replacement, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Replaced {count} instances")

if __name__ == '__main__':
    main()
