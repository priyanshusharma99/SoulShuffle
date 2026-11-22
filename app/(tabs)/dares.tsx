import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation, interpolateColor } from 'react-native-reanimated';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Easing, Text, ScrollView, Dimensions, Image, TouchableOpacity, Platform, StatusBar, TextInput, Modal, ActivityIndicator, Alert, RefreshControl, DeviceEventEmitter, Animated as RNAnimated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getActiveRoom, sendChallenge, ChallengePayload, Room, SentChallenge } from '@/services/roomService';
import GameSocket from '@/services/socketService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchCards, fetchAvailableDeck, fetchSendLimits, SendLimits } from '@/services/cardService';
import { useSidebar } from '@/context/SidebarContext';
import { fetchStoreBundles, CardBundle } from '@/services/storeService';
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { ANIMATED_AVATARS } from '@/constants/avatars';
import CustomAlertModal, { AlertConfig } from '@/components/CustomAlertModal';
import DaresSkeleton from '@/components/DaresSkeleton';
import FreePlanEndModal from '@/components/FreePlanEndModal';
import { resolveCategoryImageUrl, syncCategoryImages } from '@/services/categoryService';

const sunsetPicnic = require('@/assets/images/sunset_picnic.jpeg');

const getBundleImage = (bundleName: string, defaultUrl?: string | null) => {
  const name = (bundleName || '').toLowerCase();
  if (name.includes('spicy') || name.includes('spark') || name.includes('nights')) {
    return require('../../assets/images/bundle_spicy.jpg');
  }
  if (name.includes('romantic') || name.includes('getaway') || name.includes('adventure') || name.includes('travel') || name.includes('weekend')) {
    return require('../../assets/images/bundle_romantic.jpg');
  }
  if (name.includes('cozy') || name.includes('connection') || name.includes('night') || name.includes('indoor') || name.includes('winter')) {
    return require('../../assets/images/bundle_cozy.jpg');
  }
  
  if (defaultUrl && defaultUrl.trim() !== '') {
    return { uri: defaultUrl };
  }
  
  return require('../../assets/images/bundle_cozy.jpg');
};

const FALLBACK_STORE_BUNDLES: CardBundle[] = [
  {
    id: 'dummy-spicy',
    name: 'Spicy Spark 🔥',
    description: 'Ignite passion with bold, intimate, and adventurous dares designed to bring you closer.',
    image_url: 'https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?w=500&h=400&fit=crop',
    is_active: true,
    bundle_plans: [
      { id: 'plan-spicy-1', bundle_id: 'dummy-spicy', card_count: 10, price: 99 },
      { id: 'plan-spicy-2', bundle_id: 'dummy-spicy', card_count: 25, price: 199 },
    ],
  },
  {
    id: 'dummy-romance',
    name: 'Romantic Getaway ✈️',
    description: 'Create unforgettable memories with outdoor dates, cute surprise tasks, and playful challenges.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=400&fit=crop',
    is_active: true,
    bundle_plans: [
      { id: 'plan-romance-1', bundle_id: 'dummy-romance', card_count: 15, price: 149 },
    ],
  },
  {
    id: 'dummy-cozy',
    name: 'Cozy Connection 🕯️',
    description: 'Warm, relaxing inside-the-house cards to connect deeply on lazy Sunday mornings or rainy evenings.',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=400&fit=crop',
    is_active: true,
    bundle_plans: [
      { id: 'plan-cozy-1', bundle_id: 'dummy-cozy', card_count: 20, price: 99 },
    ],
  },
];

type Dare = ChallengePayload & {
  id: string | number;
  deck_card_id?: string;
  card_id?: string;
  bundle_id?: string | null;
  bundle_name?: string | null;
  bundle_image?: string | null;
  stars: number;
  isPaid: boolean;
  categoryImage?: string | null;
  isNew?: boolean;
};

// Helper to map card structure from Supabase strictly using category image
const mapCardToDare = (card: any): Dare => {
  const rawCategory = card.category_name || card.card_categories?.name || 'GENERAL';
  const cleanCategory = rawCategory.split('_')[0].toUpperCase();

  const difficulty = (card.attributes?.difficulty || 'MEDIUM').toUpperCase();
  const time = card.attributes?.time || '24 hrs';
  const stars = card.attributes?.stars || 2;
  const description = card.power_description || card.attributes?.description || 'No description available.';

  // Strictly bound to category image (zero card-specific photos or hardcoded defaults)
  const categoryImageUrl = resolveCategoryImageUrl(card);
  const image = { uri: categoryImageUrl };

  return {
    id: card.deck_card_id || card.id,
    deck_card_id: card.deck_card_id || card.id,
    card_id: card.card_id,
    bundle_id: card.bundle_id || null,
    bundle_name: card.bundle_name || null,
    bundle_image: card.bundle_image || null,
    title: card.card_name || card.name,
    category: cleanCategory,
    categoryImage: categoryImageUrl,
    difficulty,
    stars,
    time,
    image,
    description,
    isPaid: !!card.bundle_id
  };
};






const { width: WINDOW_WIDTH } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, 450); // Cap width for web
const ITEM_WIDTH = SCREEN_WIDTH * 0.78;
const ITEM_HEIGHT = ITEM_WIDTH * 1.45;

const getCatColor = (cat: string) => {
  const c = (cat || '').toLowerCase();
  if(c.includes('romance')) return '#FF296D';
  if(c.includes('fun')) return '#9D4EDD';
  if(c.includes('spicy')) return '#D90429';
  return '#3A86FF';
};

