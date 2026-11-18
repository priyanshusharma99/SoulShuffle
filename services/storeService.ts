import api from './api';

export interface BundlePlan {
  id: string;
  bundle_id: string;
  card_count: number;
  price: number;
}

export interface CardCategory {
  name: string;
  theme_color: string;
}

export interface StoreCard {
  id: string;
  name: string;
  power_description: string;
  card_type: string;
  card_categories?: CardCategory;
}

export interface CardBundle {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  bundle_plans?: BundlePlan[];
  plans?: BundlePlan[];
  bundle_cards?: { card_id: string; cards: StoreCard }[];
  is_active: boolean;
}

export interface PurchaseRecord {
  id: string;
  user_id: string;
  bundle_id: string;
  plan_id: string;
  transaction_id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created_at: string;
  store_product_id: string;
  card_bundle?: { name: string };
}

export const fetchStoreBundles = async (): Promise<CardBundle[]> => {
  const response = await api.get('/store/bundles');
  // Handle different potential backend data formats
  return response.data.data.bundles || response.data.data || [];
};

export const fetchStoreBundleById = async (bundleId: string): Promise<CardBundle> => {
  const response = await api.get(`/store/bundles/${bundleId}`);
  return response.data.data.bundle || response.data.data;
};

export const fetchPurchaseHistory = async (): Promise<PurchaseRecord[]> => {
  const response = await api.get('/store/purchase/history');
  return response.data.data.purchases || response.data.data || [];
};

export const bypassStorePurchase = async (bundleId: string, planId: string): Promise<any> => {
  const response = await api.post('/store/purchase/mock-bypass', { bundleId, planId });
  return response.data.data;
};

