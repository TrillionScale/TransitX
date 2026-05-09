import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { space } from '../../theme';
import { useDynamicColors } from '../../state/useThemeMode';

type Props = {
  title?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const Section: React.FC<Props> = ({ title, right, style, children }) => {
  const dyn = useDynamicColors();
  return (
    <View style={[styles.root, style]}>
      {(title || right) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, { color: dyn.textOnLight }]}>{title}</Text>}
          <View style={{ flex: 1 }} />
          {right}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
