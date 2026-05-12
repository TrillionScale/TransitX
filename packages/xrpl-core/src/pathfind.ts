import type { Amount, Path } from 'xrpl';
import { getClient } from './client';

export type IssuedSpec = { currency: string; issuer: string };

export type PathQuote = {
  /** Payment의 SendMax 로 그대로 넣을 값 (소스 통화 기준, 슬리피지 버퍼 포함) */
  sendMax: Amount;
  /** Payment의 Paths 로 그대로 넣을 값 */
  paths: Path[];
  /** 1 단위 목적통화당 소스통화 수량 (표시용) — sendMaxValue / destValue */
  rate: number;
  /** 슬리피지 버퍼 적용 전 견적 (소스 통화 수량, 숫자) */
  quotedSourceValue: number;
};

const SLIPPAGE = 1.02; // 호가 변동 대비 2% 버퍼

function amountValue(a: Amount): number {
  return typeof a === 'string' ? Number(a) / 1_000_000 : Number(a.value);
}

function bufferAmount(a: Amount): Amount {
  if (typeof a === 'string') {
    // drops (XRP) — 정수
    return Math.ceil(Number(a) * SLIPPAGE).toString();
  }
  return { ...a, value: (Number(a.value) * SLIPPAGE).toPrecision(15) };
}

/**
 * source가 dest에게 destAmount(목적 통화/수량)를 보내려 할 때, sourceCurrency 로 지불하는 경로 견적.
 * destAmount.value는 문자열(IOU 정밀도 안전), XRP면 drops 문자열.
 * cross-currency Payment(SendMax+Paths)에 그대로 사용.
 */
export async function findIouPath(
  sourceAddress: string,
  destAddress: string,
  destAmount: Amount,
  sourceCurrency: IssuedSpec | 'XRP',
): Promise<PathQuote> {
  const client = await getClient();
  const send_currencies =
    sourceCurrency === 'XRP'
      ? ['XRP']
      : [`${sourceCurrency.currency}/${sourceCurrency.issuer}`];

  const resp = await client.request({
    command: 'ripple_path_find',
    source_account: sourceAddress,
    destination_account: destAddress,
    destination_amount: destAmount,
    send_currencies,
  });

  const alts = resp.result.alternatives ?? [];
  if (alts.length === 0) {
    throw new Error('NO_PATH: 목적 통화로의 환전 경로가 없습니다 (오더북/유동성 확인 필요)');
  }
  // source_amount가 가장 작은(가장 유리한) 경로 선택
  const best = alts.reduce((a, b) =>
    amountValue(a.source_amount) <= amountValue(b.source_amount) ? a : b,
  );

  const quotedSourceValue = amountValue(best.source_amount);
  const destValue = amountValue(destAmount);
  return {
    sendMax: bufferAmount(best.source_amount),
    paths: (best.paths_computed ?? []) as Path[],
    rate: destValue > 0 ? quotedSourceValue / destValue : 0,
    quotedSourceValue,
  };
}
