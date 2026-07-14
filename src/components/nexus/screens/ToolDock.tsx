"use client";

import { Cpu, LockKeyhole, PlugZap, Workflow } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  connected: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  planned: "border-sky-300/40 bg-sky-400/10 text-sky-100",
  manual: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  blocked: "border-red-300/40 bg-red-400/10 text-red-100",
};

export function ToolDock() {
  const tools = useNexus((s) => s.toolConnections);
  const agents = useNexus((s) => s.agents);
  const workflows = useNexus((s) => s.workflows);
  const setSelectedAgent = useNexus((s) => s.setSelectedAgent);
  const setSection = useNexus((s) => s.setSection);

  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Tool Dock" subtitle="future agent execution permissions" icon={<PlugZap size={16} />} />
        <p className="text-sm text-violet-100/65">
          StarrBoard is not calling all tools directly yet. This dock defines what each agent should eventually be allowed to use and which integrations are connected, manual, planned, or blocked.
        </p>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {categories.map((category) => (
            <GlassCard key={category}>
              <PanelTitle title={`${category} Tools`} subtitle="assigned by agent role" icon={<Cpu size={16} />} />
              <div className="grid gap-3 md:grid-cols-2">
                {tools.filter((tool) => tool.category === category).map((tool) => (
                  <div key={tool.id} className="rounded-2xl border border-violet-400/15 bg-white/[0.025] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-amber-50">{tool.name}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-violet-100/60">{tool.notes}</p>
                      </div>
                      <span className={cn("rounded-full border px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest", statusTone[tool.status])}>{tool.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tool.assignedAgentIds.map((agentId) => {
                        const agent = agents.find((a) => a.id === agentId);
                        return (
                          <button
                            key={agentId}
                            onClick={() => {
                              setSelectedAgent(agentId);
                              setSection("agents");
                            }}
                            className="rounded-full border border-violet-400/20 bg-black/20 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60 transition hover:border-amber-300/35 hover:text-amber-100"
                          >
                            {agent?.name ?? agentId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-4">
          <GlassCard glow="purple">
            <PanelTitle title="Automation Blueprints" subtitle="workflow-to-agent bridge" icon={<Workflow size={16} />} />
            <div className="space-y-3">
              {workflows.map((workflow) => {
                const agent = agents.find((a) => a.id === workflow.agent);
                return (
                  <div key={workflow.id} className="rounded-xl border border-violet-400/15 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-amber-50">{workflow.name}</h3>
                      <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/50">{workflow.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-violet-100/55">{workflow.trigger}</p>
                    <div className="mt-2 flex items-center justify-between font-hud text-[8px] uppercase tracking-widest text-violet-300/45">
                      <span>{agent?.name ?? workflow.agent}</span>
                      <span>{workflow.approvalGate ? "approval gate" : "auto"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <PanelTitle title="Safety Model" subtitle="MVP rule" icon={<LockKeyhole size={16} />} />
            <div className="space-y-2 text-sm leading-relaxed text-violet-100/65">
              <p>Agents can be visualized, assigned, and planned.</p>
              <p>Real external actions should stay approval-gated until each connector is tested.</p>
              <p>Builder and QA can touch code. Money and outbound comms stay manual or approval-only.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
