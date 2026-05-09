import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radius as R } from '../../theme';

type Props = {
  radius?: keyof typeof R;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * 진한 네이비 다크 글라스 — 상단 흰빛 highlight + 하단 reflection.
 * 흰 텍스트 대비가 또렷해서 강조용 카드에 사용.
 */
export const DarkGlass: React.FC<Props> = ({ radius = 'lg', style, children }) => {
  const r = R[radius];
  return (
    <View style={[styles.root, { borderRadius: r }, style]}>
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: r, overflow: 'hidden' }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(10,14,30,0.72)' },
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
