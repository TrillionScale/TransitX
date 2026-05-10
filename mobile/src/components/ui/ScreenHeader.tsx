import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, space } from '../../theme';
import { BlurFill } from './BlurFill';

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

  return (
    <View style={styles.header}>
      <View style={styles.side}>{left}</View>

      {showCenter && (
        <View style={styles.centerWrap}>
          <View style={styles.shadow}>
            <View style={styles.capsule}>
              {/* 유리 배경 */}
              <BlurFill
                intensity={30}
                tint="light"
                style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
              />
              <View pointerEvents="none" style={styles.tint} />
              <View pointerEvents="none" style={styles.border} />
              <View pointerEvents="none" style={styles.hairlineTop} />

              {logo ? (
                /* ── TRANSITX 로고 모드 ── */
                <View style={styles.logoWrap}>
                  {/* 로고 배경 그라디언트 */}
                  <LinearGradient
                    colors={['rgba(40,90,220,0.18)', 'rgba(20,50,160,0.10)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
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
                  <Text style={styles.logoWordmark}>TRANSITX</Text>
                </View>
              ) : (
                /* ── 일반 텍스트 모드 ── */
                <View style={styles.content}>
                  {kicker && <Text style={styles.kicker}>{kicker}</Text>}
                  {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
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
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'Unbounded-Black',
  },
  logoWordmark: {
    fontFamily: 'Unbounded-Black',
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#0A1840',
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
