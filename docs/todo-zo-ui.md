# TransitX — TODO (Zo / UI & NFC)

> [toasty-cuddling-cocoa.md](./toasty-cuddling-cocoa.md)의 zo 담당 부분을 화면 단위로 재구성. xrpl-core 함수는 Karin이 구현 → zo는 hook에서 호출만.

## 한눈에

| 항목 | 내용 |
|---|---|
| 담당 | `mobile/` 전체, `react-native-nfc-manager`, 화면·네비·상태 |
| 핵심 원칙 | **Mock-first 풀 플로우**. 앱 전체가 mock으로도 끝까지 굴러감 (결제·그룹 생성·멤버 액션 모두 가짜로 진행되고 팝업까지 뜸). Karin 함수 준비되면 `data/api.ts`의 한 줄만 `false`로 토글 |
| 화면 수 | 7개 (개인 카드 4 + 그룹 카드 3) |
| 베이스 컴포넌트 | 3개 (CardItem / TxRow / MemberRow) |
| Hook | 3개 (usePaymentFlow / useCards / useGroup) |
| 비주얼 레퍼런스 | Apple Wallet · Wise · Apple Pay · Salesforce · Lawyers |
| 부가 효과 | mock 모드 = 데모 백업 시나리오 (testnet 죽으면 토글로 전환) |

## 추가 기능: 그룹 풀 (공용 카드)
- 한 지갑(풀)에 여러 명이 결제 권한
- 풀 잔고에서 차감, 풀 거래 내역에 누가 썼는지 다 기록
- B2B 시나리오: 법인 교통카드 / 관광 가이드 / 가족 카드
- XRPL 메커니즘은 **Karin이 결정** (RegularKey / SignerList / Permissioned Domain 중)

---

## 화면 흐름

```
┌─────────────────────────────────────────────────────────┐
│ #1 CardList (메인)                                      │
│  ├─ 좌상단 햄버거 → openDrawer                          │
│  └─ 카드 탭 → #2                                        │
│                                                          │
│  #4 SideMenu (Drawer)                                   │
│   ├─ 내 지갑                                            │
│   └─ 그룹 관리 → #5                                     │
│                                                          │
│  #5 GroupList                                           │
│   ├─ 그룹 탭 → #6                                       │
│   └─ + 버튼 → 그룹 생성 모달                            │
│                                                          │
│  #6 GroupDetail                                         │
│   └─ 멤버 탭 → #7                                       │
│                                                          │
│  #7 MemberDetail                                        │
│   └─ 권한 토글 / 퇴장                                   │
│                                                          │
│ #2 CardDetail (개인·그룹 공용)                          │
│  └─ 카드 영역 탭 → #3                                   │
│                                                          │
│ #3 PayScreen (Apple Pay 스타일)                         │
│  └─ NFC 감지 → 결제 → 성공 모달 → #2 복귀               │
└─────────────────────────────────────────────────────────┘
```

| # | 화면 | 트리거 | 다음 |
|---|---|---|---|
| 1 | CardList | 앱 진입 | 햄버거→#4, 카드→#2 |
| 2 | CardDetail | #1 카드 탭 | 카드 영역→#3 |
| 3 | Pay | #2 카드 탭 | 성공/취소 후 #2 |
| 4 | SideMenu (Drawer) | #1 햄버거 | 그룹 관리→#5 |
| 5 | GroupList | #4 그룹 관리 | 그룹→#6, +→생성 모달 |
| 6 | GroupDetail | #5 그룹 탭 | 멤버→#7 |
| 7 | MemberDetail | #6 멤버 탭 | (in-place 액션) |

---

## 파일 구조

