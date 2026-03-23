import { ChartCanvas } from "@/components/editor/ChartCanvas";
import { EditorSidebar } from "@/components/editor/EditorSidebar";

export default function EditorPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      <main className="flex-1 overflow-auto p-8">
        <ChartCanvas />
      </main>
      <aside className="w-72 shrink-0 border-l border-zinc-200 bg-white overflow-y-auto">
        <EditorSidebar />
      </aside>
    </div>
  );
}
