// ============================================================
// STARRTREE NEXUS OS — MOCK DATA
// Edit freely. All UI is driven from this file.
// ============================================================

export type BranchId =
  | "ai"
  | "education"
  | "music"
  | "design"
  | "engineering"
  | "cashflow"
  | "personal"
  | "clients"
  | "automation";

export interface Branch {
  id: BranchId;
  name: string;
  short: string;
  icon: string;
  color: string;
  angle: number;
  health: number;
  momentum: number;
  cashflowPotential: number;
  agents: string[];
  summary: string;
  blockers: string[];
  nextBestAction: string;
}

export type ProjectStatus =
  | "idea"
  | "active"
  | "blocked"
  | "revenue"
  | "agent"
  | "decision"
  | "archived";

export interface Project {
  id: string;
  title: string;
  branch: BranchId;
  status: ProjectStatus;
  progress: number;
  mission: string;
  nextAction: string;
  assignedAgents: string[];
  blockers: string[];
  notes: string;
  pipelineStage: number;
  cashflowPotential: number;
  links: { label: string; url: string }[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  status: "online" | "idle" | "working" | "standby";
  lastAction: string;
  tools: string[];
  permission: "Observer" | "Operator" | "Architect" | "Commander";
  description: string;
  canModifyCode?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  input: string;
  agent: string;
  tools: string[];
  output: string;
  approvalGate: boolean;
  status: "ready" | "running" | "paused" | "draft";
  steps: string[];
}

export interface CashflowLane {
  id: string;
  branch: BranchId;
  offer: string;
  priceRange: string;
  idealClient: string;
  stage: string;
  nextSalesAction: string;
  potentialMonthly: number;
  confidence: number;
}

export interface Idea {
  id: string;
  title: string;
  details: string;
  impact: number;
  cash: number;
  effort: number;
  brand: number;
  urgency: number;
  status: "new" | "build" | "schedule" | "merge" | "content" | "archived";
  createdAt: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: "local" | "future";
  description: string;
  icon: string;
  count: number;
}

export interface SystemAlert {
  id: string;
  level: "info" | "warn" | "critical" | "success";
  agent: string;
  message: string;
  time: string;
}

export const PIPELINE_STAGES = [
  "Idea",
  "Spec",
  "Assets",
  "Build",
  "Test",
  "Offer",
  "Publish",
  "Sell",
  "Improve",
] as const;

// ---------- BRANCHES ----------
export const branches: Branch[] = [
  {
    id: "ai",
    name: "AI Work",
    short: "AI",
    icon: "BrainCircuit",
    color: "#8b5cf6",
    angle: 0,
    health: 82,
    momentum: 88,
    cashflowPotential: 12000,
    agents: ["uni-core", "builder", "automation-architect"],
    summary: "Custom GPTs, automation builds, agent R&D.",
    blockers: ["Need 2 case studies for landing page"],
    nextBestAction: "Ship custom-GPT offer page + 3 demo bots",
  },
  {
    id: "education",
    name: "StarrDome / Education",
    short: "EDU",
    icon: "GraduationCap",
    color: "#38bdf8",
    angle: 40,
    health: 74,
    momentum: 70,
    cashflowPotential: 8000,
    agents: ["curriculum-architect", "content-engine"],
    summary: "Youth AI programs, curriculum, OZI, StarrDome platform.",
    blockers: ["StarrDome pitch deck not finalized"],
    nextBestAction: "Finalize StarrDome pitch deck v2",
  },
  {
    id: "music",
    name: "Music",
    short: "MUS",
    icon: "Music",
    color: "#ec4899",
    angle: 80,
    health: 68,
    momentum: 64,
    cashflowPotential: 4000,
    agents: ["music-ops"],
    summary: "Releases, visuals, creative direction.",
    blockers: ["Release schedule needs locking"],
    nextBestAction: "Lock next 2 release dates + visual treatment",
  },
  {
    id: "design",
    name: "Design & Film",
    short: "DSN",
    icon: "Clapperboard",
    color: "#c026d3",
    angle: 120,
    health: 76,
    momentum: 72,
    cashflowPotential: 6000,
    agents: ["content-engine", "builder"],
    summary: "Brand visuals, film, motion design for StarrTree + clients.",
    blockers: [],
    nextBestAction: "Batch 6 social motion templates",
  },
  {
    id: "engineering",
    name: "Engineering",
    short: "ENG",
    icon: "Cog",
    color: "#10b981",
    angle: 160,
    health: 90,
    momentum: 92,
    cashflowPotential: 9000,
    agents: ["builder", "qa-sentinel", "automation-architect"],
    summary: "Nexus OS, Builder Agent loop, infra, tooling.",
    blockers: [],
    nextBestAction: "Wire Builder Agent self-evolving loop prototype",
  },
  {
    id: "cashflow",
    name: "Cashflow",
    short: "$$$",
    icon: "TrendingUp",
    color: "#fbbf24",
    angle: 200,
    health: 71,
    momentum: 80,
    cashflowPotential: 15000,
    agents: ["cashflow-agent"],
    summary: "Offers, pipelines, invoicing, fastest-money moves.",
    blockers: ["Invoice follow-up workflow not automated"],
    nextBestAction: "Activate Invoice Follow-Up workflow",
  },
  {
    id: "personal",
    name: "Personal Ops",
    short: "OPS",
    icon: "User",
    color: "#a78bfa",
    angle: 240,
    health: 65,
    momentum: 58,
    cashflowPotential: 0,
    agents: ["personal-ops-guide"],
    summary: "Schedule, energy, health, personal focus.",
    blockers: ["Sleep schedule drifting"],
    nextBestAction: "Lock 7-day focus block calendar",
  },
  {
    id: "clients",
    name: "Client Services",
    short: "CLI",
    icon: "Handshake",
    color: "#f59e0b",
    angle: 280,
    health: 78,
    momentum: 84,
    cashflowPotential: 11000,
    agents: ["lead-scout", "builder"],
    summary: "Website refreshes, IT support, retainers.",
    blockers: ["Lead pipeline thin this week"],
    nextBestAction: "Run Website Client Finder workflow",
  },
  {
    id: "automation",
    name: "Automation Lab",
    short: "AUTO",
    icon: "Workflow",
    color: "#22d3ee",
    angle: 320,
    health: 85,
    momentum: 90,
    cashflowPotential: 7000,
    agents: ["automation-architect", "librarian"],
    summary: "Workflow Forge experiments, integrations, agents.",
    blockers: [],
    nextBestAction: "Promote CRM Lead Scout to production",
  },
];

// ---------- PROJECTS ----------
export const projects: Project[] = [
  {
    id: "p-nexus-os",
    title: "StarrTree Nexus OS",
    branch: "engineering",
    status: "active",
    progress: 62,
    mission: "Rebuild the command center into a living cosmic OS.",
    nextAction: "Finish StarrMap 2.0 + gesture control pass",
    assignedAgents: ["builder", "qa-sentinel", "uni-core"],
    blockers: [],
    notes: "Core interface for all StarrTree operations. Self-evolving loop target.",
    pipelineStage: 3,
    cashflowPotential: 0,
    links: [
      { label: "Spec Doc", url: "#" },
      { label: "Repo", url: "#" },
    ],
  },
  {
    id: "p-custom-gpt-offer",
    title: "Custom GPT Offer Page",
    branch: "ai",
    status: "decision",
    progress: 45,
    mission: "Productize custom GPT builds into a sellable offer.",
    nextAction: "Pick price tier + write 3 demo bot briefs",
    assignedAgents: ["cashflow-agent", "content-engine"],
    blockers: ["Need case studies"],
    notes: "Fastest AI cashflow path.",
    pipelineStage: 5,
    cashflowPotential: 6000,
    links: [{ label: "Draft", url: "#" }],
  },
  {
    id: "p-starrdome-deck",
    title: "StarrDome Pitch Deck v2",
    branch: "education",
    status: "active",
    progress: 38,
    mission: "Pitch StarrDome to partners + funders.",
    nextAction: "Write narrative arc + 12 slide outline",
    assignedAgents: ["curriculum-architect", "content-engine"],
    blockers: ["StarrDome pitch deck not finalized"],
    notes: "Education + funding gateway.",
    pipelineStage: 2,
    cashflowPotential: 8000,
    links: [],
  },
  {
    id: "p-website-client",
    title: "Website Refresh — Client A",
    branch: "clients",
    status: "revenue",
    progress: 80,
    mission: "Refresh client site + add AI lead capture.",
    nextAction: "Send invoice + schedule launch review",
    assignedAgents: ["builder", "lead-scout"],
    blockers: [],
    notes: "Active retainer. Upsell automation pack.",
    pipelineStage: 7,
    cashflowPotential: 3500,
    links: [{ label: "Live Preview", url: "#" }],
  },
  {
    id: "p-music-release",
    title: "Next Music Release",
    branch: "music",
    status: "blocked",
    progress: 30,
    mission: "Ship next single + visual treatment.",
    nextAction: "Lock release date",
    assignedAgents: ["music-ops"],
    blockers: ["Release schedule needs locking", "Visuals pending"],
    notes: "Awaiting final masters.",
    pipelineStage: 1,
    cashflowPotential: 1500,
    links: [],
  },
  {
    id: "p-lead-tracker",
    title: "Website Client Lead Tracker",
    branch: "automation",
    status: "idea",
    progress: 10,
    mission: "Auto-track leads from forms into a pipeline.",
    nextAction: "Define fields + connect Website Client Finder",
    assignedAgents: ["automation-architect", "lead-scout"],
    blockers: [],
    notes: "Pairs with CRM Lead Scout workflow.",
    pipelineStage: 0,
    cashflowPotential: 2000,
    links: [],
  },
  {
    id: "p-content-plan",
    title: "7-Day Content Engine Plan",
    branch: "design",
    status: "agent",
    progress: 55,
    mission: "Batch a week of multi-platform content.",
    nextAction: "Review Content Engine draft batch",
    assignedAgents: ["content-engine"],
    blockers: [],
    notes: "Auto-repurposing from releases + offers.",
    pipelineStage: 4,
    cashflowPotential: 1000,
    links: [],
  },
  {
    id: "p-invoice-followup",
    title: "Invoice Follow-Up Automation",
    branch: "cashflow",
    status: "idea",
    progress: 15,
    mission: "Auto-remind unpaid invoices + escalate.",
    nextAction: "Map trigger conditions",
    assignedAgents: ["cashflow-agent"],
    blockers: ["Invoice follow-up workflow not automated"],
    notes: "Direct cashflow recovery.",
    pipelineStage: 1,
    cashflowPotential: 3000,
    links: [],
  },
];

// ---------- AGENTS ----------
export const agents: Agent[] = [
  {
    id: "uni-core",
    name: "UNI Core",
    role: "Central Orchestrator",
    icon: "Sparkles",
    color: "#fbbf24",
    status: "online",
    lastAction: "Routed 3 commands · synced branch health",
    tools: ["Command Router", "All Branches", "Agent Dispatch"],
    permission: "Commander",
    description:
      "The heart of the Nexus. Routes commands, dispatches agents, and keeps the whole tree coherent.",
  },
  {
    id: "builder",
    name: "Builder Agent",
    role: "Self-Evolving Engineer",
    icon: "Hammer",
    color: "#10b981",
    status: "working",
    lastAction: "Drafting spec: gesture control refactor",
    tools: ["Spec Gen", "Code Plans", "GitHub Branches", "Pull Requests"],
    permission: "Architect",
    description:
      "Receives feature requests, generates specs + code plans, opens branches and PRs. Never merges without Max's approval.",
    canModifyCode: true,
  },
  {
    id: "automation-architect",
    name: "Automation Architect",
    role: "Workflow Forge Lead",
    icon: "Workflow",
    color: "#22d3ee",
    status: "online",
    lastAction: "Wired CRM Lead Scout trigger",
    tools: ["Workflow Forge", "Webhooks", "Integrations"],
    permission: "Architect",
    description: "Designs and runs automations across the tree.",
  },
  {
    id: "lead-scout",
    name: "Lead Scout",
    role: "Client Acquisition",
    icon: "Radar",
    color: "#f59e0b",
    status: "idle",
    lastAction: "Found 4 prospects · queued for review",
    tools: ["Web Search", "CRM", "Outreach Drafts"],
    permission: "Operator",
    description: "Hunts website/client leads and pre-qualifies them.",
  },
  {
    id: "cashflow-agent",
    name: "Cashflow Agent",
    role: "Revenue Operations",
    icon: "Coins",
    color: "#fbbf24",
    status: "online",
    lastAction: "Flagged 2 unpaid invoices",
    tools: ["Invoicing", "Offer Builder", "Pipeline"],
    permission: "Operator",
    description: "Tracks offers, invoices, and fastest-money moves.",
  },
  {
    id: "content-engine",
    name: "Content Engine",
    role: "Creative Repurposer",
    icon: "Clapperboard",
    color: "#c026d3",
    status: "working",
    lastAction: "Repurposed release into 6 posts",
    tools: ["Repurposer", "Captions", "Scheduling"],
    permission: "Operator",
    description: "Turns releases + offers into multi-platform content.",
  },
  {
    id: "curriculum-architect",
    name: "Curriculum Architect",
    role: "Education Designer",
    icon: "GraduationCap",
    color: "#38bdf8",
    status: "standby",
    lastAction: "Outlined StarrDome module 3",
    tools: ["Lesson Builder", "Assessment", "OZI Sync"],
    permission: "Operator",
    description: "Builds youth AI curriculum + StarrDome programs.",
  },
  {
    id: "music-ops",
    name: "Music Ops Agent",
    role: "Release Coordinator",
    icon: "Music",
    color: "#ec4899",
    status: "idle",
    lastAction: "Prepped DistroKid draft",
    tools: ["Release Scheduler", "Visuals Queue", "DSP Drafts"],
    permission: "Operator",
    description: "Coordinates releases, visuals, and distribution.",
  },
  {
    id: "librarian",
    name: "Librarian Agent",
    role: "Knowledge Vault Keeper",
    icon: "Library",
    color: "#a78bfa",
    status: "online",
    lastAction: "Indexed 12 new docs",
    tools: ["Vault Index", "Drive Sync", "Tagger"],
    permission: "Operator",
    description: "Organizes the Knowledge Vault and future sync sources.",
  },
  {
    id: "qa-sentinel",
    name: "QA Sentinel",
    role: "Risk + Quality Guard",
    icon: "ShieldCheck",
    color: "#ef4444",
    status: "standby",
    lastAction: "Cleared Builder spec · 0 risks",
    tools: ["Spec Review", "Risk Scan", "Approval Gates"],
    permission: "Architect",
    description: "Reviews Builder Agent specs and guards approvals.",
  },
  {
    id: "personal-ops-guide",
    name: "Personal Ops Guide",
    role: "Focus + Energy",
    icon: "User",
    color: "#a78bfa",
    status: "idle",
    lastAction: "Suggested 90-min focus block",
    tools: ["Calendar", "Energy Log", "Reminders"],
    permission: "Observer",
    description: "Keeps Max's focus, energy, and schedule aligned.",
  },
];

// ---------- WORKFLOWS ----------
export const workflows: Workflow[] = [
  {
    id: "w-crm-lead",
    name: "CRM Lead Scout",
    trigger: "New form submission / daily web sweep",
    input: "Lead form fields + source URL",
    agent: "lead-scout",
    tools: ["Web Search", "CRM"],
    output: "Qualified lead record + outreach draft",
    approvalGate: true,
    status: "ready",
    steps: [
      "Trigger fired · new lead captured",
      "Lead Scout enriches contact data",
      "Auto-score: budget · timeline · fit",
      "Draft outreach message",
      "Approval gate → Max reviews",
      "Push to CRM pipeline",
    ],
  },
  {
    id: "w-client-finder",
    name: "Website Client Finder",
    trigger: "Weekly schedule",
    input: "Niche + geo filters",
    agent: "lead-scout",
    tools: ["Web Search"],
    output: "List of 20 prospects with contact info",
    approvalGate: false,
    status: "ready",
    steps: [
      "Trigger fired · weekly run",
      "Scrape prospect sites",
      "Score by site quality + likely budget",
      "Compile ranked prospect list",
      "Save to Client Services branch",
    ],
  },
  {
    id: "w-content-repurposer",
    name: "Content Repurposer",
    trigger: "New release / new offer published",
    input: "Source asset",
    agent: "content-engine",
    tools: ["Repurposer", "Captions"],
    output: "6 platform-ready posts",
    approvalGate: true,
    status: "running",
    steps: [
      "Trigger fired · source asset detected",
      "Content Engine extracts key moments",
      "Generate captions + hashtags",
      "Approval gate → Max reviews",
      "Schedule across platforms",
    ],
  },
  {
    id: "w-status-reporter",
    name: "Project Status Reporter",
    trigger: "Daily 8:00 AM",
    input: "All active projects",
    agent: "uni-core",
    tools: ["Branch Sync"],
    output: "Morning status digest",
    approvalGate: false,
    status: "ready",
    steps: [
      "Trigger fired · daily 8:00 AM",
      "UNI Core polls all branches",
      "Compile blockers + next actions",
      "Push to Intelligence Panel",
    ],
  },
  {
    id: "w-drive-librarian",
    name: "Google Drive Librarian",
    trigger: "New file in watched folder",
    input: "File metadata",
    agent: "librarian",
    tools: ["Drive Sync", "Tagger"],
    output: "Tagged + indexed vault entry",
    approvalGate: false,
    status: "draft",
    steps: [
      "Trigger fired · new file detected",
      "Librarian reads metadata",
      "Auto-tag by branch",
      "Index into Knowledge Vault",
    ],
  },
  {
    id: "w-invoice-followup",
    name: "Invoice Follow-Up",
    trigger: "Invoice overdue by 3 days",
    input: "Invoice record",
    agent: "cashflow-agent",
    tools: ["Invoicing"],
    output: "Reminder email draft",
    approvalGate: true,
    status: "paused",
    steps: [
      "Trigger fired · invoice overdue",
      "Cashflow Agent pulls invoice record",
      "Draft reminder email",
      "Approval gate → Max reviews",
      "Send + log",
    ],
  },
  {
    id: "w-curriculum-builder",
    name: "Curriculum Builder",
    trigger: "New module requested",
    input: "Topic + age group",
    agent: "curriculum-architect",
    tools: ["Lesson Builder", "Assessment"],
    output: "Draft module with lessons + quiz",
    approvalGate: true,
    status: "ready",
    steps: [
      "Trigger fired · module requested",
      "Curriculum Architect outlines lessons",
      "Generate activities + assessment",
      "Approval gate → Max reviews",
      "Publish to StarrDome",
    ],
  },
  {
    id: "w-music-release",
    name: "Music Release Checklist",
    trigger: "Release date set",
    input: "Release metadata",
    agent: "music-ops",
    tools: ["Release Scheduler", "Visuals Queue"],
    output: "Pre-release checklist completed",
    approvalGate: false,
    status: "ready",
    steps: [
      "Trigger fired · release date locked",
      "Music Ops builds checklist",
      "Queue visuals + DSP drafts",
      "Notify Content Engine",
      "Confirm ready state",
    ],
  },
];

// ---------- CASHFLOW LANES ----------
export const cashflowLanes: CashflowLane[] = [
  {
    id: "c-ai-auto",
    branch: "ai",
    offer: "AI Automation Build (custom)",
    priceRange: "$2.5k–$8k",
    idealClient: "Small biz drowning in manual work",
    stage: "Offer ready",
    nextSalesAction: "Post offer + outreach 10 prospects",
    potentialMonthly: 8000,
    confidence: 78,
  },
  {
    id: "c-custom-gpt",
    branch: "ai",
    offer: "Custom GPT Pack (3 bots)",
    priceRange: "$1.2k–$3.5k",
    idealClient: "Founders needing branded AI assistants",
    stage: "Drafting",
    nextSalesAction: "Finish demo bots + landing page",
    potentialMonthly: 4000,
    confidence: 64,
  },
  {
    id: "c-web-refresh",
    branch: "clients",
    offer: "Website Refresh + AI Lead Capture",
    priceRange: "$1.8k–$5k",
    idealClient: "Service biz with stale site",
    stage: "Selling",
    nextSalesAction: "Follow up 4 warm leads",
    potentialMonthly: 6000,
    confidence: 82,
  },
  {
    id: "c-curriculum",
    branch: "education",
    offer: "AI Workshop / Curriculum",
    priceRange: "$800–$4k",
    idealClient: "Schools + youth programs",
    stage: "Drafting",
    nextSalesAction: "Finalize StarrDome deck + email 5 schools",
    potentialMonthly: 3500,
    confidence: 58,
  },
  {
    id: "c-music",
    branch: "music",
    offer: "Music + Visual Direction",
    priceRange: "$500–$3k",
    idealClient: "Independent artists",
    stage: "Idea",
    nextSalesAction: "Build service menu",
    potentialMonthly: 1500,
    confidence: 45,
  },
  {
    id: "c-visual-design",
    branch: "design",
    offer: "Motion / Brand Visual Pack",
    priceRange: "$700–$2.5k",
    idealClient: "Creators + small brands",
    stage: "Selling",
    nextSalesAction: "Batch 6 templates → post portfolio",
    potentialMonthly: 2500,
    confidence: 70,
  },
  {
    id: "c-it-support",
    branch: "clients",
    offer: "IT / AI Support Retainer",
    priceRange: "$400–$1.5k/mo",
    idealClient: "Non-technical founders",
    stage: "Selling",
    nextSalesAction: "Convert 2 existing clients to retainer",
    potentialMonthly: 3000,
    confidence: 75,
  },
  {
    id: "c-starrdome",
    branch: "education",
    offer: "StarrDome Future Platform",
    priceRange: "Funding + subs",
    idealClient: "Investors + school districts",
    stage: "Vision",
    nextSalesAction: "Finish pitch deck v2",
    potentialMonthly: 5000,
    confidence: 30,
  },
];

// ---------- IDEAS (seed) ----------
export const seedIdeas: Idea[] = [
  {
    id: "i-1",
    title: "Gesture-controlled project switcher",
    details: "Swipe hand to move between Nexus screens without touching keyboard.",
    impact: 4,
    cash: 2,
    effort: 3,
    brand: 5,
    urgency: 4,
    status: "build",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "i-2",
    title: "Weekly cashflow digest video",
    details: "Auto-generate a 60s video of the week's money moves for social.",
    impact: 3,
    cash: 4,
    effort: 3,
    brand: 4,
    urgency: 3,
    status: "schedule",
    createdAt: Date.now() - 172800000,
  },
  {
    id: "i-3",
    title: "StarrDome youth AI hackathon",
    details: "One-day event pilot to validate the platform + capture content.",
    impact: 5,
    cash: 3,
    effort: 5,
    brand: 5,
    urgency: 2,
    status: "new",
    createdAt: Date.now() - 259200000,
  },
];

// ---------- KNOWLEDGE SOURCES ----------
export const knowledgeSources: KnowledgeSource[] = [
  {
    id: "k-starrtree-docs",
    name: "StarrTree Docs",
    type: "local",
    description: "Internal playbooks, brand voice, offer specs.",
    icon: "FileText",
    count: 42,
  },
  {
    id: "k-project-notes",
    name: "Project Notes",
    type: "local",
    description: "Notes attached to every Project Room.",
    icon: "StickyNote",
    count: 28,
  },
  {
    id: "k-uploaded",
    name: "Uploaded Files",
    type: "local",
    description: "PDFs, decks, and assets Max has dropped in.",
    icon: "Upload",
    count: 15,
  },
  {
    id: "k-drive",
    name: "Google Drive Sync",
    type: "future",
    description: "Will auto-index Drive folders into the Vault via Librarian Agent.",
    icon: "Cloud",
    count: 0,
  },
  {
    id: "k-notion",
    name: "Notion Sync",
    type: "future",
    description: "Will mirror Notion workspaces as searchable vault entries.",
    icon: "BookOpen",
    count: 0,
  },
  {
    id: "k-github",
    name: "GitHub Repo Sync",
    type: "future",
    description: "Will track repos, branches, and PRs from Builder Agent.",
    icon: "Github",
    count: 0,
  },
  {
    id: "k-ai-memory",
    name: "AI Memory / Context",
    type: "future",
    description: "Long-term agent memory so agents remember decisions across sessions.",
    icon: "BrainCircuit",
    count: 0,
  },
];

// ---------- SYSTEM ALERTS ----------
export const systemAlerts: SystemAlert[] = [
  {
    id: "a-1",
    level: "warn",
    agent: "Cashflow Agent",
    message: "2 invoices overdue — total $1,800",
    time: "12m ago",
  },
  {
    id: "a-2",
    level: "success",
    agent: "Builder Agent",
    message: "Spec draft ready for gesture control refactor",
    time: "34m ago",
  },
  {
    id: "a-3",
    level: "info",
    agent: "Lead Scout",
    message: "4 new prospects queued for review",
    time: "1h ago",
  },
  {
    id: "a-4",
    level: "critical",
    agent: "QA Sentinel",
    message: "StarrDome deck missing funding ask slide",
    time: "2h ago",
  },
];

// ---------- TODAY'S TOP MOVES ----------
export const topMoves: {
  rank: number;
  title: string;
  branch: BranchId;
  why: string;
  impact: "cash" | "momentum" | "unblock";
}[] = [
  {
    rank: 1,
    title: "Send 2 overdue invoice reminders",
    branch: "cashflow",
    why: "Recover $1,800 this week",
    impact: "cash",
  },
  {
    rank: 2,
    title: "Finish Custom GPT offer page",
    branch: "ai",
    why: "Unlock $4k/mo lane",
    impact: "cash",
  },
  {
    rank: 3,
    title: "Lock music release date",
    branch: "music",
    why: "Unblock 2 downstream tasks",
    impact: "unblock",
  },
];

// ---------- COMMAND BAR MOCK RESPONSES ----------
export const commandResponses: Record<string, { reply: string; action?: string }> = {
  "add a project editing modal": {
    reply:
      "Builder Agent drafted a spec for a project editing modal. Opening Project Rooms so you can review the draft PR.",
    action: "projects",
  },
  "create a lead tracker for website clients": {
    reply:
      "Spawning a new Project Room: 'Website Client Lead Tracker' in the Automation branch, linked to the CRM Lead Scout workflow.",
    action: "projects",
  },
  "turn starrdome into a pitch deck": {
    reply:
      "Curriculum Architect + Content Engine queued to build a 12-slide StarrDome pitch deck. Opening the project.",
    action: "projects",
  },
  "build me a 7-day content plan": {
    reply:
      "Content Engine generated a 7-day plan across 3 platforms. Opening the Idea Incubator batch.",
    action: "incubator",
  },
  "show fastest cashflow move": {
    reply:
      "Fastest money move: send the 2 overdue invoice reminders → recover $1,800. Second: post Custom GPT offer.",
    action: "cashflow",
  },
  "summon builder agent": {
    reply:
      "Builder Agent summoned and standing by. It will not merge anything without your approval.",
    action: "agents",
  },
  "open focus mode": {
    reply: "Entering Focus Mode. Nonessential panels dimmed. Press Esc to exit.",
    action: "focus",
  },
  "create a new starrseed": {
    reply:
      "New StarrSeed idea slot opened in the Idea Incubator. Plant your idea.",
    action: "incubator",
  },
};

export const defaultCommandReply =
  "UNI Core received your command. Routed to the relevant branch + agent. (This is a simulated response — wire real logic later.)";
