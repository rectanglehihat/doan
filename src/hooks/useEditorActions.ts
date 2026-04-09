'use client';

import { useState, useCallback, useEffect } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { useChartStore } from '@/store/useChartStore';
import { useUIStore } from '@/store/useUIStore';
import { RotationalMode } from '@/types/knitting';

interface EditorHistoryActions {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  beginBatch: () => void;
  endBatch: () => void;
}

interface EditorModeActions {
  isShapeGuideDrawMode: boolean;
  onShapeGuideDrawModeChange: (active: boolean) => void;
  isShapeGuideEraseMode: boolean;
  onShapeGuideEraseModeChange: (active: boolean) => void;
  onShapeGuideClear: () => void;
  isSelectionMode: boolean;
  onSelectionModeChange: (active: boolean) => void;
  rotationalMode: RotationalMode;
  onRotationalModeChange: (mode: RotationalMode) => void;
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
  onColorClear: () => void;
  recentColors: string[];
  onFitToScreen: () => void;
}

interface EditorResetActions {
  isResetDialogOpen: boolean;
  onReset: () => void;
  onResetConfirm: () => void;
  onResetCancel: () => void;
}

export type EditorActions = EditorHistoryActions & EditorModeActions & EditorResetActions;

export function useEditorActions(): EditorActions {
  const { undo, redo, canUndo, canRedo, beginBatch, endBatch } = useHistory();

  const reset = useChartStore((state) => state.reset);
  const clearAllColors = useChartStore((state) => state.clearAllColors);

  const {
    reset: resetUI,
    setShapeGuide,
    isShapeGuideDrawMode,
    isShapeGuideEraseMode,
    setShapeGuideDrawMode,
    setShapeGuideEraseMode,
    isSelectionMode,
    setSelectionMode,
    setCellSelection,
    setSelectedSymbol,
    rotationalMode,
    setRotationalMode,
    selectedColor,
    setSelectedColor,
    recentColors,
    addRecentColor,
  } = useUIStore();

  // 리셋 다이얼로그는 로컬 상태로 관리
  const [localResetDialogOpen, setLocalResetDialogOpen] = useState(false);

  const onUndo = useCallback(() => {
    undo();
  }, [undo]);

  const onRedo = useCallback(() => {
    redo();
  }, [redo]);

  const onReset = useCallback(() => {
    setLocalResetDialogOpen(true);
  }, []);

  const onResetConfirm = useCallback(() => {
    reset();
    resetUI();
    setLocalResetDialogOpen(false);
  }, [reset, resetUI]);

  const onResetCancel = useCallback(() => {
    setLocalResetDialogOpen(false);
  }, []);

  const onShapeGuideDrawModeChange = useCallback(
    (active: boolean) => {
      setShapeGuideDrawMode(active);
      if (active) {
        setShapeGuideEraseMode(false);
        setSelectionMode(false);
        setCellSelection(null);
        setSelectedSymbol(null);
      }
    },
    [setShapeGuideDrawMode, setShapeGuideEraseMode, setSelectionMode, setCellSelection, setSelectedSymbol],
  );

  const onShapeGuideEraseModeChange = useCallback(
    (active: boolean) => {
      setShapeGuideEraseMode(active);
      if (active) {
        setShapeGuideDrawMode(false);
        setSelectionMode(false);
        setCellSelection(null);
        setSelectedSymbol(null);
      }
    },
    [setShapeGuideEraseMode, setShapeGuideDrawMode, setSelectionMode, setCellSelection, setSelectedSymbol],
  );

  const onShapeGuideClear = useCallback(() => {
    setShapeGuide(null);
    setShapeGuideDrawMode(false);
    setShapeGuideEraseMode(false);
  }, [setShapeGuide, setShapeGuideDrawMode, setShapeGuideEraseMode]);

  const onSelectionModeChange = useCallback(
    (active: boolean) => {
      setSelectionMode(active);
      if (active) {
        setShapeGuideDrawMode(false);
        setShapeGuideEraseMode(false);
        setSelectedSymbol(null);
      } else {
        setCellSelection(null);
      }
    },
    [setSelectionMode, setShapeGuideDrawMode, setShapeGuideEraseMode, setCellSelection, setSelectedSymbol],
  );

  const onRotationalModeChange = useCallback(
    (mode: RotationalMode) => {
      setRotationalMode(mode);
    },
    [setRotationalMode],
  );

  const onColorChange = useCallback(
    (color: string | null) => {
      setSelectedColor(color);
      if (color !== null) addRecentColor(color);
    },
    [setSelectedColor, addRecentColor],
  );

  const onColorClear = useCallback(() => {
    clearAllColors();
    setSelectedColor(null);
  }, [clearAllColors, setSelectedColor]);

  const onFitToScreen = useCallback(() => {
    window.dispatchEvent(new Event('doan:fit-to-screen'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.repeat) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    beginBatch,
    endBatch,
    isResetDialogOpen: localResetDialogOpen,
    onReset,
    onResetConfirm,
    onResetCancel,
    isShapeGuideDrawMode,
    onShapeGuideDrawModeChange,
    isShapeGuideEraseMode,
    onShapeGuideEraseModeChange,
    onShapeGuideClear,
    isSelectionMode,
    onSelectionModeChange,
    rotationalMode,
    onRotationalModeChange,
    selectedColor,
    onColorChange,
    onColorClear,
    recentColors,
    onFitToScreen,
  };
}
