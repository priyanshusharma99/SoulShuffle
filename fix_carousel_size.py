import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Back Card
    target_back = '''        style={{
          position: 'absolute',
          top: 110, // Shifted even further down so button and everything is visible
          width: width * 0.75,
          height: 240,
          opacity: 0.8,
          transform: [{ scale: 0.95 }],'''
          
    replacement_back = '''        style={{
          position: 'absolute',
          top: 130, // Shifted further down
          width: width * 0.85,
          height: 250,
          opacity: 0.85,
          transform: [{ scale: 0.85 }],'''

    content = content.replace(target_back, replacement_back)

    # 2. Update Front Card
    target_front = '''        style={{
          position: 'absolute',
          top: 0,
          width: width * 0.75,
          height: 240,'''
          
    replacement_front = '''        style={{
          position: 'absolute',
          top: 0,
          width: width * 0.85,
          height: 250,'''

    content = content.replace(target_front, replacement_front)

    # 3. Update Container
    target_container = "width: width * 0.75, height: 360"
    replacement_container = "width: width * 0.85, height: 400"
    content = content.replace(target_container, replacement_container)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated card sizes and scales!")

if __name__ == '__main__':
    main()
