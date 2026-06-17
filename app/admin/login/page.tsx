"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0a0604] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#120a06]/90 p-8 text-white shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-brand text-black">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-extrabold">Admin Access</h1>
          <p className="mt-1 text-sm text-white/60">
            Import China — order management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Enter admin password"
                className="border-white/15 bg-white/5 pl-9 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
