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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BundleCardItem {
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

interface BundleCardsSwipeCarouselProps {
  cards: BundleCardItem[];
  isDark?: boolean;
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, 420);
const ITEM_WIDTH = Math.min(SCREEN_WIDTH * 0.74, 275);
const ITEM_HEIGHT = ITEM_WIDTH * 1.38;

const getCatColor = (cat: string) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('romance')) return '#FF296D';
  if (c.includes('fun')) return '#9D4EDD';
  if (c.includes('spicy')) return '#D90429';
  return '#3A86FF';
};

export default function BundleCardsSwipeCarousel({
  cards,
  isDark = true,
}: BundleCardsSwipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-card position cache to eliminate 1-frame flash on card swap (exact match to dares.tsx)
  const positionCache = useRef<{ [key: string]: Animated.ValueXY }>({});
  const getPosition = (id: string | number) => {
    const key = String(id);
    if (!positionCache.current[key]) {
      positionCache.current[key] = new Animated.ValueXY();
    }
    return positionCache.current[key];
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [cards?.length, cards?.[0]?.id]);

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
        const d = latestCards.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const d = latestCards.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        const d = latestCards.current;
        const idx = latestIndex.current;
        if (!isAnimating.current && d && d[idx]) {
          const currentPosition = getPosition(d[idx].id);
          currentPosition.setOffset({
            x: (currentPosition.x as any)._value || 0,
            y: (currentPosition.y as any)._value || 0,
          });
          currentPosition.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const d = latestCards.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        const currentPosition = getPosition(d[idx].id);
        currentPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const d = latestCards.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;

        const currentPosition = getPosition(d[idx].id);
        currentPosition.flattenOffset();

        const isSwipeRight = gestureState.dx > 100 || (gestureState.dx > 20 && gestureState.vx > 0.5);
        const isSwipeLeft = gestureState.dx < -100 || (gestureState.dx < -20 && gestureState.vx < -0.5);

        if (isSwipeRight) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
            toValue: { x: SCREEN_WIDTH * 2, y: gestureState.dy + gestureState.vy * 50 },
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
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
            toValue: { x: -SCREEN_WIDTH * 2, y: gestureState.dy + gestureState.vy * 50 },
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
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
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!cards || cards.length === 0) return null;

  const renderCardUI = (item: BundleCardItem) => {
    const categoryColor = getCatColor(item.category);
    const cardImg = item.image || require('@/assets/images/bundle_spicy.jpg');

    return (
      <View
        className="w-full h-full rounded-[26px] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: isDark ? '#1C1721' : '#FFFFFF',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          shadowColor: categoryColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.7 : 0.2,
          shadowRadius: 18,
          elevation: 6,
        }}
      >
        <Image
          source={typeof cardImg === 'string' ? { uri: cardImg } : cardImg}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />

        {/* Gradient vignette */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            backgroundColor: 'rgba(0,0,0,0.58)',
          }}
        />

        {/* Top Category Badge */}
        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
          <View className="px-3 py-1 rounded-full shadow-md" style={{ backgroundColor: categoryColor }}>
            <Text className="text-white text-[10px] font-black tracking-widest uppercase">
              {item.category || 'DARE'}
            </Text>
          </View>
        </View>

        {/* Bottom Details (Exact Match to Dares Page CarouselItemUI) */}
        <View className="absolute bottom-5 left-4 right-4">
          <Text className="text-white text-[22px] font-black mb-1 tracking-tight leading-7" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-white/90 text-[13px] leading-5 mb-4" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center">
              <Ionicons name="people" size={15} color="white" />
              <Text className="text-white/90 font-semibold text-[12px] ml-1.5">2+ People</Text>
            </View>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-[#FF296D] shadow-lg">
              <Ionicons name="arrow-forward" size={18} color="white" />
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
            outputRange: [0, -25, 0],
            extrapolate: 'clamp',
          });
          const translateY = frontPosition.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: [0, -10, 0],
            extrapolate: 'clamp',
          });
          animatedStyle = {
            transform: [{ translateX }, { translateY }, { scale }, { rotate }],
            zIndex: 2,
            elevation: 2,
          };
        } else if (isThird) {
          animatedStyle = {
            transform: [{ translateX: 25 }, { translateY: -5 }, { scale: 0.88 }, { rotate: '6deg' }],
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
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 4,
        }}
      >
        {renderCardsStack()}
      </View>

      {/* Swipe helper text & counter */}
      <View className="flex-row items-center justify-between w-full px-2 mt-2 mb-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="swap-horizontal" size={13} color="#FF296D" />
          <Text className="text-slate-400 text-[11px] font-bold">
            Swipe cards left / right
          </Text>
        </View>
        <Text className="text-rose-500 font-black text-[11px]">
          Card {currentIndex + 1} of {cards.length}
        </Text>
      </View>

      {/* Pagination dots (exact match to dares.tsx) */}
      {totalDots > 1 && (
        <View className="flex-row justify-center items-center mt-2 mb-3 h-3">
          {Array.from({ length: totalDots }).map((_, i) => {
            const activeIndex = currentIndex % totalDots;
            const isActive = activeIndex === i;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => {
                  if (cards && cards[currentIndex]) {
                    getPosition(cards[currentIndex].id).setValue({ x: 0, y: 0 });
                  }
                  setCurrentIndex(i);
                }}
                style={{
                  height: 6,
                  width: isActive ? 20 : 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? '#FF296D' : isDark ? '#3D3442' : '#D9D9D9',
                  marginHorizontal: 3,
                  opacity: isActive ? 1 : 0.6,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
