// XRPL IOU 레이어 — packages/xrpl-core 위에서 TransitX 도메인(USD↔KRW)에 맞춘 래퍼.
import type { Wallet, Amount } from 'xrpl';
import {
  setServer,
  walletFromSeed,
  getIouBalance,
  getXrpBalance,
  findIouPath,
  payIou,
  type PathQuote,
} from '@transitx/xrpl-core';
import {
  XRPL_SERVER,
  USD_ISSUER_ADDR,
  KRW_ISSUER_ADDR,
  DEMO_SEED,
  DEMO_ADDR,
  MERCHANT_ADDR,
  LP_ADDR,
} from '@env';
import { Quote, PayResult } from '../types';

// ─── 환경 ────────────────────────────────────────────────────────
if (XRPL_SERVER) setServer(XRPL_SERVER);

export const USD = 'USD';
export const KRW = 'KRW';
export const USD_ISSUER = USD_ISSUER_ADDR ?? '';
export const KRW_ISSUER = KRW_ISSUER_ADDR ?? '';
// 머천트(Transit 단말기): .env에 없으면 LP를 결제 대상으로 사용 (데모 환경에선 LP가 KRW를 받아줌).
export const MERCHANT_ADDRESS = MERCHANT_ADDR || LP_ADDR || '';

const usdSpec = { currency: USD, issuer: USD_ISSUER };
const krwSpec = { currency: KRW, issuer: KRW_ISSUER };

function envReady(): boolean {
  return !!(DEMO_SEED && USD_ISSUER && KRW_ISSUER && MERCHANT_ADDRESS);
}

// ─── 지갑 (데모: .env DEMO_SEED 고정) ────────────────────────────
let _wallet: Wallet | null = null;

export async function getOrCreateWallet(): Promise<Wallet> {
  if (_wallet) return _wallet;
  if (!DEMO_SEED) throw new Error('DEMO_SEED 미설정 — 루트에서 `npm run setup:all` 실행 후 `expo start -c`');
  _wallet = walletFromSeed(DEMO_SEED);
  return _wallet;
}

export function demoAddress(): string {
  return DEMO_ADDR || '';
}

// ─── 잔액 ────────────────────────────────────────────────────────
export async function getUsdBalance(address?: string): Promise<number> {
  const addr = address ?? (await getOrCreateWallet()).address;
  return getIouBalance(addr, USD, USD_ISSUER);
}
export async function getKrwBalance(address?: string): Promise<number> {
  const addr = address ?? (await getOrCreateWallet()).address;
  return getIouBalance(addr, KRW, KRW_ISSUER);
}
/** XRP 잔액 (계정 활성화/수수료 확인용) */
export { getXrpBalance };

/** 데모 유저의 USD·KRW 잔고와 환율(1500 KRW path 기준 추정) */
export async function getWalletBalances(): Promise<{
  address: string;
  usd: number;
  krw: number;
  /** 합산 원화 환산 (krw + usd×rate) */
  totalKrw: number;
  rate: number; // KRW per USD
}> {
  const w = await getOrCreateWallet();
  const [usd, krw] = await Promise.all([getUsdBalance(w.address), getKrwBalance(w.address)]);
  let rate = 1370;
  try {
    if (usd > 0) {
      const q = await findIouPath(w.address, MERCHANT_ADDRESS, krwAmount('1000'), usdSpec);
      // q.rate = sendMaxUsd / destKrw → KRW per USD = 1 / q.rate
      if (q.rate > 0) rate = 1 / q.rate;
    }
  } catch {
    /* keep default */
  }
  return { address: w.address, usd, krw, totalKrw: krw + usd * rate, rate };
}

// ─── 금액 헬퍼 ───────────────────────────────────────────────────
function krwAmount(value: string): Amount {
  return { currency: KRW, issuer: KRW_ISSUER, value };
}
function usdAmount(value: string): Amount {
  return { currency: USD, issuer: USD_ISSUER, value };
}

