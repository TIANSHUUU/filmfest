import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdentityGate } from './IdentityGate';

// 2026-11-02：共享口令整个拿掉了。原因不是嫌麻烦——那道门是假的：
// Vite 会把 VITE_APP_PASSPHRASE 直接编进公开的 JS 包，口令明文躺在
// tianshuuu.github.io 上谁都能读；而 schema.sql 里三张表的 RLS 又是
// `using (true)`，数据本来就对匿名开放。所以它只挡界面不挡数据，
// 删掉它安全性一点不变。
//
// 留下的只有「我是谁」——投票要按身份区分，不是鉴权。

describe('IdentityGate', () => {
  it('不再要求任何口令，直接显示身份选择', () => {
    render(<IdentityGate onReady={vi.fn()} />);
    expect(screen.queryByPlaceholderText('共享口令')).not.toBeInTheDocument();
    expect(screen.queryByText('进入')).not.toBeInTheDocument();
    expect(screen.getByText('我是 🐷')).toBeInTheDocument();
    expect(screen.getByText('我是 宝宝')).toBeInTheDocument();
  });

  it('点身份直接进去', async () => {
    const onReady = vi.fn();
    render(<IdentityGate onReady={onReady} />);
    await userEvent.click(screen.getByText('我是 🐷'));
    expect(onReady).toHaveBeenCalledWith('pig');
  });

  it('宝宝那个按钮传的是 baby', async () => {
    const onReady = vi.fn();
    render(<IdentityGate onReady={onReady} />);
    await userEvent.click(screen.getByText('我是 宝宝'));
    expect(onReady).toHaveBeenCalledWith('baby');
  });
});
