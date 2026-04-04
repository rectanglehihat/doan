import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  describe('트리거 버튼', () => {
    it('aria-label="색상 선택" 버튼을 렌더링한다', () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      expect(
        screen.getByRole('button', { name: '색상 선택' }),
      ).toBeInTheDocument();
    });

    it('초기 상태에서 팝업이 닫혀있다', () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('팝업 열기/닫기', () => {
    it('트리거 버튼 클릭 시 role="dialog" 팝업이 표시된다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('Escape 키 입력 시 팝업이 닫힌다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Escape 키 입력 시 onColorChange가 호출되지 않는다', async () => {
      const handleColorChange = vi.fn();
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={handleColorChange}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      await userEvent.keyboard('{Escape}');
      expect(handleColorChange).not.toHaveBeenCalled();
    });
  });

  describe('HEX 입력', () => {
    it('팝업 내에 텍스트 입력창이 존재한다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('유효한 hex 입력 후 blur 시 즉시 onColorChange가 호출된다', async () => {
      const handleColorChange = vi.fn();
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={handleColorChange}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, '#FF4D4D');
      await userEvent.tab();
      expect(handleColorChange).toHaveBeenCalledWith('#FF4D4D');
    });

    it('무효한 hex 입력 후 blur 시 onColorChange가 호출되지 않는다', async () => {
      const handleColorChange = vi.fn();
      render(
        <ColorPicker
          selectedColor="#FF4D4D"
          onColorChange={handleColorChange}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, '#GGGGGG');
      await userEvent.tab();
      expect(handleColorChange).not.toHaveBeenCalled();
    });
  });

  describe('recentColors', () => {
    it('recentColors 배열의 각 색상에 대한 버튼을 렌더링한다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={['#ff0000', '#00ff00']}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      expect(
        screen.getByRole('button', { name: '최근 색상 #ff0000' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '최근 색상 #00ff00' }),
      ).toBeInTheDocument();
    });

    it('recentColors 버튼 클릭 시 HEX 입력창에 해당 색상이 반영된다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={['#ff0000', '#00ff00']}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      await userEvent.click(
        screen.getByRole('button', { name: '최근 색상 #ff0000' }),
      );
      expect(screen.getByRole('textbox')).toHaveValue('#ff0000');
    });

    it('recentColors 버튼 클릭 시 즉시 onColorChange가 호출된다', async () => {
      const handleColorChange = vi.fn();
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={handleColorChange}
          recentColors={['#ff0000', '#00ff00']}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      await userEvent.click(
        screen.getByRole('button', { name: '최근 색상 #ff0000' }),
      );
      expect(handleColorChange).toHaveBeenCalledWith('#ff0000');
    });

    it('recentColors 버튼 클릭 후 팝업이 닫히지 않는다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={['#ff0000', '#00ff00']}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      await userEvent.click(
        screen.getByRole('button', { name: '최근 색상 #ff0000' }),
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('recentColors가 빈 배열이면 최근 색상 버튼을 렌더링하지 않는다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      expect(
        screen.queryByRole('button', { name: /최근 색상/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('HUE 슬라이더', () => {
    it('슬라이더 변경 시 즉시 onColorChange가 호출된다', async () => {
      const handleColorChange = vi.fn();
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={handleColorChange}
          recentColors={[]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '180' } });
      expect(handleColorChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled', () => {
    it('disabled=true 시 트리거 버튼이 비활성화된다', () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
          disabled
        />,
      );
      expect(screen.getByRole('button', { name: '색상 선택' })).toBeDisabled();
    });

    it('disabled=true 시 트리거 버튼 클릭해도 팝업이 열리지 않는다', async () => {
      render(
        <ColorPicker
          selectedColor={null}
          onColorChange={vi.fn()}
          recentColors={[]}
          disabled
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '색상 선택' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
