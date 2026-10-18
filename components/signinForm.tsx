import { Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { signIn, forgotPassword, resetPassword, appleLogin } from '../services/authService'
import { promptGoogleSignIn } from '../services/googleAuth'
import { useRouter } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomAlertModal, { AlertConfig } from '@/components/CustomAlertModal'

const SigninForm = () => {
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
        const [showPassword, setShowPassword] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [errorMessage, setErrorMessage] = useState('')
        const [alertConfig, setAlertConfig] = useState<AlertConfig>({ visible: false, title: '', message: '' })
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
            const success = await promptGoogleSignIn();
            if (success) {
              // @ts-ignore
              router.replace('/(tabs)');
            }
          } catch (error: any) {
            const message = error?.message || 'Google Sign-In failed';
            setAlertConfig({
              visible: true,
              title: 'Login Failed',
              message,
            });
            setErrorMessage(message);
          } finally {
            setIsLoading(false);
          }
        };

        const handleAppleLogin = async () => {
          try {
            setIsLoading(true);
            setErrorMessage('');
            const AppleAuthentication = require('expo-apple-authentication');
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
              setAlertConfig({
                visible: true,
                title: 'Apple Sign-In',
                message: 'Apple Sign-In is only supported on Apple devices (iOS).',
              });
              return;
            }

            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });

            if (credential.identityToken) {
              await appleLogin(credential.identityToken);
              await AsyncStorage.setItem('rememberMe', 'true');
              // @ts-ignore
              router.replace('/(tabs)');
            }
          } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED' || error.message?.includes('canceled') || error.message?.includes('cancelled')) {
              // User canceled Apple sign-in flow - smoothly do nothing
              return;
            } else {
              console.log('Apple Sign-In Error:', error);
              const message = error?.response?.data?.message || error?.message || 'Apple Sign-In failed';
              setAlertConfig({
                visible: true,
                title: 'Login Failed',
                message,
              });
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
                const data = await signIn(email, password, rememberMe);
                console.log('Sign in successful:', data);

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
                    setAlertConfig({
                        visible: true,
                        title: 'Sign In Failed',
                        message,
                    });
                }
            } finally {
                setIsLoading(false);
            }
        }

        const handleForgotPassword = async () => {
            if (!forgotPasswordEmail.trim()) {
                setAlertConfig({
                    visible: true,
                    title: "Email Required",
                    message: "Please enter your email address to receive an OTP code.",
                    type: "warning",
                });
                return;
            }
            try {
                setIsSubmitting(true);
                await forgotPassword(forgotPasswordEmail.trim());
                setForgotPasswordStep(2);
                setAlertConfig({
                    visible: true,
                    title: "OTP Dispatched",
                    message: `We've sent a 6-digit recovery code to ${forgotPasswordEmail.trim()}. Please check your inbox or spam folder.`,
                    type: "info",
                });
            } catch (error: any) {
                setAlertConfig({
                    visible: true,
                    title: "Reset Request Failed",
                    message: error?.response?.data?.message || "Failed to send recovery OTP. Please try again later.",
                    type: "error",
                });
            } finally {
                setIsSubmitting(false);
            }
        }

        const handleResetPassword = async () => {
            if (!otp.trim() || !newPassword) {
                setAlertConfig({
                    visible: true,
                    title: "Missing Information",
                    message: "Please enter both the 6-digit OTP and your new password.",
                    type: "warning",
                });
                return;
            }
            if (newPassword.length < 6) {
                setAlertConfig({
                    visible: true,
                    title: "Password Too Short",
                    message: "Your new password must be at least 6 characters long.",
                    type: "warning",
                });
                return;
            }
            try {
                setIsSubmitting(true);
                await resetPassword(forgotPasswordEmail.trim(), otp.trim(), newPassword);
                setForgotPasswordModalVisible(false);
                setForgotPasswordStep(1);
                setOtp('');
                setNewPassword('');
                setAlertConfig({
                    visible: true,
                    title: "Password Reset Complete",
                    message: "Your password has been reset successfully! You can now sign in with your new credentials.",
                    type: "success",
                });
            } catch (error: any) {
                setAlertConfig({
                    visible: true,
                    title: "Reset Failed",
                    message: error?.response?.data?.message || "Invalid or expired OTP code. Please try again.",
                    type: "error",
                });
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
                onPress={handleAppleLogin}
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
            animationType="fade"
            transparent={true}
            visible={forgotPasswordModalVisible}
            onRequestClose={() => setForgotPasswordModalVisible(false)}
            statusBarTranslucent={true}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        backgroundColor: 'rgba(0,0,0,0.75)', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        paddingHorizontal: 20
                    }}
                >
                    <TouchableOpacity 
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        activeOpacity={1} 
                        onPress={() => {
                            Keyboard.dismiss();
                            setForgotPasswordModalVisible(false);
                        }} 
                    />
                    <View 
                        style={{
                            width: '100%',
                            maxWidth: 380,
                            backgroundColor: '#1C151B',
                            borderRadius: 28,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.12)',
                            shadowColor: '#FF296D',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 24,
                            elevation: 25,
                            zIndex: 10
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-5">
                            <View>
                                <Text className="text-white text-xl font-bold tracking-tight">Reset Password</Text>
                                <Text className="text-white/50 text-xs mt-0.5">
                                    {forgotPasswordStep === 1 ? 'Step 1 of 2: Request OTP' : 'Step 2 of 2: Verify & Reset'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setForgotPasswordModalVisible(false);
                                }}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {forgotPasswordStep === 1 ? (
                            <ScrollView 
                                keyboardShouldPersistTaps="handled" 
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text className="text-white/70 mb-4 text-xs leading-5">
                                    Enter your registered email address and we will send you a 6-digit verification code.
                                </Text>
                                <View className="relative mb-5">
                                    <Ionicons name="mail-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 16, left: 18, zIndex: 1 }} />
                                    <TextInput
                                        className="w-full bg-black/50 rounded-full pl-12 pr-6 py-3.5 text-white border border-white/10 text-sm"
                                        placeholder="Email Address"
                                        placeholderTextColor="#71717a"
                                        value={forgotPasswordEmail}
                                        onChangeText={setForgotPasswordEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleForgotPassword}
                                    />
                                </View>
                                <TouchableOpacity 
                                    onPress={handleForgotPassword}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF296D] rounded-full py-4 items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-sm tracking-wide">Send OTP Code</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        ) : (
                            <ScrollView 
                                keyboardShouldPersistTaps="handled" 
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text className="text-white/70 mb-4 text-xs leading-5">
                                    Enter the 6-digit code sent to <Text className="text-white font-semibold">{forgotPasswordEmail}</Text> along with your new password.
                                </Text>
                                <View className="relative mb-3.5">
                                    <Ionicons name="key-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 16, left: 18, zIndex: 1 }} />
                                    <TextInput
                                        className="w-full bg-black/50 rounded-full pl-12 pr-6 py-3.5 text-white border border-white/10 text-sm"
                                        placeholder="6-Digit OTP Code"
                                        placeholderTextColor="#71717a"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="numeric"
                                        maxLength={6}
                                    />
                                </View>
                                <View className="relative mb-5">
                                    <Ionicons name="lock-closed-outline" size={18} color="#FF296D" style={{ position: 'absolute', top: 16, left: 18, zIndex: 1 }} />
                                    <TextInput
                                        className="w-full bg-black/50 rounded-full pl-12 pr-6 py-3.5 text-white border border-white/10 text-sm"
                                        placeholder="New Password (min 6 chars)"
                                        placeholderTextColor="#71717a"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry
                                        returnKeyType="done"
                                        onSubmitEditing={handleResetPassword}
                                    />
                                </View>
                                <TouchableOpacity 
                                    onPress={handleResetPassword}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF296D] rounded-full py-4 items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-sm tracking-wide">Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={() => setForgotPasswordStep(1)}
                                    className="w-full py-3 items-center justify-center mt-1"
                                >
                                    <Text className="text-white/50 text-xs">Didn't receive code? Change Email</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>

        <CustomAlertModal config={alertConfig} onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))} />
    </View>
  );
};

export default SigninForm;
