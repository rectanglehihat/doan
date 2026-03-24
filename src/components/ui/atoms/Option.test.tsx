import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Option } from './Option';

describe('Option', () => {
  describe('렌더링', () => {
    it('children 텍스트를 렌더링한다', () => {
      render(<Option value="a">항목 A</Option>);
      expect(screen.getByText('항목 A')).toBeInTheDocument();
    });

    it('option role을 가진다', () => {
      render(<Option value="a">항목 A</Option>);
      expect(screen.getByRole('option')).toBeInTheDocument();
    });

    it('isSelected=false일 때 체크 아이콘이 보이지 않는다', () => {
      const { container } = render(<Option value="a">항목 A</Option>);
      expect(container.querySelector('[data-check]')).not.toBeInTheDocument();
    });

    it('isSelected=true일 때 체크 아이콘이 렌더링된다', () => {
      const { container } = render(
        <Option value="a" isSelected>
          항목 A
        </Option>,
      );
      expect(container.querySelector('[data-check]')).toBeInTheDocument();
    });
  });

  describe('이벤트', () => {
    it('클릭 시 onSelect에 value를 전달한다', async () => {
      const handleSelect = vi.fn();
      render(
        <Option value="beginner" onSelect={handleSelect}>
          초급
        </Option>,
      );
      await userEvent.click(screen.getByRole('option'));
      expect(handleSelect).toHaveBeenCalledWith('beginner');
    });

    it('onSelect 미전달 시 클릭해도 에러가 발생하지 않는다', async () => {
      render(<Option value="a">항목 A</Option>);
      await expect(userEvent.click(screen.getByRole('option'))).resolves.not.toThrow();
    });
  });

  describe('disabled', () => {
    it('disabled 상태일 때 aria-disabled 속성을 가진다', () => {
      render(
        <Option value="a" disabled>
          항목 A
        </Option>,
      );
      expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled 상태일 때 onSelect가 호출되지 않는다', async () => {
      const handleSelect = vi.fn();
      render(
        <Option value="a" disabled onSelect={handleSelect}>
          항목 A
        </Option>,
      );
      await userEvent.click(screen.getByRole('option'));
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('선택 상태 스타일', () => {
    it('isSelected=true일 때 font-medium 클래스를 가진다', () => {
      render(
        <Option value="a" isSelected>
          항목 A
        </Option>,
      );
      expect(screen.getByRole('option')).toHaveClass('font-medium');
    });

    it('isSelected=false일 때 font-medium 클래스를 가지지 않는다', () => {
      render(<Option value="a">항목 A</Option>);
      expect(screen.getByRole('option')).not.toHaveClass('font-medium');
    });
  });
});
