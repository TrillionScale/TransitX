import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { radius, space } from '../../theme';
import { useDynamicColors } from '../../state/useThemeMode';

type IconCmp = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

type Props = {
  icon: IconCmp;
  title: string;
  message?: string;
  cta?: { label: string; onPress: () => void; icon?: IconCmp };
};

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, message, cta }) => {
  const dyn = useDynamicColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon size={26} color={dyn.textOnLightMuted} strokeWidth={1.6} />
      </View>
      <Text style={[styles.title, { color: dyn.textOnLight }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: dyn.textOnLightMuted }]}>{message}</Text>}
      {cta && (
        <View style={styles.cta}>
          <Button label={cta.label} icon={cta.icon} onPress={cta.onPress} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,17,22,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: space.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  cta: {
    marginTop: space.xl,
  },
});
