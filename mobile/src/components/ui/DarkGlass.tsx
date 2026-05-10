import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius as R } from '../../theme';
import { BlurFill } from './BlurFill';
import { useThemeMode } from '../../state/useThemeMode';

type Props = {
  radius?: keyof typeof R;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * 다크 글라스 — 라이트 배경 위에선 진한 네이비, 다크 배경 위에선 검정 톤.
 */
export const DarkGlass: React.FC<Props> = ({ radius = 'lg', style, children }) => {
  const r = R[radius];
  const { mode } = useThemeMode();
  // 다크모드도 완전 검정이 아니라 약간 네이비 톤 (희번뜩 줄이되 콘텐츠 가독성 유지)
  const baseColor = mode === 'dark' ? 'rgba(18,24,42,0.6)' : 'rgba(10,14,30,0.72)';
  return (
    <View style={[styles.root, { borderRadius: r }, style]}>
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: r, overflow: 'hidden' }]}>
        <BlurFill intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: baseColor },
          ]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24 }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16 }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.35)',
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
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
