import { resolveCategoryImageUrl } from '@/services/categoryService';

/**
 * Get card image strictly bound to its category image/logo.
 * Cards NEVER use individual/random photos — they exclusively reflect their category visual.
 */
export const getCardImage = (cardOrSend: any) => {
  const categoryImageUrl = resolveCategoryImageUrl(cardOrSend);
  return { uri: categoryImageUrl };
};
