"use client";

import type { ReactNode } from "react";
import {
  Settings as SettingsIcon,
  Gauge,
  Trash2,
  Database,
  Plug,
  CheckCircle2,
  Eye,
  Sparkles,
  RefreshCw,
  Cloud,
  CloudOff,
  Sun,
  Moon,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Settings() {
  const settings = useNexus((s) => s.settings);
  const updateSettings = useNexus((s) => s.updateSettings);
  const resetData = useNexus((s) => s.resetData);
  const ideas = useNexus((s) => s.ideas);
  const projects = useNexus((s) => s.projects);
  const cloud = useNexus((s) => s.cloud);
  const requestCloudSync = useNexus((s) => s.requestCloudSync);

  const cloudConnected = cloud.status === "connected" || cloud.status === "saving";
  const lastSynced = cloud.lastSynced ? new Date(cloud.lastSynced).toLocaleString() : "Never";

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Settings" subtitle="Calibrate StarrBoard" icon={<SettingsIcon size={16} />} />
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionHeader icon={settings.themeMode === "light" ? Sun : Moon} title="Theme Mode" desc="Dark is the default command environment" />
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((mode) => {
              const active = settings.themeMode === mode;
              const Icon = mode === "light" ? Sun : Moon;
              return (
                <button
                  key={mode}
                  onClick={() => updateSettings({ themeMode: mode })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 font-hud text-[10px] uppercase tracking-widest transition",
                    active
                      ? "border-amber-300/60 bg-amber-400/20 text-amber-100"
                      : "border-violet-400/20 bg-white/5 text-violet-200/60 hover:border-amber-300/30",
                  )}
                >
                  <Icon size={14} /> {mode}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-violet-300/50">
            StarrBoard boots in dark mode by default. Light mode remains available for daytime review.
          </p>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Sparkles} title="Theme Intensity" desc="Glow + saturation strength" />
          <div className="mb-2 flex items-center justify-between font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
            <span>{settings.themeIntensity < 40 ? "Subtle" : settings.themeIntensity < 75 ? "Balanced" : "Vivid"}</span>
            <span className="text-amber-300/70">{settings.themeIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.themeIntensity}
            onChange={(e) => updateSettings({ themeIntensity: Number(e.target.value) })}
            className="w-full accent-amber-400"
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Gauge} title="Motion Level" desc="Animation intensity" />
          <div className="grid grid-cols-3 gap-2">
            {(["full", "reduced", "minimal"] as const).map((m) => (
              <button
                key={m}
                onClick={() => updateSettings({ motionLevel: m })}
                className={cn(
                  "rounded-xl border px-3 py-2.5 font-hud text-[10px] uppercase tracking-widest transition",
                  settings.motionLevel === m
                    ? "border-amber-300/50 bg-amber-400/15 text-amber-200"
                    : "border-violet-400/20 bg-white/5 text-violet-200/60 hover:border-amber-300/30",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-violet-300/50">
            Reduced motion respects accessibility while keeping the cosmic command-center feel.
          </p>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Database} title="System Status" desc="Local data + cloud save" />
          <div className="space-y-2">
            <StatusRow label="Ideas stored" value={`${ideas.length}`} />
            <StatusRow label="Projects stored" value={`${projects.length}`} />
            <StatusRow label="Local save" value="Active" ok />
            <StatusRow
              label="Cloud save"
              value={cloud.status === "saving" ? "Saving" : cloudConnected ? "Connected" : cloud.status === "loading" ? "Loading" : "Disconnected"}
              ok={cloudConnected}
              icon={cloudConnected ? <Cloud size={11} /> : <CloudOff size={11} />}
            />
            <StatusRow label="Last synced" value={lastSynced} ok={cloudConnected} />
            <StatusRow label="Secrets in browser" value="None" ok />
          </div>
          {cloud.error && (
            <p className="mt-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-[11px] text-red-100/75">
              Cloud warning: {cloud.error}
            </p>
          )}
          <button
            onClick={() => {
              requestCloudSync();
              toast("Cloud sync requested", { description: "StarrBoard will save the current state to Supabase." });
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-2 text-xs text-emerald-200 transition hover:bg-emerald-400/20"
          >
            <RefreshCw size={13} /> Sync Now
          </button>
          <button
            onClick={() => {
              if (confirm("Reset all local data? This restores mock data and clears your ideas/projects/settings.")) {
                resetData();
                toast("Data reset", { description: "StarrBoard restored to defaults." });
              }
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-400/30 bg-red-400/10 py-2 text-xs text-red-200 transition hover:bg-red-400/20"
          >
            <Trash2 size={13} /> Reset Local Data
          </button>
        </GlassCard>
      </div>

      <GlassCard glow="purple">
        <SectionHeader icon={Plug} title="Agent Platform Connections" desc="Next systems to wire into StarrBase" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { name: "OpenAI / LLM", desc: "Power UNI Core + agent reasoning.", icon: Sparkles },
            { name: "GitHub", desc: "Builder Agent opens branches + PRs.", icon: Plug },
            { name: "Google Drive", desc: "Librarian Agent organizes files.", icon: Database },
            { name: "Notion", desc: "Knowledge Agent mirrors workspaces.", icon: Database },
            { name: "Stripe", desc: "Cashflow Agent tracks offers and invoices.", icon: Plug },
            { name: "Calendar", desc: "Ops Agent schedules execution blocks.", icon: Gauge },
          ].map((api) => (
            <div key={api.name} className="flex items-start gap-3 rounded-xl border border-violet-400/15 bg-white/[0.02] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 border border-violet-400/25">
                <api.icon size={15} className="text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-amber-50">{api.name}</span>
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-1.5 py-0 font-hud text-[7px] uppercase tracking-widest text-amber-200">
                    Planned
                  </span>
                </div>
                <p className="text-[11px] text-violet-100/60">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-violet-300/50">
          <Eye size={11} /> StarrBoard is being narrowed into an AI-agent operations base.
        </p>
      </GlassCard>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: typeof Sparkles; title: string; desc: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/30">
        <Icon size={15} className="text-amber-300" />
      </div>
      <div>
        <h3 className="font-hud text-[12px] font-bold uppercase tracking-widest text-amber-100">{title}</h3>
        <p className="font-hud text-[9px] uppercase tracking-widest text-violet-300/50">{desc}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok, icon }: { label: string; value: string; ok?: boolean; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
      <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">{label}</span>
      <span className={cn("flex items-center gap-1 text-right font-hud text-[10px] uppercase tracking-widest", ok ? "text-emerald-300" : "text-amber-300/70")}>
        {icon}
        {ok && !icon && <CheckCircle2 size={11} />}
        {value}
      </span>
    </div>
  );
}
