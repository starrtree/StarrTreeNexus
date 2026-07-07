"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Plus,
  X,
  Sparkles,
  Trash2,
  Rocket,
  Calendar,
  GitMerge,
  Clapperboard,
  Archive,
  Hammer,
  Star,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { type Idea } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_META: Record<
  Idea["status"],
  { label: string; color: string; icon: typeof Hammer }
> = {
  new: { label: "New", color: "#a78bfa", icon: Star },
  build: { label: "Build Now", color: "#10b981", icon: Hammer },
  schedule: { label: "Schedule", color: "#38bdf8", icon: Calendar },
  merge: { label: "Merge", color: "#c026d3", icon: GitMerge },
  content: { label: "Content", color: "#ec4899", icon: Clapperboard },
  archived: { label: "Archived", color: "#64748b", icon: Archive },
};

function scoreIdea(i: Pick<Idea, "impact" | "cash" | "effort" | "brand" | "urgency">) {
  const raw = i.impact * 2 + i.cash * 2 + i.brand * 1.5 + i.urgency * 1.5 - i.effort * 1.5;
  // normalize to 0-100
  const min = 5 * 2 + 1 * 2 + 1 * 1.5 + 1 * 1.5 - 5 * 1.5; // worst
  const max = 5 * 2 + 5 * 2 + 5 * 1.5 + 5 * 1.5 - 1 * 1.5; // best
  const pct = Math.round(((raw - min) / (max - min)) * 100);
  return Math.max(0, Math.min(100, pct));
}

