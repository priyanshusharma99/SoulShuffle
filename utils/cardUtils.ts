export const getCardImage = (cardOrSend: any) => {
  if (!cardOrSend) return require('@/assets/images/bundle_cozy.jpg');

  // Handle both unflattened (cardOrSend is the card object) and flattened (cardOrSend is the send object)
  const imageField = cardOrSend.image_url || cardOrSend.image || ((cardOrSend.card || cardOrSend.cards) && ((cardOrSend.card?.image_url || cardOrSend.cards?.image_url) || (cardOrSend.card?.image || cardOrSend.cards?.image)));
  const categoryImageField = cardOrSend.category_image || ((cardOrSend.card || cardOrSend.cards) && (cardOrSend.card?.category_image || cardOrSend.cards?.card_categories?.icon_url || cardOrSend.cards?.card_categories?.image_url)) || (cardOrSend.card_categories && (cardOrSend.card_categories.icon_url || cardOrSend.card_categories.image_url));
  
  if (imageField) {
    return { uri: imageField };
  }
  if (categoryImageField) {
    return { uri: categoryImageField };
  }

  // Get category from either flattened or nested
  const categoryStr = cardOrSend.category || ((cardOrSend.card || cardOrSend.cards) && (cardOrSend.card?.category || cardOrSend.cards?.card_categories?.name)) || (cardOrSend.card_categories && cardOrSend.card_categories.name) || '';
  const categoryName = categoryStr.toUpperCase();

  if (categoryName.includes('ROMANCE') || categoryName.includes('ROMANTIC') || categoryName.includes('LOVE')) {
    return require('@/assets/images/bundle_romantic.jpg');
  } else if (categoryName.includes('ADVENTURE') || categoryName.includes('ADVENTUROUS')) {
    return { uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop' };
  } else if (categoryName.includes('SPICY') || categoryName.includes('INTIMATE') || categoryName.includes('PENALTY')) {
    return require('@/assets/images/bundle_spicy.jpg');
  } else if (categoryName.includes('HEALING') || categoryName.includes('COMMUNICATION') || categoryName.includes('CONNECTION')) {
    return { uri: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop' };
  } else if (categoryName.includes('FUN') || categoryName.includes('PLAY')) {
    return require('@/assets/images/bundle_cozy.jpg');
  } else {
    // Default fallback
    return require('@/assets/images/sunset_picnic.jpeg');
  }
};
