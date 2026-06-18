"use client";

import * as React from "react";
import { Gift, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fireConfetti } from "@/lib/confetti";

interface Segment {
  label: string;
  code: string | null;
  color: string;
}

const SEGMENTS: Segment[] = [
  { label: "5% OFF", code: "SPIN5", color: "#CC0000" },
  { label: "Try Again", code: null, color: "#1a2f5e" },
  { label: "10% OFF", code: "SPIN10", color: "#c0392b" },
  { label: "Free Shipping", code: "FREESHIP", color: "#1a2f5e" },
  { label: "15% OFF", code: "SPIN15", color: "#CC0000" },
  { label: "Try Again", code: null, color: "#1a2f5e" },
  { label: "20% OFF", code: "SPIN20", color: "#c0392b" },
  { label: "💎 25% OFF", code: "SPIN25", color: "#1a2f5e" },
];

const SEG = 360 / SEGMENTS.length;
const REWARD_KEY = "chinacart-reward";

export function SpinWheelButton({
  variant = "nav",
}: {
  variant?: "nav" | "menu";
}) {
  const [open, setOpen] = React.useState(false);
  const [angle, setAngle] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<Segment | null>(null);

  function spin() {
    if (spinning) return;
    setResult(null);
    setSpinning(true);
    const index = Math.floor(Math.random() * SEGMENTS.length);
    // land the chosen segment's centre at the top pointer
    const target = 360 * 5 + (360 - (index * SEG + SEG / 2));
    setAngle((a) => a - (a % 360) + target);
    window.setTimeout(() => {
      setSpinning(false);
      const seg = SEGMENTS[index];
      setResult(seg);
      if (seg.code) {
        fireConfetti(2000);
        try {
          localStorage.setItem(REWARD_KEY, JSON.stringify({ ...seg, at: Date.now() }));
        } catch {
          /* ignore */
        }
      }
    }, 4200);
  }

  const gradient = `conic-gradient(${SEGMENTS.map(
    (s, i) => `${s.color} ${i * SEG}deg ${(i + 1) * SEG}deg`
  ).join(", ")})`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "nav"
            ? "hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand hover:bg-accent sm:inline-flex"
            : "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
        }
      >
        <Gift className="h-4 w-4" /> Rewards
      </button>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-sm text-center">
        <h3 className="text-xl font-extrabold">🎁 Spin to Win!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          One free spin — win a discount code for your next order.
        </p>

        <div className="relative mx-auto mt-5 h-60 w-60">
          {/* pointer */}
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 text-2xl">
            🔻
          </div>
          <div
            className="h-60 w-60 rounded-full border-4 border-gold shadow-xl"
            style={{
              background: gradient,
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.16,1,0.3,1)" : "none",
            }}
          />
          {/* labels */}
          <div className="pointer-events-none absolute inset-0">
            {SEGMENTS.map((s, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 origin-left text-[10px] font-bold text-white"
                style={{
                  transform: `rotate(${i * SEG + SEG / 2}deg) translateX(34px)`,
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-gold bg-white" />
        </div>

        {result ? (
          <div className="mt-5">
            {result.code ? (
              <>
                <p className="text-lg font-extrabold text-brand">
                  🎉 You won {result.label}!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use code{" "}
                  <span className="rounded bg-accent px-2 py-0.5 font-mono font-bold text-brand">
                    {result.code}
                  </span>{" "}
                  at checkout.
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">
                So close! Try again next time 😊
              </p>
            )}
            <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <Button
            variant="gold"
            size="lg"
            className="mt-5 w-full"
            onClick={spin}
            disabled={spinning}
          >
            {spinning ? "Spinning…" : "SPIN NOW 🎯"}
          </Button>
        )}
      </Dialog>
    </>
  );
}
