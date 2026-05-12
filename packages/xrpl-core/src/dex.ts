import type { Amount, OfferCreate, Wallet } from 'xrpl';
import { getClient } from './client';

async function submit(wallet: Wallet, tx: any): Promise<{ hash: string; result: string }> {
  const client = await getClient();
  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const r = await client.submitAndWait(signed.tx_blob);
  const meta = r.result.meta as any;
  const result: string = meta?.TransactionResult ?? 'UNKNOWN';
  if (result !== 'tesSUCCESS') throw new Error(`${tx.TransactionType}_FAILED: ${result}`);
  return { hash: r.result.hash, result };
}

/** issuer가 받는 사람에게 IOU 발행 = issuer가 보내는 Payment. (셋업 스크립트용) */
export async function issueIou(
  issuerWallet: Wallet,
  destination: string,
  currency: string,
  value: string,
): Promise<{ hash: string }> {
  return submit(issuerWallet, {
    TransactionType: 'Payment',
    Account: issuerWallet.address,
    Destination: destination,
    Amount: { currency, issuer: issuerWallet.address, value },
  });
}

/** trustline 개설. */
export async function setTrust(
  wallet: Wallet,
  currency: string,
  issuer: string,
  limit = '1000000000',
): Promise<{ hash: string }> {
  return submit(wallet, {
    TransactionType: 'TrustSet',
    Account: wallet.address,
    LimitAmount: { currency, issuer, value: limit },
  });
}

/** 오더북에 주문 등록: TakerGets(내가 내놓는 것) / TakerPays(내가 받고 싶은 것). */
export async function createOffer(
  wallet: Wallet,
  takerGets: Amount,
  takerPays: Amount,
): Promise<{ hash: string }> {
  const tx: OfferCreate = {
    TransactionType: 'OfferCreate',
    Account: wallet.address,
    TakerGets: takerGets,
    TakerPays: takerPays,
  };
  return submit(wallet, tx);
}
