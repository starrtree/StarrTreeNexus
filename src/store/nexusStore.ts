"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  branches as seedBranches,
  projects as seedProjects,
  agents as seedAgents,
  workflows as seedWorkflows,
  cashflowLanes as seedCashflow,
  seedIdeas,
  knowledgeSources,
  systemAlerts,
  topMoves,
  commandResponses,
  defaultCommandReply,
  type Branch,
  type Project,
  type Agent,
  type Workflow,
  type CashflowLane,
  type Idea,
  type KnowledgeSource,
  type SystemAlert,
} from "@/data/mockData";
import {
  departments as seedDepartments,
  agentRuntimes as seedAgentRuntimes,
  agentMissions as seedAgentMissions,
  collaborations as seedCollaborations,
  toolConnections as seedToolConnections,
  memoryZones as seedMemoryZones,
  type Department,
  type StarrBaseAgentRuntime,
  type AgentMission,
  type AgentCollaboration,
  type ToolConnection,
  type MemoryZone,
} from "@/data/starrbaseData";

const SETTINGS_VERSION = 3 as const;

export type SectionId =
  | "home"
  | "starrmap"
  | "mission"
  | "projects"
  | "agents"
  | "workflows"
  | "cashflow"
  | "incubator"
  | "vault"
  | "settings";

export interface NexusSettings {
  themeMode: "dark" | "light";
  themeVersion: typeof SETTINGS_VERSION;
  themeIntensity: number;
  motionLevel: "full" | "reduced" | "minimal";
  soundOn: boolean;
}

export interface CommandLog {
  id: string;
  text: string;
  reply: string;
  time: number;
}

export interface NexusCloudSnapshot {
  version: 1;
  savedAt: number;
  ideas: Idea[];
  projects: Project[];
  agents: Agent[];
  workflows: Workflow[];
  cashflow: CashflowLane[];
  settings: NexusSettings;
  commandLog: CommandLog[];
  departments: Department[];
  agentRuntimes: StarrBaseAgentRuntime[];
  agentMissions: AgentMission[];
  collaborations: AgentCollaboration[];
  toolConnections: ToolConnection[];
  memoryZones: MemoryZone[];
}

type CloudStatus = "unknown" | "loading" | "connected" | "saving" | "disconnected";

interface NexusState {
  booted: boolean;
  section: SectionId;
  focusMode: boolean;
  selectedBranchId: string | null;
  selectedProjectId: string | null;
  selectedAgentId: string | null;
  selectedDepartmentId: string | null;
  selectedMissionId: string | null;
  commandOpen: boolean;
  commandLog: CommandLog[];
  settings: NexusSettings;
  cloud: {
    status: CloudStatus;
    lastSynced: number | null;
    error: string | null;
  };
  cloudSyncRequest: number;

  branches: Branch[];
  projects: Project[];
  agents: Agent[];
  workflows: Workflow[];
  cashflow: CashflowLane[];
  ideas: Idea[];
  knowledge: KnowledgeSource[];
  alerts: SystemAlert[];

  departments: Department[];
  agentRuntimes: StarrBaseAgentRuntime[];
  agentMissions: AgentMission[];
  collaborations: AgentCollaboration[];
  toolConnections: ToolConnection[];
  memoryZones: MemoryZone[];

  setBooted: (v: boolean) => void;
  setSection: (s: SectionId) => void;
  setFocusMode: (v: boolean) => void;
  setSelectedBranch: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
  setSelectedAgent: (id: string | null) => void;
  setSelectedDepartment: (id: string | null) => void;
  setSelectedMission: (id: string | null) => void;
  setCommandOpen: (v: boolean) => void;
  runCommand: (text: string) => void;
  updateSettings: (p: Partial<NexusSettings>) => void;
  setCloudStatus: (p: Partial<NexusState["cloud"]>) => void;
  hydrateFromCloud: (snapshot: Partial<NexusCloudSnapshot>) => void;
  requestCloudSync: () => void;

  addIdea: (idea: Omit<Idea, "id" | "createdAt" | "status"> & { status?: Idea["status"] }) => void;
  updateIdea: (id: string, p: Partial<Idea>) => void;
  removeIdea: (id: string) => void;
  promoteIdea: (id: string) => string | void;

  addProject: (p: Partial<Project>) => string;
  updateProject: (id: string, p: Partial<Project>) => void;
  updateMission: (id: string, p: Partial<AgentMission>) => void;
  updateAgentRuntime: (agentId: string, p: Partial<StarrBaseAgentRuntime>) => void;

