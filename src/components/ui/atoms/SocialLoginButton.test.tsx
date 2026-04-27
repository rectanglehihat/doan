import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthProvider } from '@/types/auth';
import { SocialLoginButton } from './SocialLoginButton';

describe('SocialLoginButton', () => {
  describe('렌더링', () => {
    it('provider=google일 때 "Google로 계속하기" 텍스트를 렌더링한다', () => {
      const provider: AuthProvider = 'google';
      render(<SocialLoginButton provider={provider} />);
      expect(
        screen.getByRole('button', { name: /Google로 계속하기/i }),
      ).toBeInTheDocument();
    });

    it('button role을 가진다', () => {
      render(<SocialLoginButton provider="google" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('이벤트', () => {
    it('onClick 핸들러를 호출한다', async () => {
      const handleClick = vi.fn();
      render(<SocialLoginButton provider="google" onClick={handleClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLoading', () => {
    it('isLoading=true일 때 버튼이 disabled 상태다', () => {
      render(<SocialLoginButton provider="google" isLoading={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('isLoading=true일 때 클릭해도 onClick이 호출되지 않는다', async () => {
      const handleClick = vi.fn();
      render(
        <SocialLoginButton
          provider="google"
          isLoading={true}
          onClick={handleClick}
        />,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('isLoading=false(기본값)일 때 버튼이 활성화 상태다', () => {
      render(<SocialLoginButton provider="google" />);
      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('isLoading=false일 때 버튼이 활성화 상태다', () => {
      render(<SocialLoginButton provider="google" isLoading={false} />);
      expect(screen.getByRole('button')).toBeEnabled();
    });
  });

  describe('ref 전달', () => {
    it('forwardRef로 전달된 ref가 button 엘리먼트를 가리킨다', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<SocialLoginButton provider="google" ref={ref} />);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });

  describe('네이티브 속성 상속', () => {
    it('className prop이 병합된다', () => {
      render(<SocialLoginButton provider="google" className="extra-class" />);
      expect(screen.getByRole('button')).toHaveClass('extra-class');
    });

    it('aria-label prop이 적용된다', () => {
      render(
        <SocialLoginButton provider="google" aria-label="구글 소셜 로그인" />,
      );
      expect(
        screen.getByRole('button', { name: '구글 소셜 로그인' }),
      ).toBeInTheDocument();
    });
  });
});
