import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './PressableScale';
import { colors, glass, radius, space } from '../../theme';

type Variant = 'primary' | 'glass' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type IconCmp = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconCmp;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
};

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  fullWidth,
  style,
}) => {
  const sized = size === 'lg' ? styles.lg : styles.md;
  const labelColor = variant === 'ghost' ? colors.text : '#FFFFFF';
  const iconSize = size === 'lg' ? 18 : 16;

  const Inner = (
    <View style={[styles.inner, sized]}>
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <>
          {Icon && <Icon size={iconSize} color={labelColor} strokeWidth={2} />}
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </>
      )}
    </View>
  );

  // Primary — 카드 스타일 (가운데 투명 + 가장자리 컬러 inner glow + 컬러 그림자)
  if (variant === 'primary') {
    const accent = colors.primary;
    const glow = hexToRgba(accent, 0.85);
    const glowFaint = hexToRgba(accent, 0);
    const eV = 14;
    const eH = 30;

    return (
      <PressableScale
        onPress={disabled || loading ? undefined : onPress}
        style={[fullWidth && { width: '100%' }, disabled && { opacity: 0.5 }, style]}
      >
        <View
          style={[
            styles.coloredShadow,
            { shadowColor: accent, borderRadius: radius.pill },
          ]}
        >
          <View style={styles.cardWrap}>
            {/* 4방향 컬러 inner glow */}
            <LinearGradient
              pointerEvents="none"
              colors={[glow, glowFaint]}
              locations={[0, 0.85]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: eV, borderTopLeftRadius: radius.pill, borderTopRightRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glowFaint, glow]}
              locations={[0.15, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: eV, borderBottomLeftRadius: radius.pill, borderBottomRightRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glow, glowFaint]}
              locations={[0, 0.85]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: eH, borderTopLeftRadius: radius.pill, borderBottomLeftRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glowFaint, glow]}
              locations={[0.15, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: eH, borderTopRightRadius: radius.pill, borderBottomRightRadius: radius.pill }}
            />
            {/* 위쪽 hairline highlight */}
            <View pointerEvents="none" style={styles.hairline} />
            {Inner}
          </View>
        </View>
      </PressableScale>
    );
  }

  // Danger — primary와 동일 패턴이지만 빨강
  if (variant === 'danger') {
    const accent = colors.danger;
    const glow = hexToRgba(accent, 0.85);
    const glowFaint = hexToRgba(accent, 0);
    const eV = 14;
    const eH = 30;

    return (
      <PressableScale
        onPress={disabled || loading ? undefined : onPress}
        style={[fullWidth && { width: '100%' }, disabled && { opacity: 0.5 }, style]}
      >
        <View style={[styles.coloredShadow, { shadowColor: accent, borderRadius: radius.pill }]}>
          <View style={styles.cardWrap}>
            <LinearGradient
              pointerEvents="none"
              colors={[glow, glowFaint]}
              locations={[0, 0.85]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: eV, borderTopLeftRadius: radius.pill, borderTopRightRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glowFaint, glow]}
              locations={[0.15, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: eV, borderBottomLeftRadius: radius.pill, borderBottomRightRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glow, glowFaint]}
              locations={[0, 0.85]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: eH, borderTopLeftRadius: radius.pill, borderBottomLeftRadius: radius.pill }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[glowFaint, glow]}
              locations={[0.15, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: eH, borderTopRightRadius: radius.pill, borderBottomRightRadius: radius.pill }}
            />
            <View pointerEvents="none" style={styles.hairline} />
            {Inner}
          </View>
        </View>
      </PressableScale>
    );
  }

  if (variant === 'glass') {
    return (
      <PressableScale
        onPress={disabled || loading ? undefined : onPress}
        style={[fullWidth && { width: '100%' }, disabled && { opacity: 0.5 }, style]}
      >
        <View style={styles.glassWrap}>
          <BlurView intensity={glass.blur.regular} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint.thick }]} />
          <View style={styles.glassBorder} pointerEvents="none" />
          {Inner}
        </View>
      </PressableScale>
    );
  }

  // Ghost
  return (
    <PressableScale
      onPress={disabled || loading ? undefined : onPress}
      style={[fullWidth && { width: '100%' }, disabled && { opacity: 0.5 }, style]}
    >
      <View style={styles.ghost}>{Inner}</View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  md: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
  },
  lg: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md + 2,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // 사방으로 퍼지는 컬러 글로우 — offset 0
  coloredShadow: {
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardWrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: radius.pill,
  },
  glassWrap: {
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
});
