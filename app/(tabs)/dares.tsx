import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dares() {
  const router = useRouter();

  const singleDares = [
    { id: 1, title: 'Sunset Picnic', category: 'ROMANTIC', difficulty: 'EASY', stars: 1, time: '45 mins', isPaid: false, image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1f271?w=400&h=400&fit=crop' },
    { id: 2, title: 'Retro Game Night', category: 'FUN/PLAYFUL', difficulty: 'MED', stars: 2, time: '60 mins', isPaid: true, image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400&h=400&fit=crop' },
    { id: 3, title: 'Secret Hike', category: 'ADVENTUROUS', difficulty: 'HARD', stars: 3, time: '120 mins', isPaid: false, image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop' },
    { id: 4, title: 'Morning Letters', category: 'SWEET MOMENTS', difficulty: 'EASY', stars: 1, time: '15 mins', isPaid: true, image: 'https://images.unsplash.com/photo-1512141655610-c4d62ea34ea1?w=400&h=400&fit=crop' },
    { id: 5, title: 'Pasta Workshop', category: 'FUN/PLAYFUL', difficulty: 'MED', stars: 2, time: '90 mins', isPaid: false, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop' },
    { id: 6, title: 'Star Gazing', category: 'ROMANTIC', difficulty: 'EASY', stars: 1, time: '30 mins', isPaid: true, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop' },
  ];

  const bundles = [
    { id: 101, title: 'Weekend Getaway', count: 5, isPaid: true, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop', price: 'Premium' },
    { id: 102, title: 'Cozy Winter', count: 8, isPaid: false, image: 'https://images.unsplash.com/photo-1542360663-8f402203e03d?w=600&h=400&fit=crop', price: 'Free' },
    { id: 103, title: 'Spicy Nights', count: 10, isPaid: true, image: 'https://images.unsplash.com/photo-1481824429379-07aa5e5b664f?w=600&h=400&fit=crop', price: 'Premium' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fff8f7]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f7" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#fff8f7] z-10">
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={30} color="#9f1239" />
        </TouchableOpacity>
        <Text className="text-[#a12338] font-extrabold text-lg tracking-tight">Love Dare Challenge</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' }} 
            className="w-10 h-10 rounded-full border border-rose-200"
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View className="px-6 mt-2 mb-6">
          <View className="bg-white rounded-2xl h-14 flex-row items-center px-4 shadow-sm shadow-slate-100 border border-slate-50">
            <Ionicons name="search" size={20} color="#000" />
            <TextInput 
              placeholder="Search for a dare..."
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-3 text-slate-800 text-[15px] font-medium"
            />
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-8" contentContainerStyle={{ paddingRight: 40, alignItems: 'center' }}>
          <TouchableOpacity className="bg-white px-6 py-4 rounded-full shadow-sm shadow-slate-200 mr-2 border border-slate-50">
            <Text className="text-slate-900 font-bold text-sm tracking-wide">All Dares</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-5 py-4 mr-2">
            <Text className="text-slate-500 font-bold text-sm tracking-wide">Romantic</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-5 py-4 mr-2">
            <Text className="text-slate-500 font-bold text-sm tracking-wide">Fun/Playful</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-5 py-4">
            <Text className="text-slate-500 font-bold text-sm tracking-wide">Adventurous</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Actions Row */}
        <View className="flex-row items-center justify-between px-6 mb-8">
          <TouchableOpacity className="bg-white px-5 py-3 rounded-2xl flex-row items-center shadow-sm shadow-slate-100 border border-slate-50">
            <Ionicons name="dice-outline" size={18} color="#000" />
            <Text className="text-slate-800 font-bold text-xs ml-2">Shuffle Cards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="add-circle" size={16} color="#000" />
            <Text className="text-slate-800 font-bold text-xs ml-1.5">Create Custom Challenge</Text>
          </TouchableOpacity>
        </View>

        {/* Bundles Section */}
        <View className="mb-10">
          <Text className="px-6 text-lg font-extrabold text-slate-900 tracking-tight mb-4">Dare Bundles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
            {bundles.map((bundle) => (
              <TouchableOpacity key={bundle.id} className="w-[280px] h-48 mr-4 rounded-[28px] overflow-hidden relative shadow-sm border border-slate-100 bg-white">
                <Image source={{ uri: bundle.image }} className="w-full h-[65%] absolute top-0" />
                <View className="absolute inset-0 bg-black/20" />
                
                {/* Bundle Ribbon & Premium Flag */}
                <View className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center">
                  <Ionicons name="albums" size={12} color="#ab2f33" />
                  <Text className="text-[#ab2f33] font-bold text-[10px] ml-1.5 tracking-wider">{bundle.count} DARES</Text>
                </View>

                {bundle.isPaid && (
                  <View className="absolute top-4 right-4 bg-[#fde047] px-2 py-1.5 rounded-full shadow-sm flex-row items-center">
                    <Ionicons name="lock-closed" size={10} color="#854d0e" />
                    <Text className="text-[#854d0e] font-bold text-[9px] ml-1 tracking-widest uppercase">Premium</Text>
                  </View>
                )}

                <View className="absolute bottom-0 left-0 right-0 h-[45%] bg-white p-4 justify-between border-t border-slate-100/50">
                  <Text className="text-lg font-bold text-slate-800 tracking-tight">{bundle.title}</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-500 font-medium text-[11px]">Unlock full deck</Text>
                    <Text className={`font-bold text-[12px] ${bundle.isPaid ? 'text-[#ab2f33]' : 'text-[#0d6e67]'}`}>
                      {bundle.price}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Single Dares Grid */}
        <View className="px-6 flex-row flex-wrap justify-between gap-y-4">
          <Text className="w-full text-lg font-extrabold text-slate-900 tracking-tight mb-1">Single Actions</Text>
          
          {singleDares.map((dare) => (
            <TouchableOpacity key={dare.id} className="w-[48%] bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-50 pb-4">
              <View className="w-full h-40 relative">
                <Image source={{ uri: dare.image }} className="w-full h-full" />
                
                {/* Difficulty & Premium Badges */}
                <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full flex-row items-center shadow-sm">
                  {Array.from({ length: dare.stars }).map((_, i) => (
                    <Ionicons key={i} name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
                  ))}
                  <Text className="text-slate-800 font-bold text-[9px] ml-1 tracking-wider uppercase">{dare.difficulty}</Text>
                </View>

                {dare.isPaid && (
                  <View className="absolute top-3 right-3 bg-white/95 w-6 h-6 rounded-full flex-row items-center justify-center shadow-sm">
                    <Ionicons name="lock-closed" size={10} color="#ab2f33" />
                  </View>
                )}
              </View>

              <View className="px-4 pt-4">
                <Text className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">{dare.category}</Text>
                <Text className="text-[17px] font-bold text-slate-800 tracking-tight leading-5 mb-3">{dare.title}</Text>
                <View className="flex-row items-center mt-auto">
                  <Ionicons name="time" size={12} color="#64748b" />
                  <Text className="text-[10px] font-semibold text-slate-500 ml-1.5">{dare.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Create Your Own Challenge Card */}
          <TouchableOpacity className="w-[48%] bg-transparent border-2 border-dashed border-slate-200 rounded-[24px] overflow-hidden items-center justify-center p-6 h-[256px]">
            <View className="w-12 h-12 rounded-full border border-slate-300 items-center justify-center bg-white mb-4 shadow-sm shadow-slate-100">
              <Ionicons name="add" size={24} color="#334155" />
            </View>
            <Text className="text-sm font-bold text-slate-800 tracking-tight leading-5 text-center mb-2">Create Your Own Challenge</Text>
            <Text className="text-[10px] font-medium text-slate-500 text-center leading-4">Personalize your journey together</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
