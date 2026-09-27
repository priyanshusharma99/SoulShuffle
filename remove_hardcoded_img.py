import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the normalizeSendRecord function and remove the imageUrl hardcoding logic
    pattern = r'let imageUrl = cardObj\.image_url \|\| null;\s+if \(\!imageUrl\) \{\s+if \([\s\S]*?\} else \{\s+imageUrl =[\s\S]*?\}\s+\}'
    
    # We just replace it with empty string, but we still need imageUrl variable for the return object
    # Actually, we can just replace the whole block with let imageUrl = cardObj.image_url || null;
    replacement = "let imageUrl = cardObj.image_url || null;"
    
    content, count = re.subn(pattern, replacement, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Replaced {count} instances of hardcoded image logic.")

if __name__ == '__main__':
    main()
