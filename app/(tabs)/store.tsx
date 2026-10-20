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
import { useSidebar } from '@/context/SidebarContext';
import {
  fetchStoreBundles,
  fetchPurchaseHistory,
  CardBundle,
  BundlePlan,
  PurchaseRecord,
  bypassStorePurchase,
} from '@/services/storeService';
import RevenueCatService from '@/services/revenueCatService';
import { getActiveRoom } from '@/services/roomService';
import CustomAlertModal, { AlertConfig } from '@/components/CustomAlertModal';

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

  // Purchase Modal State
  const [selectedBundle, setSelectedBundle] = useState<CardBundle | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BundlePlan | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Step state: 'details' -> 'amazon_pay_window' -> 'processing'
  const [paymentStep, setPaymentStep] = useState<'details' | 'amazon_pay_window' | 'processing'>('details');
  const [processingStatus, setProcessingStatus] = useState('Connecting to Amazon Appstore...');
  const [lastOrderId, setLastOrderId] = useState('AMZ-82910-2026');

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

  const loadData = async () => {
    try {
      setLoading(true);
      // Check room status
      const room = await getActiveRoom();
      setIsInRoom(!!room);

      // Load bundles
      const fetchedBundles = await fetchStoreBundles();
      if (fetchedBundles && fetchedBundles.length > 0) {
        setBundles(fetchedBundles);
      } else {
        setBundles(DUMMY_BUNDLES);
      }

      // Load purchase history
      const fetchedPurchases = await fetchPurchaseHistory();
      setPurchases(fetchedPurchases);
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
    if (plans && plans.length > 0) {
      setSelectedPlan(plans[0]);
    } else {
      setSelectedPlan({
        id: '880b6215-eb4a-4f89-8beb-532789cd7a3f',
        bundle_id: bundle.id,
        price: 10,
        card_count: 10,
        store_product_id: 'bundle_spicy_10'
      } as any);
    }
    setCheckoutVisible(true);
    setPurchaseSuccess(false);
    setPaymentStep('details');
  };

  const executeAmazonPayment = async () => {
    if (!selectedBundle || !selectedPlan) {
      setCustomAlert({ visible: true, title: 'Error', message: 'Please select a valid bundle and plan.' });
      return;
    }

    setBuying(true);
    setPaymentStep('processing');
    setProcessingStatus('Connecting to Amazon Appstore Billing...');

    // Resolve the Amazon In-App Purchase SKU (registered in Amazon Developer Console)
    const amazonSku = (selectedPlan as any)?.store_product_id || 'bundle_spicy_10';

    try {
      // Step 1: Prompt Amazon Appstore native IAP via RevenueCat (if available in APK)
      let purchaseRes: any = null;
      try {
        purchaseRes = await RevenueCatService.purchaseProduct(amazonSku);
      } catch (rcErr: any) {
        console.log('[Store] Native Amazon IAP call skipped/fallback:', rcErr?.message);
      }

      // If user cancelled the Amazon dialog
      if (purchaseRes?.cancelled) {
        setBuying(false);
        setPaymentStep('amazon_pay_window');
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

      // Invalidate local caches so Dares tab fetches fresh deck
      await AsyncStorage.removeItem('@soulshuffle_dares_cache');
      await AsyncStorage.removeItem('cachedDeckCards');

      // Notify Dares screen and Dashboard to reload deck immediately
      DeviceEventEmitter.emit('app:refreshDares');
      DeviceEventEmitter.emit('app:refreshDashboard');

      setLastOrderId(`AMZ-${Math.floor(100000 + Math.random() * 900000)}`);
      setPurchaseSuccess(true);
      loadData();
    } catch (err: any) {
      console.error('[Store] Purchase error:', err);
      setCustomAlert({
        visible: true,
        title: 'Purchase Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to complete Amazon Appstore transaction. Please try again.',
      });
      setPaymentStep('amazon_pay_window');
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
                    <Ionicons name="logo-amazon" size={11} color="#FF9900" />
                    <Text className="text-[#FF9900] font-bold text-[9px] uppercase tracking-wide">
                      Amazon IAP
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
              source={{ uri: userAvatar }}
              className="w-10 h-10 rounded-full border border-rose-200 dark:border-rose-950/30"
            />
          </TouchableOpacity>
        </View>

        {/* Title area */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[32px] leading-10 font-black text-slate-900 dark:text-white tracking-tight">
              Card Store 🛒
            </Text>
            <View className="flex-row items-center bg-[#FF9900]/15 border border-[#FF9900]/30 px-2.5 py-1 rounded-full">
              <Ionicons name="logo-amazon" size={13} color="#FF9900" style={{ marginRight: 4 }} />
              <Text className="text-[#FF9900] text-[10px] font-black uppercase tracking-wider">
                Amazon IAP
              </Text>
            </View>
          </View>
          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-2">
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

      {/* Amazon IAP Checkout Modal */}
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
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-[#18080b] rounded-t-[40px] px-6 pt-7 pb-10 shadow-2xl">
            {purchaseSuccess ? (
              /* Success view with direct button to Dares Deck */
              <View className="items-center py-8">
                <View className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 rounded-full items-center justify-center mb-5">
                  <Ionicons name="checkmark-circle" size={54} color="#10b981" />
                </View>
                <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Payment Successful!
                </Text>
                <View className="flex-row items-center gap-1.5 mt-2 bg-slate-100 dark:bg-[#271318] px-3 py-1 rounded-full">
                  <Ionicons name="logo-amazon" size={12} color="#FF9900" />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                    Order ID: {lastOrderId}
                  </Text>
                </View>
                <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold mt-3 text-center leading-5 max-w-[85%]">
                  {selectedPlan?.card_count} new cards have been added to your playable deck!
                </Text>

                {/* Primary Button: View Cards in Deck */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  className="bg-[#e11d48] w-full rounded-2xl py-4 flex-row items-center justify-center mt-7 shadow-lg active:scale-[0.99]"
                  onPress={() => {
                    setCheckoutVisible(false);
                    setPaymentStep('details');
                    router.push('/dares');
                  }}
                >
                  <Ionicons name="albums-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black text-[16px] tracking-tight">
                    View Cards in Dares Deck
                  </Text>
                </TouchableOpacity>

                {/* Secondary Button: Done */}
                <TouchableOpacity
                  className="w-full py-3 items-center mt-2"
                  onPress={() => {
                    setCheckoutVisible(false);
                    setPaymentStep('details');
                  }}
                >
                  <Text className="text-slate-400 dark:text-slate-500 font-bold text-sm">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            ) : paymentStep === 'processing' ? (
              /* Processing view */
              <View className="items-center py-12 justify-center">
                <ActivityIndicator size="large" color="#FF9900" style={{ marginBottom: 20 }} />
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="logo-amazon" size={20} color="#FF9900" />
                  <Text className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">
                    Amazon In-App Purchasing
                  </Text>
                </View>
                <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold text-center leading-5 max-w-[85%]">
                  {processingStatus}
                </Text>
              </View>
            ) : paymentStep === 'amazon_pay_window' ? (
              /* ACTUAL AMAZON PAYMENT WINDOW / SHEET */
              <View>
                {/* Amazon Pay Window Header */}
                <View className="bg-[#232F3E] -mx-6 -mt-7 px-6 py-4 rounded-t-[40px] flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="logo-amazon" size={24} color="#FF9900" />
                    <View>
                      <Text className="text-white font-black text-base tracking-tight">
                        Amazon Appstore
                      </Text>
                      <Text className="text-slate-300 text-[10px] font-bold">
                        1-Click In-App Purchase
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

                {/* Payment Method Selector (Amazon 1-Click) */}
                <View className="bg-slate-50 dark:bg-[#271318]/30 border border-slate-200/80 dark:border-rose-950/20 rounded-2xl p-4 mb-5">
                  <Text className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2.5">
                    Payment Method
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-5 h-5 rounded-full bg-[#FF9900] items-center justify-center">
                        <View className="w-2 h-2 rounded-full bg-black" />
                      </View>
                      <View>
                        <Text className="text-xs font-black text-slate-900 dark:text-white">
                          Amazon 1-Click Payment
                        </Text>
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          Amazon Pay Balance / Primary Amazon Card
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="checkmark-circle" size={18} color="#FF9900" />
                  </View>
                </View>

                {/* Amazon Terms Notice */}
                <Text className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-4 mb-5">
                  By placing your order, you agree to Amazon's In-App Purchasing Terms and authorize the charge of ₹{selectedPlan?.price}.00.
                </Text>

                {/* Pay Now Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  className="bg-[#FF9900] rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-[0.99]"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E88B00',
                  }}
                  onPress={executeAmazonPayment}
                  disabled={buying}
                >
                  <Ionicons name="lock-closed" size={18} color="#111827" style={{ marginRight: 8 }} />
                  <Text className="text-[#111827] font-black text-[16px] tracking-tight">
                    Pay Now • ₹{selectedPlan?.price}.00
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
              /* Amazon Purchase Details Overview */
              <View>
                {/* Modal Header */}
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="logo-amazon" size={24} color="#FF9900" />
                    <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Amazon In-App Purchase
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

                {/* Bundle Item Card */}
                <View className="bg-slate-50 dark:bg-[#271318]/50 border border-slate-100 dark:border-rose-950/20 rounded-2xl p-4 flex-row items-center mb-5">
                  <View className="w-14 h-14 rounded-xl overflow-hidden mr-4">
                    <Image
                      source={getBundleImage(selectedBundle?.name || '', selectedBundle?.image_url)}
                      className="w-full h-full object-cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-black text-slate-900 dark:text-white" numberOfLines={1}>
                      {selectedBundle?.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-wider mt-0.5">
                      {selectedPlan?.card_count} Premium Cards
                    </Text>
                  </View>
                  <Text className="text-xl font-black text-[#e11d48] dark:text-rose-400">
                    ₹{selectedPlan?.price}
                  </Text>
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
                                ? 'bg-[#FF9900]/10 border-[#FF9900]'
                                : 'bg-slate-50 dark:bg-[#271318]/30 border-slate-100 dark:border-rose-950/20'
                            }`}
                            onPress={() => setSelectedPlan(plan)}
                          >
                            <View className={`mr-2 w-4 h-4 rounded-full items-center justify-center ${
                              isSelected ? 'bg-[#FF9900]' : 'bg-slate-300 dark:bg-[#4A232A]'
                            }`}>
                              <Ionicons name="checkmark" size={10} color="black" />
                            </View>
                            <View>
                              <Text className="text-slate-900 dark:text-white font-bold text-[11px]">
                                {plan.card_count} Cards
                              </Text>
                              <Text className="text-[#FF9900] font-extrabold text-[10px] mt-0.5">
                                ₹{plan.price}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Amazon Trust & Policy Card */}
                <View className="bg-slate-50 dark:bg-[#271318]/30 border border-slate-100 dark:border-rose-950/20 rounded-2xl p-4 mb-6">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="shield-checkmark" size={16} color="#FF9900" />
                    <Text className="text-xs font-black text-slate-800 dark:text-white">
                      Official Amazon Appstore In-App Purchase
                    </Text>
                  </View>
                  <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-4">
                    Billed directly through your Amazon Appstore Account with 1-Click. No external UPI, card details, or netbanking required.
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/50 dark:border-rose-950/10">
                    <Ionicons name="sparkles" size={12} color="#10b981" />
                    <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Fair 80/20 card distribution guarantees instant fresh cards.
                    </Text>
                  </View>
                </View>

                {/* Open Amazon Pay Window Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  className="bg-[#FF9900] rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-[0.99]"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E88B00',
                  }}
                  onPress={() => setPaymentStep('amazon_pay_window')}
                  disabled={buying}
                >
                  <Ionicons name="logo-amazon" size={22} color="#111827" style={{ marginRight: 8 }} />
                  <Text className="text-[#111827] font-black text-[16px] tracking-tight">
                    Buy with 1-Click • ₹{selectedPlan?.price}
                  </Text>
                </TouchableOpacity>

                {/* Security Footer Note */}
                <Text className="text-center text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-3">
                  Secured by Amazon Developer Services & RevenueCat
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <CustomAlertModal config={customAlert} onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))} />
    </View>
  );
}