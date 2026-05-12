import * as mock from './mocks';
import {
  getOrCreateWallet,
  getXrpBalance,
  getXrpKrwRate,
  quoteKrw,
  sendXrpPayment,
  MERCHANT_ADDRESS,
} from './xrplClient';
import { Card, Group, PayResult, Quote, Tx } from '../types';

// 실제 testnet XRP 잔액을 KRW로 환산 (개인 카드/지갑 표시용).
async function realWalletKrw(): Promise<{ address: string; balanceKrw: number }> {
  const [wallet, rate] = await Promise.all([getOrCreateWallet(), getXrpKrwRate()]);
  const xrp = await getXrpBalance(wallet.address);
  return { address: wallet.address, balanceKrw: xrp * rate };
}

// mock 토글: false로 바꾸면 실제 XRPL 사용
const MOCK = {
  myWallet: false,  // ← 실제 XRPL 지갑
  myCards: true,
  balance: false,   // ← 실제 XRP 잔액
  txHistory: true,
  myGroups: true,
  getGroup: true,
  quote: false,     // ← 실제 환율 (CoinGecko)
  pay: false,       // ← 실제 XRPL 결제
  createGroup: true,
  addMember: true,
  freezeMember: true,
  removeMember: true,
};

// ─── public api ──────────────────────────────────────────────────

export const api = {
  // 지갑 패널: 실제 XRP를 KRW로 환산해서 보여준다.
  myWallet: async (): Promise<{ address: string; balanceUsd: number }> => {
    if (MOCK.myWallet) return mock.myWallet();
    const { address, balanceKrw } = await realWalletKrw();
    return { address, balanceUsd: balanceKrw }; // 필드명은 레거시 — 값은 KRW
  },

  // 카드 목록: 개인 카드만 실제 XRP→KRW 잔액으로 덮어쓴다. 그룹 카드는 mock.
  myCards: async (): Promise<Card[]> => {
    const cards = await mock.myCards();
    if (MOCK.myWallet) return cards;
    try {
      const { balanceKrw } = await realWalletKrw();
      return cards.map((c) =>
        c.kind === 'personal'
          ? { ...c, balanceUsd: balanceKrw, currency: 'KRW' as const }
          : c,
      );
    } catch {
      return cards; // testnet 안 되면 mock 그대로
    }
  },

  balance: async (addr: string): Promise<number> => {
    if (MOCK.balance) return mock.balance(addr);
    if (addr === mock.MY_ADDR) {
      const { balanceKrw } = await realWalletKrw();
      return balanceKrw;
    }
    return mock.balance(addr); // 그룹 등은 mock
  },

  txHistory: (addr: string): Promise<Tx[]> =>
    MOCK.txHistory ? mock.txHistory(addr) : Promise.reject(new Error('not implemented')),

  myGroups: (): Promise<Group[]> =>
    MOCK.myGroups ? mock.myGroups() : Promise.reject(new Error('not implemented')),

  getGroup: (addr: string): Promise<Group | undefined> =>
    MOCK.getGroup ? mock.getGroup(addr) : Promise.reject(new Error('not implemented')),

  quote: async (krw: number): Promise<Quote> => {
    if (MOCK.quote) return mock.quote(krw);
    return quoteKrw(krw);
  },

  pay: async (from: string, q: Quote, krw: number): Promise<PayResult> => {
    if (MOCK.pay) return mock.pay(from, q, krw);
    const wallet = await getOrCreateWallet();
    const drops = (q.paths[0] as any)?.drops as string;
    if (!drops) throw new Error('Invalid quote: missing drops');
    return sendXrpPayment(wallet, MERCHANT_ADDRESS, drops);
  },

  createGroup: (name: string, usd: number): Promise<Group> =>
    MOCK.createGroup ? mock.createGroup(name, usd) : Promise.reject(new Error('not implemented')),

  addMember: (groupAddr: string, memberAddr: string, alias: string): Promise<void> =>
    MOCK.addMember ? mock.addMember(groupAddr, memberAddr, alias) : Promise.reject(new Error('not implemented')),

  freezeMember: (groupAddr: string, memberAddr: string): Promise<void> =>
    MOCK.freezeMember ? mock.freezeMember(groupAddr, memberAddr) : Promise.reject(new Error('not implemented')),

  removeMember: (groupAddr: string, memberAddr: string): Promise<void> =>
    MOCK.removeMember ? mock.removeMember(groupAddr, memberAddr) : Promise.reject(new Error('not implemented')),

  updateMember: (
    groupAddr: string,
    memberAddr: string,
    data: { alias?: string; dailyLimitKrw?: number },
  ): Promise<void> => mock.updateMember(groupAddr, memberAddr, data),
};
