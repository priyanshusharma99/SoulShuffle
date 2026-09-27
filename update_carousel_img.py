import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target_import = "import { Ionicons } from '@expo/vector-icons';"
    replacement_import = "import { Ionicons } from '@expo/vector-icons';\nimport { getCardImage } from '@/utils/cardUtils';"
    
    if "getCardImage" not in content:
        content = content.replace(target_import, replacement_import)

    target_img = "source={send.card?.image_url ? { uri: send.card.image_url } : require('@/assets/images/bundle_spicy.jpg')}"
    replacement_img = "source={getCardImage(send.card)}"
    
    content = content.replace(target_img, replacement_img)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated PendingDaresCarousel")

if __name__ == '__main__':
    main()
