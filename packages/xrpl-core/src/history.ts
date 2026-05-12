import { rippleTimeToUnixTime } from 'xrpl';
import { getClient } from './client';
import type { IssuedSpec } from './pathfind';

export type CoreTx = {
  hash: string;
  timestamp: number; // unix ms
  amountUsd: number; // 보낸/받은 USD 추정 (SendMax 또는 delivered USD)
  amountKrw: number; // 전달된 KRW 추정 (delivered_amount)
  rate: number;
  outgoing: boolean; // 이 주소가 보낸 건지
  real: true;
};

function valueOf(a: any, currency: string, issuer?: string): number | null {
  if (a == null) return null;
  if (typeof a === 'string') return currency === 'XRP' ? Number(a) / 1_000_000 : null;
  if (a.currency === currency && (!issuer || a.issuer === issuer)) return Number(a.value);
  return null;
}

/**
 * account_tx 에서 Payment만 골라 USD↔KRW 관점으로 정규화.
 * usd/krw 통화 스펙을 주면 그에 맞춰 금액을 추출, 매칭 안 되는 Payment는 제외.
 */
export async function getTxHistory(
  address: string,
  usd: IssuedSpec,
  krw: IssuedSpec,
  limit = 25,
): Promise<CoreTx[]> {
  try {
    const client = await getClient();
    const resp = await client.request({
      command: 'account_tx',
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit,
    });

    const out: CoreTx[] = [];
    for (const entry of resp.result.transactions) {
      const tx: any = (entry as any).tx_json ?? (entry as any).tx;
      const meta: any = (entry as any).meta;
      if (!tx || tx.TransactionType !== 'Payment' || typeof meta === 'string') continue;

      const outgoing = tx.Account === address;
      const delivered = meta.delivered_amount ?? tx.Amount;
      // 목적 통화: KRW 우선, 아니면 USD
      const krwVal = valueOf(delivered, krw.currency, krw.issuer);
      const usdDelivered = valueOf(delivered, usd.currency, usd.issuer);
      const sendMaxUsd = valueOf(tx.SendMax, usd.currency, usd.issuer);

      let amountKrw = krwVal ?? 0;
      let amountUsd = sendMaxUsd ?? usdDelivered ?? 0;
      if (krwVal == null && usdDelivered == null && sendMaxUsd == null) continue; // 우리 통화 아님

      const rate = amountKrw > 0 && amountUsd > 0 ? amountKrw / amountUsd : 0;
      const date = (entry as any).close_time_iso
        ? Date.parse((entry as any).close_time_iso)
        : tx.date != null
          ? rippleTimeToUnixTime(tx.date)
          : Date.now();

      out.push({
        hash: tx.hash ?? (entry as any).hash,
        timestamp: date,
        amountUsd,
        amountKrw,
        rate,
        outgoing,
        real: true,
      });
    }
    return out;
  } catch {
    return [];
  }
}
