import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The header ends with:
    # </View>
    # </View>
    # <View className="px-5 mb-8">
    # Let's just find <View className="px-5 mb-8"> and inject it right before it!
    
    target = '<View className="px-5 mb-8">'
    usage_code = "\n                <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />\n                "
    
    if '<PendingDaresCarousel pending' not in content:
        content = content.replace(target, usage_code + target)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Injected usage successfully!")

if __name__ == '__main__':
    main()
