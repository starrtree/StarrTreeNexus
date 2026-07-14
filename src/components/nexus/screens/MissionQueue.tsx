"use client";

import type { ReactNode } from "react";
import { Crosshair, Flag, ListChecks, Play, ShieldAlert, Users } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, MiniBar, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  queued: "border-violet-300/30 bg-violet-400/10 text-violet-100",
  planning: "border-sky-300/35 bg-sky-400/10 text-sky-100",
  executing: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  waiting: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  testing: "border-fuchsia-300/40 bg-fuchsia-400/10 text-fuchsia-100",
  blocked: "border-red-300/40 bg-red-400/10 text-red-100",
  complete: "border-white/15 bg-white/5 text-violet-200/50",
};

const priorityTone: Record<string, string> = {
  low: "text-violet-200/50",
  medium: "text-sky-200",
  high: "text-amber-200",
  urgent: "text-red-200",
};

export function MissionQueue() {
  const missions = useNexus((s) => s.agentMissions);
  const agents = useNexus((s) => s.agents);
  const departments = useNexus((s) => s.departments);
  const selectedMissionId = useNexus((s) => s.selectedMissionId);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSection = useNexus((s) => s.setSection);

  const selected = missions.find((m) => m.id === selectedMissionId) ?? missions[0];
  const blocked = missions.filter((m) => m.blockers.length > 0 && m.status !== "complete");
  const active = missions.filter((m) => ["executing", "testing", "planning"].includes(m.status));

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Mission Queue" subtitle="work assigned to AI agents" icon={<Crosshair size={16} />} />
        <div className="grid gap-2 sm:grid-cols-4">
          <Metric label="Active" value={active.length} />
          <Metric label="Blocked" value={blocked.length} warning={blocked.length > 0} />
          <Metric label="Total" value={missions.length} />
          <Metric label="Avg progress" value={Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / Math.max(missions.length, 1))} suffix="%" />
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {missions.map((mission) => {
            const lead = agents.find((a) => a.id === mission.leadAgentId);
            const support = mission.supportAgentIds.map((id) => agents.find((a) => a.id === id)).filter(Boolean);
            const department = departments.find((d) => d.id === mission.departmentId);
            const activeCard = selected?.id === mission.id;
            return (
              <button
                key={mission.id}
                onClick={() => setSelectedMission(mission.id)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition hover:border-amber-300/35 hover:bg-white/[0.045]",
                  activeCard ? "border-amber-300/50 bg-amber-400/[0.06]" : "border-violet-400/15 bg-white/[0.025]",
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", statusTone[mission.status])}>
                        {mission.status}
                      </span>
                      <span className={cn("font-hud text-[8px] uppercase tracking-widest", priorityTone[mission.priority])}>
                        {mission.priority} priority
                      </span>
                      {department && <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">{department.name}</span>}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-amber-50">{mission.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-violet-100/60">{mission.description}</p>
                  </div>
                  <div className="min-w-[150px] rounded-xl border border-violet-400/15 bg-black/20 p-3">
                    <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Lead Agent</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-amber-50">
                      <span className="h-2 w-2 rounded-full" style={{ background: lead?.color ?? "#fbbf24" }} />
                      {lead?.name ?? mission.leadAgentId}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between font-hud text-[8px] uppercase tracking-widest text-violet-300/45">
                    <span>Mission Progress</span>
                    <span>{mission.progress}%</span>
                  </div>
                  <MiniBar value={mission.progress} color={department?.color ?? lead?.color ?? "#fbbf24"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {support.map((agent) => (
                    <span key={agent!.id} className="rounded-full border border-violet-400/20 bg-white/5 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60">
                      + {agent!.name}
                    </span>
                  ))}
                  {mission.blockers.map((blocker) => (
                    <span key={blocker} className="rounded-full border border-red-400/25 bg-red-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-red-100/70">
                      {blocker}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="space-y-4">
            <GlassCard glow={selected.blockers.length ? "red" : "purple"} className="sticky top-4">
              <PanelTitle title={selected.title} subtitle={selected.status} icon={<Flag size={16} />} />
              <p className="text-sm leading-relaxed text-violet-100/70">{selected.description}</p>
              <div className="mt-4">
                <MiniBar value={selected.progress} color={departments.find((d) => d.id === selected.departmentId)?.color ?? "#fbbf24"} />
              </div>

              <Detail label="Lead Agent" icon={<Users size={13} />}>
                <AgentButton id={selected.leadAgentId} />
              </Detail>
              <Detail label="Support Agents" icon={<Users size={13} />}>
                <div className="flex flex-wrap gap-1.5">
                  {selected.supportAgentIds.map((id) => <AgentButton key={id} id={id} />)}
                </div>
              </Detail>
              <Detail label="Inputs" icon={<ListChecks size={13} />}>
                <BulletList items={selected.inputs} />
              </Detail>
              <Detail label="Outputs" icon={<Play size={13} />}>
                <BulletList items={selected.outputs} />
              </Detail>
              {selected.blockers.length > 0 && (
                <Detail label="Blockers" icon={<ShieldAlert size={13} />} warning>
                  <BulletList items={selected.blockers} />
                </Detail>
              )}
              <button
                onClick={() => setSection("starrmap")}
                className="mt-4 w-full rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-amber-100 transition hover:bg-amber-400/20"
              >
                View collaboration network
              </button>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );

  function AgentButton({ id }: { id: string }) {
    const agent = agents.find((a) => a.id === id);
    return (
      <button
        onClick={() => {
          setSelectedAgent(id);
          setSection("agents");
        }}
        className="rounded-full border border-violet-400/20 bg-white/5 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/70 transition hover:border-amber-300/35 hover:text-amber-100"
      >
        {agent?.name ?? id}
      </button>
    );
  }
}

function Metric({ label, value, suffix = "", warning }: { label: string; value: number; suffix?: string; warning?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2", warning ? "border-red-400/25 bg-red-400/10" : "border-violet-400/15 bg-black/20")}>
      <div className={cn("font-hud text-lg font-bold", warning ? "text-red-100" : "text-amber-100")}>{value}{suffix}</div>
      <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{label}</div>
    </div>
  );
}

function Detail({ label, icon, children, warning }: { label: string; icon: ReactNode; children: ReactNode; warning?: boolean }) {
  return (
    <div className={cn("mt-4 rounded-xl border bg-black/20 p-3", warning ? "border-red-400/25" : "border-violet-400/15")}>
      <div className="mb-2 flex items-center gap-1.5 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
        {icon}
        {label}
      </div>
      <div className="text-xs text-violet-100/70">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
