// 05: LP가 양방향 OfferCreate로 USD↔KRW 오더북에 유동성 공급. mid ≈ 1370, 여러 단계로 depth 확보.
//     - USD 팔고 KRW 받기 (TakerGets=USD, TakerPays=KRW): rate = KRW per USD, 약간 비싸게
//     - KRW 팔고 USD 받기 (TakerGets=KRW, TakerPays=USD): rate, 약간 싸게
import { Client, Wallet } from 'xrpl';
import { requireEnv, XRPL_SERVER, USD, KRW } from './lib/env';

const MID = 1370;
// (스프레드%, 한 단계 USD 규모) — 여러 단계 깔아서 path-find가 항상 잡히게
const LEVELS: Array<{ spread: number; usd: number }> = [
  { spread: 0.002, usd: 200 },
  { spread: 0.005, usd: 500 },
  { spread: 0.010, usd: 2000 },
  { spread: 0.020, usd: 5000 },
];

function iou(currency: string, issuer: string, value: number | string) {
  return { currency, issuer, value: String(value) };
}

async function offer(client: Client, lp: Wallet, takerGets: any, takerPays: any, label: string) {
  const tx = {
    TransactionType: 'OfferCreate' as const,
    Account: lp.address,
    TakerGets: takerGets,
    TakerPays: takerPays,
  };
  const prepared = await client.autofill(tx);
  const signed = lp.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const result = (r.result.meta as any)?.TransactionResult;
  if (result !== 'tesSUCCESS') throw new Error(`${label} 실패: ${result}`);
  console.log(`  ${label} ✔`);
}

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  const lp = Wallet.fromSeed(requireEnv('LP_SEED'));
  const usdIssuer = requireEnv('USD_ISSUER_ADDR');
  const krwIssuer = requireEnv('KRW_ISSUER_ADDR');

  console.log('▶ 오더북 시딩 (mid≈1370)…');
  for (const lvl of LEVELS) {
    const sellRate = MID * (1 + lvl.spread); // USD 살 때 (LP가 USD 내놓음) 비싸게
    const buyRate = MID * (1 - lvl.spread);  // USD 팔 때 (LP가 USD 받음) 싸게

    // LP: USD 내놓고 KRW 받음 → 유저가 KRW로 USD 살 수 있음
    await offer(
      client, lp,
      iou(USD, usdIssuer, lvl.usd),
      iou(KRW, krwIssuer, Math.round(lvl.usd * sellRate)),
      `USD${lvl.usd} ↔ KRW${Math.round(lvl.usd * sellRate)} (sell @${sellRate.toFixed(1)})`,
    );
    // LP: KRW 내놓고 USD 받음 → 유저가 USD로 KRW 살 수 있음 (= 결제 happy path: USD→KRW)
    await offer(
      client, lp,
      iou(KRW, krwIssuer, Math.round(lvl.usd * buyRate)),
      iou(USD, usdIssuer, lvl.usd),
      `KRW${Math.round(lvl.usd * buyRate)} ↔ USD${lvl.usd} (buy @${buyRate.toFixed(1)})`,
    );
  }

  await client.disconnect();
  console.log('✔ 05 완료\n');
}

main().catch((e) => {
  console.error('✖ 05 실패:', e);
  process.exit(1);
});
