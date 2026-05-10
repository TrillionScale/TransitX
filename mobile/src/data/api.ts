import * as mock from './mocks';
import {
  getOrCreateWallet,
  getXrpBalance,
  quoteKrw,
  sendXrpPayment,
  MERCHANT_ADDRESS,
} from './xrplClient';
import { Card, Group, PayResult, Quote, Tx } from '../types';

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
  myWallet: async (): Promise<{ address: string; balanceUsd: number }> => {
    if (MOCK.myWallet) return mock.myWallet();
    const wallet = await getOrCreateWallet();
    const xrp = await getXrpBalance(wallet.address);
    // XRP → USD 간단 환산 (표시용)
    let xrpUsd = 0.5;
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
      const d = await res.json();
      xrpUsd = d.ripple.usd;
    } catch { /* ignore */ }
    return { address: wallet.address, balanceUsd: xrp * xrpUsd };
  },

  myCards: (): Promise<Card[]> =>
    MOCK.myCards ? mock.myCards() : Promise.reject(new Error('not implemented')),

  balance: async (addr: string): Promise<number> => {
    if (MOCK.balance) return mock.balance(addr);
    return getXrpBalance(addr);
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