export function IdeaIncubator() {
  const ideas = useNexus((s) => s.ideas);
  const addIdea = useNexus((s) => s.addIdea);
  const updateIdea = useNexus((s) => s.updateIdea);
  const removeIdea = useNexus((s) => s.removeIdea);
  const promoteIdea = useNexus((s) => s.promoteIdea);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    details: "",
    impact: 3,
    cash: 3,
    effort: 3,
    brand: 3,
    urgency: 3,
  });

  const [filter, setFilter] = useState<Idea["status"] | "all">("all");

  // persist a marker so the user sees localStorage is working
  const [persisted] = useLocalStorage<number>("nexus.ideas.count", ideas.length);

  const submit = () => {
    if (!form.title.trim()) {
      toast("Title required", { description: "Give your StarrSeed a name." });
      return;
    }
    addIdea(form);
    toast("StarrSeed planted", { description: form.title });
    setForm({ title: "", details: "", impact: 3, cash: 3, effort: 3, brand: 3, urgency: 3 });
    setOpen(false);
  };

  const filtered = filter === "all" ? ideas : ideas.filter((i) => i.status === filter);
  const sorted = [...filtered].sort((a, b) => scoreIdea(b) - scoreIdea(a));

  return (
    <div className="space-y-4">
      <GlassCard gold>
        <PanelTitle
          title="Idea Incubator"
          subtitle="Capture · score · route raw ideas"
          icon={<Lightbulb size={16} />}
          right={
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
            >
              <Plus size={13} /> New StarrSeed
            </button>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Filter:</span>
          {(["all", "new", "build", "schedule", "merge", "content", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-hud text-[10px] uppercase tracking-widest transition",
                filter === f
                  ? "border-amber-300/50 bg-amber-400/15 text-amber-200"
                  : "border-violet-400/20 bg-white/5 text-violet-200/60 hover:border-amber-300/30",
              )}
            >
              {f === "all" ? "All" : STATUS_META[f].label}
            </button>
          ))}
          <span className="ml-auto font-hud text-[9px] uppercase tracking-widest text-violet-300/40">
            {sorted.length} seeds · saved locally
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((idea, i) => {
          const score = scoreIdea(idea);
          const meta = STATUS_META[idea.status];
          const Icon = meta.icon;
          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass relative overflow-hidden rounded-2xl p-4"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl"
                style={{ background: meta.color }}
              />
              <div className="mb-2 flex items-start justify-between">
                <span
                  className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest"
                  style={{ borderColor: `${meta.color}55`, color: meta.color, background: `${meta.color}11` }}
                >
                  <Icon size={9} /> {meta.label}
                </span>
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={9}
                        className={s <= Math.round(score / 20) ? "text-amber-300" : "text-white/10"}
                        fill={s <= Math.round(score / 20) ? "#fbbf24" : "none"}
                      />
                    ))}
                  </span>
                  <span className="font-hud text-[10px] text-amber-300/70">{score}</span>
                </div>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-amber-50">{idea.title}</h3>
              <p className="mb-3 line-clamp-2 text-xs text-violet-100/60">{idea.details}</p>

              <div className="mb-3 grid grid-cols-5 gap-1">
                <ScoreBar label="IMP" value={idea.impact} color="#fbbf24" />
                <ScoreBar label="$$" value={idea.cash} color="#10b981" />
                <ScoreBar label="EFF" value={6 - idea.effort} color="#ef4444" />
                <ScoreBar label="BRD" value={idea.brand} color="#c026d3" />
                <ScoreBar label="URG" value={idea.urgency} color="#38bdf8" />
              </div>

              <div className="flex flex-wrap gap-1">
                <RouteBtn label="Build" icon={Hammer} onClick={() => updateIdea(idea.id, { status: "build" })} active={idea.status === "build"} />
                <RouteBtn label="Schedule" icon={Calendar} onClick={() => updateIdea(idea.id, { status: "schedule" })} active={idea.status === "schedule"} />
                <RouteBtn label="Merge" icon={GitMerge} onClick={() => updateIdea(idea.id, { status: "merge" })} active={idea.status === "merge"} />
                <RouteBtn label="Content" icon={Clapperboard} onClick={() => updateIdea(idea.id, { status: "content" })} active={idea.status === "content"} />
              </div>

              <div className="mt-2 flex gap-1">
                <button
                  onClick={() => {
                    promoteIdea(idea.id);
                    toast("Idea promoted → Project Room", { description: idea.title });
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-amber-400/20 to-violet-500/20 py-1.5 text-[11px] font-semibold text-amber-100 transition hover:from-amber-400/30 hover:to-violet-500/30"
                >
                  <Rocket size={11} /> Promote
                </button>
                <button
                  onClick={() => {
                    removeIdea(idea.id);
                    toast("Idea removed", { description: idea.title });
                  }}
                  className="flex items-center justify-center rounded-lg border border-violet-400/20 px-2 text-violet-300/50 transition hover:border-red-400/40 hover:text-red-300"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/30 text-violet-200/60 transition hover:border-amber-300/50 hover:text-amber-200"
        >
          <Plus size={22} />
          <span className="font-hud text-xs uppercase tracking-widest">Plant a StarrSeed</span>
        </button>
      </div>

      <AnimatePresence>
        {open && <IdeaModal form={form} setForm={setForm} onClose={() => setOpen(false)} onSubmit={submit} />}
      </AnimatePresence>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-black/20 p-1 text-center">
      <div className="font-hud text-[7px] uppercase tracking-wider text-violet-300/50">{label}</div>
      <div className="mx-auto mt-0.5 h-6 w-1 rounded-full bg-white/10">
        <div className="h-full w-full rounded-full" style={{ height: `${(value / 5) * 100}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
      </div>
      <div className="font-hud text-[8px] text-amber-300/70">{value}</div>
    </div>
  );
}

function RouteBtn({
  label,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  icon: typeof Hammer;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-hud text-[8px] uppercase tracking-wider transition",
        active
          ? "border-amber-300/50 bg-amber-400/15 text-amber-200"
          : "border-violet-400/20 bg-white/5 text-violet-200/60 hover:border-amber-300/30",
      )}
    >
      <Icon size={8} /> {label}
    </button>
  );
}

function IdeaModal({
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  form: {
    title: string;
    details: string;
    impact: number;
    cash: number;
    effort: number;
    brand: number;
    urgency: number;
  };
  setForm: (f: typeof form) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const preview = scoreIdea(form);
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
        className="glass-gold holo-border relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-amber-300/20 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-300" />
            <div>
              <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">New StarrSeed</div>
              <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Plant an idea</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-violet-200/60 transition hover:bg-white/10 hover:text-amber-100">
            <X size={18} />
          </button>
        </div>

        <div className="nexus-scroll max-h-[calc(92vh-160px)] overflow-y-auto p-5">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Idea title…"
            className="mb-3 w-full rounded-xl border border-violet-400/20 bg-black/30 px-3 py-2.5 text-base text-amber-50 placeholder:text-violet-300/40 focus:border-amber-300/50 focus:outline-none"
          />
          <textarea
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            placeholder="Details… what's the vision?"
            rows={3}
            className="mb-4 w-full rounded-xl border border-violet-400/20 bg-black/30 px-3 py-2.5 text-sm text-amber-50 placeholder:text-violet-300/40 focus:border-amber-300/50 focus:outline-none"
          />

          <div className="mb-2 font-hud text-[10px] uppercase tracking-widest text-violet-300/60">Auto-score</div>
          <div className="space-y-3">
            <Slider label="Impact" value={form.impact} onChange={(v) => setForm({ ...form, impact: v })} color="#fbbf24" />
            <Slider label="Cash potential" value={form.cash} onChange={(v) => setForm({ ...form, cash: v })} color="#10b981" />
            <Slider label="Effort (higher = harder)" value={form.effort} onChange={(v) => setForm({ ...form, effort: v })} color="#ef4444" />
            <Slider label="Brand alignment" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} color="#c026d3" />
            <Slider label="Urgency" value={form.urgency} onChange={(v) => setForm({ ...form, urgency: v })} color="#38bdf8" />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-300/30 bg-amber-400/10 p-3">
            <span className="font-hud text-[10px] uppercase tracking-widest text-amber-300/70">StarrScore</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(preview / 20) ? "text-amber-300" : "text-white/10"} fill={s <= Math.round(preview / 20) ? "#fbbf24" : "none"} />
              ))}
              <span className="ml-1 font-hud text-sm font-bold text-amber-200">{preview}</span>
            </div>
          </div>

          <button
            onClick={onSubmit}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
          >
            <Sparkles size={14} /> Plant StarrSeed
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Slider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
        <span>{label}</span>
        <span className="text-amber-300/70">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
