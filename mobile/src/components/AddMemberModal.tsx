import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { space } from '../theme';
import { useDynamicColors } from '../state/useThemeMode';
import { BackgroundCanvas, Button, IconButton } from './ui';

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
  const dyn = useDynamicColors();

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
        <BackgroundCanvas />
        <View style={styles.header}>
          <IconButton icon={X} onPress={onClose} />
          <Text style={[styles.title, { color: dyn.textOnLight }]}>멤버 추가</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>

        <View style={styles.body}>
          <Text style={[styles.label, { color: dyn.textOnLightMuted }]}>이름</Text>
          <TextInput
            value={alias}
            onChangeText={setAlias}
            placeholder="예: 김수민"
            placeholderTextColor={dyn.textOnLightFaint}
            style={[styles.input, { color: dyn.textOnLight, borderBottomColor: dyn.textOnLightFaint }]}
            autoFocus
          />

          <Text style={[styles.label, { color: dyn.textOnLightMuted, marginTop: space.lg }]}>
            지갑 주소
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="rXrPL..."
            placeholderTextColor={dyn.textOnLightFaint}
            style={[styles.input, { color: dyn.textOnLight, borderBottomColor: dyn.textOnLightFaint }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.hint, { color: dyn.textOnLightMuted }]}>
            추가된 멤버는 그룹 풀에서 결제할 수 있으며, 결제 내역이 그룹 거래 내역에 기록됩니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            label="추가하기"
            variant="success"
            fullWidth
            size="lg"
            loading={submitting}
            onPress={handleSubmit}
            disabled={!address.trim() || !alias.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  title: {
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  input: {
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: space.md,
    borderBottomWidth: 1,
  },
  hint: {
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
});
