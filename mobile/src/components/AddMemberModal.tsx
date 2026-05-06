import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, space } from '../theme';

type Props = {
  visible: boolean;
  groupId: string;
  onClose: () => void;
  onAdd: (groupId: string, address: string, alias: string) => Promise<void>;
};

export const AddMemberModal: React.FC<Props> = ({ visible, groupId, onClose, onAdd }) => {
  const [address, setAddress] = useState('');
  const [alias, setAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!address.trim() || !alias.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(groupId, address.trim(), alias.trim());
      setAddress('');
      setAlias('');
      Alert.alert('멤버 추가 완료', `${alias.trim()} 님이 그룹에 추가되었습니다`);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable hitSlop={12} style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={colors.text} strokeWidth={1.8} />
          </Pressable>
          <Text style={styles.title}>멤버 추가</Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            value={alias}
            onChangeText={setAlias}
            placeholder="예: 김수민"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus
          />

          <Text style={[styles.label, { marginTop: space.lg }]}>지갑 주소</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="rXrPL..."
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            추가된 멤버는 그룹 풀에서 결제할 수 있으며, 결제 내역이 그룹 거래 내역에 기록됩니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={!address.trim() || !alias.trim() || submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              (!address.trim() || !alias.trim()) && styles.submitDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.submitText}>추가하기</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  input: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: space.md,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    paddingTop: space.md,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  submitDisabled: {
    backgroundColor: colors.borderStrong,
  },
  submitText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
