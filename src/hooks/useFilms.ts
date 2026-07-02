import { useState, useEffect, useCallback } from 'react';
import type { Film } from '../types';
import * as db from '../lib/db';
import { sortFilms } from '../lib/films';
import { supabase } from '../lib/supabase';

export function useFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const refresh = useCallback(async () => setFilms(await db.listFilms()), []);

  useEffect(() => {
    refresh();
    const ch = supabase.channel('films-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'films' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  // 先本地重排（拖完不回跳），再写库
  const setOrder = useCallback(async (ids: string[]) => {
    const pos = new Map(ids.map((id, i) => [id, i + 1]));
    setFilms((prev) => sortFilms(prev.map(
      (f) => pos.has(f.id) ? { ...f, sort_order: pos.get(f.id)! } : f)));
    await db.setFilmOrder(ids);
  }, []);

  return {
    films,
    refresh,
    add: db.addFilm,
    setStatus: db.setFilmStatus,
    remove: db.deleteFilm,
    setReview: db.setReview,
    setComment: db.setComment,
    setCategory: db.setFilmCategory,
    setOrder,
  };
}
