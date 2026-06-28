import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdentityGate } from './IdentityGate';

beforeEach(() => vi.stubEnv('VITE_APP_PASSPHRASE', 'sesame'));

describe('IdentityGate', () => {
  it('blocks wrong passphrase, then lets user pick identity', async () => {
    const onReady = vi.fn();
    render(<IdentityGate onReady={onReady} />);

    await userEvent.type(screen.getByPlaceholderText('共享口令'), 'wrong');
    await userEvent.click(screen.getByText('进入'));
    expect(screen.getByText('口令不对')).toBeInTheDocument();
    expect(onReady).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByPlaceholderText('共享口令'));
    await userEvent.type(screen.getByPlaceholderText('共享口令'), 'sesame');
    await userEvent.click(screen.getByText('进入'));

    await userEvent.click(screen.getByText('我是 🐷'));
    expect(onReady).toHaveBeenCalledWith('pig');
  });
});
