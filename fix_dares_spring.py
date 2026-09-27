import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace interpolation inputRanges
    content = content.replace(
        'inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2]',
        'inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH]'
    )

    # 2. Replace Animated.timing with Animated.spring for right swipe
    pattern_right = r'Animated\.timing\(currentPosition, \{\s*toValue: \{ x: SCREEN_WIDTH \* 1\.5, y: gestureState\.dy \+ \(gestureState\.vy \* 50\) \},\s*duration:\s*300,\s*useNativeDriver: false\s*\}\)'
    
    replacement_right = '''Animated.spring(currentPosition, {
              toValue: { x: SCREEN_WIDTH * 1.5, y: gestureState.dy + (gestureState.vy * 50) },
              velocity: { x: gestureState.vx, y: gestureState.vy },
              bounciness: 0,
              restSpeedThreshold: 100,
              restDisplacementThreshold: 40,
              useNativeDriver: false
            })'''

    content = re.sub(pattern_right, replacement_right, content)

    # 3. Replace Animated.timing with Animated.spring for left swipe
    pattern_left = r'Animated\.timing\(currentPosition, \{\s*toValue: \{ x: -SCREEN_WIDTH \* 1\.5, y: gestureState\.dy \+ \(gestureState\.vy \* 50\) \},\s*duration:\s*300,\s*useNativeDriver: false\s*\}\)'
    
    replacement_left = '''Animated.spring(currentPosition, {
              toValue: { x: -SCREEN_WIDTH * 1.5, y: gestureState.dy + (gestureState.vy * 50) },
              velocity: { x: gestureState.vx, y: gestureState.vy },
              bounciness: 0,
              restSpeedThreshold: 100,
              restDisplacementThreshold: 40,
              useNativeDriver: false
            })'''

    content = re.sub(pattern_left, replacement_left, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying spring animations and interpolation fixes.")

if __name__ == '__main__':
    main()
