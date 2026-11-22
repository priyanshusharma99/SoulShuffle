import React from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlertModal({ config, onClose }: { config: AlertConfig; onClose: () => void }) {
  const isDark = useColorScheme() === 'dark';

  if (!config.visible) return null;

  const bg = isDark ? '#1C1622' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#0F172A';
  const subText = isDark ? '#9CA3AF' : '#475569';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const titleLower = (config.title || '').toLowerCase();
  const isSuccess = config.type === 'success' ||
                    titleLower.includes('success') ||
                    titleLower.includes('sent') ||
                    titleLower.includes('copi') ||
                    titleLower.includes('completed') ||
                    titleLower.includes('confirmed');

  const isDanger = config.type === 'danger' ||
                   config.type === 'error' ||
                   titleLower.includes('leave') ||
                   titleLower.includes('delete') ||
                   titleLower.includes('remove') ||
                   titleLower.includes('disconnect') ||
                   titleLower.includes('warning') ||
                   titleLower.includes('cancel');

  // Strip leading warning emoji from title if icon already conveys warning
  const cleanTitle = config.title?.replace(/^⚠️\s*/, '').trim() || '';

  // Determine if buttons should be stacked (when either label is long)
  const confirmLabel = config.confirmText || 'OK';
  const cancelLabel = config.cancelText || 'Cancel';
  const shouldStack = Boolean(config.onCancel) && (confirmLabel.length > 11 || cancelLabel.length > 11);

  return (
    <Modal transparent visible={config.visible} animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.72)',
        paddingHorizontal: 20
      }}>
        <View style={{
          width: '100%',
          maxWidth: 380,
          backgroundColor: bg,
          borderRadius: 28,
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.6 : 0.15,
          shadowRadius: 24,
          elevation: 12
        }}>
          {/* Icon Badge */}
          <View style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: isSuccess
              ? 'rgba(16,185,129,0.12)'
              : (isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(255,41,109,0.12)'),
            borderWidth: 1.5,
            borderColor: isSuccess
              ? 'rgba(16,185,129,0.3)'
              : (isDanger ? 'rgba(239,68,68,0.3)' : 'rgba(255,41,109,0.3)'),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Ionicons
              name={isSuccess ? 'checkmark-circle' : (isDanger ? 'warning' : 'information-circle')}
              size={30}
              color={isSuccess ? '#10B981' : (isDanger ? '#EF4444' : '#FF296D')}
            />
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: text,
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: -0.3
          }}>
            {cleanTitle}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 14,
            color: subText,
            textAlign: 'center',
            lineHeight: 21,
            marginBottom: 24,
            fontWeight: '400',
            paddingHorizontal: 4
          }}>
            {config.message}
          </Text>

          {/* Buttons Layout */}
          {shouldStack ? (
            <View style={{ width: '100%', flexDirection: 'column', gap: 10 }}>
              {/* Primary / Confirm action first with full width */}
              <TouchableOpacity
                style={{
                  width: '100%',
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: isDanger ? '#E11D48' : '#FF296D',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: isDanger ? '#E11D48' : '#FF296D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 3
                }}
                onPress={() => { onClose(); config.onConfirm?.(); }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 }}>
                  {confirmLabel}
                </Text>
              </TouchableOpacity>

              {/* Cancel / Safe action second */}
              <TouchableOpacity
                style={{
                  width: '100%',
                  paddingVertical: 13,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() => { onClose(); config.onCancel?.(); }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#E2E8F0' : '#475569' }}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              {config.onCancel && (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 16,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => { onClose(); config.onCancel?.(); }}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#E2E8F0' : '#475569' }}>
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 16,
                  backgroundColor: isDanger ? '#E11D48' : '#FF296D',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: isDanger ? '#E11D48' : '#FF296D',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 3
                }}
                onPress={() => { onClose(); config.onConfirm?.(); }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 }}>
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
