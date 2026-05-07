import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  accent: string;
  size?: number;
  paddingH?: number;
  paddingV?: number;
  radius?: number;
  children?: React.ReactNode;
};

/**
 * 솔리드 컬러 + 위쪽 흰빛 highlight + 사방 컬러 그림자 — 젤리 알약.
 */
export const ColorPill: React.FC<Props> = ({
  accent,
  size,
  paddingH,
  paddingV,
  radius,
  children,
}) => {
  const r = radius ?? (size ? size / 2 : 999);

  return (
    <View
      style={[
        size ? { width: size, height: size } : null,
        paddingH ? { paddingHorizontal: paddingH } : null,
        paddingV ? { paddingVertical: paddingV } : null,
        {
          borderRadius: r,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: accent,
          shadowColor: accent,
          shadowOpacity: 0.6,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
      ]}
    >
      {/* 위쪽 흰빛 highlight — 젤리 광택 */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { height: '60%' }]}
      />
      {/* 상단 1px hairline */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 6,
          right: 6,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.7)',
        }}
      />
      {/* 하단 옅은 reflection */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8 }}
      />
      {children}
    </View>
  );
};

