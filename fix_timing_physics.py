import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Easing import
    if 'import { View' in content and 'Easing' not in content:
        content = content.replace('import { View', 'import { View, Easing')

    # 2. Replace the spring logic with buttery smooth timing
    pattern_spring = r'Animated\.spring\(currentPosition, \{\s*toValue: (\{ x: -?SCREEN_WIDTH \* 2, y: gestureState\.dy \+ \(gestureState\.vy \* 50\) \}),\s*velocity: \{ x: gestureState\.vx, y: gestureState\.vy \},\s*friction: 6,\s*tension: 30,\s*useNativeDriver: false\s*\}\)'
    
    replacement_timing = r'''Animated.timing(currentPosition, {
              toValue: \1,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false
            })'''

    content = re.sub(pattern_spring, replacement_timing, content)

    # 3. Decrease the setTimeout to 50ms now that we don't block
    # Since the callback fires EXACTLY at 250ms, the card is totally off screen.
    # 50ms is just enough for React to render the next frame.
    content = content.replace('}, 450);', '}, 50);')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying timing physics.")

if __name__ == '__main__':
    main()
