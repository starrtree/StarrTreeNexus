export type AgentStatus = "idle" | "working" | "collaborating" | "planning" | "blocked" | "standby" | "offline";
export type MissionStatus = "queued" | "planning" | "executing" | "waiting" | "testing" | "blocked" | "complete";
export type DepartmentStatus = "active" | "calm" | "blocked" | "planning";
export type AutonomyLevel = "manual" | "suggest" | "draft" | "execute_with_approval";

export interface Department {
  id: string;
  name: string;
  short: string;
  purpose: string;
  color: string;
  status: DepartmentStatus;
  x: number;
  y: number;
  w: number;
  h: number;
  agentIds: string[];
}

export interface StarrBaseAgentRuntime {
  agentId: string;
  departmentId: string;
  avatar: string;
  status: AgentStatus;
  currentMissionId: string | null;
  activeProcess: string;
  lastOutput: string;
  autonomyLevel: AutonomyLevel;
  memorySources: string[];
  position: { x: number; y: number };
}

export interface AgentMission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: "low" | "medium" | "high" | "urgent";
  leadAgentId: string;
  supportAgentIds: string[];
  departmentId: string;
  inputs: string[];
  outputs: string[];
  blockers: string[];
  progress: number;
  createdAt: number;
  updatedAt: number;
}

export interface AgentCollaboration {
  id: string;
  missionId: string;
  agentIds: string[];
  type: "handoff" | "pairing" | "review" | "pipeline";
  status: "live" | "queued" | "paused" | "complete";
  roomId: string;
  handoffHistory: string[];
}

export interface ToolConnection {
  id: string;
  name: string;
  category: "AI" | "Code" | "Automation" | "Data" | "Comms" | "Creative" | "Money";
  status: "connected" | "planned" | "manual" | "blocked";
  assignedAgentIds: string[];
  notes: string;
}

export interface MemoryZone {
  id: string;
  name: string;
  description: string;
  sourceCount: number;
  assignedAgentIds: string[];
  status: "indexed" | "needs_sync" | "planned";
}

export const departments: Department[] = [
  { id: "command-core", name: "Command Core", short: "CORE", purpose: "Route intent, assign missions, coordinate the whole agent workforce.", color: "#fbbf24", status: "active", x: 36, y: 28, w: 28, h: 22, agentIds: ["uni-core"] },
  { id: "builder-bay", name: "Builder Bay", short: "BUILD", purpose: "Code, product specs, QA passes, deployment readiness.", color: "#10b981", status: "active", x: 5, y: 8, w: 28, h: 22, agentIds: ["builder", "qa-sentinel"] },
  { id: "automation-lab", name: "Automation Lab", short: "AUTO", purpose: "n8n, Make, webhooks, recurring workflows, agent toolchains.", color: "#22d3ee", status: "planning", x: 67, y: 8, w: 28, h: 22, agentIds: ["automation-architect"] },
  { id: "outreach-war-room", name: "Outreach War Room", short: "LEADS", purpose: "Lead research, prospect scoring, proposals, follow-up drafts.", color: "#f59e0b", status: "calm", x: 5, y: 38, w: 28, h: 22, agentIds: ["lead-scout"] },
  { id: "education-dome", name: "Education Dome", short: "EDU", purpose: "AI curriculum, StarrDome lessons, youth learning experiences.", color: "#38bdf8", status: "planning", x: 67, y: 38, w: 28, h: 22, agentIds: ["curriculum-architect"] },
  { id: "creative-studio", name: "Creative Studio", short: "CREATE", purpose: "Music rollouts, visuals, social content, brand media production.", color: "#ec4899", status: "active", x: 5, y: 68, w: 28, h: 22, agentIds: ["content-engine", "music-ops"] },
  { id: "memory-vault", name: "Memory Vault", short: "MEMORY", purpose: "Docs, SOPs, brand knowledge, context libraries, research archives.", color: "#a78bfa", status: "active", x: 36, y: 62, w: 28, h: 25, agentIds: ["librarian"] },
  { id: "cashflow-office", name: "Cashflow Office", short: "MONEY", purpose: "Offers, pricing, invoices, retainers, fastest-revenue paths.", color: "#fde047", status: "calm", x: 67, y: 68, w: 28, h: 22, agentIds: ["cashflow-agent"] },
];

