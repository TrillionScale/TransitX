# TransitX MVP TODO

데모 happy path: 폰을 NFC 태그에 갖다댐 → NFC 감지 → ripple_path_find → Payment(SendMax USD, Amount KRW=1500) → 잔액 갱신 → 성공 팝업.
P0 = 데모 시연 필수. P1 = nice-to-have.

추가 기능: **그룹 풀** (공용 카드 — 한 풀에 여러 명이 결제 권한)

담당:
- **Zo** (UI + NFC): [docs/todo-zo-ui.md](docs/todo-zo-ui.md)
- **Karin** (XRPL + 백엔드 차후): 카테고리 2 + docs/api-spec.md

---

## 카테고리 1: UI (Zo)

상세 화면별 작업은 [docs/todo-zo-ui.md](docs/todo-zo-ui.md) 참고.

- [ ] **[P0] CardListScreen** — 메인, Apple Wallet 스타일 카드 스택
- [ ] **[P0] CardDetailScreen** — Wise 스타일, 잔고 + 거래 내역
- [ ] **[P0] PayScreen** — Apple Pay 스타일, NFC 결제
- [ ] **[P0] SideMenuScreen (Drawer)** — 내 지갑 / 그룹 관리
- [ ] **[P0] GroupListScreen** — 그룹 리스트 + 생성
- [ ] **[P0] GroupDetailScreen** — 멤버 리스트
- [ ] **[P0] MemberDetailScreen** — 권한 동결 / 퇴장
- [ ] **[P0] usePaymentFlow / useCards / useGroup hooks**
- [ ] **[P0] Mock-first 풀 플로우** — `data/api.ts` 토글로 mock·real 전환
- [ ] **[P1] 에러 토스트, 카운트업 애니메이션**

## 카테고리 2: XRPL (Karin)

순서대로 실행하면 데모 환경 완성.

- [ ] **[P0] packages/xrpl-core 패키지 셋업**
- [ ] **[P0] xrpl-core/client.ts** — Client 싱글톤 + getClient()
- [ ] **[P0] xrpl-core/wallet.ts** — Wallet.fromSeed(seed)
- [ ] **[P0] xrpl-core/balance.ts** — getIouBalance(addr, currency, issuer)
- [ ] **[P0] xrpl-core/pathfind.ts** — findIouPath(...) → { sendMax, paths, rate }
- [ ] **[P0] xrpl-core/pay.ts** — payIou(...) → autofill → submitAndWait
- [ ] **[P0] xrpl-core/format.ts** — formatAmount(value, 'USD'|'KRW')
- [ ] **[P0] xrpl-core/groups.ts** — createGroupPool, addMember, freezeMember, removeMember (메커니즘 zo와 합의)
- [ ] **[P0] xrpl-core/history.ts** — getTxHistory(addr, limit)
- [ ] **[P0] scripts/01-create-issuers.ts** — fundWallet ×2 → USD_ISSUER/KRW_ISSUER
- [ ] **[P0] scripts/02-set-default-ripple.ts** — AccountSet asfDefaultRipple
- [ ] **[P0] scripts/03-create-user.ts** — fundWallet + TrustSet USD/KRW → DEMO_SEED
- [ ] **[P0] scripts/04-issue-liquidity.ts** — LP 지갑 fund + 발행
- [ ] **[P0] scripts/05-seed-orderbook.ts** — OfferCreate 양방향, mid 1370
- [ ] **[P0] scripts/06-verify-path.ts** — sanity check

## 카테고리 3: 모바일 / Expo / NFC (Zo)

- [ ] **[P0] 모노레포 셋업** — package.json workspaces, tsconfig.base.json
- [ ] **[P0] create-expo-app mobile**
- [ ] **[P0] 폴리필 설치 + metro.config.js + App.tsx 첫 줄 import**
- [ ] **[P0] env 로딩** (.env / .env.example)
- [ ] **[P0] react-native-nfc-manager + iOS NFC entitlement**
- [ ] **[P0] EAS dev build 시연 폰 설치**
- [ ] **[P0] E2E 1회 통과**

## 카테고리 4: docs

- [ ] **[P0] docs/api-spec.md** — xrpl-core 함수 시그니처. zo↔Karin 합의
- [ ] **[P0] docs/demo-scenario.md** — 시연 대본 + 백업
- [ ] **[P0] docs/todo-zo-ui.md** — UI 화면별 상세 (이미 작성됨)

## 카테고리 5: 데모 이후 (out of scope)

- [ ] backend/ 신설 + Express
- [ ] 시드 키 분리 (KMS / 지갑 연동)
- [ ] 결제 영수증·정산 DB
- [ ] 메인넷 issuer 운영
- [ ] DID·ZK 신원 인증
- [ ] AI 멀티모달 결제 맥락 인지

---

## 조심해야 할 것들

1. **issuer DefaultRipple** — 안 하면 cross-currency 전부 tecPATH_DRY (script 02에서 처리)
2. **호가 시딩 확인** — alternatives 0개면 결제 시작 불가 (script 05/06)
3. **iOS NFC = EAS dev build 필수** — Expo Go 미지원
4. **시드 보호** — `.env`는 `.gitignore`. `.env.example`만 커밋

## 검증 방법 (E2E)

1. `scripts/01~05` 순서대로 → `06-verify-path.ts` 통과
2. EAS dev build 시연 폰에서 앱 실행 → 잔액 카드 표시
3. PayScreen → NFC 태그 감지 → 견적 표시 → ~4s 후 성공 팝업
4. Explorer 링크 → testnet.xrpl.org에서 tesSUCCESS 확인
5. 카드 잔액 갱신

## 코딩 룰

1. **무의미한 wrapper 금지**
2. **추가 전 스캔** — 같은 목적 함수 두 개 금지
3. **재사용 안 될 타입 별칭 금지** — inline
4. **불필요한 매개변수 금지**
5. **책임 분리 명확히**
