import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import { metal } from '../theme';

type Props = {
  size?: number;
  /** chrome 톤 — 'silver' (밝은 메탈) 또는 'graphite' (어두운 메탈) */
  tone?: 'silver' | 'graphite';
  children?: React.ReactNode;
};

/**
 * 작은 메탈 chrome 캡. zo 레퍼런스의 "↑" 화살표 버튼 톤.
 * 가운데 아이콘 자리 슬롯.
 */
export const MetalChip: React.FC<Props> = ({ size = 56, tone = 'silver', children }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const isSilver = tone === 'silver';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          {isSilver ? (
            <LinearGradient id="chipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={metal.highlight} />
              <Stop offset="35%" stopColor={metal.light} />
              <Stop offset="70%" stopColor={metal.shade} />
              <Stop offset="100%" stopColor={metal.shadow} />
            </LinearGradient>
          ) : (
            <LinearGradient id="chipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={metal.housingTop} />
              <Stop offset="100%" stopColor={metal.housingBottom} />
            </LinearGradient>
          )}
          <RadialGradient id="chipHighlight" cx="50%" cy="25%" r="50%" fx="50%" fy="15%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isSilver ? '0.65' : '0.18'} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="chipEdge" cx="50%" cy="50%" r="50%">
            <Stop offset="70%" stopColor="#000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </RadialGradient>
        </Defs>
        {/* 어두운 outline (살짝 깊이) */}
        <Circle cx={cx} cy={cy} r={r + 1} fill="#000" opacity={0.7} />
        {/* 메탈 베이스 */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#chipGrad)" />
        {/* 위쪽 highlight */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#chipHighlight)" />
        {/* 가장자리 어두움 */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#chipEdge)" />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
