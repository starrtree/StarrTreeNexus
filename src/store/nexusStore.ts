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
  themeIntensity: number; // 0-100
  motionLevel: "full" | "reduced" | "minimal";
  handTracking: boolean;
  gestureSensitivity: number; // 1-10
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
}

type CloudStatus = "unknown" | "loading" | "connected" | "saving" | "disconnected";

interface NexusState {
  booted: boolean;
  section: SectionId;
  focusMode: boolean;
  selectedBranchId: string | null;
  selectedProjectId: string | null;
  commandOpen: boolean;
  commandLog: CommandLog[];
  settings: NexusSettings;
  gesture: {
    enabled: boolean;
    hands: number;
    gesture: string;
    confidence: number;
    command: string;
  };
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

  // actions
  setBooted: (v: boolean) => void;
  setSection: (s: SectionId) => void;
  setFocusMode: (v: boolean) => void;
  setSelectedBranch: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
  setCommandOpen: (v: boolean) => void;
  runCommand: (text: string) => void;
  updateSettings: (p: Partial<NexusSettings>) => void;
  setGesture: (p: Partial<NexusState["gesture"]>) => void;
  setCloudStatus: (p: Partial<NexusState["cloud"]>) => void;
  hydrateFromCloud: (snapshot: Partial<NexusCloudSnapshot>) => void;
  requestCloudSync: () => void;

  addIdea: (idea: Omit<Idea, "id" | "createdAt" | "status"> & { status?: Idea["status"] }) => void;
  updateIdea: (id: string, p: Partial<Idea>) => void;
  removeIdea: (id: string) => void;
  promoteIdea: (id: string) => string | void;

  addProject: (p: Partial<Project>) => string;
  updateProject: (id: string, p: Partial<Project>) => void;

  resetData: () => void;
}

const defaultSettings: NexusSettings = {
  themeMode: "dark",
  themeIntensity: 80,
  motionLevel: "full",
  handTracking: false,
  gestureSensitivity: 5,
  soundOn: false,
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
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
    settings: { ...defaultSettings, ...state.settings },
    commandLog: state.commandLog,
  };
}

function hasArrayValue<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const useNexus = create<NexusState>()(
  persist(
    (set, get) => ({
      booted: false,
      section: "home",
      focusMode: false,
      selectedBranchId: null,
      selectedProjectId: null,
      commandOpen: false,
      commandLog: [],
      settings: defaultSettings,
      gesture: {
        enabled: false,
        hands: 0,
        gesture: "No hand detected",
        confidence: 0,
        command: "—",
      },
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

      setBooted: (v) => set({ booted: v }),
      setSection: (s) => set({ section: s, focusMode: false }),
      setFocusMode: (v) => set({ focusMode: v }),
      setSelectedBranch: (id) => set({ selectedBranchId: id }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setCommandOpen: (v) => set({ commandOpen: v }),

      runCommand: (text) => {
        const key = text.trim().toLowerCase();
        const match = commandResponses[key];
        const reply = match?.reply ?? defaultCommandReply;
        const log: CommandLog = {
          id: uid("cmd"),
          text,
          reply,
          time: Date.now(),
        };
        set((st) => ({ commandLog: [log, ...st.commandLog].slice(0, 30) }));

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
            projects: "projects",
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
        set((st) => ({ settings: { ...defaultSettings, ...st.settings, ...p } })),
      setGesture: (p) => set((st) => ({ gesture: { ...st.gesture, ...p } })),
      setCloudStatus: (p) => set((st) => ({ cloud: { ...st.cloud, ...p } })),
      hydrateFromCloud: (snapshot) => {
        set((st) => ({
          ideas: hasArrayValue<Idea>(snapshot.ideas) ? snapshot.ideas : st.ideas,
          projects: hasArrayValue<Project>(snapshot.projects) ? snapshot.projects : st.projects,
          agents: hasArrayValue<Agent>(snapshot.agents) ? snapshot.agents : st.agents,
          workflows: hasArrayValue<Workflow>(snapshot.workflows) ? snapshot.workflows : st.workflows,
          cashflow: hasArrayValue<CashflowLane>(snapshot.cashflow) ? snapshot.cashflow : st.cashflow,
          settings: snapshot.settings ? { ...defaultSettings, ...st.settings, ...snapshot.settings } : { ...defaultSettings, ...st.settings },
          commandLog: hasArrayValue<CommandLog>(snapshot.commandLog) ? snapshot.commandLog.slice(0, 30) : st.commandLog,
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
        set((st) => ({
          ideas: st.ideas.map((i) => (i.id === id ? { ...i, ...p } : i)),
        })),

      removeIdea: (id) =>
        set((st) => ({ ideas: st.ideas.filter((i) => i.id !== id) })),

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
          nextAction: "Define spec",
          assignedAgents: ["builder"],
          blockers: [],
          notes: `Promoted from Idea Incubator. ${idea.details}`,
          pipelineStage: 0,
          cashflowPotential: 0,
          links: [],
        };
        set((st) => ({
          projects: [project, ...st.projects],
          ideas: st.ideas.map((i) =>
            i.id === id ? { ...i, status: "build" } : i,
          ),
          selectedProjectId: newId,
          section: "projects",
        }));
        return newId;
      },

      addProject: (p) => {
        const newId = p.id ?? uid("p");
        const project: Project = {
          id: newId,
          title: p.title ?? "Untitled Project",
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
        set((st) => ({
          projects: st.projects.map((pr) =>
            pr.id === id ? { ...pr, ...p } : pr,
          ),
        })),

      resetData: () =>
        set({
          ideas: seedIdeas,
          projects: seedProjects,
          agents: seedAgents,
          workflows: seedWorkflows,
          cashflow: seedCashflow,
          settings: defaultSettings,
          focusMode: false,
          commandLog: [],
        }),
    }),
    {
      name: "nexus-os-state",
      storage: createJSONStorage(() => localStorage),
      // Persist user-facing data + settings locally; CloudSync mirrors this to Supabase.
      partialize: (s) => ({
        ideas: s.ideas,
        projects: s.projects,
        agents: s.agents,
        workflows: s.workflows,
        cashflow: s.cashflow,
        settings: { ...defaultSettings, ...s.settings },
        commandLog: s.commandLog,
      }),
      merge: (persisted, current) => {
        if (!isObject(persisted)) return current;
        const persistedSettings = isObject(persisted.settings) ? persisted.settings : {};
        return {
          ...current,
          ...persisted,
          settings: { ...defaultSettings, ...current.settings, ...persistedSettings },
          cloud: current.cloud,
          cloudSyncRequest: current.cloudSyncRequest,
          booted: current.booted,
        } as NexusState;
      },
    },
  ),
);

// expose top moves for convenience
export { topMoves };
