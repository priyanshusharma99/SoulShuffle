import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add key to renderBackCard
    target_back = '''    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 75, // Fix Issue #2: Shifted further down so only the title/timer shows below'''
          
    replacement_back = '''    return (
      <Animated.View
        key={backCard.id}
        style={{
          position: 'absolute',
          top: 110, // Shifted even further down so button and everything is visible
          width: width * 0.75,'''

    if 'top: 75,' in content:
        content = content.replace(target_back, replacement_back)

    # 2. Add key to renderFrontCard
    target_front = '''    return (
      <Animated.View
        {...(pendingChallenges.length > 1 ? panResponder.panHandlers : {})}
        style={{
          position: 'absolute',
          top: 0,'''
          
    replacement_front = '''    return (
      <Animated.View
        key={frontCard.id}
        {...(pendingChallenges.length > 1 ? panResponder.panHandlers : {})}
        style={{
          position: 'absolute',
          top: 0,'''

    if 'key={frontCard.id}' not in content:
        content = content.replace(target_front, replacement_front)

    # 3. Update container height to 360
    target_height = "width: width * 0.75, height: 320"
    replacement_height = "width: width * 0.75, height: 360"
    content = content.replace(target_height, replacement_height)

    # 4. Remove the height comment
    content = content.replace("{/* Card Deck Area - increased height from 260 to 320 to accommodate the back card being pushed down to top: 75 */}", "{/* Card Deck Area */}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed keys and back card position!")

if __name__ == '__main__':
    main()
