'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { useUIStore } from '@/store/useUIStore';
import { useChartStore } from '@/store/useChartStore';
import { usePatterns } from '@/hooks/usePatterns';

const TITLE_ID = 'save-dialog-title';

interface SaveDialogContentProps {
	initialTitle: string;
	onClose: () => void;
}

function SaveDialogContent({ initialTitle, onClose }: SaveDialogContentProps) {
	const { saveCurrentPattern, newPattern } = usePatterns();
	const [inputValue, setInputValue] = useState(initialTitle);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	}, []);

	const handleSave = useCallback(() => {
		const result = saveCurrentPattern(inputValue);
		if (result.ok) {
			newPattern();
			onClose();
		} else if (result.error === 'limit_reached') {
			setErrorMessage('저장 가능한 도안 수를 초과했습니다. 기존 도안을 삭제해 주세요.');
		}
	}, [inputValue, saveCurrentPattern, newPattern, onClose]);

	const handleCancel = useCallback(() => {
		onClose();
	}, [onClose]);

	const handleOverlayClick = useCallback(() => {
		onClose();
	}, [onClose]);

	const handlePanelClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
	}, []);

	return (
		<div
			data-testid="save-dialog-overlay"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
			onClick={handleOverlayClick}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={TITLE_ID}
				className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
				onClick={handlePanelClick}
			>
				<h2 id={TITLE_ID} className="mb-4 text-base font-semibold text-slate-900">
					도안 저장
				</h2>

				<div className="mb-4 flex flex-col gap-1">
					<label htmlFor="save-dialog-input" className="text-xs text-slate-600">
						도안명
					</label>
					<Input
						id="save-dialog-input"
						ref={inputRef}
						type="text"
						placeholder="도안 제목을 입력하세요"
						value={inputValue}
						onChange={handleInputChange}
						autoFocus
					/>
				</div>

				{errorMessage !== null && (
					<p role="alert" className="mb-4 text-xs text-red-600">
						{errorMessage}
					</p>
				)}

				<div className="flex justify-end gap-2">
					<Button variant="outline" size="sm" onClick={handleCancel}>
						취소
					</Button>
					<Button
						variant="default"
						size="sm"
						disabled={inputValue.trim() === ''}
						onClick={handleSave}
					>
						저장
					</Button>
				</div>
			</div>
		</div>
	);
}

export function SaveDialog() {
	const isSaveDialogOpen = useUIStore((s) => s.isSaveDialogOpen);
	const closeSaveDialog = useUIStore((s) => s.closeSaveDialog);
	const patternTitle = useChartStore((s) => s.patternTitle);

	if (!isSaveDialogOpen) return null;

	return (
		<SaveDialogContent
			initialTitle={patternTitle}
			onClose={closeSaveDialog}
		/>
	);
}
