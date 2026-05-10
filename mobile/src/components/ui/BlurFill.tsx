import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: StyleProp<ViewStyle>;
  fallbackColor?: string;
  pointerEvents?: 'none' | 'box-none' | 'box-only' | 'auto';
};

export const BlurFill: React.FC<Props> = ({
  intensity = 20,
  tint = 'light',
  style,
  fallbackColor,
  pointerEvents,
}) => {
  if (Platform.OS === 'web') {
    const bg =
      fallbackColor ??
      (tint === 'dark' ? 'rgba(10,14,30,0.72)' : 'rgba(255,255,255,0.30)');
    const blurStyle = {
      backgroundColor: bg,
      backdropFilter: `blur(${intensity}px)`,
      WebkitBackdropFilter: `blur(${intensity}px)`,
    };
    return (
      <View
        pointerEvents={pointerEvents ?? 'none'}
        style={[style, blurStyle as any]}
      />
    );
  }
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={StyleSheet.flatten(style)}
      pointerEvents={pointerEvents}
    />
  );
};
