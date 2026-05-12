import { Wallet } from 'xrpl';

/** 시드(s...)로 지갑 복원. 모든 서명 주체의 단일 진입점. */
export function walletFromSeed(seed: string): Wallet {
  return Wallet.fromSeed(seed);
}