export const agentRuntimes: StarrBaseAgentRuntime[] = [
  { agentId: "uni-core", departmentId: "command-core", avatar: "✦", status: "collaborating", currentMissionId: "m-starrbase-upgrade", activeProcess: "Coordinating StarrBase agent architecture.", lastOutput: "Converted dashboard direction into agent operating model.", autonomyLevel: "draft", memorySources: ["StarrTree Overview", "Products & Services Menu", "n8n Info"], position: { x: 50, y: 39 } },
  { agentId: "builder", departmentId: "builder-bay", avatar: "⬢", status: "working", currentMissionId: "m-starrbase-upgrade", activeProcess: "Building agent HQ interface and store model.", lastOutput: "Prepared component architecture for StarrBase map.", autonomyLevel: "execute_with_approval", memorySources: ["Repo Context", "Vibe Coding Research", "StarrBoard State"], position: { x: 17, y: 17 } },
  { agentId: "qa-sentinel", departmentId: "builder-bay", avatar: "◆", status: "collaborating", currentMissionId: "m-starrbase-upgrade", activeProcess: "Scanning for broken imports and load risks.", lastOutput: "Flagged hand-control removal and light-mode scroll risks.", autonomyLevel: "draft", memorySources: ["Build Logs", "Deployment Rules"], position: { x: 25, y: 22 } },
  { agentId: "automation-architect", departmentId: "automation-lab", avatar: "✺", status: "planning", currentMissionId: "m-agent-tool-dock", activeProcess: "Mapping n8n and Make workflows into future agent tools.", lastOutput: "Outlined Tool Dock permissions and approval gates.", autonomyLevel: "draft", memorySources: ["n8n Info", "Custom GPT Actions", "Automation Checklists"], position: { x: 82, y: 18 } },
  { agentId: "lead-scout", departmentId: "outreach-war-room", avatar: "◉", status: "idle", currentMissionId: "m-lead-pipeline", activeProcess: "Waiting for target niche and city filters.", lastOutput: "Queued building-renovation outreach workflow.", autonomyLevel: "suggest", memorySources: ["Niche & Value Proposition", "Outreach Tracker"], position: { x: 19, y: 49 } },
  { agentId: "curriculum-architect", departmentId: "education-dome", avatar: "✧", status: "planning", currentMissionId: "m-starrdome-module", activeProcess: "Drafting AI education module structure.", lastOutput: "Mapped StarrDome learn-create-share loop.", autonomyLevel: "draft", memorySources: ["StarrDome", "Unication", "Edunicreation"], position: { x: 82, y: 49 } },
  { agentId: "content-engine", departmentId: "creative-studio", avatar: "✶", status: "working", currentMissionId: "m-content-system", activeProcess: "Turning agent platform updates into content angles.", lastOutput: "Generated 3 site positioning hooks.", autonomyLevel: "draft", memorySources: ["Brand Assets", "Music Plans", "Website Design"], position: { x: 15, y: 78 } },
  { agentId: "music-ops", departmentId: "creative-studio", avatar: "♪", status: "standby", currentMissionId: null, activeProcess: "Standing by for release date and asset package.", lastOutput: "Release checklist waiting on final masters.", autonomyLevel: "suggest", memorySources: ["Music Services", "Release Notes"], position: { x: 25, y: 82 } },
  { agentId: "librarian", departmentId: "memory-vault", avatar: "◈", status: "working", currentMissionId: "m-memory-index", activeProcess: "Indexing StarrTree docs into operational memory zones.", lastOutput: "Tagged AI, education, automation, website, and services docs.", autonomyLevel: "draft", memorySources: ["Google Drive", "Knowledge Files", "Supabase State"], position: { x: 50, y: 73 } },
  { agentId: "cashflow-agent", departmentId: "cashflow-office", avatar: "$", status: "idle", currentMissionId: "m-offer-stack", activeProcess: "Waiting for offer priority decision.", lastOutput: "Ranked custom AI assistants and automation builds as fastest path.", autonomyLevel: "suggest", memorySources: ["Products & Services", "Payment System", "Offer Notes"], position: { x: 82, y: 79 } },
];

