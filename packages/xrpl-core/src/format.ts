/** 금액 포맷. IOU value는 문자열일 수 있어 Number()로 정규화 후 표시. */
export function formatAmount(value: string | number, currency: 'USD' | 'KRW'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (currency === 'USD') {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₩' + Math.round(n).toLocaleString('ko-KR');
}

export function shortAddr(addr: string): string {
  return addr.length <= 8 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
