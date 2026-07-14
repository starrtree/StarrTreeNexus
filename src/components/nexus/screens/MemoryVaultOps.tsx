"use client";

import { BookMarked, Database, FileText, RefreshCw } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  indexed: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  needs_sync: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  planned: "border-sky-300/40 bg-sky-400/10 text-sky-100",
};

export function MemoryVaultOps() {
  const zones = useNexus((s) => s.memoryZones);
  const knowledge = useNexus((s) => s.knowledge);
  const agents = useNexus((s) => s.agents);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSection = useNexus((s) => s.setSection);
  const requestCloudSync = useNexus((s) => s.requestCloudSync);

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle
          title="Memory Vault"
          subtitle="agent-readable knowledge zones"
          icon={<BookMarked size={16} />}
          right={
            <button
              onClick={() => requestCloudSync()}
              className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Sync State
            </button>
          }
        />
        <p className="text-sm text-violet-100/65">
          This is the memory architecture for StarrBase. Each zone represents a knowledge area that agents can use for decisions, drafts, workflows, and future retrieval.
        </p>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-3 md:grid-cols-2">
          {zones.map((zone) => (
            <GlassCard key={zone.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-amber-50">{zone.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-violet-100/60">{zone.description}</p>
                </div>
                <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", statusTone[zone.status])}>{zone.status.replace("_", " ")}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                  <div className="font-hud text-lg font-bold text-amber-100">{zone.sourceCount}</div>
                  <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Sources</div>
                </div>
                <div className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                  <div className="font-hud text-lg font-bold text-amber-100">{zone.assignedAgentIds.length}</div>
                  <div className="font-hud text-[8px] uppercase tracking-widest text-violet-300/45">Agents</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {zone.assignedAgentIds.map((agentId) => {
                  const agent = agents.find((a) => a.id === agentId);
                  return (
                    <button
                      key={agentId}
                      onClick={() => {
                        setSelectedAgent(agentId);
                        setSection("agents");
                      }}
                      className="rounded-full border border-violet-400/20 bg-white/5 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60 transition hover:border-amber-300/35 hover:text-amber-100"
                    >
                      {agent?.name ?? agentId}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-4">
          <GlassCard glow="purple">
            <PanelTitle title="Existing Sources" subtitle="current local knowledge" icon={<Database size={16} />} />
            <div className="space-y-2">
              {knowledge.map((source) => (
                <div key={source.id} className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-amber-50">{source.name}</span>
                    <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{source.type}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-violet-100/55">{source.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Next Memory Upgrade" subtitle="future build" icon={<RefreshCw size={16} />} />
            <div className="space-y-2 text-sm leading-relaxed text-violet-100/65">
              <p>Connect Google Drive and tag source docs automatically.</p>
              <p>Let Librarian summarize each memory zone for UNI Core.</p>
              <p>Show which sources each answer or agent decision used.</p>
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Rule" subtitle="agent memory hygiene" icon={<FileText size={16} />} />
            <p className="text-sm leading-relaxed text-violet-100/65">
              Agents should not just remember everything. Each agent should receive the smallest useful context for its mission so StarrBase stays fast and focused.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
