"use client";

import { useEffect, useRef } from "react";
import { useNexus, buildCloudSnapshot, type NexusCloudSnapshot } from "@/store/nexusStore";

const SAVE_DEBOUNCE_MS = 1400;

async function fetchCloudState() {
  const response = await fetch("/api/state", { method: "GET", cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Cloud load failed: ${response.status}`);
  }

  return (await response.json()) as { state?: Partial<NexusCloudSnapshot>; updatedAt?: string | null };
}

async function saveCloudState(snapshot: NexusCloudSnapshot) {
  const response = await fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });

  if (!response.ok) {
    throw new Error(`Cloud save failed: ${response.status}`);
  }

  return (await response.json()) as { updatedAt?: string | null };
}

export function CloudSync() {
  const hydrateFromCloud = useNexus((s) => s.hydrateFromCloud);
  const setCloudStatus = useNexus((s) => s.setCloudStatus);
  const cloudSyncRequest = useNexus((s) => s.cloudSyncRequest);

  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotRef = useRef<string>("");

  const saveNow = async () => {
    const state = useNexus.getState();
    const snapshot = buildCloudSnapshot(state);
    const serialized = JSON.stringify(snapshot);

    if (serialized === lastSnapshotRef.current && state.cloud.status === "connected") return;

    lastSnapshotRef.current = serialized;
    setCloudStatus({ status: "saving", error: null });

    try {
      const result = await saveCloudState(snapshot);
      setCloudStatus({
        status: "connected",
        lastSynced: result.updatedAt ? Date.parse(result.updatedAt) : Date.now(),
        error: null,
      });
    } catch (error) {
      setCloudStatus({
        status: "disconnected",
        error: error instanceof Error ? error.message : "Cloud save failed",
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setCloudStatus({ status: "loading", error: null });

      try {
        const result = await fetchCloudState();
        if (cancelled) return;

        const cloudState = result.state ?? {};
        const hasCloudState = Object.keys(cloudState).length > 0;

        if (hasCloudState) {
          hydrateFromCloud(cloudState);
        }

        const snapshot = buildCloudSnapshot(useNexus.getState());
        lastSnapshotRef.current = hasCloudState ? JSON.stringify(snapshot) : "";
        loadedRef.current = true;

        setCloudStatus({
          status: "connected",
          lastSynced: result.updatedAt ? Date.parse(result.updatedAt) : Date.now(),
          error: null,
        });

        // First-time setup: Supabase row exists but has no app state yet.
        // Push the current local/default state up so future devices can hydrate from it.
        if (!hasCloudState) {
          void saveNow();
        }
      } catch (error) {
        if (cancelled) return;
        loadedRef.current = true;
        setCloudStatus({
          status: "disconnected",
          error: error instanceof Error ? error.message : "Cloud load failed",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hydrateFromCloud, setCloudStatus]);

  useEffect(() => {
    const unsubscribe = useNexus.subscribe((state) => {
      if (!loadedRef.current) return;

      const serialized = JSON.stringify(buildCloudSnapshot(state));
      if (serialized === lastSnapshotRef.current) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveNow();
      }, SAVE_DEBOUNCE_MS);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (cloudSyncRequest <= 0 || !loadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveNow();
  }, [cloudSyncRequest]);

  return null;
}