export const getCuratedBundleCards = (bundleName: string, count: number = 10): any[] => {
  const name = (bundleName || '').toLowerCase();
  if (name.includes('spicy') || name.includes('spark') || name.includes('night')) {
    const spicyDeck = [
      {
        id: 'spicy-card-1',
        title: 'Ice Cube Seduction',
        description: "Slowly trace an ice cube down your partner's neck and chest while whispering your favorite fantasy.",
        category: 'SPICY',
        difficulty: 'HIGH',
        stars: 3,
        time: 'Tonight',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-2',
        title: 'Blindfolded Touch',
        description: 'Put on a blindfold for 5 minutes while your partner uses different textures and gentle touches.',
        category: 'SPICY',
        difficulty: 'MEDIUM',
        stars: 3,
        time: '15 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-3',
        title: 'Sensual Massage',
        description: 'Give a 10-minute slow sensual shoulder, neck, and back massage using warm scented oil or lotion.',
        category: 'SPICY',
        difficulty: 'MEDIUM',
        stars: 2,
        time: '10 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-4',
        title: 'The French Kiss Dare',
        description: 'Hold your partner close and kiss them passionately without stopping for a full 60 seconds.',
        category: 'SPICY',
        difficulty: 'HIGH',
        stars: 3,
        time: '1 min',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-5',
        title: 'Secret Whispers',
        description: 'Whisper 3 naughty and teasing things you want to do tonight directly into your partner’s ear.',
        category: 'SPICY',
        difficulty: 'MEDIUM',
        stars: 2,
        time: 'Now',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-6',
        title: 'Lap Dance Tease',
        description: 'Put on your favorite sensual track and give your partner an unforgettable 2-minute private dance.',
        category: 'SPICY',
        difficulty: 'HIGH',
        stars: 3,
        time: '2 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-7',
        title: 'Midnight Confession',
        description: "Confess the wildest fantasy you've had about your partner that you haven't shared yet.",
        category: 'SPICY',
        difficulty: 'MEDIUM',
        stars: 2,
        time: 'Tonight',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-8',
        title: 'Feather-Light Touch',
        description: 'Using only your fingertips, trace the outline of your partner’s lips, jawline, and collarbone.',
        category: 'SPICY',
        difficulty: 'LOW',
        stars: 2,
        time: '5 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-9',
        title: 'Slow Motion Kiss',
        description: 'Give slow, deliberate kisses starting from the collarbone all the way up to the lips.',
        category: 'SPICY',
        difficulty: 'HIGH',
        stars: 3,
        time: '5 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
      {
        id: 'spicy-card-10',
        title: 'Surrender Control',
        description: 'Let your partner take complete, teasing control of the room and actions for the next 15 minutes.',
        category: 'SPICY',
        difficulty: 'EXTREME',
        stars: 3,
        time: '15 mins',
        image: require('@/assets/images/bundle_spicy.jpg'),
      },
    ];
    return spicyDeck.slice(0, count);
  }

  if (name.includes('romanc') || name.includes('getaway') || name.includes('adventure')) {
    const romanceDeck = [
      {
        id: 'romance-card-1',
        title: 'Sunset Rooftop Picnic',
        description: 'Set up a cozy blanket with snacks and favorite drinks to watch the sunset together.',
        category: 'ROMANCE',
        difficulty: 'MEDIUM',
        stars: 2,
        time: 'Today',
        image: require('@/assets/images/bundle_romantic.jpg'),
      },
      {
        id: 'romance-card-2',
        title: 'Slow Dance in the Kitchen',
        description: 'Turn off the lights, play a slow love song, and dance together right in the kitchen.',
        category: 'ROMANCE',
        difficulty: 'LOW',
        stars: 2,
        time: '5 mins',
        image: require('@/assets/images/bundle_romantic.jpg'),
      },
      {
        id: 'romance-card-3',
        title: 'Handwritten Love Note',
        description: 'Write 3 things you deeply appreciate about your partner and place it in their pocket.',
        category: 'ROMANCE',
        difficulty: 'LOW',
        stars: 2,
        time: '10 mins',
        image: require('@/assets/images/bundle_romantic.jpg'),
      },
      {
        id: 'romance-card-4',
        title: 'Candlelight Dinner',
        description: 'Cook or order dinner, turn off the phones, and eat together only by candlelight.',
        category: 'ROMANCE',
        difficulty: 'MEDIUM',
        stars: 3,
        time: 'Tonight',
        image: require('@/assets/images/couple_cooking_dinner.jpg'),
      },
      {
        id: 'romance-card-5',
        title: 'Stargazing Hand in Hand',
        description: 'Step outside together for 10 minutes, look at the night sky, and talk about your future dreams.',
        category: 'ROMANCE',
        difficulty: 'LOW',
        stars: 2,
        time: '10 mins',
        image: require('@/assets/images/couple_wildflower_sunset.jpg'),
      },
    ];
    return romanceDeck.slice(0, count);
  }

  const cozyDeck = [
    {
      id: 'cozy-card-1',
      title: 'Pillow Fort Movie Night',
      description: 'Build a blanket fort in the living room and watch an episode together with hot cocoa.',
      category: 'COZY',
      difficulty: 'LOW',
      stars: 1,
      time: 'Evening',
      image: require('@/assets/images/bundle_cozy.jpg'),
    },
    {
      id: 'cozy-card-2',
      title: 'Morning Extra Hugs',
      description: 'Spend an extra 15 minutes cuddling in bed without touching any phones.',
      category: 'COZY',
      difficulty: 'LOW',
      stars: 1,
      time: 'Morning',
      image: require('@/assets/images/couple_cafe_morning.jpg'),
    },
    {
      id: 'cozy-card-3',
      title: 'Deep Soul Questions',
      description: 'Ask each other: "What is your happiest memory of us so far?" and listen closely.',
      category: 'COZY',
      difficulty: 'MEDIUM',
      stars: 2,
      time: '15 mins',
      image: require('@/assets/images/bundle_cozy.jpg'),
    },
  ];
  return cozyDeck.slice(0, count);
};
