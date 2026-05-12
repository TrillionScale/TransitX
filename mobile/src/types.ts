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
  sendMaxUsd: number;
  rate: number;
  paths: unknown[];
};

export type PayResult = {
  hash: string;
  delivered: number;
};
