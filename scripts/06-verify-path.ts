// 06: 데모 환경 sanity check.
//   ① ripple_path_find: 데모 유저가 USD로 1500 KRW를 보낼 경로가 있는가 (alternatives > 0)
//   ② 실제로 1 KRW 자가결제(셀프 환전) 보내서 tesSUCCESS 인가
//   ③ USD 잔액 변화 출력
import { Client, Wallet } from 'xrpl';
import { requireEnv, XRPL_SERVER, USD, KRW } from './lib/env';

const DEMO_KRW_AMOUNT = '1500'; // 지하철 1회

function usdLine(lines: any[], issuer: string): number {
  const l = lines.find((x) => x.currency === USD && x.account === issuer);
  return l ? Number(l.balance) : 0;
}

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  const demo = Wallet.fromSeed(requireEnv('DEMO_SEED'));
  const usdIssuer = requireEnv('USD_ISSUER_ADDR');
  const krwIssuer = requireEnv('KRW_ISSUER_ADDR');
  const merchant = process.env.MERCHANT_ADDR || requireEnv('LP_ADDR'); // 머천트 없으면 LP를 대상으로

  // ① path-find: USD → 1500 KRW
  console.log(`▶ ① ripple_path_find: USD → ${DEMO_KRW_AMOUNT} KRW`);
  const pf = await client.request({
    command: 'ripple_path_find',
    source_account: demo.address,
    destination_account: merchant,
    destination_amount: { currency: KRW, issuer: krwIssuer, value: DEMO_KRW_AMOUNT },
    send_currencies: [`${USD}/${usdIssuer}`],
  });
  const alts = pf.result.alternatives ?? [];
  if (alts.length === 0) throw new Error('alternatives=0 — 오더북/DefaultRipple/trustline 확인 필요');
  const best = alts.reduce((a: any, b: any) =>
    Number((a.source_amount as any).value) <= Number((b.source_amount as any).value) ? a : b,
  );
  console.log(`  alternatives=${alts.length}, best SendMax=${(best.source_amount as any).value} USD ✔`);

  // ② 실제 1 KRW 자가결제 (merchant에게 보내는 대신 본인에게 — 잔액만 살짝 변동)
  console.log('▶ ② 실제 cross-currency Payment 1 KRW (self)…');
  const before = await client.request({ command: 'account_lines', account: demo.address, peer: usdIssuer });
  const usdBefore = usdLine(before.result.lines, usdIssuer);

  const tx: any = {
    TransactionType: 'Payment',
    Account: demo.address,
    Destination: demo.address,
    Amount: { currency: KRW, issuer: krwIssuer, value: '1' },
    SendMax: { currency: USD, issuer: usdIssuer, value: '0.01' },
  };
  if ((best.paths_computed ?? []).length > 0) tx.Paths = best.paths_computed;
  const prepared = await client.autofill(tx);
  const signed = demo.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const result = (r.result.meta as any)?.TransactionResult;
  if (result !== 'tesSUCCESS') throw new Error(`자가결제 실패: ${result} (hash ${r.result.hash})`);
  console.log(`  tesSUCCESS, hash=${r.result.hash}`);
  console.log(`  https://testnet.xrpl.org/transactions/${r.result.hash}`);

  // ③ 잔액 변화
  const after = await client.request({ command: 'account_lines', account: demo.address, peer: usdIssuer });
  const usdAfter = usdLine(after.result.lines, usdIssuer);
  console.log(`▶ ③ USD 잔액: ${usdBefore} → ${usdAfter} (Δ ${(usdAfter - usdBefore).toFixed(6)})`);

  await client.disconnect();
  console.log('\n✅ 데모 환경 OK — 06 완료');
}

main().catch((e) => {
  console.error('✖ 06 실패:', e);
  process.exit(1);
});
