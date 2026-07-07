"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/data/mockData";

export function GlassCard({
  className,
  children,
  gold,
  glow,
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
  gold?: boolean;
  glow?: "gold" | "purple" | "emerald" | "red";
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-4",
        gold ? "glass-gold" : "glass",
        glow === "gold" && "box-glow-gold",
        glow === "purple" && "box-glow-purple",
        glow === "emerald" && "box-glow-emerald",
        glow === "red" && "box-glow-red",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon && <div className="text-amber-300">{icon}</div>}
        <div>
          <h2 className="font-hud text-sm font-bold uppercase tracking-widest text-amber-100">
            {title}
          </h2>
          {subtitle && (
            <p className="font-hud text-[10px] uppercase tracking-widest text-violet-300/50">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  idea: { label: "Idea", color: "text-violet-200", bg: "bg-violet-400/15", ring: "border-violet-400/30" },
  active: { label: "Active", color: "text-emerald-200", bg: "bg-emerald-400/15", ring: "border-emerald-400/30" },
  blocked: { label: "Blocked", color: "text-red-200", bg: "bg-red-400/15", ring: "border-red-400/30" },
  revenue: { label: "Revenue", color: "text-amber-200", bg: "bg-amber-400/15", ring: "border-amber-400/30" },
  agent: { label: "Agent", color: "text-sky-200", bg: "bg-sky-400/15", ring: "border-sky-400/30" },
  decision: { label: "Decision", color: "text-white", bg: "bg-white/15", ring: "border-white/40" },
  archived: { label: "Archived", color: "text-violet-300/40", bg: "bg-white/5", ring: "border-white/10" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-hud text-[9px] uppercase tracking-widest",
        m.color,
        m.bg,
        m.ring,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function HealthRing({
  value,
  size = 44,
  color = "#10b981",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-hud text-[10px] font-bold text-amber-100">{value}</span>
        {label && <span className="font-hud text-[7px] uppercase tracking-wider text-violet-300/50">{label}</span>}
      </div>
    </div>
  );
}

export function MiniBar({ value, color = "#fbbf24" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
