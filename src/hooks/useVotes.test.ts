import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const listVotes = vi.fn();
const toggleVote = vi.fn();
vi.mock('../lib/db', () => ({
  listVotes: (...a: any[]) => listVotes(...a),
  toggleVote: (...a: any[]) => toggleVote(...a),
}));
const channelObj = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() };
vi.mock('../lib/supabase', () => ({
  supabase: { channel: () => channelObj, removeChannel: vi.fn() },
}));

import { useVotes } from './useVotes';

beforeEach(() => { listVotes.mockReset(); toggleVote.mockReset(); });

describe('useVotes', () => {
  it('loads votes and toggles via db with current state', async () => {
    listVotes.mockResolvedValue([{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }]);
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.votes).toHaveLength(1));

    await act(async () => { await result.current.toggle('a', 'pig'); });
    expect(toggleVote).toHaveBeenCalledWith('a', 'pig', true); // already voted -> true
  });
});
