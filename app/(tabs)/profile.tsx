import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeToggle } from '@/hooks/use-color-scheme';
import { useSidebar } from '@/context/SidebarContext';

export default function Profile() {
  const { openSidebar } = useSidebar();
  const { colorScheme, toggleTheme } = useThemeToggle();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-[#fdfaf9] dark:bg-[#13090B]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#13090B" : "#fdfaf9"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={openSidebar}>
            <Ionicons name="menu-outline" size={30} color={isDark ? "#fff" : "#9f1239"} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="infinite" size={28} color={isDark ? "#fda4af" : "#be123c"} style={{ transform: [{ rotate: '-15deg' }] }} />
            <Text className="text-red-700 dark:text-rose-400 font-black text-xl tracking-tight">SoulShuffle</Text>
          </View>
          <TouchableOpacity>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' }} 
              className="w-10 h-10 rounded-full border border-rose-200 dark:border-rose-950/30"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Avatars Section */}
        <View className="items-center mt-4">
          <View className="flex-row justify-center relative w-full h-40">
            {/* Left Image (Alex) */}
            <View className="absolute right-1/2 mr-[-10px] bg-slate-800 rounded-t-[40px] rounded-br-[40px] rounded-bl-[10px] overflow-hidden w-40 h-40 shadow-lg z-10">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' }} 
                className="w-full h-full"
              />
            </View>
            
            {/* Right Image (Sam) */}
            <View className="absolute left-1/2 ml-[-20px] bg-[#669894] rounded-t-[40px] rounded-bl-[40px] rounded-br-[10px] overflow-hidden w-40 h-40 shadow-lg">
              <Image 
                source={{ uri: 'https://plus.unsplash.com/premium_photo-1678120616858-54b35e2380f9?w=200&h=200&fit=crop' }} 
                className="w-full h-full"
              />
            </View>

            {/* Shared Badge */}
            <View className="absolute bottom-[-16px] z-20 bg-[#0d5f5a] dark:bg-teal-600 px-4 py-2 rounded-full flex-row items-center justify-center shadow-lg shadow-teal-900/40">
              <Ionicons name="heart" size={12} color="white" />
              <Text className="text-white font-bold text-[10px] ml-1 tracking-widest uppercase">Happy Together</Text>
            </View>
          </View>
          
          <Text className="text-3xl font-black text-[#af2c3b] dark:text-white mt-8 tracking-tight">Alex & Sam</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Together for 2.5 years</Text>
        </View>

        {/* Top Cards Info */}
        <View className="px-6 mt-8">
          <View className="bg-white dark:bg-[#1E1215] rounded-[24px] p-5 shadow-sm shadow-slate-200/40 mb-4 border border-slate-100/50 dark:border-rose-950/20">
            <Ionicons name="book" size={18} color={isDark ? "#f43f5e" : "#af2c3b"} className="mb-2" />
            <Text className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-1">Memory Book</Text>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">124 moments captured since 2021</Text>
          </View>

          <View className="bg-[#fc6062] dark:bg-indigo-900/80 rounded-[24px] p-5 shadow-lg shadow-red-200/50 mb-4 flex-col justify-center">
            <Ionicons name="trophy" size={18} color={isDark ? "#fff" : "#3c0c11"} className="mb-2" />
            <Text className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-1">Level 14</Text>
            <Text className="text-[10px] font-bold text-slate-900/60 dark:text-slate-200/60 mt-1 tracking-widest uppercase">Romantic Strategists</Text>
          </View>

          <View className="bg-[#e4dad6]/30 dark:bg-[#1E1215]/80 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-rose-950/30 overflow-hidden relative">
            <Text className="text-base font-bold text-slate-800 dark:text-white tracking-tight mb-3">Favorite Memory</Text>
            <Text className="text-sm font-medium italic text-slate-600 dark:text-slate-300 leading-6 pr-6">
              &quot;That rainy afternoon in Kyoto when we got lost in the bamboo forest and ended up in that tiny tea house.&quot;
            </Text>
            <TouchableOpacity className="mt-4 flex-row items-center">
              <Text className="text-xs font-bold text-[#af2c3b] dark:text-rose-400 tracking-wide uppercase">View All Memories</Text>
              <Ionicons name="arrow-forward" size={12} color={isDark ? "#f43f5e" : "#af2c3b"} className="ml-1" />
            </TouchableOpacity>
            <Ionicons name="images" size={80} color={isDark ? "#1e293b" : "#e5e5e5"} style={{ position: 'absolute', bottom: -20, right: -10, opacity: 0.8 }} />
          </View>
        </View>

        {/* Couple Goals Section */}
        <View className="mt-8 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-[#5ce1e6]/40 dark:bg-teal-950/60 w-8 h-8 rounded-full items-center justify-center mr-3">
                <Ionicons name="flag" size={14} color={isDark ? "#2dd4bf" : "#000"} />
              </View>
              <Text className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Couple Goals</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-[10px] font-bold text-[#af2c3b] dark:text-rose-400 tracking-widest uppercase">Set New Goal</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#f5eeed]/60 dark:bg-[#1E1215]/50 rounded-[32px] p-6 shadow-sm shadow-slate-100 dark:shadow-none">
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-widest uppercase mb-1">Current Milestone</Text>
            <View className="flex-row items-end justify-between">
              <Text className="text-lg font-bold text-slate-800 dark:text-white leading-6 max-w-[70%]">First International Trip Together</Text>
              <Text className="text-xl font-black text-[#0d5f5a] dark:text-teal-400">75%</Text>
            </View>

            <View className="w-full h-3 bg-slate-200/80 dark:bg-[#13090B]/80 rounded-full mt-4 flex-row">
              <View className="w-[75%] h-full bg-[#0d5f5a] dark:bg-teal-500 rounded-full"></View>
            </View>

            <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-3 mb-6">
              Only 4 more dares to unlock the &quot;Traveler&quot; badge!
            </Text>

            <View className="flex-col gap-4">
              <View className="flex-row">
                <Ionicons name="checkmark-circle" size={22} color={isDark ? "#2dd4bf" : "#0d5f5a"} />
                <View className="ml-3">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">30 Dares Done</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Level 1 Complete</Text>
                </View>
              </View>

              <View className="flex-row">
                <Ionicons name="ellipse-outline" size={22} color={isDark ? "#334155" : "#94a3b8"} />
                <View className="ml-3">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">6-Month Streak</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">4 months current</Text>
                </View>
              </View>

              <View className="flex-row">
                <Ionicons name="checkmark-circle" size={22} color={isDark ? "#2dd4bf" : "#0d5f5a"} />
                <View className="ml-3">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Photo Journal</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">100+ photos added</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Dare Preferences Section */}
        <View className="mt-8 px-6">
          <Text className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Dare Preferences</Text>
          
          <View className="bg-white dark:bg-[#1E1215] rounded-[32px] p-6 shadow-sm border border-slate-50/50 dark:border-rose-950/20">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <Ionicons name="restaurant" size={18} color={isDark ? "#f43f5e" : "#af2c3b"} />
                <Text className="text-[15px] font-semibold text-slate-800 dark:text-white ml-4">Food & Dining</Text>
              </View>
              <Switch value={true} trackColor={{ false: "#e2e8f0", true: "#0d5f5a" }} thumbColor="#fff" />
            </View>

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <Ionicons name="compass" size={18} color={isDark ? "#f43f5e" : "#af2c3b"} />
                <Text className="text-[15px] font-semibold text-slate-800 dark:text-white ml-4">Outdoor Adventures</Text>
              </View>
              <Switch value={true} trackColor={{ false: "#e2e8f0", true: "#0d5f5a" }} thumbColor="#fff" />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="home" size={18} color={isDark ? "#c084fc" : "#857169"} />
                <Text className="text-[15px] font-semibold text-slate-800 dark:text-white ml-4">Cozy Nights In</Text>
              </View>
              <Switch value={false} trackColor={{ false: "#e2e8f0", true: "#0d5f5a" }} thumbColor="#fff" />
            </View>
          </View>
        </View>

        {/* Capture Your Love CTA */}
        <View className="px-6 mt-8">
          <View className="bg-[#de5b58] dark:bg-[#ae2f34] rounded-[36px] p-8 items-center shadow-lg shadow-red-200/50 relative overflow-hidden">
            {/* Background design elements */}
            <View className="absolute top-[-50] left-[-20] w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute bottom-[-30] right-[-30] w-32 h-32 bg-black/10 rounded-full" />
            
            <Text className="text-2xl font-black text-white text-center leading-8 mb-3">Capture Your{'\n'}Love</Text>
            <Text className="text-white/90 font-medium text-center text-[13px] leading-5 px-4 mb-6">
              Share your latest date photos to your private Memory Book.
            </Text>
            <TouchableOpacity className="bg-white rounded-full py-4 px-8 flex-row items-center shadow-md active:opacity-80">
              <Ionicons name="camera" size={18} color="#af2c3b" />
              <Text className="text-[#af2c3b] font-bold text-sm ml-2">Add Photos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View className="mt-8 px-6 mb-4">
          <Text className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Settings</Text>
          
          <View className="bg-white dark:bg-[#1E1215] rounded-[32px] p-6 py-2 shadow-sm border border-slate-50/50 dark:border-rose-950/20">
            {/* Dark Mode Switch Toggle */}
            <View className="flex-row items-center justify-between py-5 border-b border-slate-100 dark:border-rose-950/20">
              <View className="flex-row items-center flex-1">
                <Ionicons name="moon" size={18} color={isDark ? "#fff" : "#857169"} />
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Dark Mode</Text>
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 pr-4 leading-4">Switch to premium dark mode theme</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: isDark ? "#1e293b" : "#cbd5e1", true: isDark ? "#0d9488" : "#fda4af" }}
                thumbColor={isDark ? "#2dd4bf" : "#f1f5f9"}
              />
            </View>

            <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-slate-100 dark:border-rose-950/20">
              <View className="flex-row items-center flex-1">
                <Ionicons name="lock-closed" size={18} color={isDark ? "#fff" : "#857169"} />
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Privacy & Data</Text>
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 pr-4 leading-4">Manage what your partner and friends see</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-slate-100 dark:border-rose-950/20">
              <View className="flex-row items-center flex-1">
                <Ionicons name="notifications" size={18} color={isDark ? "#fff" : "#857169"} />
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Notifications</Text>
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 pr-4 leading-4">Daily reminders and dare alerts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-5">
              <View className="flex-row items-center flex-1">
                <Ionicons name="people" size={18} color={isDark ? "#fff" : "#857169"} />
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Invite Partner</Text>
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 pr-4 leading-4">Resend invite or change partner email</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
