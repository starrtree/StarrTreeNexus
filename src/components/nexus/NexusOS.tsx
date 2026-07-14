"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexus, type SectionId } from "@/store/nexusStore";
import { ParticleField } from "./ParticleField";
import { BootSequence } from "./BootSequence";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandDock } from "./CommandDock";
import { IntelligencePanel } from "./IntelligencePanel";
import { GestureControl } from "./GestureControl";
import { CloudSync } from "./CloudSync";
import { NexusHome } from "./screens/NexusHome";
import { StarrMap } from "./screens/StarrMap";
import { MissionControl } from "./screens/MissionControl";
import { ProjectRooms } from "./screens/ProjectRooms";
import { AgentBay } from "./screens/AgentBay";
import { WorkflowForge } from "./screens/WorkflowForge";
import { CashflowCockpit } from "./screens/CashflowCockpit";
import { IdeaIncubator } from "./screens/IdeaIncubator";
import { KnowledgeVault } from "./screens/KnowledgeVault";
import { Settings } from "./screens/Settings";

const SECTION_ORDER: SectionId[] = [
  "home",
  "starrmap",
  "mission",
  "projects",
  "agents",
  "workflows",
  "cashflow",
  "incubator",
  "vault",
  "settings",
];

const STARRBOARD_TITLE = "S★T☆A✪R✦R✧B✰O✯A✶R✵D";

export function NexusOS() {
  const booted = useNexus((s) => s.booted);
  const section = useNexus((s) => s.section);
  const setSection = useNexus((s) => s.setSection);
  const focusMode = useNexus((s) => s.focusMode);
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const motionLevel = useNexus((s) => s.settings.motionLevel);
  const themeMode = useNexus((s) => s.settings.themeMode);

  const [mobileNav, setMobileNav] = useState(false);
  const [mobileIntel, setMobileIntel] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("starrboard-light-root", themeMode === "light");
    document.body.classList.toggle("starrboard-light-body", themeMode === "light");

    // The only valid scroll surface is the app's internal <main>. Keep the document pinned.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove("starrboard-light-root");
      document.body.classList.remove("starrboard-light-body");
    };
  }, [themeMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (typing) return;
      if (e.key === "Escape") {
        setFocusMode(false);
        setCommandOpen(false);
        setSelectedProject(null);
        setMobileNav(false);
        setMobileIntel(false);
      }
      if (e.key === " ") {
        e.preventDefault();
        // pulse starrseed — just a fun toast
      }
      // arrow nav between sections
      if (e.key === "ArrowRight") {
        const i = SECTION_ORDER.indexOf(section);
        setSection(SECTION_ORDER[(i + 1) % SECTION_ORDER.length]);
      }
      if (e.key === "ArrowLeft") {
        const i = SECTION_ORDER.indexOf(section);
        setSection(SECTION_ORDER[(i - 1 + SECTION_ORDER.length) % SECTION_ORDER.length]);
      }
      if (e.key.toLowerCase() === "f") {
        setFocusMode(!focusMode);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section, focusMode, setSection, setFocusMode, setCommandOpen, setSelectedProject]);

  const renderSection = () => {
    switch (section) {
      case "home":
        return <NexusHome />;
      case "starrmap":
        return <StarrMap />;
      case "mission":
        return <MissionControl />;
      case "projects":
        return <ProjectRooms />;
      case "agents":
        return <AgentBay />;
      case "workflows":
        return <WorkflowForge />;
      case "cashflow":
        return <CashflowCockpit />;
      case "incubator":
        return <IdeaIncubator />;
      case "vault":
        return <KnowledgeVault />;
      case "settings":
        return <Settings />;
      default:
        return <NexusHome />;
    }
  };

  return (
    <div
      className={`starrboard-shell ${motionLevel === "reduced" || motionLevel === "minimal" ? "reduce-motion" : ""} ${
        themeMode === "light" ? "starrboard-light" : ""
      }`}
    >
      <CloudSync />
      <ParticleField intensity={useNexus.getState().settings.themeIntensity} />

      <AnimatePresence>
        {!booted && <BootSequence />}
      </AnimatePresence>

      {booted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="starrboard-ui flex h-full min-h-0 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Sidebar — desktop */}
            <div className="hidden h-full w-[248px] shrink-0 lg:block">
              <Sidebar />
            </div>

            {/* Sidebar — mobile drawer */}
            <AnimatePresence>
              {mobileNav && (
                <motion.div
                  className="fixed inset-0 z-[90] lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
                  <motion.div
                    initial={{ x: -260 }}
                    animate={{ x: 0 }}
                    exit={{ x: -260 }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    className="absolute left-0 top-0 h-full w-[260px]"
                  >
                    <Sidebar onNav={() => setMobileNav(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center column */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Topbar onMenu={() => setMobileNav(true)} />
              <main
                className={`nexus-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 ${
                  focusMode ? "relative" : ""
                }`}
              >
                {/* Focus mode dim overlay for side panels is handled by layout below */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    {renderSection()}
                  </motion.div>
                </AnimatePresence>

                {/* footer */}
                <footer className="mt-8 flex flex-col items-center gap-1 py-6 text-center">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: "radial-gradient(circle,#fde047,#fbbf24,transparent 70%)" }}
                      />
                    </div>
                    <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-violet-300/50">
                      {STARRBOARD_TITLE}
                    </span>
                  </div>
                  <p className="font-hud text-[9px] uppercase tracking-widest text-violet-300/30">
                    Command the branches · Build the future · Local + cloud sync
                  </p>
                </footer>
              </main>

              <CommandDock />
            </div>

            {/* Intelligence panel — desktop */}
            {!focusMode && (
              <div className="hidden h-full w-[320px] shrink-0 xl:block">
                <IntelligencePanel />
              </div>
            )}

            {/* Intelligence panel — mobile drawer */}
            <AnimatePresence>
              {mobileIntel && !focusMode && (
                <motion.div
                  className="fixed inset-0 z-[90] xl:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileIntel(false)} />
                  <motion.div
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    exit={{ x: 320 }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    className="absolute right-0 top-0 h-full w-[300px]"
                  >
                    <IntelligencePanel onClose={() => setMobileIntel(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile intel toggle floating button */}
          {!focusMode && (
            <button
              onClick={() => setMobileIntel(true)}
              className="fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/15 text-amber-200 backdrop-blur transition hover:bg-amber-400/25 xl:hidden"
              title="Live Intel"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ●
              </motion.span>
            </button>
          )}

          {/* Gesture control floating panel */}
          <GestureControl />

          {/* Focus mode badge */}
          <AnimatePresence>
            {focusMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-1/2 top-4 z-40 -translate-x-1/2 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-1.5 backdrop-blur"
              >
                <span className="font-hud text-[10px] uppercase tracking-widest text-amber-200">
                  Focus Mode · press Esc to exit
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
