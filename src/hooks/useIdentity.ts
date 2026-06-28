import { useState, useCallback } from 'react';
import type { Identity } from '../types';

const KEY = 'ff-identity';

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(
    () => (localStorage.getItem(KEY) as Identity | null) ?? null
  );
  const choose = useCallback((id: Identity) => {
    localStorage.setItem(KEY, id);
    setIdentity(id);
  }, []);
  return { identity, choose };
}
