import type { Film } from '../types';

// 排序放在客户端做：sort_order 列是后加的，未跑迁移的库返回 undefined 也能安全回落。
export function nextOrder(ids: string[], activeId: string, overId: string): string[] | null {
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1 || from === to) return null;
  const next = [...ids];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export function formatRuntime(minutes: number | null | undefined): string {
  return minutes ? `${minutes}分钟` : '';
}

// 一部影片可属多个片单。新数据用 category_ids；老数据只有单个 category_id，回落成单元素数组。
export function categoryIdsOf(film: Film): string[] {
  if (film.category_ids && film.category_ids.length > 0) return film.category_ids;
  return film.category_id ? [film.category_id] : [];
}

export function sortFilms(films: Film[]): Film[] {
  return [...films].sort((a, b) => {
    const ao = a.sort_order ?? 0;
    const bo = b.sort_order ?? 0;
    if (ao !== bo) return ao - bo;
    return b.created_at.localeCompare(a.created_at);
  });
}
