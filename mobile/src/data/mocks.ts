import { Card, Group, Member, PayResult, Quote, Tx } from '../types';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── 주소 상수 ───────────────────────────────────────────────────
export const MY_ADDR = 'rKarin9xTX7mWpHJ2BqFsZ8dEuV4QNf1';
const GROUP1    = 'rAcmeCorpTravelPoolXXXX01';
const GROUP2    = 'rTeamDinnerFundXXXXXXX02';

const MEM_KIM   = 'rKimSuMin9xTX7mWpHJXXXX1';
const MEM_LEE   = 'rLeeEunJi9xTXmWpHJXXXX2';
const MEM_PARK  = 'rParkJunHyukXXXXXXXXXXX3';
const MEM_CHOI  = 'rChoiSeoYeonXXXXXXXXXXX4';
const MEM_HWANG = 'rHwangMinJunXXXXXXXXXXX5';

// ─── 유틸 ────────────────────────────────────────────────────────
const h = (n: number) => Math.round(n * 100) / 100;
const ago = (ms: number) => Date.now() - ms;
const min = (n: number) => ago(n * 60 * 1000);
const hr  = (n: number) => ago(n * 60 * 60 * 1000);
const day = (n: number) => ago(n * 24 * 60 * 60 * 1000);

// ─── 잔고 ────────────────────────────────────────────────────────
const balances: Record<string, number> = {
  [MY_ADDR]: 247.50,
  [GROUP1]:  1840.00,
  [GROUP2]:  520.00,
};

// ─── 거래 내역 ───────────────────────────────────────────────────

