import { Card, Group, Member, PayResult, Quote, Tx } from '../types';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const MY_ADDR = 'rZoDemoUserWalletAddr0001';
const MERCHANT = 'rTransitMerchantAddr0002';

// 시드 거래 내역
const seedTxs = (signer: string): Tx[] => [
  { hash: '0xMOCK001', timestamp: Date.now() - 1000 * 60 * 30,
    merchant: '서울 지하철 2호선', amountKrw: 1500, amountUsd: 1.09, rate: 1370.4, signer },
  { hash: '0xMOCK002', timestamp: Date.now() - 1000 * 60 * 60 * 4,
    merchant: 'GS25 강남역점', amountKrw: 4500, amountUsd: 3.28, rate: 1370.4, signer },
  { hash: '0xMOCK003', timestamp: Date.now() - 1000 * 60 * 60 * 28,
    merchant: '카카오T 택시', amountKrw: 12300, amountUsd: 8.97, rate: 1370.4, signer },
];

const seedGroup: Group = {
  address: 'rGroupCompanyPool0001',
  name: 'Acme Corp 출장 카드',
  balanceUsd: 1000,
  members: [
    { address: MY_ADDR, alias: '나 (관리자)', status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 },
    { address: 'rEmployeeKim0001', alias: '김수민', status: 'active', dailyLimitKrw: 50000, spentTodayKrw: 1500 },
    { address: 'rEmployeeLee0002', alias: '이은지', status: 'active', dailyLimitKrw: 50000, spentTodayKrw: 4500 },
  ],
};

// in-memory state
const state = {
  myAddr: MY_ADDR,
  merchant: MERCHANT,
  balances: {
    [MY_ADDR]: 100.0,
    [seedGroup.address]: 1000.0,
  } as Record<string, number>,
  txs: {
    [MY_ADDR]: seedTxs(MY_ADDR),
    [seedGroup.address]: [
      { hash: '0xMOCKG01', timestamp: Date.now() - 1000 * 60 * 90,
        merchant: '서울 지하철 2호선', amountKrw: 1500, amountUsd: 1.09, rate: 1370.4,
        signer: 'rEmployeeKim0001' },
      { hash: '0xMOCKG02', timestamp: Date.now() - 1000 * 60 * 60 * 6,
        merchant: 'GS25 강남역점', amountKrw: 4500, amountUsd: 3.28, rate: 1370.4,
        signer: 'rEmployeeLee0002' },
    ],
  } as Record<string, Tx[]>,
  groups: [seedGroup] as Group[],
};

// ─── public mock api ─────────────────────────────────────────────

export const myWallet = async (): Promise<{ address: string; balanceUsd: number }> => {
  await sleep(250);
  return {
    address: state.myAddr,
    balanceUsd: state.balances[state.myAddr] ?? 0,
  };
};

export const balance = async (addr: string): Promise<number> => {
  await sleep(300);
  return state.balances[addr] ?? 0;
};

export const txHistory = async (addr: string): Promise<Tx[]> => {
  await sleep(400);
  return state.txs[addr] ?? [];
};

export const myCards = async (): Promise<Card[]> => {
  await sleep(300);
  return [
    {
      id: state.myAddr,
      kind: 'personal',
      name: '내 카드',
      address: state.myAddr,
      balanceUsd: state.balances[state.myAddr] ?? 0,
    },
    ...state.groups.map<Card>((g) => ({
      id: g.address,
      kind: 'group',
      name: g.name,
      address: g.address,
      balanceUsd: state.balances[g.address] ?? 0,
    })),
  ];
};

export const myGroups = async (): Promise<Group[]> => {
  await sleep(300);
  return state.groups;
};

export const getGroup = async (addr: string): Promise<Group | undefined> => {
  await sleep(300);
  return state.groups.find((g) => g.address === addr);
};

export const quote = async (krw: number): Promise<Quote> => {
  await sleep(500);
  const rate = 1370.4;
  return { sendMaxUsd: (krw / rate) * 1.01, rate, paths: [] };
};

export const pay = async (from: string, q: Quote, krw: number): Promise<PayResult> => {
  await sleep(2000);
  state.balances[from] = (state.balances[from] ?? 0) - q.sendMaxUsd;
  const tx: Tx = {
    hash: '0xMOCK' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    timestamp: Date.now(),
    merchant: '서울 지하철 2호선',
    amountKrw: krw,
    amountUsd: q.sendMaxUsd,
    rate: q.rate,
    signer: from,
  };
  state.txs[from] = [tx, ...(state.txs[from] ?? [])];
  return { hash: tx.hash, delivered: krw };
};

export const createGroup = async (name: string, usd: number): Promise<Group> => {
  await sleep(3000);
  const newGroup: Group = {
    address: 'rGroup' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    name,
    balanceUsd: usd,
    members: [
      { address: state.myAddr, alias: '나 (관리자)', status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 },
    ],
  };
  state.groups.push(newGroup);
  state.balances[newGroup.address] = usd;
  state.txs[newGroup.address] = [];
  // 내 잔액에서도 차감 (충전한 셈)
  state.balances[state.myAddr] = (state.balances[state.myAddr] ?? 0) - usd;
  return newGroup;
};

export const addMember = async (groupAddr: string, memberAddr: string, alias: string): Promise<void> => {
  await sleep(1500);
  const g = state.groups.find((x) => x.address === groupAddr);
  if (!g) return;
  g.members.push({ address: memberAddr, alias, status: 'active', dailyLimitKrw: 0, spentTodayKrw: 0 });
};

export const freezeMember = async (groupAddr: string, memberAddr: string): Promise<void> => {
  await sleep(1500);
  const g = state.groups.find((x) => x.address === groupAddr);
  const m = g?.members.find((x) => x.address === memberAddr);
  if (m) m.status = m.status === 'active' ? 'frozen' : 'active';
};

export const removeMember = async (groupAddr: string, memberAddr: string): Promise<void> => {
  await sleep(1500);
  const g = state.groups.find((x) => x.address === groupAddr);
  if (!g) return;
  g.members = g.members.filter((x) => x.address !== memberAddr);
};
