import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the Animated.spring blocks
    pattern_right = r'Animated\.spring\(currentPosition, \{\s*toValue: \{ x: SCREEN_WIDTH \* 1\.5, y: gestureState\.dy \+ \(gestureState\.vy \* 50\) \},\s*velocity: \{ x: gestureState\.vx, y: gestureState\.vy \},\s*bounciness: 0,\s*restSpeedThreshold: 100,\s*restDisplacementThreshold: 40,\s*useNativeDriver: false\s*\}\)'
    
    replacement_right = '''Animated.spring(currentPosition, {
              toValue: { x: SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              velocity: { x: gestureState.vx, y: gestureState.vy },
              friction: 6,
              tension: 30,
              useNativeDriver: false
            })'''

    content = re.sub(pattern_right, replacement_right, content)

    pattern_left = r'Animated\.spring\(currentPosition, \{\s*toValue: \{ x: -SCREEN_WIDTH \* 1\.5, y: gestureState\.dy \+ \(gestureState\.vy \* 50\) \},\s*velocity: \{ x: gestureState\.vx, y: gestureState\.vy \},\s*bounciness: 0,\s*restSpeedThreshold: 100,\s*restDisplacementThreshold: 40,\s*useNativeDriver: false\s*\}\)'
    
    replacement_left = '''Animated.spring(currentPosition, {
              toValue: { x: -SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              velocity: { x: gestureState.vx, y: gestureState.vy },
              friction: 6,
              tension: 30,
              useNativeDriver: false
            })'''

    content = re.sub(pattern_left, replacement_left, content)

    # Let's also increase the setTimeout to 400 just in case the spring takes a bit longer
    content = content.replace('}, 300);', '}, 450);')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done fixing spring physics.")

if __name__ == '__main__':
    main()
