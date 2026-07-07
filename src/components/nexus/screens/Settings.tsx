"use client";

import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Sliders,
  Hand,
  Camera,
  Gauge,
  Trash2,
  Database,
  Plug,
  CheckCircle2,
  Eye,
  Sparkles,
} from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { GlassCard, PanelTitle } from "../shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Settings() {
  const settings = useNexus((s) => s.settings);
  const updateSettings = useNexus((s) => s.updateSettings);
  const resetData = useNexus((s) => s.resetData);
  const gesture = useNexus((s) => s.gesture);
  const setGesture = useNexus((s) => s.setGesture);
  const ideas = useNexus((s) => s.ideas);
  const projects = useNexus((s) => s.projects);

  return (
    <div className="space-y-4">
      <GlassCard>
        <PanelTitle title="Settings" subtitle="Calibrate the Nexus" icon={<SettingsIcon size={16} />} />
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theme intensity */}
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

        {/* Motion level */}
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
            Reduced motion respects accessibility while keeping the cosmic feel. Minimal skips the boot sequence.
          </p>
        </GlassCard>

        {/* Hand tracking */}
        <GlassCard>
          <SectionHeader icon={Hand} title="Hand Control" desc="Camera-based gesture input" />
          <div className="space-y-3">
            <Toggle
              label="Enable Hand Tracking"
              desc="Uses your camera locally. No video is stored or sent anywhere."
              on={settings.handTracking}
              onChange={(v) => {
                updateSettings({ handTracking: v });
                setGesture({ enabled: v });
                if (v) toast("Hand Control enabled", { description: "Grant camera permission when prompted." });
              }}
            />
            <div>
              <div className="mb-1 flex items-center justify-between font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
                <span>Gesture Sensitivity</span>
                <span className="text-amber-300/70">{settings.gestureSensitivity}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.gestureSensitivity}
                onChange={(e) => updateSettings({ gestureSensitivity: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-black/20 px-3 py-2">
              <Camera size={13} className="text-amber-300" />
              <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">
                Camera status:
              </span>
              <span className={cn("font-hud text-[10px] uppercase tracking-widest", gesture.enabled ? "text-emerald-300" : "text-violet-300/40")}>
                {gesture.enabled ? "Active (local)" : "Off"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* System status */}
        <GlassCard>
          <SectionHeader icon={Database} title="System Status" desc="Local data + storage" />
          <div className="space-y-2">
            <StatusRow label="Ideas stored" value={`${ideas.length}`} />
            <StatusRow label="Projects stored" value={`${projects.length}`} />
            <StatusRow label="LocalStorage" value="Active" ok />
            <StatusRow label="Backend" value="Not required" />
            <StatusRow label="Secrets in browser" value="None" ok />
          </div>
          <button
            onClick={() => {
              if (confirm("Reset all local data? This restores mock data and clears your ideas/projects/settings.")) {
                resetData();
                toast("Data reset", { description: "Nexus restored to defaults." });
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-400/30 bg-red-400/10 py-2 text-xs text-red-200 transition hover:bg-red-400/20"
          >
            <Trash2 size={13} /> Reset Local Data
          </button>
        </GlassCard>
      </div>

      {/* Future API placeholders */}
      <GlassCard glow="purple">
        <SectionHeader icon={Plug} title="Future API Connections" desc="Placeholders for later wiring" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { name: "OpenAI / LLM", desc: "Power UNI Core + agents with real reasoning.", icon: Sparkles },
            { name: "GitHub", desc: "Builder Agent opens branches + PRs.", icon: Plug },
            { name: "Google Drive", desc: "Librarian syncs files into the Vault.", icon: Database },
            { name: "Notion", desc: "Mirror workspaces as vault entries.", icon: Database },
            { name: "Stripe", desc: "Cashflow Agent tracks real invoices.", icon: Plug },
            { name: "Calendar", desc: "Personal Ops Guide schedules blocks.", icon: Gauge },
          ].map((api) => (
            <div
              key={api.name}
              className="flex items-start gap-3 rounded-xl border border-violet-400/15 bg-white/[0.02] p-3"
            >
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
          <Eye size={11} /> Nothing connects externally yet. All data stays local + mocked for now.
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

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between rounded-xl border border-violet-400/20 bg-black/20 p-3 text-left transition hover:border-amber-300/30"
    >
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-sm font-medium text-amber-50">{label}</div>
        <div className="text-[11px] text-violet-100/60">{desc}</div>
      </div>
      <div
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          on ? "bg-amber-400" : "bg-white/15",
        )}
      >
        <motion.div
          layout
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          style={{ left: on ? "calc(100% - 1.375rem)" : "0.125rem" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2">
      <span className="font-hud text-[10px] uppercase tracking-widest text-violet-300/60">{label}</span>
      <span className={cn("flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest", ok ? "text-emerald-300" : "text-amber-300/70")}>
        {ok && <CheckCircle2 size={11} />}
        {value}
      </span>
    </div>
  );
}
