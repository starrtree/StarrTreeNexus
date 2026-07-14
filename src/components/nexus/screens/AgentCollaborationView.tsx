"use client";

import { GitBranch, Network, RadioTower, Workflow } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

export function AgentCollaborationView() {
  const agents = useNexus((s) => s.agents);
  const runtimes = useNexus((s) => s.agentRuntimes);
  const missions = useNexus((s) => s.agentMissions);
  const departments = useNexus((s) => s.departments);
  const collaborations = useNexus((s) => s.collaborations);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSection = useNexus((s) => s.setSection);

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Agent Network" subtitle="who is working with who" icon={<Network size={16} />} />
        <p className="text-sm text-violet-100/65">
          This view turns agent work into a collaboration graph. When agents share a mission, they appear connected through handoffs, reviews, and pipeline paths.
        </p>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <GlassCard className="min-h-[560px] overflow-hidden p-0">
          <div className="relative h-[590px] overflow-hidden rounded-2xl border border-violet-400/15 bg-black/25">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.08),transparent_24%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.09),transparent_28%)]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {collaborations.map((collab, idx) => {
                const points = collab.agentIds
                  .map((id) => runtimes.find((r) => r.agentId === id)?.position)
                  .filter(Boolean) as { x: number; y: number }[];
                return points.slice(0, -1).map((point, i) => {
                  const next = points[i + 1];
                  return (
                    <line
                      key={`${collab.id}-${i}`}
                      x1={point.x}
                      y1={point.y}
                      x2={next.x}
                      y2={next.y}
                      stroke={idx % 2 ? "rgba(56,189,248,0.58)" : "rgba(251,191,36,0.68)"}
                      strokeWidth="0.45"
                      strokeDasharray="2 1"
                    />
                  );
                });
              })}
            </svg>

            {departments.map((department) => (
              <div
                key={department.id}
                className="absolute rounded-2xl border border-violet-400/10 bg-white/[0.025] px-3 py-2 text-center"
                style={{ left: `${department.x + department.w / 2}%`, top: `${department.y + department.h / 2}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">{department.short}</div>
              </div>
            ))}

            {runtimes.map((runtime) => {
              const agent = agents.find((a) => a.id === runtime.agentId);
              const mission = missions.find((m) => m.id === runtime.currentMissionId);
              if (!agent) return null;
              return (
                <button
                  key={runtime.agentId}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    if (mission) setSelectedMission(mission.id);
                    setSection("agents");
                  }}
                  className={cn(
                    "absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border bg-black/50 text-center shadow-2xl transition hover:scale-110",
                    runtime.status === "collaborating" && "border-amber-300/60",
                    runtime.status === "working" && "border-emerald-300/60",
                    runtime.status === "planning" && "border-sky-300/60",
                  )}
                  style={{ left: `${runtime.position.x}%`, top: `${runtime.position.y}%`, boxShadow: `0 0 24px ${agent.color}66` }}
                >
                  <span className="font-hud text-lg" style={{ color: agent.color }}>{runtime.avatar}</span>
                  <span className="mt-0.5 max-w-[48px] truncate font-hud text-[7px] uppercase tracking-widest text-violet-100/60">{agent.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard glow="purple">
            <PanelTitle title="Live Handoffs" subtitle="collaboration tracks" icon={<GitBranch size={16} />} />
            <div className="space-y-3">
              {collaborations.map((collab) => {
                const mission = missions.find((m) => m.id === collab.missionId);
                const room = departments.find((d) => d.id === collab.roomId);
                return (
                  <button
                    key={collab.id}
                    onClick={() => {
                      if (mission) setSelectedMission(mission.id);
                      setSection("mission");
                    }}
                    className="w-full rounded-2xl border border-violet-400/15 bg-white/[0.025] p-4 text-left transition hover:border-amber-300/35"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-amber-50">{mission?.title ?? collab.id}</h3>
                        <p className="mt-1 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{room?.name ?? collab.roomId} · {collab.type}</p>
                      </div>
                      <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", collab.status === "live" ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border-violet-300/25 bg-violet-400/10 text-violet-100")}>{collab.status}</span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {collab.handoffHistory.map((step, i) => (
                        <div key={step} className="flex items-center gap-2 text-xs text-violet-100/65">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400/20 bg-black/30 font-hud text-[8px] text-amber-100">{i + 1}</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Network Rule" subtitle="how StarrBase should think" icon={<RadioTower size={16} />} />
            <p className="text-sm leading-relaxed text-violet-100/65">
              One agent owns the mission. Supporting agents add special powers. UNI Core coordinates handoffs. QA Sentinel reviews anything that could break the system.
            </p>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Pipeline Example" subtitle="agent company flow" icon={<Workflow size={16} />} />
            <div className="space-y-2 font-hud text-[10px] uppercase tracking-widest text-violet-100/65">
              <FlowStep text="Lead Scout finds opportunity" />
              <FlowStep text="Cashflow Agent validates offer" />
              <FlowStep text="Automation Architect designs system" />
              <FlowStep text="Builder Agent ships interface" />
              <FlowStep text="QA Sentinel tests and gates launch" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-violet-400/15 bg-black/20 px-3 py-2">
      {text}
    </div>
  );
}
