// 04: LP(유동성) 지갑 생성 → USD/KRW trustline → issuer가 LP에게 대량 발행.
//     데모 유저에게도 초기 USD 지급(예: 500 USD).
import { Client, Wallet } from 'xrpl';
import { requireEnv, setEnv, XRPL_SERVER, USD, KRW } from './lib/env';

const TRUST_LIMIT = '100000000000'; // 1000억 — 발행량(13.7억 KRW)보다 충분히 크게
const LP_USD = '1000000';      // LP 보유 USD
const LP_KRW = '1370000000';   // LP 보유 KRW (≈ 1370 × 1,000,000)
const USER_USD = '500';        // 데모 유저 초기 잔액

async function submit(client: Client, w: Wallet, tx: any, label: string) {
  const prepared = await client.autofill(tx);
  const signed = w.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const result = (r.result.meta as any)?.TransactionResult;
  if (result !== 'tesSUCCESS') throw new Error(`${label} 실패: ${result}`);
  console.log(`  ${label} ✔`);
}

async function trustSet(client: Client, w: Wallet, currency: string, issuer: string) {
  await submit(client, w, {
    TransactionType: 'TrustSet',
    Account: w.address,
    LimitAmount: { currency, issuer, value: TRUST_LIMIT },
  }, `trustline ${currency}`);
}

async function issue(client: Client, issuerW: Wallet, dest: string, currency: string, value: string) {
  await submit(client, issuerW, {
    TransactionType: 'Payment',
    Account: issuerW.address,
    Destination: dest,
    Amount: { currency, issuer: issuerW.address, value },
  }, `발행 ${value} ${currency} → ${dest.slice(0, 8)}…`);
}

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  const usdIssuer = Wallet.fromSeed(requireEnv('USD_ISSUER_SEED'));
  const krwIssuer = Wallet.fromSeed(requireEnv('KRW_ISSUER_SEED'));
  const demoAddr = requireEnv('DEMO_ADDR');

  console.log('▶ LP 지갑 생성 (faucet)…');
  let { wallet: lp } = await client.fundWallet();
  await client.fundWallet(lp);
  console.log(`  LP_ADDR = ${lp.address}`);

  await trustSet(client, lp, USD, usdIssuer.address);
  await trustSet(client, lp, KRW, krwIssuer.address);

  await issue(client, usdIssuer, lp.address, USD, LP_USD);
  await issue(client, krwIssuer, lp.address, KRW, LP_KRW);
  await issue(client, usdIssuer, demoAddr, USD, USER_USD);

  setEnv({ LP_ADDR: lp.address, LP_SEED: lp.seed! });
  await client.disconnect();
  console.log('✔ 04 완료\n');
}

main().catch((e) => {
  console.error('✖ 04 실패:', e);
  process.exit(1);
});
