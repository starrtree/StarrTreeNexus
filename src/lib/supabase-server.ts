const STATE_KEY = "starrboard-main-state";
const TABLE = "app_state";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variable.");
  }

  return { url, secretKey };
}

function getHeaders(prefer?: string) {
  const { secretKey } = getSupabaseConfig();
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export interface StoredStateResult {
  state: Record<string, unknown>;
  updatedAt: string | null;
}

export async function readStarrBoardState(): Promise<StoredStateResult> {
  const { url } = getSupabaseConfig();
  const endpoint = `${url}/rest/v1/${TABLE}?key=eq.${STATE_KEY}&select=value,updated_at&limit=1`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase read failed: ${response.status} ${detail}`);
  }

  const rows = (await response.json()) as Array<{ value?: Record<string, unknown>; updated_at?: string }>;
  const row = rows[0];

  return {
    state: row?.value && typeof row.value === "object" ? row.value : {},
    updatedAt: row?.updated_at ?? null,
  };
}

export async function saveStarrBoardState(state: Record<string, unknown>): Promise<StoredStateResult> {
  const { url } = getSupabaseConfig();
  const endpoint = `${url}/rest/v1/${TABLE}?on_conflict=key`;
  const updatedAt = new Date().toISOString();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders("resolution=merge-duplicates,return=representation"),
    body: JSON.stringify({
      key: STATE_KEY,
      value: state,
      updated_at: updatedAt,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase save failed: ${response.status} ${detail}`);
  }

  const rows = (await response.json()) as Array<{ value?: Record<string, unknown>; updated_at?: string }>;
  const row = rows[0];

  return {
    state: row?.value && typeof row.value === "object" ? row.value : state,
    updatedAt: row?.updated_at ?? updatedAt,
  };
}
