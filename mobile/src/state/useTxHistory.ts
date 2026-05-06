import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../data/api';
import { Tx } from '../types';

export function useTxHistory(address: string) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTxs(await api.txHistory(address));
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 다른 화면(결제) 갔다 돌아오면 자동 새로고침
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { txs, loading, refresh };
}
