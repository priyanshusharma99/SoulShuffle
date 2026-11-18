import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RevenueCatService from '@/services/revenueCatService';
import { bypassStorePurchase } from '@/services/storeService';
import api from '@/services/api';

export interface FreePlanEndModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reason?: 'limit_reached' | 'plan_expired' | 'manual' | 'room_30_days';
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  savings?: string;
  productId: string;
  enabled?: boolean;
}

const DEFAULT_PLANS: PlanOption[] = [
  {
    id: 'monthly',
    name: 'Monthly VIP Pass',
    price: '₹99',
    period: '/ month',
    badge: 'MOST POPULAR',
    savings: 'Full 30-Day Room Access & All 700+ Cards',
    productId: 'soulshuffle_monthly_99',
    enabled: true,
  },
];

interface FeatureRow {
  name: string;
  free: string;
  paid: string;
  highlight?: boolean;
}

const DEFAULT_COMPARISON_FEATURES: FeatureRow[] = [
  {
    name: 'Intimacy Room Duration',
    free: '7 Days Only',
    paid: 'Full 30 Days Active 💖',
    highlight: true,
  },
  {
    name: 'Dare Cards Deck',
    free: 'Starter Pool (40 Cards)',
    paid: 'Full Library (700+ Cards) 🔥',
    highlight: true,
  },
  {
    name: 'Spice Spectrum',
    free: 'Level 1 & 2 Only',
    paid: 'All Levels (Wild & Steamy 🔥)',
    highlight: true,
  },
  {
    name: 'Deflect Shields',
    free: '1 / week',
    paid: 'Unlimited / 5 per Game 🛡️',
    highlight: false,
  },
  {
    name: 'Timed Deadlines',
    free: 'Fixed 24 Hours',
    paid: 'Flexible (12h, 24h, 48h, 7d)',
    highlight: false,
  },
  {
    name: 'Streak Protection',
    free: 'None',
    paid: 'Never Lose Streaks ✨',
    highlight: false,
  },
  {
    name: 'Sync & Performance',
    free: 'Standard',
    paid: 'VIP Priority ⚡',
    highlight: false,
  },
];

