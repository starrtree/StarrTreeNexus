import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRIMARY_MODEL = process.env.OPENAI_PLANNER_MODEL || "gpt-4.1-mini";
const FALLBACK_MODEL = "gpt-4o-mini";

type PlannerResult = {
  configured: boolean;
  summary: string;
  activityDigest: string[];
  recommendedPriorities: Array<{
    title: string;
    why: string;
    urgency: "low" | "medium" | "high" | "urgent";
    suggestedOwnerAgentId: string | null;
    relatedMissionId: string | null;
  }>;
  suggestedActions: Array<{
    type: "create_mission" | "update_mission" | "create_idea" | "assign_agent" | "none";
    label: string;
    rationale: string;
    title: string | null;
    description: string | null;
    priority: "low" | "medium" | "high" | "urgent" | null;
    leadAgentId: string | null;
    supportAgentIds: string[];
    departmentId: string | null;
    missionId: string | null;
    agentId: string | null;
    impact: number | null;
    urgencyScore: number | null;
    fields: {
      status: "queued" | "planning" | "executing" | "waiting" | "testing" | "blocked" | "complete" | null;
      priority: "low" | "medium" | "high" | "urgent" | null;
      progress: number | null;
      blockers: string[];
    };
  }>;
  questions: string[];
  confidence: number;
};

function baseResult(overrides: Partial<PlannerResult>): PlannerResult {
  return {
    configured: true,
    summary: "Planning Agent response unavailable.",
    activityDigest: [],
    recommendedPriorities: [],
    suggestedActions: [],
    questions: [],
    confidence: 0,
    ...overrides,
  };
}

function fallbackNotConfigured() {
  return baseResult({
    configured: false,
    summary: "Planning Agent is not configured yet. Add OPENAI_API_KEY in Vercel, then redeploy.",
    activityDigest: ["OpenAI key missing on server."],
    questions: ["Confirm OPENAI_API_KEY exists in Vercel Production and Preview environments."],
  });
}

function compressArray(value: unknown, limit = 16) {
  return Array.isArray(value) ? value.slice(0, limit) : [];
}

function compressBoardState(state: Record<string, unknown>) {
  return {
    departments: compressArray(state.departments, 12),
    agents: compressArray(state.agents, 18),
    agentRuntimes: compressArray(state.agentRuntimes, 18),
    agentMissions: compressArray(state.agentMissions, 24),
    collaborations: compressArray(state.collaborations, 12),
    toolConnections: compressArray(state.toolConnections, 18),
    memoryZones: compressArray(state.memoryZones, 16),
    projects: compressArray(state.projects, 18),
    ideas: compressArray(state.ideas, 18),
    cashflow: compressArray(state.cashflow, 12),
    commandLog: compressArray(state.commandLog, 8),
  };
}

function extractOutputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;

  const output = response.output;
  if (!Array.isArray(output)) return "";

  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") chunks.push(text);
    }
  }

  return chunks.join("\n").trim();
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safePriority(value: unknown): "low" | "medium" | "high" | "urgent" {
  return value === "low" || value === "medium" || value === "high" || value === "urgent" ? value : "medium";
}

function safeNullablePriority(value: unknown): "low" | "medium" | "high" | "urgent" | null {
  if (value === null || value === undefined) return null;
  return safePriority(value);
}

function safeStatus(value: unknown): PlannerResult["suggestedActions"][number]["fields"]["status"] {
  return value === "queued" ||
    value === "planning" ||
    value === "executing" ||
    value === "waiting" ||
    value === "testing" ||
    value === "blocked" ||
    value === "complete"
    ? value
    : null;
}

