import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pass setSelectedReceivedCard to PendingDaresCarousel
    target = '<PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />'
    replacement = '<PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} onPressCard={(send: any) => setSelectedReceivedCard(send)} />'
    
    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.tsx")
    else:
        print("Target not found in index.tsx")

if __name__ == '__main__':
    main()
