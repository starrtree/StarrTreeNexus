"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNexus } from "@/store/nexusStore";
import type { AgentMission, MissionStatus } from "@/data/starrbaseData";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "What should I focus on today?",
  "Summarize active missions and blockers.",
  "Organize my backlog into agent missions.",
  "Which agents should work together next?",
];

type Priority = "low" | "medium" | "high" | "urgent";

type PlannerAction = {
  type: "create_mission" | "update_mission" | "create_idea" | "assign_agent" | "none";
  label: string;
  rationale: string;
  title: string | null;
  description: string | null;
  priority: Priority | null;
  leadAgentId: string | null;
  supportAgentIds: string[];
  departmentId: string | null;
  missionId: string | null;
  agentId: string | null;
  impact: number | null;
  urgencyScore: number | null;
  fields: {
    status: MissionStatus | null;
    priority: Priority | null;
    progress: number | null;
    blockers: string[];
  };
};

type PlannerResponse = {
  configured: boolean;
  summary: string;
  activityDigest: string[];
  recommendedPriorities: Array<{
    title: string;
    why: string;
    urgency: Priority;
    suggestedOwnerAgentId: string | null;
    relatedMissionId: string | null;
  }>;
  suggestedActions: PlannerAction[];
  questions: string[];
  confidence: number;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampScore(value: number | null | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function buildPlannerSnapshot() {
  const state = useNexus.getState();
  return {
    departments: state.departments,
    agents: state.agents,
    agentRuntimes: state.agentRuntimes,
    agentMissions: state.agentMissions,
    collaborations: state.collaborations,
    toolConnections: state.toolConnections,
    memoryZones: state.memoryZones,
    projects: state.projects,
    ideas: state.ideas,
    cashflow: state.cashflow,
    commandLog: state.commandLog.slice(0, 8),
  };
}

export function PlanningAgentDock({ open, onClose }: { open: boolean; onClose: () => void }) {
  const section = useNexus((s) => s.section);
  const selectedMissionId = useNexus((s) => s.selectedMissionId);
  const selectedAgentId = useNexus((s) => s.selectedAgentId);
  const setSection = useNexus((s) => s.setSection);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);

  const [message, setMessage] = useState("What should I focus on today?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<number, boolean>>({});

  const confidence = useMemo(() => Math.round((result?.confidence ?? 0) * 100), [result]);

  async function askPlanner(promptOverride?: string) {
    const prompt = (promptOverride ?? message).trim();
    if (!prompt) return;

    setMessage(prompt);
    setLoading(true);
    setError(null);
    setAppliedActions({});

    try {
      const response = await fetch("/api/agent/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          boardState: buildPlannerSnapshot(),
          context: { section, selectedMissionId, selectedAgentId },
        }),
      });

      const data = (await response.json()) as PlannerResponse;
      if (!response.ok) {
        throw new Error(data.summary || "Planner request failed");
      }

      setResult(data);
      if (!data.configured) {
        toast("Planning Agent is not configured", { description: "Check OPENAI_API_KEY in Vercel." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Planning Agent failed";
      setError(msg);
      toast("Planning Agent error", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  function applyAction(action: PlannerAction, index: number) {
    if (action.type === "none") return;

    if (action.type === "create_mission") {
      const now = Date.now();
      const mission: AgentMission = {
        id: uid("m"),
        title: action.title || action.label || "Planning Agent Mission",
        description: action.description || action.rationale || "Created by Planning Agent.",
        status: "queued",
        priority: action.priority || "medium",
        leadAgentId: action.leadAgentId || "uni-core",
        supportAgentIds: action.supportAgentIds || [],
        departmentId: action.departmentId || "command-core",
        inputs: ["Planning Agent recommendation"],
        outputs: ["Completed mission output"],
        blockers: [],
        progress: 0,
        createdAt: now,
        updatedAt: now,
      };

      useNexus.setState((state) => ({
        agentMissions: [mission, ...state.agentMissions],
        selectedMissionId: mission.id,
        section: "mission",
        agentRuntimes: state.agentRuntimes.map((runtime) =>
          runtime.agentId === mission.leadAgentId
            ? { ...runtime, currentMissionId: mission.id, status: "planning", activeProcess: `Planning: ${mission.title}` }
            : runtime,
        ),
      }));
      setSection("mission");
      setSelectedMission(mission.id);
    }

    if (action.type === "update_mission" && action.missionId) {
      useNexus.setState((state) => ({
        agentMissions: state.agentMissions.map((mission) =>
          mission.id === action.missionId
            ? {
                ...mission,
                status: action.fields.status ?? mission.status,
                priority: action.fields.priority ?? mission.priority,
                progress:
                  typeof action.fields.progress === "number"
                    ? Math.max(0, Math.min(100, Math.round(action.fields.progress)))
                    : mission.progress,
                blockers: action.fields.blockers.length ? action.fields.blockers : mission.blockers,
                updatedAt: Date.now(),
              }
            : mission,
        ),
        selectedMissionId: action.missionId,
        section: "mission",
      }));
      setSection("mission");
      setSelectedMission(action.missionId);
    }

    if (action.type === "create_idea") {
      const idea = {
        id: uid("i"),
        title: action.title || action.label || "Planning Agent Idea",
        details: action.description || action.rationale || "Captured by Planning Agent.",
        impact: clampScore(action.impact, 7),
        cash: 5,
        effort: 5,
        brand: 7,
        urgency: clampScore(action.urgencyScore, 6),
        status: "new" as const,
        createdAt: Date.now(),
      };
      useNexus.setState((state) => ({ ideas: [idea, ...state.ideas], section: "incubator" }));
      setSection("incubator");
    }

    if (action.type === "assign_agent" && action.agentId && action.missionId) {
      useNexus.setState((state) => ({
        agentMissions: state.agentMissions.map((mission) =>
          mission.id === action.missionId
            ? {
                ...mission,
                supportAgentIds: mission.supportAgentIds.includes(action.agentId!)
                  ? mission.supportAgentIds
                  : [...mission.supportAgentIds, action.agentId!],
                updatedAt: Date.now(),
              }
            : mission,
        ),
        agentRuntimes: state.agentRuntimes.map((runtime) =>
          runtime.agentId === action.agentId
            ? { ...runtime, currentMissionId: action.missionId, status: "working", activeProcess: `Assigned to mission ${action.missionId}` }
            : runtime,
        ),
        selectedAgentId: action.agentId,
        selectedMissionId: action.missionId,
        section: "agents",
      }));
      setSection("agents");
      setSelectedAgent(action.agentId);
    }

    setAppliedActions((prev) => ({ ...prev, [index]: true }));
    toast("Planner action applied", { description: action.label });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex justify-end bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default" aria-label="Close planner" onClick={onClose} />
          <motion.aside
            initial={{ x: 520 }}
            animate={{ x: 0 }}
            exit={{ x: 520 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="nexus-scroll relative h-full w-full max-w-[520px] overflow-y-auto border-l border-amber-300/25 bg-[#080414]/95 p-4 shadow-[0_0_60px_rgba(251,191,36,0.18)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/10 text-amber-200 box-glow-gold">
                  <BrainCircuit size={21} />
                </div>
                <div>
                  <h2 className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">Planning Agent</h2>
                  <p className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">summarize · prioritize · organize</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-violet-100/70 transition hover:border-amber-300/35 hover:text-amber-100">
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-violet-400/20 bg-black/30 p-3 text-sm text-amber-50 outline-none placeholder:text-violet-300/40 focus:border-amber-300/45"
                placeholder="Ask the Planning Agent what to do next..."
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => askPlanner(prompt)}
                      className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 font-hud text-[8px] uppercase tracking-widest text-violet-100/65 transition hover:border-amber-300/35 hover:text-amber-100"
                    >
                      {prompt.replace(".", "")}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => askPlanner()}
                  disabled={loading}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 font-hud text-[10px] uppercase tracking-widest text-amber-100 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Ask
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
                <div className="mb-1 flex items-center gap-2 font-hud text-[10px] uppercase tracking-widest text-red-200">
                  <AlertTriangle size={13} /> Planner error
                </div>
                {error}
              </div>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <section className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-widest text-amber-200">
                      <Sparkles size={13} /> Summary
                    </div>
                    <span className="rounded-full border border-amber-300/30 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-amber-100/70">
                      {confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-amber-50">{result.summary}</p>
                </section>

                {!!result.activityDigest.length && (
                  <Section title="Activity Digest" icon={<Bot size={14} />}>
                    {result.activityDigest.map((item) => <Bullet key={item}>{item}</Bullet>)}
                  </Section>
                )}

                {!!result.recommendedPriorities.length && (
                  <Section title="Recommended Priorities" icon={<CheckCircle2 size={14} />}>
                    <div className="space-y-2">
                      {result.recommendedPriorities.map((priority) => (
                        <div key={`${priority.title}-${priority.relatedMissionId}`} className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-amber-50">{priority.title}</h3>
                            <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", urgencyTone(priority.urgency))}>
                              {priority.urgency}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-violet-100/65">{priority.why}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {!!result.suggestedActions.length && (
                  <Section title="Suggested Board Updates" icon={<Sparkles size={14} />}>
                    <div className="space-y-2">
                      {result.suggestedActions.filter((a) => a.type !== "none").map((action, index) => (
                        <div key={`${action.type}-${action.label}-${index}`} className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">{action.type.replaceAll("_", " ")}</div>
                              <h3 className="mt-1 text-sm font-semibold text-amber-50">{action.label}</h3>
                              <p className="mt-1 text-xs leading-relaxed text-violet-100/60">{action.rationale}</p>
                            </div>
                            <button
                              onClick={() => applyAction(action, index)}
                              disabled={!!appliedActions[index]}
                              className={cn(
                                "shrink-0 rounded-lg border px-3 py-1.5 font-hud text-[8px] uppercase tracking-widest transition",
                                appliedActions[index]
                                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                                  : "border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20",
                              )}
                            >
                              {appliedActions[index] ? "Applied" : "Apply"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {!!result.questions.length && (
                  <Section title="Questions" icon={<AlertTriangle size={14} />}>
                    {result.questions.map((item) => <Bullet key={item}>{item}</Bullet>)}
                  </Section>
                )}
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-violet-400/15 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 font-hud text-[10px] uppercase tracking-widest text-violet-200/70">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-1 text-sm leading-relaxed text-violet-100/68">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/70" />
      <span>{children}</span>
    </div>
  );
}

function urgencyTone(priority: Priority) {
  if (priority === "urgent") return "border-red-300/40 bg-red-400/10 text-red-100";
  if (priority === "high") return "border-amber-300/40 bg-amber-400/10 text-amber-100";
  if (priority === "medium") return "border-sky-300/35 bg-sky-400/10 text-sky-100";
  return "border-violet-300/25 bg-violet-400/10 text-violet-100";
}
