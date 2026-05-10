import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, space } from '../../theme';
import { BlurFill } from './BlurFill';
import { useThemeMode } from '../../state/useThemeMode';

type Props = {
  title?: string;
  kicker?: string;
  /** logo 모드: 캡슐 안에 TRANSITX 워드마크 */
  logo?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export const ScreenHeader: React.FC<Props> = ({ title, kicker, logo, left, right }) => {
  const showCenter = logo || title || kicker;
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const titleColor = isDark ? '#F5F7FF' : '#0A0E1A';
  const kickerColor = isDark ? 'rgba(245,247,255,0.6)' : 'rgba(20,24,34,0.55)';
  const wordmarkColor = isDark ? '#F5F7FF' : '#0A1840';

  return (
    <View style={styles.header}>
      <View style={styles.side}>{left}</View>

      {showCenter && (
        <View style={styles.centerWrap}>
          <View style={styles.shadow}>
            <View style={styles.capsule}>
              {/* 유리 배경 — 다크에서도 살짝 밝게 (텍스트 가독성 위해) */}
              <BlurFill
                intensity={30}
                tint={isDark ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.tint,
                  isDark && { backgroundColor: 'rgba(255,255,255,0.10)' },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.border,
                  isDark && { borderColor: 'rgba(255,255,255,0.22)' },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.hairlineTop,
                  isDark && { backgroundColor: 'rgba(255,255,255,0.45)' },
                ]}
              />

              {logo ? (
                /* ── TRANSITX 로고 모드 ── */
                <View style={styles.logoWrap}>
                  {/* TX 아이콘 마크 */}
                  <View style={styles.txMark}>
                    <LinearGradient
                      colors={['#4A80F0', '#2B5CE6', '#1A40CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.txMarkGrad}
                    />
                    <Text style={styles.txMarkText}>TX</Text>
                  </View>
                  {/* 워드마크 */}
                  <Text style={[styles.logoWordmark, { color: wordmarkColor }]}>
                    Transit<Text style={styles.logoX}>X</Text>
                  </Text>
                </View>
              ) : (
                /* ── 일반 텍스트 모드 ── */
                <View style={styles.content}>
                  {kicker && <Text style={[styles.kicker, { color: kickerColor }]}>{kicker}</Text>}
                  {title && (
                    <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                      {title}
                    </Text>
                  )}
                </View>
              )}
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
  shadow: {
    borderRadius: radius.pill,
    shadowColor: '#2B5CE6',
    shadowOpacity: 0.50,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  capsule: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    minHeight: 42,
    paddingHorizontal: space.lg,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: radius.pill,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.50)',
  },
  hairlineTop: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.70)',
  },

  // ── 로고 모드 ──────────────────────────────────────────────────
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  txMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMarkGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  txMarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'sans-serif' }),
  },
  logoWordmark: {
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  logoX: {
    fontWeight: '800',
    letterSpacing: 0,
  },

  // ── 일반 텍스트 모드 ───────────────────────────────────────────
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
