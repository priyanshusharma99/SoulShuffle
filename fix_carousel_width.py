import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = "width: width * 0.75,\n          width: width * 0.75,"
    replacement = "width: width * 0.75,"
    
    content = content.replace(target, replacement)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed duplicate width")

if __name__ == '__main__':
    main()
