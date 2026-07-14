"use client";

import { motion } from "framer-motion";
import { Bot, Building2, Crosshair, Network, Sparkles, Zap } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, MiniBar, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  active: "border-emerald-300/45 bg-emerald-400/10",
  calm: "border-violet-300/30 bg-violet-400/8",
  planning: "border-sky-300/40 bg-sky-400/10",
  blocked: "border-red-300/50 bg-red-400/10",
  working: "border-emerald-300/50 bg-emerald-400/15 text-emerald-100",
  collaborating: "border-amber-300/50 bg-amber-400/15 text-amber-100",
  idle: "border-violet-300/30 bg-violet-400/10 text-violet-100",
  standby: "border-sky-300/30 bg-sky-400/10 text-sky-100",
  offline: "border-white/10 bg-white/5 text-violet-200/40",
};

export function StarrBaseMap() {
  const departments = useNexus((s) => s.departments);
  const agents = useNexus((s) => s.agents);
  const runtimes = useNexus((s) => s.agentRuntimes);
  const missions = useNexus((s) => s.agentMissions);
  const collaborations = useNexus((s) => s.collaborations);
  const selectedDepartmentId = useNexus((s) => s.selectedDepartmentId);
  const setSelectedDepartment = useNexus((s) => s.setSelectedDepartment);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSection = useNexus((s) => s.setSection);

  const activeMissions = missions.filter((m) => !["complete"].includes(m.status));
  const liveCollabs = collaborations.filter((c) => c.status === "live");
  const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId) ?? departments[0];
  const selectedAgents = selectedDepartment.agentIds
    .map((id) => agents.find((agent) => agent.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <GlassCard glow="gold" className="overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.14),transparent_38%),radial-gradient(circle_at_100%_30%,rgba(139,92,246,0.15),transparent_35%)]" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <PanelTitle
            title="STARRBASE"
            subtitle="AI agent operations headquarters"
            icon={<Building2 size={17} />}
            right={
              <button
                onClick={() => setSection("mission")}
                className="hidden rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-amber-100 transition hover:bg-amber-400/20 sm:block"
              >
                Open Mission Queue
              </button>
            }
          />
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
            <Metric label="Agents" value={runtimes.length} />
            <Metric label="Live rooms" value={departments.filter((d) => d.status === "active").length} />
            <Metric label="Missions" value={activeMissions.length} />
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <GlassCard className="min-h-[620px] overflow-hidden p-0">
          <div className="relative h-[680px] w-full overflow-hidden rounded-2xl border border-violet-400/15 bg-black/20 sm:h-[620px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[size:42px_42px]" />
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/10 bg-amber-400/[0.03] blur-[0.2px]" />

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {liveCollabs.map((collab, idx) => {
                const related = runtimes.filter((r) => collab.agentIds.includes(r.agentId));
                const first = related[0]?.position;
                const last = related[related.length - 1]?.position;
                if (!first || !last) return null;
                return (
                  <motion.line
                    key={collab.id}
                    x1={first.x}
                    y1={first.y}
                    x2={last.x}
                    y2={last.y}
                    stroke={idx % 2 ? "rgba(56,189,248,0.65)" : "rgba(251,191,36,0.72)"}
                    strokeWidth="0.35"
                    strokeDasharray="2 1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                  />
                );
              })}
            </svg>

            {departments.map((department, index) => {
              const active = selectedDepartment.id === department.id;
              const departmentMissions = missions.filter((m) => m.departmentId === department.id && m.status !== "complete");
              return (
                <motion.button
                  key={department.id}
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedDepartment(department.id)}
                  className={cn(
                    "absolute rounded-2xl border p-3 text-left shadow-2xl transition hover:scale-[1.015]",
                    statusTone[department.status],
                    active && "ring-2 ring-amber-300/45",
                  )}
                  style={{
                    left: `${department.x}%`,
                    top: `${department.y}%`,
                    width: `${department.w}%`,
                    height: `${department.h}%`,
                    boxShadow: `0 0 28px ${department.color}22, inset 0 0 22px ${department.color}12`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-hud text-[10px] uppercase tracking-[0.22em] text-violet-200/60">
                        {department.short}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-amber-50">{department.name}</div>
                    </div>
                    <span
                      className="mt-1 h-2.5 w-2.5 rounded-full"
                      style={{ background: department.color, boxShadow: `0 0 12px ${department.color}` }}
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] text-violet-100/60">{department.purpose}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60">
                      {department.agentIds.length} agents
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-amber-100/70">
                      {departmentMissions.length} missions
                    </span>
                  </div>
                </motion.button>
              );
            })}

            {runtimes.map((runtime, index) => {
              const agent = agents.find((a) => a.id === runtime.agentId);
              if (!agent) return null;
              const mission = missions.find((m) => m.id === runtime.currentMissionId);
              return (
                <motion.button
                  key={runtime.agentId}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.22 + index * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    if (mission) setSelectedMission(mission.id);
                    setSection("agents");
                  }}
                  className={cn(
                    "absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-sm font-bold shadow-2xl transition hover:scale-110",
                    statusTone[runtime.status],
                  )}
                  style={{
                    left: `${runtime.position.x}%`,
                    top: `${runtime.position.y}%`,
                    boxShadow: `0 0 22px ${agent.color}80`,
                  }}
                  title={`${agent.name} — ${runtime.activeProcess}`}
                >
                  <span className="absolute inset-0 rounded-full animate-ping bg-current/10" />
                  <span className="relative">{runtime.avatar}</span>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard glow="purple">
            <PanelTitle title={selectedDepartment.name} subtitle={selectedDepartment.short + " operations room"} icon={<Sparkles size={16} />} />
            <p className="text-sm leading-relaxed text-violet-100/70">{selectedDepartment.purpose}</p>
            <div className="mt-4 space-y-2">
              {selectedAgents.map((agent) => {
                const runtime = runtimes.find((r) => r.agentId === agent!.id);
                const mission = missions.find((m) => m.id === runtime?.currentMissionId);
                return (
                  <button
                    key={agent!.id}
                    onClick={() => {
                      setSelectedAgent(agent!.id);
                      setSection("agents");
                    }}
                    className="w-full rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full border font-hud text-xs"
                          style={{ borderColor: agent!.color, color: agent!.color, boxShadow: `0 0 12px ${agent!.color}55` }}
                        >
                          {runtime?.avatar ?? "•"}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-amber-50">{agent!.name}</div>
                          <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{agent!.role}</div>
                        </div>
                      </div>
                      <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", statusTone[runtime?.status ?? "idle"])}>
                        {runtime?.status ?? "idle"}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-violet-100/60">{runtime?.activeProcess}</p>
                    {mission && <MiniBar value={mission.progress} color={agent!.color} />}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Live Collaborations" subtitle="agents working together" icon={<Network size={16} />} />
            <div className="space-y-2">
              {liveCollabs.map((collab) => {
                const mission = missions.find((m) => m.id === collab.missionId);
                return (
                  <button
                    key={collab.id}
                    onClick={() => {
                      if (mission) setSelectedMission(mission.id);
                      setSection("starrmap");
                    }}
                    className="w-full rounded-xl border border-amber-300/15 bg-amber-400/5 p-3 text-left transition hover:border-amber-300/35"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-amber-50">{mission?.title ?? collab.id}</span>
                      <Zap size={13} className="text-amber-300" />
                    </div>
                    <div className="mt-1 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                      {collab.agentIds.join(" → ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Next Command" subtitle="agent-first actions" icon={<Crosshair size={16} />} />
            <div className="space-y-2 text-sm text-violet-100/70">
              <p>Use the command bar to assign work like:</p>
              <div className="rounded-xl border border-violet-400/15 bg-black/20 p-3 font-hud text-[10px] uppercase tracking-widest text-amber-100/80">
                Tell Builder Agent to clean up the mobile UI
              </div>
              <div className="rounded-xl border border-violet-400/15 bg-black/20 p-3 font-hud text-[10px] uppercase tracking-widest text-amber-100/80">
                Show blocked missions
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-violet-400/15 bg-black/20 px-3 py-2">
      <div className="font-hud text-lg font-bold text-amber-100">{value}</div>
      <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{label}</div>
    </div>
  );
}
