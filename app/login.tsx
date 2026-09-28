import { Text, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import SigninForm from '@/components/signinForm';
import SignupForm from '@/components/signupForm';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const [mode, setMode] = useState('signin');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const rememberMe = await AsyncStorage.getItem('rememberMe');

          if (token && rememberMe === 'false') {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('rememberMe');
            return;
          }

          if (token) {
            router.replace('/(tabs)');
          }
        } catch (e) {}
      };

      checkToken();
    }, [])
  );

  const orbitalSize = width * 0.58; // Increased size as requested

  return (
    <SafeAreaView className='flex-1 bg-[#0F050B]'>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-start pt-2 pb-2 px-2"
      >
        {/* Header */}
        <View className="items-center mb-2 mt-2">
            <View className="flex-row items-center gap-1.5 mb-0.5">
                <Ionicons name="infinite" size={24} color="#FF296D" />
                <Text className="text-white font-black text-xl tracking-tight">
                    Soul<Text className="text-[#FF296D]">Shuffle</Text>
                </Text>
            </View>
            <Text className="text-white/60 text-xs font-medium">Ignite the spark, play together.</Text>
        </View>

        {/* Orbital Graphic (Hides when keyboard is open to prevent squishing) */}
        {!isKeyboardVisible && (
            <View className="items-center justify-center flex-shrink my-3">
                <View 
                    style={{
                        width: orbitalSize,
                        height: orbitalSize,
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: 'rgba(255, 41, 109, 0.3)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* Central Circle */}
                    <View 
                        style={{
                            width: orbitalSize * 0.55,
                            height: orbitalSize * 0.55,
                            borderRadius: 9999,
                            borderWidth: 2.5,
                            borderColor: '#FF296D',
                            overflow: 'hidden',
                            shadowColor: '#FF296D',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 15,
                            elevation: 8
                        }}
                    >
                        <Image 
                            source={require('@/assets/images/couple_beach_sunset.jpg')} 
                            style={{ width: '100%', height: '100%' }} 
                            resizeMode="cover" 
                        />
                    </View>
                    {/* Heart Badge */}
                    <View className="absolute bg-[#FF296D] rounded-full p-1 shadow-lg" style={{ top: '70%' }}>
                        <Ionicons name="heart" size={10} color="white" />
                    </View>

                    {/* Orbiting Elements */}
                    <View className="absolute bg-[#FF296D] w-7 h-7 rounded-full items-center justify-center shadow-lg" style={{ top: -14, left: '50%', marginLeft: -14 }}>
                        <Ionicons name="heart" size={14} color="white" />
                    </View>
                    <View className="absolute bg-[#6C1B3E] w-7 h-7 rounded-full items-center justify-center" style={{ right: -14, top: '50%', marginTop: -14 }}>
                        <Ionicons name="chatbubble" size={14} color="#FF296D" />
                    </View>
                    <View className="absolute bg-[#6C1B3E] w-7 h-7 rounded-full items-center justify-center" style={{ bottom: -14, left: '50%', marginLeft: -14 }}>
                        <Ionicons name="infinite" size={14} color="white" />
                    </View>
                    <View className="absolute bg-[#6C1B3E] w-7 h-7 rounded-full items-center justify-center" style={{ left: -14, top: '50%', marginTop: -14 }}>
                        <Ionicons name="game-controller" size={14} color="#FF296D" />
                    </View>

                    <View className="absolute w-8 h-8 rounded-full border border-[#FF296D]/50 overflow-hidden" style={{ top: '8%', right: '8%' }}>
                        <Image source={require('@/assets/images/couple_wildflower_sunset.jpg')} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View className="absolute w-8 h-8 rounded-full border border-[#FF296D]/50 overflow-hidden" style={{ bottom: '8%', right: '8%' }}>
                        <Image source={require('@/assets/images/couple_cover.jpeg')} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View className="absolute w-8 h-8 rounded-full border border-[#FF296D]/50 overflow-hidden" style={{ bottom: '8%', left: '8%' }}>
                        <Image source={require('@/assets/images/sunset_picnic.jpeg')} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View className="absolute w-8 h-8 rounded-full border border-[#FF296D]/50 overflow-hidden" style={{ top: '8%', left: '8%' }}>
                        <Image source={require('@/assets/images/bundle_romantic.jpg')} style={{ width: '100%', height: '100%' }} />
                    </View>
                </View>
            </View>
        )}

        {/* Text Content */}
        <View className="items-center px-4 mb-2">
            <Text className="text-white text-xl font-bold">Let's create</Text>
            <Text className="text-white text-xl font-bold">
                beautiful moments <Text className="text-[#FF296D]">together ♡</Text>
            </Text>
            <Text className="text-white/40 text-xs mt-1">
                {mode === 'signin' ? 'Sign in to continue your journey' : 'Sign up to start your journey'}
            </Text>
        </View>

        {/* Form */}
        {mode === 'signin' ? <SigninForm /> : <SignupForm />}

        {/* Footer toggle - Pulled right up to the form with minimal gap */}
        <View className="flex-row justify-center mt-2 pb-2">
          <Text className="text-white/40 text-sm font-medium">{mode === 'signin' ? "Don't have an account? " : "Already have an account? "}</Text>
          <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            <Text className="text-[#FF296D] text-sm font-bold">{mode === 'signin' ? "Sign Up" : "Sign In"}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Index;
