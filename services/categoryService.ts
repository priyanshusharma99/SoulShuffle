import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import api from './api';

// ── Default Category Images (Instant Synchronous Fallback) ──
const INITIAL_CATEGORY_MAP: Record<string, string> = {
  'ROMANCE': 'https://images.stockcake.com/public/4/e/c/4ecde92c-6e4e-44eb-afc7-b668445cc452/intimate-evening-glow-stockcake.jpg',
  'ROMANTIC': 'https://images.stockcake.com/public/4/e/c/4ecde92c-6e4e-44eb-afc7-b668445cc452/intimate-evening-glow-stockcake.jpg',
  'SPICY': 'https://images.stockcake.com/public/4/e/c/4ecde92c-6e4e-44eb-afc7-b668445cc452/intimate-evening-glow-stockcake.jpg',
  'INTIMATE': 'https://images.stockcake.com/public/4/e/c/4ecde92c-6e4e-44eb-afc7-b668445cc452/intimate-evening-glow-stockcake.jpg',
  'CONFLICT': 'https://thumbs.dreamstime.com/b/glossy-d-broken-heart-vector-element-bandages-crack-repair-red-heart-adhesive-plaster-patch-wound-injury-love-symbol-466905604.jpg',
  'HEALING': 'https://thumbs.dreamstime.com/b/glossy-d-broken-heart-vector-element-bandages-crack-repair-red-heart-adhesive-plaster-patch-wound-injury-love-symbol-466905604.jpg',
  'REPAIR': 'https://thumbs.dreamstime.com/b/glossy-d-broken-heart-vector-element-bandages-crack-repair-red-heart-adhesive-plaster-patch-wound-injury-love-symbol-466905604.jpg',
  'FUN': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb2ls48qZ0egZgRNKmJCGV7pu-ueFuYNHm5B56_8-meQ&s=10',
  'PLAY': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb2ls48qZ0egZgRNKmJCGV7pu-ueFuYNHm5B56_8-meQ&s=10',
  'NOVELTY': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb2ls48qZ0egZgRNKmJCGV7pu-ueFuYNHm5B56_8-meQ&s=10',
  'COMMUNICATION': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=600&fit=crop',
  'SUPPORT': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop',
  'CARE': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop',
  'GROWTH': 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&h=600&fit=crop',
  'FUTURE': 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&h=600&fit=crop',
  'DEFLECT': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&h=600&fit=crop',
  'POWER': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop',
  'WILDCARDS': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop',
  'GENERAL': 'https://images.stockcake.com/public/4/e/c/4ecde92c-6e4e-44eb-afc7-b668445cc452/intimate-evening-glow-stockcake.jpg',
};

// Global memory cache of category images
export const categoryImageMemoryMap: Record<string, string> = { ...INITIAL_CATEGORY_MAP };

// Hydrate from AsyncStorage immediately on module evaluation
AsyncStorage.getItem('cachedCategoryImages')
  .then((stored) => {
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Object.assign(categoryImageMemoryMap, parsed);
      } catch (_) {}
    }
  })
  .catch(() => {});

/**
 * Fetch latest categories from backend (including admin changes) and update local cache
 */
export const syncCategoryImages = async (): Promise<Record<string, string>> => {
  try {
    let categories: any[] = [];
    try {
      const res = await api.get('/cards/categories');
      categories = res.data?.data?.categories || [];
    } catch (_) {
      const catalogRes = await api.get('/cards/catalog').catch(() => null);
      categories = catalogRes?.data?.data?.catalog || [];
    }

    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat) => {
        const icon = cat.icon_url || cat.image_url;
        if (!icon) return;

        // Map by ID
        if (cat.id) {
          categoryImageMemoryMap[cat.id] = icon;
        }

        // Map by full name (e.g. 'Romance, Intimacy & Desire')
        if (cat.name) {
          categoryImageMemoryMap[cat.name] = icon;
          categoryImageMemoryMap[cat.name.toUpperCase()] = icon;

          // Map by keywords in name
          const upper = cat.name.toUpperCase();
          const words = upper.split(/[\s,&/_]+/);
          words.forEach((w: string) => {
            if (w.length > 2) {
              categoryImageMemoryMap[w] = icon;
            }
          });
        }
      });

      // Persist to AsyncStorage for instant zero-latency loads on app restarts
      AsyncStorage.setItem('cachedCategoryImages', JSON.stringify(categoryImageMemoryMap)).catch(() => {});
      DeviceEventEmitter.emit('app:categoriesUpdated');
    }
  } catch (err) {
    console.warn('[CategoryService] Category sync notice:', err);
  }

  return categoryImageMemoryMap;
};

/**
 * Extract clean category string from any card / send object
 */
export const extractCategoryName = (cardOrSend: any): string => {
  if (!cardOrSend) return 'GENERAL';

  const raw =
    cardOrSend.category_name ||
    cardOrSend.category ||
    cardOrSend.card_categories?.name ||
    cardOrSend.card?.card_categories?.name ||
    cardOrSend.cards?.card_categories?.name ||
    cardOrSend.card?.category ||
    cardOrSend.cards?.category ||
    '';

  if (!raw) return 'GENERAL';
  return String(raw).toUpperCase().trim();
};

/**
 * Get category image URL strictly for a card or category name
 */
export const resolveCategoryImageUrl = (cardOrSend: any): string => {
  if (!cardOrSend) return INITIAL_CATEGORY_MAP['GENERAL'];

  // 1. Direct category image on card from backend
  const directCatImg =
    cardOrSend.category_image ||
    cardOrSend.category_icon_url ||
    cardOrSend.card_categories?.icon_url ||
    cardOrSend.card?.card_categories?.icon_url ||
    cardOrSend.cards?.card_categories?.icon_url ||
    cardOrSend.card_categories?.image_url;

  if (directCatImg && typeof directCatImg === 'string' && directCatImg.startsWith('http')) {
    return directCatImg;
  }

  // 2. Category ID lookup in memory cache
  const categoryId =
    cardOrSend.category_id ||
    cardOrSend.card?.category_id ||
    cardOrSend.cards?.category_id ||
    cardOrSend.card_categories?.id;

  if (categoryId && categoryImageMemoryMap[categoryId]) {
    return categoryImageMemoryMap[categoryId];
  }

  // 3. Category Name lookup in memory cache
  const categoryStr = extractCategoryName(cardOrSend);
  if (categoryImageMemoryMap[categoryStr]) {
    return categoryImageMemoryMap[categoryStr];
  }

  // 4. Keyword search in memory map
  const keywords = categoryStr.split(/[\s,&/_]+/);
  for (const kw of keywords) {
    if (kw.length > 2 && categoryImageMemoryMap[kw]) {
      return categoryImageMemoryMap[kw];
    }
  }

  return INITIAL_CATEGORY_MAP['GENERAL'];
};
