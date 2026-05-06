import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Snowflake, UserMinus, Sun } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { TxRow } from '../components/TxRow';
import { MemberCard } from '../components/MemberCard';
import { useGroup } from '../state/useGroup';
import { useTxHistory } from '../state/useTxHistory';
import { RootStackParamList } from '../navigation';
import { colors, motion, space } from '../theme';
import { formatAmount } from '../format';
import { Screen, ScreenHeader, IconButton, Glass, Section, Row, Button } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberDetail'>;

export const MemberDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId, memberAddr } = route.params;
  const { findMember, freezeMember, removeMember } = useGroup(groupId);
  const { txs } = useTxHistory(groupId);

  const member = findMember(memberAddr);
  const [busy, setBusy] = useState<'freeze' | 'remove' | null>(null);

  if (!member) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const isFrozen = member.status === 'frozen';
  const memberTxs = txs.filter((t) => t.signer === memberAddr);

  const handleFreeze = () => {
    Alert.alert(
      isFrozen ? '권한 해제' : '권한 동결',
      isFrozen
        ? `${member.alias} 님의 결제 권한을 다시 활성화할까요?`
        : `${member.alias} 님이 그룹 풀에서 결제하지 못하게 동결할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: isFrozen ? '해제' : '동결',
          style: isFrozen ? 'default' : 'destructive',
          onPress: async () => {
            setBusy('freeze');
            try {
              await freezeMember(memberAddr);
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  const handleRemove = () => {
    Alert.alert(
      '멤버 퇴장',
      `${member.alias} 님을 그룹에서 영구 제거합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '퇴장',
          style: 'destructive',
          onPress: async () => {
            setBusy('remove');
            try {
              await removeMember(memberAddr);
              navigation.goBack();
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(member.address);
    Alert.alert('복사됨', '지갑 주소가 클립보드에 복사되었습니다');
  };

  return (
    <Screen>
      <ScreenHeader
        title="멤버 상세"
        left={<IconButton icon={ChevronLeft} onPress={() => navigation.goBack()} />}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 큰 컬러 카드 헤더 */}
        <View style={styles.heroWrap}>
          <MemberCard member={member} variant="large" />
        </View>

        {/* 정보 카드 (글래스) */}
        <View style={styles.infoWrap}>
          <Glass radius="lg" elevated style={styles.infoCard}>
            <Row label="지갑 주소" value={shortAddr(member.address)} onPress={handleCopy} />
            <View style={styles.divider} />
            <Row
              label="일 한도"
              value={
                member.dailyLimitKrw === 0 ? '무제한' : formatAmount(member.dailyLimitKrw, 'KRW')
              }
            />
            <View style={styles.divider} />
            <Row label="오늘 사용" value={formatAmount(member.spentTodayKrw, 'KRW')} />
          </Glass>
        </View>

        {/* 액션 — 권한 토글 / 퇴장 */}
        <View style={styles.actions}>
          <Button
            label={isFrozen ? '권한 해제' : '권한 동결'}
            icon={isFrozen ? Sun : Snowflake}
            variant="glass"
            loading={busy === 'freeze'}
            onPress={handleFreeze}
            style={{ flex: 1 }}
          />
          <Button
            label="퇴장"
            icon={UserMinus}
            variant="danger"
            loading={busy === 'remove'}
            onPress={handleRemove}
            style={{ flex: 1 }}
          />
        </View>

        {/* 사용 내역 */}
        <Section title="사용 내역">
          <Glass radius="lg" elevated style={styles.txCard}>
            {memberTxs.length === 0 ? (
              <Text style={styles.empty}>이 멤버의 결제 내역이 없습니다</Text>
            ) : (
              memberTxs.map((tx, i) => (
                <View key={tx.hash}>
                  {i > 0 && <View style={styles.divider} />}
                  <TxRow tx={tx} />
                </View>
              ))
            )}
          </Glass>
        </Section>
      </ScrollView>
    </Screen>
  );
};

const shortAddr = (a: string) => (a.length <= 12 ? a : `${a.slice(0, 6)}…${a.slice(-6)}`);

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.xxl * 2,
  },
  heroWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  infoWrap: {
    paddingHorizontal: space.lg,
  },
  infoCard: {
    paddingHorizontal: space.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginTop: space.lg,
  },
  txCard: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  empty: {
    color: colors.textFaint,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: space.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