const CarouselItemUI = ({ item, isDark, onSelectDare, isNewCard }: any) => {
  const categoryColor = getCatColor(item.category);
  const showNew = isNewCard || item.isNew;
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onSelectDare(item)}
      className="w-full h-full rounded-[28px] overflow-hidden shadow-2xl"
      style={{ 
        backgroundColor: isDark ? '#1C1721' : '#FFFFFF',
        borderWidth: showNew ? 2 : 1,
        borderColor: showNew ? '#FF296D' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
        shadowColor: showNew ? '#FF296D' : (isDark ? '#000' : '#FF296D'), 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: showNew ? 0.75 : (isDark ? 0.6 : 0.1), 
        shadowRadius: 20 
      }}
    >
      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
      
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', backgroundColor: 'rgba(0,0,0,0.5)' }} />

      <View className="absolute top-5 left-5 right-5 flex-row justify-between items-center">
        {item.category ? (
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: categoryColor }}>
             <Text className="text-white text-[11px] font-black tracking-widest uppercase">{item.category}</Text>
          </View>
        ) : <View />}

        {showNew && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FF296D',
              paddingHorizontal: 9,
              paddingVertical: 4.5,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.4)',
              shadowColor: '#FF296D',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.9,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="sparkles" size={11} color="#FFF" style={{ marginRight: 3.5 }} />
            <Text style={{ color: '#FFF', fontSize: 10.5, fontWeight: '900', letterSpacing: 0.6 }}>NEW</Text>
          </View>
        )}
      </View>

      <View className="absolute bottom-6 left-5 right-5">
         <Text className="text-white text-[26px] font-black mb-1 tracking-tight leading-8">{item.title}</Text>
         <Text className="text-white/90 text-[14px] leading-5 mb-5" numberOfLines={2}>{item.description}</Text>
         
         <View className="flex-row justify-between items-center mt-1">
           <View className="flex-row items-center">
             <Ionicons name="people" size={16} color="white" />
             <Text className="text-white font-semibold text-[13px] ml-1.5">2+ People</Text>
           </View>
           <TouchableOpacity onPress={() => onSelectDare(item)} className="w-12 h-12 rounded-full items-center justify-center bg-[#FF296D] shadow-lg">
             <Ionicons name="arrow-forward" size={22} color="white" />
           </TouchableOpacity>
         </View>
      </View>
    </TouchableOpacity>
  );
};

