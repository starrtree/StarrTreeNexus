"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Hand,
  Crosshair,
  Zap,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useNexus, topMoves } from "@/store/nexusStore";
import { branches } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function IntelligencePanel({ onClose }: { onClose?: () => void }) {
  const alerts = useNexus((s) => s.alerts);
  const projects = useNexus((s) => s.projects);
  const selectedBranchId = useNexus((s) => s.selectedBranchId);
  const setSelectedBranch = useNexus((s) => s.setSelectedBranch);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const setSection = useNexus((s) => s.setSection);
  const gesture = useNexus((s) => s.gesture);
  const focusMode = useNexus((s) => s.focusMode);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) ?? branches[0];
  const branchProjects = projects.filter((p) => p.branch === selectedBranch.id);
  const allBlockers = projects.flatMap((p) =>
    p.blockers.map((b) => ({ project: p.title, blocker: b, id: p.id })),
  );

  return (
    <aside className="glass flex h-full w-full flex-col overflow-hidden rounded-l-2xl">
      {/* header */}
      <div className="flex items-center justify-between border-b border-violet-400/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-breathe" />
            <Activity size={14} className="relative text-amber-300" />
          </div>
          <div>
            <div className="font-hud text-xs font-bold uppercase tracking-widest text-amber-100">
              Live Intel
            </div>
            <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
              Real-time nexus feed
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
        {/* Today's top 3 moves */}
        <Section title="Today's Top 3 Moves" icon={Crosshair}>
          <div className="space-y-2">
            {topMoves.map((m, i) => (
              <motion.button
                key={m.rank}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setSelectedBranch(m.branch);
                  setSection("mission");
                }}
                className="group flex w-full items-start gap-3 rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40 hover:bg-amber-400/5"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-hud text-xs font-bold",
                    m.impact === "cash"
                      ? "bg-amber-400/20 text-amber-200"
                      : m.impact === "unblock"
                        ? "bg-red-400/20 text-red-200"
                        : "bg-violet-400/20 text-violet-200",
                  )}
                >
                  {m.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-amber-50">{m.title}</div>
                  <div className="font-hud text-[10px] uppercase tracking-wider text-violet-300/50">
                    {m.why}
                  </div>
                </div>
                <ChevronRight size={14} className="mt-1 shrink-0 text-violet-300/40 transition group-hover:translate-x-0.5 group-hover:text-amber-200" />
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Agent alerts */}
        <Section title="Agent Alerts" icon={Zap}>
          <div className="space-y-1.5">
            {alerts.map((a) => {
              const Icon =
                a.level === "critical"
                  ? ShieldAlert
                  : a.level === "warn"
                    ? AlertTriangle
                    : a.level === "success"
                      ? CheckCircle2
                      : Info;
              const color =
                a.level === "critical"
                  ? "text-red-300 border-red-400/30 bg-red-400/10"
                  : a.level === "warn"
                    ? "text-amber-200 border-amber-400/30 bg-amber-400/10"
                    : a.level === "success"
                      ? "text-emerald-200 border-emerald-400/30 bg-emerald-400/10"
                      : "text-sky-200 border-sky-400/30 bg-sky-400/10";
              return (
                <div
                  key={a.id}
                  className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2", color)}
                >
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-amber-50">{a.message}</div>
                    <div className="font-hud text-[9px] uppercase tracking-wider opacity-70">
                      {a.agent} · {a.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Selected branch */}
        <Section title="Active Branch" icon={Activity}>
          <div className="rounded-xl border border-violet-400/20 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <select
                value={selectedBranch.id}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-lg border border-violet-400/20 bg-black/40 px-2 py-1 text-xs text-amber-100 focus:border-amber-300/50 focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#120a2a]">
                    {b.name}
                  </option>
                ))}
              </select>
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: selectedBranch.color, boxShadow: `0 0 10px ${selectedBranch.color}` }}
              />
            </div>
            <p className="mb-3 text-xs text-violet-100/70">{selectedBranch.summary}</p>

            <div className="grid grid-cols-2 gap-2">
              <Metric label="Health" value={selectedBranch.health} color="emerald" />
              <Metric label="Momentum" value={selectedBranch.momentum} color="amber" />
            </div>

            <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-400/5 p-2">
              <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">
                Next Best Action
              </div>
              <div className="text-xs text-amber-50">{selectedBranch.nextBestAction}</div>
            </div>

            {branchProjects.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  Projects
                </div>
                {branchProjects.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p.id);
                      setSection("projects");
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-violet-100/80 transition hover:bg-white/5 hover:text-amber-100"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="font-hud text-[10px] text-amber-300/70">{p.progress}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Blockers */}
        <Section title="Blockers" icon={AlertTriangle}>
          <div className="space-y-1.5">
            {allBlockers.length === 0 && (
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">
                No active blockers. Tree is flowing.
              </div>
            )}
            {allBlockers.slice(0, 6).map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2"
              >
                <ShieldAlert size={13} className="mt-0.5 shrink-0 text-red-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-red-100">{b.blocker}</div>
                  <button
                    onClick={() => {
                      setSelectedProject(b.id);
                      setSection("projects");
                    }}
                    className="font-hud text-[9px] uppercase tracking-wider text-violet-300/50 hover:text-amber-200"
                  >
                    {b.project}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Gesture status */}
        <Section title="Gesture Control" icon={Hand}>
          <GestureStatus />
        </Section>

        {/* System mode */}
        <Section title="System Mode" icon={Activity}>
          <div className="grid grid-cols-2 gap-2">
            <ModeChip label="Focus" active={focusMode} color="amber" />
            <ModeChip label="Hand" active={gesture.enabled} color="violet" />
            <ModeChip label="Sync" active color="emerald" />
            <ModeChip label="Auto-Pilot" active={false} color="sky" />
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Activity;
  children: React.ReactNode;
}) {
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

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber";
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2">
      <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-bold", color === "emerald" ? "text-emerald-300" : "text-amber-300")}>
          {value}
        </span>
        <span className="font-hud text-[10px] text-violet-300/40">/100</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full", color === "emerald" ? "bg-emerald-400" : "bg-amber-400")}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ModeChip({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: "amber" | "violet" | "emerald" | "sky";
}) {
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
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-current shadow-[0_0_6px_currentColor]" : "bg-white/20",
        )}
      />
    </div>
  );
}

function GestureStatus() {
  const gesture = useNexus((s) => s.gesture);
  const setGesture = useNexus((s) => s.setGesture);
  return (
    <div className="rounded-xl border border-violet-400/20 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
          Hand Tracking
        </span>
        <button
          onClick={() => setGesture({ enabled: !gesture.enabled })}
          className={cn(
            "rounded-full border px-2 py-0.5 font-hud text-[9px] uppercase tracking-widest transition",
            gesture.enabled
              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
              : "border-violet-400/30 bg-violet-400/10 text-violet-200",
          )}
        >
          {gesture.enabled ? "Live" : "Off"}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={gesture.gesture}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-2"
        >
          <Hand
            size={14}
            className={cn(gesture.enabled ? "text-amber-300" : "text-violet-300/40")}
          />
          <span className="text-xs text-amber-50">{gesture.gesture}</span>
        </motion.div>
      </AnimatePresence>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-400 transition-all"
            style={{ width: `${gesture.confidence}%` }}
          />
        </div>
        <span className="font-hud text-[9px] text-violet-300/50">{gesture.confidence}%</span>
      </div>
      <div className="mt-1.5 font-hud text-[9px] uppercase tracking-wider text-violet-300/40">
        cmd: <span className="text-amber-200/70">{gesture.command}</span>
      </div>
    </div>
  );
}
