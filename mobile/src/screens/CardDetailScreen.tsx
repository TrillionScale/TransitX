import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

import { CardItem } from '../components/CardItem';
import { TxRow } from '../components/TxRow';
import { useCards } from '../state/useCards';
import { useTxHistory } from '../state/useTxHistory';
import { Tx } from '../types';
import { RootStackParamList } from '../navigation';
import { colors, space } from '../theme';
import { Screen, ScreenHeader, IconButton, Glass, Section } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetail'>;

export const CardDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cardId } = route.params;
  const { cards } = useCards();
  const card = cards.find((c) => c.id === cardId);
  const { txs, loading } = useTxHistory(cardId);
  const sections = useMemo(() => groupByDay(txs), [txs]);

  if (!card) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title={card.kind === 'group' ? 'Group Card' : 'Personal Card'}
        left={<IconButton icon={ChevronLeft} onPress={() => navigation.goBack()} />}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <CardItem
            card={card}
            variant="large"
            onPress={() => navigation.navigate('Pay', { cardId })}
          />
        </View>

        <Text style={styles.hint}>탭해서 결제 시작</Text>

        <Section title="거래 내역">
          <Glass radius="lg" elevated style={styles.txCard}>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : sections.length === 0 ? (
              <Text style={styles.empty}>아직 거래가 없습니다</Text>
            ) : (
              sections.map(([day, dayTxs]) => (
                <View key={day}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  {dayTxs.map((tx, i) => (
                    <View key={tx.hash}>
                      {i > 0 && <View style={styles.divider} />}
                      <TxRow tx={tx} showSigner={card.kind === 'group'} />
                    </View>
                  ))}
                </View>
              ))
            )}
          </Glass>
        </Section>
      </ScrollView>
    </Screen>
  );
};

const dayLabelOf = (ts: number): string => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};

const groupByDay = (txs: Tx[]): Array<[string, Tx[]]> => {
  const map = new Map<string, Tx[]>();
  for (const tx of txs) {
    const k = dayLabelOf(tx.timestamp);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(tx);
  }
  return Array.from(map.entries());
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.xxl * 2,
    alignItems: 'stretch',
  },
  cardWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  hint: {
    textAlign: 'center',
    color: colors.textOnLightFaint,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: space.md,
  },
  txCard: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  loading: {
    paddingVertical: space.xl,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 13,
    paddingVertical: space.xxl,
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: space.md,
    marginBottom: space.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
