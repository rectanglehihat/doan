import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from '@supabase/supabase-js';
import { UserMenu } from './UserMenu';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
} as unknown as User;

describe('UserMenu', () => {
  it('사용자 이메일 첫 글자 대문자를 이니셜로 렌더링한다', () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('초기 상태에서 로그아웃 버튼이 보이지 않는다', () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
  });

  it('이니셜 버튼 클릭 시 드롭다운에 로그아웃 버튼이 표시된다', async () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /T/i }));

    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('드롭다운이 열린 상태에서 이니셜 버튼을 다시 클릭하면 드롭다운이 닫힌다', async () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    const initialButton = screen.getByRole('button', { name: /T/i });
    await userEvent.click(initialButton);

    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();

    await userEvent.click(initialButton);

    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
  });

  it('로그아웃 버튼 클릭 시 onSignOut이 호출된다', async () => {
    const handleSignOut = vi.fn();
    render(<UserMenu user={mockUser} onSignOut={handleSignOut} />);

    await userEvent.click(screen.getByRole('button', { name: /T/i }));
    await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true일 때 로그아웃 버튼이 disabled 상태다', async () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} isLoading={true} />);

    await userEvent.click(screen.getByRole('button', { name: /T/i }));

    expect(screen.getByRole('button', { name: '로그아웃' })).toBeDisabled();
  });
});
