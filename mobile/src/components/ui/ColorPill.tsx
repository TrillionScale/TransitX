import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const hexToRgba = (hex: string, alpha: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
};

type Props = {
  accent: string;
  size?: number;
  paddingH?: number;
  paddingV?: number;
  radius?: number;
  children?: React.ReactNode;
};

/**
 * 카드 패턴의 작은 알약/원형 버튼.
 * 가운데 투명 + 4방향 컬러 inner glow + 사방 컬러 그림자.
 */
export const ColorPill: React.FC<Props> = ({
  accent,
  size,
  paddingH,
  paddingV,
  radius,
  children,
}) => {
  const glow = hexToRgba(accent, 0.85);
  const glowFaint = hexToRgba(accent, 0);
  const r = radius ?? (size ? size / 2 : 999);
  const eV = Math.min((size ?? 12), 14);
  const eH = Math.min((size ?? 18), 24);

  return (
    <View
      style={[
        size ? { width: size, height: size } : null,
        paddingH ? { paddingHorizontal: paddingH } : null,
        paddingV ? { paddingVertical: paddingV } : null,
        {
          borderRadius: r,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: accent,
          shadowOpacity: 0.55,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
      ]}
    >
      {/* 4방향 컬러 inner glow */}
      <LinearGradient
        pointerEvents="none"
        colors={[glow, glowFaint]}
        locations={[0, 0.85]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: eV }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[glowFaint, glow]}
        locations={[0.15, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: eV }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[glow, glowFaint]}
        locations={[0, 0.85]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: eH }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[glowFaint, glow]}
        locations={[0.15, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: eH }}
      />
      {/* 위쪽 hairline */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 8,
          right: 8,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.45)',
        }}
      />
      {children}
    </View>
  );
};

void StyleSheet;
