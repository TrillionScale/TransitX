import React from 'react';
import { Platform, StyleSheet, View, ViewStyle, StyleProp, useWindowDimensions } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { BackgroundCanvas } from './BackgroundCanvas';

const MAX_PHONE_W = 430;

type Props = {
  edges?: readonly Edge[];
  noEnter?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const Screen: React.FC<Props> = ({ edges = ['top'], style, children }) => {
  const { width: WIN_W } = useWindowDimensions();
  const isPC = Platform.OS === 'web' && WIN_W > MAX_PHONE_W + 40;

  return (
    <View style={styles.root}>
      <BackgroundCanvas />
      {isPC ? (
        // PC: center phone content at 430px, show beautiful background on sides
        <View style={styles.pcOuter}>
          <View style={styles.pcFrame}>
            <SafeAreaView style={styles.safe} edges={edges}>
              <View style={[styles.flex, style]}>{children}</View>
            </SafeAreaView>
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.safe} edges={edges}>
          <View style={[styles.flex, style]}>{children}</View>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },

  // PC layout
  pcOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcFrame: {
    width: MAX_PHONE_W,
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  } as ViewStyle,
});
