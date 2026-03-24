import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Option } from '@/components/ui/atoms/Option';
import { Select } from './Select';

describe('Select', () => {
  describe('트리거 렌더링', () => {
    it('placeholder를 렌더링한다', () => {
      render(
        <Select placeholder="난이도 선택">
          <Option value="beginner">초급</Option>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('난이도 선택');
    });

    it('value에 해당하는 option 텍스트를 트리거에 표시한다', () => {
      render(
        <Select value="beginner" placeholder="난이도 선택">
          <Option value="beginner">초급</Option>
          <Option value="advanced">고급</Option>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('초급');
    });

    it('chevron 아이콘이 렌더링된다', () => {
      const { container } = render(
        <Select placeholder="선택">
          <Option value="a">A</Option>
        </Select>,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('드롭다운 열기/닫기', () => {
    it('초기 상태에서 드롭다운이 닫혀 있다', () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('트리거 클릭 시 드롭다운이 열린다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('트리거 재클릭 시 드롭다운이 닫힌다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('Escape 키를 누르면 드롭다운이 닫힌다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('옵션 선택', () => {
    it('옵션 클릭 시 onChange에 value를 전달한다', async () => {
      const handleChange = vi.fn();
      render(
        <Select placeholder="선택" onChange={handleChange}>
          <Option value="beginner">초급</Option>
          <Option value="advanced">고급</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: '초급' }));
      expect(handleChange).toHaveBeenCalledWith('beginner');
    });

    it('옵션 클릭 후 드롭다운이 닫힌다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: '항목 A' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('현재 선택된 옵션에 isSelected가 주입된다', async () => {
      render(
        <Select value="beginner" placeholder="선택">
          <Option value="beginner">초급</Option>
          <Option value="advanced">고급</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: '초급' })).toHaveClass('font-medium');
      expect(screen.getByRole('option', { name: '고급' })).not.toHaveClass('font-medium');
    });
  });

  describe('disabled', () => {
    it('disabled 상태일 때 트리거가 비활성화된다', () => {
      render(
        <Select placeholder="선택" disabled>
          <Option value="a">항목 A</Option>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled 상태일 때 클릭해도 드롭다운이 열리지 않는다', async () => {
      render(
        <Select placeholder="선택" disabled>
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('트리거는 combobox role을 가진다', () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('드롭다운은 listbox role을 가진다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('aria-expanded가 드롭다운 상태에 따라 변경된다', async () => {
      render(
        <Select placeholder="선택">
          <Option value="a">항목 A</Option>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
