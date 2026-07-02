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
    // 先本地重排（拖完不回跳），再写库
    reorder: async (ids: string[]) => {
      const pos = new Map(ids.map((id, i) => [id, i + 1]));
      setCategories((prev) => [...prev].sort(
        (a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0)));
      await db.setCategoryOrder(ids);
      await refresh();
    },
  };
}