const personalTxs: Tx[] = [
  { hash: 'A1B2C3D4E5F6001', timestamp: min(18),  merchant: '스타벅스 강남역점',      amountKrw: 6500,  amountUsd: 4.74,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6002', timestamp: hr(1.5),   merchant: '서울 지하철 2호선',      amountKrw: 1500,  amountUsd: 1.09,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6003', timestamp: hr(3),     merchant: 'GS25 역삼점',            amountKrw: 3800,  amountUsd: 2.77,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6004', timestamp: hr(6),     merchant: '쿠팡이츠 배달',          amountKrw: 18500, amountUsd: 13.49, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6005', timestamp: day(1),    merchant: '교보문고 강남점',         amountKrw: 24000, amountUsd: 17.50, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6006', timestamp: day(1.2),  merchant: 'CGV 강남',               amountKrw: 15000, amountUsd: 10.94, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6007', timestamp: day(1.5),  merchant: '올리브영 신논현점',       amountKrw: 32000, amountUsd: 23.34, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6008', timestamp: day(2),    merchant: '카카오T 블루',            amountKrw: 9800,  amountUsd: 7.15,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6009', timestamp: day(2.3),  merchant: '롯데마트 잠실점',         amountKrw: 55600, amountUsd: 40.55, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6010', timestamp: day(3),    merchant: '무신사 스토어',           amountKrw: 79000, amountUsd: 57.62, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6011', timestamp: day(3.5),  merchant: '배달의민족',              amountKrw: 23500, amountUsd: 17.14, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6012', timestamp: day(4),    merchant: '넷플릭스 구독',           amountKrw: 17000, amountUsd: 12.40, rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6013', timestamp: day(5),    merchant: '이마트24 삼성역',         amountKrw: 4200,  amountUsd: 3.06,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6014', timestamp: day(6),    merchant: '서울 지하철 9호선',       amountKrw: 1500,  amountUsd: 1.09,  rate: 1371.0, signer: MY_ADDR },
  { hash: 'A1B2C3D4E5F6015', timestamp: day(7),    merchant: '투썸플레이스 선릉점',     amountKrw: 8500,  amountUsd: 6.20,  rate: 1371.0, signer: MY_ADDR },
];

const group1Txs: Tx[] = [
  { hash: 'G1A2B3C4D5E6001', timestamp: min(45),   merchant: '그랜드 인터컨티넨탈 호텔', amountKrw: 320000, amountUsd: 233.40, rate: 1371.0, signer: MEM_KIM  },
  { hash: 'G1A2B3C4D5E6002', timestamp: hr(2),     merchant: '인천공항 라운지',           amountKrw: 45000,  amountUsd: 32.82,  rate: 1371.0, signer: MEM_LEE  },
  { hash: 'G1A2B3C4D5E6003', timestamp: hr(5),     merchant: '대한항공 기내식',            amountKrw: 28000,  amountUsd: 20.42,  rate: 1371.0, signer: MY_ADDR  },
  { hash: 'G1A2B3C4D5E6004', timestamp: day(1),    merchant: '도쿄 택시',                 amountKrw: 22000,  amountUsd: 16.04,  rate: 1371.0, signer: MEM_PARK },
  { hash: 'G1A2B3C4D5E6005', timestamp: day(1.4),  merchant: '시부야 회의장 대관',         amountKrw: 180000, amountUsd: 131.29, rate: 1371.0, signer: MEM_KIM  },
  { hash: 'G1A2B3C4D5E6006', timestamp: day(2),    merchant: '일본 비즈니스 런치',         amountKrw: 68000,  amountUsd: 49.60,  rate: 1371.0, signer: MEM_LEE  },
  { hash: 'G1A2B3C4D5E6007', timestamp: day(2.5),  merchant: '긴자 클라이언트 디너',       amountKrw: 145000, amountUsd: 105.76, rate: 1371.0, signer: MY_ADDR  },
  { hash: 'G1A2B3C4D5E6008', timestamp: day(3),    merchant: '하네다공항 면세점',          amountKrw: 87000,  amountUsd: 63.46,  rate: 1371.0, signer: MEM_CHOI },
  { hash: 'G1A2B3C4D5E6009', timestamp: day(4),    merchant: '김포공항 리무진',            amountKrw: 12000,  amountUsd: 8.75,   rate: 1371.0, signer: MEM_PARK },
  { hash: 'G1A2B3C4D5E6010', timestamp: day(5),    merchant: '파르나스 호텔 조식',         amountKrw: 55000,  amountUsd: 40.12,  rate: 1371.0, signer: MEM_HWANG},
  { hash: 'G1A2B3C4D5E6011', timestamp: day(6),    merchant: 'WeWork 강남 코워킹',        amountKrw: 220000, amountUsd: 160.47, rate: 1371.0, signer: MY_ADDR  },
  { hash: 'G1A2B3C4D5E6012', timestamp: day(7),    merchant: 'Uber 싱가포르',             amountKrw: 34000,  amountUsd: 24.80,  rate: 1371.0, signer: MEM_KIM  },
];

const group2Txs: Tx[] = [
  { hash: 'G2A2B3C4D5E6001', timestamp: hr(3),     merchant: '이태원 고든램지 버거',     amountKrw: 72000,  amountUsd: 52.51, rate: 1371.0, signer: MY_ADDR  },
  { hash: 'G2A2B3C4D5E6002', timestamp: day(1),    merchant: '한남동 루프탑 레스토랑',   amountKrw: 140000, amountUsd: 102.11,rate: 1371.0, signer: MEM_LEE  },
  { hash: 'G2A2B3C4D5E6003', timestamp: day(2),    merchant: '성수동 카페 세미나',       amountKrw: 38000,  amountUsd: 27.72, rate: 1371.0, signer: MEM_KIM  },
  { hash: 'G2A2B3C4D5E6004', timestamp: day(3),    merchant: '강남 클럽나이트 식비',     amountKrw: 85000,  amountUsd: 62.00, rate: 1371.0, signer: MEM_PARK },
  { hash: 'G2A2B3C4D5E6005', timestamp: day(5),    merchant: '노량진 팀 회식',           amountKrw: 95000,  amountUsd: 69.29, rate: 1371.0, signer: MY_ADDR  },
  { hash: 'G2A2B3C4D5E6006', timestamp: day(7),    merchant: '삼청동 한식당',            amountKrw: 65000,  amountUsd: 47.41, rate: 1371.0, signer: MEM_CHOI },
];

const txMap: Record<string, Tx[]> = {
  [MY_ADDR]: personalTxs,
  [GROUP1]:  group1Txs,
  [GROUP2]:  group2Txs,
};

// ─── 그룹 ────────────────────────────────────────────────────────

const group1: Group = {
  address: GROUP1,
  name: 'Acme Corp 출장 카드',
  balanceUsd: 1840.00,
  members: [
    { address: MY_ADDR,    alias: '나 (관리자)',  status: 'active', dailyLimitKrw: 0,      spentTodayKrw: 28000  },
    { address: MEM_KIM,    alias: '김수민',       status: 'active', dailyLimitKrw: 200000, spentTodayKrw: 145000 },
    { address: MEM_LEE,    alias: '이은지',       status: 'active', dailyLimitKrw: 150000, spentTodayKrw: 45000  },
    { address: MEM_PARK,   alias: '박준혁',       status: 'active', dailyLimitKrw: 150000, spentTodayKrw: 22000  },
    { address: MEM_CHOI,   alias: '최서연',       status: 'frozen', dailyLimitKrw: 100000, spentTodayKrw: 0      },
    { address: MEM_HWANG,  alias: '황민준',       status: 'active', dailyLimitKrw: 100000, spentTodayKrw: 55000  },
  ],
};

const group2: Group = {
  address: GROUP2,
  name: '팀 회식비',
  balanceUsd: 520.00,
  members: [
    { address: MY_ADDR,  alias: '나 (관리자)', status: 'active', dailyLimitKrw: 0,      spentTodayKrw: 0     },
    { address: MEM_KIM,  alias: '김수민',      status: 'active', dailyLimitKrw: 100000, spentTodayKrw: 38000 },
    { address: MEM_LEE,  alias: '이은지',      status: 'active', dailyLimitKrw: 100000, spentTodayKrw: 0     },
    { address: MEM_PARK, alias: '박준혁',      status: 'active', dailyLimitKrw: 80000,  spentTodayKrw: 0     },
    { address: MEM_CHOI, alias: '최서연',      status: 'active', dailyLimitKrw: 80000,  spentTodayKrw: 0     },
  ],
};

const groups = [group1, group2];

// ─── Public mock API ─────────────────────────────────────────────

export const myWallet = async (): Promise<{ address: string; balanceUsd: number }> => {
  await sleep(200);
  return { address: MY_ADDR, balanceUsd: balances[MY_ADDR] };
};

export const balance = async (addr: string): Promise<number> => {
  await sleep(150);
  return balances[addr] ?? 0;
};

export const txHistory = async (addr: string): Promise<Tx[]> => {
  await sleep(300);
  return txMap[addr] ?? [];
};

export const myCards = async (): Promise<Card[]> => {
  await sleep(250);
  return [
    {
      id: MY_ADDR,
      kind: 'personal',
      name: '내 카드',
      address: MY_ADDR,
      balanceUsd: balances[MY_ADDR],
    },
    ...groups.map<Card>((g) => ({
      id: g.address,
      kind: 'group',
      name: g.name,
      address: g.address,
      balanceUsd: balances[g.address],
    })),
  ];
};

export const myGroups = async (): Promise<Group[]> => {
  await sleep(200);
  return groups;
};

export const getGroup = async (addr: string): Promise<Group | undefined> => {
  await sleep(200);
  return groups.find((g) => g.address === addr);
};

export const quote = async (krw: number): Promise<Quote> => {
  await sleep(400);
  const rate = 1371.0;
  return { sendMaxUsd: h((krw / rate) * 1.01), rate, paths: [] };
};

export const pay = async (from: string, q: Quote, krw: number): Promise<PayResult> => {
  await sleep(1800);
  balances[from] = h((balances[from] ?? 0) - q.sendMaxUsd);
  const tx: Tx = {
    hash: 'TX' + Math.random().toString(36).slice(2, 14).toUpperCase(),
    timestamp: Date.now(),
    merchant: '결제 완료',
    amountKrw: krw,
    amountUsd: q.sendMaxUsd,
    rate: q.rate,
    signer: from,
  };
  txMap[from] = [tx, ...(txMap[from] ?? [])];
  return { hash: tx.hash, delivered: krw };
};

// 실제 XRPL 결제가 끝난 뒤 해당 카드(MY_ADDR 등)의 mock 거래내역 맨 위에 꽂는다.
// hash는 testnet 실제 트랜잭션 해시 → TxRow에서 explorer 링크로 연결.
export const appendRealTx = (
  cardAddr: string,
  tx: { hash: string; merchant: string; amountKrw: number; amountUsd: number; rate: number },
): void => {
  const entry: Tx = {
    hash: tx.hash,
    timestamp: Date.now(),
    merchant: tx.merchant,
    amountKrw: tx.amountKrw,
    amountUsd: tx.amountUsd,
    rate: tx.rate,
    signer: cardAddr,
    real: true,
  };
  txMap[cardAddr] = [entry, ...(txMap[cardAddr] ?? [])];
  balances[cardAddr] = h((balances[cardAddr] ?? 0) - tx.amountUsd);
};

export const createGroup = async (name: string, usd: number): Promise<Group> => {
  await sleep(2000);
  const addr = 'rGroup' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const newGroup: Group = {
    address: addr,
    name,
    balanceUsd: usd,
    members: [
      { address: MY_ADDR, alias: '나 (관리자)', status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 },
    ],
  };
  groups.push(newGroup);
  balances[addr] = usd;
  balances[MY_ADDR] = h((balances[MY_ADDR] ?? 0) - usd);
  txMap[addr] = [];
  return newGroup;
};

export const addMember = async (groupAddr: string, memberAddr: string, alias: string): Promise<void> => {
  await sleep(1200);
  const g = groups.find((x) => x.address === groupAddr);
  if (!g) return;
  g.members.push({ address: memberAddr, alias, status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 });
};

export const freezeMember = async (groupAddr: string, memberAddr: string): Promise<void> => {
  await sleep(1000);
  const g = groups.find((x) => x.address === groupAddr);
  const m = g?.members.find((x) => x.address === memberAddr);
  if (m) m.status = m.status === 'active' ? 'frozen' : 'active';
};

export const removeMember = async (groupAddr: string, memberAddr: string): Promise<void> => {
  await sleep(1000);
  const g = groups.find((x) => x.address === groupAddr);
  if (!g) return;
  g.members = g.members.filter((x) => x.address !== memberAddr);
};

export const updateMember = async (
  groupAddr: string,
  memberAddr: string,
  data: { alias?: string; dailyLimitKrw?: number },
): Promise<void> => {
  await sleep(600);
  const g = groups.find((x) => x.address === groupAddr);
  const m = g?.members.find((x) => x.address === memberAddr);
  if (!m) return;
  if (data.alias !== undefined) m.alias = data.alias;
  if (data.dailyLimitKrw !== undefined) m.dailyLimitKrw = data.dailyLimitKrw;
};
