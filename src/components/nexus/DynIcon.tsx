"use client";

import {
  BrainCircuit,
  GraduationCap,
  Music,
  Clapperboard,
  Cog,
  TrendingUp,
  User,
  Handshake,
  Workflow,
  Sparkles,
  Hammer,
  Radar,
  Coins,
  Library,
  ShieldCheck,
  FileText,
  StickyNote,
  Upload,
  Cloud,
  BookOpen,
  Github,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  BrainCircuit,
  GraduationCap,
  Music,
  Clapperboard,
  Cog,
  TrendingUp,
  User,
  Handshake,
  Workflow,
  Sparkles,
  Hammer,
  Radar,
  Coins,
  Library,
  ShieldCheck,
  FileText,
  StickyNote,
  Upload,
  Cloud,
  BookOpen,
  Github,
};

export function DynIcon({
  name,
  className,
  size,
  style,
}: {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  const Cmp = map[name] ?? Sparkles;
  return <Cmp className={className} size={size} style={style} />;
}
