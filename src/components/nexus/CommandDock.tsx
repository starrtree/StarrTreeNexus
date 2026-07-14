"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Bot,
  Plus,
  Lightbulb,
  DollarSign,
  Sparkles,
  Zap,
  X,
  CornerDownLeft,
  BrainCircuit,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { toast } from "sonner";

const QUICK_ACTIONS = [
  { id: "new-project", label: "New Mission", icon: Plus, action: "mission" },
  { id: "new-idea", label: "Backlog", icon: Lightbulb, action: "incubator" },
  { id: "build-offer", label: "Cashflow", icon: DollarSign, action: "cashflow" },
  { id: "summon-agents", label: "Agents", icon: Bot, action: "agents" },
  { id: "launch-mode", label: "Focus", icon: Zap, action: "focus" },
] as const;

const PLANNER_SUGGESTIONS = [
  "What are my top priorities right now?",
  "Summarize active missions and blockers.",
  "Organize my backlog into agent missions.",
  "Which agents should work together next?",
  "Create a lead tracker for website clients.",
  "Turn StarrDome into a pitch deck.",
  "Build me a 7-day content plan.",
  "Show fastest cashflow move.",
];

function isPlanningPrompt(value: string) {
  const text = value.toLowerCase();
  return [
    "priority",
    "priorities",
    "focus",
    "summarize",
    "summary",
    "organize",
    "plan",
    "planning",
    "what should i",
    "what are my",
    "recommend",
    "blockers",
    "create",
    "build me",
    "turn",
    "cashflow move",
    "mission",
    "backlog",
  ].some((term) => text.includes(term));
}

export function CommandDock({ onPlanner }: { onPlanner?: (prompt: string, autoRun?: boolean) => void }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const commandOpen = useNexus((s) => s.commandOpen);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);
  const runCommand = useNexus((s) => s.runCommand);
  const setSection = useNexus((s) => s.setSection);
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const commandLog = useNexus((s) => s.commandLog);

  useEffect(() => {
    if (commandOpen) inputRef.current?.focus();
  }, [commandOpen]);

  const submit = () => {
    const prompt = text.trim();
    if (!prompt) return;

    if (isPlanningPrompt(prompt) && onPlanner) {
      onPlanner(prompt, true);
      runCommand(`Planning Agent: ${prompt}`);
      toast("Opening Planning Agent", {
        description: "The response will appear in the Planning Agent drawer.",
      });
      setText("");
      setCommandOpen(false);
      return;
    }

    runCommand(prompt);
    toast("UNI Core routed your command", {
      description: "Check the command log.",
    });
    setText("");
  };

  const quick = (q: (typeof QUICK_ACTIONS)[number]) => {
    if (q.action === "focus") {
      setFocusMode(true);
      toast("Focus Mode engaged", { description: "Press Esc to exit." });
      return;
    }
    setSection(q.action as never);
    toast(`${q.label}`, { description: "Routed by UNI Core." });
  };

  return (
    <>
      <div className="glass sticky bottom-0 z-30 rounded-t-2xl border-b-0 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 md:flex">
            {QUICK_ACTIONS.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => quick(q)}
                  className="group flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-white/5 px-2.5 py-1.5 text-xs text-violet-100/80 transition hover:border-amber-300/50 hover:bg-amber-400/10 hover:text-amber-100"
                  title={q.label}
                >
                  <Icon size={13} className="text-amber-300 transition group-hover:scale-110" />
                  <span className="font-hud uppercase tracking-wider">{q.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {QUICK_ACTIONS.slice(0, 3).map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => quick(q)}
                  className="rounded-lg border border-violet-400/20 bg-white/5 p-2 text-amber-300 transition hover:border-amber-300/50"
                  title={q.label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          <div className="flex flex-1 items-center gap-2 rounded-xl border border-violet-400/25 bg-black/30 px-3 py-2 focus-within:border-amber-300/60">
            <Sparkles size={15} className="shrink-0 text-amber-300" />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Ask the Planning Agent…  try: 'what are my top priorities?'"
              className="min-w-0 flex-1 bg-transparent text-sm text-amber-50 placeholder:text-violet-300/40 focus:outline-none"
            />
            <button
              onClick={() => toast("Voice input — coming soon", { description: "Placeholder for now." })}
              className="rounded-md p-1 text-violet-200/60 transition hover:text-amber-200"
              title="Voice (placeholder)"
            >
              <Mic size={15} />
            </button>
            <button
              onClick={() => {
                const prompt = text.trim() || "What should I focus on today?";
                onPlanner?.(prompt, Boolean(text.trim()));
                setText("");
              }}
              className="hidden items-center gap-1.5 rounded-md border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs text-sky-200 transition hover:bg-sky-400/20 sm:flex"
              title="Ask Planning Agent"
            >
              <BrainCircuit size={13} />
              Planner
            </button>
            <button
              onClick={submit}
              className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 p-1.5 text-black transition hover:from-amber-300 hover:to-amber-400"
              title="Send (Enter)"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCommandOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.92, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="glass-gold holo-border relative w-full max-w-2xl overflow-hidden rounded-2xl"
            >
              <div className="flex items-center gap-3 border-b border-amber-300/20 px-5 py-4">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full animate-starrseed-pulse"
                    style={{
                      background: "radial-gradient(circle,#fde047,#fbbf24,transparent 70%)",
                    }}
                  />
                  <BrainCircuit size={15} className="relative text-black" />
                </div>
                <div className="flex-1">
                  <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
                    Planning Agent Command Orb
                  </div>
                  <div className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
                    Ask priorities · summaries · missions · organization
                  </div>
                </div>
                <button
                  onClick={() => setCommandOpen(false)}
                  className="rounded-lg p-1.5 text-violet-200/60 transition hover:bg-white/10 hover:text-amber-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-sky-300/25 bg-sky-400/10 px-3 py-2 text-xs text-sky-100/80 mb-4">
                  Planning responses now appear in the right-side Planning Agent drawer. Press Enter and the drawer will open automatically.
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-amber-300/30 bg-black/40 px-4 py-3">
                  <input
                    ref={inputRef}
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                      if (e.key === "Escape") setCommandOpen(false);
                    }}
                    placeholder="e.g. 'what are my top priorities?' · 'summarize blockers'"
                    className="flex-1 bg-transparent text-base text-amber-50 placeholder:text-violet-300/40 focus:outline-none"
                  />
                  <kbd className="font-hud rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-violet-200/60">
                    <CornerDownLeft size={10} className="inline" />
                  </kbd>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PLANNER_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setText(s);
                        onPlanner?.(s, true);
                        setCommandOpen(false);
                      }}
                      className="rounded-full border border-violet-400/20 bg-white/5 px-3 py-1.5 text-xs text-violet-100/80 transition hover:border-amber-300/50 hover:text-amber-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {commandLog.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto nexus-scroll rounded-xl border border-white/5 bg-black/20 p-2">
                    <div className="px-2 py-1 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                      Recent
                    </div>
                    {commandLog.slice(0, 5).map((c) => (
                      <div key={c.id} className="rounded-lg px-2 py-1.5 hover:bg-white/5">
                        <div className="text-xs text-amber-100">{c.text}</div>
                        <div className="text-[11px] text-violet-200/60">{c.reply}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