```
mobile/src/
├── polyfills.ts                  ← xrpl보다 먼저 import (기존)
├── env.ts                        ← env 단일 진입점 (기존)
├── nfc.ts                        ← startNfcSession(onTap) (기존)
│
├── navigation.tsx                ← Stack + Drawer 정의
│
├── types.ts                      ← Card / Tx / Member (UI ↔ xrpl-core 공용)
│
├── data/
│   ├── api.ts                    ← Karin 함수 호출 단일 파일 (Mock 교체 지점)
│   └── mocks.ts                  ← Karin 함수 미준비 시 사용할 mock 데이터
│
├── state/
│   ├── usePaymentFlow.ts         ← 결제 상태 머신
│   ├── useCards.ts               ← 내+그룹 카드 통합
│   └── useGroup.ts               ← 단일 그룹 상세 + 멤버 액션
│
├── components/
│   ├── CardItem.tsx              ← 카드 한 장 (모든 화면 공용)
│   ├── TxRow.tsx                 ← 거래 내역 한 줄 (개인·그룹 공용)
│   └── MemberRow.tsx             ← 멤버 한 줄 (#6, #7 공용)
│
└── screens/
    ├── CardListScreen.tsx        ← #1
    ├── CardDetailScreen.tsx      ← #2
    ├── PayScreen.tsx             ← #3
    ├── SideMenuScreen.tsx        ← #4
    ├── GroupListScreen.tsx       ← #5
    ├── GroupDetailScreen.tsx     ← #6
    └── MemberDetailScreen.tsx    ← #7
```

추가 패키지: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/drawer`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`

---

## 데이터 모델 (UI ↔ xrpl-core 공용)

`mobile/src/types.ts` — Karin과 zo가 같은 타입 보고 작업.

```ts
export type Card = {
  id: string;              // 지갑 주소 = id
  kind: 'personal' | 'group';
  name: string;            // 사용자가 정한 별명
  address: string;         // 지갑 주소 (full)
  balanceUsd: number;      // USD 잔고
};

export type Tx = {
  hash: string;
  timestamp: number;       // unix ms
  merchant: string;        // 가맹점 이름 (mock 또는 메모에서)
  amountKrw: number;
  amountUsd: number;       // SendMax 실제 차감액
  rate: number;            // KRW per USD
  signer?: string;         // 그룹 카드일 때 누가 서명했는지 (지갑 주소)
};

export type Member = {
  address: string;
  alias: string;
  status: 'active' | 'frozen';
  dailyLimitKrw: number;   // 0이면 무제한
  spentTodayKrw: number;
};

export type Group = {
  address: string;         // 풀 지갑 주소
  name: string;
  balanceUsd: number;
  members: Member[];
};
```

---

## Mock-First 패턴 (가장 중요)

**원칙**: 앱 전체가 mock으로도 **끝까지** 굴러간다. 카드 탭→결제→성공 팝업→잔액 감소→이전 화면. 그룹 생성→로더→완료→리스트에 추가. Karin 함수가 들어오면 **그 한 줄만** 진짜로 교체.

### 두 가지 효과
1. **zo는 Karin 안 기다림** — 모든 화면 흐름이 mock으로 1주차 안에 굴러감
2. **데모 백업** — testnet 노드 죽으면 `USE_MOCK = true`로 토글, 데모 그대로 진행

### Mock의 핵심: "겉은 똑같아 보여야"
- 가짜라도 **시간이 걸려야 함** (실제 결제 4초 → mock도 setTimeout 1.5초)
- 가짜라도 **상태 변화가 진짜처럼 일어나야** (결제 후 잔액이 진짜로 줄어들어 보여야)
- 가짜라도 **에러 케이스도 나와야** (path 없음, NFC 실패 같은 거 토글로)

### `data/api.ts` 골격

```ts
import * as core from '@transitx/xrpl-core';  // Karin이 만들 패키지
import * as mock from './mocks';
import { Card, Tx, Member, Group } from '../types';

// 함수별로 토글. 일부만 실제, 일부만 mock 가능.
// Karin이 한 함수씩 완성할 때마다 그 줄만 false로.
const MOCK = {
  getCardBalance: true,
  findQuote: true,
  pay: true,
  getTxHistory: true,
  listMyGroups: true,
  createGroup: true,
  addMember: true,
  freezeMember: true,
  removeMember: true,
};

export const api = {
  getCardBalance: (addr: string): Promise<number> =>
    MOCK.getCardBalance ? mock.balance(addr) : core.getIouBalance(addr, 'USD', USD_ISSUER),

  findQuote: (from: string, krw: number) =>
    MOCK.findQuote ? mock.quote(krw) : core.findIouPath({ from, to: MERCHANT, deliver: krw }),

  pay: (from: string, quote: Quote) =>
    MOCK.pay ? mock.pay(from, quote) : core.payIou({ wallet, ...quote }),

  getTxHistory: (addr: string) =>
    MOCK.getTxHistory ? mock.txHistory(addr) : core.getTxHistory(addr, 30),

  listMyGroups: () =>
    MOCK.listMyGroups ? mock.myGroups() : core.listMyGroups(),

  createGroup: (name: string, usd: number) =>
    MOCK.createGroup ? mock.createGroup(name, usd) : core.createGroupPool(name, usd),

  addMember: (g: string, m: string) =>
    MOCK.addMember ? mock.addMember(g, m) : core.addMember(g, m),

  freezeMember: (g: string, m: string) =>
    MOCK.freezeMember ? mock.freezeMember(g, m) : core.freezeMember(g, m),

  removeMember: (g: string, m: string) =>
    MOCK.removeMember ? mock.removeMember(g, m) : core.removeMember(g, m),
};
```

