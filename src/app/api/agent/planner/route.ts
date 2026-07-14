import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_PLANNER_MODEL || "gpt-4.1-mini";

const PLANNER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    configured: { type: "boolean" },
    summary: { type: "string" },
    activityDigest: {
      type: "array",
      items: { type: "string" },
    },
    recommendedPriorities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          why: { type: "string" },
          urgency: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          suggestedOwnerAgentId: { type: ["string", "null"] },
          relatedMissionId: { type: ["string", "null"] },
        },
        required: ["title", "why", "urgency", "suggestedOwnerAgentId", "relatedMissionId"],
      },
    },
    suggestedActions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["create_mission", "update_mission", "create_idea", "assign_agent", "none"],
          },
          label: { type: "string" },
          rationale: { type: "string" },
          title: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          priority: { type: ["string", "null"], enum: ["low", "medium", "high", "urgent", null] },
          leadAgentId: { type: ["string", "null"] },
          supportAgentIds: {
            type: "array",
            items: { type: "string" },
          },
          departmentId: { type: ["string", "null"] },
          missionId: { type: ["string", "null"] },
          agentId: { type: ["string", "null"] },
          impact: { type: ["number", "null"] },
          urgencyScore: { type: ["number", "null"] },
          fields: {
            type: "object",
            additionalProperties: false,
            properties: {
              status: {
                type: ["string", "null"],
                enum: ["queued", "planning", "executing", "waiting", "testing", "blocked", "complete", null],
              },
              priority: { type: ["string", "null"], enum: ["low", "medium", "high", "urgent", null] },
              progress: { type: ["number", "null"] },
              blockers: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["status", "priority", "progress", "blockers"],
          },
        },
        required: [
          "type",
          "label",
          "rationale",
          "title",
          "description",
          "priority",
          "leadAgentId",
          "supportAgentIds",
          "departmentId",
          "missionId",
          "agentId",
          "impact",
          "urgencyScore",
          "fields",
        ],
      },
    },
    questions: {
      type: "array",
      items: { type: "string" },
    },
    confidence: { type: "number" },
  },
  required: ["configured", "summary", "activityDigest", "recommendedPriorities", "suggestedActions", "questions", "confidence"],
};

function fallbackNotConfigured() {
  return {
    configured: false,
    summary: "Planning Agent is not configured yet. Add OPENAI_API_KEY in Vercel, then redeploy.",
    activityDigest: ["OpenAI key missing on server."],
    recommendedPriorities: [],
    suggestedActions: [],
    questions: ["Confirm OPENAI_API_KEY exists in Vercel Production and Preview environments."],
    confidence: 0,
  };
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

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return "";
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

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
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
        ].join("\n"),
        input: [
          {
            role: "user",
            content: JSON.stringify({
              userRequest: message,
              context,
              boardState,
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "starrboard_planner_response",
            strict: true,
            schema: PLANNER_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          configured: true,
          summary: "Planning Agent request failed.",
          activityDigest: [detail.slice(0, 500)],
          recommendedPriorities: [],
          suggestedActions: [],
          questions: ["Check the Vercel runtime logs and confirm OPENAI_API_KEY is valid."],
          confidence: 0,
        },
        { status: 502 },
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const outputText = extractOutputText(data);

    if (!outputText) {
      return NextResponse.json(
        {
          configured: true,
          summary: "Planning Agent returned no readable output.",
          activityDigest: [],
          recommendedPriorities: [],
          suggestedActions: [],
          questions: ["Try asking again with a shorter planning request."],
          confidence: 0,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(JSON.parse(outputText));
  } catch (error) {
    console.error("Planner route failed", error);
    return NextResponse.json(
      {
        configured: true,
        summary: "Planning Agent crashed while processing the request.",
        activityDigest: [error instanceof Error ? error.message : "Unknown error"],
        recommendedPriorities: [],
        suggestedActions: [],
        questions: ["Try again, or send a screenshot/log if this repeats."],
        confidence: 0,
      },
      { status: 500 },
    );
  }
}
