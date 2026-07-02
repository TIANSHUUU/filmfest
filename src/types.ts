export type Identity = 'pig' | 'baby';

export const IDENTITY_LABEL: Record<Identity, string> = {
  pig: '🐷',
  baby: '宝宝',
};

export const IDENTITY_BADGE: Record<Identity, string> = {
  pig: '🐷',
  baby: '宝',
};

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_by: Identity;
  created_at: string;
}

export interface Film {
  id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  tmdb_id: number | null;
  overview: string | null;
  comment: string | null;
  review_pig: string | null;
  review_baby: string | null;
  category_id: string | null;
  added_by: Identity;
  status: 'watchlist' | 'watched';
  created_at: string;
  sort_order?: number | null;
}

export interface Vote {
  id: string;
  film_id: string;
  voter: Identity;
  created_at: string;
}
