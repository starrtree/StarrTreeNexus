"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Hammer,
  ShieldCheck,
  GitBranch,
  GitPullRequest,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Cpu,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { agents, type Agent } from "@/data/mockData";
import { GlassCard, PanelTitle } from "../shared";
import { DynIcon } from "../DynIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLOR: Record<Agent["status"], string> = {
  online: "#10b981",
  working: "#fbbf24",
  idle: "#a78bfa",
  standby: "#64748b",
};

const BUILD_LOOP_STEPS = [
  { label: "Feature Request", icon: Sparkles, color: "#fbbf24" },
  { label: "Builder Agent creates spec", icon: Hammer, color: "#10b981" },
  { label: "QA Sentinel checks risks", icon: ShieldCheck, color: "#ef4444" },
  { label: "GitHub branch created", icon: GitBranch, color: "#38bdf8" },
  { label: "Code changes proposed", icon: Cpu, color: "#8b5cf6" },
  { label: "Pull request opened", icon: GitPullRequest, color: "#c026d3" },
  { label: "Max approves", icon: Lock, color: "#fde047" },
  { label: "Merge / deploy", icon: Check, color: "#10b981" },
];

export function AgentBay() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [loopActive, setLoopActive] = useState(false);
  const [loopStep, setLoopStep] = useState(0);

  const runLoop = () => {
    if (loopActive) return;
    setLoopActive(true);
    setLoopStep(0);
    toast("Self-Evolving Build Loop initiated", { description: "Builder Agent is drafting a spec…" });
    const iv = setInterval(() => {
      setLoopStep((s) => {
        if (s >= BUILD_LOOP_STEPS.length - 1) {
          clearInterval(iv);
          setLoopActive(false);
          toast("Build Loop paused at approval gate", { description: "Max must approve before merge." });
          return s;
        }
        return s + 1;
      });
    }, 1100);
  };

  return (
    <div className="space-y-4">
      {/* Self-Evolving Build Loop */}
      <GlassCard gold glow="gold">
        <PanelTitle
          title="Self-Evolving Build Loop"
          subtitle="Builder Agent · safe autonomous engineering"
          icon={<Hammer size={16} />}
          right={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-hud text-[9px] uppercase tracking-widest text-emerald-200">
                <Lock size={9} /> Approval-gated
              </span>
              <button
                onClick={runLoop}
                disabled={loopActive}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  loopActive
                    ? "bg-white/10 text-violet-200/50"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400",
                )}
              >
                <Sparkles size={13} /> {loopActive ? "Running…" : "Simulate Loop"}
              </button>
            </div>
          }
        />
        <p className="mb-4 text-xs text-violet-100/70">
          The Builder Agent can receive feature requests, generate specs, open branches and PRs.{" "}
          <span className="text-amber-200">It never merges or deploys without Max's approval.</span>
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {BUILD_LOOP_STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = loopStep === i && loopActive;
            const done = loopStep > i || (!loopActive && loopStep === BUILD_LOOP_STEPS.length - 1 && i <= loopStep);
            return (
              <div key={i} className="flex items-center">
                <motion.div
                  animate={active ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.8, repeat: active ? Infinity : 0 }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-hud text-[9px] uppercase tracking-widest transition",
                    active && "border-amber-300/60 bg-amber-400/20 text-amber-100 box-glow-gold",
                    done && !active && "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
                    !done && !active && "border-violet-400/15 bg-white/[0.02] text-violet-300/40",
                  )}
                >
                  <Icon size={11} style={{ color: active || done ? undefined : s.color }} />
                  {s.label}
                  {done && !active && <Check size={10} className="text-emerald-300" />}
                </motion.div>
                {i < BUILD_LOOP_STEPS.length - 1 && (
                  <ArrowRight size={11} className="mx-0.5 text-violet-300/30" />
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Agent grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(a)}
            className="glass group relative overflow-hidden rounded-2xl p-4 text-left transition hover:border-amber-300/40"
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
              style={{ background: a.color }}
            />
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${a.color}22`, border: `1px solid ${a.color}55` }}
                >
                  <DynIcon name={a.icon} size={18} style={{ color: a.color }} />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#120a2a]"
                    style={{ background: STATUS_COLOR[a.status], boxShadow: `0 0 6px ${STATUS_COLOR[a.status]}` }}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-50">{a.name}</div>
                  <div className="font-hud text-[9px] uppercase tracking-widest" style={{ color: a.color }}>
                    {a.role}
                  </div>
                </div>
              </div>
              <span
                className="rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest"
                style={{
                  borderColor: `${a.color}55`,
                  color: a.color,
                  background: `${a.color}11`,
                }}
              >
                {a.permission}
              </span>
            </div>
            <p className="mb-2 line-clamp-2 text-xs text-violet-100/60">{a.description}</p>
            <div className="mb-2 rounded-lg border border-white/5 bg-black/20 px-2 py-1.5">
              <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/40">Last action</div>
              <div className="truncate text-[11px] text-amber-100/80">{a.lastAction}</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {a.tools.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full border border-violet-400/20 bg-white/5 px-1.5 py-0.5 font-hud text-[8px] uppercase tracking-wider text-violet-200/60">
                  {t}
                </span>
              ))}
            </div>
            {a.canModifyCode && (
              <div className="mt-2 flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-hud text-[8px] uppercase tracking-widest text-emerald-200">
                <Lock size={8} /> Approval-gated code access
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && <AgentModal agent={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function AgentModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const setSection = useNexus((s) => s.setSection);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const simulate = () => {
    setOutput([]);
    const lines = [
      `> ${agent.name} engaged`,
      `> Loading tools: ${agent.tools.join(", ")}`,
      `> Permission scope: ${agent.permission}`,
      `> Executing task…`,
      `> ${agent.lastAction}`,
      `> ✓ Complete · awaiting review`,
    ];
    lines.forEach((l, i) => {
      setTimeout(() => {
        setOutput((o) => [...o, l]);
        if (i === lines.length - 1) toast(`${agent.name} finished`, { description: "Output ready for review." });
      }, i * 600);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="glass-gold holo-border relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl"
      >
        <div className="relative flex items-start justify-between gap-3 border-b border-amber-300/20 p-5">
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{ background: agent.color }}
          />
          <div className="relative flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}55` }}
            >
              <DynIcon name={agent.icon} size={24} style={{ color: agent.color }} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest"
                  style={{ borderColor: `${agent.color}55`, color: agent.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[agent.status] }} />
                  {agent.status}
                </span>
                <span className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{agent.permission}</span>
              </div>
              <h2 className="text-lg font-bold text-amber-50">{agent.name}</h2>
              <p className="text-xs text-violet-100/70">{agent.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-violet-200/60 transition hover:bg-white/10 hover:text-amber-100">
            <X size={18} />
          </button>
        </div>

        <div className="nexus-scroll max-h-[calc(92vh-220px)] overflow-y-auto p-5">
          <p className="mb-4 text-sm text-violet-100/80">{agent.description}</p>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Last Action</div>
              <div className="text-xs text-amber-50">{agent.lastAction}</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Permission</div>
              <div className="text-xs text-amber-50">{agent.permission}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 font-hud text-[10px] uppercase tracking-widest text-violet-300/60">Tools</div>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((t) => (
                <span key={t} className="rounded-lg border border-violet-400/20 bg-white/5 px-2 py-1 font-hud text-[10px] uppercase tracking-wider text-violet-200/70">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {agent.canModifyCode && (
            <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
              <div className="mb-1 flex items-center gap-2">
                <Lock size={13} className="text-emerald-300" />
                <span className="font-hud text-[10px] uppercase tracking-widest text-emerald-200">Approval-Gated Code Access</span>
              </div>
              <p className="text-xs text-emerald-100/80">
                This agent can create branches and open PRs but cannot merge or deploy without your explicit approval. Drafts and branches are sandboxed.
              </p>
            </div>
          )}

          {/* simulated output */}
          <div className="mb-4">
            <div className="mb-1.5 font-hud text-[10px] uppercase tracking-widest text-violet-300/60">Simulated Output</div>
            <div className="nexus-scroll h-36 overflow-y-auto rounded-xl border border-violet-400/20 bg-black/40 p-3 font-hud text-[11px] text-emerald-200/90">
              {output.length === 0 ? (
                <span className="text-violet-300/40">— idle — press "Summon Agent" to simulate —</span>
              ) : (
                output.map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap">
                    {l}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={simulate}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
            >
              <Bot size={13} /> Summon Agent
            </button>
            <button
              onClick={() => {
                setSection("projects");
                onClose();
                toast(`${agent.name} assigned`, { description: "Open a Project Room to assign." });
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-violet-400/30 bg-white/5 py-2.5 text-xs text-amber-100 transition hover:border-amber-300/50"
            >
              <Hammer size={13} /> Assign to Project
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
