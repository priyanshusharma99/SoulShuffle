
const fs = require('fs');

let code = fs.readFileSync('utils/cardUtils.ts', 'utf8');

code = code.replace(
  /const imageField = cardOrSend\.image_url \|\| cardOrSend\.image \|\| \(\(cardOrSend\.card \|\| cardOrSend\.cards\) && \(\(cardOrSend\.card\?\.image_url \|\| cardOrSend\.cards\?\.image_url\) \|\| \(cardOrSend\.card\?\.image \|\| cardOrSend\.cards\?\.image\)\)\);/,
  \const imageField = cardOrSend.image_url || cardOrSend.image || ((cardOrSend.card || cardOrSend.cards) && ((cardOrSend.card?.image_url || cardOrSend.cards?.image_url) || (cardOrSend.card?.image || cardOrSend.cards?.image)));
  
  const categoryImageField = cardOrSend.category_image || ((cardOrSend.card || cardOrSend.cards) && (cardOrSend.card?.category_image || cardOrSend.cards?.card_categories?.icon_url || cardOrSend.cards?.card_categories?.image_url)) || (cardOrSend.card_categories && (cardOrSend.card_categories.icon_url || cardOrSend.card_categories.image_url));\
);

code = code.replace(
  /if \(imageField\) \{\\n\s*return \{ uri: imageField \};\\n\s*\}/,
  \if (imageField) {
    return { uri: imageField };
  }
  if (categoryImageField) {
    return { uri: categoryImageField };
  }\
);

fs.writeFileSync('utils/cardUtils.ts', code);
console.log('Fixed cardUtils.ts');

