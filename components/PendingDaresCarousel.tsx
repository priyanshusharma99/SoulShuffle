import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, PanResponder, useWindowDimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCardImage } from '@/utils/cardUtils';


const CardTimer = ({ send }: { send: any }) => {
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
    <View style={{ backgroundColor: '#3b111b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="timer-outline" size={12} color="#e55f75" />
      <Text style={{ color: '#e55f75', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>{timeLeft}</Text>
    </View>
  );
};

export default function PendingDaresCarousel({ pendingChallenges, currentUserId, onPressCard }: any) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const positionCache = useRef<{ [key: string]: any }>({});
  const getPosition = (id: string | number) => {
    if (!positionCache.current[id]) {
      positionCache.current[id] = new Animated.ValueXY();
    }
    return positionCache.current[id];
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [pendingChallenges?.length, pendingChallenges?.[0]?.id]);

  const latestIndex = useRef(currentIndex);
  const latestData = useRef(pendingChallenges);

  useEffect(() => {
    latestIndex.current = currentIndex;
    latestData.current = pendingChallenges;
  }, [currentIndex, pendingChallenges]);

  const isAnimating = useRef(false);
  const touchScale = useRef(new Animated.Value(1)).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    const d = latestData.current;
    const idx = latestIndex.current;
    if (isAnimating.current || !d || d.length === 0) return;
    
    isAnimating.current = true;
    Animated.spring(touchScale, { toValue: 1, useNativeDriver: false }).start();
    const currentPosition = getPosition(d[idx].id);
    const x = direction === 'right' ? width * 1.5 : -width * 1.5;
    
    Animated.timing(currentPosition, {
      toValue: { x, y: 0 },
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start(() => {
      onSwipeComplete(direction, currentPosition);
    });
  };

  const onSwipeComplete = (direction: 'right' | 'left', animatedPos: any) => {
    const d = latestData.current;
    if (direction === 'left') {
      setCurrentIndex(prev => (prev < d.length - 1 ? prev + 1 : 0));
    } else {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : d.length - 1));
    }
    
    // We delay resetting the position of the SWIPED card to give React time to render the next card.
    // Since each card has its own position cache, the newly rendered front card will automatically be at 0,0!
    setTimeout(() => {
      animatedPos.setValue({ x: 0, y: 0 });
      isAnimating.current = false;
    }, 50);
  };

  const resetPosition = () => {
    const d = latestData.current;
    const idx = latestIndex.current;
    if (!d || d.length === 0) return;
    
    Animated.spring(getPosition(d[idx].id), {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length <= 1) return false;
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length <= 1) return false;
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        Animated.spring(touchScale, { toValue: 0.96, useNativeDriver: false }).start();
        const d = latestData.current;
        const idx = latestIndex.current;
        if (!isAnimating.current && d && d[idx]) {
          const currentPosition = getPosition(d[idx].id);
          currentPosition.setOffset({
            x: (currentPosition.x as any)._value,
            y: (currentPosition.y as any)._value
          });
          currentPosition.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        const currentPosition = getPosition(d[idx].id);
        currentPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        Animated.spring(touchScale, { toValue: 1, friction: 4, useNativeDriver: false }).start();
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        
        const currentPosition = getPosition(d[idx].id);
        currentPosition.flattenOffset();

        const isSwipeRight = gestureState.dx > 100 || (gestureState.dx > 20 && gestureState.vx > 0.5);
        const isSwipeLeft = gestureState.dx < -100 || (gestureState.dx < -20 && gestureState.vx < -0.5);

        if (isSwipeRight) {
          forceSwipe('right');
        } else if (isSwipeLeft) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  if (!pendingChallenges || pendingChallenges.length === 0) return null;
  
  const frontCard = pendingChallenges[currentIndex];
  const backCard = pendingChallenges.length > 1 ? pendingChallenges[(currentIndex + 1) % pendingChallenges.length] : null;

  const renderCardContent = (send: any) => {
    const isSentByMe = send.sender_id === currentUserId;
    // Fix Issue #3: Change "WAITING FOR PARTNER..." to clearly state they need to complete it.
    const isCompleting = !isSentByMe && (send.status === "IN_PROGRESS" || send.status === "ACCEPTED");
    const btnText = isSentByMe ? "WAITING FOR THEM TO COMPLETE" : isCompleting ? "COMPLETE THE DARE" : "YOUR TURN TO RESPOND";
    const categoryName = send.category || send.card?.category || send.card?.card_categories?.name || 'MYSTERY DARE';

    // We can't use CountdownTimer directly because it contains View elements and we had issues with style props.
    // The user prefers the exact look from the image, so static 23h 59m 48s is a safe fallback or a custom inline timer.
    // Using static for now as it perfectly matches the image visually.
    
    return (
      <View style={{ flex: 1, backgroundColor: '#261217', borderRadius: 24, overflow: 'hidden' }}>
        {/* Top Image */}
        <View style={{ width: '100%', height: '55%' }}>
          <Image source={getCardImage(send)} style={{ width: '100%', height: '100%' }} />
        </View>

        {/* Bottom Content */}
        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#e55f75', fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }} numberOfLines={1}>
              {categoryName}
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{send.title || send.card?.title || 'Unknown Card'}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CardTimer send={send} />
          </View>

          {/* Fix Issue #4: Action Button needs an onPress to open the modal! */}
          <TouchableOpacity 
            style={{ backgroundColor: isSentByMe ? '#1a0a0f' : isCompleting ? '#7C3AED' : '#FF296D', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, shadowColor: isSentByMe ? 'transparent' : isCompleting ? '#7C3AED' : '#FF296D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            onPress={() => {
              if (!isSentByMe && onPressCard) {
                onPressCard(send);
              }
            }}
            activeOpacity={isSentByMe ? 1 : 0.7}
          >
            <Text style={{ color: isSentByMe ? '#d1d5db' : '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 }}>{btnText}</Text>
            <Ionicons name="chevron-forward" size={18} color={isSentByMe ? '#d1d5db' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBackCard = () => {
    if (!backCard) return null;
    return (
      <Animated.View
        key={backCard.id}
        style={{
          position: 'absolute',
          top: 150,
          width: width * 0.85,
          height: 400,
          opacity: 0.85,
          transform: [{ scale: 0.85 }],
          zIndex: 1,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          backgroundColor: '#261217', 
        }}
      >
        {renderCardContent(backCard)}
      </Animated.View>
    );
  };

  const renderFrontCard = () => {
    if (!frontCard) return null;
    const currentPosition = getPosition(frontCard.id);
    
    const rotate = currentPosition.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-5deg', '0deg', '5deg'],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={frontCard.id}
        {...(pendingChallenges.length > 1 ? panResponder.panHandlers : {})}
        style={{
          position: 'absolute',
          top: 0,
          width: width * 0.85,
          height: 400,
          transform: [{ translateX: currentPosition.x }, { translateY: currentPosition.y }, { rotate }, { scale: touchScale }],
          zIndex: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 10,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        {renderCardContent(frontCard)}
      </Animated.View>
    );
  };

  return (
    <View style={{ marginBottom: 24, marginTop: 10 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <View>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>Pending Dares</Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>Cards sent by others</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(180, 100, 20, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people" size={14} color="#fbbf24" />
          <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '800', marginLeft: 6, letterSpacing: 1 }}>{pendingChallenges.length} WAITING</Text>
        </View>
      </View>

      {/* Carousel */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {/* Left Arrow */}
        <TouchableOpacity onPress={() => { if (pendingChallenges.length > 1) forceSwipe('right'); }} style={{ padding: 10, zIndex: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e0c12', alignItems: 'center', justifyContent: 'center', opacity: pendingChallenges.length > 1 ? 1 : 0.3 }}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* Card Deck Area */}
        <View style={{ alignItems: 'center', width: width * 0.85, height: pendingChallenges.length > 1 ? 560 : 400 }}>
          {renderBackCard()}
          {renderFrontCard()}
        </View>

        {/* Right Arrow */}
        <TouchableOpacity onPress={() => { if (pendingChallenges.length > 1) forceSwipe('left'); }} style={{ padding: 10, zIndex: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e0c12', alignItems: 'center', justifyContent: 'center', opacity: pendingChallenges.length > 1 ? 1 : 0.3 }}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Pagination Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
        {pendingChallenges.map((_: any, idx: number) => (
          <View key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: idx === currentIndex ? '#f43f5e' : '#4b5563', marginHorizontal: 4 }} />
        ))}
      </View>
    </View>
  );
}
