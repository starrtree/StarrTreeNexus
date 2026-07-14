"use client";

import type { ReactNode } from "react";
import { Bot, BrainCircuit, CheckCircle2, Cpu, Database, ShieldCheck } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, MiniBar, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  working: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  collaborating: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  planning: "border-sky-300/40 bg-sky-400/10 text-sky-100",
  idle: "border-violet-300/25 bg-violet-400/10 text-violet-100",
  standby: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  blocked: "border-red-300/40 bg-red-400/10 text-red-100",
  offline: "border-white/10 bg-white/5 text-violet-200/40",
};

export function AgentDirectory() {
  const agents = useNexus((s) => s.agents);
  const runtimes = useNexus((s) => s.agentRuntimes);
  const departments = useNexus((s) => s.departments);
  const missions = useNexus((s) => s.agentMissions);
  const toolConnections = useNexus((s) => s.toolConnections);
  const selectedAgentId = useNexus((s) => s.selectedAgentId);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSection = useNexus((s) => s.setSection);

  const selected = agents.find((a) => a.id === selectedAgentId) ?? agents[0];
  const selectedRuntime = runtimes.find((r) => r.agentId === selected?.id);
  const selectedMission = missions.find((m) => m.id === selectedRuntime?.currentMissionId);
  const selectedDepartment = departments.find((d) => d.id === selectedRuntime?.departmentId);
  const selectedTools = toolConnections.filter((tool) => tool.assignedAgentIds.includes(selected?.id ?? ""));

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Agent Bay" subtitle="StarrBase resident agent workforce" icon={<Bot size={16} />} />
        <p className="text-sm text-violet-100/65">
          This is the roster of AI agents Max will manage from StarrBoard. Each agent has a room, current process, mission, tools, memory sources, and autonomy level.
        </p>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {agents.map((agent) => {
            const runtime = runtimes.find((r) => r.agentId === agent.id);
            const mission = missions.find((m) => m.id === runtime?.currentMissionId);
            const department = departments.find((d) => d.id === runtime?.departmentId);
            const active = selected?.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={cn(
                  "rounded-2xl border bg-white/[0.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300/35 hover:bg-white/[0.05]",
                  active ? "border-amber-300/55 box-glow-gold" : "border-violet-400/15",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full border font-hud text-lg font-bold"
                      style={{ borderColor: agent.color, color: agent.color, boxShadow: `0 0 18px ${agent.color}55` }}
                    >
                      {runtime?.avatar ?? "•"}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-50">{agent.name}</h3>
                      <p className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{agent.role}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", statusTone[runtime?.status ?? agent.status])}>
                    {runtime?.status ?? agent.status}
                  </span>
                </div>

                <p className="mt-3 min-h-[34px] text-xs leading-relaxed text-violet-100/60">{runtime?.activeProcess ?? agent.description}</p>
                <div className="mt-3 flex items-center justify-between gap-3 font-hud text-[9px] uppercase tracking-widest text-violet-300/45">
                  <span>{department?.short ?? "ROOM"}</span>
                  <span>{runtime?.autonomyLevel?.replaceAll("_", " ") ?? agent.permission}</span>
                </div>
                {mission && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between font-hud text-[8px] uppercase tracking-widest text-violet-300/45">
                      <span>{mission.title}</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <MiniBar value={mission.progress} color={agent.color} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="space-y-4">
            <GlassCard glow="purple" className="sticky top-4">
              <PanelTitle title={selected.name} subtitle={selected.role} icon={<BrainCircuit size={16} />} />
              <div className="flex items-center gap-3">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border font-hud text-2xl font-bold"
                  style={{ borderColor: selected.color, color: selected.color, boxShadow: `0 0 28px ${selected.color}55` }}
                >
                  {selectedRuntime?.avatar ?? "•"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-violet-100/75">{selected.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill label={selectedDepartment?.name ?? "Unassigned"} />
                    <Pill label={selectedRuntime?.status ?? selected.status} />
                    <Pill label={selectedRuntime?.autonomyLevel?.replaceAll("_", " ") ?? selected.permission} />
                  </div>
                </div>
              </div>

              <Section label="Current Process" icon={<Cpu size={13} />}>
                {selectedRuntime?.activeProcess ?? selected.lastAction}
              </Section>
              <Section label="Last Output" icon={<CheckCircle2 size={13} />}>
                {selectedRuntime?.lastOutput ?? selected.lastAction}
              </Section>
              <Section label="Current Mission" icon={<ShieldCheck size={13} />}>
                {selectedMission ? `${selectedMission.title} · ${selectedMission.status} · ${selectedMission.progress}%` : "No active mission assigned."}
              </Section>
              <Section label="Memory Sources" icon={<Database size={13} />}>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedRuntime?.memorySources ?? []).map((source) => <Pill key={source} label={source} />)}
                </div>
              </Section>

              <div className="mt-4 grid gap-2">
                <button
                  onClick={() => setSection("mission")}
                  className="rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-amber-100 transition hover:bg-amber-400/20"
                >
                  View mission queue
                </button>
                <button
                  onClick={() => setSection("workflows")}
                  className="rounded-xl border border-violet-300/25 bg-white/5 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-violet-100 transition hover:border-amber-300/35"
                >
                  View assigned tools
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <PanelTitle title="Assigned Tools" subtitle="future execution permissions" icon={<Cpu size={16} />} />
              <div className="space-y-2">
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-amber-50">{tool.name}</span>
                      <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{tool.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-violet-100/55">{tool.notes}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-violet-400/20 bg-white/5 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60">
      {label}
    </span>
  );
}

function Section({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-violet-400/15 bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-1.5 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
        {icon}
        {label}
      </div>
      <div className="text-xs leading-relaxed text-violet-100/70">{children}</div>
    </div>
  );
}
