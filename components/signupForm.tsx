import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { signUp, googleLogin, appleLogin } from '../services/authService'
import { useRouter } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'

const SignupForm = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            setErrorMessage("Please fill all fields.");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await signUp(name, email, password);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || "Failed to sign up.");
        } finally {
            setIsLoading(false);
        }
    }

return (
    <View className="w-full gap-y-3.5 px-6 mt-1">
        {/* Google & Apple Auth Row */}
        <View className="flex-row gap-x-3">
            <TouchableOpacity 
                onPress={googleLogin}
                className="flex-1 bg-white/5 rounded-full py-3.5 flex-row items-center justify-center border border-white/10"
            >
                <Ionicons name="logo-google" size={18} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={appleLogin}
                className="flex-1 bg-white/5 rounded-full py-3.5 flex-row items-center justify-center border border-white/10"
            >
                <Ionicons name="logo-apple" size={18} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">Apple</Text>
            </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-1 px-4">
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="text-white/30 px-3 font-bold text-[10px] tracking-widest uppercase">Or Continue With</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
        </View>

        {/* Name, Email & Password */}
        <View className="relative">
            <Ionicons name="person-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 14, left: 18, zIndex: 1 }} />
            <TextInput
                className="w-full bg-[#160B12] rounded-full pl-12 pr-6 py-3.5 text-white text-sm border border-white/5"
                placeholder="Full Name"
                placeholderTextColor="#71717a"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={{ color: 'white' }}
            />
        </View>

        <View className="relative">
            <Ionicons name="mail-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 14, left: 18, zIndex: 1 }} />
            <TextInput
                className="w-full bg-[#160B12] rounded-full pl-12 pr-6 py-3.5 text-white text-sm border border-white/5"
                placeholder="Email Address"
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ color: 'white' }}
            />
        </View>

        <View className="relative">
            <Ionicons name="lock-closed-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 14, left: 18, zIndex: 1 }} />
            <TextInput
                className="w-full bg-[#160B12] rounded-full pl-12 pr-12 py-3.5 text-white text-sm border border-white/5"
                placeholder="Password"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ color: 'white' }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: 14, right: 18, zIndex: 1 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#71717a" />
            </TouchableOpacity>
        </View>

        {/* Error Message */}
        {errorMessage ? (
            <Text className="text-rose-500 text-xs text-center font-medium">{errorMessage}</Text>
        ) : null}

        {/* Sign Up Button */}
        <TouchableOpacity 
            onPress={handleSignUp}
            disabled={isLoading}
            className="w-full bg-[#FF296D] rounded-full py-4 flex-row items-center justify-center shadow-lg shadow-rose-500/30 mt-1"
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-bold text-[16px] tracking-wide">Sign Up</Text>
            )}
        </TouchableOpacity>
    </View>
  );
};

export default SignupForm;
