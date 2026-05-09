import * as mock from './mocks';
import { Card, Group, PayResult, Quote, Tx } from '../types';

// 함수별 mock 토글. Karin이 한 함수씩 완성하면 이 줄만 false로.
const MOCK = {
  myWallet: true,
  myCards: true,
  balance: true,
  txHistory: true,
  myGroups: true,
  getGroup: true,
  quote: true,
  pay: true,
  createGroup: true,
  addMember: true,
  freezeMember: true,
  removeMember: true,
};

// ─── public api ──────────────────────────────────────────────────

export const api = {
  myWallet: (): Promise<{ address: string; balanceUsd: number }> =>
    MOCK.myWallet ? mock.myWallet() : Promise.reject(new Error('not implemented')),

  myCards: (): Promise<Card[]> =>
    MOCK.myCards ? mock.myCards() : Promise.reject(new Error('not implemented')),

  balance: (addr: string): Promise<number> =>
    MOCK.balance ? mock.balance(addr) : Promise.reject(new Error('not implemented')),

  txHistory: (addr: string): Promise<Tx[]> =>
    MOCK.txHistory ? mock.txHistory(addr) : Promise.reject(new Error('not implemented')),

  myGroups: (): Promise<Group[]> =>
    MOCK.myGroups ? mock.myGroups() : Promise.reject(new Error('not implemented')),

  getGroup: (addr: string): Promise<Group | undefined> =>
    MOCK.getGroup ? mock.getGroup(addr) : Promise.reject(new Error('not implemented')),

  quote: (krw: number): Promise<Quote> =>
    MOCK.quote ? mock.quote(krw) : Promise.reject(new Error('not implemented')),

  pay: (from: string, q: Quote, krw: number): Promise<PayResult> =>
    MOCK.pay ? mock.pay(from, q, krw) : Promise.reject(new Error('not implemented')),

  createGroup: (name: string, usd: number): Promise<Group> =>
    MOCK.createGroup ? mock.createGroup(name, usd) : Promise.reject(new Error('not implemented')),

  addMember: (groupAddr: string, memberAddr: string, alias: string): Promise<void> =>
    MOCK.addMember ? mock.addMember(groupAddr, memberAddr, alias) : Promise.reject(new Error('not implemented')),

  freezeMember: (groupAddr: string, memberAddr: string): Promise<void> =>
    MOCK.freezeMember ? mock.freezeMember(groupAddr, memberAddr) : Promise.reject(new Error('not implemented')),

  removeMember: (groupAddr: string, memberAddr: string): Promise<void> =>
    MOCK.removeMember ? mock.removeMember(groupAddr, memberAddr) : Promise.reject(new Error('not implemented')),
};
