// 01: USD / KRW issuer 지갑 2개를 testnet faucet으로 생성하고 .env 에 저장.
import { Client } from 'xrpl';
import { setEnv, XRPL_SERVER } from './lib/env';

async function main() {
  const client = new Client(XRPL_SERVER);
  await client.connect();
  console.log('▶ issuer 지갑 생성 (faucet)…');

  const { wallet: usd } = await client.fundWallet();
  console.log(`  USD_ISSUER = ${usd.address}`);
  const { wallet: krw } = await client.fundWallet();
  console.log(`  KRW_ISSUER = ${krw.address}`);

  setEnv({
    USD_ISSUER_ADDR: usd.address,
    USD_ISSUER_SEED: usd.seed!,
    KRW_ISSUER_ADDR: krw.address,
    KRW_ISSUER_SEED: krw.seed!,
  });

  await client.disconnect();
  console.log('✔ 01 완료\n');
}

main().catch((e) => {
  console.error('✖ 01 실패:', e);
  process.exit(1);
});
