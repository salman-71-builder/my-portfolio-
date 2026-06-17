"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, User, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" type="button" className="gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .55 4.1 1.6l3-3C17.4 1.9 14.9 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.5 2.72C6.54 7.1 9.04 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.16c-.27 1.4-1.07 2.59-2.28 3.39l3.5 2.72C21.46 18.5 23 15.66 23 12.27z"
          />
          <path
            fill="#FBBC05"
            d="M5.68 14.21A6.9 6.9 0 0 1 5.3 12c0-.77.13-1.51.38-2.21L2.18 7.07A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.5-2.72z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.5-2.72c-.97.65-2.23 1.04-3.78 1.04-2.96 0-5.46-2.1-6.32-4.93l-3.5 2.72C3.99 20.53 7.7 23 12 23z"
          />
        </svg>
        Google
      </Button>
      <Button variant="outline" type="button" className="gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
        </svg>
        Facebook
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or continue with email</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthForm() {
  const params = useSearchParams();
  const initialTab = params.get("tab") === "register" ? "register" : "login";
  const [role, setRole] = React.useState<"buyer" | "supplier">("buyer");

  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      {/* Login */}
      <TabsContent value="login">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          <SocialButtons />
          <Divider />
          <div>
            <Label htmlFor="login-email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="accent-brand" /> Remember me
            </label>
            <a href="#" className="font-medium text-brand hover:underline">
              Forgot password?
            </a>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Login
          </Button>
        </form>
      </TabsContent>

      {/* Register */}
      <TabsContent value="register">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          {/* Role selector */}
          <div>
            <Label className="mb-2 block">Register as</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: "buyer", label: "Buyer", icon: ShoppingBag },
                  { key: "supplier", label: "Supplier", icon: Store },
                ] as const
              ).map((r) => {
                const Icon = r.icon;
                const active = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-colors",
                      active
                        ? "border-brand bg-accent text-brand"
                        : "border-border hover:border-brand/40"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-semibold">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <SocialButtons />
          <Divider />

          <div>
            <Label htmlFor="reg-name">
              {role === "supplier" ? "Company Name" : "Full Name"}
            </Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="reg-name" className="pl-9" required />
            </div>
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="reg-email" type="email" className="pl-9" required />
            </div>
          </div>
          <div>
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-password"
                type="password"
                className="pl-9"
                required
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input type="checkbox" required className="mt-0.5 accent-brand" />
            I agree to the Terms of Service and Privacy Policy.
          </label>
          <Button type="submit" size="lg" className="w-full">
            Create {role === "supplier" ? "Supplier" : "Buyer"} Account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
