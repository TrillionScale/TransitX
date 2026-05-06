export const formatAmount = (value: number, currency: 'USD' | 'KRW'): string => {
  if (currency === 'USD') {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₩' + Math.round(value).toLocaleString('ko-KR');
};

export const shortAddr = (addr: string): string =>
  addr.length <= 8 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;

export const relativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
};
