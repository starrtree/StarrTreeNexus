"use client";

import { Lightbulb, Rocket, Sprout } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";

export function MissionBacklog() {
  const ideas = useNexus((s) => s.ideas);
  const promoteIdea = useNexus((s) => s.promoteIdea);

  const sorted = [...ideas].sort((a, b) => (b.impact + b.cash + b.brand + b.urgency - b.effort) - (a.impact + a.cash + a.brand + a.urgency - a.effort));

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Mission Backlog" subtitle="raw ideas waiting for agent assignment" icon={<Lightbulb size={16} />} />
        <p className="text-sm text-violet-100/65">
          This replaces the old idea incubator. Ideas here should become missions assigned to UNI Core, Builder, Automation Architect, Content Engine, or another agent.
        </p>
      </GlassCard>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((idea) => {
          const score = idea.impact + idea.cash + idea.brand + idea.urgency - idea.effort;
          return (
            <GlassCard key={idea.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-amber-50">{idea.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-violet-100/60">{idea.details}</p>
                </div>
                <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-center">
                  <div className="font-hud text-lg font-bold text-amber-100">{score}</div>
                  <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Score</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-1.5 text-center font-hud text-[8px] uppercase tracking-widest text-violet-100/55">
                <Stat label="Impact" value={idea.impact} />
                <Stat label="Cash" value={idea.cash} />
                <Stat label="Effort" value={idea.effort} />
                <Stat label="Brand" value={idea.brand} />
                <Stat label="Urgent" value={idea.urgency} />
              </div>
              <button
                onClick={() => promoteIdea(idea.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Rocket size={13} /> Promote to Mission
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-violet-400/15 bg-black/20 px-1 py-2">
      <div className="flex items-center justify-center gap-1 text-amber-100"><Sprout size={10} /> {value}</div>
      <div className="mt-1 text-[7px] text-violet-300/45">{label}</div>
    </div>
  );
}
