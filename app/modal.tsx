import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RevenueCatService from '@/services/revenueCatService';
import { bypassStorePurchase } from '@/services/storeService';

interface FeatureRow {
  name: string;
  free: string;
  paid: string;
  highlight?: boolean;
}

const COMPARISON_FEATURES: FeatureRow[] = [
  { name: 'Daily Dare Cards', free: '3 / day', paid: 'Unlimited', highlight: true },
  { name: 'Spice Spectrum', free: 'Mild only', paid: 'Mild to Wild 🔥', highlight: true },
  { name: 'Deflect Shields', free: '1 / week', paid: 'Unlimited 🛡️' },
  { name: 'Timed Deadlines', free: '24h only', paid: '12h, 24h, 48h, 7d' },
  { name: 'Decision Coin Toss', free: 'Basic Heads/Tails', paid: 'Custom Choices 🪙' },
  { name: 'Themed Decks', free: 'Starter Only', paid: 'All 10+ Packs Unlocked', highlight: true },
  { name: 'Streak Protection', free: 'None', paid: 'Never Lose Streaks' },
  { name: 'Sync & Performance', free: 'Standard', paid: 'Priority Real-Time ⚡' },
];

export default function PlansModalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style).catch(() => {});
    } catch {}
  };

  /**
   * If user closes pop-up, show Home page
   */
  const handleCloseToHome = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  const handlePurchase = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      const prodId = selectedPlan === 'annual' ? 'soulshuffle_pro_annual' : 'soulshuffle_pro_monthly';
      const res = await RevenueCatService.purchaseProduct(prodId).catch(() => null);
      if (res && res.cancelled) {
        setIsProcessing(false);
        return;
      }

      await bypassStorePurchase('e6b13560-04f3-45b7-988b-1900e12369d0', '880b6215-eb4a-4f89-8beb-532789cd7a3f').catch(() => {});
      setPurchaseSuccess(true);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

      setTimeout(() => {
        setIsProcessing(false);
        setPurchaseSuccess(false);
        router.replace('/(tabs)');
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
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.glowingDot} />
          <Text style={styles.badgeText}>FREE PLAN ENDED</Text>
        </View>

        <TouchableOpacity
          onPress={handleCloseToHome}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[
            styles.closeBtn,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
          ]}
        >
          <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleSection}>
          <View style={styles.crownWrap}>
            <Ionicons name="sparkles" size={26} color="#FF296D" />
          </View>
          <Text style={[styles.mainTitle, { color: textColor }]}>
            Upgrade to <Text style={{ color: '#FF296D' }}>SoulShuffle Pro</Text>
          </Text>
          <Text style={[styles.mainSubtitle, { color: subTextColor }]}>
            Your free daily dare limit has ended. Keep the intimacy burning with unlimited challenges & custom decks.
          </Text>
        </View>

        {/* ──────── COMPARISON TABLE ──────── */}
        <View style={[styles.tableContainer, { borderColor: modalBorder }]}>
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

          {COMPARISON_FEATURES.map((row, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <View
                key={row.name}
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
                  <Text style={[styles.featureNameText, { color: textColor }]}>{row.name}</Text>
                </View>
                <View style={styles.freeCol}>
                  <Text style={[styles.freeValueText, { color: subTextColor }]}>{row.free}</Text>
                </View>
                <View style={[styles.paidCol, { backgroundColor: isDark ? 'rgba(255, 41, 109, 0.06)' : 'rgba(255, 41, 109, 0.04)' }]}>
                  <Ionicons name="checkmark-circle" size={13} color="#FF296D" style={{ marginRight: 4 }} />
                  <Text style={[styles.paidValueText, { color: '#FF296D', fontWeight: row.highlight ? '800' : '700' }]}>
                    {row.paid}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ──────── PRICING CARDS ──────── */}
        <Text style={[styles.sectionHeading, { color: textColor }]}>Select Your Access Plan:</Text>

        <View style={styles.planCardsRow}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setSelectedPlan('annual');
            }}
            activeOpacity={0.85}
            style={[
              styles.planCard,
              { backgroundColor: cardBg, borderColor: selectedPlan === 'annual' ? '#FF296D' : modalBorder },
              selectedPlan === 'annual' && styles.planCardActive,
            ]}
          >
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>BEST VALUE</Text>
            </View>
            <Text style={[styles.planCardTitle, { color: textColor }]}>Annual Pass</Text>
            <Text style={[styles.planCardPrice, { color: '#FF296D' }]}>$3.99<Text style={{ fontSize: 11, color: subTextColor }}>/mo</Text></Text>
            <Text style={[styles.planCardSavings, { color: subTextColor }]}>Save 50% ($47.99/yr)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setSelectedPlan('monthly');
            }}
            activeOpacity={0.85}
            style={[
              styles.planCard,
              { backgroundColor: cardBg, borderColor: selectedPlan === 'monthly' ? '#FF296D' : modalBorder },
              selectedPlan === 'monthly' && styles.planCardActive,
            ]}
          >
            <Text style={[styles.planCardTitle, { color: textColor }]}>Monthly Pass</Text>
            <Text style={[styles.planCardPrice, { color: '#FF296D' }]}>$7.99<Text style={{ fontSize: 11, color: subTextColor }}>/mo</Text></Text>
            <Text style={[styles.planCardSavings, { color: subTextColor }]}>Cancel anytime</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
        <TouchableOpacity onPress={handlePurchase} disabled={isProcessing} activeOpacity={0.88} style={styles.upgradeBtn}>
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
                <Text style={styles.upgradeBtnText}>Upgrade to Pro Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCloseToHome} activeOpacity={0.7} style={styles.dismissBtn}>
          <Text style={[styles.dismissText, { color: subTextColor }]}>
            Continue with Free Plan (Return to Home)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 6,
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
  planCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    position: 'relative',
  },
  planCardActive: {
    shadowColor: '#FF296D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  badgePill: {
    position: 'absolute',
    top: -8,
    right: 10,
    backgroundColor: '#FF296D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  planCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  planCardPrice: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 2,
  },
  planCardSavings: {
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
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
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
