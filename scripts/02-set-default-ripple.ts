// 02: 두 issuer 계정에 asfDefaultRipple 설정.
//     이거 안 하면 issuer를 경유하는 cross-currency 결제가 전부 tecPATH_DRY 로 실패한다.
import { Client, Wallet } from 'xrpl';
import { requireEnv, XRPL_SERVER } from './lib/env';

const asfDefaultRipple = 8;

async function enableDefaultRipple(client: Client, seed: string, label: string) {
  const w = Wallet.fromSeed(seed);
  const tx = {
    TransactionType: 'AccountSet' as const,
    Account: w.address,
    SetFlag: asfDefaultRipple,
  };
  const prepared = await client.autofill(tx);
  const signed = w.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const result = (r.result.meta as any)?.TransactionResult;
  if (result !== 'tesSUCCESS') throw new Error(`${label} AccountSet 실패: ${result}`);
  console.log(`  ${label} (${w.address}) DefaultRipple ✔`);
}

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  console.log('▶ issuer DefaultRipple 설정…');
  await enableDefaultRipple(client, requireEnv('USD_ISSUER_SEED'), 'USD_ISSUER');
  await enableDefaultRipple(client, requireEnv('KRW_ISSUER_SEED'), 'KRW_ISSUER');
  await client.disconnect();
  console.log('✔ 02 완료\n');
}

main().catch((e) => {
  console.error('✖ 02 실패:', e);
  process.exit(1);
});
