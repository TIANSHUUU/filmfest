import { useState, useEffect, useCallback } from 'react';
import type { Category, Identity } from '../types';
import * as db from '../lib/db';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const refresh = useCallback(async () => setCategories(await db.listCategories()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    categories,
    refresh,
    add: async (name: string, by: Identity) => {
      await db.addCategory(name, by, categories.length);
      await refresh();
    },
    rename: async (id: string, name: string) => { await db.renameCategory(id, name); await refresh(); },
    remove: async (id: string) => { await db.deleteCategory(id); await refresh(); },
  };
}
