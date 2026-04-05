'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';

export interface CanvasTransform {
	scale: number;
	x: number;
	y: number;
}

const SCALE_BY = 1.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

export function useCanvasNavigation(stageRef: { current: Konva.Stage | null }) {
	const [transform, setTransform] = useState<CanvasTransform>({ scale: 1, x: 0, y: 0 });
	const [isSpacePanning, setIsSpacePanning] = useState(false);

	const isSpaceDown = useRef(false);
	const isMousePanning = useRef(false);
	const lastMousePos = useRef({ x: 0, y: 0 });
	const lastTouchPos = useRef({ x: 0, y: 0 });
	const lastTouchDist = useRef<number | null>(null);
	const lastTouchMid = useRef({ x: 0, y: 0 });

	// Space 키 감지 — 누르는 동안 pan 모드
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === 'Space' && !e.repeat) {
				isSpaceDown.current = true;
				setIsSpacePanning(true);
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				isSpaceDown.current = false;
				setIsSpacePanning(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	// 휠: ctrlKey → 줌(트랙패드 핀치 포함), 그 외 → pan(두 손가락 스크롤)
	const handleWheel = useCallback(
		(e: KonvaEventObject<WheelEvent>) => {
			e.evt.preventDefault();
			if (e.evt.ctrlKey) {
				const stage = stageRef.current;
				if (!stage) return;
				const pointer = stage.getPointerPosition();
				if (!pointer) return;
				setTransform((prev) => {
					const newScale =
						e.evt.deltaY < 0
							? Math.min(MAX_SCALE, prev.scale * SCALE_BY)
							: Math.max(MIN_SCALE, prev.scale / SCALE_BY);
					return {
						scale: newScale,
						x: pointer.x - (pointer.x - prev.x) * (newScale / prev.scale),
						y: pointer.y - (pointer.y - prev.y) * (newScale / prev.scale),
					};
				});
			} else {
				setTransform((prev) => ({
					...prev,
					x: prev.x - e.evt.deltaX,
					y: prev.y - e.evt.deltaY,
				}));
			}
		},
		[stageRef],
	);

	// 터치 시작: 1손가락 → pan 준비, 2손가락 → 핀치 준비
	const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
		e.evt.preventDefault();
		const touches = e.evt.touches;
		if (touches.length === 1) {
			lastTouchPos.current = { x: touches[0].clientX, y: touches[0].clientY };
			lastTouchDist.current = null;
		} else if (touches.length >= 2) {
			const dx = touches[1].clientX - touches[0].clientX;
			const dy = touches[1].clientY - touches[0].clientY;
			lastTouchDist.current = Math.hypot(dx, dy);
			lastTouchMid.current = {
				x: (touches[0].clientX + touches[1].clientX) / 2,
				y: (touches[0].clientY + touches[1].clientY) / 2,
			};
		}
	}, []);

	// 터치 이동: 1손가락 → pan, 2손가락 → 핀치 줌
	const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
		e.evt.preventDefault();
		const touches = e.evt.touches;
		if (touches.length === 1 && lastTouchDist.current === null) {
			const dx = touches[0].clientX - lastTouchPos.current.x;
			const dy = touches[0].clientY - lastTouchPos.current.y;
			lastTouchPos.current = { x: touches[0].clientX, y: touches[0].clientY };
			setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
		} else if (touches.length >= 2 && lastTouchDist.current !== null) {
			const dx = touches[1].clientX - touches[0].clientX;
			const dy = touches[1].clientY - touches[0].clientY;
			const currDist = Math.hypot(dx, dy);
			const ratio = currDist / lastTouchDist.current;
			const mid = lastTouchMid.current;
			setTransform((prev) => {
				const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * ratio));
				return {
					scale: newScale,
					x: mid.x - (mid.x - prev.x) * (newScale / prev.scale),
					y: mid.y - (mid.y - prev.y) * (newScale / prev.scale),
				};
			});
			lastTouchDist.current = currDist;
			lastTouchMid.current = {
				x: (touches[0].clientX + touches[1].clientX) / 2,
				y: (touches[0].clientY + touches[1].clientY) / 2,
			};
		}
	}, []);

	const handleTouchEnd = useCallback(() => {
		lastTouchDist.current = null;
	}, []);

	// Space 키 pan 모드 여부 (안정적 함수 — ref 직접 노출 대신 사용)
	const isInSpacePanMode = useCallback(() => isSpaceDown.current, []);

	// 마우스 pan 헬퍼 (중간 버튼 또는 Space + 좌클릭)
	const startMousePan = useCallback((clientX: number, clientY: number) => {
		isMousePanning.current = true;
		lastMousePos.current = { x: clientX, y: clientY };
	}, []);

	// pan 중이면 transform 업데이트 후 true 반환, 아니면 false 반환
	const updateMousePan = useCallback((clientX: number, clientY: number): boolean => {
		if (!isMousePanning.current) return false;
		const dx = clientX - lastMousePos.current.x;
		const dy = clientY - lastMousePos.current.y;
		lastMousePos.current = { x: clientX, y: clientY };
		setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
		return true;
	}, []);

	const endMousePan = useCallback(() => {
		isMousePanning.current = false;
	}, []);

	const fitToScreen = useCallback(
		(stageWidth: number, stageHeight: number, gridWidth: number, gridHeight: number) => {
			const padding = 0.9;
			const scaleX = (stageWidth * padding) / gridWidth;
			const scaleY = (stageHeight * padding) / gridHeight;
			const rawScale = Math.min(scaleX, scaleY);
			const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale));
			const newX = (stageWidth - gridWidth * newScale) / 2;
			const newY = (stageHeight - gridHeight * newScale) / 2;
			setTransform({ scale: newScale, x: newX, y: newY });
		},
		[],
	);

	return {
		transform,
		isSpacePanning,
		isInSpacePanMode,
		handleWheel,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		startMousePan,
		updateMousePan,
		endMousePan,
		fitToScreen,
	};
}
