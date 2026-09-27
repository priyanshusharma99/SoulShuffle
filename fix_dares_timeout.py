import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Increase setTimeout to 300ms to guarantee React has finished unmounting/re-ordering the card.
    content = content.replace('setTimeout(() => {', 'setTimeout(() => {')
    content = content.replace('}, 50);', '}, 300);')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying patch.")

if __name__ == '__main__':
    main()
