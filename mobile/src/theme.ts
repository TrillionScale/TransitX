// Light cool gradient base + dark glass cards — Apple system material 톤
export const colors = {
  // 배경 (BackgroundCanvas가 실제로 그림 — 이 값은 로딩 시 잠깐 보이는 fallback)
  bg: '#C4CEDB',
  bgDeep: '#B6C7DC',
  bgRaised: '#FFFFFF',

  // 글래스 카드 표면 — 다크 틴트로 라이트 배경 위에서 BlurView 효과 또렷
  surface: 'rgba(28,30,38,0.55)',
  surfaceStrong: 'rgba(28,30,38,0.72)',
  surfaceFaint: 'rgba(255,255,255,0.45)',

  // 보더 / hairline
  border: 'rgba(255,255,255,0.18)',
  borderStrong: 'rgba(255,255,255,0.35)',
  hairline: 'rgba(255,255,255,0.7)',

  // 다크 글래스 카드 안 — 흰 톤
  text: '#F5F6F9',
  textMuted: 'rgba(245,246,249,0.65)',
  textFaint: 'rgba(245,246,249,0.42)',
  // 라이트 페일 배경 위 직접 — 짙은 톤
  textOnLight: '#0E1116',
  textOnLightMuted: 'rgba(14,17,22,0.62)',
  textOnLightFaint: 'rgba(14,17,22,0.38)',
  textInverse: '#0A0B0E',  // primary 같은 밝은 배경 위 (Button, IconButton primary)
  textOnCard: '#FFFFFF',   // 컬러풀 그라디언트 카드 위 (CardItem, MemberCard)

  // 강조 — 다크 배경에서 잘 보이는 톤
  primary: '#7B95F4',      // 부드러운 인디고-블루
  primaryDark: '#5B7AF0',
  primaryFaint: 'rgba(123,149,244,0.16)',

  success: '#5EE7A8',
  warning: '#F4C56B',
  danger: '#F47A7A',

  // 그룹 카드 / 멤버 카드 액센트 — 다크 위에서 빛나는 채도
  accents: [
    '#7B95F4', // soft indigo
    '#B388F9', // soft violet
    '#5BD5F0', // sky cyan
    '#5EE7A8', // mint
    '#F4C56B', // amber
    '#F088C0', // pink
    '#F47A7A', // rose
    '#9B82FF', // periwinkle
  ] as const,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const font = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  subtitle: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.2 },
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  mono: { fontFamily: 'Menlo', fontSize: 11, letterSpacing: 0.4 },
};

export const shadow = {
  // 부드러운 그림자 — 큰 radius + 낮은 opacity로 윤곽 안 생김
  card: {
    shadowColor: '#1A1F2E',
    shadowOpacity: 0.18,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
  },
  soft: {
    shadowColor: '#1A1F2E',
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  glass: {
    shadowColor: '#1A1F2E',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  glow: {
    shadowColor: '#7B95F4',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
};

// 글래스 시스템 — 라이트 배경 위에 다크 틴트 BlurView
export const glass = {
  blur: {
    thin: 30,
    regular: 60,
    thick: 90,
  },
  // 다크 틴트 — BlurView 위에 깔리는 어두운 반투명. 라이트 배경 위에서 카드가 또렷
  tint: {
    thin: 'rgba(20,22,28,0.35)',
    regular: 'rgba(20,22,28,0.50)',
    thick: 'rgba(20,22,28,0.68)',
    light: 'rgba(255,255,255,0.55)',  // 옅은 글래스 (인풋, secondary chip)
  },
  // 카드 위쪽 1px hairline — "위에서 빛 받는" Apple 패턴
  topHighlight: 'rgba(255,255,255,0.45)',
};

// 메탈 chrome 톤 (작은 버튼/칩에만 사용)
export const metal = {
  // chrome 그라디언트 stops
  highlight: '#E8EAEF',
  light: '#BCC0CB',
  shade: '#7F838F',
  shadow: '#5C5F6A',
  // 차콜 메탈 (다이얼/하우징)
  housingTop: '#23252C',
  housingBottom: '#0E0F13',
};

// 화면 등장 표준 모션
export const motion = {
  enter: {
    from: { opacity: 0, translateY: 12 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing' as const, duration: 320 },
  },
  enterFast: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing' as const, duration: 200 },
  },
  pressIn: { scale: 0.97 },
  pressTransition: { type: 'spring' as const, damping: 18, stiffness: 280 },
  // stagger 지연 ms 계산
  stagger: (i: number, base = 80) => ({ delay: i * base }),
};

export const accentForCard = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return colors.accents[h % colors.accents.length];
};
