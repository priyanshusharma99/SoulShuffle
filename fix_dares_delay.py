import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Move isAnimating.current = false outside the setTimeout so the user isn't blocked.
    old_right = '''              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
                setTimeout(() => {
                  currentPosition.setValue({ x: 0, y: 0 });
                  isAnimating.current = false;
                }, 450);'''
                
    new_right = '''              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              isAnimating.current = false;
              setTimeout(() => {
                currentPosition.setValue({ x: 0, y: 0 });
              }, 450);'''

    content = content.replace(old_right, new_right)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done fixing block delay.")

if __name__ == '__main__':
    main()
