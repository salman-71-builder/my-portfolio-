"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

const SEEN_KEY = "cc_admin_orders_seen";
const POLL_MS = 30000;

/** Play a short two-tone chime via WebAudio (no asset needed). */
function chime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.18);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio not available — silent */
  }
}

export function OrderBell() {
  const [count, setCount] = React.useState(0); // total orders
  const [newCount, setNewCount] = React.useState(0);
  const seenRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const stored = Number(localStorage.getItem(SEEN_KEY));
    seenRef.current = Number.isFinite(stored) ? stored : null;

    let prevNew = 0;
    async function poll() {
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const total = Number(data.count) || 0;
        setCount(total);
        // first ever load: treat current as seen baseline
        if (seenRef.current == null) {
          seenRef.current = total;
          localStorage.setItem(SEEN_KEY, String(total));
        }
        const fresh = Math.max(0, total - (seenRef.current ?? total));
        setNewCount(fresh);
        if (fresh > prevNew) chime(); // new order arrived since last poll
        prevNew = fresh;
      } catch {
        /* ignore network errors */
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  function markSeen() {
    seenRef.current = count;
    localStorage.setItem(SEEN_KEY, String(count));
    setNewCount(0);
  }

  return (
    <Link
      href="/admin/orders"
      onClick={markSeen}
      aria-label={newCount > 0 ? `${newCount} new orders` : "Orders"}
      title={newCount > 0 ? `🔔 ${newCount} new orders!` : "Orders"}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
    >
      <Bell className={`h-5 w-5 ${newCount > 0 ? "animate-swing text-primary" : ""}`} />
      {newCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {newCount > 99 ? "99+" : newCount}
        </span>
      )}
    </Link>
  );
}
