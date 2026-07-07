"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Camera, X, Eye, ShieldCheck, Zap } from "lucide-react";
import { useNexus } from "@/store/nexusStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Landmark connections for drawing the hand skeleton
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function GestureControl() {
  const enabled = useNexus((s) => s.gesture.enabled);
  const setGesture = useNexus((s) => s.setGesture);
  const sensitivity = useNexus((s) => s.settings.gestureSensitivity);
  const setSection = useNexus((s) => s.setSection);
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);
  const focusMode = useNexus((s) => s.focusMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const landmarkerRef = useRef<{ detectForVideo: (video: HTMLVideoElement, ts: number) => unknown } | null>(null);
  const lastGestureRef = useRef<string>("");
  const gestureCooldownRef = useRef<number>(0);
  const swipeStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [status, setStatus] = useState<string>("Initializing…");
  const [mode, setMode] = useState<"loading" | "live" | "motion" | "error">("loading");
  const [showPanel, setShowPanel] = useState(true);

  // distance helper
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  // Classify a single hand's landmarks into a gesture
  const classify = useCallback(
    (lm: { x: number; y: number }[]) => {
      if (!lm || lm.length < 21) return { name: "No hand detected", conf: 0 };
      const tipIds = [4, 8, 12, 16, 20];
      const pipIds = [3, 6, 10, 14, 18];
      const wrist = lm[0];
      const middleMcp = lm[9];
      // fingers extended (tip further from wrist than pip, in y for upright hand)
      const ext = tipIds.map((t, i) => dist(lm[t], wrist) > dist(lm[pipIds[i]], wrist) * 1.05);
      const extCount = ext.filter(Boolean).length;

      // pinch: thumb tip (4) close to index tip (8)
      const pinchD = dist(lm[4], lm[8]);
      const handSize = dist(lm[0], lm[9]) || 0.0001;
      const pinchRatio = pinchD / handSize;

      // fist: all curled + close to wrist
      if (extCount <= 1 && pinchRatio > 0.6) {
        return { name: "Fist", conf: 88 };
      }
      // pinch
      if (pinchRatio < 0.35) {
        return { name: "Pinch", conf: 90 };
      }
      // open palm: all extended
      if (extCount >= 4) {
        return { name: "Open Palm", conf: 92 };
      }
      // point: only index extended
      if (ext[1] && !ext[2] && !ext[3] && !ext[4]) {
        return { name: "Point", conf: 85 };
      }
      // peace: index + middle
      if (ext[1] && ext[2] && !ext[3] && !ext[4]) {
        return { name: "Peace", conf: 80 };
      }
      return { name: `Hand (${extCount} fingers)`, conf: 60 };
    },
    [],
  );

  // Apply a gesture's effect (with cooldown)
  const applyGesture = useCallback(
    (name: string, conf: number) => {
      const now = Date.now();
      setGesture({ gesture: name, confidence: conf, hands: 1 });
      if (now < gestureCooldownRef.current) return;

      let cmd = "—";
      if (name === "Open Palm") {
        cmd = "Activate command center";
      } else if (name === "Pinch") {
        cmd = "Select / grab";
      } else if (name === "Fist") {
        cmd = "Focus mode";
        if (lastGestureRef.current !== "Fist") {
          setFocusMode(!focusMode);
          toast(focusMode ? "Focus off" : "Focus on", { description: "Fist gesture" });
          gestureCooldownRef.current = now + 1200;
        }
      } else if (name === "Point") {
        cmd = "Point to select";
      }
      lastGestureRef.current = name;
      setGesture({ command: cmd });
    },
    [setGesture, setFocusMode, focusMode],
  );

  // Two-hand detection: spread / close for zoom
  const applyTwoHand = useCallback(
    (hands: { x: number; y: number }[][]) => {
      if (hands.length < 2) return;
      const p1 = hands[0][0];
      const p2 = hands[1][0];
      const d = dist(p1, p2);
      const prev = (swipeStartRef.current as unknown as { d?: number } | null)?.d ?? d;
      const delta = d - prev;
      (swipeStartRef.current as unknown as { d?: number }) = { d };
      if (Math.abs(delta) > 0.04) {
        setGesture({
          hands: 2,
          gesture: delta > 0 ? "Two-Hand Spread" : "Two-Hand Close",
          confidence: 80,
          command: delta > 0 ? "Zoom in" : "Zoom out",
        });
      } else {
        setGesture({ hands: 2, gesture: "Two hands", confidence: 70, command: "Zoom" });
      }
    },
    [setGesture],
  );

  // Main loop using MediaPipe if available, else motion fallback
  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const lm = landmarkerRef.current;
    if (lm) {
      try {
        const res = lm.detectForVideo(video, performance.now()) as {
          landmarks?: { x: number; y: number; z?: number }[][];
        };
        const hands = res?.landmarks ?? [];
        if (ctx) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
        if (hands.length === 0) {
          setGesture({ hands: 0, gesture: "No hand detected", confidence: 0, command: "—" });
          if (ctx) {
            ctx.fillStyle = "rgba(139,92,246,0.5)";
            ctx.font = "12px monospace";
            ctx.fillText("No hand detected", 10, 20);
          }
        } else if (hands.length === 1) {
          if (ctx) drawHand(ctx, hands[0], canvas.width, canvas.height);
          const { name, conf } = classify(hands[0]);
          applyGesture(name, conf);
        } else {
          if (ctx) {
            drawHand(ctx, hands[0], canvas.width, canvas.height, "#38bdf8");
            drawHand(ctx, hands[1], canvas.width, canvas.height, "#ec4899");
          }
          applyTwoHand(hands);
        }
        if (ctx) ctx.restore();
      } catch {
        /* ignore frame errors */
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [applyGesture, applyTwoHand, classify, setGesture]);

  // Start everything when enabled
  useEffect(() => {
    if (!enabled) {
      // teardown
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      landmarkerRef.current = null;
      setMode("loading");
      setStatus("Off");
      setGesture({ enabled: false, hands: 0, gesture: "No hand detected", confidence: 0, command: "—" });
      return;
    }

    let cancelled = false;
    setMode("loading");
    setStatus("Requesting camera…");

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setStatus("Loading hand model…");

        // Try to load MediaPipe HandLandmarker dynamically
        try {
          const mp = await import("@mediapipe/tasks-vision");
          const vision = await mp.FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
          );
          const landmarker = await mp.HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          if (cancelled) {
            landmarker.close();
            return;
          }
          landmarkerRef.current = landmarker;
          setMode("live");
          setStatus("Live · tracking");
          toast("Hand Control live", { description: "MediaPipe model loaded." });
        } catch (e) {
          // Fallback: motion-based detection (no model)
          console.warn("MediaPipe load failed, using motion fallback", e);
          landmarkerRef.current = null;
          setMode("motion");
          setStatus("Motion mode (model unavailable)");
          toast("Motion fallback active", { description: "Hand model couldn't load — using camera motion." });
          startMotionFallback();
          return;
        }

        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.warn("Camera error", e);
        setMode("error");
        setStatus("Camera denied or unavailable");
        toast("Camera unavailable", { description: "Check permissions. Mouse/keyboard still work." });
        setGesture({ enabled: false });
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);

  // Motion fallback: frame differencing to infer hand presence + basic gestures
  const motionPrevRef = useRef<ImageData | null>(null);
  const startMotionFallback = useCallback(() => {
    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = 160;
      canvas.height = 120;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      try {
        const cur = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const prev = motionPrevRef.current;
        if (prev) {
          let diff = 0;
          const d1 = cur.data;
          const d2 = prev.data;
          for (let i = 0; i < d1.length; i += 16) {
            diff += Math.abs(d1[i] - d2[i]);
          }
          const motion = diff / (d1.length / 16);
          motionPrevRef.current = cur;
          if (motion < 3) {
            setGesture({ hands: 1, gesture: "Still (pinch-like)", confidence: 50, command: "Select / grab" });
          } else if (motion > 40) {
            setGesture({ hands: 1, gesture: "Motion (swipe/open)", confidence: 60, command: "Navigate" });
          } else {
            setGesture({ hands: 1, gesture: "Hand moving", confidence: 55, command: "Point" });
          }
        } else {
          motionPrevRef.current = cur;
        }
      } catch {
        /* ignore */
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [setGesture]);

  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-24 right-4 z-[60] w-[260px] sm:w-[300px]"
    >
      <div className="glass-gold holo-border overflow-hidden rounded-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-amber-300/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-breathe" />
              <Hand size={12} className="relative text-amber-300" />
            </div>
            <span className="font-hud text-[10px] font-bold uppercase tracking-widest text-amber-100">
              Hand Control
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPanel((v) => !v)}
              className="rounded p-1 text-violet-200/50 hover:bg-white/10 hover:text-amber-100"
            >
              <Eye size={12} />
            </button>
            <button
              onClick={() => setGesture({ enabled: false })}
              className="rounded p-1 text-violet-200/50 hover:bg-white/10 hover:text-amber-100"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* camera preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full -scale-x-100 object-cover opacity-60"
                />
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

                {/* scan line */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-300/60 to-transparent animate-scan" />
                </div>

                {/* status overlay */}
                <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 backdrop-blur">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      mode === "live" ? "bg-emerald-400 animate-pulse" : mode === "motion" ? "bg-amber-400" : mode === "error" ? "bg-red-400" : "bg-violet-400",
                    )}
                  />
                  <span className="font-hud text-[8px] uppercase tracking-widest text-amber-100/80">
                    {status}
                  </span>
                </div>
              </div>

              {/* gesture readout */}
              <GestureReadout />

              {/* privacy note */}
              <div className="border-t border-amber-300/15 px-3 py-2">
                <div className="flex items-start gap-1.5 text-[9px] text-violet-200/60">
                  <ShieldCheck size={11} className="mt-0.5 shrink-0 text-emerald-300" />
                  <span>
                    Camera is processed locally in your browser. No video is stored or sent to any server.
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-hud text-[8px] uppercase tracking-widest text-violet-300/40">
                    Sensitivity {sensitivity}/10
                  </span>
                  <span className="flex items-center gap-1 font-hud text-[8px] uppercase tracking-widest text-amber-300/60">
                    <Zap size={8} /> fallback: mouse + keys
                  </span>
                </div>
              </div>

              {/* hidden video element hint */}
              <Camera size={0} className="hidden" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function GestureReadout() {
  const gesture = useNexus((s) => s.gesture);
  const items = [
    { label: "Hands", value: String(gesture.hands) },
    { label: "Gesture", value: gesture.gesture },
    { label: "Confidence", value: `${gesture.confidence}%` },
    { label: "Command", value: gesture.command },
  ];
  return (
    <div className="grid grid-cols-2 gap-px bg-amber-300/10">
      {items.map((it) => (
        <div key={it.label} className="bg-[#0a0618] px-2.5 py-1.5">
          <div className="font-hud text-[7px] uppercase tracking-widest text-violet-300/50">{it.label}</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={it.value}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="truncate text-[11px] font-medium text-amber-100"
            >
              {it.value}
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  lm: { x: number; y: number }[],
  w: number,
  h: number,
  color = "#fbbf24",
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;
  // connections
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(lm[a].x * w, lm[a].y * h);
    ctx.lineTo(lm[b].x * w, lm[b].y * h);
    ctx.stroke();
  }
  // joints
  for (const p of lm) {
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}
