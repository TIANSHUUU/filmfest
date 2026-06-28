import { useState, useEffect, useCallback } from 'react';
import type { Vote, Identity } from '../types';
import * as db from '../lib/db';
import { supabase } from '../lib/supabase';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const refresh = useCallback(async () => setVotes(await db.listVotes()), []);

  useEffect(() => {
    refresh();
    const ch = supabase.channel('votes-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const toggle = useCallback(async (filmId: string, voter: Identity) => {
    const already = votes.some((v) => v.film_id === filmId && v.voter === voter);
    await db.toggleVote(filmId, voter, already);
    await refresh();
  }, [votes, refresh]);

  return { votes, toggle, refresh };
}
