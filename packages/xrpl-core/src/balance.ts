import { getClient } from './client';

/**
 * 특정 발행 통화(IOU) 잔액. account_lines에서 issuer·currency가 일치하는 trustline의 balance.
 * trustline이 없거나 잔액 0이면 0. 음수(역방향 잔액)는 0으로 클램프.
 */
export async function getIouBalance(
  address: string,
  currency: string,
  issuer: string,
): Promise<number> {
  try {
    const client = await getClient();
    const resp = await client.request({
      command: 'account_lines',
      account: address,
      peer: issuer,
      ledger_index: 'validated',
    });
    const line = resp.result.lines.find((l) => l.currency === currency && l.account === issuer);
    if (!line) return 0;
    const v = Number(line.balance);
    return v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

/** XRP 잔액(drops → XRP). 계정 활성화/수수료 확인용. */
export async function getXrpBalance(address: string): Promise<number> {
  try {
    const client = await getClient();
    const resp = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });
    return Number(resp.result.account_data.Balance) / 1_000_000;
  } catch {
    return 0;
  }
}
