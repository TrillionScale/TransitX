import type { Amount, Path, Payment, Wallet } from 'xrpl';
import { getClient } from './client';

export type PayResult = {
  hash: string;
  /** 실제 전달된 목적 통화 수량 (숫자) */
  delivered: number;
  engineResult: string;
};

function deliveredValue(a: Amount | undefined, fallback: Amount): number {
  const v = a ?? fallback;
  return typeof v === 'string' ? Number(v) / 1_000_000 : Number(v.value);
}

/**
 * cross-currency / IOU Payment 제출. autofill → sign → submitAndWait.
 * - amount: 수취인이 받을 정확한 금액 (목적 통화)
 * - sendMax: 송금인이 지불할 최대 (소스 통화) — findIouPath 결과 그대로
 * - paths: findIouPath 결과 그대로 (없으면 생략)
 * - destination === wallet.address 면 자가결제(환전). tfPartialPayment 미사용 — 전액 체결 아니면 실패.
 */
export async function payIou(
  wallet: Wallet,
  args: {
    destination: string;
    amount: Amount;
    sendMax?: Amount;
    paths?: Path[];
  },
): Promise<PayResult> {
  const client = await getClient();

  const tx: Payment = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: args.destination,
    Amount: args.amount,
  };
  if (args.sendMax) tx.SendMax = args.sendMax;
  if (args.paths && args.paths.length > 0) tx.Paths = args.paths;

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  const meta = result.result.meta as any;
  const engineResult: string = meta?.TransactionResult ?? 'UNKNOWN';
  if (engineResult !== 'tesSUCCESS') {
    throw new Error(`PAYMENT_FAILED: ${engineResult}`);
  }
  return {
    hash: result.result.hash,
    delivered: deliveredValue(meta?.delivered_amount, args.amount),
    engineResult,
  };
}

/** 단순 XRP 송금(drops). 폴백/스크립트용. */
export async function payXrp(wallet: Wallet, destination: string, drops: string): Promise<PayResult> {
  const client = await getClient();
  const tx: Payment = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: drops,
  };
  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  const meta = result.result.meta as any;
  const engineResult: string = meta?.TransactionResult ?? 'UNKNOWN';
  if (engineResult !== 'tesSUCCESS') throw new Error(`PAYMENT_FAILED: ${engineResult}`);
  return {
    hash: result.result.hash,
    delivered: deliveredValue(meta?.delivered_amount, drops),
    engineResult,
  };
}
