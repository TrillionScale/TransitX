import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  Globe, Zap, DollarSign, ChevronRight, ArrowLeftRight,
  Send, RefreshCw, CreditCard, Shield, Users, Network,
  User, Moon, Sun,
} from 'lucide-react-native';
import { CardItem } from '../components/CardItem';
import { TxRow } from '../components/TxRow';
import { useCards } from '../state/useCards';
import { useTxHistory } from '../state/useTxHistory';
import { useDynamicColors, useThemeMode } from '../state/useThemeMode';
import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { Screen, ScreenHeader, BlurFill, DarkGlass } from '../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CARD_RATIO = 1 / 1.586;
const MAX_PHONE_W = 430;
const MAX_CARD_W = 360;

// ── 글로벌 통화 ──────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'KRW', flag: '🇰🇷', symbol: '₩',   perUsd: 1371.0 },
  { code: 'JPY', flag: '🇯🇵', symbol: '¥',   perUsd: 152.3  },
  { code: 'USD', flag: '🇺🇸', symbol: '$',   perUsd: 1.0    },
  { code: 'EUR', flag: '🇪🇺', symbol: '€',   perUsd: 0.921  },
  { code: 'GBP', flag: '🇬🇧', symbol: '£',   perUsd: 0.788  },
  { code: 'SGD', flag: '🇸🇬', symbol: 'S$',  perUsd: 1.348  },
  { code: 'HKD', flag: '🇭🇰', symbol: 'HK$', perUsd: 7.831  },
  { code: 'AUD', flag: '🇦🇺', symbol: 'A$',  perUsd: 1.543  },
  { code: 'THB', flag: '🇹🇭', symbol: '฿',   perUsd: 35.7   },
  { code: 'CNY', flag: '🇨🇳', symbol: 'CN¥', perUsd: 7.242  },
  { code: 'INR', flag: '🇮🇳', symbol: '₹',   perUsd: 83.4   },
  { code: 'MYR', flag: '🇲🇾', symbol: 'RM',  perUsd: 4.71   },
];

// ── 글로벌 커버리지 도시 ─────────────────────────────────────────
const CITIES = [
  { flag: '🇰🇷', city: 'Seoul',     network: 'T-money' },
  { flag: '🇯🇵', city: 'Tokyo',     network: 'Suica'   },
  { flag: '🇬🇧', city: 'London',    network: 'Oyster'  },
  { flag: '🇺🇸', city: 'New York',  network: 'OMNY'    },
  { flag: '🇫🇷', city: 'Paris',     network: 'Navigo'  },
  { flag: '🇸🇬', city: 'Singapore', network: 'EZ-Link' },
  { flag: '🇦🇺', city: 'Sydney',    network: 'Opal'    },
  { flag: '🇩🇪', city: 'Berlin',    network: 'BVG'     },
  { flag: '🇭🇰', city: 'Hong Kong', network: 'Octopus' },
  { flag: '🇨🇳', city: 'Shanghai',  network: 'Metro'   },
];

const STATS = [
  { icon: Globe,      label: '이용 국가', value: '42',   color: '#7B95F4' },
  { icon: Zap,        label: '환전 속도', value: '<0.5s', color: '#5EE7A8' },
  { icon: DollarSign, label: '지원 통화', value: '100+', color: '#F4C56B' },
];

