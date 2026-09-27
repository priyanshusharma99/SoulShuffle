import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add touch scale animation
    scale_def = "  const isAnimating = useRef(false);\n  const touchScale = useRef(new Animated.Value(1)).current;"
    if "const touchScale =" not in content:
        content = content.replace("  const isAnimating = useRef(false);", scale_def)

    # Add scale animation to PanResponder Grant
    grant_target = '''      onPanResponderGrant: () => {
        const d = latestData.current;
        const idx = latestIndex.current;'''
    grant_replacement = '''      onPanResponderGrant: () => {
        Animated.spring(touchScale, { toValue: 0.96, useNativeDriver: false }).start();
        const d = latestData.current;
        const idx = latestIndex.current;'''
    if "Animated.spring(touchScale" not in content:
        content = content.replace(grant_target, grant_replacement)

    # Add scale animation to PanResponder Release
    release_target = '''      onPanResponderRelease: (evt, gestureState) => {
        const d = latestData.current;
        const idx = latestIndex.current;'''
    release_replacement = '''      onPanResponderRelease: (evt, gestureState) => {
        Animated.spring(touchScale, { toValue: 1, friction: 4, useNativeDriver: false }).start();
        const d = latestData.current;
        const idx = latestIndex.current;'''
    content = content.replace(release_target, release_replacement)
    
    # Also reset touch scale in forceSwipe just in case it was triggered by a button press
    force_swipe_target = "    isAnimating.current = true;"
    force_swipe_replacement = "    isAnimating.current = true;\n    Animated.spring(touchScale, { toValue: 1, useNativeDriver: false }).start();"
    content = content.replace(force_swipe_target, force_swipe_replacement)

    # Add touchScale to renderFrontCard
    front_card_target = "transform: [{ translateX: currentPosition.x }, { translateY: currentPosition.y }, { rotate }]"
    front_card_replacement = "transform: [{ translateX: currentPosition.x }, { translateY: currentPosition.y }, { rotate }, { scale: touchScale }]"
    content = content.replace(front_card_target, front_card_replacement)

    # Increase Image Height
    image_target = "height: '45%'"
    image_replacement = "height: '58%'"
    content = content.replace(image_target, image_replacement)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added zoom effect and increased image height!")

if __name__ == '__main__':
    main()
