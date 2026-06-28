import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdentity } from './useIdentity';

beforeEach(() => localStorage.clear());

describe('useIdentity', () => {
  it('starts null, persists choice', () => {
    const { result } = renderHook(() => useIdentity());
    expect(result.current.identity).toBeNull();
    act(() => result.current.choose('pig'));
    expect(result.current.identity).toBe('pig');
    expect(localStorage.getItem('ff-identity')).toBe('pig');
  });

  it('reads persisted identity on init', () => {
    localStorage.setItem('ff-identity', 'baby');
    const { result } = renderHook(() => useIdentity());
    expect(result.current.identity).toBe('baby');
  });
});