  resetData: () => void;
}

const defaultSettings: NexusSettings = {
  themeMode: "dark",
  themeVersion: SETTINGS_VERSION,
  themeIntensity: 80,
  motionLevel: "full",
  soundOn: false,
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasArrayValue<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

function normalizeSettings(value: unknown): NexusSettings {
  const incoming = isObject(value) ? (value as Partial<NexusSettings> & Record<string, unknown>) : {};
  const alreadyMigrated = incoming.themeVersion === SETTINGS_VERSION;
  const requestedTheme = incoming.themeMode === "light" ? "light" : "dark";

  return {
    ...defaultSettings,
    ...incoming,
    themeMode: alreadyMigrated ? requestedTheme : "dark",
    themeVersion: SETTINGS_VERSION,
    themeIntensity: typeof incoming.themeIntensity === "number" ? incoming.themeIntensity : defaultSettings.themeIntensity,
    motionLevel:
      incoming.motionLevel === "reduced" || incoming.motionLevel === "minimal" || incoming.motionLevel === "full"
        ? incoming.motionLevel
        : defaultSettings.motionLevel,
    soundOn: typeof incoming.soundOn === "boolean" ? incoming.soundOn : defaultSettings.soundOn,
  };
}

export function buildCloudSnapshot(state: NexusState): NexusCloudSnapshot {
  return {
    version: 1,
    savedAt: Date.now(),
    ideas: state.ideas,
    projects: state.projects,
    agents: state.agents,
    workflows: state.workflows,
    cashflow: state.cashflow,
    settings: normalizeSettings(state.settings),
    commandLog: state.commandLog,
    departments: state.departments,
    agentRuntimes: state.agentRuntimes,
    agentMissions: state.agentMissions,
    collaborations: state.collaborations,
    toolConnections: state.toolConnections,
    memoryZones: state.memoryZones,
  };
}

export const useNexus = create<NexusState>()(
  persist(
    (set, get) => ({
      booted: false,
      section: "home",
      focusMode: false,
      selectedBranchId: null,
      selectedProjectId: null,
      selectedAgentId: null,
      selectedDepartmentId: null,
      selectedMissionId: null,
      commandOpen: false,
      commandLog: [],
      settings: defaultSettings,
      cloud: {
        status: "unknown",
        lastSynced: null,
        error: null,
      },
      cloudSyncRequest: 0,

      branches: seedBranches,
      projects: seedProjects,
      agents: seedAgents,
      workflows: seedWorkflows,
      cashflow: seedCashflow,
      ideas: seedIdeas,
      knowledge: knowledgeSources,
      alerts: systemAlerts,

      departments: seedDepartments,
      agentRuntimes: seedAgentRuntimes,
      agentMissions: seedAgentMissions,
      collaborations: seedCollaborations,
      toolConnections: seedToolConnections,
      memoryZones: seedMemoryZones,

      setBooted: (v) => set({ booted: v }),
      setSection: (s) => set({ section: s, focusMode: false }),
      setFocusMode: (v) => set({ focusMode: v }),
      setSelectedBranch: (id) => set({ selectedBranchId: id }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setSelectedAgent: (id) => set({ selectedAgentId: id }),
      setSelectedDepartment: (id) => set({ selectedDepartmentId: id }),
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setCommandOpen: (v) => set({ commandOpen: v }),

      runCommand: (text) => {
        const key = text.trim().toLowerCase();
        const match = commandResponses[key];
        const agentIntent = key.match(/(?:show|open|ask|tell)\s+(.+?)(?:\s+agent)?(?:\s+to|$)/i)?.[1]?.trim().toLowerCase();
        const matchedAgent = get().agents.find((agent) =>
          agentIntent ? agent.name.toLowerCase().includes(agentIntent) || agent.id.includes(agentIntent.replace(/\s+/g, "-")) : false,
        );

        const reply = matchedAgent
          ? `${matchedAgent.name} selected. Open Agent Bay to review role, tools, mission, and current process.`
          : match?.reply ?? defaultCommandReply;
        const log: CommandLog = {
          id: uid("cmd"),
          text,
          reply,
          time: Date.now(),
        };
        set((st) => ({ commandLog: [log, ...st.commandLog].slice(0, 30) }));

        if (matchedAgent) {
          set({ selectedAgentId: matchedAgent.id, section: "agents", commandOpen: false });
          return;
        }

        if (key.includes("blocked agents") || key.includes("blocked missions")) {
          set({ section: "mission", commandOpen: false });
          return;
        }
        if (key.includes("tool") || key.includes("n8n") || key.includes("make")) {
          set({ section: "workflows", commandOpen: false });
          return;
        }
        if (key.includes("memory") || key.includes("docs") || key.includes("vault")) {
          set({ section: "vault", commandOpen: false });
          return;
        }

        if (match?.action) {
          const a = match.action;
          if (a === "focus") {
            set({ focusMode: true, commandOpen: false });
            return;
          }
          if (a === "incubator") {
            set({ section: "incubator", commandOpen: false });
            return;
          }
          const map: Record<string, SectionId> = {
            projects: "mission",
            cashflow: "cashflow",
            agents: "agents",
          };
          if (map[a]) {
            set({ section: map[a], commandOpen: false });
            return;
          }
        }
        set({ commandOpen: false });
      },

      updateSettings: (p) =>
        set((st) => ({ settings: normalizeSettings({ ...st.settings, ...p, themeVersion: SETTINGS_VERSION }) })),
      setCloudStatus: (p) => set((st) => ({ cloud: { ...st.cloud, ...p } })),
      hydrateFromCloud: (snapshot) => {
        set((st) => ({
          ideas: hasArrayValue<Idea>(snapshot.ideas) ? snapshot.ideas : st.ideas,
          projects: hasArrayValue<Project>(snapshot.projects) ? snapshot.projects : st.projects,
          agents: hasArrayValue<Agent>(snapshot.agents) ? snapshot.agents : st.agents,
          workflows: hasArrayValue<Workflow>(snapshot.workflows) ? snapshot.workflows : st.workflows,
          cashflow: hasArrayValue<CashflowLane>(snapshot.cashflow) ? snapshot.cashflow : st.cashflow,
          settings: snapshot.settings ? normalizeSettings(snapshot.settings) : normalizeSettings(st.settings),
          commandLog: hasArrayValue<CommandLog>(snapshot.commandLog) ? snapshot.commandLog.slice(0, 30) : st.commandLog,
          departments: hasArrayValue<Department>(snapshot.departments) ? snapshot.departments : st.departments,
          agentRuntimes: hasArrayValue<StarrBaseAgentRuntime>(snapshot.agentRuntimes) ? snapshot.agentRuntimes : st.agentRuntimes,
          agentMissions: hasArrayValue<AgentMission>(snapshot.agentMissions) ? snapshot.agentMissions : st.agentMissions,
          collaborations: hasArrayValue<AgentCollaboration>(snapshot.collaborations) ? snapshot.collaborations : st.collaborations,
          toolConnections: hasArrayValue<ToolConnection>(snapshot.toolConnections) ? snapshot.toolConnections : st.toolConnections,
          memoryZones: hasArrayValue<MemoryZone>(snapshot.memoryZones) ? snapshot.memoryZones : st.memoryZones,
        }));
      },
      requestCloudSync: () => set((st) => ({ cloudSyncRequest: st.cloudSyncRequest + 1 })),

      addIdea: (idea) => {
        const newIdea: Idea = {
          id: uid("i"),
          title: idea.title,
          details: idea.details,
          impact: idea.impact,
          cash: idea.cash,
          effort: idea.effort,
          brand: idea.brand,
          urgency: idea.urgency,
          status: idea.status ?? "new",
          createdAt: Date.now(),
        };
        set((st) => ({ ideas: [newIdea, ...st.ideas] }));
      },

      updateIdea: (id, p) =>
        set((st) => ({ ideas: st.ideas.map((i) => (i.id === id ? { ...i, ...p } : i)) })),

      removeIdea: (id) => set((st) => ({ ideas: st.ideas.filter((i) => i.id !== id) })),

      promoteIdea: (id) => {
        const idea = get().ideas.find((i) => i.id === id);
        if (!idea) return;
        const branch = get().branches[0];
        const newId = uid("p");
        const project: Project = {
          id: newId,
          title: idea.title,
          branch: branch.id,
          status: "idea",
          progress: 5,
          mission: idea.details,
          nextAction: "Define mission spec",
          assignedAgents: ["builder"],
          blockers: [],
          notes: `Promoted from Mission Backlog. ${idea.details}`,
          pipelineStage: 0,
          cashflowPotential: 0,
          links: [],
        };
        const mission: AgentMission = {
          id: uid("m"),
          title: idea.title,
          description: idea.details,
          status: "queued",
          priority: "medium",
          leadAgentId: "uni-core",
          supportAgentIds: ["builder"],
          departmentId: "command-core",
          inputs: ["Mission backlog idea"],
          outputs: ["Spec", "Assigned agent plan"],
          blockers: [],
          progress: 5,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((st) => ({
          projects: [project, ...st.projects],
          agentMissions: [mission, ...st.agentMissions],
          ideas: st.ideas.map((i) => (i.id === id ? { ...i, status: "build" } : i)),
          selectedProjectId: newId,
          selectedMissionId: mission.id,
          section: "mission",
        }));
        return newId;
      },

      addProject: (p) => {
        const newId = p.id ?? uid("p");
        const project: Project = {
          id: newId,
          title: p.title ?? "Untitled Mission",
          branch: p.branch ?? "automation",
          status: p.status ?? "idea",
          progress: p.progress ?? 5,
          mission: p.mission ?? "",
          nextAction: p.nextAction ?? "Define spec",
          assignedAgents: p.assignedAgents ?? ["builder"],
          blockers: p.blockers ?? [],
          notes: p.notes ?? "",
          pipelineStage: p.pipelineStage ?? 0,
          cashflowPotential: p.cashflowPotential ?? 0,
          links: p.links ?? [],
        };
        set((st) => ({ projects: [project, ...st.projects] }));
        return newId;
      },

      updateProject: (id, p) =>
        set((st) => ({ projects: st.projects.map((pr) => (pr.id === id ? { ...pr, ...p } : pr)) })),
      updateMission: (id, p) =>
        set((st) => ({
          agentMissions: st.agentMissions.map((mission) =>
            mission.id === id ? { ...mission, ...p, updatedAt: Date.now() } : mission,
          ),
        })),
      updateAgentRuntime: (agentId, p) =>
        set((st) => ({
          agentRuntimes: st.agentRuntimes.map((runtime) =>
            runtime.agentId === agentId ? { ...runtime, ...p } : runtime,
          ),
        })),

      resetData: () =>
        set({
          ideas: seedIdeas,
          projects: seedProjects,
          agents: seedAgents,
          workflows: seedWorkflows,
          cashflow: seedCashflow,
          departments: seedDepartments,
          agentRuntimes: seedAgentRuntimes,
          agentMissions: seedAgentMissions,
          collaborations: seedCollaborations,
          toolConnections: seedToolConnections,
          memoryZones: seedMemoryZones,
          settings: defaultSettings,
          focusMode: false,
          commandLog: [],
          selectedAgentId: null,
          selectedDepartmentId: null,
          selectedMissionId: null,
        }),
    }),
    {
      name: "nexus-os-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ideas: s.ideas,
        projects: s.projects,
        agents: s.agents,
        workflows: s.workflows,
        cashflow: s.cashflow,
        settings: normalizeSettings(s.settings),
        commandLog: s.commandLog,
        departments: s.departments,
        agentRuntimes: s.agentRuntimes,
        agentMissions: s.agentMissions,
        collaborations: s.collaborations,
        toolConnections: s.toolConnections,
        memoryZones: s.memoryZones,
      }),
      merge: (persisted, current) => {
        if (!isObject(persisted)) return current;
        return {
          ...current,
          ...persisted,
          settings: normalizeSettings(persisted.settings),
          departments: hasArrayValue<Department>(persisted.departments) ? persisted.departments : current.departments,
          agentRuntimes: hasArrayValue<StarrBaseAgentRuntime>(persisted.agentRuntimes) ? persisted.agentRuntimes : current.agentRuntimes,
          agentMissions: hasArrayValue<AgentMission>(persisted.agentMissions) ? persisted.agentMissions : current.agentMissions,
          collaborations: hasArrayValue<AgentCollaboration>(persisted.collaborations) ? persisted.collaborations : current.collaborations,
          toolConnections: hasArrayValue<ToolConnection>(persisted.toolConnections) ? persisted.toolConnections : current.toolConnections,
          memoryZones: hasArrayValue<MemoryZone>(persisted.memoryZones) ? persisted.memoryZones : current.memoryZones,
          cloud: current.cloud,
          cloudSyncRequest: current.cloudSyncRequest,
          booted: current.booted,
        } as NexusState;
      },
    },
  ),
);

export { topMoves };
