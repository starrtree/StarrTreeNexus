"use client";

import { motion } from "framer-motion";
import {
  Crosshair,
  Flame,
  Bot,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  ChevronRight,
  Sparkles,
  Gauge,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { useNexus, topMoves } from "@/store/nexusStore";
import { branches, agents } from "@/data/mockData";
import { GlassCard, PanelTitle, StatusBadge, HealthRing, MiniBar } from "../shared";
import { DynIcon } from "../DynIcon";

export function NexusHome() {
  const projects = useNexus((s) => s.projects);
  const ideas = useNexus((s) => s.ideas);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const setSection = useNexus((s) => s.setSection);
  const setSelectedBranch = useNexus((s) => s.setSelectedBranch);
  const updateIdea = useNexus((s) => s.updateIdea);

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "revenue" || p.status === "decision");
  const avgHealth = Math.round(branches.reduce((a, b) => a + b.health, 0) / branches.length);
  const avgMomentum = Math.round(branches.reduce((a, b) => a + b.momentum, 0) / branches.length);
  const totalCashflowPotential = branches.reduce((a, b) => a + b.cashflowPotential, 0);
  const onlineAgents = agents.filter((a) => a.status === "online" || a.status === "working").length;
  const recentIdeas = ideas.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* hero row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-gold holo-border relative overflow-hidden rounded-2xl p-5"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-hud text-[10px] uppercase tracking-[0.4em] text-amber-300/70">
              Mission Control · StarrTree HQ
            </div>
            <h1 className="mt-1 text-2xl font-bold text-amber-50 text-glow-gold sm:text-3xl">
              Welcome back, Max.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-violet-100/70">
              The tree is live. <span className="text-amber-200">{activeProjects.length} projects</span> in motion,{" "}
              <span className="text-emerald-200">{onlineAgents} agents</span> online,{" "}
              <span className="text-amber-300">${(totalCashflowPotential / 1000).toFixed(0)}k/mo</span> potential across branches.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <HealthRing value={avgHealth} size={64} color="#10b981" label="HEALTH" />
            </div>
            <div className="flex flex-col items-center">
              <HealthRing value={avgMomentum} size={64} color="#fbbf24" label="MOMENTUM" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Flame} label="Active Projects" value={String(activeProjects.length)} color="amber" />
        <StatCard icon={Bot} label="Agents Online" value={`${onlineAgents}/${agents.length}`} color="emerald" />
        <StatCard icon={DollarSign} label="Cashflow Potential" value={`$${(totalCashflowPotential / 1000).toFixed(0)}k`} color="amber" />
        <StatCard icon={Lightbulb} label="Ideas Incubating" value={String(ideas.length)} color="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top moves */}
        <GlassCard className="lg:col-span-2">
          <PanelTitle
            title="Today's Top Moves"
            subtitle="Highest-leverage actions right now"
            icon={<Crosshair size={16} />}
            right={
              <button
                onClick={() => setSection("mission")}
                className="flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200"
              >
                All <ChevronRight size={12} />
              </button>
            }
          />
          <div className="space-y-2">
            {topMoves.map((m, i) => {
              const branch = branches.find((b) => b.id === m.branch)!;
              return (
                <motion.button
                  key={m.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => {
                    setSelectedBranch(m.branch);
                    setSection("mission");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40 hover:bg-amber-400/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-hud text-lg font-bold text-amber-200"
                    style={{ background: `${branch.color}22`, border: `1px solid ${branch.color}55` }}
                  >
                    {m.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-amber-50">{m.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-hud text-[10px] uppercase tracking-wider" style={{ color: branch.color }}>
                        {branch.short}
                      </span>
                      <span className="font-hud text-[10px] uppercase tracking-wider text-violet-300/50">
                        {m.why}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5">
                    <ArrowUpRight size={11} className="text-emerald-300" />
                    <span className="font-hud text-[9px] uppercase tracking-widest text-emerald-200">
                      {m.impact}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Next Best Action */}
        <GlassCard gold glow="gold">
          <PanelTitle title="Next Best Action" subtitle="UNI Core recommends" icon={<Sparkles size={16} />} />
          <div className="relative overflow-hidden rounded-xl border border-amber-300/30 bg-gradient-to-br from-amber-400/15 to-violet-500/5 p-4">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative">
              <div className="mb-2 font-hud text-[10px] uppercase tracking-widest text-amber-300/70">
                Highest Impact
              </div>
              <p className="text-base font-semibold text-amber-50">
                Send 2 overdue invoice reminders
              </p>
              <p className="mt-1 text-xs text-violet-100/70">
                Recover <span className="text-amber-300">$1,800</span> this week. Cashflow Agent is standing by.
              </p>
              <button
                onClick={() => setSection("cashflow")}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
              >
                <Zap size={13} /> Execute Move
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2">
            <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/50">
              Momentum
            </span>
            <span className="flex items-center gap-1.5 font-hud text-sm font-bold text-amber-300">
              <Gauge size={14} /> {avgMomentum}/100
            </span>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Branch health */}
        <GlassCard className="lg:col-span-2">
          <PanelTitle title="Branch Health" subtitle="Living tree status" icon={<TrendingUp size={16} />} />
          <div className="grid gap-2 sm:grid-cols-2">
            {branches.map((b, i) => (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setSelectedBranch(b.id);
                  setSection("starrmap");
                }}
                className="group flex items-center gap-3 rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${b.color}22`, border: `1px solid ${b.color}55` }}
                >
                  <DynIcon name={b.icon} size={16} style={{ color: b.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-amber-50">{b.name}</span>
                    <span className="font-hud text-[10px] text-amber-300/70">{b.health}%</span>
                  </div>
                  <div className="mt-1.5">
                    <MiniBar value={b.health} color={b.color} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Agent status */}
        <GlassCard>
          <PanelTitle
            title="Agent Status"
            subtitle="Bay telemetry"
            icon={<Bot size={16} />}
            right={
              <button
                onClick={() => setSection("agents")}
                className="flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200"
              >
                Bay <ChevronRight size={12} />
              </button>
            }
          />
          <div className="space-y-1.5">
            {agents.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2.5 rounded-lg border border-violet-400/10 bg-white/[0.02] px-2.5 py-2"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${a.color}22`, border: `1px solid ${a.color}55` }}
                >
                  <DynIcon name={a.icon} size={13} style={{ color: a.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-amber-50">{a.name}</div>
                  <div className="truncate font-hud text-[9px] uppercase tracking-wider text-violet-300/50">
                    {a.lastAction}
                  </div>
                </div>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background:
                      a.status === "online" || a.status === "working" ? "#10b981" : a.status === "idle" ? "#fbbf24" : "#a78bfa",
                    boxShadow: `0 0 6px ${a.status === "online" || a.status === "working" ? "#10b981" : a.status === "idle" ? "#fbbf24" : "#a78bfa"}`,
                  }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active projects */}
        <GlassCard className="lg:col-span-2">
          <PanelTitle
            title="Active Projects"
            subtitle="In-motion build pipeline"
            icon={<Flame size={16} />}
            right={
              <button
                onClick={() => setSection("projects")}
                className="flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200"
              >
                All <ChevronRight size={12} />
              </button>
            }
          />
          <div className="space-y-2">
            {activeProjects.slice(0, 5).map((p, i) => {
              const branch = branches.find((b) => b.id === p.branch)!;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setSelectedProject(p.id);
                    setSection("projects");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-violet-400/15 bg-white/[0.03] p-3 text-left transition hover:border-amber-300/40"
                >
                  <div
                    className="h-10 w-1 shrink-0 rounded-full"
                    style={{ background: branch.color, boxShadow: `0 0 8px ${branch.color}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-amber-50">{p.title}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="truncate font-hud text-[10px] uppercase tracking-wider text-violet-300/50">
                      {p.nextAction}
                    </div>
                  </div>
                  <div className="hidden w-24 shrink-0 sm:block">
                    <div className="mb-1 flex justify-between font-hud text-[9px] text-violet-300/50">
                      <span>PROG</span>
                      <span className="text-amber-300/70">{p.progress}%</span>
                    </div>
                    <MiniBar value={p.progress} color={branch.color} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent ideas */}
        <GlassCard>
          <PanelTitle
            title="Recent Ideas"
            subtitle="Incubator feed"
            icon={<Lightbulb size={16} />}
            right={
              <button
                onClick={() => setSection("incubator")}
                className="flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200"
              >
                All <ChevronRight size={12} />
              </button>
            }
          />
          <div className="space-y-2">
            {recentIdeas.map((idea) => {
              const score = Math.round(
                ((idea.impact + idea.cash + idea.brand + idea.urgency) / 4 - idea.effort * 0.3) * 20,
              );
              return (
                <div
                  key={idea.id}
                  className="rounded-xl border border-violet-400/15 bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-amber-50">{idea.title}</span>
                    <span className="font-hud text-[10px] text-amber-300">{score}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-violet-100/60">{idea.details}</p>
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => updateIdea(idea.id, { status: "build" })}
                      className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-emerald-200 hover:bg-emerald-400/20"
                    >
                      Build
                    </button>
                    <button
                      onClick={() => updateIdea(idea.id, { status: "schedule" })}
                      className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-200 hover:bg-violet-400/20"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* blockers strip */}
      <GlassCard glow="red">
        <PanelTitle title="Active Blockers" subtitle="Needs your attention" icon={<AlertTriangle size={16} />} />
        <div className="flex flex-wrap gap-2">
          {projects.flatMap((p) => p.blockers.map((b) => ({ b, p }))).slice(0, 8).map(({ b, p }, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedProject(p.id);
                setSection("projects");
              }}
              className="flex items-center gap-2 rounded-lg border border-red-400/25 bg-red-400/5 px-3 py-1.5 text-xs text-red-100 transition hover:border-red-400/50 hover:bg-red-400/10"
            >
              <AlertTriangle size={12} className="text-red-300" />
              <span>{b}</span>
              <span className="font-hud text-[9px] uppercase tracking-wider text-violet-300/40">
                · {p.title}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  color: "amber" | "emerald" | "violet";
}) {
  const colorMap = {
    amber: "text-amber-300 border-amber-400/30 bg-amber-400/5",
    emerald: "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
    violet: "text-violet-300 border-violet-400/30 bg-violet-400/5",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cnGlass("relative overflow-hidden rounded-2xl border p-4", colorMap[color])}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 opacity-10">
        <Icon size={48} />
      </div>
      <Icon size={16} className="mb-2" />
      <div className="font-hud text-2xl font-bold text-amber-50">{value}</div>
      <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{label}</div>
    </motion.div>
  );
}

// tiny local cn to avoid extra import churn
function cnGlass(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
