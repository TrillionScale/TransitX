import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radius as R } from '../../theme';

type Variant = 'thin' | 'regular' | 'thick';

type Props = {
  variant?: Variant;
  radius?: keyof typeof R;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * 가운데 어둡고 가장자리 투명. 동그란 자국 없이 부드럽게.
 * 흰 텍스트 위에서 잘 보이는 다크 글라스.
 */
export const Glass: React.FC<Props> = ({
  variant = 'regular',
  radius = 'lg',
  elevated = true,
  style,
  children,
}) => {
  const r = R[radius];
  const centerAlpha =
    variant === 'thin' ? 0.10 : variant === 'thick' ? 0.24 : 0.16;

  return (
    <View
      style={[
        styles.root,
        { borderRadius: r },
        elevated && shadowStyles.glass,
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { borderRadius: r, overflow: 'hidden' }]}
      >
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />

        {/* 가운데만 옅게 어둡게 — 반투명 떠있는 느낌 */}
        <LinearGradient
          colors={[
            'rgba(20,24,34,0)',
            `rgba(20,24,34,${centerAlpha})`,
            'rgba(20,24,34,0)',
          ]}
          locations={[0.1, 0.5, 0.9]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* 상단 highlight — 빛 떨어지는 가장자리 */}
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 22,
          }}
        />
        {/* 상단 1px hairline */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.85)',
          }}
        />

        {/* 하단 highlight — 아래쪽 반사광 */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 18,
          }}
        />
        {/* 하단 1px hairline */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }}
        />
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
});

const shadowStyles = StyleSheet.create({
  glass: {
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
