import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../data/api';

type Wallet = {
  address: string;
  balanceUsd: number; // 레거시명 — 실제 값은 USD·KRW 합산 원화(KRW)
  usd: number;        // USD IOU 잔고
  krw: number;        // KRW IOU 잔고
  rate: number;       // KRW per USD (path-find 추정)
};

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setWallet(await api.myWallet());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { wallet, loading, refresh };
}
