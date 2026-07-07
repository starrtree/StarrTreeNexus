"use client";

import { motion } from "framer-motion";
import {
  Home,
  Network,
  Crosshair,
  FolderKanban,
  Bot,
  Workflow,
  DollarSign,
  Lightbulb,
  BookMarked,
  Settings as SettingsIcon,
  Command as CommandIcon,
} from "lucide-react";
import { useNexus, type SectionId } from "@/store/nexusStore";
import { cn } from "@/lib/utils";

const NAV: {
  id: SectionId;
  label: string;
  icon: typeof Home;
  hint: string;
}[] = [
  { id: "home", label: "Nexus Home", icon: Home, hint: "Mission control" },
  { id: "starrmap", label: "StarrMap", icon: Network, hint: "Living tree" },
  { id: "mission", label: "Mission Control", icon: Crosshair, hint: "Top moves" },
  { id: "projects", label: "Project Rooms", icon: FolderKanban, hint: "Build pipeline" },
  { id: "agents", label: "Agent Bay", icon: Bot, hint: "AI hangar" },
  { id: "workflows", label: "Workflow Forge", icon: Workflow, hint: "Automations" },
  { id: "cashflow", label: "Cashflow Cockpit", icon: DollarSign, hint: "Revenue" },
  { id: "incubator", label: "Idea Incubator", icon: Lightbulb, hint: "Plant seeds" },
  { id: "vault", label: "Knowledge Vault", icon: BookMarked, hint: "Memory" },
  { id: "settings", label: "Settings", icon: SettingsIcon, hint: "Calibrate" },
];

export function Sidebar({ onNav }: { onNav?: () => void }) {
  const section = useNexus((s) => s.section);
  const setSection = useNexus((s) => s.setSection);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);

  return (
    <aside className="glass relative flex h-full w-full flex-col rounded-r-2xl border-l-0">
      {/* root glow line */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-amber-300/0 via-amber-300/60 to-violet-500/0" />

      {/* brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-9 w-9 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle,#fde047 0%,#fbbf24 50%,transparent 75%)",
              boxShadow: "0 0 18px rgba(251,191,36,0.8)",
            }}
          />
          <div className="relative h-3 w-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
        </div>
        <div className="leading-tight">
          <div className="font-hud text-sm font-bold uppercase tracking-[0.18em] text-amber-100">
            StarrTree
          </div>
          <div className="font-hud text-[10px] uppercase tracking-[0.3em] text-violet-300/70">
            Nexus OS
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      {/* nav */}
      <nav className="nexus-scroll flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {NAV.map((item, i) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                <button
                  onClick={() => {
                    setSection(item.id);
                    onNav?.();
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    active
                      ? "bg-gradient-to-r from-amber-400/20 to-violet-500/10 text-amber-100"
                      : "text-violet-100/70 hover:bg-white/5 hover:text-amber-100",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-300 to-violet-400"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition",
                      active ? "text-amber-300" : "text-violet-300/70 group-hover:text-amber-200",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.label}</div>
                    <div className="truncate font-hud text-[9px] uppercase tracking-widest text-violet-300/40">
                      {item.hint}
                    </div>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24]" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      {/* command hint */}
      <div className="px-3 py-3">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-violet-400/20 bg-white/5 px-3 py-2 text-left transition hover:border-amber-300/40 hover:bg-white/10"
        >
          <span className="flex items-center gap-2 text-xs text-violet-100/70">
            <CommandIcon size={13} className="text-amber-300" />
            Command
          </span>
          <kbd className="font-hud rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[9px] text-violet-200/70">
            ⌘K
          </kbd>
        </button>
      </div>
    </aside>
  );
}