// ─── 결제: USD → KRW (cross-currency, 머천트에게 정확히 N KRW 전달) ──
/** Quote.paths 에 path-find 결과를, sendMaxUsd 에 SendMax USD 값을 담는다. */
export async function quoteKrw(krw: number): Promise<Quote> {
  if (!envReady()) throw new Error('XRPL_ENV_NOT_READY');
  const w = await getOrCreateWallet();
  const q: PathQuote = await findIouPath(
    w.address,
    MERCHANT_ADDRESS,
    krwAmount(String(krw)),
    usdSpec,
  );
  const sendMaxUsd = typeof q.sendMax === 'string' ? Number(q.sendMax) / 1e6 : Number(q.sendMax.value);
  return {
    sendMaxUsd,
    rate: q.rate > 0 ? 1 / q.rate : 0, // KRW per USD
    paths: q.paths as unknown[],
    _xrpl: { sendMax: q.sendMax, amountKrw: String(krw) },
  };
}

export async function payCrossCurrency(q: Quote): Promise<PayResult> {
  const w = await getOrCreateWallet();
  const x = (q as any)._xrpl as { sendMax: Amount; amountKrw: string } | undefined;
  if (!x) throw new Error('Invalid quote: missing _xrpl');
  const r = await payIou(w, {
    destination: MERCHANT_ADDRESS,
    amount: krwAmount(x.amountKrw),
    sendMax: x.sendMax,
    paths: (q.paths as any[]).length ? (q.paths as any[]) : undefined,
  });
  return { hash: r.hash, delivered: r.delivered };
}

// ─── 환전: USD↔KRW 자가결제 (Account == Destination) ─────────────
export type ExchangeDir = 'USD_TO_KRW' | 'KRW_TO_USD';

export type ExchangeQuote = {
  dir: ExchangeDir;
  /** 입력 통화로 지불하는 양 (SendMax 기준, 슬리피지 버퍼 포함) — 표시용 숫자 */
  payValue: number;
  /** 받는 통화로 받는 양 — 표시용 숫자 */
  receiveValue: number;
  /** 1 (받는통화)당 (주는통화) — 표시용 */
  rate: number;
  _xrpl: { sendMax: Amount; amount: Amount };
};

/** dir 기준, 받을 통화 수량(amountToReceive)을 정해 견적. (받는 쪽 고정형) */
export async function quoteExchange(dir: ExchangeDir, amountToReceive: number): Promise<ExchangeQuote> {
  if (!envReady()) throw new Error('XRPL_ENV_NOT_READY');
  const w = await getOrCreateWallet();
  const recvSpec = dir === 'USD_TO_KRW' ? krwSpec : usdSpec;
  const sendSpec = dir === 'USD_TO_KRW' ? usdSpec : krwSpec;
  const amount: Amount = { ...recvSpec, value: String(amountToReceive) };

  const q = await findIouPath(w.address, w.address, amount, sendSpec);
  const payValue = typeof q.sendMax === 'string' ? Number(q.sendMax) / 1e6 : Number(q.sendMax.value);
  return {
    dir,
    payValue,
    receiveValue: amountToReceive,
    rate: amountToReceive > 0 ? payValue / amountToReceive : 0,
    _xrpl: { sendMax: q.sendMax, amount },
  };
}

export async function executeExchange(q: ExchangeQuote): Promise<PayResult> {
  const w = await getOrCreateWallet();
  const r = await payIou(w, {
    destination: w.address, // self
    amount: q._xrpl.amount,
    sendMax: q._xrpl.sendMax,
  });
  return { hash: r.hash, delivered: r.delivered };
}

// ─── USD IOU 송금 (같은 issuer, 단순 이전) ───────────────────────
export async function sendUsd(toAddress: string, usd: number): Promise<PayResult> {
  if (!envReady()) throw new Error('XRPL_ENV_NOT_READY');
  const w = await getOrCreateWallet();
  const r = await payIou(w, {
    destination: toAddress,
    amount: usdAmount(String(usd)),
  });
  return { hash: r.hash, delivered: r.delivered };
}