export const agentMissions: AgentMission[] = [
  { id: "m-starrbase-upgrade", title: "Build StarrBase Agent HQ", description: "Replace general project dashboard with a visual AI agent headquarters for missions, rooms, tools, and memory.", status: "executing", priority: "urgent", leadAgentId: "builder", supportAgentIds: ["uni-core", "qa-sentinel", "librarian"], departmentId: "builder-bay", inputs: ["User upgrade prompt", "Current StarrBoard repo", "StarrTree brand docs"], outputs: ["StarrBase map", "Agent-first navigation", "Mission queue", "Tool dock"], blockers: [], progress: 68, createdAt: Date.now() - 1000 * 60 * 60 * 3, updatedAt: Date.now() - 1000 * 60 * 7 },
  { id: "m-agent-tool-dock", title: "Design Agent Tool Dock", description: "Define which agents can use GitHub, n8n, Make, Google Drive, Supabase, Vercel, Gmail, and creative tools.", status: "planning", priority: "high", leadAgentId: "automation-architect", supportAgentIds: ["uni-core", "librarian"], departmentId: "automation-lab", inputs: ["n8n workflow docs", "Custom action docs", "Current integrations"], outputs: ["Tool permission matrix", "Approval gate model"], blockers: ["Need final list of live connectors to expose inside app"], progress: 34, createdAt: Date.now() - 1000 * 60 * 60 * 8, updatedAt: Date.now() - 1000 * 60 * 22 },
  { id: "m-memory-index", title: "Organize StarrTree Memory Vault", description: "Turn scattered brand, education, automation, website, service, and workflow docs into agent-readable memory zones.", status: "executing", priority: "high", leadAgentId: "librarian", supportAgentIds: ["uni-core"], departmentId: "memory-vault", inputs: ["StarrTree docs", "Products & Services", "Notion outline", "Automation docs"], outputs: ["Memory zones", "Agent source assignments", "Index health"], blockers: [], progress: 52, createdAt: Date.now() - 1000 * 60 * 60 * 15, updatedAt: Date.now() - 1000 * 60 * 31 },
  { id: "m-starrdome-module", title: "StarrDome Youth AI Module", description: "Draft a youth-facing AI creation module using the Learn-Create-Share flywheel.", status: "planning", priority: "medium", leadAgentId: "curriculum-architect", supportAgentIds: ["content-engine"], departmentId: "education-dome", inputs: ["StarrDome strategy", "Shoot With A Camera", "AI Club notes"], outputs: ["Module outline", "Project prompt", "Parent-safe outcomes"], blockers: [], progress: 28, createdAt: Date.now() - 1000 * 60 * 60 * 26, updatedAt: Date.now() - 1000 * 60 * 60 },
  { id: "m-lead-pipeline", title: "Building-Renovation Lead Pipeline", description: "Prepare outreach sequence and lead filters for building, renovation, HVAC, architecture, and construction clients.", status: "queued", priority: "medium", leadAgentId: "lead-scout", supportAgentIds: ["cashflow-agent", "automation-architect"], departmentId: "outreach-war-room", inputs: ["Niche & value proposition", "Apollo/Instantly stack", "Local market"], outputs: ["Prospect filter set", "Podcast invite email", "Discovery call pitch"], blockers: ["Need preferred city/region for first sweep"], progress: 18, createdAt: Date.now() - 1000 * 60 * 60 * 34, updatedAt: Date.now() - 1000 * 60 * 60 * 4 },
  { id: "m-offer-stack", title: "AI Services Offer Stack", description: "Rank and package StarrTree AI services into sellable offers with pricing, deliverables, and next actions.", status: "waiting", priority: "high", leadAgentId: "cashflow-agent", supportAgentIds: ["content-engine", "lead-scout"], departmentId: "cashflow-office", inputs: ["Products & Services menu", "Payment system", "Current client lanes"], outputs: ["Offer ladder", "Pricing cards", "Payment links later"], blockers: ["Need decision: custom GPTs first or automation builds first"], progress: 42, createdAt: Date.now() - 1000 * 60 * 60 * 40, updatedAt: Date.now() - 1000 * 60 * 9 },
  { id: "m-content-system", title: "Agent Platform Content System", description: "Create a content rhythm around building StarrBoard, agent systems, AI education, music, and visual tech.", status: "testing", priority: "medium", leadAgentId: "content-engine", supportAgentIds: ["music-ops", "uni-core"], departmentId: "creative-studio", inputs: ["StarrTree identity", "Recent site upgrades", "Music/AI brand lanes"], outputs: ["Post concepts", "Behind-the-build captions", "Launch clips"], blockers: [], progress: 57, createdAt: Date.now() - 1000 * 60 * 60 * 9, updatedAt: Date.now() - 1000 * 60 * 14 },
];

