import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\components\PendingDaresCarousel.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update categoryName
    target_cat = "const categoryName = send.card?.category || send.card?.card_categories?.name || 'MYSTERY DARE';"
    replacement_cat = "const categoryName = send.category || send.card?.category || send.card?.card_categories?.name || 'MYSTERY DARE';"
    
    if target_cat in content:
        content = content.replace(target_cat, replacement_cat)

    # Update title
    target_title = "<Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{send.card?.title || 'Unknown Card'}</Text>"
    replacement_title = "<Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{send.title || send.card?.title || 'Unknown Card'}</Text>"
    
    if target_title in content:
        content = content.replace(target_title, replacement_title)
        
    # getCardImage is already passed send.card? No, let's pass send to getCardImage(send) directly!
    target_img = "source={getCardImage(send.card)}"
    replacement_img = "source={getCardImage(send)}"
    
    content = content.replace(target_img, replacement_img)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated PendingDaresCarousel")

if __name__ == '__main__':
    main()
