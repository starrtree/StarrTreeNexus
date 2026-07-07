"use client";

import { motion } from "framer-motion";
import {
  Crosshair,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Circle,
  Zap,
  Target,
  Flame,
  Clock,
} from "lucide-react";
import { useNexus, topMoves } from "@/store/nexusStore";
import { branches } from "@/data/mockData";
import { GlassCard, PanelTitle, HealthRing, MiniBar } from "../shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MissionControl() {
  const projects = useNexus((s) => s.projects);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const setSection = useNexus((s) => s.setSection);
  const setSelectedBranch = useNexus((s) => s.setSelectedBranch);
  const [done, setDone] = useNexusLocal();
  const moves = topMoves;

  const queue = projects
    .filter((p) => p.status !== "archived")
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      {/* hero */}
      <GlassCard gold glow="gold">
        <PanelTitle
          title="Mission Control"
          subtitle="Today's highest-leverage moves"
          icon={<Crosshair size={16} />}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {moves.map((m, i) => {
            const branch = branches.find((b) => b.id === m.branch)!;
            const isDone = done.includes(m.rank);
            return (
              <motion.div
                key={m.rank}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-4 transition",
                  isDone
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-amber-300/30 bg-gradient-to-br from-amber-400/10 to-violet-500/5",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg font-hud text-base font-bold text-amber-200"
                      style={{ background: `${branch.color}22`, border: `1px solid ${branch.color}55` }}
                    >
                      {m.rank}
                    </span>
                    <span className="font-hud text-[9px] uppercase tracking-widest" style={{ color: branch.color }}>
                      {branch.short}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDone(
                        isDone
                          ? done.filter((d) => d !== m.rank)
                          : [...done, m.rank],
                      );
                      if (!isDone) toast("Move complete", { description: m.title });
                    }}
                    className="text-violet-300/60 transition hover:text-emerald-300"
                  >
                    {isDone ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
                  </button>
                </div>
                <h3 className={cn("text-sm font-semibold", isDone ? "text-emerald-200 line-through" : "text-amber-50")}>
                  {m.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 font-hud text-[10px] uppercase tracking-wider text-violet-300/60">
                  <Zap size={10} className="text-amber-300" /> {m.why}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest",
                      m.impact === "cash"
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                        : m.impact === "unblock"
                          ? "border-red-400/30 bg-red-400/10 text-red-200"
                          : "border-violet-400/30 bg-violet-400/10 text-violet-200",
                    )}
                  >
                    <ArrowUpRight size={9} /> {m.impact}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* In-motion queue */}
        <GlassCard className="lg:col-span-2">
          <PanelTitle
            title="In-Motion Queue"
            subtitle="Ranked by progress"
            icon={<Flame size={16} />}
            right={
              <button
                onClick={() => setSection("projects")}
                className="flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200"
              >
                Rooms <ArrowRight size={12} />
              </button>
            }
          />
          <div className="space-y-2">
            {queue.map((p, i) => {
              const branch = branches.find((b) => b.id === p.branch)!;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setSelectedProject(p.id);
                    setSection("projects");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40"
                >
                  <span className="font-hud text-xs text-violet-300/40">#{i + 1}</span>
                  <div className="h-8 w-1 rounded-full" style={{ background: branch.color, boxShadow: `0 0 6px ${branch.color}` }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-amber-50">{p.title}</div>
                    <div className="truncate font-hud text-[10px] uppercase tracking-wider text-violet-300/50">
                      {p.nextAction}
                    </div>
                  </div>
                  <div className="hidden w-28 sm:block">
                    <div className="mb-0.5 flex justify-between font-hud text-[9px] text-violet-300/50">
                      <span>{p.progress}%</span>
                    </div>
                    <MiniBar value={p.progress} color={branch.color} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Focus + momentum */}
        <div className="space-y-4">
          <GlassCard>
            <PanelTitle title="Focus Session" subtitle="Lock in" icon={<Target size={16} />} />
            <div className="flex flex-col items-center gap-3 py-2">
              <HealthRing value={72} size={84} color="#fbbf24" label="FOCUS" />
              <p className="text-center text-xs text-violet-100/70">
                Suggested 90-min deep block on{" "}
                <span className="text-amber-200">Custom GPT Offer Page</span>.
              </p>
              <button
                onClick={() => {
                  useNexus.getState().setFocusMode(true);
                  toast("Focus Mode engaged", { description: "Press Esc to exit." });
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
              >
                <Clock size={13} /> Start Focus Block
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Branch Momentum" subtitle="Who's climbing" icon={<Flame size={16} />} />
            <div className="space-y-2">
              {[...branches].sort((a, b) => b.momentum - a.momentum).slice(0, 5).map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranch(b.id);
                    setSection("starrmap");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/5"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                  <span className="flex-1 truncate text-xs text-amber-50">{b.name}</span>
                  <span className="font-hud text-[10px] text-amber-300/70">{b.momentum}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// tiny local hook for completed moves (kept in-memory for the session)
import { useState } from "react";
function useNexusLocal() {
  const [done, setDone] = useState<number[]>([]);
  return [done, setDone] as const;
}
