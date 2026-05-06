import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ArrowUpRight } from 'lucide-react-native';
import { Tx } from '../types';
import { colors, radius, space } from '../theme';
import { formatAmount, relativeTime, shortAddr } from '../format';

type Props = {
  tx: Tx;
  showSigner?: boolean;
};

const ICON_SIZE = 38;

export const TxRow: React.FC<Props> = ({ tx, showSigner }) => (
  <View style={styles.row}>
    {/* 글래스 한 겹 더 — 카드 위에 떠있는 작은 젤리 */}
    <View style={styles.iconWrap}>
      <BlurView
        intensity={28}
        tint="light"
        style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
      />
      <Svg
        width={ICON_SIZE}
        height={ICON_SIZE}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="txDark" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#141822" stopOpacity="0.30" />
            <Stop offset="60%" stopColor="#141822" stopOpacity="0.16" />
            <Stop offset="100%" stopColor="#141822" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="txWhite" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={ICON_SIZE}
          height={ICON_SIZE}
          rx={ICON_SIZE / 2}
          ry={ICON_SIZE / 2}
          fill="url(#txDark)"
        />
        <Rect
          x="0"
          y="0"
          width={ICON_SIZE}
          height={ICON_SIZE}
          rx={ICON_SIZE / 2}
          ry={ICON_SIZE / 2}
          fill="url(#txWhite)"
        />
      </Svg>
      <View pointerEvents="none" style={styles.iconBorder} />
      <ArrowUpRight size={18} color="#FFFFFF" strokeWidth={1.8} />
    </View>

    <View style={styles.middle}>
      <Text style={styles.merchant} numberOfLines={1}>
        {tx.merchant}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {relativeTime(tx.timestamp)}
        {showSigner && tx.signer ? ` · ${shortAddr(tx.signer)}` : ''}
      </Text>
    </View>

    <View style={styles.amounts}>
      <Text style={styles.amountKrw}>−{formatAmount(tx.amountKrw, 'KRW')}</Text>
      <Text style={styles.amountUsd}>{formatAmount(tx.amountUsd, 'USD')}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  iconBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  middle: {
    flex: 1,
  },
  merchant: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  sub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  amounts: {
    alignItems: 'flex-end',
  },
  amountKrw: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  amountUsd: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
