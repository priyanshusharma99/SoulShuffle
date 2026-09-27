import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace("activeRoom?.duration", "(activeRoom as any)?.duration")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fixed TS error")

if __name__ == '__main__':
    main()