function safeNumber(value: unknown, fallback: number | null = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizePlannerResult(value: unknown): PlannerResult {
  if (!value || typeof value !== "object") {
    return baseResult({
      summary: "Planning Agent returned an unexpected format.",
      activityDigest: ["The model response was not a JSON object."],
      questions: ["Try the request again."],
    });
  }

  const raw = value as Record<string, unknown>;

  const recommendedPriorities = Array.isArray(raw.recommendedPriorities)
    ? raw.recommendedPriorities.slice(0, 6).map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          title: safeString(record.title, "Untitled priority"),
          why: safeString(record.why, "No rationale provided."),
          urgency: safePriority(record.urgency),
          suggestedOwnerAgentId: typeof record.suggestedOwnerAgentId === "string" ? record.suggestedOwnerAgentId : null,
          relatedMissionId: typeof record.relatedMissionId === "string" ? record.relatedMissionId : null,
        };
      })
    : [];

  const suggestedActions = Array.isArray(raw.suggestedActions)
    ? raw.suggestedActions.slice(0, 6).map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const fields = record.fields && typeof record.fields === "object" ? (record.fields as Record<string, unknown>) : {};
        const type =
          record.type === "create_mission" || record.type === "update_mission" || record.type === "create_idea" || record.type === "assign_agent"
            ? record.type
            : "none";

        return {
          type,
          label: safeString(record.label, "Planner recommendation"),
          rationale: safeString(record.rationale, "No rationale provided."),
          title: typeof record.title === "string" ? record.title : null,
          description: typeof record.description === "string" ? record.description : null,
          priority: safeNullablePriority(record.priority),
          leadAgentId: typeof record.leadAgentId === "string" ? record.leadAgentId : null,
          supportAgentIds: Array.isArray(record.supportAgentIds) ? record.supportAgentIds.filter((id): id is string => typeof id === "string") : [],
          departmentId: typeof record.departmentId === "string" ? record.departmentId : null,
          missionId: typeof record.missionId === "string" ? record.missionId : null,
          agentId: typeof record.agentId === "string" ? record.agentId : null,
          impact: safeNumber(record.impact),
          urgencyScore: safeNumber(record.urgencyScore),
          fields: {
            status: safeStatus(fields.status),
            priority: safeNullablePriority(fields.priority),
            progress: safeNumber(fields.progress),
            blockers: Array.isArray(fields.blockers) ? fields.blockers.filter((item): item is string => typeof item === "string") : [],
          },
        };
      })
    : [];

  return baseResult({
    configured: raw.configured !== false,
    summary: safeString(raw.summary, "Planning Agent finished, but gave no summary."),
    activityDigest: Array.isArray(raw.activityDigest) ? raw.activityDigest.filter((item): item is string => typeof item === "string").slice(0, 8) : [],
    recommendedPriorities,
    suggestedActions,
    questions: Array.isArray(raw.questions) ? raw.questions.filter((item): item is string => typeof item === "string").slice(0, 5) : [],
    confidence: Math.max(0, Math.min(1, safeNumber(raw.confidence, 0) ?? 0)),
  });
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty planner output");

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Planner output was not valid JSON");
  }
}

async function requestOpenAI(apiKey: string, model: string, payload: Record<string, unknown>) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 1800,
      temperature: 0.25,
      instructions: [
        "You are the StarrBoard Planning Agent for Max Starr / StarrTree.",
        "You understand AI agents, missions, departments, boards, ideas, projects, tools, and memory zones.",
        "Be direct, practical, and action-oriented.",
        "Never claim you changed the board yourself. You only propose actions. The UI will require Max to approve each action.",
        "Use existing IDs when updating or assigning. For new items, return clean titles and descriptions but do not invent fake existing IDs.",
        "Prioritize what moves StarrTree closer to launch, delivery, revenue, or system clarity.",
        "Return ONLY valid JSON with these top-level keys: configured, summary, activityDigest, recommendedPriorities, suggestedActions, questions, confidence.",
        "suggestedActions items must include: type, label, rationale, title, description, priority, leadAgentId, supportAgentIds, departmentId, missionId, agentId, impact, urgencyScore, fields.",
        "fields must include: status, priority, progress, blockers. Use null or [] when not applicable.",
      ].join("\n"),
      input: [
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      text: {
        format: { type: "json_object" },
        verbosity: "low",
      },
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      model,
      detail: rawText,
    };
  }

  try {
    const data = JSON.parse(rawText) as Record<string, unknown>;
    const outputText = extractOutputText(data);
    const parsed = parseJsonText(outputText);
    return {
      ok: true as const,
      model,
      result: sanitizePlannerResult(parsed),
    };
  } catch (error) {
    return {
      ok: false as const,
      status: 200,
      model,
      detail: error instanceof Error ? error.message : "Unable to parse OpenAI planner output.",
    };
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackNotConfigured());
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      boardState?: Record<string, unknown>;
      context?: Record<string, unknown>;
    };

    const message = typeof body.message === "string" && body.message.trim() ? body.message.trim() : "Summarize StarrBoard and recommend priorities.";
    const boardState = body.boardState && typeof body.boardState === "object" ? compressBoardState(body.boardState) : {};
    const context = body.context && typeof body.context === "object" ? body.context : {};
    const payload = {
      userRequest: message,
      context,
      boardState,
    };

    const models = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL].filter(Boolean)));
    const failures: string[] = [];

    for (const model of models) {
      const result = await requestOpenAI(apiKey, model, payload);
      if (result.ok) return NextResponse.json(result.result);
      failures.push(`${result.model}: ${result.status} ${result.detail.slice(0, 700)}`);
    }

    return NextResponse.json(
      baseResult({
        configured: true,
        summary: "Planning Agent reached OpenAI, but OpenAI rejected the request.",
        activityDigest: failures,
        questions: ["Check whether the API key has model access and billing/credits enabled.", "Try again after verifying OPENAI_API_KEY in Vercel."],
      }),
    );
  } catch (error) {
    console.error("Planner route failed", error);
    return NextResponse.json(
      baseResult({
        configured: true,
        summary: "Planning Agent crashed while processing the request.",
        activityDigest: [error instanceof Error ? error.message : "Unknown error"],
        questions: ["Try again, or send a screenshot/log if this repeats."],
      }),
    );
  }
}
