import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update getCardImage(send.card) to getCardImage(send) in Recent Moments
    content = content.replace("source={getCardImage(send.card)}", "source={getCardImage(send)}")

    # Update title
    target_title = "<Text className=\"text-white font-bold text-[13px]\" numberOfLines={1}>{send.card?.title || 'Challenge'}</Text>"
    replacement_title = "<Text className=\"text-white font-bold text-[13px]\" numberOfLines={1}>{send.title || send.card?.title || 'Challenge'}</Text>"
    content = content.replace(target_title, replacement_title)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated index.tsx")

if __name__ == '__main__':
    main()