### `data/mocks.ts` — 진짜처럼 보이는 가짜

mock은 in-memory state를 들고 있다가 실제 변경처럼 동작:

```ts
import { Card, Tx, Member, Group } from '../types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// in-memory state — 앱 종료 전까지 유지됨
const state = {
  balances: { 'rMyAddr...': 100.00, 'rGroupAddr...': 1000.00 } as Record<string, number>,
  txs: { 'rMyAddr...': [...seedTxs] } as Record<string, Tx[]>,
  groups: [...seedGroups] as Group[],
};

export const balance = async (addr: string) => {
  await sleep(300);                           // 진짜 ledger 호출처럼
  return state.balances[addr] ?? 0;
};

export const quote = async (krw: number) => {
  await sleep(500);                           // path_find ~0.5s
  return {
    sendMaxUsd: krw / 1370.4 * 1.01,
    rate: 1370.4,
    paths: [],
  };
};

export const pay = async (from: string, quote: Quote) => {
  await sleep(2000);                          // submitAndWait 흉내 (4s 대신 2s로 데모 빠르게)
  // 진짜처럼 잔액 차감
  state.balances[from] -= quote.sendMaxUsd;
  // 진짜처럼 거래 내역 추가
  const tx: Tx = {
    hash: '0xMOCK' + Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    merchant: '서울 지하철 2호선',
    amountKrw: 1500,
    amountUsd: quote.sendMaxUsd,
    rate: quote.rate,
    signer: from,
  };
  state.txs[from] = [tx, ...(state.txs[from] ?? [])];
  return { hash: tx.hash, delivered: 1500 };
};

export const createGroup = async (name: string, usd: number) => {
  await sleep(3000);                          // 4단계 풀 셋업 흉내
  const newGroup: Group = {
    address: 'rGroup' + Math.random().toString(36).slice(2, 10),
    name,
    balanceUsd: usd,
    members: [{ address: state.myAddr, alias: '나', status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 }],
  };
  state.groups.push(newGroup);
  state.balances[newGroup.address] = usd;
  return newGroup;
};

export const addMember = async (groupAddr: string, memberAddr: string) => {
  await sleep(1500);
  const g = state.groups.find(x => x.address === groupAddr);
  g?.members.push({ address: memberAddr, alias: memberAddr.slice(-4), status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 });
};

export const freezeMember = async (groupAddr: string, memberAddr: string) => {
  await sleep(1500);
  const g = state.groups.find(x => x.address === groupAddr);
  const m = g?.members.find(x => x.address === memberAddr);
  if (m) m.status = m.status === 'active' ? 'frozen' : 'active';
};

// removeMember, txHistory, myGroups 동일 패턴
```

**핵심 디자인**: mock state가 앱 메모리에 살아있어서 "그룹 만듦 → 리스트에 보임", "결제함 → 잔액 줄음", "멤버 동결 → UI 갱신" 모두 동작. zo가 만든 화면은 mock·real 중 어느 쪽이든 동일하게 굴러감.

### 화면·hook은 항상 `api`만 import
```ts
// state/useCards.ts
import { api } from '../data/api';
// xrpl 직접 import 금지
```

### Karin 함수 들어왔을 때 갈아끼우기

```ts
// data/api.ts
const MOCK = {
  getCardBalance: false,   // ← Karin이 getIouBalance 완성. 이 줄만 false
  findQuote: false,        // ← 완성. false
  pay: true,               // ← 아직 mock (그룹 서명 미합의)
  // ...
};
```

