"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow as WorkflowIcon,
  Play,
  X,
  Zap,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { workflows, agents, type Workflow } from "@/data/mockData";
import { GlassCard, PanelTitle } from "../shared";
import { DynIcon } from "../DynIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLOR: Record<Workflow["status"], string> = {
  ready: "#10b981",
  running: "#fbbf24",
  paused: "#ef4444",
  draft: "#a78bfa",
};

export function WorkflowForge() {
  const [running, setRunning] = useState<Workflow | null>(null);
  const [stepIdx, setStepIdx] = useState(-1);

  const simulate = (wf: Workflow) => {
    setRunning(wf);
    setStepIdx(0);
    toast(`${wf.name} started`, { description: "Simulating execution…" });
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      if (i >= wf.steps.length) {
        clearInterval(iv);
        setTimeout(() => {
          setStepIdx(-1);
          toast(`${wf.name} complete`, { description: wf.output });
        }, 800);
        return;
      }
      setStepIdx(i);
    }, 900);
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle
          title="Workflow Forge"
          subtitle="Automations across the tree"
          icon={<WorkflowIcon size={16} />}
          right={
            <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 font-hud text-[9px] uppercase tracking-widest text-amber-200">
              <Zap size={10} /> {workflows.length} workflows
            </span>
          }
        />
        <p className="text-xs text-violet-100/70">
          Each automation runs an agent through a trigger → input → output pipeline. Approval gates keep Max in control of anything external.
        </p>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        {workflows.map((wf, i) => {
          const agent = agents.find((a) => a.id === wf.agent);
          return (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass relative overflow-hidden rounded-2xl p-4"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl"
                style={{ background: agent?.color ?? "#8b5cf6" }}
              />
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${agent?.color}22`, border: `1px solid ${agent?.color}55` }}
                  >
                    {agent && <DynIcon name={agent.icon} size={16} style={{ color: agent.color }} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-50">{wf.name}</h3>
                    <span
                      className="flex items-center gap-1 font-hud text-[9px] uppercase tracking-widest"
                      style={{ color: STATUS_COLOR[wf.status] }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[wf.status] }} />
                      {wf.status}
                    </span>
                  </div>
                </div>
                {wf.approvalGate && (
                  <span className="flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-amber-200">
                    <ShieldCheck size={9} /> Gate
                  </span>
                )}
              </div>

              <div className="mb-3 space-y-1.5">
                <Row label="Trigger" value={wf.trigger} icon={Zap} />
                <Row label="Input" value={wf.input} icon={GitBranch} />
                <Row label="Agent" value={agent?.name ?? wf.agent} icon={DynIconName} />
                <Row label="Output" value={wf.output} icon={ArrowRight} />
              </div>

              <div className="mb-3 flex flex-wrap gap-1">
                {wf.tools.map((t) => (
                  <span key={t} className="rounded-full border border-violet-400/20 bg-white/5 px-1.5 py-0.5 font-hud text-[8px] uppercase tracking-wider text-violet-200/60">
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => simulate(wf)}
                disabled={running?.id === wf.id && stepIdx >= 0}
                className={cn(
                  "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
                  running?.id === wf.id && stepIdx >= 0
                    ? "bg-amber-400/15 text-amber-200"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400",
                )}
              >
                <Play size={13} />
                {running?.id === wf.id && stepIdx >= 0 ? "Running…" : "Simulate Run"}
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {running && stepIdx >= 0 && (
          <RunTimeline workflow={running} stepIdx={stepIdx} onClose={() => setRunning(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Zap }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
      <Icon size={12} className="mt-0.5 shrink-0 text-amber-300/70" />
      <div className="min-w-0 flex-1">
        <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{label}</div>
        <div className="truncate text-[11px] text-amber-100/80">{value}</div>
      </div>
    </div>
  );
}

// placeholder icon component for "Agent" row
function DynIconName() {
  return <WorkflowIcon size={12} />;
}

function RunTimeline({
  workflow,
  stepIdx,
  onClose,
}: {
  workflow: Workflow;
  stepIdx: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
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
        className="glass-gold holo-border relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-amber-300/20 p-5">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-breathe" />
              <Play size={14} className="relative text-amber-300" />
            </div>
            <div>
              <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
                {workflow.name}
              </div>
              <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                Execution timeline
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-violet-200/60 transition hover:bg-white/10 hover:text-amber-100">
            <X size={18} />
          </button>
        </div>

        <div className="nexus-scroll max-h-[70vh] overflow-y-auto p-5">
          <div className="space-y-2">
            {workflow.steps.map((s, i) => {
              const done = i < stepIdx;
              const current = i === stepIdx;
              const gate = s.toLowerCase().includes("approval") || s.toLowerCase().includes("gate");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl border p-3 transition",
                    current && "border-amber-300/60 bg-amber-400/10 box-glow-gold",
                    done && "border-emerald-400/30 bg-emerald-400/5",
                    !done && !current && "border-violet-400/15 bg-white/[0.02] opacity-50",
                    gate && "border-amber-300/40 bg-amber-400/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-hud text-[10px] font-bold",
                      done && "bg-emerald-400 text-black",
                      current && "bg-amber-400 text-black",
                      !done && !current && "bg-white/10 text-violet-300/50",
                    )}
                  >
                    {done ? <CheckCircle2 size={14} /> : current ? <Clock size={13} className="animate-pulse" /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className={cn("text-xs", done ? "text-emerald-200" : current ? "text-amber-100" : "text-violet-300/50")}>
                      {s}
                    </div>
                    {gate && (
                      <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">
                        Approval gate — Max reviews
                      </div>
                    )}
                  </div>
                  {current && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-amber-300 border-t-transparent"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-violet-400/20 bg-black/30 p-3">
            <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Final Output</div>
            <div className="text-xs text-amber-100/80">{workflow.output}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
