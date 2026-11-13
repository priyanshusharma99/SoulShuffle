import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Local High-Res Couple Photography Assets
const coupleBeach = require('@/assets/images/couple_beach_sunset.jpg');
const bundleSpicy = require('@/assets/images/bundle_spicy.jpg');
const coupleDinner = require('@/assets/images/couple_cooking_dinner.jpg');
const couplePicnic = require('@/assets/images/sunset_picnic.jpeg');

interface Slide {
  id: string;
  step: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: any;
  tag: string;
}

const SLIDES: Slide[] = [
  {
    id: 'pair',
    step: '01',
    title: 'Pair in',
    highlight: 'Seconds',
    subtitle: 'Share your 6-digit code. Once joined, your private couple room syncs in real time.',
    image: coupleBeach,
    tag: 'PRIVATE ROOM',
  },
  {
    id: 'dares',
    step: '02',
    title: 'Send Daily',
    highlight: 'Dares',
    subtitle: 'Choose from mild to extra spicy cards, set a countdown deadline, and send.',
    image: bundleSpicy,
    tag: 'SPICE LEVELS',
  },
  {
    id: 'deflect',
    step: '03',
    title: 'Complete or',
    highlight: 'Deflect',
    subtitle: 'Complete dares to earn coins together, or play a Deflect card to pass without pressure.',
    image: coupleDinner,
    tag: 'NO PRESSURE',
  },
  {
    id: 'coin',
    step: '04',
    title: 'Flip to',
    highlight: 'Decide',
    subtitle: "Can't agree on what to eat or watch? Flip the coin to make quick decisions together.",
    image: couplePicnic,
    tag: 'COUPLE GAMES',
  },
];

