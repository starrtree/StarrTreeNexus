"use client";

import { motion } from "framer-motion";
import { BookMarked, Lock, Sparkles, Database, ArrowUpRight } from "lucide-react";
import { knowledgeSources } from "@/data/mockData";
import { GlassCard, PanelTitle } from "../shared";
import { DynIcon } from "../DynIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function KnowledgeVault() {
  const local = knowledgeSources.filter((k) => k.type === "local");
  const future = knowledgeSources.filter((k) => k.type === "future");

  return (
    <div className="space-y-4">
      <GlassCard gold>
        <PanelTitle title="Knowledge Vault" subtitle="The memory of StarrTree" icon={<BookMarked size={16} />} />
        <p className="text-xs text-violet-100/70">
          The Vault unifies every doc, note, file, and sync source. Local sources are live now;{" "}
          <span className="text-amber-200">future sources</span> will be wired through agents.
        </p>
      </GlassCard>

      {/* local sources */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Database size={13} className="text-emerald-300" />
          <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-emerald-200">
            Live Sources
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {local.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass relative overflow-hidden rounded-2xl p-4"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
              <div className="mb-2 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 border border-emerald-400/30">
                  <DynIcon name={k.icon} size={18} className="text-emerald-300" />
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-emerald-200">
                  {k.count} items
                </span>
              </div>
              <h3 className="text-sm font-semibold text-amber-50">{k.name}</h3>
              <p className="mt-1 text-xs text-violet-100/60">{k.description}</p>
              <button
                onClick={() => toast(`Browsing ${k.name}`, { description: `${k.count} items indexed.` })}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Browse <ArrowUpRight size={11} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* future sources */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Lock size={13} className="text-amber-300" />
          <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-200">
            Future Sync Sources
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {future.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass relative overflow-hidden rounded-2xl p-4 opacity-80"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl" />
              <div className="mb-2 flex items-start justify-between">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/25">
                  <DynIcon name={k.icon} size={18} className="text-amber-300/70" />
                  <Lock size={10} className="absolute -bottom-1 -right-1 text-amber-300" />
                </div>
                <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-amber-200">
                  Planned
                </span>
              </div>
              <h3 className="text-sm font-semibold text-amber-50/80">{k.name}</h3>
              <p className="mt-1 text-xs text-violet-100/50">{k.description}</p>
              <button
                onClick={() => toast("Coming soon", { description: `${k.name} will sync via an agent.` })}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-amber-300/30 py-1.5 text-xs text-amber-200/60"
              >
                <Sparkles size={11} /> Notify when ready
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI memory explainer */}
      <GlassCard glow="purple">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 border border-violet-400/30">
            <Sparkles size={18} className="text-violet-300" />
          </div>
          <div>
            <h3 className="font-hud text-sm font-bold uppercase tracking-widest text-violet-100">
              AI Memory / Context
            </h3>
            <p className="mt-1 text-xs text-violet-100/70">
              Long-term agent memory will let every agent remember your decisions, preferences, and project history across sessions. The Librarian Agent will index it all into a searchable, taggable vault — so UNI Core can recall "what we decided about the StarrDome deck" instantly.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Vector search", "Auto-tagging", "Cross-agent recall", "Versioned memory"].map((t) => (
                <span key={t} className="rounded-full border border-violet-400/20 bg-white/5 px-2 py-0.5 font-hud text-[8px] uppercase tracking-wider text-violet-200/60">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
