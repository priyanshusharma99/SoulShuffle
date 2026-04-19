import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Chat() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-[#fff6f5]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff6f5" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#fff6f5] z-10">
        <TouchableOpacity>
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150, paddingTop: 10 }}
        >
          {/* Date Badge */}
          <View className="items-center mb-8">
            <View className="bg-rose-100/60 px-4 py-1.5 rounded-full">
              <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Today</Text>
            </View>
          </View>

          {/* Partner Message (Text) */}
          <View className="flex-row mb-6 items-end relative">
            <Image 
              source={{ uri: 'https://plus.unsplash.com/premium_photo-1678120616858-54b35e2380f9?w=100&h=100&fit=crop' }} 
              className="w-8 h-8 rounded-full mr-3 mb-1"
            />
            <View className="bg-[#e4dad6]/20 rounded-2xl rounded-bl-sm p-4 w-[75%] shadow-sm shadow-slate-100 border border-white/50 relative">
              <Text className="text-[#3c3a3a] text-[15px] leading-6 font-medium">
                Hey! I just finished the &quot;Morning Coffee&quot; dare. It made me think of you all morning. ❤️
              </Text>
              
              {/* Heart Reaction Badge */}
              <View className="absolute -bottom-3 -right-2 bg-white px-2 py-0.5 rounded-full flex-row items-center shadow-sm shadow-slate-200 border border-slate-50">
                <Text className="text-[10px]">❤️</Text>
                <Text className="text-[10px] font-bold text-slate-500 ml-1">1</Text>
              </View>
            </View>
          </View>

          {/* User Message (Text) */}
          <View className="mb-6 items-end">
            <View className="bg-[#e24e5d] rounded-2xl rounded-br-sm p-4 w-[80%] shadow-md shadow-red-200">
              <Text className="text-white text-[15px] leading-6 font-medium">
                That&apos;s so sweet! Are you ready for the next one? I&apos;m feeling adventurous today.
              </Text>
            </View>
            <View className="flex-row items-center mt-1 mr-1">
              <Text className="text-[10px] font-bold text-slate-400 tracking-wide uppercase mr-1">Read 11:42 AM</Text>
              <Ionicons name="checkmark-done" size={14} color="#e24e5d" />
            </View>
          </View>

          {/* System/Dare Message Context Card */}
          <View className="w-[90%] self-center bg-white rounded-[32px] overflow-hidden shadow-xl shadow-rose-200/40 border border-white mb-6">
            <View className="relative h-40 bg-rose-300">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=300&fit=crop' }} 
                className="w-full h-full opacity-60"
              />
              <View className="absolute inset-0 bg-[#8a2f3d]/30 items-center justify-center">
                <Text className="text-white text-[10px] font-bold tracking-[0.2em] mb-2 uppercase">Dare</Text>
                <Text className="text-white/80 text-[8px] tracking-[0.3em] uppercase opacity-60">Love Challenge</Text>
              </View>
              {/* New Dare Alert Badge */}
              <View className="absolute bottom-4 left-4 bg-[#fde047] px-3 py-1 rounded-full shadow-sm">
                <Text className="text-[#854d0e] font-bold text-[10px] tracking-widest uppercase">New Dare Alert</Text>
              </View>
            </View>
            
            <View className="p-6">
              <Text className="text-xl font-bold text-[#b91c1c] tracking-tight mb-2">The Sunset Picnic Challenge</Text>
              <Text className="text-slate-500 text-[14px] leading-5 font-medium mb-6">
                Find a spot with a view, pack three of their favorite snacks, and watch the sun go down without using phones.
              </Text>
              <TouchableOpacity className="bg-rose-50 rounded-full py-4 items-center justify-center border border-rose-100 shadow-sm active:opacity-80">
                <Text className="text-[#b91c1c] font-bold text-[15px]">Accept Dare</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Message & Floating Reactions */}
          <View className="flex-row items-end mb-10 relative">
            <View className="w-8 h-8 rounded-full mr-3 mb-1 overflow-hidden" /> {/* Spacer for avatar alignment */}
            
            <View className="flex-1">
              {/* Voice Message Bubble */}
              <View className="bg-[#7de5d4] rounded-full p-2 pl-3 pr-4 shadow-sm w-[75%] flex-row items-center border border-teal-200/50">
                <TouchableOpacity className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-sm">
                  <Ionicons name="play" size={18} color="#0d5f5a" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
                
                {/* Simulated Waveform using styling */}
                <View className="flex-1 flex-row items-center justify-between px-3 h-8">
                  <View className="w-1 bg-[#0d5f5a]/40 h-[20%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/60 h-[40%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/80 h-[80%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a] h-[100%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/80 h-[60%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/60 h-[30%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/40 h-[20%] rounded-full"></View>
                  <View className="w-1 bg-[#0d5f5a]/30 h-[10%] rounded-full"></View>
                </View>

                <Text className="text-[#0d5f5a] font-bold text-[11px] ml-1">0:14</Text>
              </View>

              {/* Floating Reaction Pill */}
              <View className="absolute -bottom-8 -left-4 bg-white rounded-full px-4 py-2 flex-row items-center gap-2 shadow-xl shadow-slate-300 z-20 border border-slate-50">
                <TouchableOpacity><Text className="text-xl">❤️</Text></TouchableOpacity>
                <TouchableOpacity><Text className="text-xl">🔥</Text></TouchableOpacity>
                <TouchableOpacity><Text className="text-xl">✨</Text></TouchableOpacity>
                <TouchableOpacity><Text className="text-xl">🫂</Text></TouchableOpacity>
                <TouchableOpacity><Text className="text-xl">🌹</Text></TouchableOpacity>
                <TouchableOpacity><Text className="text-xl">🥂</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Chat Input Bar */}
        <View className="bg-white px-4 py-3 flex-row items-center border-t border-slate-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] pb-safe mb-10">
          <TouchableOpacity className="bg-slate-100 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="add" size={24} color="#64748b" />
          </TouchableOpacity>
          
          <View className="flex-1 bg-slate-100 rounded-full h-11 flex-row items-center px-4 mr-3">
            <TextInput 
              placeholder="Message..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-[15px] font-medium text-slate-800"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity className={message.trim() ? "bg-[#e24e5d] w-11 h-11 rounded-full items-center justify-center shadow-md shadow-red-200" : "bg-[#e24e5d] w-11 h-11 rounded-full items-center justify-center shadow-md shadow-red-200"}>
            <Ionicons name={message.trim() ? "send" : "mic"} size={message.trim() ? 16 : 20} color="white" style={message.trim() ? { transform: [{ rotate: '-45deg' }], marginLeft: 2, marginBottom: 2 } : {}} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
