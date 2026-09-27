import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the lines for adjustsFontSizeToFit and minimumFontScale
    content = content.replace("adjustsFontSizeToFit \n                              minimumFontScale={0.8}", "")
    
    # Just in case regex or string matching fails due to exact spacing, let's use re
    import re
    content = re.sub(r'\s*adjustsFontSizeToFit\s*minimumFontScale=\{0\.8\}', '', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Removed adjustsFontSizeToFit to enforce uniform text size.")

if __name__ == '__main__':
    main()
