import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import SigninForm from '@/components/signinForm'
import SignupForm from '@/components/signupForm'

const index = () => {
  const [mode, setMode] = useState('signin')

  return (
    <View className='flex-1 bg-rose-50'>
      {mode === 'signin' ? <SigninForm /> : <SignupForm />}
      <View className="flex-row justify-center mt-auto mb-6">
        <Text className="text-slate-500 font-medium">{mode === 'signin' ? "Don't have an account? " : "Already have an account? "}</Text>
        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text className="text-rose-500 font-extrabold">{mode === 'signin' ? "Sign Up" : "Sign In"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default index