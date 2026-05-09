import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius, space } from '../../theme';
import { useThemeMode } from '../../state/useThemeMode';

type Props = {
  title?: string;
  kicker?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

/**
 * 헤더 알약 캡슐 — 작은 캡슐에 맞춘 가벼운 글래스 (RadialGradient X).
 * BlurView + 옅은 흰 tint + 미세 hairline border.
 */
export const ScreenHeader: React.FC<Props> = ({ title, kicker, left, right }) => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const titleColor = isDark ? '#FFFFFF' : '#0A0E1A';
  const kickerColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(20,24,34,0.55)';
  return (
    <View style={styles.header}>
      <View style={styles.side}>{left}</View>

      {(title || kicker) && (
        <View style={styles.centerWrap}>
          <View style={styles.shadow}>
            <View style={styles.capsule}>
              <BlurView
                intensity={30}
                tint="light"
                style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
              />
              <View pointerEvents="none" style={styles.tint} />
              <View pointerEvents="none" style={styles.border} />
              <View pointerEvents="none" style={styles.hairline} />
              <View style={styles.content}>
                {kicker && <Text style={[styles.kicker, { color: kickerColor }]}>{kicker}</Text>}
                {title && (
                  <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                    {title}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.sm,
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
  },
  // shadow는 외부에 (overflow:hidden 안 하므로)
  shadow: {
    borderRadius: radius.pill,
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  capsule: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    minHeight: 40,
    paddingHorizontal: space.xl,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.pill,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  content: {
    alignItems: 'center',
  },
  kicker: {
    color: 'rgba(20,24,34,0.55)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0E1A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