// ── 금액 포맷 ───────────────────────────────────────────────────
const fmtConverted = (usd: number, curr: typeof CURRENCIES[0]): string => {
  const amount = usd * curr.perUsd;
  if (curr.code === 'KRW' || curr.code === 'JPY' || curr.code === 'INR') {
    return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${curr.symbol}${amount.toFixed(2)}`;
};

export const CardListScreen: React.FC = () => {
  const { cards, loading, error } = useCards();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCcy, setSelectedCcy] = useState('KRW');
  const navigation = useNavigation<Nav>();
  const { mode, toggle } = useThemeMode();
  const dyn = useDynamicColors();
  const { width: WIN_W } = useWindowDimensions();

  const containerW = Platform.OS === 'web' ? Math.min(WIN_W, MAX_PHONE_W) : WIN_W;
  const cardW = Math.min(containerW * 0.86, MAX_CARD_W);
  const cardH = Math.round(cardW * CARD_RATIO);

  const activeCard = cards[activeIndex];
  const { txs } = useTxHistory(activeCard?.id ?? '');
  const recentTxs = txs.slice(0, 4);
  const selectedCurrData = CURRENCIES.find(c => c.code === selectedCcy) ?? CURRENCIES[0];

  return (
    <Screen>
      <ScreenHeader
        logo
        left={
          <Pressable
            onPress={() => navigation.navigate('Workspace', {})}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.72, transform: [{ scale: 0.93 }] }]}
          >
            <LinearGradient
              colors={['#7080FF', '#3D48E0', '#2028C0']}
              start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.06)', 'transparent']}
              locations={[0, 0.40, 1]}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              pointerEvents="none"
            />
            <View pointerEvents="none" style={styles.headerBtnRing} />
            <Users size={17} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        }
        right={
          <Pressable
            onPress={toggle}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.72, transform: [{ scale: 0.93 }] }]}
          >
            <LinearGradient
              colors={mode === 'dark'
                ? ['#3A2800', '#5C3E00', '#3A2800']
                : ['#1A1A38', '#2A2850', '#1A1A38']}
              start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.04)', 'transparent']}
              locations={[0, 0.38, 1]}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              pointerEvents="none"
            />
            <View pointerEvents="none" style={styles.headerBtnRing} />
            {mode === 'dark'
              ? <Sun size={17} color="#F4C56B" strokeWidth={2.5} />
              : <Moon size={17} color="#A0AAFF" strokeWidth={2.5} />}
          </Pressable>
        }
      />

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <View style={styles.pageBody}>

          {/* ── 카드 캐러셀 ── */}
          <View style={[styles.carouselBlock, { height: cardH + 52 }]}>
            <Carousel
              loop={false}
              width={containerW}
              height={cardH}
              data={cards}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 1,
                parallaxScrollingOffset: (containerW - cardW) - 10,
                parallaxAdjacentItemScale: 0.90,
              }}
              onSnapToItem={setActiveIndex}
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  <View style={{ width: cardW, height: cardH }}>
                    <CardItem
                      card={item}
                      variant="credit"
                      onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
                    />
                  </View>
                </View>
              )}
            />
            {/* 인디케이터 */}
            <View style={styles.indicatorWrap}>
              <View style={styles.indicatorCapsule}>
                <BlurFill intensity={30} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
                <View pointerEvents="none" style={styles.indTint} />
                <View pointerEvents="none" style={styles.indBorder} />
                <View pointerEvents="none" style={styles.indHair} />
                <View style={styles.indRow}>
                  <Text style={[styles.countTxt, mode === 'dark' && { color: 'rgba(255,255,255,0.7)' }]}>
                    <Text style={[styles.countNum, mode === 'dark' && { color: '#fff' }]}>{activeIndex + 1}</Text>
                    <Text style={[styles.countSep, mode === 'dark' && { color: 'rgba(255,255,255,0.4)' }]}>{'  /  '}</Text>
                    <Text>{cards.length}</Text>
                  </Text>
                  <View style={[styles.sep, mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.dots}>
                    {cards.map((c, i) => (
                      <View key={c.id} style={[
                        styles.dot,
                        mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.35)' },
                        i === activeIndex && styles.dotActive,
                        i === activeIndex && mode === 'dark' && { backgroundColor: '#fff' },
                      ]} />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ── 스크롤 콘텐츠 — 위/아래 alpha mask로 자연스럽게 사라짐 ── */}
          <MaskedView
            style={styles.scrollContent}
            maskElement={
              <LinearGradient
                colors={['transparent', '#000', '#000', 'transparent']}
                locations={[0, 0.04, 0.92, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >
          <ScrollView
            contentContainerStyle={styles.scrollPad}
            showsVerticalScrollIndicator={false}
          >
            {/* 초고속 환전 섹션 */}
            <View style={styles.sectionHead}>
              <View>
                <Text style={[styles.sectionTitle, { color: dyn.textOnLight }]}>초고속 환전</Text>
                <Text style={[styles.sectionSub, { color: dyn.textOnLightMuted }]}>
                  국가별 통화 즉시 변환 · 평균 0.3초
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>실시간</Text>
              </View>
            </View>

            {/* 통화 선택 칩 — 좌우 alpha mask 페이드 */}
            <MaskedView
              style={styles.ccyMaskWrap}
              maskElement={
                <LinearGradient
                  colors={['transparent', '#000', '#000', 'transparent']}
                  locations={[0, 0.05, 0.85, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              }
            >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ccyScroll}
            >
              {CURRENCIES.map((curr) => {
                const active = curr.code === selectedCcy;
                return (
                  <Pressable
                    key={curr.code}
                    onPress={() => setSelectedCcy(curr.code)}
                    style={({ pressed }) => [styles.ccyChip, active && styles.ccyChipActive, pressed && { opacity: 0.75 }]}
                  >
                    {active && (
                      <LinearGradient
                        colors={['#3B7FFF', '#1F52E0']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
                      />
                    )}
                    {!active && (
                      <BlurFill
                        intensity={20}
                        tint={mode === 'dark' ? 'dark' : 'light'}
                        style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
                      />
                    )}
                    {!active && mode === 'dark' && (
                      <View
                        pointerEvents="none"
                        style={[
                          StyleSheet.absoluteFill,
                          { borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)' },
                        ]}
                      />
                    )}
                    <View pointerEvents="none" style={[styles.ccyChipBorder, active && styles.ccyChipBorderActive]} />
                    <Text style={styles.ccyFlag}>{curr.flag}</Text>
                    <Text
                      style={[
                        styles.ccyCode,
                        !active && mode === 'dark' && { color: 'rgba(245,247,255,0.85)' },
                        active && styles.ccyCodeActive,
                      ]}
                    >
                      {curr.code}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            </MaskedView>

            {/* 환율 변환 디스플레이 */}
            <DarkGlass radius="lg" style={styles.fxCard}>
              <LinearGradient
                colors={['rgba(59,127,255,0.12)', 'rgba(94,231,168,0.06)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
                pointerEvents="none"
              />
              <View style={styles.fxRow}>
                <View style={styles.fxSide}>
                  <Text style={styles.fxCurrLabel}>USD</Text>
                  <Text style={styles.fxAmount}>
                    ${activeCard ? activeCard.balanceUsd.toFixed(2) : '0.00'}
                  </Text>
                </View>
                <View style={styles.fxArrow}>
                  <ArrowLeftRight size={18} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.fxSpeedTag}>0.3s</Text>
                </View>
                <View style={[styles.fxSide, styles.fxSideRight]}>
                  <Text style={[styles.fxCurrLabel, { color: selectedCurrData.code === 'USD' ? colors.primary : '#5EE7A8' }]}>
                    {selectedCcy}
                  </Text>
                  <Text style={[styles.fxAmount, { color: '#5EE7A8' }]}>
                    {activeCard ? fmtConverted(activeCard.balanceUsd, selectedCurrData) : '--'}
                  </Text>
                </View>
              </View>
              <View style={styles.fxRateRow}>
                <Text style={styles.fxRateText}>
                  1 USD = {selectedCurrData.perUsd >= 10
                    ? selectedCurrData.perUsd.toFixed(1)
                    : selectedCurrData.perUsd.toFixed(3)}{' '}{selectedCcy}
                </Text>
                <Text style={styles.fxRateTime}>실시간 환율</Text>
              </View>
            </DarkGlass>

            {/* 글로벌 커버리지 */}
            <View style={styles.sectionHead}>
              <View>
                <Text style={[styles.sectionTitle, { color: dyn.textOnLight }]}>글로벌 대중교통</Text>
                <Text style={[styles.sectionSub, { color: dyn.textOnLightMuted }]}>
                  하나의 카드로 전 세계 교통망 이용
                </Text>
              </View>
              <View style={styles.covBadge}>
                <LinearGradient
                  colors={['rgba(123,149,244,0.30)', 'rgba(123,149,244,0.10)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
                />
                <Text style={styles.covBadgeText}>42 도시</Text>
              </View>
            </View>

            <MaskedView
              style={styles.cityScrollWrap}
              maskElement={
                <LinearGradient
                  colors={['transparent', '#000', '#000', 'transparent']}
                  locations={[0, 0.05, 0.85, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              }
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cityScroll}
              >
                {CITIES.map(({ flag, city, network }) => (
                  <View key={city} style={styles.cityCard}>
                    <BlurFill
                      intensity={25}
                      tint={mode === 'dark' ? 'dark' : 'light'}
                      style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cityCardTint,
                        mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.10)' },
                      ]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cityCardBorder,
                        mode === 'dark' && { borderColor: 'rgba(255,255,255,0.22)' },
                      ]}
                    />
                    <Text style={styles.cityFlag}>{flag}</Text>
                    <Text
                      style={[
                        styles.cityName,
                        mode === 'dark' && { color: '#F5F7FF' },
                      ]}
                    >
                      {city}
                    </Text>
                    <Text
                      style={[
                        styles.cityNetwork,
                        mode === 'dark' && { color: 'rgba(245,247,255,0.55)' },
                      ]}
                    >
                      {network}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </MaskedView>

            {/* 최근 거래 내역 */}
            {recentTxs.length > 0 && (
              <>
                <View style={styles.sectionHead}>
                  <Text style={[styles.sectionTitle, { color: dyn.textOnLight }]}>최근 사용 내역</Text>
                  <Pressable
                    onPress={() => activeCard && navigation.navigate('CardDetail', { cardId: activeCard.id })}
                    style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.seeAllText}>전체보기</Text>
                    <ChevronRight size={12} color={colors.primary} strokeWidth={2.5} />
                  </Pressable>
                </View>
                <DarkGlass radius="lg" style={styles.txCard}>
                  {recentTxs.map((tx, i) => (
                    <View key={tx.hash}>
                      {i > 0 && <View style={styles.txDivider} />}
                      <TxRow tx={tx} />
                    </View>
                  ))}
                </DarkGlass>
              </>
            )}
          </ScrollView>
          </MaskedView>

          {/* ── 하단 액션 바 (5 pictogram buttons) ── */}
          <View style={styles.actionBarWrap}>
            <View style={styles.actionBar}>
              <BlurFill
                intensity={40}
                tint={mode === 'dark' ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.abTint,
                  mode === 'dark' && { backgroundColor: 'rgba(20,28,48,0.55)' },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.abBorder,
                  mode === 'dark' && { borderColor: 'rgba(255,255,255,0.18)' },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.abHair,
                  mode === 'dark' && { backgroundColor: 'rgba(255,255,255,0.35)' },
                ]}
              />

              <PictoBtn
                icon={RefreshCw}   bgIcon={Globe}
                label="환전"      labelColor="#C87000"
                gradColors={['#FFC040', '#E88000', '#CC5800']}
                onPress={() => {}}
              />
              <PictoBtn
                icon={Zap}         bgIcon={CreditCard}
                label="충전"      labelColor="#008A50"
                gradColors={['#30E090', '#00B870', '#009050']}
                onPress={() => navigation.navigate('Pay', { cardId: activeCard?.id ?? '' })}
              />
              <SendPictoBtn onPress={() => navigation.navigate('Send')} />
              <PictoBtn
                icon={User}        bgIcon={Shield}
                label="내 정보"   labelColor="#7A18CC"
                gradColors={['#D070FF', '#9030E0', '#6800CC']}
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </View>

        </View>
      )}
    </Screen>
  );
};

// ── 픽토그램 버튼 ─────────────────────────────────────────────────
type IC = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
const PictoBtn: React.FC<{
  icon: IC; bgIcon: IC; label: string; labelColor: string;
  gradColors: readonly [string, string, string]; onPress: () => void;
}> = ({ icon: Icon, bgIcon: BgIcon, label, labelColor, gradColors, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.pictoBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.90 }] }]}
  >
    <View style={[styles.pictoIconBox, { shadowColor: gradColors[1] }]}>
      {/* Solid vivid gradient */}
      <LinearGradient
        colors={gradColors}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
      />
      {/* Top shine */}
      <LinearGradient
        colors={['rgba(255,255,255,0.48)', 'rgba(255,255,255,0.10)', 'transparent']}
        locations={[0, 0.38, 1]}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        pointerEvents="none"
      />
      {/* Bg deco — 44px, corner-anchored, fully inside box */}
      <View style={styles.pictoDeco} pointerEvents="none">
        <BgIcon size={44} color="rgba(255,255,255,0.24)" strokeWidth={1.1} />
      </View>
      {/* Border */}
      <View style={styles.pictoRing} pointerEvents="none" />
      {/* Fg icon — white for max contrast */}
      <Icon size={32} color="#FFFFFF" strokeWidth={2.8} />
    </View>
    <Text style={[styles.pictoLabel, { color: labelColor }]}>{label}</Text>
  </Pressable>
);

const SendPictoBtn: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.pictoBtn, pressed && { opacity: 0.82, transform: [{ scale: 0.91 }] }]}
  >
    <View style={[styles.pictoIconBox, { shadowColor: '#1A44E0', shadowOpacity: 0.85, shadowRadius: 22, elevation: 14 }]}>
      <LinearGradient
        colors={['#5A90FF', '#2050EE', '#0C30CC']}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.52)', 'rgba(255,255,255,0.10)', 'transparent']}
        locations={[0, 0.38, 1]}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        pointerEvents="none"
      />
      <View style={styles.pictoDeco} pointerEvents="none">
        <ArrowLeftRight size={44} color="rgba(255,255,255,0.28)" strokeWidth={1.1} />
      </View>
      <View style={styles.pictoRing} pointerEvents="none" />
      <Send size={32} color="#FFFFFF" strokeWidth={2.8} />
    </View>
    <Text style={[styles.pictoLabel, { color: '#3B6FFF' }]}>송금</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  pageBody: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#DC2626', fontSize: 14 },

  // ── 캐러셀 ─────────────────────────────────────────────────────
  carouselBlock: { alignItems: 'center', justifyContent: 'flex-start', paddingTop: space.sm },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── 스크롤 콘텐츠 ────────────────────────────────────────────────
  scrollContent: { flex: 1 },
  scrollPad: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.md,
  },

  // ── 스탯 ─────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', gap: space.sm },
  statChip: {
    flex: 1, borderRadius: radius.lg, overflow: 'hidden',
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, gap: 3,
    shadowColor: '#3B5DCC', shadowOpacity: 0.20, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 3,
  },
  statChipTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  statValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(8,12,20,0.70)', letterSpacing: 0.2, textAlign: 'center' },

  // ── 섹션 헤더 ──────────────────────────────────────────────────
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { color: 'rgba(8,12,20,0.92)', fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
  sectionSub: { color: 'rgba(8,12,20,0.62)', fontSize: 11, fontWeight: '500', marginTop: 1 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(94,231,168,0.14)',
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(94,231,168,0.28)',
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#5EE7A8',
    shadowColor: '#5EE7A8', shadowOpacity: 0.9, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
  },
  liveBadgeText: { color: '#5EE7A8', fontSize: 10, fontWeight: '700' },

  // ── 통화 선택 ──────────────────────────────────────────────────
  ccyMaskWrap: { marginBottom: space.md },
  ccyScroll: { gap: space.sm, paddingLeft: space.sm, paddingRight: space.xxl * 1.2 },
  ccyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: radius.pill, overflow: 'hidden',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  ccyChipActive: {},
  ccyChipBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  ccyChipBorderActive: { borderColor: 'rgba(255,255,255,0.25)' },
  ccyFlag: { fontSize: 15 },
  ccyCode: { color: 'rgba(8,12,20,0.82)', fontSize: 12, fontWeight: '700' },
  ccyCodeActive: { color: '#FFFFFF' },

  // ── FX 카드 ─────────────────────────────────────────────────────
  fxCard: { paddingHorizontal: space.lg, paddingVertical: 14, gap: 8, overflow: 'hidden' },
  fxRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  fxSide: { flex: 1 },
  fxSideRight: { alignItems: 'flex-end' },
  fxCurrLabel: {
    color: colors.primary,
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 2,
  },
  fxAmount: { color: colors.textOnGlass, fontSize: 22, fontWeight: '600', letterSpacing: -0.4 },
  fxArrow: { alignItems: 'center', gap: 3 },
  fxSpeedTag: { color: '#5EE7A8', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  fxRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fxRateText: { color: colors.textOnGlassFaint, fontSize: 11, fontWeight: '500' },
  fxRateTime: { color: '#5EE7A8', fontSize: 10, fontWeight: '600' },

  // ── 도시 스크롤 ─────────────────────────────────────────────────
  covBadge: {
    overflow: 'hidden', borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(123,149,244,0.35)',
  },
  covBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  cityScrollWrap: { position: 'relative' },
  cityScroll: { gap: space.sm, paddingLeft: space.sm, paddingRight: space.xxl * 1.5 },
  cityCard: {
    width: 90, borderRadius: radius.lg, overflow: 'hidden',
    paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', gap: 4,
    shadowColor: '#3B5DCC', shadowOpacity: 0.15, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }, elevation: 3,
  },
  cityCardTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: radius.lg },
  cityCardBorder: { ...StyleSheet.absoluteFillObject, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.55)' },
  cityFlag: { fontSize: 26 },
  cityName: { color: 'rgba(8,12,20,0.92)', fontSize: 11, fontWeight: '700', letterSpacing: -0.2 },
  cityNetwork: { color: 'rgba(8,12,20,0.58)', fontSize: 9, fontWeight: '600' },

  // ── 최근 거래 ────────────────────────────────────────────────────
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  txCard: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  txDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.10)' },

  // ── 인디케이터 ──────────────────────────────────────────────────
  indicatorWrap: {
    marginTop: space.sm, borderRadius: radius.pill,
    shadowColor: '#3B5DCC', shadowOpacity: 0.35, shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  indicatorCapsule: { overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: 7 },
  indTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.32)', borderRadius: radius.pill },
  indBorder: { ...StyleSheet.absoluteFillObject, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.55)' },
  indHair: { position: 'absolute', top: 0, left: 18, right: 18, height: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  indRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  countTxt: { color: 'rgba(20,24,34,0.55)', fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  countNum: { color: '#0A0E1A', fontWeight: '700' },
  countSep: { color: 'rgba(20,24,34,0.3)' },
  sep: { width: 1, height: 14, backgroundColor: 'rgba(20,24,34,0.2)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(20,24,34,0.25)' },
  dotActive: { backgroundColor: colors.primary, width: 16 },

  // ── 하단 액션 바 (픽토그램) ───────────────────────────────────────
  actionBarWrap: {
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    shadowColor: '#3B5DCC', shadowOpacity: 0.30, shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  actionBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    borderRadius: 32, paddingVertical: 10, paddingHorizontal: space.sm,
    overflow: 'hidden',
  },
  abTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.30)', borderRadius: 28 },
  abBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.55)' },
  abHair: { position: 'absolute', top: 0, left: 24, right: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.75)' },

  pictoBtn: { alignItems: 'center', gap: 5, flex: 1 },
  pictoIconBox: {
    width: 66, height: 66, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.70, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 10, overflow: 'hidden',
  },
  pictoDeco: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ rotate: '-12deg' }],
  },
  pictoRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  pictoLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },

  // ── 헤더 버튼 ────────────────────────────────────────────────────
  headerBtn: {
    width: 40, height: 40,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B40CC',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  headerBtnRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },
});
