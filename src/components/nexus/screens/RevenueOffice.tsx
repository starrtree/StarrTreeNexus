"use client";

import { Coins, DollarSign, PackageCheck, TrendingUp } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, MiniBar, PanelTitle } from "../shared";

export function RevenueOffice() {
  const cashflow = useNexus((s) => s.cashflow);
  const missions = useNexus((s) => s.agentMissions);
  const agents = useNexus((s) => s.agents);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);
  const setSection = useNexus((s) => s.setSection);

  const cashflowMissions = missions.filter((mission) => mission.departmentId === "cashflow-office" || mission.supportAgentIds.includes("cashflow-agent") || mission.leadAgentId === "cashflow-agent");
  const cashflowAgent = agents.find((a) => a.id === "cashflow-agent");
  const potential = cashflow.reduce((sum, lane) => sum + lane.potentialMonthly, 0);

  return (
    <div className="space-y-4">
      <GlassCard glow="gold">
        <PanelTitle title="Cashflow Office" subtitle="revenue agent headquarters" icon={<Coins size={16} />} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Metric label="Monthly potential" value={`$${potential.toLocaleString()}`} />
          <Metric label="Offer lanes" value={`${cashflow.length}`} />
          <Metric label="Revenue missions" value={`${cashflowMissions.length}`} />
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {cashflow.map((lane) => (
            <GlassCard key={lane.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-amber-50">{lane.offer}</h3>
                  <p className="mt-1 text-sm text-violet-100/60">{lane.idealClient}</p>
                </div>
                <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-right">
                  <div className="font-hud text-sm font-bold text-amber-100">{lane.priceRange}</div>
                  <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Price</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between font-hud text-[8px] uppercase tracking-widest text-violet-300/45">
                  <span>Confidence</span>
                  <span>{lane.confidence}%</span>
                </div>
                <MiniBar value={lane.confidence} color="#fbbf24" />
              </div>
              <div className="mt-3 rounded-xl border border-violet-400/15 bg-black/20 p-3">
                <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Next Sales Action</div>
                <p className="mt-1 text-sm text-violet-100/70">{lane.nextSalesAction}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-4">
          <GlassCard glow="purple">
            <PanelTitle title="Cashflow Agent" subtitle={cashflowAgent?.role ?? "Revenue Ops"} icon={<DollarSign size={16} />} />
            <p className="text-sm leading-relaxed text-violet-100/65">
              This office should eventually watch offers, unpaid invoices, payment links, package pricing, subscription retainers, and quickest-money actions.
            </p>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Revenue Missions" subtitle="offer work queue" icon={<TrendingUp size={16} />} />
            <div className="space-y-2">
              {cashflowMissions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => {
                    setSelectedMission(mission.id);
                    setSection("mission");
                  }}
                  className="w-full rounded-xl border border-violet-400/15 bg-black/20 p-3 text-left transition hover:border-amber-300/35"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-amber-50">{mission.title}</span>
                    <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{mission.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-violet-100/55">{mission.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Next Build" subtitle="money system" icon={<PackageCheck size={16} />} />
            <p className="text-sm leading-relaxed text-violet-100/65">
              Add offer cards, status, payment link fields, next invoice action, and a simple monthly pipeline board. Keep Stripe/API actions manual until fully tested.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-violet-400/15 bg-black/20 px-3 py-2">
      <div className="font-hud text-lg font-bold text-amber-100">{value}</div>
      <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{label}</div>
    </div>
  );
}
