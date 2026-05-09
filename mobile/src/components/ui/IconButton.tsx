import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PressableScale } from './PressableScale';
import { colors, radius } from '../../theme';

type Size = 'sm' | 'md' | 'lg';

type IconCmp = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

type Props = {
  icon: IconCmp;
  onPress?: () => void;
  size?: Size;
  primary?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

const sizes: Record<Size, { box: number; icon: number }> = {
  sm: { box: 32, icon: 14 },
  md: { box: 40, icon: 18 },
  lg: { box: 48, icon: 22 },
};

export const IconButton: React.FC<Props> = ({
  icon: Icon,
  onPress,
  size = 'md',
  primary,
  style,
  hitSlop = 12,
}) => {
  const { box, icon } = sizes[size];

  if (primary) {
    return (
      <PressableScale onPress={onPress} hitSlop={hitSlop} style={style}>
        <View
          style={[
            styles.primary,
            { width: box, height: box, borderRadius: radius.pill },
          ]}
        >
          <Icon size={icon} color="#FFFFFF" strokeWidth={2} />
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={onPress} hitSlop={hitSlop} style={style}>
      <View style={[styles.blueShadow, { width: box, height: box, borderRadius: radius.pill }]}>
      <View
        style={[
          styles.glassWrap,
          { width: box, height: box, borderRadius: radius.pill },
        ]}
      >
        <BlurView
          intensity={24}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
        {/* 가운데 다크, 가장자리 투명 (radial) + 가장자리 끝에 흰 ring */}
        <Svg
          width={box}
          height={box}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient id="ibgDark" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#141822" stopOpacity="0.22" />
              <Stop offset="60%" stopColor="#141822" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#141822" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="ibgWhite" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={box} height={box} rx={box / 2} ry={box / 2} fill="url(#ibgDark)" />
          <Rect x="0" y="0" width={box} height={box} rx={box / 2} ry={box / 2} fill="url(#ibgWhite)" />
        </Svg>
        {/* hairline border */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius.pill,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(255,255,255,0.55)',
            },
          ]}
        />
        <Icon size={icon} color="#FFFFFF" strokeWidth={1.8} />
      </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  glassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blueShadow: {
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  primary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
