import React from 'react';
import { View, ScrollView } from 'react-native';
import { ShimmerBox } from './DaresSkeleton';

export const HomeRoomSkeleton = ({ isDark }: { isDark: boolean }) => {
  return (
    <View className="px-5 mb-8">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <ShimmerBox width={150} height={18} borderRadius={6} isDark={isDark} />
        <ShimmerBox width={55} height={14} borderRadius={5} isDark={isDark} />
      </View>
      <View
        style={{
          padding: 16,
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#180d12' : '#F7F2F5',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        }}
      >
        <ShimmerBox width={60} height={60} borderRadius={16} isDark={isDark} />
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
          <ShimmerBox width="70%" height={16} borderRadius={6} isDark={isDark} style={{ marginBottom: 8 }} />
          <ShimmerBox width="40%" height={12} borderRadius={5} isDark={isDark} style={{ marginBottom: 10 }} />
          <ShimmerBox width="90%" height={6} borderRadius={3} isDark={isDark} />
        </View>
        <ShimmerBox width={72} height={32} borderRadius={16} isDark={isDark} style={{ marginLeft: 8 }} />
      </View>
    </View>
  );
};

export const HomeMomentsSkeleton = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={{ marginBottom: 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
        <ShimmerBox width={130} height={18} borderRadius={6} isDark={isDark} />
        <ShimmerBox width={50} height={14} borderRadius={5} isDark={isDark} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 130,
              height: 180,
              borderRadius: 24,
              backgroundColor: isDark ? '#1A0C12' : '#F7F2F5',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              padding: 12,
              justifyContent: 'space-between',
            }}
          >
            <ShimmerBox width={60} height={18} borderRadius={9} isDark={isDark} />
            <View>
              <ShimmerBox width="85%" height={14} borderRadius={5} isDark={isDark} style={{ marginBottom: 6 }} />
              <ShimmerBox width="50%" height={10} borderRadius={4} isDark={isDark} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const HomePickedSkeleton = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
        <ShimmerBox width={140} height={18} borderRadius={6} isDark={isDark} />
        <ShimmerBox width={50} height={14} borderRadius={5} isDark={isDark} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 220,
              height: 140,
              borderRadius: 24,
              backgroundColor: isDark ? '#1A0C12' : '#F7F2F5',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              padding: 16,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ShimmerBox width={70} height={20} borderRadius={10} isDark={isDark} />
              <ShimmerBox width={24} height={24} borderRadius={12} isDark={isDark} />
            </View>
            <View>
              <ShimmerBox width="85%" height={16} borderRadius={6} isDark={isDark} style={{ marginBottom: 6 }} />
              <ShimmerBox width="55%" height={12} borderRadius={5} isDark={isDark} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
