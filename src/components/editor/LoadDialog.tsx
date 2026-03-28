'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { useUIStore } from '@/store/useUIStore';
import { usePatterns } from '@/hooks/usePatterns';
import type { SavedPatternSnapshot } from '@/types/knitting';

interface PatternListItemProps {
	pattern: SavedPatternSnapshot;
	onLoad: (id: string) => void;
	onDelete: (id: string) => void;
}

function PatternListItem({ pattern, onLoad, onDelete }: PatternListItemProps) {
	const handleLoad = useCallback(() => {
		onLoad(pattern.id);
	}, [onLoad, pattern.id]);

	const handleDelete = useCallback(() => {
		onDelete(pattern.id);
	}, [onDelete, pattern.id]);

	const formattedDate = new Date(pattern.savedAt).toLocaleString();

	return (
		<li role="listitem" className="flex items-center justify-between gap-2 py-2">
			<div className="flex flex-col min-w-0">
				<span className="text-sm font-medium text-slate-900 truncate">{pattern.title}</span>
				<span className="text-xs text-slate-400">{formattedDate}</span>
			</div>
			<div className="flex shrink-0 gap-1">
				<Button variant="default" size="sm" onClick={handleLoad}>
					불러오기
				</Button>
				<Button variant="outline" size="sm" onClick={handleDelete}>
					삭제
				</Button>
			</div>
		</li>
	);
}

const TITLE_ID = 'load-dialog-title';

export function LoadDialog() {
	const isLoadDialogOpen = useUIStore((s) => s.isLoadDialogOpen);
	const closeLoadDialog = useUIStore((s) => s.closeLoadDialog);
	const { patterns, loadPattern, deletePattern, refreshPatterns } = usePatterns();

	useEffect(() => {
		if (isLoadDialogOpen) {
			refreshPatterns();
		}
	}, [isLoadDialogOpen, refreshPatterns]);

	useEffect(() => {
		if (!isLoadDialogOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeLoadDialog();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isLoadDialogOpen, closeLoadDialog]);

	const handleLoad = useCallback(
		(id: string) => {
			loadPattern(id);
			closeLoadDialog();
		},
		[loadPattern, closeLoadDialog],
	);

	const handleDelete = useCallback(
		(id: string) => {
			deletePattern(id);
		},
		[deletePattern],
	);

	const handleClose = useCallback(() => {
		closeLoadDialog();
	}, [closeLoadDialog]);

	const handleOverlayClick = useCallback(() => {
		closeLoadDialog();
	}, [closeLoadDialog]);

	const handlePanelClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
	}, []);

	if (!isLoadDialogOpen) return null;

	return (
		<div
			data-testid="load-dialog-overlay"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
			onClick={handleOverlayClick}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={TITLE_ID}
				className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
				onClick={handlePanelClick}
			>
				<h2 id={TITLE_ID} className="mb-4 text-base font-semibold text-slate-900">
					도안 불러오기
				</h2>

				<div className="mb-4 max-h-72 overflow-y-auto">
					{patterns.length === 0 ? (
						<p className="py-4 text-center text-sm text-slate-400">저장된 도안이 없습니다</p>
					) : (
						<ul role="list" className="divide-y divide-slate-100">
							{patterns.map((pattern) => (
								<PatternListItem
									key={pattern.id}
									pattern={pattern}
									onLoad={handleLoad}
									onDelete={handleDelete}
								/>
							))}
						</ul>
					)}
				</div>

				<div className="flex justify-end">
					<Button variant="outline" size="sm" onClick={handleClose}>
						닫기
					</Button>
				</div>
			</div>
		</div>
	);
}
