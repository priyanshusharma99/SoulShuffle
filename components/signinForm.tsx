import { Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { signIn, forgotPassword, resetPassword, googleLogin, appleLogin } from '../services/authService'
import { useRouter } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import * as AppleAuthentication from 'expo-apple-authentication'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SigninForm = () => {
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
        const [showPassword, setShowPassword] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [errorMessage, setErrorMessage] = useState('')
        const router = useRouter()
        const colorScheme = useColorScheme()
        const isDark = colorScheme === 'dark'

        const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false)
        const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1 = email, 2 = otp + new password
        const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
        const [otp, setOtp] = useState('')
        const [newPassword, setNewPassword] = useState('')
        const [isSubmitting, setIsSubmitting] = useState(false)
        const [rememberMe, setRememberMe] = useState(true)

        // Load saved remember-me preference on mount
        useEffect(() => {
          const loadRememberMe = async () => {
            try {
              const saved = await AsyncStorage.getItem('rememberMe');
              // Default to true if never set
              if (saved !== null) setRememberMe(saved === 'true');
            } catch {}
          };
          loadRememberMe();
        }, []);

        const handleGoogleLogin = async () => {
          try {
            setIsLoading(true);
            setErrorMessage('');
            
            // Lazily require to prevent crashing Expo Go
            const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');

            // Configure here instead of top-level
            GoogleSignin.configure({
              webClientId: '950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com',
              iosClientId: '950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com',
              offlineAccess: false,
            });
            
            // Initiate Native Google Sign-in
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;

            if (idToken) {
              await googleLogin(idToken);
              await AsyncStorage.setItem('rememberMe', 'true');
              // @ts-ignore
              router.replace('/(tabs)');
            } else {
              throw new Error('Google Sign-In failed: No ID Token returned');
            }
          } catch (error: any) {
            const { statusCodes } = require('@react-native-google-signin/google-signin');
            console.log('Google Sign-In Error:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
              // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              Alert.alert('Error', 'Google Play Services not available or outdated.');
            } else {
              const message = error?.response?.data?.message || error?.message || "Google Sign-In failed";
              Alert.alert("Login Failed", message);
              setErrorMessage(message);
            }
          } finally {
            setIsLoading(false);
          }
        };

        const handleSignIn = async () => {
            setErrorMessage('');
            if (!email || !password) {
                setErrorMessage("Please enter email and password");
                return;
            }
            try {
                setIsLoading(true);
                const data = await signIn(email, password);
                console.log('Sign in successful:', data);

                // Save remember-me preference
                await AsyncStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

                // @ts-ignore
                router.replace('/(tabs)');
            } catch (error: any) {
                console.log('Sign in error:', JSON.stringify(error?.response?.data || error?.message));
                const message = error?.response?.data?.message 
                  || error?.message 
                  || 'An unexpected error occurred';
                
                if (Platform.OS === 'web') {
                    setErrorMessage(message);
                } else {
                    Alert.alert("Login Failed", message);
                }
            } finally {
                setIsLoading(false);
            }
        }



        const handleAppleLogin = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');
                
                if (Platform.OS === 'web') {
                    setErrorMessage("Apple Sign-In is only supported on the mobile app.");
                    setIsLoading(false);
                    return;
                }
                
                const credential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                });
                
                const idToken = credential.identityToken;
                
                if (idToken) {
                    await appleLogin(idToken);
                    await AsyncStorage.setItem('rememberMe', 'true');
                    // @ts-ignore
                    router.replace('/(tabs)');
                } else {
                    throw new Error("Apple Sign-In failed: No Identity Token returned");
                }
            } catch (error: any) {
                if (error.code === 'ERR_REQUEST_CANCELED') {
                    // User canceled the sign-in flow
                } else {
                    console.log('Apple Sign-In Error:', error);
                    const message = error?.response?.data?.message || error?.message || "Apple Sign-In failed";
                    Alert.alert("Login Failed", message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        const handleForgotPassword = async () => {
            if (!forgotPasswordEmail) {
                Alert.alert("Error", "Please enter your email");
                return;
            }
            try {
                setIsSubmitting(true);
                await forgotPassword(forgotPasswordEmail);
                setForgotPasswordStep(2);
                Alert.alert("Success", "OTP sent to your email");
            } catch (error: any) {
                Alert.alert("Error", error?.response?.data?.message || "Failed to send OTP");
            } finally {
                setIsSubmitting(false);
            }
        }

        const handleResetPassword = async () => {
            if (!otp || !newPassword) {
                Alert.alert("Error", "Please enter OTP and new password");
                return;
            }
            try {
                setIsSubmitting(true);
                await resetPassword(forgotPasswordEmail, otp, newPassword);
                setForgotPasswordModalVisible(false);
                setForgotPasswordStep(1);
                setOtp('');
                setNewPassword('');
                Alert.alert("Success", "Password reset successfully! You can now log in.");
            } catch (error: any) {
                Alert.alert("Error", error?.response?.data?.message || "Failed to reset password");
            } finally {
                setIsSubmitting(false);
            }
        }
        return (
    <View className="w-full gap-y-3.5 px-6 mt-1">
        {/* Google & Apple Auth Row */}
        <View className="flex-row gap-x-3">
            <TouchableOpacity 
                onPress={handleGoogleLogin}
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

        {/* Email & Password */}
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

        {/* Forgot Password Link */}
        <View className="items-end px-2 mt-[-6px]">
            <TouchableOpacity onPress={() => setForgotPasswordModalVisible(true)}>
                <Text className="text-[#FF296D] text-xs font-medium">Forgot Password?</Text>
            </TouchableOpacity>
        </View>

        {/* Error Message */}
        {errorMessage ? (
            <Text className="text-rose-500 text-xs text-center font-medium">{errorMessage}</Text>
        ) : null}

        {/* Sign In Button */}
        <TouchableOpacity 
            onPress={handleSignIn}
            disabled={isLoading}
            className="w-full bg-[#FF296D] rounded-full py-4 flex-row items-center justify-center shadow-lg shadow-rose-500/30 mt-1"
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-bold text-[16px] tracking-wide">Sign In</Text>
            )}
        </TouchableOpacity>

        {/* Modal preserved */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={forgotPasswordModalVisible}
            onRequestClose={() => setForgotPasswordModalVisible(false)}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-[#1A1418] rounded-t-3xl p-6 pb-12">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-xl font-bold">Reset Password</Text>
                        <TouchableOpacity onPress={() => setForgotPasswordModalVisible(false)}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {forgotPasswordStep === 1 ? (
                        <>
                            <Text className="text-white/70 mb-4">Enter your email address to receive an OTP.</Text>
                            <TextInput
                                className="w-full bg-black/40 rounded-full px-6 py-4 text-white border border-white/10 mb-4"
                                placeholder="Email Address"
                                placeholderTextColor="#71717a"
                                value={forgotPasswordEmail}
                                onChangeText={setForgotPasswordEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity 
                                onPress={handleForgotPassword}
                                disabled={isSubmitting}
                                className="w-full bg-[#FF296D] rounded-full py-4 items-center justify-center"
                            >
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Send OTP</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TextInput
                                className="w-full bg-black/40 rounded-full px-6 py-4 text-white border border-white/10 mb-4"
                                placeholder="Enter OTP"
                                placeholderTextColor="#71717a"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                            />
                            <TextInput
                                className="w-full bg-black/40 rounded-full px-6 py-4 text-white border border-white/10 mb-6"
                                placeholder="New Password"
                                placeholderTextColor="#71717a"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity 
                                onPress={handleResetPassword}
                                disabled={isSubmitting}
                                className="w-full bg-[#FF296D] rounded-full py-4 items-center justify-center"
                            >
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Reset Password</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    </View>
  );
};

export default SigninForm;
