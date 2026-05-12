import type { TrustSet, Wallet } from 'xrpl';
import { getClient } from './client';

/**
 * 그룹 풀 — XRPL엔 "다인 공용 잔고" 네이티브 기능이 없으므로 "허브" 모델:
 *  - 그룹 지갑 = 단순 IOU 보유 계정 (USD/KRW trustline 보유)
 *  - 멤버 결제 권한 = 앱/서버 레이어 화이트리스트
 *  - "동결" = (선택) 멤버 trustline에 issuer가 tfSetFreeze
 * 데모에서는 이 함수들 중 createGroupPool / freezeMember 정도만 실연하고,
 * addMember/removeMember 는 앱 상태로 관리한다.
 */

const tfSetFreeze = 0x00100000;
const tfClearFreeze = 0x00200000;

/** 그룹 지갑 생성: faucet으로 활성화 + USD/KRW trustline 개설. (셋업/관리자 도구용) */
export async function createGroupPool(args: {
  usd: { currency: string; issuer: string };
  krw: { currency: string; issuer: string };
  limit?: string;
}): Promise<{ address: string; seed: string }> {
  const client = await getClient();
  const { wallet } = await client.fundWallet();
  const limit = args.limit ?? '1000000000';

  for (const c of [args.usd, args.krw]) {
    const trust: TrustSet = {
      TransactionType: 'TrustSet',
      Account: wallet.address,
      LimitAmount: { currency: c.currency, issuer: c.issuer, value: limit },
    };
    const prepared = await client.autofill(trust);
    const signed = wallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);
  }
  return { address: wallet.address, seed: wallet.seed! };
}

/** issuer가 특정 멤버의 trustline을 동결/해제. issuerWallet 으로 서명. */
export async function freezeMember(
  issuerWallet: Wallet,
  args: { member: string; currency: string; freeze: boolean; limit?: string },
): Promise<{ hash: string }> {
  const client = await getClient();
  const trust: TrustSet = {
    TransactionType: 'TrustSet',
    Account: issuerWallet.address,
    LimitAmount: {
      currency: args.currency,
      issuer: args.member,
      value: args.limit ?? '0',
    },
    Flags: args.freeze ? tfSetFreeze : tfClearFreeze,
  };
  const prepared = await client.autofill(trust);
  const signed = issuerWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  const meta = result.result.meta as any;
  if (meta?.TransactionResult !== 'tesSUCCESS') {
    throw new Error(`FREEZE_FAILED: ${meta?.TransactionResult}`);
  }
  return { hash: result.result.hash };
}

// addMember / removeMember 는 온체인 의미가 없으므로 앱 레이어에서 관리 (TODO: 백엔드 화이트리스트).
