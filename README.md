# TransitX

> AI-powered borderless transit, payment & FX infrastructure on XRPL.

외국인이 현지 교통·금융을 이용할 때 겪는 구조적 마찰을 제거하기 위해 설계된 글로벌 모빌리티·결제 인프라입니다.

---

## ✨ Key Features

- 🤖 **AI Multimodal Recognition** — 지속 가능한 식별 레이어
- 💱 **Atomic FX Settlement** — XRPL DEX 기반 즉시 환전·정산
- ⚡ **Sub-5s Finality** — 저수수료, 빠른 결제 확정
- 🔐 **Privacy-Preserving Identity** — 최소 노출 원칙의 신원 인증
- 📲 **NFC Tap-to-Pay** — 카드 없이 단말 한 번으로 결제

---

## 🧱 Tech Stack

| Layer | Stack |
|---|---|
| **Blockchain** | XRPL (Testnet), `xrpl 4.6` |
| **Mobile** | React Native 0.81, Expo SDK 54, React 19, TypeScript 5.9 (strict) |
| **Navigation** | React Navigation v7 (native-stack) |
| **UI / Motion** | Reanimated 4, reanimated-carousel, expo-blur, expo-linear-gradient, react-native-svg |
| **NFC** | react-native-nfc-manager |
| **AI** | Multimodal recognition pipeline |

---

## 📂 Project Structure

```
TransitX/
├── docs/                       기획·시연 시나리오
├── TODO.md
└── mobile/                     RN 앱 (Expo workflow)
    ├── App.tsx                 엔트리 / 네비게이션 루트
    └── src/
        ├── theme.ts            디자인 토큰 (색·간격·라운드)
        ├── types.ts            공용 타입
        ├── format.ts           포맷터
        ├── navigation.ts       스택 파라미터 타입
        ├── polyfills.ts        xrpl용 Buffer/process/crypto
        │
        ├── components/
        │   ├── ui/             재사용 프리미티브 (로직 없음)
        │   └── *.tsx           도메인 컴포넌트
        ├── screens/            화면 단위 컴포지션
        ├── data/               api.ts (MOCK 토글) + mocks.ts
        └── state/              use*.ts 커스텀 훅
```

### 구조 원칙

- UI 프리미티브는 `components/ui/`에만, 비즈니스 로직 금지
- 데이터 진입점은 `data/api.ts` 단일 — XRPL 연동 시 이 파일만 수정
- 상태는 `state/use*.ts` 커스텀 훅으로 격리
- 색상·간격·라운드는 `theme.ts`에서만, 컴포넌트 하드코딩 금지

---

## 🚀 Getting Started

### Requirements

- macOS + Xcode
- Node.js ≥ 20 (권장: `nvm`)
- CocoaPods (`sudo gem install cocoapods`)
- Watchman (선택): `brew install watchman`

### 1. Clone

```bash
git clone https://github.com/TrillionScale/TransitX.git
cd TransitX
git checkout zo-ui-base
```

### 2. Install

```bash
cd mobile
npm install
cd ios && pod install && cd ..
```

### 3. Run

```bash
npm run ios       # 또는 npm run android
```

> 첫 빌드는 5–10분 소요. 이후엔 `npm start`로 Metro만 띄우면 됨.
> 강제 리로드: 시뮬레이터에서 `⌘R`

---

## 🧩 Troubleshooting

<details>
<summary><b>Pods 에러</b></summary>

```bash
cd mobile/ios && pod install --repo-update
```
</details>

<details>
<summary><b>Metro 캐시 꼬임</b></summary>

```bash
cd mobile && npm start -- --reset-cache
```
</details>

<details>
<summary><b>빌드 전체 리셋</b></summary>

```bash
cd mobile
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npm run ios
```
</details>

---

## 📍 Status

- ✅ 모든 화면 시각적으로 동작
- ✅ 글래스 UI 디자인 시스템 적용 (`Glass`, `BackgroundCanvas`, `ScreenHeader`)
- 🟡 데이터 전체 목업 — `data/api.ts`의 `MOCK` 토글로 XRPL 실연동 전환 가능
- 🟡 NFC 진입점 구현 — 실제 태그 인식은 **EAS dev build** 필요 (Expo Go 미지원)

---

## 👥 Team

- **Karin Lee** — Blockchain & Back-end Engineer
- **Zo** — Product Engineer & Community Lead

---

## 📄 License

MIT
