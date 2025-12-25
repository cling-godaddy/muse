import { BlockEditor } from "@muse/editor";
import type { Block } from "@muse/core";
import { Chat } from "./components/chat";
import { useBlocks } from "./hooks/useBlocks";

export function App() {
  const { blocks, setBlocks } = useBlocks();

  const handleInsertBlocks = (newBlocks: Block[]) => {
    setBlocks([...blocks, ...newBlocks]);
  };

  return (
    <div className="flex flex-col h-full font-sans text-text bg-bg">
      <header className="px-6 py-3 border-b border-border bg-bg">
        <h1 className="m-0 text-xl font-semibold">Muse</h1>
      </header>
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="w-[400px] shrink-0">
          <Chat onInsertBlocks={handleInsertBlocks} />
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="h-full border border-border rounded bg-bg p-4">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>
      </main>
    </div>
  );
}
