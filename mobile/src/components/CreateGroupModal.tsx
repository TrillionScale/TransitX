import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { api } from '../data/api';
import { Group } from '../types';
import { colors, radius, space } from '../theme';
import { useDynamicColors } from '../state/useThemeMode';
import { BackgroundCanvas, Button, IconButton } from './ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
};

const STEPS = ['풀 지갑 생성', 'TrustSet USD/KRW', '초기 충전', '권한 설정'];

export const CreateGroupModal: React.FC<Props> = ({ visible, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [usd, setUsd] = useState('100');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const dyn = useDynamicColors();

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setSubmitting(false);
      setStep(0);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!name.trim() || !usd) return;
    const usdNum = parseFloat(usd);
    if (Number.isNaN(usdNum) || usdNum <= 0) return;

    setSubmitting(true);
    setStep(0);

    // 단계별 로더 — mock 함수가 3000ms 걸리므로 4단계로 균등하게 750ms씩
    const stepTick = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 750);

    try {
      const group = await api.createGroup(name.trim(), usdNum);
      clearInterval(stepTick);
      setStep(STEPS.length - 1);
      // 잠깐 마지막 step 보여주고 닫기
      setTimeout(() => {
        setName('');
        setUsd('100');
        onCreated(group);
      }, 400);
    } catch {
      clearInterval(stepTick);
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
          <IconButton icon={X} onPress={submitting ? undefined : onClose} />
          <Text style={[styles.title, { color: dyn.textOnLight }]}>새 그룹 카드</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>

        {!submitting ? (
          <View style={styles.body}>
            <Text style={[styles.label, { color: dyn.textOnLightMuted }]}>그룹 이름</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="예: Acme Corp 출장 카드"
              placeholderTextColor={dyn.textOnLightFaint}
              style={[
                styles.input,
                { color: dyn.textOnLight, borderBottomColor: dyn.textOnLightFaint },
              ]}
              autoFocus
            />

            <Text style={[styles.label, { color: dyn.textOnLightMuted, marginTop: space.lg }]}>
              초기 충전 (USD)
            </Text>
            <View style={[styles.usdRow, { borderBottomColor: dyn.textOnLightFaint }]}>
              <Text style={[styles.usdSign, { color: dyn.textOnLight }]}>$</Text>
              <TextInput
                value={usd}
                onChangeText={setUsd}
                keyboardType="decimal-pad"
                style={[styles.usdInput, { color: dyn.textOnLight }]}
              />
            </View>
            <Text style={[styles.hint, { color: dyn.textOnLightMuted }]}>
              내 지갑에서 그룹 풀로 송금되며, 멤버 누구나 결제에 사용할 수 있습니다.
            </Text>
          </View>
        ) : (
          <View style={styles.body}>
            {STEPS.map((label, i) => (
              <View key={label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    i < step && styles.stepDotDone,
                    i === step && styles.stepDotActive,
                  ]}
                >
                  {i < step ? (
                    <Check size={14} color={colors.textInverse} strokeWidth={2.5} />
                  ) : i === step ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: dyn.textOnLightFaint },
                    i <= step && [styles.stepLabelActive, { color: dyn.textOnLight }],
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!submitting && (
          <View style={styles.footer}>
            <Button
              label="그룹 만들기"
              variant="success"
              fullWidth
              size="lg"
              onPress={handleCreate}
              disabled={!name.trim() || !usd}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  usdRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  usdSign: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginRight: space.xs,
  },
  usdInput: {
    flex: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: space.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepNum: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '700',
  },
  stepLabel: {
    color: colors.textFaint,
    fontSize: 15,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    paddingTop: space.md,
  },
});
