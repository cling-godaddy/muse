import type { Usage } from "@muse/core";
import { Dialog } from "@muse/ui";
import { formatAction } from "../../utils/formatAction";
import { formatRelativeTime } from "../../utils/formatTime";

interface CostsModalProps {
  costs: Usage[]
  totalCost: number
  trigger: React.ReactNode
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function CostsModal({ costs, totalCost, trigger }: CostsModalProps) {
  // Sort by timestamp, newest first
  const sortedCosts = [...costs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const totalTokens = costs.reduce((sum, c) => sum + c.input + c.output, 0);

  return (
    <Dialog trigger={trigger} title="Session Costs">
      <div className="p-5 min-w-[450px]">
        {sortedCosts.length === 0
          ? (
            <div className="text-sm text-text-subtle text-center py-4">
              No costs recorded yet
            </div>
          )
          : (
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_70px_90px_75px] gap-2 text-[11px] text-text-muted font-medium pb-2 pr-3 border-b border-border-light">
                <span>Action</span>
                <span className="text-right">Cost</span>
                <span className="text-right">Tokens</span>
                <span className="text-right">When</span>
              </div>

              {/* Cost entries - scrollable */}
              <div className="max-h-[50vh] overflow-y-auto">
                {sortedCosts.map((cost, i) => (
                  <div
                    key={`${cost.timestamp}-${i}`}
                    className="grid grid-cols-[1fr_70px_90px_75px] gap-2 text-xs py-1.5 rounded odd:bg-bg-subtle"
                  >
                    <span className="text-text truncate">
                      {formatAction(cost.action)}
                      {cost.detail && (
                        <span className="text-text-muted ml-1">
                          (
                          {cost.detail}
                          )
                        </span>
                      )}
                    </span>
                    <span className="text-right text-text tabular-nums">
                      $
                      {cost.cost.toFixed(4)}
                    </span>
                    <span className="text-right text-text-muted tabular-nums">
                      {formatTokens(cost.input)}
                      {" "}
                      +
                      {" "}
                      {formatTokens(cost.output)}
                    </span>
                    <span className="text-right text-text-subtle">
                      {formatRelativeTime(cost.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div className="grid grid-cols-[1fr_70px_90px_75px] gap-2 text-xs pt-2 border-t border-border-light font-medium">
                <span className="text-text-muted">Total</span>
                <span className="text-right text-text tabular-nums">
                  $
                  {totalCost.toFixed(4)}
                </span>
                <span className="text-right text-text-muted tabular-nums">
                  {formatTokens(totalTokens)}
                </span>
                <span />
              </div>
            </div>
          )}
      </div>
    </Dialog>
  );
}
