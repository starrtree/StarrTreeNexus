"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  X,
  Bot,
  ListChecks,
  DollarSign,
  Workflow,
  Archive,
  ArrowRight,
  Sparkles,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import {
  branches,
  agents,
  PIPELINE_STAGES,
  type Project,
  type ProjectStatus,
} from "@/data/mockData";
import { GlassCard, PanelTitle, StatusBadge, MiniBar } from "../shared";
import { DynIcon } from "../DynIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FILTERS: { id: ProjectStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "idea", label: "Ideas" },
  { id: "revenue", label: "Revenue" },
  { id: "decision", label: "Decisions" },
  { id: "blocked", label: "Blocked" },
  { id: "agent", label: "Agent" },
];

export function ProjectRooms() {
  const projects = useNexus((s) => s.projects);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const selectedProjectId = useNexus((s) => s.selectedProjectId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [projects, filter, query]);

  const selected = projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-violet-400/20 bg-black/30 px-3 py-2">
            <Search size={15} className="text-amber-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="flex-1 bg-transparent text-sm text-amber-50 placeholder:text-violet-300/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto nexus-scroll">
            <Filter size={13} className="shrink-0 text-violet-300/50" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 font-hud text-[10px] uppercase tracking-widest transition",
                  filter === f.id
                    ? "border-amber-300/50 bg-amber-400/15 text-amber-200"
                    : "border-violet-400/20 bg-white/5 text-violet-200/60 hover:border-amber-300/30",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => {
          const branch = branches.find((b) => b.id === p.branch)!;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedProject(p.id)}
              className="glass group relative overflow-hidden rounded-2xl p-4 text-left transition hover:border-amber-300/40"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
                style={{ background: branch.color }}
              />
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${branch.color}22`, border: `1px solid ${branch.color}55` }}
                  >
                    <DynIcon name={branch.icon} size={14} style={{ color: branch.color }} />
                  </div>
                  <span className="font-hud text-[9px] uppercase tracking-widest" style={{ color: branch.color }}>
                    {branch.short}
                  </span>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-amber-50">{p.title}</h3>
              <p className="mb-3 line-clamp-2 text-xs text-violet-100/60">{p.mission}</p>

              <div className="mb-2">
                <div className="mb-1 flex justify-between font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  <span>Pipeline</span>
                  <span className="text-amber-300/70">{PIPELINE_STAGES[p.pipelineStage]}</span>
                </div>
                <div className="flex gap-0.5">
                  {PIPELINE_STAGES.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: idx <= p.pipelineStage ? branch.color : "rgba(255,255,255,0.08)",
                        boxShadow: idx <= p.pipelineStage ? `0 0 4px ${branch.color}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <div className="mb-1 flex justify-between font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  <span>Progress</span>
                  <span className="text-amber-300/70">{p.progress}%</span>
                </div>
                <MiniBar value={p.progress} color={branch.color} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {p.assignedAgents.slice(0, 3).map((aid) => {
                    const a = agents.find((x) => x.id === aid);
                    if (!a) return null;
                    return (
                      <div
                        key={aid}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-black/40"
                        style={{ background: `${a.color}33` }}
                        title={a.name}
                      >
                        <DynIcon name={a.icon} size={10} style={{ color: a.color }} />
                      </div>
                    );
                  })}
                </div>
                <span className="flex items-center gap-1 font-hud text-[9px] uppercase tracking-widest text-amber-300/60 transition group-hover:translate-x-0.5 group-hover:text-amber-200">
                  Open <ArrowRight size={11} />
                </span>
              </div>
            </motion.button>
          );
        })}

        <button
          onClick={() => {
            useNexus.getState().addProject({
              title: "New Project",
              branch: "automation",
              status: "idea",
            });
            toast("New Project Room spawned", { description: "Open it to define the mission." });
          }}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/30 text-violet-200/60 transition hover:border-amber-300/50 hover:text-amber-200"
        >
          <Plus size={22} />
          <span className="font-hud text-xs uppercase tracking-widest">New Project Room</span>
        </button>
      </div>

      <AnimatePresence>
        {selected && <ProjectRoomModal project={selected} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ProjectRoomModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const updateProject = useNexus((s) => s.updateProject);
  const setSection = useNexus((s) => s.setSection);
  const [notes, setNotes] = useState(project.notes);
  const branch = branches.find((b) => b.id === project.branch)!;

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
        className="glass-gold holo-border relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl sm:rounded-3xl"
      >
        {/* header */}
        <div className="relative flex items-start justify-between gap-3 border-b border-amber-300/20 p-5">
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{ background: branch.color }}
          />
          <div className="relative flex min-w-0 flex-1 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${branch.color}22`, border: `1px solid ${branch.color}55` }}
            >
              <DynIcon name={branch.icon} size={20} style={{ color: branch.color }} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                <span className="font-hud text-[9px] uppercase tracking-widest" style={{ color: branch.color }}>
                  {branch.name}
                </span>
              </div>
              <h2 className="text-lg font-bold text-amber-50 sm:text-xl">{project.title}</h2>
              <p className="text-xs text-violet-100/70">{project.mission}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-violet-200/60 transition hover:bg-white/10 hover:text-amber-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="nexus-scroll max-h-[calc(92vh-180px)] overflow-y-auto p-5">
          {/* launch pipeline */}
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={13} className="text-amber-300" />
              <h3 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">
                Launch Pipeline
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((stage, idx) => {
                const done = idx < project.pipelineStage;
                const current = idx === project.pipelineStage;
                return (
                  <button
                    key={stage}
                    onClick={() => {
                      updateProject(project.id, { pipelineStage: idx });
                      toast(`Pipeline → ${stage}`, { description: "Stage updated." });
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-hud text-[10px] uppercase tracking-widest transition",
                      done && "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
                      current && "border-amber-300/60 bg-amber-400/20 text-amber-100 box-glow-gold",
                      !done && !current && "border-violet-400/15 bg-white/[0.02] text-violet-300/50 hover:border-amber-300/30",
                    )}
                  >
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[9px]", done && "bg-emerald-400 text-black", current && "bg-amber-400 text-black", !done && !current && "bg-white/10")}>
                      {done ? "✓" : idx + 1}
                    </span>
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-300/20 bg-amber-400/5 p-3">
              <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">Current Mission</div>
              <div className="text-sm text-amber-50">{project.mission}</div>
            </div>
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-3">
              <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/70">Next Action</div>
              <div className="text-sm text-amber-50">{project.nextAction}</div>
            </div>
          </div>

          {/* progress */}
          <div className="mb-5">
            <div className="mb-1 flex justify-between font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
              <span>Progress</span>
              <span className="text-amber-300/70">{project.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress}
              onChange={(e) => updateProject(project.id, { progress: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-400" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* assigned agents */}
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <Bot size={13} className="text-amber-300" />
              <h3 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">
                Assigned Agents
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.assignedAgents.map((aid) => {
                const a = agents.find((x) => x.id === aid);
                if (!a) return null;
                return (
                  <div key={aid} className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-white/5 px-2.5 py-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${a.color}22` }}>
                      <DynIcon name={a.icon} size={11} style={{ color: a.color }} />
                    </div>
                    <div>
                      <div className="text-xs text-amber-50">{a.name}</div>
                      <div className="font-hud text-[8px] uppercase tracking-wider text-violet-300/50">{a.permission}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* blockers */}
          {project.blockers.length > 0 && (
            <div className="mb-5 rounded-xl border border-red-400/25 bg-red-400/5 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <ShieldCheck size={13} className="text-red-300" />
                <span className="font-hud text-[10px] uppercase tracking-widest text-red-300/80">Blockers</span>
              </div>
              {project.blockers.map((b, i) => (
                <div key={i} className="text-xs text-red-100">· {b}</div>
              ))}
            </div>
          )}

          {/* notes */}
          <div className="mb-5">
            <div className="mb-1.5 font-hud text-[10px] uppercase tracking-widest text-violet-300/60">Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => updateProject(project.id, { notes })}
              rows={3}
              className="w-full rounded-xl border border-violet-400/20 bg-black/30 p-3 text-sm text-amber-50 placeholder:text-violet-300/40 focus:border-amber-300/50 focus:outline-none"
              placeholder="Capture context, decisions, specs…"
            />
          </div>

          {/* links */}
          {project.links.length > 0 && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Link2 size={12} className="text-amber-300" />
                <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">Links</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    className="flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-white/5 px-2.5 py-1 text-xs text-amber-200 transition hover:border-amber-300/40"
                  >
                    <Link2 size={11} /> {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ActionBtn icon={Bot} label="Ask Builder" onClick={() => toast("Builder Agent engaged", { description: "Drafting a spec for this project." })} />
            <ActionBtn icon={ListChecks} label="Gen Tasks" onClick={() => toast("Tasks generated", { description: "5 sub-tasks added to the queue." })} />
            <ActionBtn icon={DollarSign} label="Create Offer" onClick={() => { setSection("cashflow"); onClose(); }} />
            <ActionBtn icon={Workflow} label="To Forge" onClick={() => { setSection("workflows"); onClose(); }} />
          </div>
          <button
            onClick={() => {
              updateProject(project.id, { status: "archived" });
              toast("Project archived", { description: "Branch fossilized." });
              onClose();
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-400/20 py-2 text-xs text-violet-200/60 transition hover:border-red-400/40 hover:text-red-200"
          >
            <Archive size={13} /> Archive Project
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bot;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-violet-400/20 bg-white/5 px-2 py-3 text-xs text-violet-100/80 transition hover:border-amber-300/40 hover:bg-amber-400/5 hover:text-amber-100"
    >
      <Icon size={16} className="text-amber-300" />
      <span className="font-hud text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}
