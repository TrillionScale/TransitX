import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Carousel from 'react-native-reanimated-carousel';
import { Moon, Settings, Sun } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { CardItem } from '../components/CardItem';
import { useCards } from '../state/useCards';
import { useThemeMode } from '../state/useThemeMode';
import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { Screen, ScreenHeader, IconButton } from '../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 활성 카드 폭 — 화면의 76%. 양옆에 peek 확보.
const CARD_W = SCREEN_W * 0.76;
// 비율 1.4 — 길쭉. 화면 높이 65% cap
const CARD_H = Math.min(CARD_W * 1.4, SCREEN_H * 0.65);

export const CardListScreen: React.FC = () => {
  const { cards, loading, error } = useCards();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation<Nav>();
  const { mode, toggle } = useThemeMode();

  return (
    <Screen>
      <ScreenHeader
        kicker="Manage"
        title="Your Cards"
        left={
          <IconButton icon={Settings} onPress={() => navigation.navigate('Workspace', {})} />
        }
        right={
          <IconButton icon={mode === 'dark' ? Sun : Moon} onPress={toggle} />
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <View style={styles.carouselWrap}>
          <Carousel
            loop={false}
            width={SCREEN_W}
            height={CARD_H}
            data={cards}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 1,
              parallaxScrollingOffset: (SCREEN_W - CARD_W) - 16,
              parallaxAdjacentItemScale: 0.86,
            }}
            onSnapToItem={setActiveIndex}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <View style={styles.slidePressable}>
                  <CardItem
                    card={item}
                    variant="portrait"
                    onPress={() =>
                      navigation.navigate('CardDetail', { cardId: item.id })
                    }
                  />
                </View>
              </View>
            )}
          />

          <View style={styles.indicatorShadow}>
            <View style={styles.indicatorCapsule}>
              <BlurView
                intensity={30}
                tint="light"
                style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
              />
              <View pointerEvents="none" style={styles.indicatorTint} />
              <View pointerEvents="none" style={styles.indicatorBorder} />
              <View pointerEvents="none" style={styles.indicatorHair} />
              <View style={styles.indicatorRow}>
                <Text
                  style={[
                    styles.counterText,
                    mode === 'dark' && { color: 'rgba(255,255,255,0.7)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.counterNum,
                      mode === 'dark' && { color: '#FFFFFF' },
                    ]}
                  >
                    {activeIndex + 1}
                  </Text>
                  <Text
                    style={[
                      styles.counterDivider,
                      mode === 'dark' && { color: 'rgba(255,255,255,0.4)' },
                    ]}
                  >
                    {'  /  '}
                  </Text>
                  <Text>{cards.length}</Text>
                </Text>
                <View
                  style={[
                    styles.divider,
                    mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.3)' },
                  ]}
                />
                <View style={styles.dots}>
                  {cards.map((c, i) => (
                    <View
                      key={c.id}
                      style={[
                        styles.dot,
                        mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.35)' },
                        i === activeIndex && styles.dotActive,
                        i === activeIndex && mode === 'dark' && { backgroundColor: '#FFFFFF' },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  carouselWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidePressable: {
    width: CARD_W,
    height: CARD_H,
  },
  indicatorShadow: {
    marginTop: space.xl,
    borderRadius: radius.pill,
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  indicatorCapsule: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  indicatorTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.pill,
  },
  indicatorBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  indicatorHair: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  counterText: {
    color: 'rgba(20,24,34,0.55)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  counterNum: {
    color: '#0A0E1A',
    fontWeight: '700',
  },
  counterDivider: {
    color: 'rgba(20,24,34,0.3)',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(20,24,34,0.2)',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(20,24,34,0.25)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
});
