import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import FreePlanEndModal from '@/components/FreePlanEndModal';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PlansModalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#14060B' : '#FFFFFF' }}>
      <FreePlanEndModal
        visible={true}
        onClose={handleClose}
        reason="manual"
      />
    </View>
  );
}
