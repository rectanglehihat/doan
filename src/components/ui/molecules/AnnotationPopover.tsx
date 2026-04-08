'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';

interface AnnotationPopoverProps {
  anchorX: number;
  anchorY: number;
  side: 'right' | 'left';
  rowNumber?: number;
  initialLabel?: string;
  onConfirm: (label: string) => void;
  onDelete: (() => void) | null;
  onClose: () => void;
  mode?: 'row' | 'range';
  startRowNumber?: number;
  endRowNumber?: number;
  initialText?: string;
}

export function AnnotationPopover({
  anchorX,
  anchorY,
  side,
  rowNumber,
  initialLabel = '',
  onConfirm,
  onDelete,
  onClose,
  mode = 'row',
  startRowNumber,
  endRowNumber,
  initialText = '',
}: AnnotationPopoverProps) {
  const [label, setLabel] = useState(initialLabel);
  const [text, setText] = useState(initialText);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  }, []);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(mode === 'range' ? text : label);
  }, [onConfirm, mode, text, label]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: anchorX,
    top: anchorY,
    ...(side === 'left' ? { transform: 'translateX(-100%)' } : {}),
  };

  const title = mode === 'range'
    ? `${startRowNumber}~${endRowNumber}단`
    : `${rowNumber}단`;

  return (
    <div role="dialog" style={style} className="z-50 flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-md">
      <span className="text-sm font-medium text-slate-700">{title}</span>
      {mode === 'range' ? (
        <textarea
          value={text}
          onChange={handleTextareaChange}
          placeholder="주석 입력"
          className="rounded-md border border-slate-200 px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
      ) : (
        <Input
          size="sm"
          value={label}
          onChange={handleInputChange}
          placeholder="주석 입력"
        />
      )}
      <div className="flex gap-1">
        <Button size="sm" variant="default" onClick={handleConfirm}>
          확인
        </Button>
        <Button size="sm" variant="ghost" onClick={handleClose}>
          취소
        </Button>
        {onDelete !== null && (
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
        )}
      </div>
    </div>
  );
}
