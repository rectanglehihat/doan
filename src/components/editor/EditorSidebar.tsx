function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-100 px-4 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function EditorSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-800">편집 도구</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidebarSection title="뜨개 종류">
          <div className="flex gap-2">
            <button className="flex-1 rounded-md border border-zinc-800 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white">
              대바늘
            </button>
            <button className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
              코바늘
            </button>
          </div>
        </SidebarSection>

        <SidebarSection title="기호 팔레트">
          <div className="grid grid-cols-4 gap-1.5">
            {["K", "P", "S", "K2tog", "ssk", "yo", "sl1", "psso", "k-b", "p-b"].map(
              (symbol) => (
                <button
                  key={symbol}
                  className="flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-mono text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                >
                  {symbol}
                </button>
              )
            )}
          </div>
        </SidebarSection>

        <SidebarSection title="격자 설정">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-600">너비 (코)</label>
              <input
                type="number"
                defaultValue={50}
                min={1}
                max={200}
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-xs text-right text-zinc-800 focus:border-zinc-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-600">높이 (단)</label>
              <input
                type="number"
                defaultValue={50}
                min={1}
                max={200}
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-xs text-right text-zinc-800 focus:border-zinc-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-600">칸 크기 (px)</label>
              <input
                type="number"
                defaultValue={20}
                min={10}
                max={40}
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-xs text-right text-zinc-800 focus:border-zinc-400 focus:outline-none"
              />
            </div>
          </div>
        </SidebarSection>

        <SidebarSection title="도안 정보">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="도안 제목"
              className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
            <select className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-800 focus:border-zinc-400 focus:outline-none">
              <option value="">난이도 선택</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>
        </SidebarSection>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-4">
        <button className="w-full rounded-md bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700">
          저장
        </button>
        <button className="w-full rounded-md border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
          PDF 내보내기
        </button>
      </div>
    </div>
  );
}