이 한 줄로 화면이 진짜 ledger 호출하기 시작. UI 코드 0줄 변경.

---

## 화면별 작업 카드

각 화면은 동일한 5개 슬롯으로 정의: **레이아웃 / 데이터 / 액션 / Karin 핸드오프 / TODO**

---

### #1 CardListScreen — 메인 카드 리스트

> Apple Wallet 스타일. 카드 스택이 위에서 아래로 살짝 겹침.

**레이아웃**
- 상단: 좌상단 햄버거, 우상단 새로고침
- 중앙: 카드 스택 (개인 카드 + 그룹 카드 섞여서)
- 하단: `+ Add Card` (P1)

**데이터**
- `useCards()` → `Card[]` (개인+그룹 통합)

**액션**
- 햄버거 → `navigation.openDrawer()` → #4
- 카드 탭 → `navigation.navigate('CardDetail', { cardId })` → #2
- pull-to-refresh → `useCards().refresh()`

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 개인 잔고 조회 | `api.getCardBalance(myAddr)` | `mocks.balance` |
| 그룹 풀 잔고 조회 | `api.getCardBalance(groupAddr)` | 동일 |
| 내 그룹 목록 | `api.listMyGroups()` | `mocks.myGroups` (TODO Karin) |

**Mock 플로우**: 진입 시 mock balance/groups를 0.3s 후 표시. 결제·그룹 생성 후 돌아오면 mock state 변경분이 반영됨.

**TODO**
- [ ] **[P0] CardListScreen 골격** — Stack + 카드 영역
- [ ] **[P0] CardItem 컴포넌트** — `{ card: Card; onPress: () => void }`
- [ ] **[P0] 카드 스택 레이아웃** — 절대 위치 + zIndex
- [ ] **[P0] useCards hook** — api.getCardBalance 호출 + 로딩/에러 state. focus 시 자동 refresh (`useFocusEffect`)
- [ ] **[P0] 햄버거 → Drawer 연결**
- [ ] **[P0] 카드 탭 → #2 navigate**
- [ ] **[P1] 카드 색상/그라디언트** — 개인=블루 그룹=퍼플
- [ ] **[P1] pull-to-refresh**

---

### #2 CardDetailScreen — 카드 상세 + 사용 내역

> Wise 스타일. 카드 비주얼 + 액션 3개 + 거래 리스트.

**레이아웃**
- 상단 1/3: 카드 큰 비주얼 (CardItem 재사용, 크게)
- 중단: 액션 버튼 — `Details` / `Freeze` (P1) / `Settings` (P1)
- 하단: 거래 내역 (날짜별 그룹 헤더 + TxRow 리스트)

**그룹 카드일 때 차이**
- 거래 내역 각 줄에 서명자 표시: "지하철 / **김수민** (...8345) / -1,500 KRW"

**데이터**
- `route.params.cardId` → `useCards().findById(id)` → `Card`
- `useTxHistory(cardId)` → `Tx[]` (별도 hook 또는 useCards 안)

**액션**
- 카드 영역 탭 → `navigation.navigate('Pay', { cardId })` → #3
- (P1) Freeze 버튼 → 그룹 카드면 #6으로

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 거래 내역 | `api.getTxHistory(cardAddress)` | `mocks.txHistory` |

**Mock 플로우**: mock state의 잔액·tx 그대로 표시. PayScreen 다녀오면 잔액 줄고 tx 추가된 상태로 자동 갱신 (`useFocusEffect`).

**TODO**
- [ ] **[P0] CardDetailScreen 골격**
- [ ] **[P0] 큰 카드 비주얼 (CardItem variant)**
- [ ] **[P0] TxRow 컴포넌트** — `{ tx: Tx; showSigner?: boolean }`
- [ ] **[P0] 거래 내역 fetch** — `api.getTxHistory`
- [ ] **[P0] 날짜별 SectionList**
- [ ] **[P0] 카드 탭 → #3 navigate**
- [ ] **[P0] focus 시 잔액·내역 자동 갱신** (`useFocusEffect`)
- [ ] **[P1] Freeze/Settings 버튼**

---

### #3 PayScreen — 결제 (Apple Pay 스타일)

