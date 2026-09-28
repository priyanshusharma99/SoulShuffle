const CarouselItemUI = ({ item, isDark, onSelectDare }: any) => {
  const categoryColor = getCatColor(item.category);
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onSelectDare(item)}
      className="w-full h-full rounded-[28px] overflow-hidden shadow-2xl"
      style={{ 
        backgroundColor: isDark ? '#1C1721' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        shadowColor: isDark ? '#000' : '#FF296D', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: isDark ? 0.6 : 0.1, 
        shadowRadius: 20 
      }}
    >
      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
      
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', backgroundColor: 'rgba(0,0,0,0.5)' }} />

      <View className="absolute top-5 left-5 right-5 flex-row justify-between items-start">
        {item.category ? (
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: categoryColor }}>
             <Text className="text-white text-[11px] font-black tracking-widest uppercase">{item.category}</Text>
          </View>
        ) : <View />}
      </View>

      <View className="absolute bottom-6 left-5 right-5">
         <Text className="text-white text-[26px] font-black mb-1 tracking-tight leading-8">{item.title}</Text>
         <Text className="text-white/90 text-[14px] leading-5 mb-5" numberOfLines={2}>{item.description}</Text>
         
         <View className="flex-row justify-between items-center mt-1">
           <View className="flex-row items-center">
             <Ionicons name="people" size={16} color="white" />
             <Text className="text-white font-semibold text-[13px] ml-1.5">2+ People</Text>
           </View>
           <TouchableOpacity onPress={() => onSelectDare(item)} className="w-12 h-12 rounded-full items-center justify-center bg-[#FF296D] shadow-lg">
             <Ionicons name="arrow-forward" size={22} color="white" />
           </TouchableOpacity>
         </View>
      </View>
    </TouchableOpacity>
  );
};

const DareCarousel = ({ data, isDark, onSelectDare }: any) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const { Animated, PanResponder } = require('react-native');
  // We store a separate Animated.ValueXY for EVERY card ID so they don't share position.
  // This completely eliminates the 1-frame flash when swapping cards!
  const positionCache = React.useRef<{ [key: string]: any }>({});
  const getPosition = (id: string | number) => {
    if (!positionCache.current[id]) {
      positionCache.current[id] = new Animated.ValueXY();
    }
    return positionCache.current[id];
  };

  // Reset index when data changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [data?.length, data?.[0]?.id]);

  const latestIndex = React.useRef(currentIndex);
  const latestData = React.useRef(data);

  React.useEffect(() => {
    latestIndex.current = currentIndex;
    latestData.current = data;
  }, [currentIndex, data]);

  const isAnimating = React.useRef(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt: any, gestureState: any) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt: any, gestureState: any) => {
        const d = latestData.current;
        if (isAnimating.current || !d || d.length === 0) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
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
      onPanResponderMove: (evt: any, gestureState: any) => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        const currentPosition = getPosition(d[idx].id);
        currentPosition.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt: any, gestureState: any) => {
        const d = latestData.current;
        const idx = latestIndex.current;
        if (isAnimating.current || !d || d.length === 0) return;
        
        const currentPosition = getPosition(d[idx].id);
        currentPosition.flattenOffset();

        const isSwipeRight = gestureState.dx > 100 || (gestureState.dx > 20 && gestureState.vx > 0.5);
        const isSwipeLeft = gestureState.dx < -100 || (gestureState.dx < -20 && gestureState.vx < -0.5);

        if (isSwipeRight) {
          isAnimating.current = true;
          Animated.timing(currentPosition, {
              toValue: { x: SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false
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
              toValue: { x: -SCREEN_WIDTH * 2, y: gestureState.dy + (gestureState.vy * 50) },
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false
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
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  if (!data || data.length === 0) return null;

  const renderCards = () => {
    const cardsToRender = [];
    const count = Math.min(data.length, 3);
    for (let offset = 0; offset < count; offset++) {
      const idx = (currentIndex + offset) % data.length;
      cardsToRender.push({ item: data[idx], offset, originalIndex: idx });
    }

    if (!data || data.length === 0) return null;
    const frontCard = data[currentIndex];
    if (!frontCard) return null;
    const frontPosition = getPosition(frontCard.id);

    return cardsToRender.map(({ item, offset, originalIndex }) => {
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
          extrapolate: 'clamp'
        });
        animatedStyle = {
          transform: [
            { translateX: itemPosition.x },
            { translateY: itemPosition.y },
            { scale: 1 },
            { rotate }
          ],
          zIndex: 3,
          elevation: 3
        };
        if (isFront) {
          panHandlers = panResponder.panHandlers;
        }
      } else if (isSecond) {
        const scale = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [1, 0.94, 1],
          extrapolate: 'clamp'
        });
        const rotate = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['0deg', '-6deg', '0deg'],
          extrapolate: 'clamp'
        });
        const translateX = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [0, -25, 0],
          extrapolate: 'clamp'
        });
        const translateY = frontPosition.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: [0, -10, 0],
          extrapolate: 'clamp'
        });
        animatedStyle = {
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          zIndex: 2,
          elevation: 2
        };
      } else if (isThird) {
        animatedStyle = {
          transform: [{ translateX: 25 }, { translateY: -5 }, { scale: 0.88 }, { rotate: '6deg' }],
          zIndex: 1,
          elevation: 1
        };
      }

      return (
        <Animated.View
          key={item.id || originalIndex}
          style={[
            { position: 'absolute', width: ITEM_WIDTH, height: ITEM_HEIGHT },
            animatedStyle
          ]}
          {...panHandlers}
        >
          <CarouselItemUI item={item} isDark={isDark} onSelectDare={onSelectDare} />
        </Animated.View>
      );
    }).reverse();
  };

  const renderPagination = () => {
    const totalDots = Math.min(data.length, 5);
    if (totalDots <= 1) return null;

    return (
      <View className="flex-row justify-center items-center mt-6 h-4">
        {Array.from({ length: totalDots }).map((_, i) => {
          const activeIndex = currentIndex % totalDots;
          const isActive = activeIndex === i;
          return (
            <TouchableOpacity 
              key={i} 
              activeOpacity={0.7}
              onPress={() => {
                if (data && data[currentIndex]) {
                  getPosition(data[currentIndex].id).setValue({ x: 0, y: 0 });
                }
                setCurrentIndex(i);
              }}
              style={{ 
                height: 8, 
                width: isActive ? 24 : 8, 
                borderRadius: 4, 
                backgroundColor: isActive ? '#FF296D' : (isDark ? '#3D3442' : '#D9D9D9'),
                marginHorizontal: 4,
                opacity: isActive ? 1 : 0.6
              }} 
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
        {renderCards()}
      </View>
      {renderPagination()}
    </View>
  );
};