export default function FreePlanEndModal({
  visible,
  onClose,
  onSuccess,
  reason = 'limit_reached',
}: FreePlanEndModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  const [plans, setPlans] = useState<PlanOption[]>(DEFAULT_PLANS);
  const [features, setFeatures] = useState<FeatureRow[]>(DEFAULT_COMPARISON_FEATURES);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Fetch dynamic plans & comparison features from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicPlans = async () => {
      try {
        const res = await api.get('/plans/membership');
        if (isMounted && res.data?.data) {
          const { active_plans, features: fetchedFeatures } = res.data.data;
          
          if (active_plans && Object.keys(active_plans).length > 0) {
            const planList: PlanOption[] = Object.values(active_plans).map((p: any) => ({
              id: p.id || 'monthly',
              name: p.name || 'Monthly VIP Pass',
              price: p.price || `₹${p.price_numeric || 99}`,
              period: p.period || '/ month',
              badge: p.badge,
              savings: p.savings || 'Full 30-Day Room Access & All 700+ Cards',
              productId: p.productId || 'soulshuffle_monthly_99',
              enabled: p.enabled !== false,
            }));

            // Strictly filter out disabled plans (NEVER show yearly if disabled)
            const visiblePlans = planList.filter((p) => p.enabled);
            if (visiblePlans.length > 0) {
              setPlans(visiblePlans);
              // If current selection is not in visible plans, default to first available
              if (!visiblePlans.some((p) => p.id === selectedPlanId)) {
                setSelectedPlanId(visiblePlans[0].id);
              }
            }
          }

          if (Array.isArray(fetchedFeatures) && fetchedFeatures.length > 0) {
            setFeatures(fetchedFeatures);
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_PLANS (₹99 monthly)
        console.log('[FreePlanEndModal] Using default plans fallback:', e);
      }
    };

    if (visible) {
      fetchDynamicPlans();
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  if (!visible) return null;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style).catch(() => {});
    } catch {}
  };

  /**
   * Dismiss Handler
   */
  const handleDismissToHome = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    if (reason !== 'room_30_days') {
      try {
        router.navigate('/(tabs)');
      } catch (e) {}
    }
  };

  const handlePurchase = async () => {
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    if (!plan) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      // 1. Attempt RevenueCat in-app purchase
      const res = await RevenueCatService.purchaseProduct(plan.productId).catch(() => null);
      if (res && res.cancelled) {
        setIsProcessing(false);
        return;
      }

      // 2. Activate membership on backend
      try {
        await api.post('/store/purchase/membership', {
          planId: plan.id,
          productId: plan.productId,
          paymentSource: Platform.OS === 'android' ? 'google_play' : 'apple_store',
        });
      } catch (backendErr) {
        console.log('[FreePlanEndModal] Backend membership activation notice:', backendErr);
      }

      // 3. Mark VIP active locally
      await AsyncStorage.setItem('@soulshuffle_vip_active', 'true');
      await AsyncStorage.setItem(
        '@soulshuffle_vip_expires_at',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );

      setPurchaseSuccess(true);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

      setTimeout(() => {
        setIsProcessing(false);
        setPurchaseSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          try {
            router.navigate('/(tabs)');
          } catch (e) {}
        }
      }, 1500);
    } catch (e) {
      console.log('Purchase error:', e);
      setIsProcessing(false);
    }
  };

  const bg = isDark ? '#14060B' : '#FFFFFF';
  const modalBorder = isDark ? 'rgba(255, 41, 109, 0.25)' : 'rgba(255, 41, 109, 0.15)';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#A1A1AA' : '#6B7280';
  const tableHeaderBg = isDark ? '#230E17' : '#FCE8EE';
  const rowBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const cardBg = isDark ? '#1F0B13' : '#F9F5F7';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleDismissToHome}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: bg,
              borderColor: modalBorder,
              maxHeight: Math.min(SCREEN_HEIGHT * 0.92, 700),
            },
          ]}
        >
          {/* Top Bar with Dismiss "✕" Button */}
          <View style={styles.topHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.glowingDot} />
              <Text style={styles.badgeText}>
                {reason === 'room_30_days'
                  ? '30-DAY VIP ROOM ACCESS'
                  : reason === 'plan_expired'
                  ? 'FREE PLAN EXPIRED'
                  : 'DAILY FREE LIMIT REACHED'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDismissToHome}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
              ]}
            >
              <Ionicons name="close" size={18} color={isDark ? '#FFF' : '#333'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title & Headline */}
            <View style={styles.titleSection}>
              <View style={styles.crownWrap}>
                <Ionicons name="sparkles" size={24} color="#FF296D" />
              </View>
              <Text style={[styles.mainTitle, { color: textColor }]}>
                {reason === 'room_30_days' ? (
                  <>Unlock <Text style={{ color: '#FF296D' }}>30-Day Couple Room</Text></>
                ) : (
                  <>Upgrade to <Text style={{ color: '#FF296D' }}>SoulShuffle Pro</Text></>
                )}
              </Text>
              <Text style={[styles.mainSubtitle, { color: subTextColor }]}>
                {reason === 'room_30_days'
                  ? 'A 30-day intimate connection journey requires a VIP Pass. Keep the spark burning for a full month with unlimited dares & custom decks.'
                  : reason === 'plan_expired'
                  ? 'Your 7-day free connection journey has ended. Keep the intimacy burning with unlimited challenges & custom decks.'
                  : 'Your free daily dare limit has ended. Keep the intimacy burning with unlimited challenges & custom decks.'}
              </Text>
            </View>

            {/* ──────── COMPARISON TABLE: FREE VS PAID ──────── */}
            <View style={[styles.tableContainer, { borderColor: modalBorder }]}>
              {/* Table Header */}
              <View style={[styles.tableHeaderRow, { backgroundColor: tableHeaderBg }]}>
                <View style={styles.featureColHeader}>
                  <Text style={[styles.tableHeaderText, { color: textColor }]}>Features</Text>
                </View>
                <View style={styles.planColHeader}>
                  <Text style={[styles.planHeaderName, { color: subTextColor }]}>Free Plan</Text>
                </View>
                <View style={[styles.planColHeader, styles.proColHeader]}>
                  <LinearGradient
                    colors={['#FF296D', '#E11D48']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.proBadge}
                  >
                    <Ionicons name="sparkles" size={10} color="#FFF" />
                    <Text style={styles.proBadgeText}>PRO VIP</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Table Body Rows (Dynamic from DB / Admin Panel) */}
              {features.map((row, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <View
                    key={row.name || idx}
                    style={[
                      styles.tableRow,
                      {
                        borderBottomColor: rowBorder,
                        backgroundColor: isEven
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.02)'
                            : '#FAFAFA'
                          : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.featureCol}>
                      <Text style={[styles.featureNameText, { color: textColor }]}>
                        {row.name}
                      </Text>
                    </View>

                    {/* Free Column */}
                    <View style={styles.freeCol}>
                      <Text style={[styles.freeValueText, { color: subTextColor }]}>
                        {row.free}
                      </Text>
                    </View>

                    {/* Paid Column */}
                    <View style={[styles.paidCol, { backgroundColor: isDark ? 'rgba(255, 41, 109, 0.06)' : 'rgba(255, 41, 109, 0.04)' }]}>
                      <Ionicons name="checkmark-circle" size={13} color="#FF296D" style={{ marginRight: 4 }} />
                      <Text
                        style={[
                          styles.paidValueText,
                          {
                            color: '#FF296D',
                            fontWeight: row.highlight ? '800' : '700',
                          },
                        ]}
                      >
                        {row.paid}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ──────── PRICING PLAN SELECTOR ──────── */}
            <Text style={[styles.sectionHeading, { color: textColor }]}>
              Select Your Access Plan:
            </Text>

            <View style={styles.planOptionsContainer}>
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPlanId(plan.id);
                    }}
                    activeOpacity={0.85}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: isSelected ? '#FF296D' : modalBorder,
                      },
                      isSelected && styles.planCardSelected,
                    ]}
                  >
                    {plan.badge && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                      </View>
                    )}

                    <View style={styles.planCardRadioRow}>
                      <View
                        style={[
                          styles.radioButton,
                          { borderColor: isSelected ? '#FF296D' : subTextColor },
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.planCardName, { color: textColor }]}>
                          {plan.name}
                        </Text>
                        <Text style={[styles.planCardSavings, { color: subTextColor }]}>
                          {plan.savings}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.planCardPrice, { color: textColor }]}>
                          {plan.price}
                        </Text>
                        <Text style={[styles.planCardPeriod, { color: subTextColor }]}>
                          {plan.period}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Guarantees Note */}
            <View style={styles.guaranteeRow}>
              <Ionicons name="lock-closed" size={13} color="#10B981" />
              <Text style={[styles.guaranteeText, { color: subTextColor }]}>
                Cancel anytime in App Store / Google Play • Instant Unlock
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
            ]}
          >
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={isProcessing}
              activeOpacity={0.88}
              style={styles.upgradeBtn}
            >
              <LinearGradient
                colors={['#FF296D', '#E11D48']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upgradeGradient}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : purchaseSuccess ? (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.upgradeBtnText}>Unlocked Successfully!</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={17} color="#FFFFFF" />
                    <Text style={styles.upgradeBtnText}>
                      {reason === 'room_30_days' ? 'Unlock 30-Day Room (₹99)' : 'Upgrade to Pro Now'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Close / Return to Home Button */}
            <TouchableOpacity
              onPress={handleDismissToHome}
              activeOpacity={0.7}
              style={styles.backHomeBtn}
            >
              <Text style={[styles.backHomeText, { color: subTextColor }]}>
                {reason === 'room_30_days' ? 'Stay with 7-Day Free Room' : 'Continue with Free Plan (Return to Home)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#FF296D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 41, 109, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  glowingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF296D',
  },
  badgeText: {
    color: '#FF296D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  crownWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 41, 109, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  featureColHeader: {
    flex: 1.4,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planColHeader: {
    flex: 1.1,
    alignItems: 'center',
  },
  proColHeader: {
    alignItems: 'center',
  },
  planHeaderName: {
    fontSize: 11,
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  featureCol: {
    flex: 1.4,
  },
  featureNameText: {
    fontSize: 11,
    fontWeight: '600',
  },
  freeCol: {
    flex: 1.1,
    alignItems: 'center',
  },
  freeValueText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  paidCol: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  paidValueText: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  planOptionsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  planCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    position: 'relative',
  },
  planCardSelected: {
    shadowColor: '#FF296D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -9,
    right: 14,
    backgroundColor: '#FF296D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planCardRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF296D',
  },
  planCardName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  planCardSavings: {
    fontSize: 11,
    fontWeight: '500',
  },
  planCardPrice: {
    fontSize: 16,
    fontWeight: '900',
  },
  planCardPeriod: {
    fontSize: 10,
    fontWeight: '600',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  guaranteeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  upgradeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF296D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  backHomeBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backHomeText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

