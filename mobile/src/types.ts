export type Card = {
  id: string;          // 지갑 주소 = id
  kind: 'personal' | 'group';
  name: string;
  address: string;
  balanceUsd: number;
};

export type Tx = {
  hash: string;
  timestamp: number;
  merchant: string;
  amountKrw: number;
  amountUsd: number;
  rate: number;
  signer?: string;     // 그룹 카드일 때 누가 서명했는지
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