const DareCarousel = ({ data, isDark, onSelectDare, newCardIds }: any) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const Animated = RNAnimated;
  // We store a separate Animated.ValueXY for EVERY card ID so they don't share position.
  // This completely eliminates the 1-frame flash when swapping cards!
  const positionCache = React.useRef<{ [key: string]: any }>({});
  const getPosition = (id: string | number) => {
    if (!positionCache.current[id]) {
      positionCache.current[id] = new Animated.ValueXY();
    }
    return positionCache.current[id];
  };

  // Reset index when data changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [data?.length, data?.[0]?.id]);

  const latestIndex = React.useRef(currentIndex);
  const latestData = React.useRef(data);

  React.useEffect(() => {
    latestIndex.current = currentIndex;
    latestData.current = data;
  }, [currentIndex, data]);

  const isAnimating = React.useRef(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt: any, gestureState: any) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt: any, gestureState: any) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (!isAnimating.current && d && d[idx]) {
          const currentPosition = getPosition(d[idx].id);
          currentPosition.setOffset({
            x: (currentPosition.x as any)._value,
            y: (currentPosition.y as any)._value
          });
          currentPosition.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt: any, gestureState: any) => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        const currentPosition = getPosition(d[idx].id);
        currentPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt: any, gestureState: any) => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        
        const currentPosition = getPosition(d[idx].id);
        currentPosition.flattenOffset();

        const isSwipeRight = gestureState.dx > 100 || (gestureState.dx > 20 && gestureState.vx > 0.5);
        const isSwipeLeft = gestureState.dx < -100 || (gestureState.dx < -20 && gestureState.vx < -0.5);

        if (isSwipeRight) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
              toValue: { x: SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false
            }).start(() => {
            setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              setTimeout(() => {
                currentPosition.setValue({ x: 0, y: 0 });
                isAnimating.current = false;
              }, 50);
            });
        } else if (isSwipeLeft) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
              toValue: { x: -SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false
            }).start(() => {
            setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
              setTimeout(() => {
                currentPosition.setValue({ x: 0, y: 0 });
                isAnimating.current = false;
              }, 50);
            });
        } else {
          Animated.spring(currentPosition, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  if (!data || data.length === 0) return null;

  const renderCards = () => {
    const cardsToRender = [];
    const count = Math.min(data.length, 3);
    for (let offset = 0; offset < count; offset++) {
      const idx = (currentIndex + offset) % data.length;
      cardsToRender.push({ item: data[idx], offset, originalIndex: idx });
    }

    if (!data || data.length === 0) return null;
    const frontCard = data[currentIndex];
    if (!frontCard) return null;
    const frontPosition = getPosition(frontCard.id);

    return cardsToRender.map(({ item, offset, originalIndex }) => {
      const isFront = offset === 0;
      const isSecond = offset === 1;
      const isThird = offset === 2;

      let animatedStyle: any = {};
      let panHandlers = {};

      if (isFront) {
        const itemPosition = getPosition(item.id);
        const rotate = itemPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['-8deg', '0deg', '8deg'],
          extrapolate: 'clamp'
        });
        animatedStyle = {
          transform: [
            { translateX: itemPosition.x },
            { translateY: itemPosition.y },
            { scale: 1 },
            { rotate }
          ],
          zIndex: 3,
          elevation: 3
        };
        if (isFront) {
          panHandlers = panResponder.panHandlers;
        }
      } else if (isSecond) {
        const scale = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [1, 0.94, 1],
          extrapolate: 'clamp'
        });
        const rotate = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['0deg', '-6deg', '0deg'],
          extrapolate: 'clamp'
        });
        const translateX = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [0, -25, 0],
          extrapolate: 'clamp'
        });
        const translateY = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [0, -10, 0],
          extrapolate: 'clamp'
        });
        animatedStyle = {
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          zIndex: 2,
          elevation: 2
        };
      } else if (isThird) {
        animatedStyle = {
          transform: [{ translateX: 25 }, { translateY: -5 }, { scale: 0.88 }, { rotate: '6deg' }],
          zIndex: 1,
          elevation: 1
        };
      }

      return (
        <Animated.View
          key={item.id || originalIndex}
          style={[
            { position: 'absolute', width: ITEM_WIDTH, height: ITEM_HEIGHT },
            animatedStyle
          ]}
          {...panHandlers}
        >
          <CarouselItemUI
            item={item}
            isDark={isDark}
            onSelectDare={onSelectDare}
            isNewCard={newCardIds?.has(String(item.id)) || item.isNew}
          />
        </Animated.View>
      );
    }).reverse();
  };

  const renderPagination = () => {
    const totalDots = Math.min(data.length, 5);
    if (totalDots <= 1) return null;

    return (
      <View className="flex-row justify-center items-center mt-6 h-4">
        {Array.from({ length: totalDots }).map((_, i) => {
          const activeIndex = currentIndex % totalDots;
          const isActive = activeIndex === i;
          return (
            <TouchableOpacity 
              key={i} 
              activeOpacity={0.7}
              onPress={() => {
                if (data && data[currentIndex]) {
                  getPosition(data[currentIndex].id).setValue({ x: 0, y: 0 });
                }
                setCurrentIndex(i);
              }}
              style={{ 
                height: 8, 
                width: isActive ? 24 : 8, 
                borderRadius: 4, 
                backgroundColor: isActive ? '#FF296D' : (isDark ? '#3D3442' : '#D9D9D9'),
                marginHorizontal: 4,
                opacity: isActive ? 1 : 0.6
              }} 
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
        {renderCards()}
      </View>
      {renderPagination()}
    </View>
  );
};

// In-memory cache for instant zero-latency tab switching without loading flicker
let memoryCachedDares: Dare[] = [];
let memoryCachedLimits: any = null;
let memoryCachedRoom: any = null;
let memoryCachedCategoryIcons: Record<string, string> | null = null;

export default function Dares() {
  const { openSidebar } = useSidebar();
  const userAvatar = useUserAvatar();
  const router = useRouter();
  const params = useLocalSearchParams<{ selectedCategory?: string }>();
  const [unlockedPack, setUnlockedPack] = useState<any>(null);
  const [unlockedPacksMap, setUnlockedPacksMap] = useState<Record<string, any>>({});
  const [selectedDare, setSelectedDare] = useState<Dare | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = React.useRef(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [room, setRoom] = useState<Room | null>(memoryCachedRoom);
  const [note, setNote] = useState<string>('');
  const [limits, setLimits] = useState<SendLimits | null>(memoryCachedLimits);
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false);
  const [customAlert, setCustomAlert] = useState<AlertConfig>({ visible: false, title: '', message: '' });
  const [categoryDbImages, setCategoryDbImages] = useState<Record<string, string>>({});
  const lastDaresFetchRef = React.useRef<number>(0);

  useEffect(() => {
    if (selectedDare) {
      setNote('');
    }
  }, [selectedDare]);

  // Load unlocked packs from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('@soulshuffle_unlocked_packs').then(val => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            setUnlockedPacksMap(parsed);
          }
        } catch (e) {}
      }
    });
    AsyncStorage.getItem('@soulshuffle_last_unlocked_pack').then(val => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setUnlockedPack(parsed);
        } catch (e) {}
      }
    });
  }, []);

  // Listen for refresh events (including new purchases from store)
  useEffect(() => {
    syncCategoryImages().catch(() => {});

    const sub = DeviceEventEmitter.addListener('app:refreshDares', (eventData?: any) => {
      loadDares(true, true);
      if (eventData?.newlyUnlockedPack) {
        const p = eventData.newlyUnlockedPack;
        setUnlockedPack(p);
        setUnlockedPacksMap(prev => ({
          ...prev,
          [p.bundleId]: p
        }));
        setSelectedCategory(`PACK_${p.bundleId}`);
      } else {
        AsyncStorage.getItem('@soulshuffle_unlocked_packs').then(val => {
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (parsed && typeof parsed === 'object') setUnlockedPacksMap(parsed);
            } catch (e) {}
          }
        });
        AsyncStorage.getItem('@soulshuffle_last_unlocked_pack').then(val => {
          if (val) {
            try {
              setUnlockedPack(JSON.parse(val));
            } catch (e) {}
          }
        });
      }
    });

    const catSub = DeviceEventEmitter.addListener('app:categoriesUpdated', () => {
      setDares((prev) =>
        prev.map((d) => ({
          ...d,
          categoryImage: resolveCategoryImageUrl(d),
          image: { uri: resolveCategoryImageUrl(d) },
        }))
      );
    });

    return () => {
      sub.remove();
      catSub.remove();
    };
  }, []);

  // Sync route params when navigating directly to a category (e.g. from store)
  useEffect(() => {
    if (params?.selectedCategory) {
      setSelectedCategory(params.selectedCategory);
    }
  }, [params?.selectedCategory]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('app:showPlansModal', () => {
      setShowPlansModal(true);
    });
    return () => sub.remove();
  }, []);

  const [dares, setDares] = useState<Dare[]>(memoryCachedDares);
  const [loading, setLoading] = useState(memoryCachedDares.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const searchBarAnim = React.useRef(new RNAnimated.Value(0)).current;

  // New card IDs set for displaying the "✨ NEW" badge across all purchased packs
  const newCardIds = useMemo(() => {
    const set = new Set<string>();
    if (unlockedPack?.cardIds) {
      unlockedPack.cardIds.forEach((id: any) => set.add(String(id)));
    }
    Object.values(unlockedPacksMap || {}).forEach((p: any) => {
      (p?.cardIds || []).forEach((id: any) => set.add(String(id)));
    });
    return set;
  }, [unlockedPack, unlockedPacksMap]);

  // Merge newly unlocked bundle cards into the visible deck
  const mergedDares = useMemo(() => {
    const existingIds = new Set(dares.map((d: any) => String(d.id)));
    const existingCardIds = new Set(dares.map((d: any) => String(d.card_id || '')));

    const additional: any[] = [];
    // Collect from all unlocked packs
    const allPacks: any[] = Object.values(unlockedPacksMap || {});
    if (unlockedPack && !allPacks.some((p: any) => p?.bundleId === unlockedPack.bundleId)) {
      allPacks.push(unlockedPack);
    }

    allPacks.forEach((pack: any) => {
      if (!pack || !pack.bundleId) return;
      (pack?.cards || []).forEach((c: any) => {
        const idStr = String(c.id);
        if (!existingIds.has(idStr) && !existingCardIds.has(idStr)) {
          existingIds.add(idStr);
          additional.push({
            id: c.id,
            deck_card_id: c.deck_card_id || c.id,
            card_id: c.card_id || c.id,
            bundle_id: pack.bundleId,
            bundle_name: pack.bundleName,
            bundle_image: pack.bundleImage,
            title: c.title || c.name,
            category: c.category || 'SPICY',
            difficulty: c.difficulty || 'HIGH',
            stars: c.stars || 3,
            time: c.time || 'Tonight',
            image: c.image || require('@/assets/images/bundle_spicy.jpg'),
            description: c.description || c.power_description,
            isPaid: true,
            isNew: true,
          });
        }
      });
    });

    return [...additional, ...dares];
  }, [dares, unlockedPack, unlockedPacksMap]);

  const toggleSearch = () => {
    if (searchOpen) {
      // Close: animate out then reset
      RNAnimated.timing(searchBarAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
        setSearchQuery('');
        setSearchOpen(false);
      });
    } else {
      setSearchOpen(true);
      RNAnimated.timing(searchBarAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    }
  };

  // Compute search-filtered deck: matching cards float to the TOP of the deck
  const getFilteredDares = useCallback((baseDares: any[]) => {
    if (!searchQuery.trim()) return baseDares;
    const q = searchQuery.trim().toLowerCase();
    const matching = baseDares.filter(d =>
      (d.title || d.name || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q)
    );
    const rest = baseDares.filter(d =>
      !(d.title || d.name || '').toLowerCase().includes(q) &&
      !(d.category || '').toLowerCase().includes(q)
    );
    return [...matching, ...rest];
  }, [searchQuery]);

  const filteredDares = useMemo(() => {
    let base = mergedDares;
    if (selectedCategory.startsWith('PACK_')) {
      const packBundleId = selectedCategory.replace('PACK_', '');
      const matched = mergedDares.filter((d: any) => {
        if (d.bundle_id && String(d.bundle_id) === String(packBundleId)) return true;
        const pack = unlockedPacksMap[packBundleId] || (unlockedPack?.bundleId === packBundleId ? unlockedPack : null);
        if (pack?.cardIds && pack.cardIds.map(String).includes(String(d.id))) return true;
        if (pack?.cardIds && pack.cardIds.map(String).includes(String(d.card_id))) return true;
        return false;
      });

      if (matched.length > 0) {
        base = matched;
      } else {
        const pack = unlockedPacksMap[packBundleId] || (unlockedPack?.bundleId === packBundleId ? unlockedPack : null);
        base = pack?.cards || [];
      }
    } else if (selectedCategory !== 'ALL') {
      base = mergedDares.filter((d: any) => d.category === selectedCategory);
    }
    return getFilteredDares(base);
  }, [mergedDares, selectedCategory, getFilteredDares, unlockedPack, unlockedPacksMap]);

  const dynamicCategories = useMemo(() => {
    const list: any[] = [];

    // Map all purchased bundles from currently active deck cards
    const bundleMap = new Map<string, { id: string; name: string; count: number; image: any }>();

    mergedDares.forEach((d: any) => {
      if (d.bundle_id) {
        const bId = String(d.bundle_id);
        const bName = d.bundle_name || unlockedPacksMap[bId]?.bundleName || (unlockedPack?.bundleId === bId ? unlockedPack.bundleName : 'Card Bundle');
        const bImg = d.bundle_image || unlockedPacksMap[bId]?.bundleImage || (unlockedPack?.bundleId === bId ? unlockedPack.bundleImage : null);
        if (!bundleMap.has(bId)) {
          bundleMap.set(bId, { id: bId, name: bName, count: 1, image: bImg });
        } else {
          bundleMap.get(bId)!.count++;
        }
      }
    });

    // Also include any purchased packs that might have cards in local pack cache
    Object.values(unlockedPacksMap || {}).forEach((pack: any) => {
      if (pack && pack.bundleId && !bundleMap.has(String(pack.bundleId))) {
        bundleMap.set(String(pack.bundleId), {
          id: String(pack.bundleId),
          name: pack.bundleName || 'Card Bundle',
          count: pack.cardCount || pack.cards?.length || 0,
          image: pack.bundleImage || null
        });
      }
    });

    if (unlockedPack && unlockedPack.bundleId && !bundleMap.has(String(unlockedPack.bundleId))) {
      bundleMap.set(String(unlockedPack.bundleId), {
        id: String(unlockedPack.bundleId),
        name: unlockedPack.bundleName || 'Card Bundle',
        count: unlockedPack.cardCount || unlockedPack.cards?.length || 10,
        image: unlockedPack.bundleImage || null
      });
    }

    // Build dedicated pill for EVERY purchased bundle
    bundleMap.forEach((bInfo, bId) => {
      let packImage = require('@/assets/images/bundle_spicy.jpg');
      const nameLower = (bInfo.name || '').toLowerCase();
      if (nameLower.includes('romanc')) packImage = require('@/assets/images/bundle_romantic.jpg');
      else if (nameLower.includes('cozy')) packImage = require('@/assets/images/bundle_cozy.jpg');

      list.push({
        id: `PACK_${bId}`,
        label: `✨ ${bInfo.name}`,
        count: bInfo.count,
        color: '#FF296D',
        image: bInfo.image ? { uri: bInfo.image } : packImage,
        isPurchasedPack: true,
      });
    });

    // Regular Categories from cards
    const catMap = new Map();
    mergedDares.forEach((d: any) => {
      const c = d.category || 'GENERAL';
      const catImg = d.categoryImage || (typeof d.image === 'object' && d.image?.uri ? d.image.uri : null);
      if (!catMap.has(c)) {
        catMap.set(c, { id: c, count: 1, image: catImg });
      } else {
        catMap.get(c).count++;
        if (!catMap.get(c).image && catImg) {
          catMap.get(c).image = catImg;
        }
      }
    });

    const regularCategories = Array.from(catMap.values()).map(cat => {
      let color = '#3A86FF';
      let defaultImage: any = require('@/assets/images/bundle_cozy.jpg');
      const nameLower = cat.id.toLowerCase();
      if(nameLower.includes('romanc')) { color = '#FF296D'; defaultImage = require('@/assets/images/bundle_romantic.jpg'); }
      else if(nameLower.includes('spic')) { color = '#D90429'; defaultImage = require('@/assets/images/bundle_spicy.jpg'); }
      else if(nameLower.includes('fun')) { color = '#9D4EDD'; defaultImage = require('@/assets/images/bundle_cozy.jpg'); }
      else if(nameLower.includes('deep') || nameLower.includes('conflict')) { color = '#3A86FF'; defaultImage = require('@/assets/images/sunset_picnic.jpeg'); }
      else if(nameLower.includes('penalt')) { color = '#FF9F1C'; defaultImage = require('@/assets/images/bundle_spicy.jpg'); }

      const dbUrl = cat.image ||
                    categoryDbImages[cat.id.toUpperCase()] ||
                    categoryDbImages[cat.id] ||
                    null;

      const image = dbUrl ? { uri: dbUrl } : defaultImage;

      return {
        id: cat.id,
        label: cat.id.charAt(0) + cat.id.slice(1).toLowerCase(),
        count: cat.count,
        color,
        image
      };
    });

    return [...list, ...regularCategories];
  }, [mergedDares, unlockedPack, unlockedPacksMap, categoryDbImages]);

  useEffect(() => {
    if (selectedCategory !== 'ALL' && !selectedCategory.startsWith('PACK_') && dynamicCategories.length > 0 && !dynamicCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('ALL');
    }
  }, [selectedCategory, dynamicCategories]);

  const getFallbackCards = () => [
    {
      id: "fallback-1",
      name: "Candlelight Dinner",
      power_description: "Set up a romantic candlelit dinner at home and talk about your future dreams.",
      image_url: null,
      card_type: "ACTION",
      attributes: { difficulty: "medium", time: "2 hours", stars: 2 },
      card_categories: { id: "c1", name: "Romance_123" }
    }
  ];

  const CACHE_KEY = '@soulshuffle_dares_cache';

  // Instant frame-1 cache loader on screen mount
  useEffect(() => {
    AsyncStorage.multiGet([CACHE_KEY, 'cachedActiveRoom']).then(([daresRes, roomRes]) => {
      if (daresRes && daresRes[1]) {
        try {
          const { cachedDares, cachedLimits, roomId } = JSON.parse(daresRes[1]);
          if (cachedDares && cachedDares.length > 0) {
            memoryCachedDares = cachedDares;
            setDares(cachedDares);
            if (cachedLimits) {
              memoryCachedLimits = cachedLimits;
              setLimits(cachedLimits);
            }
            if (roomId) {
              const r = { id: roomId, code: '', status: 'ACTIVE' };
              memoryCachedRoom = r;
              setRoom(r as any);
            }
            setLoading(false);
          }
        } catch (e) {}
      }
      if (roomRes && roomRes[1]) {
        try {
          const parsedRoom = JSON.parse(roomRes[1]);
          if (parsedRoom && parsedRoom.id) {
            setRoom(parsedRoom);
            memoryCachedRoom = parsedRoom;
          }
        } catch (e) {}
      }
    }).catch(() => {});
  }, []);

  // Safety watchdog: ensure skeleton never stays stuck longer than 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const loadDares = async (silent = false, skipCache = false) => {
    try {
      if (!silent) setLoading(true);
      const appLoadStartTime = performance.now();

      if (!skipCache) {
        try {
          const cachedData = await AsyncStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const { cachedDares, cachedLimits, roomId } = JSON.parse(cachedData);
            if (cachedDares && cachedDares.length > 0) {
              memoryCachedDares = cachedDares;
              if (cachedLimits) memoryCachedLimits = cachedLimits;
              if (roomId) memoryCachedRoom = { id: roomId, code: '', status: 'ACTIVE' };
              setDares(cachedDares);
              if (cachedLimits) setLimits(cachedLimits);
              if (roomId) setRoom({ id: roomId, code: '', status: 'ACTIVE' } as any);
              setLoading(false);
            }
          }
        } catch (e) {
          console.log('Failed to load cache:', e);
        }
      }

      const activeRoom = await getActiveRoom();
      setRoom(activeRoom);
      memoryCachedRoom = activeRoom;
      
      if (activeRoom && activeRoom.status === 'ACTIVE') {
        const [fetched, fetchedLimits] = await Promise.all([
          fetchAvailableDeck(activeRoom.id),
          fetchSendLimits(activeRoom.id)
        ]);
        
        const mapped = fetched.map(mapCardToDare);
        memoryCachedDares = mapped;
        memoryCachedLimits = fetchedLimits;
        setDares(mapped);
        setLimits(fetchedLimits);

        lastDaresFetchRef.current = Date.now();
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          cachedDares: mapped,
          cachedLimits: fetchedLimits,
          roomId: activeRoom.id
        })).catch(() => {});

        // Silently fetch master categories to extract actual database icon URLs (cached per session)
        if (!memoryCachedCategoryIcons) {
          fetchCards().then(masterCards => {
            if (Array.isArray(masterCards)) {
              const catImages: Record<string, string> = {};
              masterCards.forEach((mc: any) => {
                const catName = mc.card_categories?.name || mc.category_name;
                const icon = mc.card_categories?.icon_url || mc.card_categories?.image_url;
                if (catName && icon) {
                  const clean = catName.split('_')[0].trim().toUpperCase();
                  catImages[clean] = icon;
                  catImages[catName.toUpperCase()] = icon;
                  const firstWord = clean.split(/[^A-Za-z0-9]/)[0];
                  if (firstWord) catImages[firstWord.toUpperCase()] = icon;
                }
              });
              if (Object.keys(catImages).length > 0) {
                memoryCachedCategoryIcons = catImages;
                setCategoryDbImages(prev => ({ ...prev, ...catImages }));
              }
            }
          }).catch(() => {});
        } else {
          setCategoryDbImages(prev => ({ ...prev, ...memoryCachedCategoryIcons }));
        }
      } else {
        memoryCachedDares = [];
        memoryCachedLimits = null;
        setDares([]);
        setLimits(null);
        AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
      }
    } catch (error: any) {
      console.log('Failed to fetch dares from backend:', error?.message);
      setDares((prevDares) => {
        if (prevDares && prevDares.length > 0) return prevDares;
        return [];
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastDaresFetchRef.current > 15000) {
        lastDaresFetchRef.current = now;
        loadDares(true);
      }
    }, [])
  );

  // Listen for card selected from home page "Picked for You" section
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openDareCard', ({ cardId }: { cardId: string }) => {
      if (!cardId) return;
      setDares(prev => {
        const idx = prev.findIndex(d => d.id === cardId || (d as any).deck_card_id === cardId);
        if (idx <= 0) return prev; // Already first or not found
        const updated = [...prev];
        const [card] = updated.splice(idx, 1);
        updated.unshift(card);
        return updated;
      });
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const setupSocket = async () => {
      if (room && room.status === 'WAITING') {
        await GameSocket.initialize();
        GameSocket.joinRoom(room.code);
      }
    };
    setupSocket();
  }, [room?.code, room?.status]);

  useEffect(() => {
    const handlePartnerJoined = (payload: any) => {
      loadDares(true);
    };

    const handleRoomLeft = () => {
      memoryCachedDares = [];
      memoryCachedLimits = null;
      memoryCachedRoom = null;
      setRoom(null);
      setDares([]);
      setLimits(null);
      AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
    };

    const handleGameEvent = (payload: any) => {
      if (payload.eventType === 'CARD_REJECTED') {
        setTimeout(() => loadDares(true, true), 1500);
      } else {
        loadDares(true);
      }
    };

    const clearSub = DeviceEventEmitter.addListener('app:clearRoom', handleRoomLeft);
    const refreshDaresSub = DeviceEventEmitter.addListener('app:refreshDares', () => {
      lastDaresFetchRef.current = 0;
      loadDares(false, true);
    });

    GameSocket.on('partner_joined', handlePartnerJoined);
    GameSocket.on('partner_left', handleRoomLeft);
    GameSocket.on('room_left', handleRoomLeft);
    GameSocket.on('game_event', handleGameEvent);

    return () => {
      clearSub.remove();
      refreshDaresSub.remove();
      GameSocket.off('partner_joined', handlePartnerJoined);
      GameSocket.off('partner_left', handleRoomLeft);
      GameSocket.off('room_left', handleRoomLeft);
      GameSocket.off('game_event', handleGameEvent);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDares(true);
  };

  const renderDisconnectedState = () => {
    return (
      <View className="flex-1 justify-center items-center px-8 py-16">
        <View className="bg-white dark:bg-[#1C1721] rounded-2xl p-8 items-center shadow-rose-100/50 border border-rose-100/50 dark:border-rose-950/20 w-full max-w-sm">
          <View className="w-20 h-20 bg-rose-50 dark:bg-[#2B1B24] rounded-full items-center justify-center mb-6">
            <Ionicons name="heart-dislike-outline" size={42} color={isDark ? "#FF296D" : "#FF296D"} />
          </View>
          <Text className="text-2xl font-black text-slate-800 dark:text-white text-center mb-3 tracking-tight">
            Connection Required
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-[14px] text-center leading-6 mb-8">
            Please connect to your partner first to play and share dares. Join a room or invite your partner to get started!
          </Text>
          <TouchableOpacity
            className="w-full bg-[#FF296D] rounded-full py-4 items-center justify-center shadow-sm"
            activeOpacity={0.85}
            onPress={() => router.push('/')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="link" size={18} color="white" />
              <Text className="text-white font-bold text-[15px] ml-2">Connect Now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleSendChallenge = async () => {
    if (!selectedDare) return;
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    const activeRoom = room || await getActiveRoom();
    if (!activeRoom) {
      isSendingRef.current = false;
      setCustomAlert({ visible: true, title: 'No Room Found', message: 'Create or join a room before sending a challenge.' });
      return;
    }
    if (activeRoom.status !== 'ACTIVE') {
      isSendingRef.current = false;
      setCustomAlert({ visible: true, title: 'Partner Not Connected', message: 'Your partner needs to join the room before you can send a challenge.' });
      return;
    }

    // ── Hard limit guard (double-check even if button was enabled) ──
    if (limits && limits.can_send === false) {
      isSendingRef.current = false;
      const isBlocked = limits.active_remaining <= 0;
      if (!isBlocked && limits.daily_remaining <= 0) {
        setSelectedDare(null);
        setShowPlansModal(true);
        return;
      }
      const title = isBlocked ? 'Waiting for Partner' : 'Daily Limit Reached';
      const msg = isBlocked
        ? 'You sent a card. Waiting for partner to complete action. Once partner completes action, you can send another card.'
        : `Daily limit reached (${limits.daily_limit} cards/day). Resets tomorrow!`;
      setCustomAlert({ visible: true, title, message: msg });
      return;
    }

    const targetDare = selectedDare;
    const currentNote = note;
    const backupDares = [...dares];

    // Close modal and start sending spinner
    setSelectedDare(null);
    setIsSending(true);

    // Optimistic: remove card from visible list & update limits
    setDares(prevDares => prevDares.filter(d => d.id !== targetDare.id));

    const backupLimits = limits ? { ...limits } : null;
    let newOptimisticLimits = limits ? { ...limits } : null;
    if (limits) {
      newOptimisticLimits = {
        ...limits,
        daily_sent: limits.daily_sent + 1,
        daily_remaining: Math.max(0, limits.daily_remaining - 1),
        active_count: limits.active_count + 1,
        active_remaining: Math.max(0, limits.active_remaining - 1),
      };
      newOptimisticLimits.can_send = newOptimisticLimits.daily_remaining > 0 && newOptimisticLimits.active_remaining > 0;
      setLimits(newOptimisticLimits);
    }

    try {
      const cardIdToSend = (targetDare.deck_card_id || targetDare.id).toString();
      const sentData = await sendChallenge(cardIdToSend, currentNote, activeRoom);

      // Create rich history item
      const newHistoryCard: SentChallenge = {
        id: sentData?.id || String(Date.now()),
        card_id: String(targetDare.card_id || targetDare.deck_card_id || targetDare.id),
        title: targetDare.title,
        description: targetDare.description || '',
        category: targetDare.category || 'Dare',
        difficulty: targetDare.difficulty || 'Medium',
        time: targetDare.time || 'Today',
        image: targetDare.image || null,
        message: currentNote || '',
        room_id: activeRoom.id,
        room_code: activeRoom.code || 'GAME',
        room_status: activeRoom.status || 'ACTIVE',
        sender_id: sentData?.sender_id || activeRoom.host_id,
        receiver_id: sentData?.receiver_id || activeRoom.partner_id,
        is_sent_by_me: true,
        status: 'SENT',
        sent_at: sentData?.sent_at || new Date().toISOString(),
      };

      // Optimistically write to all history & sends caches immediately
      try {
        const histKey = `cached_active_room_history_${activeRoom.id}`;
        const [rawHist, rawRoomHist, rawSends] = await AsyncStorage.multiGet([
          histKey,
          'cachedRoomHistory',
          'cachedCardSends'
        ]);
        const parseList = (str: string | null | undefined): any[] => {
          if (!str) return [];
          try {
            const p = JSON.parse(str);
            return Array.isArray(p) ? p : [];
          } catch {
            return [];
          }
        };
        const hList = parseList(rawHist ? rawHist[1] : null);
        const rhList = parseList(rawRoomHist ? rawRoomHist[1] : null);
        const sList = parseList(rawSends ? rawSends[1] : null);

        const updatedH = [newHistoryCard, ...hList.filter((x: any) => String(x.id) !== String(newHistoryCard.id))];
        const updatedRH = [newHistoryCard, ...rhList.filter((x: any) => String(x.id) !== String(newHistoryCard.id))];
        const updatedS = [newHistoryCard, ...sList.filter((x: any) => String(x.id) !== String(newHistoryCard.id))];

        await AsyncStorage.multiSet([
          [histKey, JSON.stringify(updatedH)],
          ['cachedRoomHistory', JSON.stringify(updatedRH)],
          ['cachedCardSends', JSON.stringify(updatedS)]
        ]);
      } catch (e) {
        console.log('Error updating history cache on send:', e);
      }

      // ✅ Success — now alert and emit socket event
      setCustomAlert({
        visible: true,
        title: 'Challenge Sent! 🎯',
        message: `"${targetDare.title}" was sent to your partner!`,
        confirmText: 'Awesome!'
      });
      GameSocket.sendGameEvent(activeRoom.code, 'CHALLENGE_SENT', {
        challenge: { ...targetDare, message: currentNote }
      });
      DeviceEventEmitter.emit('app:refreshHistory', newHistoryCard);
      DeviceEventEmitter.emit('app:refreshDashboard');

      // Sync fresh limits from backend
      try {
        const freshLimits = await fetchSendLimits(activeRoom.id);
        setLimits(freshLimits);
        AsyncStorage.getItem(CACHE_KEY).then(cached => {
          if (cached) {
            const parsed = JSON.parse(cached);
            parsed.cachedLimits = freshLimits;
            parsed.cachedDares = dares.filter((d: any) => d.id !== targetDare.id);
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          }
        }).catch(() => {});
      } catch (e) {}

    } catch (error: any) {
      // ❌ API failed — restore card + limits
      setDares(backupDares);
      if (backupLimits) setLimits(backupLimits);

      const errMsg = error?.response?.data?.message || error?.message || 'Failed to send card.';
      setCustomAlert({ visible: true, title: 'Could Not Send', message: errMsg });

      // Restore cache
      AsyncStorage.getItem(CACHE_KEY).then(cached => {
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.cachedDares = backupDares;
          if (backupLimits) parsed.cachedLimits = backupLimits;
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
      }).catch(() => {});
    } finally {
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  const bgColor = isDark ? '#120E15' : '#F7F4F6';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const subTextColor = isDark ? '#A09CA3' : '#7A7A7A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bgColor} />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, backgroundColor: bgColor, zIndex: 10 }}>
        <TouchableOpacity onPress={openSidebar}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, right: 0, zIndex: -1 }} pointerEvents="none">
          <Ionicons name="infinite" size={24} color="#FF296D" style={{ transform: [{ rotate: '-15deg' }] }} />
          <Text style={{ color: '#FF296D', fontWeight: '900', fontSize: 20, letterSpacing: -0.5, marginLeft: 4 }}>SoulShuffle</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image 
              source={{ uri: userAvatar || ANIMATED_AVATARS[0].url }} 
              style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {(loading && dares.length === 0) || (loading && !room) ? (
        <DaresSkeleton isDark={isDark} />
      ) : room && room.status === 'ACTIVE' ? (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF296D']} tintColor={isDark ? '#fff' : '#FF296D'} />
          }
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        >
          {/* Header Title */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: textColor, letterSpacing: -0.5 }}>Dares</Text>
              {/* Right side: Search Icon + Card Count */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Search Circle Button */}
                <TouchableOpacity
                  onPress={toggleSearch}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: searchOpen ? '#FF296D' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'),
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={searchOpen ? 'close' : 'search'} size={17} color={searchOpen ? '#fff' : textColor} />
                </TouchableOpacity>
                {/* Card Count Badge */}
                <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}>
                  <Text style={{ color: textColor, fontWeight: '800', fontSize: 13 }}>
                    {filteredDares.length} Cards
                  </Text>
                </View>
              </View>
            </View>
            <Text style={{ color: subTextColor, fontSize: 15, fontWeight: '500', letterSpacing: -0.2 }}>
              {searchQuery.trim()
                ? `Showing results for "${searchQuery}"`
                : selectedCategory.startsWith('PACK_')
                  ? `Showing newly unlocked cards from ${unlockedPack?.bundleName || 'Purchased Pack'} 🔥`
                  : selectedCategory === 'ALL'
                    ? "Step out, connect, and make memories 💖"
                    : `${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} dares to explore`}
            </Text>

            {/* Animated Search Bar - always mounted, animation drives visibility */}
            <RNAnimated.View style={{
              overflow: 'hidden',
              opacity: searchBarAnim,
              maxHeight: searchBarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 56] }),
              marginTop: searchBarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: isDark ? '#1C0E14' : '#F3F4F6',
                borderRadius: 16, paddingHorizontal: 14,
                borderWidth: 1.5,
                borderColor: searchQuery.trim() ? '#FF296D' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
              }}>
                <Ionicons name="search-outline" size={16} color={searchQuery.trim() ? '#FF296D' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')} />
                <TextInput
                  autoFocus={searchOpen}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search cards or categories..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  style={{
                    flex: 1, marginLeft: 10, paddingVertical: 13,
                    fontSize: 15, fontWeight: '500',
                    color: textColor,
                  }}
                />
                {searchQuery.trim() ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#FF296D" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </RNAnimated.View>

          </View>

          {/* Free Plan Limit Ended Banner */}
          {limits && limits.daily_remaining <= 0 && (
            <TouchableOpacity
              onPress={() => setShowPlansModal(true)}
              activeOpacity={0.85}
              style={{
                marginHorizontal: 24,
                marginBottom: 14,
                padding: 14,
                borderRadius: 18,
                backgroundColor: isDark ? 'rgba(255,41,109,0.12)' : '#FFE4E6',
                borderWidth: 1.5,
                borderColor: '#FF296D',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF296D', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="sparkles" size={17} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#FFF' : '#111' }}>
                    Daily Free Plan Limit Ended
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: isDark ? '#FFA3BF' : '#be123c', marginTop: 1 }}>
                    Compare Free vs Paid to unlock unlimited dares
                  </Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#FF296D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>View Plans</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Carousel */}
          <View style={{ marginTop: 8, marginBottom: 30 }}>
              <DareCarousel 
                data={filteredDares} 
                isDark={isDark} 
                onSelectDare={setSelectedDare} 
                newCardIds={newCardIds}
              />
          </View>

          {/* Explore Categories */}
          {dynamicCategories.length > 0 && (
            <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: textColor }}>Explore Categories</Text>
                {selectedCategory !== 'ALL' && (
                  <TouchableOpacity onPress={() => setSelectedCategory('ALL')}>
                    <Text style={{ color: '#FF296D', fontWeight: '700', fontSize: 14 }}>View all deck</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
                {dynamicCategories.map((cat: any) => (
                  <TouchableOpacity 
                    key={cat.id} 
                    activeOpacity={0.9} 
                    onPress={() => setSelectedCategory(cat.id)} 
                    style={{
                      width: 124,
                      height: 145,
                      backgroundColor: selectedCategory === cat.id ? cat.color : (isDark ? '#1C1721' : '#FFFFFF'),
                      borderRadius: 24,
                      overflow: 'hidden',
                      marginRight: 14,
                      alignItems: 'center',
                      borderWidth: cat.isPurchasedPack ? 2.5 : 2,
                      borderColor: selectedCategory === cat.id ? cat.color : cat.isPurchasedPack ? '#FF296D' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                      shadowColor: cat.isPurchasedPack ? '#FF296D' : cat.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: selectedCategory === cat.id ? 0.4 : cat.isPurchasedPack ? 0.35 : (isDark ? 0.3 : 0.05),
                      shadowRadius: 10,
                      elevation: 3
                    }}
                  >
                    <View style={{ width: '100%', height: '65%', position: 'relative' }}>
                        <Image source={cat.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        
                        {/* Purchased Pack Badge */}
                        {cat.isPurchasedPack && (
                          <View style={{ 
                            position: 'absolute', 
                            top: 6, 
                            left: 6, 
                            backgroundColor: '#FF296D', 
                            borderRadius: 8, 
                            paddingHorizontal: 6,
                            paddingVertical: 2.5,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.4)',
                            shadowColor: '#FF296D',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 4
                          }}>
                            <Text style={{ color: 'white', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.4 }}>NEW PACK</Text>
                          </View>
                        )}

                        {/* Top Right Card Count Badge */}
                        <View style={{ 
                          position: 'absolute', 
                          top: 6, 
                          right: 6, 
                          backgroundColor: 'rgba(0,0,0,0.6)', 
                          borderRadius: 12, 
                          paddingHorizontal: 6,
                          paddingVertical: 3,
                          minWidth: 24, 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.1)'
                        }}>
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>{cat.count}</Text>
                        </View>
                      </View>
                      
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 8 }}>
                        <Text 
                          numberOfLines={1}
                          style={{ 
                            fontSize: 14, 
                            fontWeight: '800', 
                            color: selectedCategory === cat.id ? '#FFF' : cat.color, 
                            textAlign: 'center', 
                            width: '100%' 
                          }}
                        >
                          {cat.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      ) : (
        renderDisconnectedState()
      )}

      {/* Send Modal */}
      <Modal visible={!!selectedDare} transparent animationType="slide" onRequestClose={() => setSelectedDare(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: isDark ? '#1C1721' : '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: textColor }}>Send Dare</Text>
              <TouchableOpacity onPress={() => setSelectedDare(null)} style={{ padding: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 20 }}>
                <Ionicons name="close" size={22} color={textColor} />
              </TouchableOpacity>
            </View>

            {selectedDare && (
              <View style={{ backgroundColor: isDark ? '#261F2C' : '#F7F4F6', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: textColor, marginBottom: 8 }}>{selectedDare.title}</Text>
                <Text style={{ color: subTextColor, fontSize: 14, lineHeight: 22 }}>{selectedDare.description}</Text>
              </View>
            )}

            <Text style={{ fontSize: 15, fontWeight: '700', color: textColor, marginBottom: 12 }}>Add a note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="E.g. We haven't done this in a while..."
              placeholderTextColor={subTextColor}
              style={{
                backgroundColor: isDark ? '#1C1721' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: 16,
                padding: 16,
                color: textColor,
                fontSize: 15,
                marginBottom: 24,
                textAlignVertical: 'top'
              }}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              onPress={handleSendChallenge}
              disabled={isSending || (limits?.can_send === false)}
              style={{
                backgroundColor: limits?.can_send === false ? (isDark ? '#4A3E48' : '#D1C9CD') : '#FF296D',
                borderRadius: 100,
                paddingVertical: 18,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                shadowColor: '#FF296D',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5
              }}
            >
              {isSending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, marginRight: 8 }}>
                    {limits?.can_send === false
                      ? (limits?.active_remaining <= 0 ? 'Waiting for Partner' : 'Daily Limit Reached')
                      : 'Send Challenge'}
                  </Text>
                  {limits?.can_send !== false && <Ionicons name="send" size={16} color="white" />}
                </>
              )}
            </TouchableOpacity>

            {limits && (
              <View style={{ alignItems: 'center', marginTop: 12, paddingHorizontal: 16 }}>
                {limits.active_remaining <= 0 ? (
                  <Text style={{ color: subTextColor, fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 18 }}>
                    You sent a card. Waiting for partner to complete action. Once partner completes action, you can send another card.
                  </Text>
                ) : limits.daily_remaining <= 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDare(null);
                      setShowPlansModal(true);
                    }}
                    style={{ paddingVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#FF296D', fontSize: 13, fontWeight: '800', textAlign: 'center', marginRight: 4 }}>
                      Daily free limit reached (0 remaining). Tap to View Plans
                    </Text>
                    <Ionicons name="arrow-forward" size={13} color="#FF296D" />
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: subTextColor, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                    {limits.daily_remaining} {limits.daily_remaining === 1 ? 'card' : 'cards'} remaining to send today
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
      <CustomAlertModal config={customAlert} onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))} />
      <FreePlanEndModal
        visible={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        reason="limit_reached"
      />
    </SafeAreaView>
  );
}


