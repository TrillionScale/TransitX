import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { PressableScale } from './PressableScale';
import { colors, space } from '../../theme';

type IconCmp = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

type Props = {
  label: string;
  value?: string;
  icon?: IconCmp;
  onPress?: () => void;
  showChevron?: boolean;
  rightSlot?: React.ReactNode;
};

/**
 * 표준 정보 row — 좌측 (옵션) 아이콘 + 라벨, 우측 값 + (옵션) chevron.
 * 정보 카드(Glass) 안에 여러 개 들어가는 용도.
 */
export const Row: React.FC<Props> = ({
  label,
  value,
  icon: Icon,
  onPress,
  showChevron,
  rightSlot,
}) => {
  const content = (
    <View style={styles.row}>
      {Icon && (
        <View style={styles.iconWrap}>
          <Icon size={16} color={colors.textOnGlassFaint} strokeWidth={1.8} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={styles.value}>{value}</Text>}
      {rightSlot}
      {showChevron && (
        <ChevronRight size={16} color={colors.textOnGlassDim} strokeWidth={1.8} />
      )}
    </View>
  );

  if (onPress) return <PressableScale onPress={onPress}>{content}</PressableScale>;
  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    gap: space.sm,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textOnGlassFaint,
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    color: colors.textOnGlass,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
