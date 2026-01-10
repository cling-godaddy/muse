import { useMemo, useState } from "react";
import { Dialog, Spinner } from "@muse/ui";
import type { AgentState } from "../../utils/streamParser";

interface TimelineModalProps {
  agents: AgentState[]
  isLoading: boolean
  trigger: React.ReactNode
}

interface TimelineEntry {
  agent: AgentState
  start: number
  end: number
}

export function TimelineModal({ agents, isLoading, trigger }: TimelineModalProps) {
  const { timeline, totalDuration } = useMemo(
    () => buildTimeline(agents),
    [agents],
  );

  return (
    <Dialog trigger={trigger} title="Agent Timeline">
      <div className="p-5">
        {agents.length === 0
          ? (
            <div className="flex items-center gap-2 text-sm text-text-subtle">
              <Spinner size="sm" />
              <span>Starting...</span>
            </div>
          )
          : (
            <GanttChart
              timeline={timeline}
              totalDuration={totalDuration}
              isLoading={isLoading}
            />
          )}
      </div>
    </Dialog>
  );
}

function buildTimeline(agents: AgentState[]): { timeline: TimelineEntry[], totalDuration: number } {
  if (agents.length === 0) return { timeline: [], totalDuration: 0 };

  const timeline: TimelineEntry[] = [];
  let cursor = 0;

  const structureAgent = agents.find(a => a.name === "structure");
  const themeAgent = agents.find(a => a.name === "theme");

  for (const agent of agents) {
    const duration = agent.duration ?? (agent.status === "running" ? 2000 : 0);

    if (agent.name === "theme" && structureAgent) {
      // theme runs parallel with structure, starts at same time
      const structureEntry = timeline.find(e => e.agent.name === "structure");
      const start = structureEntry?.start ?? cursor;
      timeline.push({ agent, start, end: start + duration });
    }
    else {
      timeline.push({ agent, start: cursor, end: cursor + duration });

      // advance cursor, but for structure wait for both structure and theme
      if (agent.name === "structure" && themeAgent) {
        const themeDuration = themeAgent.duration ?? (themeAgent.status === "running" ? 2000 : 0);
        cursor += Math.max(duration, themeDuration);
      }
      else if (agent.name !== "theme") {
        cursor += duration;
      }
    }
  }

  const totalDuration = Math.max(...timeline.map(e => e.end), 1);
  return { timeline, totalDuration };
}

interface GanttChartProps {
  timeline: TimelineEntry[]
  totalDuration: number
  isLoading: boolean
}

function GanttChart({ timeline, totalDuration, isLoading }: GanttChartProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  return (
    <div className="space-y-1">
      {/* time scale */}
      <div className="flex justify-between text-[10px] text-text-subtle pl-[88px] pr-10 mb-2">
        <span>0s</span>
        <span>{formatDuration(totalDuration)}</span>
      </div>

      {/* agent rows */}
      {timeline.map((entry) => {
        const { agent, start, end } = entry;
        const isRunning = agent.status === "running";
        const left = (start / totalDuration) * 100;
        const width = Math.max(((end - start) / totalDuration) * 100, 3);
        const meta = getMetaText(agent);
        const isExpanded = expanded === agent.name;
        const hasContent = !!meta;

        return (
          <div key={agent.name}>
            {/* main row */}
            <div
              className={`flex items-center gap-2 h-7 ${
                hasContent ? "cursor-pointer active:opacity-80" : ""
              }`}
              onClick={() => hasContent && setExpanded(isExpanded ? null : agent.name)}
            >
              {/* agent name + caret */}
              <div className="w-20 text-xs font-medium text-text capitalize shrink-0 text-right pr-2">
                {agent.name}
                {hasContent && (
                  <span className="text-[10px] text-text-muted ml-1">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                )}
              </div>

              {/* timeline bar container */}
              <div className="flex-1 relative bg-bg-subtle rounded h-5">
                <div
                  className={`absolute top-0 h-full rounded flex items-center justify-end pr-1 transition-all duration-300 ${
                    isRunning ? "bg-primary" : "bg-success"
                  }`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {isRunning && <Spinner size="sm" className="text-white" />}
                </div>
              </div>

              {/* duration only */}
              <div className="text-[11px] text-text-subtle shrink-0 text-right w-10">
                {agent.duration ? formatDuration(agent.duration) : isRunning ? "..." : ""}
              </div>
            </div>

            {/* expanded content */}
            {meta && (
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="pl-20 pr-12 py-1 text-[11px] text-text-muted">
                    {meta}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* total */}
      {!isLoading && timeline.length > 0 && (
        <div className="flex items-center gap-2 h-7 mt-2 pt-2 border-t border-border-light">
          <div className="w-20 text-xs font-medium text-text-muted shrink-0 text-right pr-2">
            Total
          </div>
          <div className="flex-1" />
          <div className="text-xs font-semibold text-text shrink-0 w-10 text-right">
            {formatDuration(totalDuration)}
          </div>
        </div>
      )}
    </div>
  );
}

function getMetaText(agent: AgentState): string | null {
  const { data, summary } = agent;

  if (agent.name === "structure") {
    if (data?.sectionTypes?.length) {
      return data.sectionTypes.join(" · ");
    }
    if (data?.sectionCount !== undefined) {
      return `${data.sectionCount} sections`;
    }
  }

  if (agent.name === "theme" && data?.palette) {
    return data.typography ? `${data.palette} + ${data.typography}` : data.palette;
  }

  if (agent.name === "image" && data?.planned !== undefined) {
    return `${data.planned} queries → ${data.resolved ?? 0} images`;
  }

  if (summary) {
    return summary;
  }

  return null;
}
