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
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUICK_ACTIONS = [
  { id: "new-project", label: "New Project", icon: Plus, action: "projects" },
  { id: "new-idea", label: "New Idea", icon: Lightbulb, action: "incubator" },
  { id: "build-offer", label: "Build Offer", icon: DollarSign, action: "cashflow" },
  { id: "summon-agents", label: "Summon Agents", icon: Bot, action: "agents" },
  { id: "launch-mode", label: "Launch Mode", icon: Zap, action: "focus" },
] as const;

export function CommandDock() {
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
    if (!text.trim()) return;
    runCommand(text);
    toast("UNI Core routed your command", {
      description: "Check the command log.",
    });
    setText("");
  };

  const quick = (q: (typeof QUICK_ACTIONS)[number]) => {
    if (q.action === "focus") {
      setFocusMode(true);
      toast("Launch Mode engaged", { description: "Focus Mode on. Press Esc to exit." });
      return;
    }
    setSection(q.action as never);
    toast(`${q.label}`, { description: "Routed by UNI Core." });
  };

  return (
    <>
      {/* Dock bar */}
      <div className="glass sticky bottom-0 z-30 rounded-t-2xl border-b-0 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          {/* quick actions */}
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

          {/* mobile quick actions (compact) */}
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

          {/* text input */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-violet-400/25 bg-black/30 px-3 py-2 focus-within:border-amber-300/60">
            <Sparkles size={15} className="shrink-0 text-amber-300" />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Command the Nexus…  (try: 'show fastest cashflow move')"
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
                if (text.trim()) {
                  runCommand(text);
                  toast("Routed to Agent Bay", { description: "Builder Agent + UNI Core notified." });
                  setText("");
                } else {
                  setSection("agents");
                }
              }}
              className="hidden items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200 transition hover:bg-emerald-400/20 sm:flex"
              title="Route to Agent"
            >
              <Bot size={13} />
              Route
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

      {/* Command orb overlay (⌘K) */}
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
                  <Sparkles size={15} className="relative text-black" />
                </div>
                <div className="flex-1">
                  <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
                    UNI Core Command Orb
                  </div>
                  <div className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
                    Speak your intent
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
                <div className="flex items-center gap-2 rounded-xl border border-amber-300/30 bg-black/40 px-4 py-3">
                  <input
                    ref={inputRef}
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submit();
                        setCommandOpen(false);
                      }
                      if (e.key === "Escape") setCommandOpen(false);
                    }}
                    placeholder="e.g. 'summon builder agent' · 'show fastest cashflow move'"
                    className="flex-1 bg-transparent text-base text-amber-50 placeholder:text-violet-300/40 focus:outline-none"
                  />
                  <kbd className="font-hud rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-violet-200/60">
                    <CornerDownLeft size={10} className="inline" />
                  </kbd>
                </div>

                {/* suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Add a project editing modal",
                    "Create a lead tracker for website clients",
                    "Turn StarrDome into a pitch deck",
                    "Build me a 7-day content plan",
                    "Show fastest cashflow move",
                    "Summon Builder Agent",
                    "Open Focus Mode",
                    "Create a new StarrSeed",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setText(s);
                      }}
                      className="rounded-full border border-violet-400/20 bg-white/5 px-3 py-1.5 text-xs text-violet-100/80 transition hover:border-amber-300/50 hover:text-amber-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* recent log */}
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