> 풀스크린 모달. NFC 감지 → 결제 → 성공/에러.

**레이아웃**
- 풀스크린 어두운 배경
- 정중앙: 카드 비주얼 (펄스 애니메이션)
- 하단 안내문: "기기를 단말기에 가까이 대세요"
- 결제 시작 후: 견적("1,500 KRW ≈ $1.09") → 진행 → 성공 모달

**상태 머신** (`usePaymentFlow`)
```
idle ──tagDetected──▶ quoting ──got quote──▶ submitting
                          │                       │
                          └──no path──▶ error ◀──tx fail
                                                  │
                              success ◀──tesSUCCESS
```

**데이터**
- `route.params.cardId` → 어느 카드(또는 그룹 풀)로 결제할지 결정
- `usePaymentFlow(cardId)` → `{ phase, quote, result, error }`

**액션**
- 화면 진입 즉시 `nfc.startNfcSession(onTap)`
- onTap → flow.start() → quoting → submitting
- 성공 → SuccessModal 1.5s → `navigation.goBack()` → #2 자동
- 화면 이탈 시 (취소 포함) → `nfc.stopNfcSession()` 반드시

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 견적 | `api.findQuote(from, 1500)` | `mocks.quote` |
| 결제 | `api.pay(from, quote)` | `mocks.pay` |

**그룹 카드일 때 결제 from**
- 개인 카드: from = `myWallet.address`
- 그룹 카드: from = `groupAddress` — 서명 메커니즘은 Karin과 합의 (RegularKey 등)
- UI는 `cardId` 하나만 들고 있고, `usePaymentFlow`가 카드 종류 보고 알아서 처리

**Mock 플로우** (`MOCK.pay = true`일 때)
1. PayScreen 진입 → NFC 안 켜고 즉시 가짜 모드: 1초 후 "tagDetected" 자동 발화 (또는 화면 어디든 한 번 탭)
2. `api.findQuote` mock → 0.5s 후 견적 표시
3. `api.pay` mock → 2s 진행 → in-memory state 잔액 차감 + tx 추가 → 성공
4. SuccessModal에 mock tx hash (`0xMOCK...`) 표시. Explorer 링크는 mock일 땐 alert로 대체
5. goBack → #2에 돌아가면 잔액·거래 내역 모두 갱신된 상태로 보임

**Real 플로우** (`MOCK.pay = false`일 때)
- 위와 동일하되 NFC 진짜 켜짐, mock 함수가 진짜 함수로 교체
- UI 코드 차이 0

**TODO**
- [ ] **[P0] PayScreen 풀스크린 모달**
- [ ] **[P0] usePaymentFlow hook** — 위 상태 머신 (mock·real 둘 다 동일하게 동작)
- [ ] **[P0] NFC 라이프사이클** — 진입 시 start, 이탈/완료 시 stop. mock 모드에선 NFC 자체를 skip하고 1s 타이머로 대체
- [ ] **[P0] 견적 → 결제 → 성공/에러 분기 UI**
- [ ] **[P0] SuccessModal** — tx hash + Explorer Linking.openURL (mock일 때 alert)
- [ ] **[P0] 카드 종류별 from 분기** (개인/그룹)
- [ ] **[P1] 카드 펄스 애니메이션 (Reanimated)**
- [ ] **[P1] 에러 토스트 (path 없음 / tesPATH_DRY)** — mock에서도 "에러 발생!" 토글 가능하게

---

### #4 SideMenuScreen — 사이드 메뉴 (Drawer)

> Salesforce 스타일. 좌측에서 슬라이드인.

**레이아웃**
- 상단: 프로필 (아바타 + 지갑 주소 끝자리)
- 메뉴 항목: `내 지갑` / `그룹 관리` / (P1) 설정 / (P1) 로그아웃

**데이터**
- 현재 사용자 지갑 주소 (env.ts의 DEMO_SEED → wallet.address)

