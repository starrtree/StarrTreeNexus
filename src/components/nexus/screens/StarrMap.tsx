"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Crosshair,
  X,
  Sparkles,
  Activity,
  GitBranch,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { branches, type Project, type ProjectStatus } from "@/data/mockData";
import { DynIcon } from "../DynIcon";
import { StatusBadge } from "../shared";

const STATUS_COLOR: Record<ProjectStatus, string> = {
  idea: "#a78bfa",
  active: "#10b981",
  blocked: "#ef4444",
  revenue: "#fbbf24",
  agent: "#38bdf8",
  decision: "#ffffff",
  archived: "#4b5563",
};

const STATUS_RING: Record<ProjectStatus, string> = {
  idea: "seed",
  active: "leaf",
  blocked: "crystal",
  revenue: "ring",
  agent: "drone",
  decision: "halo",
  archived: "fossil",
};

export function StarrMap() {
  const projects = useNexus((s) => s.projects);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const setSection = useNexus((s) => s.setSection);
  const setSelectedBranch = useNexus((s) => s.setSelectedBranch);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ type: "branch" | "project"; id: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Layout: center core, branches radiate, projects orbit their branch
  const layout = useMemo(() => {
    const cx = 0;
    const cy = 0;
    const branchRadius = 220;
    const projectRadius = 70;
    return branches.map((b) => {
      const a = ((b.angle + rot) * Math.PI) / 180;
      const bx = cx + Math.cos(a) * branchRadius;
      const by = cy + Math.sin(a) * branchRadius;
      const bProjects = projects.filter((p) => p.branch === b.id);
      const pNodes = bProjects.map((p, i) => {
        const pa = (i / Math.max(bProjects.length, 1)) * Math.PI * 2;
        return {
          project: p,
          x: bx + Math.cos(pa) * projectRadius,
          y: by + Math.sin(pa) * projectRadius,
        };
      });
      return { branch: b, bx, by, a, projects: pNodes };
    });
  }, [projects, rot]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }, [pan]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.px + (e.clientX - dragRef.current.x),
      y: dragRef.current.py + (e.clientY - dragRef.current.y),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  const selectedProject = selected?.type === "project"
    ? projects.find((p) => p.id === selected.id)
    : null;
  const selectedBranch = selected?.type === "branch"
    ? branches.find((b) => b.id === selected.id)
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Map */}
      <div
        className="glass relative h-[58vh] overflow-hidden rounded-2xl lg:h-[72vh]"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={(e) => {
          e.preventDefault();
          setZoom((z) => Math.min(2.5, Math.max(0.4, z - e.deltaY * 0.001)));
        }}
      >
        {/* grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <svg
          viewBox="-340 -340 680 680"
          className="h-full w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: dragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <defs>
            <radialGradient id="coreGrad">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="branchGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* branches */}
          {layout.map(({ branch, bx, by }) => {
            const path = `M0,0 Q${bx * 0.5},${by * 0.5} ${bx},${by}`;
            return (
              <g key={branch.id}>
                <path
                  d={path}
                  stroke={branch.color}
                  strokeWidth={1.5}
                  fill="none"
                  opacity={0.5}
                  filter="url(#glow)"
                />
                <path
                  d={path}
                  stroke="url(#branchGrad)"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="6 10"
                  className="animate-flow"
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* project connection lines to branch */}
          {layout.flatMap(({ branch, bx, by, projects: ps }) =>
            ps.map((pn, i) => (
              <line
                key={`${branch.id}-${i}`}
                x1={bx}
                y1={by}
                x2={pn.x}
                y2={pn.y}
                stroke={STATUS_COLOR[pn.project.status]}
                strokeWidth={0.6}
                opacity={0.4}
              />
            )),
          )}

          {/* cross-links between related projects (status based) */}
          {projects.length > 4 && (
            <>
              <line x1={layout[0].projects[0]?.x ?? 0} y1={layout[0].projects[0]?.y ?? 0}
                x2={layout[5]?.projects[0]?.x ?? 0} y2={layout[5]?.projects[0]?.y ?? 0}
                stroke="#fbbf24" strokeWidth={0.4} opacity={0.2} strokeDasharray="2 4" />
              <line x1={layout[2]?.projects[0]?.x ?? 0} y1={layout[2]?.projects[0]?.y ?? 0}
                x2={layout[4]?.projects[0]?.x ?? 0} y2={layout[4]?.projects[0]?.y ?? 0}
                stroke="#ec4899" strokeWidth={0.4} opacity={0.2} strokeDasharray="2 4" />
            </>
          )}

          {/* core */}
          <g>
            <circle r={50} fill="url(#coreGrad)" opacity={0.6} className="animate-breathe" />
            <circle r={26} fill="#fde047" opacity={0.9} filter="url(#glow)" />
            <circle r={14} fill="#fff" />
            <circle r={50} fill="none" stroke="#fbbf24" strokeWidth={0.5} opacity={0.4} className="animate-orbit-slow" strokeDasharray="3 6" />
            <circle r={70} fill="none" stroke="#8b5cf6" strokeWidth={0.4} opacity={0.3} className="animate-orbit-med" strokeDasharray="2 8" />
          </g>

          {/* branch nodes */}
          {layout.map(({ branch, bx, by }) => (
            <g
              key={branch.id}
              transform={`translate(${bx},${by})`}
              className="cursor-pointer"
              onMouseEnter={() => setHoverNode(`b-${branch.id}`)}
              onMouseLeave={() => setHoverNode(null)}
              onClick={() => {
                setSelected({ type: "branch", id: branch.id });
                setSelectedBranch(branch.id);
              }}
            >
              <circle r={16} fill={`${branch.color}33`} stroke={branch.color} strokeWidth={1} opacity={hoverNode === `b-${branch.id}` ? 1 : 0.7} />
              <circle r={22} fill="none" stroke={branch.color} strokeWidth={0.5} opacity={0.3} className="animate-orbit-slow" strokeDasharray="2 4" />
              <foreignObject x={-8} y={-8} width={16} height={16} style={{ pointerEvents: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                  <DynIcon name={branch.icon} size={11} style={{ color: "#fff" }} />
                </div>
              </foreignObject>
              <text y={30} textAnchor="middle" fill={branch.color} fontSize={8} className="font-hud" style={{ letterSpacing: "0.1em" }}>
                {branch.short}
              </text>
            </g>
          ))}

          {/* project nodes */}
          {layout.flatMap(({ projects: ps }) =>
            ps.map((pn, i) => (
              <ProjectNode
                key={`${pn.project.id}-${i}`}
                project={pn.project}
                x={pn.x}
                y={pn.y}
                hover={hoverNode === `p-${pn.project.id}`}
                onHover={(h) => setHoverNode(h ? `p-${pn.project.id}` : null)}
                onClick={() => {
                  setSelected({ type: "project", id: pn.project.id });
                  setSelectedProject(pn.project.id);
                }}
              />
            )),
          )}
        </svg>

        {/* controls */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          <CtrlBtn icon={ZoomIn} onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))} />
          <CtrlBtn icon={ZoomOut} onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))} />
          <CtrlBtn icon={RotateCw} onClick={() => setRot((r) => r + 40)} active={autoOrbit} />
          <CtrlBtn
            icon={Maximize}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
              setRot(0);
            }}
          />
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-violet-400/20 bg-black/40 px-3 py-1.5 backdrop-blur">
          <GitBranch size={12} className="text-amber-300" />
          <span className="font-hud text-[9px] uppercase tracking-widest text-violet-200/70">
            {branches.length} branches · {projects.length} nodes
          </span>
        </div>

        {/* legend */}
        <div className="absolute bottom-3 right-3 flex flex-wrap gap-1.5 rounded-lg border border-violet-400/20 bg-black/40 p-2 backdrop-blur">
          {([
            ["seed", "#a78bfa", "Idea"],
            ["leaf", "#10b981", "Active"],
            ["crystal", "#ef4444", "Blocked"],
            ["ring", "#fbbf24", "Revenue"],
            ["drone", "#38bdf8", "Agent"],
            ["halo", "#ffffff", "Decision"],
          ] as const).map(([k, c, l]) => (
            <div key={k} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
              <span className="font-hud text-[8px] uppercase tracking-wider text-violet-200/60">{l}</span>
            </div>
          ))}
        </div>

        {/* auto-orbit toggle */}
        <button
          onClick={() => setAutoOrbit((v) => !v)}
          className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 backdrop-blur transition ${
            autoOrbit
              ? "border-amber-300/40 bg-amber-400/15 text-amber-200"
              : "border-violet-400/20 bg-black/40 text-violet-200/60"
          }`}
        >
          <RotateCw size={11} className={autoOrbit ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
          <span className="font-hud text-[9px] uppercase tracking-widest">
            {autoOrbit ? "Orbit On" : "Orbit Off"}
          </span>
        </button>
      </div>

      {/* detail panel */}
      <div className="glass rounded-2xl p-4">
        <AnimatePresence mode="wait">
          {!selected && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-breathe" />
                <Crosshair size={24} className="relative text-amber-300" />
              </div>
              <div className="font-hud text-xs uppercase tracking-widest text-amber-100">
                Select a Node
              </div>
              <p className="mt-1 text-xs text-violet-200/60">
                Click any branch or project node to inspect it. Drag to pan, scroll to zoom.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <Tip label="Drag" desc="Pan map" />
                <Tip label="Scroll" desc="Zoom" />
                <Tip label="Click" desc="Select node" />
                <Tip label="Space" desc="Pulse core" />
              </div>
            </motion.div>
          )}

          {selectedBranch && (
            <motion.div
              key={`b-${selectedBranch.id}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${selectedBranch.color}22`, border: `1px solid ${selectedBranch.color}55` }}
                  >
                    <DynIcon name={selectedBranch.icon} size={18} style={{ color: selectedBranch.color }} />
                  </div>
                  <div>
                    <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
                      {selectedBranch.name}
                    </div>
                    <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                      Branch Node
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-violet-300/50 hover:bg-white/10 hover:text-amber-100">
                  <X size={14} />
                </button>
              </div>
              <p className="mb-3 text-xs text-violet-100/70">{selectedBranch.summary}</p>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <Mini label="Health" value={`${selectedBranch.health}`} color="emerald" />
                <Mini label="Momentum" value={`${selectedBranch.momentum}`} color="amber" />
              </div>

              <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-400/5 p-2.5">
                <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">Next Best Action</div>
                <div className="text-xs text-amber-50">{selectedBranch.nextBestAction}</div>
              </div>

              {selectedBranch.blockers.length > 0 && (
                <div className="mb-3 rounded-xl border border-red-400/20 bg-red-400/5 p-2.5">
                  <div className="mb-1 font-hud text-[9px] uppercase tracking-widest text-red-300/70">Blockers</div>
                  {selectedBranch.blockers.map((b, i) => (
                    <div key={i} className="text-xs text-red-100">· {b}</div>
                  ))}
                </div>
              )}

              <div className="mb-3">
                <div className="mb-1.5 font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  Projects ({projects.filter((p) => p.branch === selectedBranch.id).length})
                </div>
                <div className="space-y-1">
                  {projects.filter((p) => p.branch === selectedBranch.id).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected({ type: "project", id: p.id })}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs text-violet-100/80 transition hover:bg-white/5 hover:text-amber-100"
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[p.status] }} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSection("mission")}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400/20 to-violet-500/20 py-2 text-xs font-semibold text-amber-100 transition hover:from-amber-400/30 hover:to-violet-500/30"
              >
                <Sparkles size={13} /> Open Mission Control
              </button>
            </motion.div>
          )}

          {selectedProject && (
            <motion.div
              key={`p-${selectedProject.id}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    <StatusBadge status={selectedProject.status} />
                  </div>
                  <div className="font-hud text-sm font-bold text-amber-100">{selectedProject.title}</div>
                  <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                    {branches.find((b) => b.id === selectedProject.branch)?.name}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-violet-300/50 hover:bg-white/10 hover:text-amber-100">
                  <X size={14} />
                </button>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex justify-between font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  <span>Progress</span>
                  <span className="text-amber-300/70">{selectedProject.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-400" style={{ width: `${selectedProject.progress}%` }} />
                </div>
              </div>

              <p className="mb-3 text-xs text-violet-100/70">{selectedProject.mission}</p>

              <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-400/5 p-2.5">
                <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">Next Action</div>
                <div className="text-xs text-amber-50">{selectedProject.nextAction}</div>
              </div>

              {selectedProject.blockers.length > 0 && (
                <div className="mb-3 rounded-xl border border-red-400/20 bg-red-400/5 p-2.5">
                  <div className="mb-1 font-hud text-[9px] uppercase tracking-widest text-red-300/70">Blockers</div>
                  {selectedProject.blockers.map((b, i) => (
                    <div key={i} className="text-xs text-red-100">· {b}</div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSection("projects")}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-400"
              >
                <Activity size={13} /> Open Project Room
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProjectNode({
  project,
  x,
  y,
  hover,
  onHover,
  onClick,
}: {
  project: Project;
  x: number;
  y: number;
  hover: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
}) {
  const color = STATUS_COLOR[project.status];
  const kind = STATUS_RING[project.status];
  return (
    <g
      transform={`translate(${x},${y})`}
      className="cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* status-specific visuals */}
      {kind === "halo" && (
        <circle r={12} fill="none" stroke="#fff" strokeWidth={0.8} opacity={0.6} className="animate-halo" />
      )}
      {kind === "ring" && (
        <circle r={11} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} />
      )}
      {kind === "drone" && (
        <g className="animate-orbit-fast">
          <circle r={10} fill="none" stroke={color} strokeWidth={0.6} strokeDasharray="2 3" opacity={0.7} />
        </g>
      )}
      {kind === "crystal" && (
        <polygon points="0,-7 6,-2 4,5 -4,5 -6,-2" fill={color} opacity={0.5} stroke={color} strokeWidth={0.8} />
      )}

      <circle
        r={hover ? 7 : 5}
        fill={color}
        opacity={hover ? 1 : 0.85}
        filter="url(#glow)"
        style={{ transition: "r 0.2s" }}
      />
      <circle r={2} fill="#fff" opacity={0.9} />

      {hover && (
        <g>
          <rect x={-40} y={-26} width={80} height={14} rx={3} fill="rgba(5,3,13,0.9)" stroke={color} strokeWidth={0.5} />
          <text y={-16} textAnchor="middle" fill="#fde047" fontSize={6} className="font-hud">
            {project.title.length > 16 ? project.title.slice(0, 15) + "…" : project.title}
          </text>
        </g>
      )}
    </g>
  );
}

function CtrlBtn({
  icon: Icon,
  onClick,
  active,
}: {
  icon: typeof ZoomIn;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur transition ${
        active
          ? "border-amber-300/40 bg-amber-400/15 text-amber-200"
          : "border-violet-400/20 bg-black/40 text-violet-200/70 hover:border-amber-300/40 hover:text-amber-200"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

function Tip({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
      <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">{label}</div>
      <div className="text-[10px] text-violet-200/60">{desc}</div>
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: "emerald" | "amber" }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
      <div className={`font-hud text-lg font-bold ${color === "emerald" ? "text-emerald-300" : "text-amber-300"}`}>
        {value}
      </div>
      <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{label}</div>
    </div>
  );
}
