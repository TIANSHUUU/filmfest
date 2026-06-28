import { supabase } from './supabase';
import type { Category, Film, Vote, Identity } from '../types';

// ---- categories ----
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data as Category[];
}
export async function addCategory(name: string, created_by: Identity, sort_order: number) {
  const { data, error } = await supabase.from('categories')
    .insert({ name, created_by, sort_order }).select().single();
  if (error) throw error;
  return data as Category;
}
export async function renameCategory(id: string, name: string) {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ---- films ----
export async function listFilms(): Promise<Film[]> {
  const { data, error } = await supabase.from('films').select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Film[];
}
export async function addFilm(input: {
  title: string; year: number | null; poster_url: string | null;
  tmdb_id: number | null; overview: string | null; comment: string | null;
  category_id: string | null; added_by: Identity;
}): Promise<Film> {
  const { data, error } = await supabase.from('films')
    .insert({ ...input, status: 'watchlist' }).select().single();
  if (error) throw error;
  return data as Film;
}
export async function setFilmStatus(id: string, status: 'watchlist' | 'watched') {
  const { error } = await supabase.from('films').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function deleteFilm(id: string) {
  const { error } = await supabase.from('films').delete().eq('id', id);
  if (error) throw error;
}

// ---- votes ----
export async function listVotes(): Promise<Vote[]> {
  const { data, error } = await supabase.from('votes').select('*');
  if (error) throw error;
  return data as Vote[];
}
export async function toggleVote(film_id: string, voter: Identity, alreadyVoted: boolean) {
  if (alreadyVoted) {
    const { error } = await supabase.from('votes').delete().match({ film_id, voter });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('votes').insert({ film_id, voter });
    if (error) throw error;
  }
}
