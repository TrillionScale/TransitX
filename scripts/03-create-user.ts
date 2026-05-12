// 03: 데모 유저 지갑 생성(faucet) + USD/KRW trustline 2개 개설.
//     trustline 2개 = owner reserve 추가 필요(testnet base 1 + 2×0.5 ≈ 12 XRP). faucet 기본으로 충분하지만
//     부족하면 한 번 더 fund.
import { Client, Wallet } from 'xrpl';
import { requireEnv, setEnv, XRPL_SERVER, USD, KRW } from './lib/env';

const TRUST_LIMIT = '1000000000';

async function trustSet(client: Client, w: Wallet, currency: string, issuer: string) {
  const tx = {
    TransactionType: 'TrustSet' as const,
    Account: w.address,
    LimitAmount: { currency, issuer, value: TRUST_LIMIT },
  };
  const prepared = await client.autofill(tx);
  const signed = w.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const result = (r.result.meta as any)?.TransactionResult;
  if (result !== 'tesSUCCESS') throw new Error(`TrustSet ${currency} 실패: ${result}`);
  console.log(`  trustline ${currency} → ${issuer.slice(0, 8)}… ✔`);
}

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  const usdIssuer = requireEnv('USD_ISSUER_ADDR');
  const krwIssuer = requireEnv('KRW_ISSUER_ADDR');

  console.log('▶ 데모 유저 지갑 생성 (faucet)…');
  let { wallet } = await client.fundWallet();
  // reserve 여유 위해 한 번 더 충전
  await client.fundWallet(wallet);
  console.log(`  DEMO_ADDR = ${wallet.address}`);

  await trustSet(client, wallet, USD, usdIssuer);
  await trustSet(client, wallet, KRW, krwIssuer);

  setEnv({ DEMO_ADDR: wallet.address, DEMO_SEED: wallet.seed! });
  await client.disconnect();
  console.log('✔ 03 완료\n');
}

main().catch((e) => {
  console.error('✖ 03 실패:', e);
  process.exit(1);
});
