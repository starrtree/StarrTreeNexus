"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexus } from "@/store/nexusStore";

export function BootSequence() {
  const setBooted = useNexus((s) => s.setBooted);
  const motionLevel = useNexus((s) => s.settings.motionLevel);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (motionLevel === "minimal") {
      const t = setTimeout(() => setBooted(true), 400);
      return () => clearTimeout(t);
    }
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2900),
      setTimeout(() => setBooted(true), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [motionLevel]);

  const skip = () => setBooted(true);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#05030d]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(109,40,217,0.25), transparent 60%)",
        }}
      />

      <button
        onClick={skip}
        className="absolute right-5 top-5 z-20 rounded-full border border-amber-300/30 px-4 py-1.5 text-xs font-hud uppercase tracking-widest text-amber-200/80 transition hover:border-amber-300/70 hover:text-amber-100"
      >
        Skip Intro
      </button>

      {/* StarrSeed core forming */}
      <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[420px] sm:w-[420px]">
        {/* expanding rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: "rgba(251,191,36,0.35)" }}
            initial={{ width: 20, height: 20, opacity: 0 }}
            animate={
              phase >= 1
                ? { width: 120 + i * 90, height: 120 + i * 90, opacity: [0, 0.8, 0] }
                : {}
            }
            transition={{
              duration: 2.4,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* tree branches forming */}
        {phase >= 2 &&
          Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
            return (
              <motion.svg
                key={i}
                className="absolute"
                width="420"
                height="420"
                viewBox="-210 -210 420 420"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
              >
                <motion.path
                  d={`M0,0 Q${Math.cos(angle) * 60},${Math.sin(angle) * 60} ${Math.cos(angle) * 170},${Math.sin(angle) * 170}`}
                  stroke="url(#bootGrad)"
                  strokeWidth={1.6}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.8 }}
                />
                <motion.circle
                  cx={Math.cos(angle) * 170}
                  cy={Math.sin(angle) * 170}
                  r={4}
                  fill={["#8b5cf6", "#38bdf8", "#ec4899", "#c026d3", "#10b981", "#fbbf24", "#a78bfa", "#f59e0b", "#22d3ee"][i]}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.3 + 0.1 * i, duration: 0.5 }}
                />
              </motion.svg>
            );
          })}

        <svg className="absolute" width="0" height="0">
          <defs>
            <linearGradient id="bootGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* the seed */}
        <motion.div
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
          style={{
            background:
              "radial-gradient(circle, #fde047 0%, #fbbf24 40%, #f59e0b 70%, transparent 100%)",
            boxShadow:
              "0 0 40px rgba(251,191,36,0.9), 0 0 90px rgba(251,191,36,0.5)",
          }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="h-3 w-3 rounded-full bg-white sm:h-4 sm:w-4"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* title */}
      <div className="relative z-10 mt-2 flex flex-col items-center px-6 text-center">
        <AnimatePresence mode="wait">
          {phase >= 3 && (
            <motion.h1
              key="title"
              initial={{ opacity: 0, y: 20, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
              transition={{ duration: 0.9 }}
              className="font-hud text-2xl font-bold uppercase text-amber-100 text-glow-gold sm:text-4xl"
            >
              StarrTree Nexus OS
            </motion.h1>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {phase >= 4 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-3 font-hud text-xs uppercase tracking-[0.4em] text-violet-200/80 sm:text-sm"
            >
              Command the branches · Build the future
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* loading bar */}
      <div className="absolute bottom-16 h-[3px] w-56 overflow-hidden rounded-full bg-white/10 sm:w-72">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,#fbbf24,#8b5cf6,#38bdf8)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: phase >= 4 ? "100%" : phase >= 3 ? "70%" : phase >= 2 ? "40%" : "15%" }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <div className="absolute bottom-8 font-hud text-[10px] uppercase tracking-[0.3em] text-white/40">
        Initializing neural tree…
      </div>
    </motion.div>
  );
}
