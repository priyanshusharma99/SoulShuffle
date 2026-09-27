import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will use regex to find the blocks and replace them.
    # We want to replace duration: 150 with duration: 300
    # And we want to replace the .start() block to include setTimeout
    
    # First, let's fix the right swipe block
    pattern_right = r'(if \(isSwipeRight\) \{[\s\S]*?duration:\s*)150(,[\s\S]*?\.start\(\(\) => \{[\s\S]*?setCurrentIndex[^;]+;)\s*currentPosition\.setValue\(\{ x: 0, y: 0 \}\);\s*isAnimating\.current = false;\s*\}\);'
    
    replacement_right = r'\1 300\2\n              setTimeout(() => {\n                currentPosition.setValue({ x: 0, y: 0 });\n                isAnimating.current = false;\n              }, 300);\n            });'
    
    content = re.sub(pattern_right, replacement_right, content)
    
    # Then the left swipe block
    pattern_left = r'(else if \(isSwipeLeft\) \{[\s\S]*?duration:\s*)150(,[\s\S]*?\.start\(\(\) => \{[\s\S]*?setCurrentIndex[^;]+;)\s*currentPosition\.setValue\(\{ x: 0, y: 0 \}\);\s*isAnimating\.current = false;\s*\}\);'
    
    replacement_left = r'\1 300\2\n              setTimeout(() => {\n                currentPosition.setValue({ x: 0, y: 0 });\n                isAnimating.current = false;\n              }, 300);\n            });'
    
    content = re.sub(pattern_left, replacement_left, content)
    
    # Let's also change the toValue x multiplier from SCREEN_WIDTH + 100 to SCREEN_WIDTH * 1.5
    content = content.replace('x: SCREEN_WIDTH + 100', 'x: SCREEN_WIDTH * 1.5')
    content = content.replace('x: -SCREEN_WIDTH - 100', 'x: -SCREEN_WIDTH * 1.5')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying regex patch.")

if __name__ == '__main__':
    main()
