"use client";

import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Database,
  Network,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { cn } from "@/lib/utils";

export function IntelligencePanel({ onClose }: { onClose?: () => void }) {
  const alerts = useNexus((s) => s.alerts);
  const agents = useNexus((s) => s.agents);
  const runtimes = useNexus((s) => s.agentRuntimes);
  const missions = useNexus((s) => s.agentMissions);
  const collaborations = useNexus((s) => s.collaborations);
  const memoryZones = useNexus((s) => s.memoryZones);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSection = useNexus((s) => s.setSection);
  const focusMode = useNexus((s) => s.focusMode);
  const cloud = useNexus((s) => s.cloud);

  const blockedMissions = missions.filter((m) => m.blockers.length > 0 && m.status !== "complete");
  const workingAgents = runtimes.filter((r) => ["working", "collaborating", "planning"].includes(r.status));
  const liveCollabs = collaborations.filter((c) => c.status === "live");

  return (
    <aside className="glass flex h-full w-full flex-col overflow-hidden rounded-l-2xl">
      <div className="flex items-center justify-between border-b border-violet-400/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-breathe" />
            <Activity size={14} className="relative text-amber-300" />
          </div>
          <div>
            <div className="font-hud text-xs font-bold uppercase tracking-widest text-amber-100">
              Agent Intel
            </div>
            <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
              StarrBase live feed
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-violet-200/60 transition hover:bg-white/10 lg:hidden"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="nexus-scroll flex-1 space-y-4 overflow-y-auto p-4">
        <Section title="Current Agent State" icon={Bot}>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Working" value={workingAgents.length} color="emerald" />
            <Metric label="Missions" value={missions.length} color="amber" />
          </div>
          <div className="mt-2 space-y-1.5">
            {workingAgents.slice(0, 6).map((runtime) => {
              const agent = agents.find((a) => a.id === runtime.agentId);
              return (
                <button
                  key={runtime.agentId}
                  onClick={() => {
                    setSelectedAgent(runtime.agentId);
                    setSection("agents");
                  }}
                  className="flex w-full items-start gap-2 rounded-lg border border-violet-400/15 bg-white/[0.03] p-2 text-left transition hover:border-amber-300/35"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-hud text-xs"
                    style={{ borderColor: agent?.color ?? "#fbbf24", color: agent?.color ?? "#fbbf24" }}
                  >
                    {runtime.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-amber-50">{agent?.name ?? runtime.agentId}</span>
                    <span className="block truncate font-hud text-[9px] uppercase tracking-wider text-violet-300/50">
                      {runtime.activeProcess}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Live Collaborations" icon={Network}>
          <div className="space-y-1.5">
            {liveCollabs.length === 0 && <Empty text="No live collaborations." />}
            {liveCollabs.map((collab) => {
              const mission = missions.find((m) => m.id === collab.missionId);
              return (
                <button
                  key={collab.id}
                  onClick={() => {
                    if (mission) setSelectedMission(mission.id);
                    setSection("starrmap");
                  }}
                  className="w-full rounded-lg border border-amber-300/20 bg-amber-400/5 px-3 py-2 text-left transition hover:border-amber-300/45"
                >
                  <div className="text-xs font-medium text-amber-50">{mission?.title ?? collab.id}</div>
                  <div className="font-hud text-[9px] uppercase tracking-wider text-violet-300/50">
                    {collab.agentIds.join(" → ")}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Blocked Missions" icon={AlertTriangle}>
          <div className="space-y-1.5">
            {blockedMissions.length === 0 && (
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">
                No active mission blockers.
              </div>
            )}
            {blockedMissions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => {
                  setSelectedMission(mission.id);
                  setSection("mission");
                }}
                className="flex w-full items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-left transition hover:border-red-300/45"
              >
                <ShieldAlert size={13} className="mt-0.5 shrink-0 text-red-300" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-red-100">{mission.blockers[0]}</span>
                  <span className="font-hud text-[9px] uppercase tracking-wider text-violet-300/50">{mission.title}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Memory Health" icon={Database}>
          <div className="space-y-1.5">
            {memoryZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSection("vault")}
                className="flex w-full items-center justify-between rounded-lg border border-violet-400/15 bg-white/[0.03] px-3 py-2 text-left transition hover:border-amber-300/35"
              >
                <span>
                  <span className="block text-xs font-medium text-amber-50">{zone.name}</span>
                  <span className="font-hud text-[9px] uppercase tracking-wider text-violet-300/50">{zone.sourceCount} sources</span>
                </span>
                <span className={cn("h-2 w-2 rounded-full", zone.status === "indexed" ? "bg-emerald-300" : zone.status === "needs_sync" ? "bg-amber-300" : "bg-sky-300")} />
              </button>
            ))}
          </div>
        </Section>

        <Section title="System Mode" icon={Activity}>
          <div className="grid grid-cols-2 gap-2">
            <ModeChip label="Focus" active={focusMode} color="amber" />
            <ModeChip label="Sync" active={cloud.status === "connected" || cloud.status === "saving"} color="emerald" />
            <ModeChip label="Agents" active color="violet" />
            <ModeChip label="External Tools" active={false} color="sky" />
          </div>
        </Section>

        <Section title="Alerts" icon={Zap}>
          <div className="space-y-1.5">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="rounded-lg border border-violet-400/15 bg-white/[0.03] px-3 py-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-amber-300" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-amber-50">{alert.message}</div>
                    <div className="font-hud text-[9px] uppercase tracking-wider text-violet-300/50">{alert.agent} · {alert.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={12} className="text-amber-300/70" />
        <h3 className="font-hud text-[10px] font-bold uppercase tracking-widest text-violet-200/70">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2">
      <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{label}</div>
      <div className={cn("text-lg font-bold", color === "emerald" ? "text-emerald-300" : "text-amber-300")}>{value}</div>
    </div>
  );
}

function ModeChip({ label, active, color }: { label: string; active: boolean; color: "amber" | "violet" | "emerald" | "sky" }) {
  const colorMap = {
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    violet: "border-violet-400/40 bg-violet-400/10 text-violet-200",
    emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    sky: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-2.5 py-1.5",
        active ? colorMap[color] : "border-white/5 bg-white/[0.02] text-violet-300/40",
      )}
    >
      <span className="font-hud text-[10px] uppercase tracking-widest">{label}</span>
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-current shadow-[0_0_6px_currentColor]" : "bg-white/20")} />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-violet-200/50">{text}</div>;
}
