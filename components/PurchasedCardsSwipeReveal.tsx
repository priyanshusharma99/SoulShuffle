import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  PanResponder,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface RevealedCard {
  id: string | number;
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  time?: string;
  stars?: number;
  image?: any;
  isNew?: boolean;
}

interface PurchasedCardsSwipeRevealProps {
  cards: RevealedCard[];
  bundleName: string;
  orderId?: string;
  isDark?: boolean;
  onPlayNow: () => void;
  onClose: () => void;
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, 420);
const ITEM_WIDTH = Math.min(SCREEN_WIDTH * 0.74, 290);
const ITEM_HEIGHT = ITEM_WIDTH * 1.38;

const getCatColor = (cat: string) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('romance')) return '#FF296D';
  if (c.includes('fun')) return '#9D4EDD';
  if (c.includes('spicy')) return '#D90429';
  return '#3A86FF';
};

export default function PurchasedCardsSwipeReveal({
  cards,
  bundleName,
  orderId,
  isDark = true,
  onPlayNow,
  onClose,
}: PurchasedCardsSwipeRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-card position cache to eliminate 1-frame flash on card swap
  const positionCache = useRef<{ [key: string]: Animated.ValueXY }>({});
  const getPosition = (id: string | number) => {
    const key = String(id);
    if (!positionCache.current[key]) {
      positionCache.current[key] = new Animated.ValueXY();
    }
    return positionCache.current[key];
  };

  const isAnimating = useRef(false);
  const latestIndex = useRef(currentIndex);
  const latestCards = useRef(cards);

  useEffect(() => {
    latestIndex.current = currentIndex;
    latestCards.current = cards;
  }, [currentIndex, cards]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const c = latestCards.current;
        if (isAnimating.current || !c || c.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const c = latestCards.current;
        if (isAnimating.current || !c || c.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        const c = latestCards.current;
        const idx = latestIndex.current;
        if (!isAnimating.current && c && c[idx]) {
          const currentPosition = getPosition(c[idx].id);
          currentPosition.setOffset({
            x: (currentPosition.x as any)._value || 0,
            y: (currentPosition.y as any)._value || 0,
          });
          currentPosition.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const c = latestCards.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !c || c.length === 0) return;
        const currentPosition = getPosition(c[idx].id);
        currentPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const c = latestCards.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !c || c.length === 0) return;

        const currentPosition = getPosition(c[idx].id);
        currentPosition.flattenOffset();

        const isSwipeRight = gestureState.dx > 90 || (gestureState.dx > 20 && gestureState.vx > 0.5);
        const isSwipeLeft = gestureState.dx < -90 || (gestureState.dx < -20 && gestureState.vx < -0.5);

        if (isSwipeRight) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
            toValue: { x: SCREEN_WIDTH * 2, y: gestureState.dy + gestureState.vy * 50 },
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start(() => {
            setCurrentIndex((prev) => (prev < c.length - 1 ? prev + 1 : 0));
            setTimeout(() => {
              currentPosition.setValue({ x: 0, y: 0 });
              isAnimating.current = false;
            }, 50);
          });
        } else if (isSwipeLeft) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
            toValue: { x: -SCREEN_WIDTH * 2, y: gestureState.dy + gestureState.vy * 50 },
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start(() => {
            setCurrentIndex((prev) => (prev < c.length - 1 ? prev + 1 : 0));
            setTimeout(() => {
              currentPosition.setValue({ x: 0, y: 0 });
              isAnimating.current = false;
            }, 50);
          });
        } else {
          Animated.spring(currentPosition, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!cards || cards.length === 0) return null;

  const renderCardUI = (card: RevealedCard) => {
    const categoryColor = getCatColor(card.category);
    const cardImg = card.image || require('@/assets/images/bundle_spicy.jpg');

    return (
      <View
        className="w-full h-full rounded-[26px] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: isDark ? '#1C1721' : '#FFFFFF',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          shadowColor: categoryColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.7 : 0.25,
          shadowRadius: 18,
          elevation: 6,
        }}
      >
        {/* Background Image */}
        <Image
          source={typeof cardImg === 'string' ? { uri: cardImg } : cardImg}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />

        {/* Dark Vignette Overlay for Crisp Readability */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '75%',
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        />

        {/* Top Badges */}
        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
          <View className="px-3 py-1 rounded-full shadow-md" style={{ backgroundColor: categoryColor }}>
            <Text className="text-white text-[10px] font-black tracking-widest uppercase">
              {card.category || 'DARE'}
            </Text>
          </View>

          {/* Shiny NEW UNLOCKED Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#10b981',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.4)',
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Ionicons name="sparkles" size={11} color="#FFF" style={{ marginRight: 3 }} />
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>
              UNLOCKED
            </Text>
          </View>
        </View>

        {/* Bottom Card Content */}
        <View className="absolute bottom-5 left-4 right-4">
          <Text className="text-white text-[22px] font-black mb-1.5 tracking-tight leading-7">
            {card.title}
          </Text>
          <Text className="text-white/90 text-[13px] leading-5 mb-3" numberOfLines={3}>
            {card.description}
          </Text>

          <View className="flex-row items-center justify-between pt-2 border-t border-white/15">
            <View className="flex-row items-center">
              <Ionicons name="people" size={14} color="white" />
              <Text className="text-white/90 font-bold text-[11px] ml-1.5">2+ People</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="flame" size={14} color="#f43f5e" />
              <Text className="text-rose-300 font-extrabold text-[11px] ml-1">Premium Dare</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCardsStack = () => {
    const cardsToRender = [];
    const count = Math.min(cards.length, 3);
    for (let offset = 0; offset < count; offset++) {
      const idx = (currentIndex + offset) % cards.length;
      cardsToRender.push({ item: cards[idx], offset, originalIndex: idx });
    }

    const frontCard = cards[currentIndex];
    if (!frontCard) return null;
    const frontPosition = getPosition(frontCard.id);

    return cardsToRender
      .map(({ item, offset, originalIndex }) => {
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
            extrapolate: 'clamp',
          });
          animatedStyle = {
            transform: [
              { translateX: itemPosition.x },
              { translateY: itemPosition.y },
              { scale: 1 },
              { rotate },
            ],
            zIndex: 3,
            elevation: 3,
          };
          panHandlers = panResponder.panHandlers;
        } else if (isSecond) {
          const scale = frontPosition.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: [1, 0.94, 1],
            extrapolate: 'clamp',
          });
          const rotate = frontPosition.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: ['0deg', '-6deg', '0deg'],
            extrapolate: 'clamp',
          });
          const translateX = frontPosition.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: [0, -22, 0],
            extrapolate: 'clamp',
          });
          const translateY = frontPosition.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: [0, -8, 0],
            extrapolate: 'clamp',
          });
          animatedStyle = {
            transform: [{ translateX }, { translateY }, { scale }, { rotate }],
            zIndex: 2,
            elevation: 2,
          };
        } else if (isThird) {
          animatedStyle = {
            transform: [{ translateX: 22 }, { translateY: -4 }, { scale: 0.88 }, { rotate: '6deg' }],
            zIndex: 1,
            elevation: 1,
          };
        }

        return (
          <Animated.View
            key={item.id || originalIndex}
            style={[
              {
                position: 'absolute',
                width: ITEM_WIDTH,
                height: ITEM_HEIGHT,
              },
              animatedStyle,
            ]}
            {...panHandlers}
          >
            {renderCardUI(item)}
          </Animated.View>
        );
      })
      .reverse();
  };

  const totalDots = Math.min(cards.length, 5);

  return (
    <View className="items-center w-full py-2">
      {/* Top Header Badge */}
      <View className="flex-row items-center gap-2 mb-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
        <Text className="text-emerald-500 dark:text-emerald-400 font-extrabold text-xs tracking-wider uppercase">
          Pack Unlocked Successfully!
        </Text>
      </View>

      {/* Bundle Title */}
      <Text
        className="text-[20px] font-black text-slate-900 dark:text-white text-center tracking-tight mb-1"
        numberOfLines={1}
      >
        {bundleName}
      </Text>

      {/* Card Count & Counter */}
      <View className="flex-row items-center gap-2 mb-4">
        <View className="bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
          <Text className="text-rose-500 font-black text-[11px]">
            Card {currentIndex + 1} of {cards.length}
          </Text>
        </View>
        {orderId ? (
          <Text className="text-slate-400 text-[10px] font-mono">
            {orderId}
          </Text>
        ) : null}
      </View>

      {/* 🎴 Exact Swipeable Card Stack Deck */}
      <View
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
          marginBottom: 16,
        }}
      >
        {renderCardsStack()}
      </View>

      {/* Swipe Helper Guide */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Ionicons name="swap-horizontal" size={14} color="#e11d48" />
        <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
          Swipe left or right to preview all {cards.length} cards
        </Text>
      </View>

      {/* Dots Indicator */}
      {totalDots > 1 && (
        <View className="flex-row justify-center items-center gap-1.5 mb-5">
          {Array.from({ length: totalDots }).map((_, i) => {
            const activeIndex = currentIndex % totalDots;
            const isActive = activeIndex === i;
            return (
              <View
                key={i}
                style={{
                  width: isActive ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? '#e11d48' : isDark ? '#3f3f46' : '#d4d4d8',
                }}
              />
            );
          })}
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        activeOpacity={0.88}
        className="bg-[#e11d48] w-full rounded-2xl py-3.5 flex-row items-center justify-center shadow-lg active:scale-[0.99] mb-2"
        onPress={onPlayNow}
      >
        <Ionicons name="play-circle" size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-black text-[15px] tracking-tight">
          Add to Deck & Play Now ({cards.length} Cards) 🔥
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full py-2.5 items-center"
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs">
          Keep Browsing Store
        </Text>
      </TouchableOpacity>
    </View>
  );
}
