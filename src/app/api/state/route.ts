import { NextRequest, NextResponse } from "next/server";
import { readStarrBoardState, saveStarrBoardState } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type StatePayload = Record<string, unknown>;

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isAuthorizedWrite(request: NextRequest) {
  const adminToken = process.env.STARRBOARD_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-starrboard-token");

  if (providedToken && adminToken && providedToken === adminToken) return true;

  // Browser saves come from the same deployed StarrBoard origin.
  // This keeps secrets server-side while still allowing the app to save.
  return isSameOriginRequest(request);
}

export async function GET() {
  try {
    const result = await readStarrBoardState();
    return NextResponse.json(result);
  } catch (error) {
    console.error("State read failed", error);
    return NextResponse.json(
      { state: {}, updatedAt: null, error: "Cloud state unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedWrite(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as StatePayload;
    const result = await saveStarrBoardState(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("State save failed", error);
    return NextResponse.json(
      { error: "Cloud save failed" },
      { status: 500 },
    );
  }
}
