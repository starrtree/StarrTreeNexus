"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Command as CommandIcon,
  Maximize2,
  Minimize2,
  Activity,
  Wifi,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  home: "StarrBase",
  starrmap: "Agent Network",
  mission: "Mission Queue",
  projects: "Mission Queue",
  agents: "Agent Bay",
  workflows: "Tool Dock",
  cashflow: "Cashflow Office",
  incubator: "Mission Backlog",
  vault: "Memory Vault",
  settings: "Settings",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const section = useNexus((s) => s.section);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);
  const focusMode = useNexus((s) => s.focusMode);
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 rounded-b-2xl px-4 py-2.5">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-violet-100/80 transition hover:bg-white/10 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2">
        <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-violet-300/50">
          StarrBase /
        </span>
        <motion.span
          key={section}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-hud text-sm font-semibold uppercase tracking-[0.18em] text-amber-100"
        >
          {SECTION_LABELS[section] ?? section}
        </motion.span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 sm:flex">
          <Pill icon={Activity} label="AGENTS ONLINE" color="emerald" />
          <Pill icon={Wifi} label="CLOUD SYNC" color="violet" />
        </div>

        <button
          onClick={() => setFocusMode(!focusMode)}
          className={cn(
            "rounded-lg border p-1.5 transition",
            focusMode
              ? "border-amber-300/50 bg-amber-400/15 text-amber-200"
              : "border-violet-400/20 bg-white/5 text-violet-200/70 hover:border-amber-300/40",
          )}
          title="Focus Mode (F)"
        >
          {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-white/5 px-2.5 py-1.5 text-xs text-violet-100/80 transition hover:border-amber-300/40 hover:text-amber-100"
        >
          <CommandIcon size={14} className="text-amber-300" />
          <span className="hidden font-hud uppercase tracking-wider sm:inline">Agent Command</span>
        </button>

        <div className="hidden flex-col items-end md:flex">
          <div className="font-hud text-sm font-semibold text-amber-100">
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
            {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}

function Pill({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Activity;
  label: string;
  color: "emerald" | "violet";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-hud text-[9px] uppercase tracking-widest",
        color === "emerald"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-violet-400/30 bg-violet-400/10 text-violet-200",
      )}
    >
      <Icon size={10} className="animate-pulse" />
      {label}
    </div>
  );
}

export function useFocusKey() {
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const focusMode = useNexus((s) => s.focusMode);
  return { focusMode, setFocusMode, setSection: useNexus((s) => s.setSection) };
}
