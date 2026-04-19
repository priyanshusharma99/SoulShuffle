import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function History() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#fffaf9]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf9" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#fffaf9] z-10">
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 10 }}
      >
        {/* Title Section */}
        <View className="mb-8 items-center mt-2">
          <Text className="text-[10px] font-bold text-[#b91c1c] tracking-[0.25em] uppercase w-full text-center mb-4">
            Timeline & Progress
          </Text>
          <Text className="text-[42px] leading-[48px] font-black w-full text-center text-slate-900 tracking-tight">
            Our <Text className="text-[#b91c1c] italic">Journey</Text>{'\n'}Together.
          </Text>
          
          <TouchableOpacity className="bg-[#df4b4b] rounded-full py-3 px-6 mt-6 flex-row items-center shadow-lg shadow-red-200">
            <Text className="text-white font-bold text-[11px] tracking-widest uppercase mr-2">
              Share Achievements
            </Text>
            <Ionicons name="share-social" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="mb-8">
          {/* Completion Rate Card */}
          <View className="bg-[#f7eceb] rounded-[32px] p-6 mb-4 relative overflow-hidden shadow-sm">
            <Ionicons name="heart" size={140} color="#e5d5d3" style={{ position: 'absolute', right: -30, top: 10, opacity: 0.8 }} />
            <Text className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-1">Completion Rate</Text>
            <Text className="text-4xl font-black text-slate-900 tracking-tighter mb-6">94%</Text>
            
            <View className="w-[85%] h-2.5 bg-slate-200/60 rounded-full flex-row z-10">
              <View className="w-[94%] h-full bg-[#0d6e67] rounded-full"></View>
            </View>
          </View>

          {/* Current Streak Card */}
          <View className="bg-[#f7eceb] rounded-[32px] p-6 mb-4 shadow-sm">
            <Text className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-1">Current Streak</Text>
            <Text className="text-4xl font-black text-[#b91c1c] tracking-tighter mb-6">12 Days</Text>
            
            <View className="flex-row items-center justify-between w-[90%] gap-2">
              <View className="flex-[1] h-1.5 bg-[#b91c1c] rounded-full"></View>
              <View className="flex-[1] h-1.5 bg-[#b91c1c] rounded-full"></View>
              <View className="flex-[1] h-1.5 bg-[#b91c1c] rounded-full"></View>
              <View className="flex-[1] h-1.5 bg-[#eebdbd] rounded-full"></View>
              <View className="flex-[1] h-1.5 bg-[#eebdbd] rounded-full"></View>
            </View>
          </View>

          {/* Dares Mastered Card */}
          <View className="bg-[#ab2f33] rounded-[32px] p-6 shadow-md shadow-red-900/30">
            <Text className="text-[9px] font-bold text-white/80 tracking-widest uppercase mb-1">Dares Mastered</Text>
            <Text className="text-5xl font-black text-white tracking-tighter mb-6">158</Text>
            <Text className="text-[13px] font-medium text-white/90">You&apos;re in the top 5% of couples!</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View className="flex-row flex-wrap gap-2 mb-8 justify-center">
          <TouchableOpacity className="bg-[#ab2f33] px-6 py-2 rounded-full shadow-sm">
            <Text className="text-white font-bold text-[10px] tracking-widest uppercase">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#ede4e3] px-5 py-2 rounded-full">
            <Text className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#ede4e3] px-5 py-2 rounded-full">
            <Text className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Last Month</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#ede4e3] px-5 py-2 rounded-full flex-row items-center justify-center">
            <Ionicons name="heart" size={10} color="#64748b" style={{ marginRight: 4 }} />
            <Text className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Section */}
        <View className="relative">
          {/* Vertical Timeline Track */}
          <View className="absolute left-[5px] top-4 bottom-10 w-[1px] bg-[#eaca2] border border-l border-[#eec5c5]" style={{ borderStyle: 'dotted', borderWidth: 1, borderColor: '#eec5c5', opacity: 0.6 }} />

          {/* Timeline Item 1 */}
          <View className="mb-6 relative flex-row">
            <View className="w-3 h-3 rounded-full bg-[#ab2f33] absolute left-0 top-5" />
            <View className="ml-6 flex-1 bg-white rounded-[28px] p-6 shadow-sm border border-slate-50">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Oct 14, 2023</Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#0d6e67" />
                  <Text className="text-[9px] font-bold text-[#0d6e67] tracking-widest uppercase ml-1">Completed</Text>
                </View>
              </View>
              <Text className="text-xl font-bold text-slate-900 tracking-tight mb-2">The Candlelit Picnic</Text>
              <Text className="text-slate-500 text-[13px] leading-5 font-medium mb-6">
                Assigned by <Text className="font-bold text-slate-800">Alex</Text>. A cozy indoor picnic with no phones allowed.
              </Text>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50/50">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="refresh" size={12} color="#ab2f33" />
                  <Text className="text-[10px] font-bold text-[#ab2f33] tracking-widest uppercase ml-1.5">Replay</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="heart" size={16} color="#857169" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View className="mb-6 relative flex-row">
            <View className="w-3 h-3 rounded-full bg-[#ab2f33] absolute left-0 top-5" />
            <View className="ml-6 flex-1 bg-white rounded-[28px] p-6 shadow-sm border border-slate-50">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Oct 22, 2023</Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#0d6e67" />
                  <Text className="text-[9px] font-bold text-[#0d6e67] tracking-widest uppercase ml-1">Completed</Text>
                </View>
              </View>
              <Text className="text-xl font-bold text-slate-900 tracking-tight mb-2">Love Note Scavenger Hunt</Text>
              <Text className="text-slate-500 text-[13px] leading-5 font-medium mb-6">
                Assigned by <Text className="font-bold text-slate-800">Sam</Text>. Hide 5 notes around the house with clues.
              </Text>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50/50">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="refresh" size={12} color="#ab2f33" />
                  <Text className="text-[10px] font-bold text-[#ab2f33] tracking-widest uppercase ml-1.5">Replay</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="heart" size={16} color="#857169" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timeline Item 3 (Expired) */}
          <View className="mb-6 relative flex-row">
            <View className="w-3 h-3 rounded-full bg-[#eec5c5] absolute left-0 top-5" />
            <View className="ml-6 flex-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#eec5c5]/40 opacity-90">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Oct 28, 2023</Text>
                <View className="flex-row items-center">
                  <Ionicons name="remove-circle" size={12} color="#857169" />
                  <Text className="text-[9px] font-bold text-[#857169] tracking-widest uppercase ml-1">Expired</Text>
                </View>
              </View>
              <Text className="text-xl font-bold text-slate-900 tracking-tight mb-2">The Sunset Drive</Text>
              <Text className="text-slate-500 text-[13px] leading-5 font-medium mb-6">
                Assigned by <Text className="font-bold text-slate-800">Alex</Text>. Drive to the highest point in the city for sunset.
              </Text>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50/50">
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="refresh" size={12} color="#ab2f33" />
                  <Text className="text-[10px] font-bold text-[#ab2f33] tracking-widest uppercase ml-1.5">Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="heart" size={16} color="#c2b8b4" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </View>

        {/* Load More Button */}
        <View className="items-center mt-2 mb-8">
          <TouchableOpacity className="bg-[#ede4e3] px-8 py-4 rounded-full w-full items-center">
            <Text className="text-[#ab2f33] font-bold text-[11px] tracking-widest uppercase">Load More History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
