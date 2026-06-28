import { useState, useEffect, useCallback } from 'react';
import type { Film } from '../types';
import * as db from '../lib/db';
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

  return {
    films,
    refresh,
    add: db.addFilm,
    setStatus: db.setFilmStatus,
    remove: db.deleteFilm,
  };
}
