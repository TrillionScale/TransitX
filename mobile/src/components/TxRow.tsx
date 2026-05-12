import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { Tx } from '../types';
import { colors, radius, space } from '../theme';
import { formatAmount, fullDateTime, shortAddr } from '../format';
import { BlurFill } from './ui';

const EXPLORER_TX = 'https://testnet.xrpl.org/transactions/';

type Props = {
  tx: Tx;
  showSigner?: boolean;
};

// 상호명 → 이모지 + 카테고리 색상
const resolveIcon = (merchant: string): { emoji: string; color: string } => {
  const m = merchant.toLowerCase();
  if (m.includes('starbucks') || m.includes('스타벅스') || m.includes('coffee') || m.includes('카페') || m.includes('커피'))
    return { emoji: '☕', color: '#1E3932' };
  if (m.includes('metro') || m.includes('subway') || m.includes('지하철') || m.includes('mrt') || m.includes('transit') || m.includes('train') || m.includes('rail'))
    return { emoji: '🚇', color: '#1A3A6C' };
  if (m.includes('taxi') || m.includes('카카오t') || m.includes('uber') || m.includes('grab'))
    return { emoji: '🚕', color: '#2D2000' };
  if (m.includes('bus') || m.includes('버스'))
    return { emoji: '🚌', color: '#1A3A6C' };
  if (m.includes('hotel') || m.includes('hyatt') || m.includes('marriott') || m.includes('hilton') || m.includes('숙박'))
    return { emoji: '🏨', color: '#2A1A3E' };
  if (m.includes('airport') || m.includes('lounge') || m.includes('공항') || m.includes('air') || m.includes('fly'))
    return { emoji: '✈️', color: '#0A1F3A' };
  if (m.includes('restaurant') || m.includes('dinner') || m.includes('lunch') || m.includes('sushi') || m.includes('ramen') || m.includes('레스토랑') || m.includes('다이닝') || m.includes('식당') || m.includes('ginza') || m.includes('izakaya'))
    return { emoji: '🍽️', color: '#3A1A0A' };
  if (m.includes('convenience') || m.includes('gs25') || m.includes('7-eleven') || m.includes('편의점') || m.includes('lawson') || m.includes('family mart'))
    return { emoji: '🏪', color: '#1A2A1A' };
  if (m.includes('cgv') || m.includes('cinema') || m.includes('movie') || m.includes('영화'))
    return { emoji: '🎬', color: '#1A0A2A' };
  if (m.includes('coupang') || m.includes('amazon') || m.includes('쿠팡') || m.includes('shopping') || m.includes('mall'))
    return { emoji: '📦', color: '#2A1500' };
  if (m.includes('olive') || m.includes('pharmacy') || m.includes('drugstore') || m.includes('올리브영'))
    return { emoji: '💊', color: '#1A2A1A' };
  if (m.includes('wework') || m.includes('office') || m.includes('cowork') || m.includes('workspace'))
    return { emoji: '🏢', color: '#0A1A2A' };
  if (m.includes('burger') || m.includes('mcdonald') || m.includes('맥') || m.includes('fastfood'))
    return { emoji: '🍔', color: '#3A1500' };
  if (m.includes('sport') || m.includes('gym') || m.includes('fitness'))
    return { emoji: '🏋️', color: '#1A2A1A' };
  return { emoji: '💳', color: '#1A1A2A' };
};

const ICON_SIZE = 42;

export const TxRow: React.FC<Props> = ({ tx, showSigner }) => {
  const { emoji, color } = resolveIcon(tx.merchant);

  const openExplorer = () => {
    Linking.openURL(EXPLORER_TX + tx.hash).catch(() => {});
  };

  const content = (
    <View style={styles.row}>
      {/* 아이콘 — 머천트별 색상 + 이모지 */}
      <View style={[styles.iconWrap, { shadowColor: color === '#1A3A6C' ? '#4A7AFF' : '#000' }]}>
        <BlurFill
          intensity={25}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
        {/* 카테고리 색상 틴트 */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius.pill, backgroundColor: color + 'CC' }]} />
        {/* 상단 하이라이트 */}
        <View pointerEvents="none" style={styles.iconHighlight} />
        <View pointerEvents="none" style={styles.iconBorder} />
        <Text style={styles.iconEmoji}>{emoji}</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.merchantRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {tx.merchant}
          </Text>
          {tx.real && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>XRPL</Text>
            </View>
          )}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {fullDateTime(tx.timestamp)}
          {tx.real
            ? ` · ${tx.hash.slice(0, 8)}…${tx.hash.slice(-4)}`
            : showSigner && tx.signer
              ? ` · ${shortAddr(tx.signer)}`
              : ''}
        </Text>
      </View>

      <View style={styles.amounts}>
        <Text style={styles.amountKrw}>−{formatAmount(tx.amountKrw, 'KRW')}</Text>
        {tx.real ? (
          <View style={styles.explorerHint}>
            <ExternalLink size={11} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.explorerHintText}>Explorer</Text>
          </View>
        ) : (
          <Text style={styles.amountUsd}>{formatAmount(tx.amountUsd, 'USD')}</Text>
        )}
      </View>
    </View>
  );

  if (tx.real) {
    return (
      <Pressable onPress={openExplorer} style={({ pressed }) => pressed && { opacity: 0.6 }}>
        {content}
      </Pressable>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: space.md,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.40,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    flexShrink: 0,
  },
  iconHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ICON_SIZE / 2,
    borderTopLeftRadius: ICON_SIZE / 2,
    borderTopRightRadius: ICON_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  iconBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  iconEmoji: {
    fontSize: 20,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  merchant: {
    color: colors.textOnGlass,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(74,122,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74,122,255,0.45)',
  },
  liveBadgeText: {
    color: '#7DA0FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sub: {
    color: colors.textOnGlassFaint,
    fontSize: 11,
    fontWeight: '500',
  },
  amounts: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amountKrw: {
    color: colors.textOnGlass,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  amountUsd: {
    color: colors.textOnGlassFaint,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  explorerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  explorerHintText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
