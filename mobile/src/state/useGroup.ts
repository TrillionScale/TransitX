import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../data/api';
import { Group, Member } from '../types';

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const g = await api.getGroup(groupId);
      setGroup(g ?? null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const findMember = useCallback(
    (addr: string): Member | undefined => group?.members.find((m) => m.address === addr),
    [group],
  );

  const addMember = useCallback(
    async (addr: string, alias: string) => {
      await api.addMember(groupId, addr, alias);
      await refresh();
    },
    [groupId, refresh],
  );

  const freezeMember = useCallback(
    async (addr: string) => {
      await api.freezeMember(groupId, addr);
      await refresh();
    },
    [groupId, refresh],
  );

  const removeMember = useCallback(
    async (addr: string) => {
      await api.removeMember(groupId, addr);
      await refresh();
    },
    [groupId, refresh],
  );

  const updateMember = useCallback(
    async (addr: string, data: { alias?: string; dailyLimitKrw?: number }) => {
      await api.updateMember(groupId, addr, data);
      await refresh();
    },
    [groupId, refresh],
  );

  return { group, loading, refresh, findMember, addMember, freezeMember, removeMember, updateMember };
}