export const collaborations: AgentCollaboration[] = [
  { id: "col-build-qa", missionId: "m-starrbase-upgrade", agentIds: ["builder", "qa-sentinel", "uni-core"], type: "review", status: "live", roomId: "builder-bay", handoffHistory: ["UNI Core interpreted request", "Builder drafted UI architecture", "QA Sentinel scanning load risks"] },
  { id: "col-memory-orch", missionId: "m-memory-index", agentIds: ["librarian", "uni-core"], type: "handoff", status: "live", roomId: "memory-vault", handoffHistory: ["Librarian tagged source docs", "UNI Core assigns memory to agents"] },
  { id: "col-lead-money", missionId: "m-lead-pipeline", agentIds: ["lead-scout", "cashflow-agent", "automation-architect"], type: "pipeline", status: "queued", roomId: "outreach-war-room", handoffHistory: ["Lead Scout queues targets", "Cashflow Agent validates offer fit", "Automation Architect designs campaign workflow"] },
];

export const toolConnections: ToolConnection[] = [
  { id: "tool-openai", name: "OpenAI / ChatGPT", category: "AI", status: "manual", assignedAgentIds: ["uni-core", "builder", "content-engine", "curriculum-architect"], notes: "Reasoning, drafting, future tool-calling engine." },
  { id: "tool-github", name: "GitHub / Codex", category: "Code", status: "connected", assignedAgentIds: ["builder", "qa-sentinel"], notes: "Repo inspection, commits, build handoff." },
  { id: "tool-vercel", name: "Vercel", category: "Code", status: "manual", assignedAgentIds: ["builder", "qa-sentinel"], notes: "Deployment review and production status." },
  { id: "tool-supabase", name: "Supabase", category: "Data", status: "connected", assignedAgentIds: ["uni-core", "librarian"], notes: "Cloud state save for StarrBoard." },
  { id: "tool-n8n", name: "n8n", category: "Automation", status: "planned", assignedAgentIds: ["automation-architect", "lead-scout", "cashflow-agent"], notes: "Future workflow execution layer." },
  { id: "tool-make", name: "Make.com", category: "Automation", status: "planned", assignedAgentIds: ["automation-architect"], notes: "Quick webhook/action prototypes." },
  { id: "tool-drive", name: "Google Drive", category: "Data", status: "planned", assignedAgentIds: ["librarian", "curriculum-architect"], notes: "Memory source sync and document retrieval." },
  { id: "tool-gmail", name: "Gmail / Calendar", category: "Comms", status: "planned", assignedAgentIds: ["lead-scout", "personal-ops-guide", "cashflow-agent"], notes: "Future outbound drafts, scheduling, reminders." },
  { id: "tool-adobe", name: "Adobe / Canva", category: "Creative", status: "manual", assignedAgentIds: ["content-engine", "music-ops"], notes: "Visual production and media assets." },
  { id: "tool-stripe", name: "Stripe", category: "Money", status: "manual", assignedAgentIds: ["cashflow-agent"], notes: "Payment links and revenue tracking later." },
];

export const memoryZones: MemoryZone[] = [
  { id: "mem-brand", name: "Brand Core", description: "StarrTree identity, symbols, website direction, tone, products.", sourceCount: 8, assignedAgentIds: ["uni-core", "content-engine", "builder"], status: "indexed" },
  { id: "mem-automation", name: "Automation SOPs", description: "n8n, Make, custom actions, webhooks, error handling, Airtable/Sheets patterns.", sourceCount: 7, assignedAgentIds: ["automation-architect", "lead-scout"], status: "indexed" },
  { id: "mem-education", name: "Education + StarrDome", description: "Youth AI programs, StarrDome, Unication, Edunicreation, curriculum models.", sourceCount: 6, assignedAgentIds: ["curriculum-architect", "uni-core"], status: "indexed" },
  { id: "mem-code", name: "Codebase Context", description: "StarrBoard repository, deployment rules, Supabase state, UI decisions.", sourceCount: 4, assignedAgentIds: ["builder", "qa-sentinel"], status: "needs_sync" },
  { id: "mem-cashflow", name: "Offers + Cashflow", description: "Products, services, payment setup, pricing, sales lanes.", sourceCount: 5, assignedAgentIds: ["cashflow-agent", "lead-scout"], status: "indexed" },
  { id: "mem-media", name: "Music + Creative Assets", description: "Music releases, visual projects, creative direction, content systems.", sourceCount: 5, assignedAgentIds: ["content-engine", "music-ops"], status: "planned" },
];
