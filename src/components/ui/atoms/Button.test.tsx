import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('children을 렌더링한다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    });

    it('type 기본값은 button이다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('className prop이 병합된다', () => {
      render(<Button className="extra-class">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('extra-class');
    });
  });

  describe('variant', () => {
    it('variant=default일 때 bg-slate-900 클래스를 가진다', () => {
      render(<Button variant="default">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-slate-900');
    });

    it('variant 미지정 시 default가 적용된다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-slate-900');
    });

    it('variant=outline일 때 border 클래스를 가진다', () => {
      render(<Button variant="outline">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('variant=secondary일 때 bg-slate-100 클래스를 가진다', () => {
      render(<Button variant="secondary">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-slate-100');
    });

    it('variant=ghost일 때 bg-transparent 클래스를 가진다', () => {
      render(<Button variant="ghost">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('variant=destructive일 때 bg-red-600 클래스를 가진다', () => {
      render(<Button variant="destructive">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');
    });

    it('variant=link일 때 underline 클래스를 가진다', () => {
      render(<Button variant="link">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('underline');
    });
  });

  describe('size', () => {
    it('size=sm일 때 h-8 클래스를 가진다', () => {
      render(<Button size="sm">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');
    });

    it('size 미지정 시 md가 적용된다 (px-4)', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-4');
    });

    it('size=lg일 때 px-8 클래스를 가진다', () => {
      render(<Button size="lg">저장</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-8');
    });

    it('variant=link일 때 size 클래스가 적용되지 않는다', () => {
      render(<Button variant="link" size="lg">저장</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('px-8');
    });
  });

  describe('disabled', () => {
    it('disabled 상태일 때 button이 비활성화된다', () => {
      render(<Button disabled>저장</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled 상태일 때 onClick이 호출되지 않는다', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>저장</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('이벤트', () => {
    it('클릭 시 onClick 핸들러를 1회 호출한다', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>저장</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('연속 클릭 시 클릭 횟수만큼 onClick을 호출한다', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>저장</Button>);
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('접근성', () => {
    it('button role을 가진다', () => {
      render(<Button>저장</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('aria-label prop이 적용된다', () => {
      render(<Button aria-label="저장하기">저장</Button>);
      expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
    });
  });

  describe('ref 전달', () => {
    it('forwardRef로 전달된 ref가 button 엘리먼트를 가리킨다', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>저장</Button>);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });
});
