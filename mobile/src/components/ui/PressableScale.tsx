import React from 'react';
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';

type Props = PressableProps & {
  pressScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Pressable + 부드러운 scale 피드백.
 * (moti 의존 제거 — React 19 호환 이슈로 단순한 Pressable opacity feedback으로 대체)
 */
export const PressableScale: React.FC<Props> = ({
  pressScale = 0.97,
  style,
  children,
  ...rest
}) => (
  <Pressable {...rest}>
    {({ pressed }) => (
      <View
        style={[
          { transform: [{ scale: pressed ? pressScale : 1 }], opacity: pressed ? 0.95 : 1 },
          style,
        ]}
      >
        {children}
      </View>
    )}
  </Pressable>
);
