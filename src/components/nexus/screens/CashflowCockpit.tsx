"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Zap,
  TrendingUp,
  Target,
  ArrowUpRight,
  Rocket,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { branches, cashflowLanes } from "@/data/mockData";
import { GlassCard, PanelTitle, MiniBar } from "../shared";
import { DynIcon } from "../DynIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CashflowCockpit() {
  const setSection = useNexus((s) => s.setSection);

  const totalPotential = cashflowLanes.reduce((a, l) => a + l.potentialMonthly, 0);
  const totalHigh = cashflowLanes.filter((l) => l.confidence >= 70).reduce((a, l) => a + l.potentialMonthly, 0);
  const fastest = [...cashflowLanes].sort((a, b) => b.confidence - a.confidence)[0];
  const maxPotential = Math.max(...cashflowLanes.map((l) => l.potentialMonthly));

  return (
    <div className="space-y-4">
      {/* hero meter */}
      <GlassCard gold glow="gold">
        <PanelTitle title="Cashflow Cockpit" subtitle="Revenue command center" icon={<DollarSign size={16} />} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {/* meter */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-400/10 to-violet-500/5 p-5">
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative">
              <div className="font-hud text-[9px] uppercase tracking-widest text-amber-300/70">
                Total Monthly Potential
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-amber-50 text-glow-gold">
                  ${(totalPotential / 1000).toFixed(1)}k
                </span>
                <span className="font-hud text-sm text-violet-200/60">/mo</span>
              </div>
              <div className="mt-1 flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-emerald-300">
                <ArrowUpRight size={11} /> ${(totalHigh / 1000).toFixed(1)}k high-confidence
              </div>

              {/* meter bar */}
              <div className="mt-4">
                <div className="mb-1 flex justify-between font-hud text-[9px] uppercase tracking-widest text-violet-300/50">
                  <span>Cashflow Meter</span>
                  <span>{Math.round((totalHigh / totalPotential) * 100)}% locked</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalHigh / totalPotential) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#fbbf24,#10b981)",
                      boxShadow: "0 0 12px rgba(251,191,36,0.6)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/5 bg-black/20 p-2">
                  <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Active Lanes</div>
                  <div className="text-lg font-bold text-amber-200">{cashflowLanes.length}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-black/20 p-2">
                  <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Selling Now</div>
                  <div className="text-lg font-bold text-emerald-300">
                    {cashflowLanes.filter((l) => l.stage === "Selling").length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* fastest money move */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-amber-400/5 p-5">
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20">
                  <Zap size={16} className="text-emerald-300" />
                </div>
                <div>
                  <div className="font-hud text-[9px] uppercase tracking-widest text-emerald-300/70">
                    Fastest Money Move
                  </div>
                  <div className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
                    {fastest.offer}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/5 bg-black/20 p-2">
                  <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Price</div>
                  <div className="text-sm font-bold text-amber-200">{fastest.priceRange}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-black/20 p-2">
                  <div className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">Confidence</div>
                  <div className="text-sm font-bold text-emerald-300">{fastest.confidence}%</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-violet-100/70">{fastest.nextSalesAction}</p>
              <button
                onClick={() => toast("Offer builder queued", { description: `${fastest.offer} → launch pipeline.` })}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:from-emerald-300 hover:to-emerald-400"
              >
                <Rocket size={13} /> Execute Move
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* lanes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cashflowLanes.map((lane, i) => {
          const branch = branches.find((b) => b.id === lane.branch)!;
          const pct = Math.round((lane.potentialMonthly / maxPotential) * 100);
          return (
            <motion.div
              key={lane.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass relative overflow-hidden rounded-2xl p-4"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-2xl"
                style={{ background: branch.color }}
              />
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${branch.color}22`, border: `1px solid ${branch.color}55` }}
                  >
                    <DynIcon name={branch.icon} size={13} style={{ color: branch.color }} />
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest",
                      lane.stage === "Selling"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : lane.stage === "Offer ready"
                          ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
                          : "border-violet-400/30 bg-violet-400/10 text-violet-200",
                    )}
                  >
                    {lane.stage}
                  </span>
                </div>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-amber-50">{lane.offer}</h3>
              <p className="mb-2 line-clamp-1 text-[11px] text-violet-100/60">{lane.idealClient}</p>

              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-hud text-base font-bold text-amber-200">{lane.priceRange}</span>
                <span className="font-hud text-[10px] text-violet-300/50">~${(lane.potentialMonthly / 1000).toFixed(1)}k/mo</span>
              </div>

              <div className="mb-2">
                <div className="mb-1 flex justify-between font-hud text-[8px] uppercase tracking-widest text-violet-300/50">
                  <span>Revenue potential</span>
                  <span>{pct}%</span>
                </div>
                <MiniBar value={pct} color={branch.color} />
              </div>

              <div className="mb-2 rounded-lg border border-white/5 bg-black/20 p-2">
                <div className="flex items-center gap-1 font-hud text-[8px] uppercase tracking-widest text-amber-300/60">
                  <Target size={9} /> Next sales action
                </div>
                <div className="text-[11px] text-amber-100/80">{lane.nextSalesAction}</div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">Confidence</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lane.confidence}%`,
                      background: lane.confidence >= 70 ? "#10b981" : lane.confidence >= 50 ? "#fbbf24" : "#a78bfa",
                    }}
                  />
                </div>
                <span className="font-hud text-[9px] text-amber-300/70">{lane.confidence}%</span>
              </div>

              <button
                onClick={() => {
                  setSection("projects");
                  toast("Building offer", { description: `${lane.offer} → Project Room.` });
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-400/10 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/20"
              >
                <TrendingUp size={12} /> Build Offer
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