**액션**
- `내 지갑` → CardList의 개인 카드만 필터 (또는 #2 직접)
- `그룹 관리` → `navigation.navigate('GroupList')` → #5

**Karin 핸드오프** — 없음 (순수 네비게이션)

**TODO**
- [ ] **[P0] Drawer 셋업** — `@react-navigation/drawer`
- [ ] **[P0] 메뉴 항목 2개 + 네비게이션**
- [ ] **[P1] 프로필 영역**

---

### #5 GroupListScreen — 그룹 리스트

> #1과 동일한 카드 스택 + 하단 FAB.

**레이아웃**
- 빈 상태: 중앙 "그룹이 없습니다" + `그룹 만들기` 버튼
- 그룹 1개 이상: 카드 스택 + 하단 FAB `+`

**데이터**
- `useCards().groups` → `Group[]`

**액션**
- 그룹 탭 → `navigation.navigate('GroupDetail', { groupId })` → #6
- `+` → 그룹 생성 모달 (이름 + 초기 충전 USD 입력)
- 모달 제출 → `api.createGroup(name, usd)` → 성공 시 새 #6으로

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 그룹 생성 | `api.createGroup(name, initialUsd)` | `mocks.createGroup` |

**그룹 생성 내부 흐름** (Karin이 `createGroupPool` 안에서 처리)
1. 새 지갑 생성 (faucet 또는 미리 준비된 풀)
2. TrustSet USD
3. 내 지갑 → 풀 USD 송금
4. 권한 부여 (메커니즘 Karin 결정)

UI는 이걸 한 함수 호출로 봄. 다만 **10초 이상 걸릴 수 있어서 진행 단계 로더 필요**:
- "Step 1/4: 풀 지갑 생성..." → "Step 4/4: 초기 충전..."
- 이건 `api.createGroup`이 progress callback 받게 하거나, 로더만 단계별 텍스트 토글

**Mock 플로우** (`MOCK.createGroup = true`일 때)
1. `+` 탭 → 모달 (이름 + 초기 USD)
2. 제출 → 단계별 로더 표시 ("1/4 풀 지갑 생성..." → "2/4 TrustSet..." → "3/4 충전..." → "4/4 권한 설정...") 각 ~750ms
3. mock state에 새 Group 추가, 잔액 등록
4. "그룹 생성 완료" 팝업 → #6 자동 navigate
5. #5로 다시 오면 새 그룹이 리스트에 보임

**TODO**
- [ ] **[P0] GroupListScreen 골격**
- [ ] **[P0] 빈/리스트 상태 분기**
- [ ] **[P0] CardItem 재사용 (variant=group)**
- [ ] **[P0] FAB `+` 버튼**
- [ ] **[P0] 그룹 생성 모달** — 이름·초기 USD 입력
- [ ] **[P0] 그룹 생성 호출 + 단계별 로더** (mock도 단계 텍스트 흉내)
- [ ] **[P0] 생성 완료 팝업 + #6 자동 이동**

---

### #6 GroupDetailScreen — 그룹 상세 (멤버 리스트)

> Lawyers 좌측 화면 스타일. 멤버 카드 슬라이더.

**레이아웃**
- 상단: 그룹 이름, (P1) 검색
- 카드 슬라이더 영역: 멤버 큰 카드들. 한 카드에 이름·아바타·이번 달 사용액·권한 상태
  - "Cases Won 100+" 자리 → "이번 달 사용 ₩47,500"
- 하단 (P1): 그룹 설정 / 알림 / 내 권한
- 우상단: `+ 멤버 추가` 버튼 (P0)

**데이터**
- `route.params.groupId` → `useGroup(groupId)` → `Group`
- 그룹의 거래 내역에서 멤버별 집계

**액션**
- 멤버 카드 탭 → `navigation.navigate('MemberDetail', { groupId, memberAddr })` → #7
- `+ 멤버 추가` → 모달 (지갑 주소 + alias 입력)
- 모달 제출 → `api.addMember(groupAddr, memberAddr)`

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 그룹 상세 | `api.getGroup(groupId)` | `mocks.getGroup` |
| 그룹 거래 내역 | `api.getTxHistory(groupAddr)` | 동일 |
| 멤버 추가 | `api.addMember(groupAddr, memberAddr)` | `mocks.addMember` |

**Mock 플로우**: 멤버 추가 → 1.5s 로딩 → mock state에 멤버 추가 → "추가 완료" 팝업 → 멤버 리스트에 새 카드 보임.

**TODO**
- [ ] **[P0] GroupDetailScreen 골격**
- [ ] **[P0] 멤버 카드 슬라이더** — `FlatList horizontal`
- [ ] **[P0] MemberRow / MemberCard 컴포넌트**
- [ ] **[P0] useGroup hook** — 그룹 + 멤버 + 멤버별 집계
- [ ] **[P0] 멤버 탭 → #7**
- [ ] **[P0] 멤버 추가 모달 + 완료 팝업**
- [ ] **[P0] focus 시 자동 갱신** (멤버 액션 후 돌아왔을 때)
- [ ] **[P1] 그룹 거래 내역 (그룹 단위 합계)**

---

### #7 MemberDetailScreen — 멤버 상세 + 권한 액션

> Lawyers 우측 화면. 멤버 정보 + 권한 토글/퇴장.

**레이아웃**
- 상단: 큰 아바타 + 이름 + 위치(P1)
- 정보 블록 (Lawyers의 "지갑 주소 / 현재 위치 / 일 한도 / 사용 내역" 자리):
  - **지갑 주소** (full + 복사 버튼)
  - **일 한도** (예: 1,500 / 5,000) ← Lawyers 메모 "timestamp 슬롯 w 800000"을 이렇게 해석
  - **이번 달 사용액**
  - (P1) 현재 위치
- 하단: `권한 동결` / `퇴장` 버튼 + 확인 다이얼로그

**데이터**
- `route.params.{ groupId, memberAddr }`
- `useGroup(groupId).getMember(memberAddr)` → `Member`
- 멤버 사용 내역 (그룹 tx 중 signer === memberAddr만 필터)

**액션**
- `권한 동결` → 확인 → `api.freezeMember(groupAddr, memberAddr)` → 상태 토글
- `퇴장` → 확인 → `api.removeMember(groupAddr, memberAddr)` → #6 복귀
- (P1) 일 한도 변경 → 슬라이더/입력 → `api.setLimit(...)`

**Karin 핸드오프**
| 호출 | 함수 | Mock 위치 |
|---|---|---|
| 멤버 사용 내역 | `api.getTxHistory(groupAddr).filter(signer)` | `mocks.txHistory` |
| 권한 동결 | `api.freezeMember(g, m)` | `mocks.freezeMember` |
| 퇴장 | `api.removeMember(g, m)` | `mocks.removeMember` |
| (P1) 한도 설정 | `api.setLimit(g, m, krw)` | TODO |

**Mock 플로우** (`MOCK.freezeMember = true`, `MOCK.removeMember = true`)
1. `권한 동결` 탭 → 확인 다이얼로그 → 1.5s 로딩 → mock state의 멤버 status 토글 → "동결 완료" 팝업 → 화면 갱신
2. `퇴장` 탭 → 확인 다이얼로그 → 1.5s 로딩 → mock state에서 멤버 제거 → "퇴장 완료" 팝업 → #6 자동 복귀 (멤버 리스트에서 사라진 상태)

**TODO**
- [ ] **[P0] MemberDetailScreen 골격**
- [ ] **[P0] 멤버 정보 블록**
- [ ] **[P0] 멤버 사용 내역 (필터 적용)**
- [ ] **[P0] 권한 동결 버튼 + 확인 다이얼로그 + 완료 팝업**
- [ ] **[P0] 퇴장 버튼 + 확인 다이얼로그 + 완료 팝업 + 자동 복귀**
- [ ] **[P1] 일 한도 설정 UI**
- [ ] **[P1] 현재 위치 (지도 또는 텍스트)**

---

## Karin과 합의해야 할 함수 (api.ts 기준)

| 함수 | 입력 | 출력 | 사용 화면 | Karin 메모 |
|---|---|---|---|---|
| `getCardBalance` | address | `number` (USD) | #1, #2 | 기존 plan에 있음 (`getIouBalance`) |
| `findQuote` | from, krwAmount | `{ sendMaxUsd, paths, rate }` | #3 | 기존 (`findIouPath`) |
| `pay` | from, quote | `{ hash, delivered }` | #3 | 기존 (`payIou`). 그룹 카드일 때 서명 분기 |
| `getTxHistory` | address, limit? | `Tx[]` | #2, #6, #7 | 신규. `account_tx` 호출 + 메타에서 가맹점·서명자 추출 |
| `listMyGroups` | (myAddr) | `Group[]` | #1, #5 | 신규. 어디 저장? on-chain memo? off-chain? |
| `createGroup` | name, initialUsd | `Group` | #5 | 신규. 풀 지갑 생성 + TrustSet + 송금 + 권한 |
| `addMember` | groupAddr, memberAddr | void | #6 | 신규. 메커니즘 결정 |
| `freezeMember` | groupAddr, memberAddr | void | #7 | 신규 |
| `removeMember` | groupAddr, memberAddr | void | #7 | 신규 |
| `setLimit` (P1) | groupAddr, memberAddr, krw | void | #7 | 신규. on-chain 한도? off-chain? |

**가장 큰 미결**: 그룹 권한 메커니즘 (RegularKey vs SignerList vs Permissioned Domain). 첫 주 안에 Karin과 합의 → `docs/api-spec.md` 확정.

**제안 — 가장 단순한 V1**: 모든 그룹 멤버가 그룹 풀 시드를 공유 (서명은 모두 그룹 시드로). 권한 동결/퇴장은 off-chain 화이트리스트 (앱 단의 거부). V2에서 SignerList로 진짜 on-chain 권한.

---

## 작업 순서 (7일)

| Day | 목표 | 결과물 |
|---|---|---|
| 1 | 환경 셋업 | Expo 프로젝트, 폴리필, RN Navigation, `import xrpl` 성공 |
| 2 | NFC + 빈 화면 | EAS dev build 시연 폰 설치, NFC 태그 감지 콘솔 출력 |
| 3 | #1 + #2 (mock) | 카드 리스트 → 상세 → 거래 내역 (전부 mocks.ts) |
| 4 | #3 + 결제 E2E | Karin의 `findQuote`/`pay` 1차 연결, 개인 카드 결제 통과 |
| 5 | #4 + #5 + 그룹 생성 | Drawer + 그룹 리스트 + 생성 모달 (mock 가능) |
| 6 | #6 + #7 + 그룹 결제 | 멤버 리스트, 권한 토글, 그룹 카드로 결제 E2E |
| 7+ | 디자인 마감 + 백업 | 시연 폰 최종 점검, mock fallback 모드 |

**중요**: Day 3까지는 Karin이 안 만들어도 zo는 진행. Mock으로 화면 골격이 다 살아 있어야 Day 4부터 통합 시 빠름.

---

## 5가지 룰 적용

1. **무의미한 wrapper 금지** — `data/api.ts`가 thin pass-through 같지만, mock 토글이라는 진짜 책임이 있어서 OK. 그 외 1:1 wrapper 만들지 말 것
2. **추가 전 스캔** — 새 hook 만들기 전 `usePaymentFlow`/`useCards`/`useGroup` 셋 안에 넣을 수 있는지 확인
3. **재사용 안 될 타입 별칭 금지** — `Card`/`Tx`/`Member`/`Group`만. 화면별 props 타입은 inline
4. **불필요한 매개변수 금지** — `CardItem({ card, onPress })` 최소만. variant prop은 진짜 필요할 때만
5. **책임 분리** — 화면→hook→api→xrpl-core. 화면이 xrpl 직접 import 절대 금지

---

## UI 한정 주의사항

| # | 함정 | 대응 |
|---|---|---|
| 1 | NFC 중복 트리거 | PayScreen 진입/이탈 시 cancelTechnologyRequest. unmount cleanup 필수 |
| 2 | Drawer + Modal 충돌 | PayScreen은 `presentation: 'modal'`로 Drawer 위에 |
| 3 | 그룹 생성 10초+ 멈춤 | 단계별 로더 ("1/4 풀 지갑 생성...") |
| 4 | account_tx 매번 느림 | 화면 진입 1회 + pull-to-refresh. 메모리 캐시는 useCards 안에 |
| 5 | mock → 실제 전환 시 타입 깨짐 | `data/api.ts`의 mock·real 둘 다 동일한 타입(`types.ts`) 반환 강제 |

---

## 다음 액션

1. `docs/api-spec.md`를 위 "Karin과 합의" 표로 채우고 Karin에게 공유
2. 그룹 권한 메커니즘 V1(시드 공유) vs V2(SignerList) Karin과 결정
3. Day 1 환경 셋업 시작
