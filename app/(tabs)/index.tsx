import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-rose-50" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Status bar configuration if needed */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff1f2" />
      
      {/* Side Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View className="flex-1 flex-row">
          {/* Backdrop Overlay */}
          <TouchableOpacity 
            className="absolute inset-0 bg-black/30 z-10 w-full h-full" 
            activeOpacity={1} 
            onPress={() => setIsMenuOpen(false)} 
          />
          
          {/* Menu Panel */}
          <View className="bg-[#fff8f7] w-[80%] h-full pt-16 rounded-tr-[40px] rounded-br-[40px] shadow-2xl shadow-slate-900 border-r border-[#ffeceb] z-20 flex-col">
            <View className="px-8 pb-8 flex-1">
              
              {/* Avatar Section */}
              <View className="relative w-20 h-20 mb-4">
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' }} 
                  className="w-full h-full rounded-full border-[3px] border-[#e24e5d]"
                />
                <View className="absolute -bottom-1 -right-2 bg-[#0d6e67] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                  <Text className="text-white font-bold text-[11px]">14</Text>
                </View>
              </View>

              <Text className="text-[28px] font-black text-[#af2c3b] tracking-tight">Alex & Sam</Text>
              <Text className="text-[10px] font-bold text-[#e18e8e] tracking-[0.15em] uppercase mt-2">Level 14 Romantic</Text>
              <Text className="text-[14px] font-medium text-slate-600 mt-1 mb-10">Connected since 2022</Text>

              {/* Menu Links */}
              <TouchableOpacity 
                className="flex-row items-center py-4 px-6 mb-2 rounded-full"
                onPress={() => setIsMenuOpen(false)}
              >
                <Ionicons name="home" size={20} color="#857169" />
                <Text className="text-[#857169] font-bold text-[15px] ml-5">Home</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center bg-[#e4525f] py-4 px-6 rounded-full mb-2 shadow-sm shadow-red-200"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/dares');
                }}
              >
                <Ionicons name="trophy" size={20} color="#fff" />
                <Text className="text-white font-bold text-[15px] ml-5">Challenges</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center py-4 px-6 mb-2 rounded-full"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/history');
                }}
              >
                <Ionicons name="time" size={20} color="#857169" />
                <Text className="text-[#857169] font-bold text-[15px] ml-5">History</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center py-4 px-6 mb-2 rounded-full"
              >
                <Ionicons name="book" size={20} color="#857169" />
                <Text className="text-[#857169] font-bold text-[15px] ml-5">Memory Book</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center py-4 px-6 mb-8 rounded-full"
              >
                <Ionicons name="pricetag" size={20} color="#857169" />
                <Text className="text-[#857169] font-bold text-[15px] ml-5">Coin Toss</Text>
              </TouchableOpacity>

              {/* Bottom Menu Items */}
              <View className="mt-auto">
                <TouchableOpacity 
                  className="flex-row items-center py-4 px-6 rounded-full border-t border-slate-100"
                >
                  <Ionicons name="settings" size={20} color="#857169" />
                  <Text className="text-[#857169] font-bold text-[15px] ml-5">Settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="px-8 pb-12 pt-6 border-t border-slate-100 bg-[#fffdfc] rounded-br-[40px]">
              <Text className="text-3xl font-black italic text-[#af2c3b] tracking-tight mb-2">Love Dare</Text>
              <Text className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">Version 2.4.0 • Made with love</Text>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Ionicons name="menu-outline" size={30} color="#9f1239" />
          </TouchableOpacity>
          <Text className="text-red-700 font-extrabold text-lg tracking-tight">Love Dare Challenge</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' }} 
              className="w-10 h-10 rounded-full border border-rose-200"
            />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View className="px-6 mt-4">
          <Text className="text-[32px] leading-10 font-black text-slate-900 tracking-tight">
            Welcome back, Alex{'\n'}& Sam 💕
          </Text>
          <Text className="text-slate-500 font-semibold text-sm mt-3">
            Together for 2.5 years • Level 14 Romantic
          </Text>
        </View>

        {/* Couple Image */}
        <View className="px-6 mt-6">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=400&fit=crop' }} 
            className="w-full h-52 rounded-[36px]"
          />
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between px-6 mt-6">
          <View className="bg-white rounded-[32px] p-6 w-[47%] shadow-sm shadow-rose-100/50">
            <View className="bg-rose-50/80 w-10 h-10 rounded-full items-center justify-center mb-5">
              <Ionicons name="medal" size={20} color="#e11d48" />
            </View>
            <Text className="text-3xl font-black text-slate-900">24</Text>
            <Text className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Dares Finished</Text>
          </View>
          <View className="bg-white rounded-[32px] p-6 w-[47%] shadow-sm shadow-rose-100/50">
            <View className="bg-teal-50/80 w-10 h-10 rounded-full items-center justify-center mb-5">
              <Ionicons name="flame" size={20} color="#0d9488" />
            </View>
            <Text className="text-3xl font-black text-slate-900">5</Text>
            <Text className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Day Streak</Text>
          </View>
        </View>

        {/* Today's Dare Section */}
        <View className="mx-6 mt-6 bg-white rounded-[36px] p-7 shadow-xl shadow-rose-200/40 relative">
          <View className="absolute top-7 right-7 bg-[#dfb15b] w-8 h-8 rounded-full items-center justify-center shadow-sm">
            <Ionicons name="star" size={14} color="white" />
          </View>
          <Text className="text-[11px] font-bold text-rose-500 tracking-widest uppercase">Today&apos;s Intimacy Dare</Text>
          <Text className="text-2xl font-black text-slate-900 mt-4 pr-12 leading-8">
            Write a 3-sentence love note and hide it.
          </Text>
          <Text className="text-slate-500 mt-4 leading-6 text-[15px] font-medium">
            Find a place they&apos;ll discover later today—a coffee mug, a laptop, or a coat pocket.
          </Text>
          <TouchableOpacity className="bg-rose-500 rounded-full py-[18px] items-center mt-7 flex-row justify-center shadow-lg shadow-rose-300" activeOpacity={0.8}>
            <Text className="text-white font-bold text-[15px] mr-2">Start Challenge</Text>
            <Ionicons name="play" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Recent Memories Section */}
        <View className="mt-10 mb-6">
          <View className="flex-row items-center justify-between px-6">
            <Text className="text-xl font-black text-slate-900 tracking-tight">Recent Memories</Text>
            <TouchableOpacity>
              <Text className="text-[11px] font-bold text-red-700 uppercase tracking-widest">View Book</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5 px-6 pb-2" contentContainerStyle={{ paddingRight: 48 }}>
            <View className="w-[260px] h-44 mr-4 rounded-[32px] overflow-hidden relative shadow-sm">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=600&h=400&fit=crop' }} 
                className="w-full h-full"
              />
              <View className="absolute inset-0 bg-black/20" />
              <View className="absolute bottom-0 left-0 right-0 p-5 pt-10 bg-gradient-to-t from-black/80 to-transparent">
                <Text className="text-white font-bold text-[13px] tracking-wide">Coffee Date • 2 days ago</Text>
              </View>
            </View>
            <View className="w-[260px] h-44 mr-4 rounded-[32px] overflow-hidden relative shadow-sm">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?w=600&h=400&fit=crop' }} 
                className="w-full h-full"
              />
              <View className="absolute inset-0 bg-black/20" />
              <View className="absolute bottom-0 left-0 right-0 p-5 pt-10 bg-gradient-to-t from-black/80 to-transparent">
                <Text className="text-white font-bold text-[13px] tracking-wide">Moonlight Walk • 5 days ago</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-[#af2c3b] w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-red-900/40"
        activeOpacity={0.9}
        style={{ zIndex: 50 }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
