import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCardImage } from '@/utils/cardUtils';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CardTimer = ({ send, isDark }: { send: any, isDark: boolean }) => {
  const getDiff = () => {
      const createdAt = new Date(send.created_at || Date.now()).getTime();
      const acceptedAt = send.accepted_at ? new Date(send.accepted_at).getTime() : send.updated_at ? new Date(send.updated_at).getTime() : createdAt;
      const isAccepted = send.status === 'ACCEPTED' || send.status === 'IN_PROGRESS';
      const target = isAccepted ? acceptedAt + 48 * 60 * 60 * 1000 : createdAt + 24 * 60 * 60 * 1000;
      const difference = target - new Date().getTime();
      return difference;
  };
  
  const formatTime = (diff: number) => {
      if (diff <= 0) return 'EXPIRED';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [timeLeft, setTimeLeft] = useState(() => formatTime(getDiff()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTime(getDiff()));
    }, 1000);
    return () => clearInterval(interval);
  }, [send.created_at, send.updated_at, send.accepted_at, send.status]);

  return (
    <View style={{ backgroundColor: isDark ? '#3b111b' : '#FFF1F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="timer-outline" size={12} color={isDark ? "#e55f75" : "#E11D48"} />
      <Text style={{ color: isDark ? '#e55f75' : '#E11D48', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>{timeLeft}</Text>
    </View>
  );
};

export default function PendingDaresCarousel({ pendingChallenges, currentUserId, onPressCard }: any) {
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.85;
  const isDark = useColorScheme() === 'dark';

  if (!pendingChallenges || pendingChallenges.length === 0) return null;

  const receivedChallenges = pendingChallenges.filter((c: any) => c.sender_id !== currentUserId);
  const sentChallenges = pendingChallenges.filter((c: any) => c.sender_id === currentUserId);

  const renderCardContent = (send: any) => {
    const isSentByMe = send.sender_id === currentUserId;
    const isCompleting = !isSentByMe && (send.status === 'IN_PROGRESS' || send.status === 'ACCEPTED');
    const btnText = isSentByMe ? 'WAITING FOR THEM' : isCompleting ? 'COMPLETE THE DARE' : 'YOUR TURN TO RESPOND';
    const categoryName = send.category || send.card?.category || send.card?.card_categories?.name || 'MYSTERY DARE';

    // Theme Colors
    const cardBg = isDark ? '#261217' : '#FFFFFF';
    const titleColor = isDark ? 'white' : '#000000';
    const catColor = isDark ? '#e55f75' : '#E11D48';
    
    // Button Colors
    const btnBgSent = isDark ? '#1a0a0f' : '#F3F4F6';
    const btnTextSent = isDark ? '#d1d5db' : '#6B7280';
    const btnBgAction = isCompleting ? '#7C3AED' : '#FF296D';
    const btnBg = isSentByMe ? btnBgSent : btnBgAction;
    const btnShadow = isSentByMe ? 'transparent' : btnBgAction;

    return (
      <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 24, overflow: 'hidden' }}>
        <View style={{ width: '100%', height: '55%' }}>
          <Image source={getCardImage(send)} style={{ width: '100%', height: '100%' }} />
        </View>

        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: catColor, fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }} numberOfLines={1}>
              {categoryName}
            </Text>
            <Text style={{ color: titleColor, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{send.title || send.card?.title || 'Unknown Card'}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CardTimer send={send} isDark={isDark} />
          </View>

          <TouchableOpacity 
            style={{ backgroundColor: btnBg, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, shadowColor: btnShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            onPress={() => {
              if (!isSentByMe && onPressCard) {
                onPressCard(send);
              }
            }}
            activeOpacity={isSentByMe ? 1 : 0.7}
          >
            <Text style={{ color: isSentByMe ? btnTextSent : '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 }}>{btnText}</Text>
            <Ionicons name="chevron-forward" size={18} color={isSentByMe ? btnTextSent : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const headerTitleColor = isDark ? 'white' : '#000000';
  const headerSubColor = isDark ? '#9ca3af' : '#6B7280';
  const shadowColor = isDark ? '#000' : '#FF296D';
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <View style={{ marginBottom: 24, marginTop: 10 }}>
      {/* RECEIVED DARES SECTION */}
      {receivedChallenges.length > 0 && (
        <View style={{ marginBottom: sentChallenges.length > 0 ? 32 : 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
            <View>
              <Text style={{ color: headerTitleColor, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>Pending Dares</Text>
              <Text style={{ color: headerSubColor, fontSize: 16, fontWeight: '700' }}>Cards waiting for you</Text>
            </View>
            <View style={{ backgroundColor: isDark ? 'rgba(180, 100, 20, 0.2)' : '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={14} color={isDark ? "#fbbf24" : "#D97706"} />
              <Text style={{ color: isDark ? '#fbbf24' : '#D97706', fontSize: 11, fontWeight: '800', marginLeft: 6, letterSpacing: 1 }}>{receivedChallenges.length} WAITING</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + 16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {receivedChallenges.map((challenge: any, index: number) => (
              <View 
                key={challenge.id || index}
                style={{ 
                  width: cardWidth, 
                  height: 400, 
                  marginRight: 16,
                  shadowColor: shadowColor,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: isDark ? 0.5 : 0.12,
                  shadowRadius: 15,
                  elevation: 10,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: borderColor,
                  backgroundColor: isDark ? 'transparent' : '#FFFFFF',
                }}
              >
                {renderCardContent(challenge)}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* SENT DARES SECTION */}
      {sentChallenges.length > 0 && (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
            <View>
              <Text style={{ color: headerTitleColor, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>Sent Dares</Text>
              <Text style={{ color: headerSubColor, fontSize: 16, fontWeight: '700' }}>Cards you sent to partner</Text>
            </View>
            <View style={{ backgroundColor: isDark ? 'rgba(20, 150, 100, 0.2)' : '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="paper-plane" size={14} color={isDark ? "#34d399" : "#059669"} />
              <Text style={{ color: isDark ? '#34d399' : '#059669', fontSize: 11, fontWeight: '800', marginLeft: 6, letterSpacing: 1 }}>{sentChallenges.length} SENT</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + 16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {sentChallenges.map((challenge: any, index: number) => (
              <View 
                key={challenge.id || index}
                style={{ 
                  width: cardWidth, 
                  height: 400, 
                  marginRight: 16,
                  shadowColor: shadowColor,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: isDark ? 0.5 : 0.12,
                  shadowRadius: 15,
                  elevation: 10,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: borderColor,
                  backgroundColor: isDark ? 'transparent' : '#FFFFFF',
                }}
              >
                {renderCardContent(challenge)}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
