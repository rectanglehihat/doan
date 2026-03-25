'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';

interface ConfirmDialogProps {
	open: boolean;
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = '확인',
	cancelLabel = '취소',
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const handleConfirm = useCallback(() => {
		onConfirm();
	}, [onConfirm]);

	const handleCancel = useCallback(() => {
		onCancel();
	}, [onCancel]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/40" onClick={handleCancel} />
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? 'confirm-dialog-title' : undefined}
				className="relative z-10 w-80 rounded-lg bg-white p-6 shadow-xl"
			>
				{title && (
					<h2 id="confirm-dialog-title" className="mb-2 text-sm font-semibold text-zinc-800">
						{title}
					</h2>
				)}
				<p className="mb-5 text-sm text-zinc-600">{message}</p>
				<div className="flex justify-end gap-2">
					<Button variant="outline" size="sm" onClick={handleCancel}>
						{cancelLabel}
					</Button>
					<Button variant="default" size="sm" onClick={handleConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
