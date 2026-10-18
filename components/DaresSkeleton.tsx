import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, ScrollView } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, 450);
const ITEM_WIDTH = SCREEN_WIDTH * 0.78;
const ITEM_HEIGHT = ITEM_WIDTH * 1.45;

export const ShimmerBox = ({
  width,
  height,
  borderRadius = 8,
  style,
  isDark = true,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  isDark?: boolean;
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const baseBg = isDark ? '#261520' : '#E8DFE4';

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseBg,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export default function DaresSkeleton({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#1C1017' : '#F7F2F5';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      style={{ flex: 1, backgroundColor: isDark ? '#0e0609' : '#FFFFFF' }}
    >
      {/* 1. Header Title Skeleton */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          {/* Big title "Dares" */}
          <ShimmerBox width={120} height={34} borderRadius={10} isDark={isDark} />
          {/* Right badges: Search Circle + Card Count Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ShimmerBox width={36} height={36} borderRadius={18} isDark={isDark} />
            <ShimmerBox width={85} height={28} borderRadius={14} isDark={isDark} />
          </View>
        </View>
        {/* Subtitle */}
        <ShimmerBox width={230} height={15} borderRadius={7} isDark={isDark} style={{ marginTop: 6 }} />
      </View>

      {/* 2. Hero Carousel Card Skeleton with 3D Stack depth */}
      <View style={{ marginTop: 12, marginBottom: 30, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background Ghost Card 2 */}
        <View
          style={{
            position: 'absolute',
            width: ITEM_WIDTH * 0.86,
            height: ITEM_HEIGHT * 0.86,
            borderRadius: 28,
            backgroundColor: isDark ? '#160B12' : '#EFE8ED',
            transform: [{ translateY: 26 }],
            opacity: 0.4,
          }}
        />

        {/* Background Ghost Card 1 */}
        <View
          style={{
            position: 'absolute',
            width: ITEM_WIDTH * 0.93,
            height: ITEM_HEIGHT * 0.93,
            borderRadius: 28,
            backgroundColor: isDark ? '#190E15' : '#F2ECF0',
            transform: [{ translateY: 14 }],
            opacity: 0.7,
          }}
        />

        {/* Front Hero Card */}
        <View
          style={{
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            borderRadius: 28,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
            overflow: 'hidden',
            padding: 20,
            justifyContent: 'space-between',
            shadowColor: isDark ? '#000' : '#FF296D',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {/* Top category badge */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ShimmerBox width={90} height={26} borderRadius={13} isDark={isDark} />
            <ShimmerBox width={50} height={22} borderRadius={11} isDark={isDark} />
          </View>

          {/* Bottom content */}
          <View style={{ width: '100%' }}>
            {/* Title */}
            <ShimmerBox width="75%" height={26} borderRadius={8} isDark={isDark} style={{ marginBottom: 10 }} />
            {/* Description lines */}
            <ShimmerBox width="95%" height={14} borderRadius={6} isDark={isDark} style={{ marginBottom: 6 }} />
            <ShimmerBox width="60%" height={14} borderRadius={6} isDark={isDark} style={{ marginBottom: 18 }} />

            {/* Footer row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ShimmerBox width={85} height={22} borderRadius={11} isDark={isDark} />
              <ShimmerBox width={48} height={48} borderRadius={24} isDark={isDark} />
            </View>
          </View>
        </View>
      </View>

      {/* 3. Explore Categories Skeleton */}
      <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <ShimmerBox width={170} height={22} borderRadius={8} isDark={isDark} />
          <ShimmerBox width={80} height={16} borderRadius={6} isDark={isDark} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                width: 124,
                height: 145,
                borderRadius: 24,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: cardBorder,
                marginRight: 14,
                overflow: 'hidden',
                padding: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ShimmerBox width="100%" height="65%" borderRadius={16} isDark={isDark} />
              <ShimmerBox width={65} height={14} borderRadius={7} isDark={isDark} style={{ marginBottom: 4 }} />
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
