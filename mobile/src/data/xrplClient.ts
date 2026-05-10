import { Client, Wallet, Payment } from 'xrpl';
import { Quote, PayResult } from '../types';

// ─── XRPL Testnet 설정 ────────────────────────────────────────────
const XRPL_SERVER = 'wss://s.altnet.rippletest.net:51233';

// 테스트넷 merchant 주소 (Transit 단말기)
export const MERCHANT_ADDRESS = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';

let _client: Client | null = null;

async function getClient(): Promise<Client> {
  if (_client && _client.isConnected()) return _client;
  _client = new Client(XRPL_SERVER);
  await _client.connect();
  return _client;
}

// ─── 지갑 관리 ───────────────────────────────────────────────────

const WALLET_KEY = 'transitx_wallet_seed';

let _cachedWallet: Wallet | null = null;

export async function getOrCreateWallet(): Promise<Wallet> {
  if (_cachedWallet) return _cachedWallet;

  // 저장된 시드가 있으면 복원
  try {
    const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const saved = await AsyncStorage.getItem(WALLET_KEY);
    if (saved) {
      _cachedWallet = Wallet.fromSeed(saved);
      return _cachedWallet;
    }
  } catch {
    // AsyncStorage 없으면 메모리 전용으로 진행
  }

  // 새 테스트넷 지갑 생성 + faucet 자동 충전
  const client = await getClient();
  const { wallet } = await client.fundWallet(); // testnet faucet 자동 호출
  _cachedWallet = wallet;

  try {
    const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(WALLET_KEY, wallet.seed!);
  } catch {
    // ignore
  }

  return wallet;
}

export function setWalletFromSeed(seed: string): Wallet {
  _cachedWallet = Wallet.fromSeed(seed);
  return _cachedWallet;
}

// ─── 잔액 조회 ───────────────────────────────────────────────────

export async function getXrpBalance(address: string): Promise<number> {
  try {
    const client = await getClient();
    const resp = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });
    return Number(resp.result.account_data.Balance) / 1_000_000;
  } catch {
    return 0;
  }
}

// ─── 실시간 환율 (XRP ↔ KRW) ─────────────────────────────────────

export async function getXrpKrwRate(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=krw,usd',
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data.ripple.krw as number;
  } catch {
    // CoinGecko 실패 시 open.er-api 로 USD 환산 시도
    try {
      const [xrpRes, fxRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd'),
        fetch('https://open.er-api.com/v6/latest/USD'),
      ]);
      const xrpData = await xrpRes.json();
      const fxData = await fxRes.json();
      return xrpData.ripple.usd * fxData.rates.KRW;
    } catch {
      return 3_200; // 마지막 fallback
    }
  }
}

// ─── 견적: KRW → XRP drops ───────────────────────────────────────

export async function quoteKrw(krw: number): Promise<Quote> {
  const rate = await getXrpKrwRate();
  const xrp = krw / rate;
  const xrpWithSlippage = xrp * 1.005; // 0.5% 슬리피지
  const drops = Math.ceil(xrpWithSlippage * 1_000_000).toString();
  return {
    sendMaxUsd: krw / (rate / 1370), // USD 환산 표시용
    rate,
    paths: [{ drops }],              // drops를 paths에 넣어 전달
  };
}

// ─── 실제 XRPL Payment 제출 ──────────────────────────────────────

export async function sendXrpPayment(
  fromWallet: Wallet,
  toAddress: string,
  drops: string,
): Promise<PayResult> {
  const client = await getClient();

  const payment: Payment = {
    TransactionType: 'Payment',
    Account: fromWallet.address,
    Amount: drops,
    Destination: toAddress,
  };

  const prepared = await client.autofill(payment);
  const signed = fromWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  const meta = result.result.meta as any;
  const deliveredDrops =
    typeof meta?.delivered_amount === 'string'
      ? Number(meta.delivered_amount)
      : Number(drops);

  return {
    hash: result.result.hash,
    delivered: deliveredDrops / 1_000_000,
  };
}
