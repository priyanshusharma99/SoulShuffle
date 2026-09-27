import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the Animated.timing blocks for both isSwipeRight and isSwipeLeft.
    
    old_right = '''          if (isSwipeRight) {
            isAnimating.current = true;
            Animated.timing(currentPosition, {
              toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 150,
              useNativeDriver: false
            }).start(() => {
              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              currentPosition.setValue({ x: 0, y: 0 });
              isAnimating.current = false;
            });
          } else if (isSwipeLeft) {'''

    new_right = '''          if (isSwipeRight) {
            isAnimating.current = true;
            Animated.timing(currentPosition, {
              toValue: { x: SCREEN_WIDTH * 1.5, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 300,
              useNativeDriver: false
            }).start(() => {
              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              setTimeout(() => {
                currentPosition.setValue({ x: 0, y: 0 });
                isAnimating.current = false;
              }, 50);
            });
          } else if (isSwipeLeft) {'''

    old_left = '''          } else if (isSwipeLeft) {
            isAnimating.current = true;
            Animated.timing(currentPosition, {
              toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 150,
              useNativeDriver: false
            }).start(() => {
              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              currentPosition.setValue({ x: 0, y: 0 });
              isAnimating.current = false;
            });
          } else {'''

    new_left = '''          } else if (isSwipeLeft) {
            isAnimating.current = true;
            Animated.timing(currentPosition, {
              toValue: { x: -SCREEN_WIDTH * 1.5, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 300,
              useNativeDriver: false
            }).start(() => {
              setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              setTimeout(() => {
                currentPosition.setValue({ x: 0, y: 0 });
                isAnimating.current = false;
              }, 50);
            });
          } else {'''

    content = content.replace(old_right, new_right)
    content = content.replace(old_left, new_left)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying patch.")

if __name__ == '__main__':
    main()
