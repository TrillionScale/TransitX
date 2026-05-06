import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { BackgroundCanvas } from './BackgroundCanvas';

type Props = {
  edges?: readonly Edge[];
  /** noEnter는 호환성 — 무시해도 됨 */
  noEnter?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * 모든 화면의 표준 wrapper.
 * - 다크 그라디언트 배경 + glow blob 자동
 * - SafeArea
 *
 * 등장 애니메이션은 RN Stack Navigator의 기본 transition에 맡김 (slide).
 * moti를 여기에서 쓰면 React 19 + moti 0.30 호환 이슈로 깨질 수 있어 제거.
 */
export const Screen: React.FC<Props> = ({ edges = ['top'], style, children }) => (
  <View style={styles.root}>
    <BackgroundCanvas />
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.flex, style]}>{children}</View>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
});
