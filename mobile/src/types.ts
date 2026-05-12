export type Card = {
  id: string;          // 지갑 주소 = id
  kind: 'personal' | 'group';
  name: string;
  address: string;
  balanceUsd: number;          // 표시 금액 (currency 단위) — 레거시 이름 유지
  currency?: 'USD' | 'KRW';    // 미지정 시 USD
};

export type Tx = {
  hash: string;
  timestamp: number;
  merchant: string;
  amountKrw: number;
  amountUsd: number;
  rate: number;
  signer?: string;     // 그룹 카드일 때 누가 서명했는지
  real?: boolean;      // 실제 XRPL testnet Tx — hash로 explorer 조회 가능
};

export type Member = {
  address: string;
  alias: string;
  status: 'active' | 'frozen';
  dailyLimitKrw: number;   // 0 = 무제한
  spentTodayKrw: number;
};

export type Group = {
  address: string;
  name: string;
  balanceUsd: number;
  members: Member[];
};

export type Quote = {
  sendMaxUsd: number;     // 결제에 쓰일 SendMax USD (표시용 숫자)
  rate: number;           // KRW per USD
  paths: unknown[];       // ripple_path_find 결과 (Payment.Paths 로 그대로)
  /** xrpl-core 가 채우는 원본 Amount — 결제 실행 시 그대로 전달. mock 모드에선 없음. */
  _xrpl?: unknown;
};

export type PayResult = {
  hash: string;
  delivered: number;
};
