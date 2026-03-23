export function ChartCanvas() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full bg-white border border-zinc-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <span className="text-sm font-medium text-zinc-700">도안 캔버스</span>
          <span className="text-xs text-zinc-400">50 × 50</span>
        </div>
        <div className="flex items-center justify-center p-8 min-h-[600px] bg-zinc-50">
          <div className="text-sm text-zinc-400">Konva 캔버스가 여기에 렌더링됩니다</div>
        </div>
      </div>
    </div>
  );
}
