import * as mock from './mocks';
import {
  getOrCreateWallet,
  getWalletBalances,
  getUsdBalance,
  quoteKrw,
  payCrossCurrency,
} from './xrplClient';
import { getTxHistory } from '@transitx/xrpl-core';
import { USD_ISSUER, KRW_ISSUER, USD, KRW } from './xrplClient';
import { Card, Group, PayResult, Quote, Tx } from '../types';

// IOU 모델: 데모 유저는 USD/KRW IOU 잔고 보유. 결제는 USD→KRW cross-currency.
// 그룹/카드 목록은 mock 유지. real 실패 시 mock 으로 graceful degrade.
const MOCK = {
  myWallet: false,    // 실제 IOU 잔고
  myCards: false,     // 개인 카드만 실제 잔고로 덮어씀
  balance: false,
  txHistory: false,   // 개인 주소는 account_tx, 그룹은 mock
  myGroups: true,
  getGroup: true,
  quote: false,       // 실제 ripple_path_find
  pay: false,         // 실제 cross-currency Payment
  createGroup: true,
  addMember: true,
  freezeMember: true,
  removeMember: true,
};

const usdSpec = { currency: USD, issuer: USD_ISSUER };
const krwSpec = { currency: KRW, issuer: KRW_ISSUER };

// ─── public api ──────────────────────────────────────────────────

export const api = {
  // 지갑 패널: USD·KRW 합산 원화 환산을 balanceUsd(레거시명, 값은 KRW)에. usd/krw/rate 도 함께.
  myWallet: async (): Promise<{ address: string; balanceUsd: number; usd: number; krw: number; rate: number }> => {
    if (MOCK.myWallet) {
      const m = await mock.myWallet();
      return { ...m, usd: m.balanceUsd, krw: 0, rate: 1370 };
    }
    const b = await getWalletBalances();
    return { address: b.address, balanceUsd: b.totalKrw, usd: b.usd, krw: b.krw, rate: b.rate };
  },

  // 카드 목록: 개인 카드 = 실제 USD·KRW 합산 원화. 그룹 카드는 mock.
  myCards: async (): Promise<Card[]> => {
    const cards = await mock.myCards();
    if (MOCK.myCards) return cards;
    try {
      const b = await getWalletBalances();
      return cards.map((c) =>
        c.kind === 'personal'
          ? { ...c, address: b.address, balanceUsd: b.totalKrw, currency: 'KRW' as const }
          : c,
      );
    } catch {
      return cards;
    }
  },

  balance: async (addr: string): Promise<number> => {
    if (MOCK.balance) return mock.balance(addr);
    try {
      const w = await getOrCreateWallet();
      if (addr === w.address || addr === mock.MY_ADDR) {
        const b = await getWalletBalances();
        return b.totalKrw;
      }
    } catch {
      /* fall through */
    }
    return mock.balance(addr);
  },

  txHistory: async (addr: string): Promise<Tx[]> => {
    if (MOCK.txHistory) return mock.txHistory(addr);
    try {
      const w = await getOrCreateWallet();
      if (addr === w.address || addr === mock.MY_ADDR) {
        const recs = await getTxHistory(w.address, usdSpec, krwSpec, 25);
        return recs.map<Tx>((r) => ({
          hash: r.hash,
          timestamp: r.timestamp,
          merchant: r.outgoing ? '결제' : '입금',
          amountKrw: r.amountKrw,
          amountUsd: r.amountUsd,
          rate: r.rate,
          signer: w.address,
          real: true,
        }));
      }
    } catch {
      /* fall through */
    }
    return mock.txHistory(addr);
  },

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
    return payCrossCurrency(q);
  },

  // ─── 환전 (USD↔KRW) ─── ExchangeScreen 이 직접 xrplClient 를 쓰므로 api 에는 노출 안 함.

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
