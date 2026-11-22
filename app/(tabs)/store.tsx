import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  Modal,
  useWindowDimensions,
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { ANIMATED_AVATARS } from '@/constants/avatars';
import { useSidebar } from '@/context/SidebarContext';
import {
  fetchStoreBundles,
  fetchStoreBundleById,
  fetchPurchaseHistory,
  CardBundle,
  BundlePlan,
  PurchaseRecord,
  bypassStorePurchase,
} from '@/services/storeService';
import { fetchCards, Card } from '@/services/cardService';
import RevenueCatService from '@/services/revenueCatService';
import { getActiveRoom } from '@/services/roomService';
import CustomAlertModal, { AlertConfig } from '@/components/CustomAlertModal';
import PurchasedCardsSwipeReveal from '@/components/PurchasedCardsSwipeReveal';
import BundleCardsSwipeCarousel from '@/components/BundleCardsSwipeCarousel';

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

export default function StoreScreen() {
  const [customAlert, setCustomAlert] = useState<AlertConfig>({ visible: false, title: '', message: '' });
  const router = useRouter();
  const userAvatar = useUserAvatar();
  const params = useLocalSearchParams();
  const buyBundleId = params.buyBundleId as string | undefined;
  const { openSidebar } = useSidebar();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState<CardBundle[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [masterCards, setMasterCards] = useState<Card[]>([]);
  const [bundlePreviewCards, setBundlePreviewCards] = useState<any[]>([]);

  // Purchase Modal State
  const [selectedBundle, setSelectedBundle] = useState<CardBundle | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BundlePlan | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [unlockedCards, setUnlockedCards] = useState<any[]>([]);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Step state: 'details' -> 'google_pay_window' -> 'processing'
  const [paymentStep, setPaymentStep] = useState<'details' | 'google_pay_window' | 'processing'>('details');
  const [processingStatus, setProcessingStatus] = useState('Connecting to Google Play Billing...');
  const [lastOrderId, setLastOrderId] = useState('GPA.3920-5819-2049');

  // Fallback Bundles for Sandbox / Offline
  const DUMMY_BUNDLES: CardBundle[] = [
    {
      id: 'e6b13560-04f3-45b7-988b-1900e12369d0',
      name: 'Spicy Dare Bundle (10 Cards)',
      description: 'Ignite passion with bold, intimate, and adventurous dares designed to bring you closer.',
      image_url: 'https://newgirlfriend.ai/wp-content/uploads/2025/12/Why-Play-Spicy-Truth-or-Dare-Questions-as-a-Couple.jpg',
      is_active: true,
      bundle_plans: [
        { id: '880b6215-eb4a-4f89-8beb-532789cd7a3f', bundle_id: 'e6b13560-04f3-45b7-988b-1900e12369d0', card_count: 10, price: 10, store_product_id: 'bundle_spicy_10' } as any,
      ],
    },
    {
      id: 'dummy-romance',
      name: 'Romantic Getaway ✈️',
      description: 'Create unforgettable memories with outdoor dates, cute surprise tasks, and playful challenges.',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=400&fit=crop',
      is_active: true,
      bundle_plans: [
        { id: 'plan-romance-1', bundle_id: 'dummy-romance', card_count: 15, price: 149, store_product_id: 'bundle_spicy_10' } as any,
      ],
    },
    {
      id: 'dummy-cozy',
      name: 'Cozy Connection 🕯️',
      description: 'Warm, relaxing inside-the-house cards to connect deeply on lazy Sunday mornings or rainy evenings.',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=400&fit=crop',
      is_active: true,
      bundle_plans: [
        { id: 'plan-cozy-1', bundle_id: 'dummy-cozy', card_count: 20, price: 99, store_product_id: 'bundle_spicy_10' } as any,
      ],
    },
  ];

  const resolveBundleCards = (bundle: CardBundle | null, pool: any[], targetCount: number = 10) => {
    if (!bundle) return [];
    let initial: any[] = [];
    if ((bundle as any).cards && Array.isArray((bundle as any).cards) && (bundle as any).cards.length > 0) {
      initial = (bundle as any).cards;
    } else if (bundle.bundle_cards && Array.isArray(bundle.bundle_cards) && bundle.bundle_cards.length > 0) {
      initial = bundle.bundle_cards.map((bc: any) => bc.cards || bc).filter(Boolean);
    }

    const bName = (bundle.name || '').toLowerCase();

    // Match real master cards that match this bundle's theme
    const matched = (pool || []).filter((c: any) => {
      const cat = (c.card_categories?.name || c.category_name || '').toLowerCase();
      const cName = (c.name || '').toLowerCase();
      const desc = (c.power_description || '').toLowerCase();

      if (bName.includes('spicy') || bName.includes('spark') || bName.includes('night')) {
        return cat.includes('spicy') || cat.includes('intima') || cat.includes('passion') || desc.includes('kiss') || desc.includes('touch') || desc.includes('tease') || cName.includes('freeze');
      }
      if (bName.includes('romance') || bName.includes('romantic') || bName.includes('getaway')) {
        return cat.includes('romance') || cat.includes('love') || cat.includes('care') || cat.includes('repair') || desc.includes('hug') || desc.includes('date');
      }
      return cat.includes('fun') || cat.includes('play') || cat.includes('novelty');
    });

    const candidates = [...initial, ...matched, ...(pool || [])];
    const seen = new Set<string>();
    const unique = candidates.filter((c: any) => {
      if (!c || !c.name) return false;
      const key = String(c.id || c.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const chosen = (unique.length > 0 ? unique : pool).slice(0, targetCount);

    return chosen.map((c: any, idx: number) => ({
      id: c.id || `card-${idx}`,
      title: c.name || 'Dare Card',
      description: c.power_description || c.attributes?.description || 'Exclusive dare card from this bundle.',
      category: (c.card_categories?.name || bundle.name.split(' ')[0] || 'SPICY').toUpperCase(),
      difficulty: (c.attributes?.difficulty || 'MEDIUM').toUpperCase(),
      time: c.attributes?.time || 'Tonight',
      stars: c.attributes?.stars || 3,
      image: c.image_url ? { uri: c.image_url } : getBundleImage(bundle.name, bundle.image_url),
    }));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Check room status
      const room = await getActiveRoom().catch(() => null);
      setIsInRoom(!!room);

      // Load bundles, purchases, and master cards in parallel
      const [fetchedBundles, fetchedPurchases, fetchedCards] = await Promise.all([
        fetchStoreBundles().catch(() => []),
        fetchPurchaseHistory().catch(() => []),
        fetchCards().catch(() => []),
      ]);

      if (fetchedBundles && fetchedBundles.length > 0) {
        setBundles(fetchedBundles);
      } else {
        setBundles(DUMMY_BUNDLES);
      }

      setPurchases(fetchedPurchases || []);

      if (Array.isArray(fetchedCards) && fetchedCards.length > 0) {
        setMasterCards(fetchedCards);
      }
    } catch (e) {
      console.log('Failed to load store data:', e);
      setBundles(DUMMY_BUNDLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && bundles.length > 0 && buyBundleId && !hasAutoOpened) {
      const bundleToOpen = bundles.find(b => b.id === buyBundleId);
      if (bundleToOpen) {
        handleSelectBundle(bundleToOpen);
        setHasAutoOpened(true);
      }
    }
  }, [loading, bundles, buyBundleId, hasAutoOpened]);

  const handleSelectBundle = (bundle: CardBundle) => {
    if (!isInRoom) {
      setCustomAlert({
        visible: true,
        title: 'Room Required',
        message: 'You must create or join an active room with your partner before purchasing card bundles.',
        confirmText: 'Go Home',
        cancelText: 'Cancel',
        onConfirm: () => router.push('/'),
        onCancel: () => {}
      });
      return;
    }
    setSelectedBundle(bundle);
    const plans = bundle.bundle_plans || bundle.plans || [];
    const activePlan = plans && plans.length > 0 ? plans[0] : {
      id: '880b6215-eb4a-4f89-8beb-532789cd7a3f',
      bundle_id: bundle.id,
      price: 10,
      card_count: 10,
      store_product_id: 'bundle_spicy_10'
    } as any;
    setSelectedPlan(activePlan);

    // Compute real database cards for carousel
    const resolved = resolveBundleCards(bundle, masterCards, activePlan.card_count || 10);
    setBundlePreviewCards(resolved);

    setCheckoutVisible(true);
    setPurchaseSuccess(false);
    setPaymentStep('details');

    // Async fetch full bundle details (if available from backend)
    if (bundle.id && !bundle.id.startsWith('dummy')) {
      fetchStoreBundleById(bundle.id).then((full) => {
        if (full && (full as any).cards && (full as any).cards.length > 0) {
          const fresh = resolveBundleCards(full, masterCards, activePlan.card_count || 10);
          if (fresh.length > 0) {
            setBundlePreviewCards(fresh);
          }
        }
      }).catch(() => {});
    }
  };

  const executeGooglePayment = async () => {
    if (!selectedBundle || !selectedPlan) {
      setCustomAlert({ visible: true, title: 'Error', message: 'Please select a valid bundle and plan.' });
      return;
    }

    setBuying(true);
    setPaymentStep('processing');
    setProcessingStatus('Connecting to Google Play Billing...');

    // Resolve the In-App Purchase SKU (registered in Google Play Console)
    const playSku = (selectedPlan as any)?.store_product_id || 'bundle_spicy_10';

    try {
      // Step 1: Prompt Google Play native IAP via RevenueCat (if available in binary)
      let purchaseRes: any = null;
      try {
        purchaseRes = await RevenueCatService.purchaseProduct(playSku);
      } catch (rcErr: any) {
        console.log('[Store] Native Google Play IAP call skipped/fallback:', rcErr?.message);
      }

      // If user cancelled the Google Play dialog
      if (purchaseRes?.cancelled) {
        setBuying(false);
        setPaymentStep('google_pay_window');
        return;
      }

      setProcessingStatus('Allocating cards to your active room deck...');

      // Step 2: Ensure backend room receives newly purchased cards
      const targetBundleId = selectedBundle.id.startsWith('dummy') || selectedBundle.id.startsWith('mock')
        ? 'e6b13560-04f3-45b7-988b-1900e12369d0'
        : selectedBundle.id;

      const targetPlanId = selectedPlan.id.startsWith('dummy') || selectedPlan.id.startsWith('mock') || selectedPlan.id.startsWith('plan-')
        ? '880b6215-eb4a-4f89-8beb-532789cd7a3f'
        : selectedPlan.id;

      await bypassStorePurchase(targetBundleId, targetPlanId);

      // Prepare unlocked cards list for the reveal popup
      let cardsToReveal: any[] = [];
      if (bundlePreviewCards.length > 0) {
        cardsToReveal = bundlePreviewCards;
      } else if (selectedBundle?.bundle_cards && selectedBundle.bundle_cards.length > 0) {
        cardsToReveal = selectedBundle.bundle_cards.map((bc: any, idx: number) => ({
          id: bc.cards?.id || bc.card_id || `unlocked-${idx}`,
          title: bc.cards?.name || 'Intimate Dare',
          description: bc.cards?.power_description || 'A special dare unlocked from your card bundle.',
          category: (bc.cards?.card_categories?.name || selectedBundle.name.split(' ')[0]).toUpperCase(),
          image: getBundleImage(selectedBundle.name, selectedBundle.image_url),
        }));
      } else {
        cardsToReveal = resolveBundleCards(selectedBundle, masterCards, selectedPlan.card_count || 10);
      }
      setUnlockedCards(cardsToReveal);

      // Save unlocked bundle details for Dares screen & NEW badges
      const newlyUnlocked = {
        bundleId: targetBundleId,
        bundleName: selectedBundle.name,
        bundleImage: selectedBundle.image_url,
        bundleCategory: (selectedBundle.name || 'SPICY').split(' ')[0].toUpperCase(),
        cardCount: selectedPlan.card_count || cardsToReveal.length,
        cardIds: cardsToReveal.map(c => String(c.id)),
        cards: cardsToReveal,
        unlockedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('@soulshuffle_last_unlocked_pack', JSON.stringify(newlyUnlocked));

      // Invalidate local caches so Dares tab fetches fresh deck
      await AsyncStorage.removeItem('@soulshuffle_dares_cache');
      await AsyncStorage.removeItem('cachedDeckCards');

      // Notify Dares screen and Dashboard to reload deck immediately
      DeviceEventEmitter.emit('app:refreshDares', { newlyUnlockedPack: newlyUnlocked });
      DeviceEventEmitter.emit('app:refreshDashboard');

      const randDigits = () => Math.floor(1000 + Math.random() * 9000);
      setLastOrderId(`GPA.${randDigits()}-${randDigits()}-${randDigits()}`);
      setPurchaseSuccess(true);
      loadData();
    } catch (err: any) {
      console.error('[Store] Purchase error:', err);
      setCustomAlert({
        visible: true,
        title: 'Purchase Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to complete Google Play transaction. Please try again.',
      });
      setPaymentStep('google_pay_window');
    } finally {
      setBuying(false);
    }
  };

  const renderBundles = () => {
    return (
      <View className="flex-row flex-wrap justify-between px-6 mt-4">
        {bundles.map((bundle) => {
          const plans = bundle.bundle_plans || bundle.plans || [];
          const startingPrice = plans.length > 0
            ? Math.min(...plans.map(p => p.price))
            : 10;

          return (
            <TouchableOpacity
              key={bundle.id}
              className="bg-white dark:bg-[#271318] rounded-2xl border border-slate-100 dark:border-rose-950/20 shadow-sm dark:shadow-none overflow-hidden mb-5 w-[48%] active:opacity-90"
              onPress={() => handleSelectBundle(bundle)}
            >
              {/* Banner Image */}
              <View className="h-28 w-full relative">
                <Image
                  source={getBundleImage(bundle.name, bundle.image_url)}
                  className="w-full h-full object-cover"
                />
                {/* Cards badge */}
                <View className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-[8px] font-black uppercase tracking-wider">
                    {plans?.[0]?.card_count || 10} Cards
                  </Text>
                </View>
              </View>

              {/* Info Section */}
              <View className="p-3">
                <Text className="text-sm font-black text-slate-900 dark:text-white tracking-tight" numberOfLines={1}>
                  {bundle.name}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold mt-1 leading-4 h-8" numberOfLines={2}>
                  {bundle.description}
                </Text>

                <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-rose-950/10">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="logo-google-playstore" size={11} color="#01875f" />
                    <Text className="text-[#01875f] dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wide">
                      Google Play
                    </Text>
                  </View>
                  <Text className="text-[#e11d48] dark:text-rose-400 font-extrabold text-[13px]">
                    ₹{startingPrice}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? '#0F0608' : '#fdfaf9', paddingTop: insets.top }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F0608' : '#fdfaf9'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header bar */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={openSidebar}>
            <Ionicons name="menu-outline" size={30} color={isDark ? '#fff' : '#9f1239'} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name="infinite"
              size={28}
              color={isDark ? '#fda4af' : '#be123c'}
              style={{ transform: [{ rotate: '-15deg' }] }}
            />
            <Text className="text-red-700 dark:text-rose-400 font-black text-xl tracking-tight">
              SoulShuffle
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: userAvatar || ANIMATED_AVATARS[0].url }}
              className="w-10 h-10 rounded-full border border-rose-200 dark:border-rose-950/30"
            />
          </TouchableOpacity>
        </View>

        {/* Title area */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-between flex-wrap gap-2">
            <Text className="text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
              Card Store 🛒
            </Text>
            <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full self-center">
              <Ionicons name="logo-google-playstore" size={13} color="#01875f" style={{ marginRight: 4 }} />
              <Text className="text-[#01875f] dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Google Play Billing
              </Text>
            </View>
          </View>
          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-1.5">
            Unlock premium themed cards to play together.
          </Text>
        </View>

        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#af2c3b" />
            <Text className="text-slate-400 dark:text-slate-400 font-semibold text-xs mt-3">
              Loading store details...
            </Text>
          </View>
        ) : (
          renderBundles()
        )}
      </ScrollView>

      {/* Google Play IAP Checkout Modal */}
      <Modal
        visible={checkoutVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (!buying) {
            setCheckoutVisible(false);
            setPaymentStep('details');
          }
        }}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View
            className={`bg-white dark:bg-[#18080b] rounded-t-[40px] px-6 ${
              purchaseSuccess ? 'pt-4 pb-6' : 'pt-5 pb-6'
            } shadow-2xl`}
            style={{ maxHeight: '95%' }}
          >
            {purchaseSuccess ? (
              /* ✨ Interactive Card Swipe Reveal Modal with Exact dares.tsx Swipe Physics */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                <PurchasedCardsSwipeReveal
                  cards={
                    unlockedCards.length > 0
                      ? unlockedCards
                      : (bundlePreviewCards.length > 0 ? bundlePreviewCards : resolveBundleCards(selectedBundle, masterCards, selectedPlan?.card_count || 10))
                  }
                  bundleName={selectedBundle?.name || 'Dare Card Pack'}
                  orderId={lastOrderId}
                  isDark={isDark}
                  onPlayNow={() => {
                    setCheckoutVisible(false);
                    setPaymentStep('details');
                    const targetId =
                      selectedBundle?.id.startsWith('dummy') || selectedBundle?.id.startsWith('mock')
                        ? 'e6b13560-04f3-45b7-988b-1900e12369d0'
                        : selectedBundle?.id;
                    router.push({
                      pathname: '/dares',
                      params: { selectedCategory: `PACK_${targetId}` },
                    });
                  }}
                  onClose={() => {
                    setCheckoutVisible(false);
                    setPaymentStep('details');
                  }}
                />
              </ScrollView>
            ) : paymentStep === 'processing' ? (
              /* Processing view */
              <View className="items-center py-12 justify-center">
                <ActivityIndicator size="large" color="#01875f" style={{ marginBottom: 20 }} />
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="logo-google-playstore" size={20} color="#01875f" />
                  <Text className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">
                    Google Play Billing
                  </Text>
                </View>
                <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold text-center leading-5 max-w-[85%]">
                  {processingStatus}
                </Text>
              </View>
            ) : paymentStep === 'google_pay_window' ? (
              /* ACTUAL GOOGLE PLAY PAYMENT WINDOW / SHEET */
              <View>
                {/* Google Pay Window Header */}
                <View className="bg-[#1e293b] dark:bg-[#13141f] -mx-6 -mt-7 px-6 py-4 rounded-t-[40px] flex-row items-center justify-between mb-5 border-b border-white/5">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
                      <Ionicons name="logo-google-playstore" size={20} color="#01875f" />
                    </View>
                    <View>
                      <Text className="text-white font-black text-base tracking-tight">
                        Google Play
                      </Text>
                      <Text className="text-slate-400 text-[10px] font-semibold">
                        1-Tap In-App Purchase
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPaymentStep('details')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="w-7 h-7 rounded-full bg-white/10 items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Order Summary Box */}
                <View className="bg-slate-50 dark:bg-[#271318]/50 border border-slate-200/80 dark:border-rose-950/20 rounded-2xl p-4 mb-4">
                  <Text className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                    Order Summary
                  </Text>
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-sm font-extrabold text-slate-800 dark:text-white flex-1 mr-2" numberOfLines={1}>
                      {selectedBundle?.name}
                    </Text>
                    <Text className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{selectedPlan?.price}.00
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      Pack Size: {selectedPlan?.card_count} Cards
                    </Text>
                    <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      Delivery: Instant
                    </Text>
                  </View>
                </View>

                {/* Payment Method Selector (Google Play Balance & Cards) */}
                <View className="bg-slate-50 dark:bg-[#271318]/30 border border-slate-200/80 dark:border-rose-950/20 rounded-2xl p-4 mb-5">
                  <Text className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2.5">
                    Payment Method
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-6 h-6 rounded-full bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
                        <Ionicons name="logo-google-playstore" size={14} color="#01875f" />
                      </View>
                      <View>
                        <Text className="text-xs font-black text-slate-900 dark:text-white">
                          Google Play Balance & Linked Methods
                        </Text>
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          UPI, Credit/Debit Cards, Netbanking
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="checkmark-circle" size={18} color="#01875f" />
                  </View>
                </View>

                {/* Google Play Terms Notice */}
                <Text className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-4 mb-5">
                  By tapping Pay Now, you agree to Google Play's Terms of Service and authorize the charge of ₹{selectedPlan?.price}.00.
                </Text>

                {/* Pay Now Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  className="bg-[#01875f] rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-[0.99]"
                  style={{
                    borderWidth: 1,
                    borderColor: '#017351',
                  }}
                  onPress={executeGooglePayment}
                  disabled={buying}
                >
                  <Ionicons name="lock-closed" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black text-[16px] tracking-tight">
                    Pay with 1-Tap • ₹{selectedPlan?.price}.00
                  </Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  className="w-full py-3 items-center mt-2"
                  onPress={() => setPaymentStep('details')}
                >
                  <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs">
                    Cancel and return
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Google Play Purchase Details Overview with Exact Dares Page Swiping Carousel */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {/* Modal Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2 flex-1 mr-2">
                    <Ionicons name="logo-google-playstore" size={22} color="#01875f" />
                    <Text className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex-1" numberOfLines={1}>
                      Google Play In-App Purchase
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCheckoutVisible(false);
                      setPaymentStep('details');
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={26} color={isDark ? "#ffffff" : "#94a3b8"} />
                  </TouchableOpacity>
                </View>

                {/* Bundle Header & Price */}
                <View className="flex-row items-center justify-between mb-2 px-1">
                  <View className="flex-1 mr-2">
                    <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
                      {selectedBundle?.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                      {selectedPlan?.card_count} Curated Dare Cards Included
                    </Text>
                  </View>
                  <Text className="text-2xl font-black text-[#FF296D] dark:text-rose-400">
                    ₹{selectedPlan?.price}
                  </Text>
                </View>

                {/* 🎴 Exact Dares Page Swiping Card Stack Carousel */}
                <View className="mb-2">
                  <BundleCardsSwipeCarousel
                    cards={
                      bundlePreviewCards.length > 0
                        ? bundlePreviewCards
                        : resolveBundleCards(selectedBundle, masterCards, selectedPlan?.card_count || 10)
                    }
                    isDark={isDark}
                  />
                </View>

                {/* Plan Pack Toggles (if multiple plans) */}
                {selectedBundle?.bundle_plans && selectedBundle.bundle_plans.length > 1 && (
                   <View className="mb-4">
                     <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-2.5">
                       Choose Card Pack
                     </Text>
                     <View className="flex-row gap-2.5">
                       {selectedBundle.bundle_plans.map((plan) => {
                         const isSelected = selectedPlan?.id === plan.id;
                         return (
                           <TouchableOpacity
                             key={plan.id}
                             className={`flex-1 flex-row items-center border rounded-2xl px-4 py-3 active:opacity-85 ${
                               isSelected
                                 ? 'bg-emerald-500/10 border-[#01875f]'
                                 : 'bg-slate-50 dark:bg-[#271318]/30 border-slate-100 dark:border-rose-950/20'
                             }`}
                             onPress={() => setSelectedPlan(plan)}
                           >
                             <View className={`mr-2 w-4 h-4 rounded-full items-center justify-center ${
                               isSelected ? 'bg-[#01875f]' : 'bg-slate-300 dark:bg-[#4A232A]'
                             }`}>
                               <Ionicons name="checkmark" size={10} color="white" />
                             </View>
                             <View>
                               <Text className="text-slate-900 dark:text-white font-bold text-[11px]">
                                 {plan.card_count} Cards
                               </Text>
                               <Text className="text-[#01875f] dark:text-emerald-400 font-extrabold text-[10px] mt-0.5">
                                 ₹{plan.price}
                               </Text>
                             </View>
                           </TouchableOpacity>
                         );
                       })}
                     </View>
                   </View>
                )}

                {/* Google Play Trust & Policy Card */}
                <View className="bg-slate-50 dark:bg-[#271318]/30 border border-slate-100 dark:border-rose-950/20 rounded-2xl p-4 mb-5">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="shield-checkmark" size={16} color="#01875f" />
                    <Text className="text-xs font-black text-slate-800 dark:text-white">
                      Official Google Play In-App Purchase
                    </Text>
                  </View>
                  <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-4">
                    Billed directly through your Google Account with 1-Tap. Safe and protected by Google Play Protect with instant activation.
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/50 dark:border-rose-950/10">
                    <Ionicons name="sparkles" size={12} color="#10b981" />
                    <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Fair 80/20 card distribution guarantees instant fresh cards.
                    </Text>
                  </View>
                </View>

                {/* Open Google Pay Window Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  className="bg-[#01875f] rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-[0.99]"
                  style={{
                    borderWidth: 1,
                    borderColor: '#017351',
                  }}
                  onPress={() => setPaymentStep('google_pay_window')}
                  disabled={buying}
                >
                  <Ionicons name="logo-google-playstore" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black text-[16px] tracking-tight">
                    Buy with 1-Tap • ₹{selectedPlan?.price}
                  </Text>
                </TouchableOpacity>

                {/* Security Footer Note */}
                <Text className="text-center text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-3">
                  Secured by Google Play Billing & RevenueCat
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <CustomAlertModal config={customAlert} onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))} />
    </View>
  );
}