export default function WelcomeGuide() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromMenu = from === 'menu' || from === 'settings' || from === 'home' || from === 'sidebar' || from === 'dares';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Interactive micro-states
  const [copiedCode, setCopiedCode] = useState(false);
  const [coinSide, setCoinSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [selectedSpice, setSelectedSpice] = useState<'Mild' | 'Spicy'>('Spicy');

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style).catch(() => {});
    } catch {}
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentIndex && page >= 0 && page < SLIDES.length) {
      setCurrentIndex(page);
    }
  }, [currentIndex]);

  const scrollToSlide = (index: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollToSlide(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.setItem('hasSeenWelcomeGuide', 'true');
    } catch {}

    if (isFromMenu && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCopyCode = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync('SOUL24');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFlipCoin = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setCoinSide((prev) => (prev === 'HEADS' ? 'TAILS' : 'HEADS'));
  };

  const bg = isDark ? '#0A0407' : '#FFFFFF';
  const primaryText = isDark ? '#FFFFFF' : '#111827';
  const secondaryText = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? 'rgba(25, 12, 18, 0.85)' : '#F9F5F7';
  const cardBorder = isDark ? 'rgba(255, 41, 109, 0.2)' : 'rgba(0, 0, 0, 0.06)';

  const photoHeight = Math.min(SCREEN_HEIGHT * 0.40, 320);

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Ionicons name="infinite" size={20} color="#FF296D" style={{ transform: [{ rotate: '-15deg' }] }} />
          <Text style={[styles.brandText, { color: primaryText }]}>
            Soul<Text style={{ color: '#FF296D' }}>Shuffle</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={handleComplete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>
            {currentIndex === SLIDES.length - 1 ? 'Done' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Paged Content Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* ──────── SLIDE 1: PAIR IN SECONDS ──────── */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            {/* Hero Photo with Floating UI */}
            <View style={[styles.photoCard, { height: photoHeight }]}>
              <Image source={coupleBeach} style={styles.photo} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10, 4, 7, 0.85)']}
                style={styles.photoGradient}
              />

              {/* Floating Room Code Interactive Pill */}
              <View style={[styles.floatingGlassCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View>
                  <Text style={styles.glassLabel}>ROOM CODE</Text>
                  <Text style={styles.glassCode}>SOUL24</Text>
                </View>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyPill}>
                  <Ionicons name={copiedCode ? 'checkmark' : 'copy-outline'} size={14} color="#FFF" />
                  <Text style={styles.copyPillText}>{copiedCode ? 'Copied' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Concise Typography */}
            <View style={styles.textSection}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>01 • {SLIDES[0].tag}</Text>
              </View>
              <Text style={[styles.title, { color: primaryText }]}>
                {SLIDES[0].title} <Text style={{ color: '#FF296D' }}>{SLIDES[0].highlight}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: secondaryText }]}>
                {SLIDES[0].subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* ──────── SLIDE 2: DAILY DARES ──────── */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            {/* Hero Photo with Floating UI */}
            <View style={[styles.photoCard, { height: photoHeight }]}>
              <Image source={bundleSpicy} style={styles.photo} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10, 4, 7, 0.85)']}
                style={styles.photoGradient}
              />

              {/* Floating Dare Preview Card */}
              <View style={[styles.floatingGlassCard, { backgroundColor: cardBg, borderColor: cardBorder, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  {/* Interactive toggle */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic();
                        setSelectedSpice('Mild');
                      }}
                      style={[styles.spiceToggle, selectedSpice === 'Mild' && styles.spiceToggleActive]}
                    >
                      <Text style={[styles.spiceToggleText, selectedSpice === 'Mild' && { color: '#FFF' }]}>Mild</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic();
                        setSelectedSpice('Spicy');
                      }}
                      style={[styles.spiceToggle, selectedSpice === 'Spicy' && styles.spiceToggleActive]}
                    >
                      <Text style={[styles.spiceToggleText, selectedSpice === 'Spicy' && { color: '#FFF' }]}>Spicy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.glassTimer}>24h limit</Text>
                </View>

                <Text style={styles.darePreviewTitle}>
                  {selectedSpice === 'Mild' ? 'Relaxing Neck Massage' : 'Slow Dance & Whisper'}
                </Text>
              </View>
            </View>

            {/* Concise Typography */}
            <View style={styles.textSection}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>02 • {SLIDES[1].tag}</Text>
              </View>
              <Text style={[styles.title, { color: primaryText }]}>
                {SLIDES[1].title} <Text style={{ color: '#FF296D' }}>{SLIDES[1].highlight}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: secondaryText }]}>
                {SLIDES[1].subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* ──────── SLIDE 3: COMPLETE OR DEFLECT ──────── */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            {/* Hero Photo with Floating UI */}
            <View style={[styles.photoCard, { height: photoHeight }]}>
              <Image source={coupleDinner} style={styles.photo} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10, 4, 7, 0.85)']}
                style={styles.photoGradient}
              />

              {/* Dual Action Floating Pills */}
              <View style={[styles.floatingDualRow]}>
                <View style={[styles.dualPill, { backgroundColor: cardBg, borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.dualPillText}>Complete (+Coins)</Text>
                </View>

                <View style={[styles.dualPill, { backgroundColor: cardBg, borderColor: 'rgba(168, 85, 247, 0.4)' }]}>
                  <Ionicons name="shield" size={16} color="#A855F7" />
                  <Text style={styles.dualPillText}>Deflect (Pass)</Text>
                </View>
              </View>
            </View>

            {/* Concise Typography */}
            <View style={styles.textSection}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>03 • {SLIDES[2].tag}</Text>
              </View>
              <Text style={[styles.title, { color: primaryText }]}>
                {SLIDES[2].title} <Text style={{ color: '#FF296D' }}>{SLIDES[2].highlight}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: secondaryText }]}>
                {SLIDES[2].subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* ──────── SLIDE 4: COIN TOSS ──────── */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            {/* Hero Photo with Floating UI */}
            <View style={[styles.photoCard, { height: photoHeight }]}>
              <Image source={couplePicnic} style={styles.photo} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10, 4, 7, 0.85)']}
                style={styles.photoGradient}
              />

              {/* Floating Interactive 3D Coin Badge */}
              <TouchableOpacity
                onPress={handleFlipCoin}
                activeOpacity={0.85}
                style={[styles.floatingCoinCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <View style={styles.metallicCoin}>
                  <Text style={styles.coinLetter}>{coinSide === 'HEADS' ? 'H' : 'T'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.coinTitle}>{coinSide}</Text>
                  <Text style={styles.coinDesc}>
                    {coinSide === 'HEADS' ? 'You choose dinner tonight' : 'Partner chooses dinner tonight'}
                  </Text>
                </View>
                <Ionicons name="swap-vertical" size={16} color="#FF296D" />
              </TouchableOpacity>
            </View>

            {/* Concise Typography */}
            <View style={styles.textSection}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>04 • {SLIDES[3].tag}</Text>
              </View>
              <Text style={[styles.title, { color: primaryText }]}>
                {SLIDES[3].title} <Text style={{ color: '#FF296D' }}>{SLIDES[3].highlight}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: secondaryText }]}>
                {SLIDES[3].subtitle}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]}>
        {/* Progress Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => scrollToSlide(i)}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.activeDot, { backgroundColor: '#FF296D' }]
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.88} style={styles.mainBtn}>
          <LinearGradient
            colors={['#FF296D', '#E11D48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainBtnGradient}
          >
            <Text style={styles.mainBtnText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={16}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF296D',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  photoCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 41, 109, 0.25)',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  floatingGlassCard: {
    margin: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FF296D',
    marginBottom: 2,
  },
  glassCode: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF296D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyPillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  spiceToggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  spiceToggleActive: {
    backgroundColor: '#FF296D',
  },
  spiceToggleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '800',
  },
  glassTimer: {
    color: '#FF296D',
    fontSize: 11,
    fontWeight: '700',
  },
  darePreviewTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  floatingDualRow: {
    margin: 14,
    flexDirection: 'row',
    gap: 10,
  },
  dualPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  dualPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  floatingCoinCard: {
    margin: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metallicCoin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF296D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  coinLetter: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  coinTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  coinDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  textSection: {
    paddingHorizontal: 4,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 41, 109, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  tagPillText: {
    color: '#FF296D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
  },
  mainBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF296D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
