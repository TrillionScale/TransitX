import { useCallback, useRef, useState } from 'react';
import { api } from '../data/api';
import { appendRealTx } from '../data/mocks';
import { PayResult, Quote } from '../types';

// XRPL Tx 해시는 64자리 hex. mock 해시('TX...')와 구분용.
const isRealTxHash = (hash: string) => /^[0-9A-F]{64}$/i.test(hash);

const DEMO_MERCHANT = '서울 지하철 2호선'; // 1500원 = 지하철 1회

export type PaymentPhase =
  | 'idle'         // 화면 진입, NFC 대기
  | 'tagDetected'  // 태그 감지 → 견적 요청 시작
  | 'quoting'      // ripple_path_find 진행 중
  | 'submitting'   // Payment 트랜잭션 제출 중
  | 'success'      // tesSUCCESS
  | 'error';       // 어디서든 실패

const KRW_AMOUNT = 1500; // 데모: 지하철 1회 요금

export function usePaymentFlow(cardId: string) {
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [result, setResult] = useState<PayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 중복 트리거 방지
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setPhase('idle');
    setQuote(null);
    setResult(null);
    setError(null);
    inFlight.current = false;
  }, []);

  // 결제 플로우 시작 — NFC 감지 시 또는 mock에서 즉시 호출
  const start = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      setPhase('tagDetected');
      // 살짝 sleep해서 "감지됨" 단계가 시각적으로 인식되게
      await new Promise((r) => setTimeout(r, 250));

      setPhase('quoting');
      const q = await api.quote(KRW_AMOUNT);
      setQuote(q);

      setPhase('submitting');
      const r = await api.pay(cardId, q, KRW_AMOUNT);

      // 실제 XRPL 결제였다면 그 트랜잭션을 거래내역 맨 위에 꽂는다
      // (mock pay는 자체적으로 txMap을 갱신하므로 중복 방지 차원에서 real만).
      if (isRealTxHash(r.hash)) {
        appendRealTx(cardId, {
          hash: r.hash,
          merchant: DEMO_MERCHANT,
          amountKrw: KRW_AMOUNT,
          amountUsd: q.sendMaxUsd,
          rate: q.rate,
        });
      }

      setResult(r);
      setPhase('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 실패');
      setPhase('error');
    } finally {
      inFlight.current = false;
    }
  }, [cardId]);

  return {
    phase,
    quote,
    result,
    error,
    krwAmount: KRW_AMOUNT,
    start,
    reset,
  };
}
