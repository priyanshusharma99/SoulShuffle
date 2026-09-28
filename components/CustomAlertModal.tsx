import React from 'react';
import { Modal, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlertModal({ config, onClose }: { config: AlertConfig, onClose: () => void }) {
  const isDark = useColorScheme() === 'dark';
  
  if (!config.visible) return null;

  const bg = isDark ? '#1C1721' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#1F2937';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const shadow = isDark ? '#000' : '#FF296D';

  const isSuccess = config.title.toLowerCase().includes('success') || 
                    config.title.toLowerCase().includes('sent') || 
                    config.title.toLowerCase().includes('copi') ||
                    config.title.toLowerCase().includes('completed') ||
                    config.title.toLowerCase().includes('confirmed');

  return (
    <Modal transparent visible={config.visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={{
          width: '85%',
          backgroundColor: bg,
          borderRadius: 28,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: border,
          shadowColor: shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.6 : 0.1,
          shadowRadius: 20,
          elevation: 10
        }}>
          {isSuccess ? (
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(255,41,109,0.2)' : '#FFE4E6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={40} color="#FF296D" />
            </View>
          ) : (
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(225,29,72,0.2)' : '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="alert-circle" size={40} color="#E11D48" />
            </View>
          )}
          
          <Text style={{ fontSize: 22, fontWeight: '900', color: text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>{config.title}</Text>
          <Text style={{ fontSize: 15, color: subText, textAlign: 'center', lineHeight: 22, marginBottom: 24, fontWeight: '500' }}>{config.message}</Text>
          
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', gap: 12 }}>
            {config.onCancel && (
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: isDark ? '#2D2433' : '#F3F4F6', alignItems: 'center' }}
                onPress={() => { onClose(); config.onCancel?.(); }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#D1D5DB' : '#4B5563' }}>{config.cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FF296D', alignItems: 'center', shadowColor: '#FF296D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
              onPress={() => { onClose(); config.onConfirm?.(); }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: 'white', letterSpacing: 0.5 }}>{config.confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
