import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('렌더링', () => {
    it('input 엘리먼트를 렌더링한다', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder prop이 적용된다', () => {
      render(<Input placeholder="입력하세요" />);
      expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
    });

    it('className prop이 병합된다', () => {
      render(<Input className="extra-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('extra-class');
    });
  });

  describe('size', () => {
    it('size 미지정 시 md가 적용된다 (h-10)', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('h-10');
    });

    it('size=sm일 때 h-8 클래스를 가진다', () => {
      render(<Input size="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass('h-8');
    });

    it('size=lg일 때 h-12 클래스를 가진다', () => {
      render(<Input size="lg" />);
      expect(screen.getByRole('textbox')).toHaveClass('h-12');
    });
  });

  describe('variant', () => {
    it('variant 미지정 시 default가 적용된다 (border-slate-200)', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('border-slate-200');
    });

    it('variant=error일 때 border-red-500 클래스를 가진다', () => {
      render(<Input variant="error" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });
  });

  describe('disabled', () => {
    it('disabled 상태일 때 input이 비활성화된다', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disabled 상태일 때 텍스트 입력이 되지 않는다', async () => {
      render(<Input disabled />);
      await userEvent.type(screen.getByRole('textbox'), '테스트');
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('이벤트', () => {
    it('텍스트 입력 시 onChange 핸들러를 호출한다', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      await userEvent.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('입력한 값이 value로 반영된다', async () => {
      render(<Input defaultValue="" />);
      await userEvent.type(screen.getByRole('textbox'), '안녕');
      expect(screen.getByRole('textbox')).toHaveValue('안녕');
    });
  });

  describe('접근성', () => {
    it('aria-label prop이 적용된다', () => {
      render(<Input aria-label="이름 입력" />);
      expect(screen.getByRole('textbox', { name: '이름 입력' })).toBeInTheDocument();
    });

    it('id prop이 적용된다', () => {
      render(<Input id="name-input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'name-input');
    });
  });

  describe('ref 전달', () => {
    it('forwardRef로 전달된 ref가 input 엘리먼트를 가리킨다', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('INPUT');
    });
  });
});
